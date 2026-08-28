'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ShiftStatus } from '@prisma/client';
import { z } from 'zod';
import { sendShiftConfirmation, sendShiftCancellation } from './sms-notifications';

const recurrenceSchema = z
  .object({
    pattern: z.enum(['DAILY', 'WEEKLY']),
    interval: z.number().int().min(1).max(30).default(1),
    weekdays: z.array(z.number().int().min(0).max(6)).optional(),
    endType: z.enum(['COUNT', 'UNTIL']).default('COUNT'),
    occurrences: z.number().int().min(1).max(180).optional(),
    untilDate: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.weekdays || data.weekdays.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select at least one day for recurrence',
        path: ['weekdays'],
      });
    }

    if (data.endType === 'COUNT' && data.occurrences === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Occurrences are required when ending by count',
        path: ['occurrences'],
      });
    }

    if (data.endType === 'UNTIL' && !data.untilDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date is required when ending by date',
        path: ['untilDate'],
      });
    }
  });

// Validation schema for shift creation
const createShiftSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  serviceTypeId: z.string().min(1, 'Service type is required'),
  notes: z.string().optional(),
  clientRate: z.number().positive('Client rate must be positive'),
  workerRateMode: z.enum(['fixed', 'percentage']).default('percentage'),
  workerRate: z.number().positive('Worker rate must be positive').optional(),
  workerRatePercent: z.number().min(1, 'Rate percentage must be at least 1').max(100, 'Rate percentage cannot exceed 100').optional(),
  recurrence: recurrenceSchema.optional(),
}).superRefine((data, ctx) => {
  if (data.workerRateMode === 'fixed' && data.workerRate === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Worker rate is required when using a fixed rate',
      path: ['workerRate'],
    });
  }

  if (data.workerRateMode === 'percentage' && data.workerRatePercent === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Worker rate percentage is required when using percentage mode',
      path: ['workerRatePercent'],
    });
  }
});

export type CreateShiftInput = z.infer<typeof createShiftSchema>;

function parseDateInput(date: string): Date {
  return new Date(`${date}T00:00:00`);
}

function getRecurringShiftDates(startDate: Date, recurrence?: z.infer<typeof recurrenceSchema>): Date[] {
  if (!recurrence) {
    return [startDate];
  }

  const days = new Set(recurrence.weekdays ?? []);
  const generated: Date[] = [];
  const cursor = new Date(startDate);
  const endDate = recurrence.endType === 'UNTIL' && recurrence.untilDate
    ? parseDateInput(recurrence.untilDate)
    : null;
  const maxOccurrences = recurrence.endType === 'COUNT' ? recurrence.occurrences ?? 1 : null;

  const MAX_ITERATIONS = 730;
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    if (endDate && cursor > endDate) break;

    const day = cursor.getDay();
    const dayOffset = Math.floor((cursor.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    let include = false;
    if (recurrence.pattern === 'DAILY') {
      include = days.has(day) && dayOffset % recurrence.interval === 0;
    } else {
      const weeksOffset = Math.floor(dayOffset / 7);
      include = days.has(day) && weeksOffset % recurrence.interval === 0;
    }

    if (include) {
      generated.push(new Date(cursor));
      if (maxOccurrences && generated.length >= maxOccurrences) {
        break;
      }
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return generated;
}

const updateShiftRatesSchema = z
  .object({
    shiftId: z.string().min(1, 'Shift ID is required'),
    clientRate: z.number().positive('Client rate must be positive'),
    workerRateMode: z.enum(['fixed', 'percentage']).default('percentage'),
    workerRate: z.number().positive('Worker rate must be positive').optional(),
    workerRatePercent: z
      .number()
      .min(1, 'Rate percentage must be at least 1')
      .max(100, 'Rate percentage cannot exceed 100')
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.workerRateMode === 'fixed' && data.workerRate === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Worker rate is required when using a fixed rate',
        path: ['workerRate'],
      });
    }

    if (
      data.workerRateMode === 'percentage' &&
      data.workerRatePercent === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Worker rate percentage is required when using percentage mode',
        path: ['workerRatePercent'],
      });
    }
  });

