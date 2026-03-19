'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  twilio,
  createShiftNotificationMessage,
  type ShiftNotificationData,
} from '@/lib/twilio';
import { formatDateUS } from '@/lib/utils';

const broadcastFilterSchema = z.object({
  skills: z.array(z.string()).optional(),
  cities: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  minRating: z.number().min(1).max(5).optional(),
  complianceOnly: z.boolean().default(true),
});

export type BroadcastFilter = z.infer<typeof broadcastFilterSchema>;

export interface BroadcastPreview {
  totalMatching: number;
  workers: Array<{
    id: string;
    name: string;
    phone: string | null;
    skills: string[];
    city: string | null;
    hasPhone: boolean;
  }>;
}

/**
 * Preview which workers would receive a broadcast based on filters
 */
export async function previewBroadcast(
  shiftId: string,
  filter: BroadcastFilter
): Promise<{ success: boolean; preview?: BroadcastPreview; error?: string }> {
  try {
    const parsed = broadcastFilterSchema.parse(filter);

    const shift = await db.careShift.findUnique({
      where: { id: shiftId },
      include: {
        bookings: { select: { workerId: true } },
      },
    });

    if (!shift) return { success: false, error: 'Shift not found' };

    // Build dynamic filter
    const where: Record<string, unknown> = {
      user: { status: 'ACTIVE' },
      id: { notIn: shift.bookings.map((b) => b.workerId) },
    };

    if (parsed.complianceOnly) {
      where.complianceStatus = 'COMPLIANT';
    }
    if (parsed.skills && parsed.skills.length > 0) {
      where.skills = { hasSome: parsed.skills };
    }
    if (parsed.cities && parsed.cities.length > 0) {
      where.city = { in: parsed.cities };
    }
    if (parsed.languages && parsed.languages.length > 0) {
      where.languages = { hasSome: parsed.languages };
    }

    const workers = await db.worker.findMany({
      where,
      include: { user: { select: { firstName: true, lastName: true, phone: true } } },
    });

    // If minRating specified, filter by average review rating
    let filtered = workers;
    if (parsed.minRating) {
      const workerIds = workers.map((w) => w.id);
      const ratings = await db.shiftReview.groupBy({
        by: ['workerId'],
        _avg: { rating: true },
        where: { workerId: { in: workerIds } },
      });
      const ratingMap = new Map(ratings.map((r) => [r.workerId, r._avg.rating || 0]));
      filtered = workers.filter((w) => (ratingMap.get(w.id) || 0) >= parsed.minRating!);
    }

    return {
      success: true,
      preview: {
        totalMatching: filtered.length,
        workers: filtered.map((w) => ({
          id: w.id,
          name: `${w.user.firstName} ${w.user.lastName}`,
          phone: w.user.phone,
          skills: w.skills,
          city: w.city,
          hasPhone: !!w.user.phone,
        })),
      },
    };
  } catch (error) {
    console.error('Failed to preview broadcast:', error);
    return { success: false, error: 'Failed to preview broadcast' };
  }
}

/**
 * Send targeted shift broadcast with filters
 */
export async function sendTargetedBroadcast(
  shiftId: string,
  filter: BroadcastFilter
): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  error?: string;
}> {
  try {
    const parsed = broadcastFilterSchema.parse(filter);

    // Get shift with client info
    const shift = await db.careShift.findUnique({
      where: { id: shiftId },
      include: {
        client: { include: { user: true } },
        bookings: { select: { workerId: true } },
      },
    });

    if (!shift) return { success: false, sent: 0, failed: 0, error: 'Shift not found' };

    // Build filter (same as preview)
    const where: Record<string, unknown> = {
      user: { status: 'ACTIVE' },
      id: { notIn: shift.bookings.map((b) => b.workerId) },
    };

    if (parsed.complianceOnly) where.complianceStatus = 'COMPLIANT';
    if (parsed.skills?.length) where.skills = { hasSome: parsed.skills };
    if (parsed.cities?.length) where.city = { in: parsed.cities };
    if (parsed.languages?.length) where.languages = { hasSome: parsed.languages };

    const workers = await db.worker.findMany({
      where,
      include: { user: true },
    });

    const workersWithPhone = workers.filter((w) => w.user.phone);

    // Send messages
    let sent = 0;
    let failed = 0;
    const notificationData: Omit<ShiftNotificationData, 'workerName' | 'workerPhone'> = {
      shiftId: shift.id,
      clientName:
        shift.client.careRecipientName ||
        `${shift.client.user.firstName} ${shift.client.user.lastName}`,
      date: formatDateUS(shift.date, 'weekday-long'),
      startTime: shift.startTime,
      endTime: shift.endTime,
      address: `${shift.client.city}, ${shift.client.state}`,
      rate: `$${shift.workerRate?.toNumber().toFixed(2) || '22.00'}`,
    };

    for (const worker of workersWithPhone) {
      const message = createShiftNotificationMessage({
        ...notificationData,
        workerName: worker.user.firstName,
        workerPhone: worker.user.phone!,
      });

      const result = await twilio.sendSMS({ to: worker.user.phone!, body: message });
      if (result.success) sent++;
      else failed++;

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Update shift with broadcast info
    await db.careShift.update({
      where: { id: shiftId },
      data: {
        broadcastFilter: JSON.parse(JSON.stringify(parsed)),
        broadcastSentAt: new Date(),
        broadcastCount: { increment: sent },
        status: shift.status === 'OPEN' ? 'PENDING_BOOK' : shift.status,
      },
    });

    revalidatePath('/admin/shifts');
    revalidatePath(`/admin/shifts/${shiftId}`);

    return { success: true, sent, failed };
  } catch (error) {
    console.error('Failed to send broadcast:', error);
    return { success: false, sent: 0, failed: 0, error: 'Failed to send broadcast' };
  }
}

/**
 * Get available filter options (skills, cities, languages from existing workers)
 */
export async function getBroadcastFilterOptions() {
  const workers = await db.worker.findMany({
    where: { user: { status: 'ACTIVE' } },
    select: { skills: true, city: true, languages: true },
  });

  const skills = new Set<string>();
  const cities = new Set<string>();
  const languages = new Set<string>();

  for (const w of workers) {
    w.skills.forEach((s) => skills.add(s));
    if (w.city) cities.add(w.city);
    w.languages.forEach((l) => languages.add(l));
  }

  return {
    skills: [...skills].sort(),
    cities: [...cities].sort(),
    languages: [...languages].sort(),
  };
}
