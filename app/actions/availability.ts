'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getCurrentPortalUser } from '@/lib/auth';
import { z } from 'zod';

const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  isAvailable: z.boolean(),
});

const bulkAvailabilitySchema = z.object({
  slots: z.array(availabilitySchema),
});

export type AvailabilitySlot = z.infer<typeof availabilitySchema>;

/**
 * Get worker availability for the current user
 */
export async function getMyAvailability() {
  const portalUser = await getCurrentPortalUser();
  if (!portalUser) return { success: false as const, error: 'Not authenticated' };

  const worker = await db.worker.findUnique({
    where: { userId: portalUser.id },
    include: { availabilities: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] } },
  });

  if (!worker) return { success: false as const, error: 'Worker not found' };

  return { success: true as const, availabilities: worker.availabilities };
}

/**
 * Toggle a single availability block
 */
export async function toggleAvailability(
  data: AvailabilitySlot
): Promise<{ success: boolean; error?: string }> {
  try {
    const portalUser = await getCurrentPortalUser();
    if (!portalUser) return { success: false, error: 'Not authenticated' };

    const worker = await db.worker.findUnique({ where: { userId: portalUser.id } });
    if (!worker) return { success: false, error: 'Worker not found' };

    const parsed = availabilitySchema.parse(data);

    // Check if this slot already exists
    const existing = await db.availability.findUnique({
      where: {
        workerId_dayOfWeek_startTime_endTime: {
          workerId: worker.id,
          dayOfWeek: parsed.dayOfWeek,
          startTime: parsed.startTime,
          endTime: parsed.endTime,
        },
      },
    });

    if (existing) {
      // Toggle availability
      await db.availability.update({
        where: { id: existing.id },
        data: { isAvailable: parsed.isAvailable },
      });
    } else {
      // Create new slot
      await db.availability.create({
        data: {
          workerId: worker.id,
          dayOfWeek: parsed.dayOfWeek,
          startTime: parsed.startTime,
          endTime: parsed.endTime,
          isAvailable: parsed.isAvailable,
        },
      });
    }

    revalidatePath('/employee/availability');
    return { success: true };
  } catch (error) {
    console.error('Failed to toggle availability:', error);
    return { success: false, error: 'Failed to update availability' };
  }
}

/**
 * Bulk update availability slots for a worker
 */
export async function updateBulkAvailability(
  data: { slots: AvailabilitySlot[] }
): Promise<{ success: boolean; error?: string }> {
  try {
    const portalUser = await getCurrentPortalUser();
    if (!portalUser) return { success: false, error: 'Not authenticated' };

    const worker = await db.worker.findUnique({ where: { userId: portalUser.id } });
    if (!worker) return { success: false, error: 'Worker not found' };

    const parsed = bulkAvailabilitySchema.parse(data);

    // Delete existing and recreate (simpler than diffing)
    await db.availability.deleteMany({ where: { workerId: worker.id } });

    // Only create available slots
    const availableSlots = parsed.slots.filter((s) => s.isAvailable);
    if (availableSlots.length > 0) {
      await db.availability.createMany({
        data: availableSlots.map((slot) => ({
          workerId: worker.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: true,
        })),
      });
    }

    revalidatePath('/employee/availability');
    return { success: true };
  } catch (error) {
    console.error('Failed to bulk update availability:', error);
    return { success: false, error: 'Failed to update availability' };
  }
}

/**
 * Check for shift conflicts with availability
 */
export async function checkAvailabilityConflicts(workerId: string) {
  const worker = await db.worker.findUnique({
    where: { id: workerId },
    include: {
      availabilities: true,
      shiftBookings: {
        where: {
          status: { in: ['ACCEPTED', 'CONFIRMED'] },
          shift: {
            date: { gte: new Date() },
          },
        },
        include: {
          shift: {
            include: { client: { include: { user: true } } },
          },
        },
      },
    },
  });

  if (!worker) return { conflicts: [] };

  const conflicts: Array<{
    shiftId: string;
    shiftDate: Date;
    shiftTime: string;
    clientName: string;
    reason: string;
  }> = [];

  for (const booking of worker.shiftBookings) {
    const shiftDay = new Date(booking.shift.date).getUTCDay();
    const hasAvailability = worker.availabilities.some(
      (a) =>
        a.dayOfWeek === shiftDay &&
        a.isAvailable &&
        a.startTime <= booking.shift.startTime &&
        a.endTime >= booking.shift.endTime
    );

    if (!hasAvailability) {
      conflicts.push({
        shiftId: booking.shift.id,
        shiftDate: booking.shift.date,
        shiftTime: `${booking.shift.startTime} - ${booking.shift.endTime}`,
        clientName:
          booking.shift.client.careRecipientName ||
          `${booking.shift.client.user.firstName} ${booking.shift.client.user.lastName}`,
        reason: 'Shift falls outside your available hours',
      });
    }
  }

  return { conflicts };
}