export type UpdateShiftRatesInput = z.infer<typeof updateShiftRatesSchema>;

const updateShiftSchema = z
  .object({
    shiftId: z.string().min(1, 'Shift ID is required'),
    clientId: z.string().min(1, 'Client is required'),
    date: z.string().min(1, 'Date is required'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    serviceTypeId: z.string().min(1, 'Service type is required'),
    notes: z.string().optional(),
    clientRate: z.number().positive('Client rate must be positive'),
    workerRateMode: z.enum(['fixed', 'percentage']).default('percentage'),
    workerRate: z.number().positive('Worker rate must be positive').optional(),
    workerRatePercent: z
      .number()
      .min(1, 'Rate percentage must be at least 1')
      .max(100, 'Rate percentage cannot exceed 100')
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.workerRateMode === 'fixed' && data.workerRate === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Worker rate is required when using a fixed rate',
        path: ['workerRate'],
      });
    }

    if (
      data.workerRateMode === 'percentage' &&
      data.workerRatePercent === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Worker rate percentage is required when using percentage mode',
        path: ['workerRatePercent'],
      });
    }
  });

export type UpdateShiftInput = z.infer<typeof updateShiftSchema>;

/**
 * Create a new shift
 */
export async function createShift(
  input: CreateShiftInput
): Promise<{ success: boolean; error?: string; shiftId?: string; createdCount?: number }> {
  try {
    const validated = createShiftSchema.parse(input);

    // Calculate duration in hours
    const [startHour, startMin] = validated.startTime.split(':').map(Number);
    const [endHour, endMin] = validated.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const duration = (endMinutes - startMinutes) / 60;

    if (duration <= 0) {
      return { success: false, error: 'End time must be after start time' };
    }

    // Verify client exists
    const client = await db.client.findUnique({
      where: { id: validated.clientId },
    });

    if (!client) {
      return { success: false, error: 'Client not found' };
    }

    const serviceTypeConfig = await db.serviceTypeConfig.findUnique({
      where: { id: validated.serviceTypeId },
      select: { label: true, skills: { select: { label: true } } },
    });

    if (!serviceTypeConfig) {
      return { success: false, error: 'Service type not found' };
    }

    const baseDate = parseDateInput(validated.date);
    const shiftDates = getRecurringShiftDates(baseDate, validated.recurrence);

    if (shiftDates.length === 0) {
      return {
        success: false,
        error: 'Recurrence did not generate any shifts. Adjust days, interval, or end settings.',
      };
    }

    const recurringId =
      shiftDates.length > 1
        ? (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`)
        : null;
    const workerRate =
      validated.workerRateMode === 'percentage'
        ? validated.clientRate * ((validated.workerRatePercent ?? 65) / 100)
        : validated.workerRate ?? validated.clientRate * 0.65;

    let firstShiftId: string | undefined;

    if (shiftDates.length === 1) {
      const shift = await db.careShift.create({
        data: {
          clientId: validated.clientId,
          date: shiftDates[0],
          startTime: validated.startTime,
          endTime: validated.endTime,
          duration,
          serviceType: serviceTypeConfig.label,
          skillsRequired: serviceTypeConfig.skills.map((skill) => skill.label),
          notes: validated.notes,
          clientRate: validated.clientRate,
          workerRate,
          status: 'OPEN',
          recurringId,
          createdBy: 'admin', // TODO: Get from auth session
        },
      });
      firstShiftId = shift.id;
    } else {
      await db.careShift.createMany({
        data: shiftDates.map((date) => ({
          clientId: validated.clientId,
          date,
          startTime: validated.startTime,
          endTime: validated.endTime,
          duration,
          serviceType: serviceTypeConfig.label,
          skillsRequired: serviceTypeConfig.skills.map((skill) => skill.label),
          notes: validated.notes,
          clientRate: validated.clientRate,
          workerRate,
          status: 'OPEN',
          recurringId,
          createdBy: 'admin', // TODO: Get from auth session
        })),
      });

      const firstShift = await db.careShift.findFirst({
        where: { recurringId: recurringId ?? undefined },
        orderBy: { date: 'asc' },
        select: { id: true },
      });
      firstShiftId = firstShift?.id;
    }

    revalidatePath('/admin/shifts');
    revalidatePath('/employee/shifts');
    revalidatePath(`/admin/clients/${validated.clientId}`);

    return { success: true, shiftId: firstShiftId, createdCount: shiftDates.length };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error('Failed to create shift:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create shift',
    };
  }
}

/**
 * Update shift billing and worker rates.
 */
export async function updateShiftRates(
  input: UpdateShiftRatesInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = updateShiftRatesSchema.parse(input);

    const existingShift = await db.careShift.findUnique({
      where: { id: validated.shiftId },
      select: { id: true, clientId: true },
    });

    if (!existingShift) {
      return { success: false, error: 'Shift not found' };
    }

    const workerRate =
      validated.workerRateMode === 'percentage'
        ? validated.clientRate * ((validated.workerRatePercent ?? 65) / 100)
        : validated.workerRate ?? validated.clientRate * 0.65;

    await db.careShift.update({
      where: { id: validated.shiftId },
      data: {
        clientRate: validated.clientRate,
        workerRate,
      },
    });

    revalidatePath('/admin/shifts');
    revalidatePath(`/admin/shifts/${validated.shiftId}`);
    revalidatePath(`/admin/clients/${existingShift.clientId}`);

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }

    console.error('Failed to update shift rates:', error);
    return { success: false, error: 'Failed to update shift rates' };
  }
}

/**
 * Update full shift details from admin edit flow.
 */
export async function updateShift(
  input: UpdateShiftInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = updateShiftSchema.parse(input);

    const existingShift = await db.careShift.findUnique({
      where: { id: validated.shiftId },
      select: { id: true, clientId: true },
    });

    if (!existingShift) {
      return { success: false, error: 'Shift not found' };
    }

    const client = await db.client.findUnique({ where: { id: validated.clientId } });

    if (!client) {
      return { success: false, error: 'Client not found' };
    }

    const serviceTypeConfig = await db.serviceTypeConfig.findUnique({
      where: { id: validated.serviceTypeId },
      select: { label: true, skills: { select: { label: true } } },
    });

    if (!serviceTypeConfig) {
      return { success: false, error: 'Service type not found' };
    }

    const [startHour, startMin] = validated.startTime.split(':').map(Number);
    const [endHour, endMin] = validated.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const duration = (endMinutes - startMinutes) / 60;

    if (duration <= 0) {
      return { success: false, error: 'End time must be after start time' };
    }

    const workerRate =
      validated.workerRateMode === 'percentage'
        ? validated.clientRate * ((validated.workerRatePercent ?? 65) / 100)
        : validated.workerRate ?? validated.clientRate * 0.65;

    await db.careShift.update({
      where: { id: validated.shiftId },
      data: {
        clientId: validated.clientId,
        date: new Date(validated.date),
        startTime: validated.startTime,
        endTime: validated.endTime,
        duration,
        serviceType: serviceTypeConfig.label,
        skillsRequired: serviceTypeConfig.skills.map((skill) => skill.label),
        notes: validated.notes,
        clientRate: validated.clientRate,
        workerRate,
      },
    });

    revalidatePath('/admin/shifts');
    revalidatePath(`/admin/shifts/${validated.shiftId}`);
    revalidatePath(`/admin/clients/${existingShift.clientId}`);
    revalidatePath(`/admin/clients/${validated.clientId}`);

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }

    console.error('Failed to update shift:', error);
    return { success: false, error: 'Failed to update shift' };
  }
}

interface MatchingWorker {
  id: string;
  userId: string;
  employeeId: string | null;
  payRate: number;
  skills: string[];
  languages: string[];
  city: string | null;
  zip: string | null;
  complianceStatus: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  matchScore: number;
  matchDetails: {
    skillsMatch: number;
    locationMatch: boolean;
    isCompliant: boolean;
    isAvailable: boolean;
  };
}

/**
 * Find workers matching shift requirements
 * Returns workers sorted by match score
 */
export async function findMatchingWorkers(
  shiftId: string
): Promise<{ success: boolean; workers?: MatchingWorker[]; error?: string }> {
  try {
    const shift = await db.careShift.findUnique({
      where: { id: shiftId },
      include: {
        client: true,
        bookings: {
          select: { workerId: true },
        },
      },
    });

    if (!shift) {
      return { success: false, error: 'Shift not found' };
    }

    // Get day of week (0 = Sunday, 6 = Saturday)
    const shiftDate = new Date(shift.date);
    const dayOfWeek = shiftDate.getDay();

    // Find all active, compliant workers
    const workers = await db.worker.findMany({
      where: {
        user: {
          status: 'ACTIVE',
        },
        // Exclude workers who already have a booking for this shift
        id: {
          notIn: shift.bookings.map((b) => b.workerId),
        },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        availabilities: {
          where: {
            dayOfWeek,
            isAvailable: true,
          },
        },
      },
    });

    // Calculate match scores
    const matchedWorkers: MatchingWorker[] = workers.map((worker) => {
      // Skills match: percentage of required skills the worker has
      const requiredSkills = shift.skillsRequired || [];
      const workerSkills = worker.skills || [];
      const matchingSkills = requiredSkills.filter((s) =>
        workerSkills.some((ws) => ws.toLowerCase().includes(s.toLowerCase()))
      );
      const skillsMatch =
        requiredSkills.length > 0 ? matchingSkills.length / requiredSkills.length : 1;

      // Location match: same ZIP code as client
      const locationMatch = worker.zip === shift.client.zip;

      // Compliance check
      const isCompliant = worker.complianceStatus === 'COMPLIANT';

      // Availability check (simplified: just check if they have availability for this day)
      const isAvailable = worker.availabilities.length > 0;

      // Calculate overall score (0-100)
      let score = 0;
      score += skillsMatch * 40; // Skills worth 40%
      score += locationMatch ? 20 : 0; // Location worth 20%
      score += isCompliant ? 25 : 0; // Compliance worth 25%
      score += isAvailable ? 15 : 0; // Availability worth 15%

      return {
        id: worker.id,
        userId: worker.userId,
        employeeId: worker.employeeId,
        payRate: Number(worker.payRate),
        skills: worker.skills,
        languages: worker.languages,
        city: worker.city,
        zip: worker.zip,
        complianceStatus: worker.complianceStatus,
        user: worker.user,
        matchScore: Math.round(score),
        matchDetails: {
          skillsMatch: Math.round(skillsMatch * 100),
          locationMatch,
          isCompliant,
          isAvailable,
        },
      };
    });

    // Sort by match score descending
    matchedWorkers.sort((a, b) => b.matchScore - a.matchScore);

    return { success: true, workers: matchedWorkers };
  } catch (error) {
    console.error('Failed to find matching workers:', error);
    return { success: false, error: 'Failed to find matching workers' };
  }
}

/**
 * Send shift booking request to a worker
 */
export async function sendBookingRequest(
  shiftId: string,
  workerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const shift = await db.careShift.findUnique({
      where: { id: shiftId },
    });

    if (!shift) {
      return { success: false, error: 'Shift not found' };
    }

    if (shift.status !== 'OPEN' && shift.status !== 'PENDING_BOOK') {
      return { success: false, error: 'Shift is not available for booking' };
    }

    // Check if worker already has a booking for this shift
    const existingBooking = await db.shiftBooking.findFirst({
      where: {
        shiftId,
        workerId,
      },
    });

    if (existingBooking) {
      return { success: false, error: 'Worker already has a booking request for this shift' };
    }

    // Create booking request
    await db.shiftBooking.create({
      data: {
        shiftId,
        workerId,
        status: 'PENDING',
      },
    });

    // Update shift status to PENDING_BOOK
    await db.careShift.update({
      where: { id: shiftId },
      data: { status: 'PENDING_BOOK' },
    });

    revalidatePath('/admin/shifts');
    revalidatePath(`/admin/shifts/${shiftId}`);
    revalidatePath(`/admin/clients/${shift.clientId}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to send booking request:', error);
    return { success: false, error: 'Failed to send booking request' };
  }
}

/**
 * Confirm a worker's booking - assigns them to the shift
 */
export async function confirmBooking(
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const booking = await db.shiftBooking.findUnique({
      where: { id: bookingId },
      include: { shift: true },
    });

    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    // Update booking status
    await db.shiftBooking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });

    // Update shift status to BOOKED
    await db.careShift.update({
      where: { id: booking.shiftId },
      data: { status: 'BOOKED' },
    });

    // Decline other pending bookings for this shift
    await db.shiftBooking.updateMany({
      where: {
        shiftId: booking.shiftId,
        id: { not: bookingId },
        status: 'PENDING',
      },
      data: {
        status: 'DECLINED',
        respondedAt: new Date(),
      },
    });

    revalidatePath('/admin/shifts');
    revalidatePath(`/admin/shifts/${booking.shiftId}`);
    revalidatePath(`/admin/clients/${booking.shift.clientId}`);

    // Send SMS confirmation to the worker (fire-and-forget)
    sendShiftConfirmation(booking.shiftId, booking.workerId).catch((err) =>
      console.error('SMS confirmation failed:', err)
    );

    return { success: true };
  } catch (error) {
    console.error('Failed to confirm booking:', error);
    return { success: false, error: 'Failed to confirm booking' };
  }
}

/**
 * Cancel a shift
 */
export async function cancelShift(
  shiftId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const shift = await db.careShift.findUnique({
      where: { id: shiftId },
      include: {
        bookings: {
          where: { status: { in: ['CONFIRMED', 'PENDING', 'ACCEPTED'] } },
          select: { workerId: true },
        },
      },
    });

    if (!shift) {
      return { success: false, error: 'Shift not found' };
    }

    await db.careShift.update({
      where: { id: shiftId },
      data: {
        status: 'CANCELLED',
        notes: reason ? `Cancelled: ${reason}` : undefined,
      },
    });

    // Cancel all associated bookings
    await db.shiftBooking.updateMany({
      where: { shiftId },
      data: {
        status: 'CANCELLED',
      },
    });

    revalidatePath('/admin/shifts');
    revalidatePath(`/admin/shifts/${shiftId}`);
    revalidatePath(`/admin/clients/${shift.clientId}`);

    // Notify affected workers via SMS (fire-and-forget)
    for (const booking of shift.bookings) {
      sendShiftCancellation(shiftId, booking.workerId, reason).catch((err) =>
        console.error('SMS cancellation failed:', err)
      );
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to cancel shift:', error);
    return { success: false, error: 'Failed to cancel shift' };
  }
}

/**
 * Complete a shift
 */
export async function completeShift(
  shiftId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const shift = await db.careShift.findUnique({
      where: { id: shiftId },
    });

    if (!shift) {
      return { success: false, error: 'Shift not found' };
    }

    if (shift.status !== 'BOOKED' && shift.status !== 'IN_PROGRESS') {
      return { success: false, error: 'Shift cannot be completed' };
    }

    await db.careShift.update({
      where: { id: shiftId },
      data: { status: 'COMPLETED' },
    });

    // Update confirmed booking status
    await db.shiftBooking.updateMany({
      where: {
        shiftId,
        status: 'CONFIRMED',
      },
      data: {
        status: 'COMPLETED',
        checkedOutAt: new Date(),
      },
    });

    revalidatePath('/admin/shifts');
    revalidatePath(`/admin/shifts/${shiftId}`);
    revalidatePath(`/admin/clients/${shift.clientId}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to complete shift:', error);
    return { success: false, error: 'Failed to complete shift' };
  }
}

/**
 * Update shift status
 */
export async function updateShiftStatus(
  shiftId: string,
  status: ShiftStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const shift = await db.careShift.update({
      where: { id: shiftId },
      data: { status },
    });

    revalidatePath('/admin/shifts');
    revalidatePath(`/admin/shifts/${shiftId}`);
    revalidatePath(`/admin/clients/${shift.clientId}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to update shift status:', error);
    return { success: false, error: 'Failed to update shift status' };
  }
}
