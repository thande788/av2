'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { z } from 'zod';
import { startOfWeek, endOfWeek, parseISO, differenceInMinutes } from 'date-fns';
import { formatDateUS } from '@/lib/utils';

// =============================================================================
// SCHEMAS
// =============================================================================

const timesheetEntrySchema = z.object({
  date: z.string(),
  clientName: z.string().min(1, 'Client name required'),
  shiftId: z.string().optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  breakMinutes: z.coerce.number().min(0).default(0),
  workDescription: z.string().optional(),
});

const createTimesheetSchema = z.object({
  workerId: z.string().min(1, 'Worker ID required'),
  weekStarting: z.string(), // ISO date string (Monday)
  entries: z.array(timesheetEntrySchema).min(1, 'At least one entry required'),
});

const updateTimesheetSchema = z.object({
  timesheetId: z.string().min(1, 'Timesheet ID required'),
  entries: z.array(timesheetEntrySchema),
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function calculateHours(startTime: string, endTime: string, breakMinutes: number): number {
  // Parse times as minutes from midnight
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  
  const startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;
  
  // Handle overnight shifts
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }
  
  const totalMinutes = endMinutes - startMinutes - breakMinutes;
  return Math.max(0, totalMinutes / 60);
}

function calculateTotals(entries: { hoursWorked: number }[]) {
  const totalHours = entries.reduce((sum, e) => sum + e.hoursWorked, 0);
  const regularHours = Math.min(totalHours, 40);
  const overtimeHours = Math.max(0, totalHours - 40);
  
  return { totalHours, regularHours, overtimeHours };
}

// =============================================================================
// CREATE TIMESHEET
// =============================================================================

export async function createTimesheet(data: z.infer<typeof createTimesheetSchema>) {
  try {
    const validated = createTimesheetSchema.parse(data);
    
    // Calculate week ending (Sunday)
    const weekStart = parseISO(validated.weekStarting);
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    
    // Check if timesheet already exists for this week
    const existing = await db.timesheet.findUnique({
      where: {
        workerId_weekStarting: {
          workerId: validated.workerId,
          weekStarting: weekStart,
        },
      },
    });
    
    if (existing) {
      return { 
        success: false, 
        error: 'A timesheet already exists for this week. Please edit the existing one.' 
      };
    }
    
    // Process entries and calculate hours
    const entriesWithHours = validated.entries.map((entry) => ({
      ...entry,
      date: parseISO(entry.date),
      hoursWorked: calculateHours(entry.startTime, entry.endTime, entry.breakMinutes),
    }));
    
    const { totalHours, regularHours, overtimeHours } = calculateTotals(entriesWithHours);
    
    // Create timesheet with entries
    const timesheet = await db.timesheet.create({
      data: {
        workerId: validated.workerId,
        weekStarting: weekStart,
        weekEnding: weekEnd,
        status: 'DRAFT',
        totalHours,
        totalRegular: regularHours,
        totalOvertime: overtimeHours,
        entries: {
          create: entriesWithHours.map((entry) => ({
            date: entry.date,
            clientName: entry.clientName,
            shiftId: entry.shiftId || null,
            startTime: entry.startTime,
            endTime: entry.endTime,
            breakMinutes: entry.breakMinutes,
            hoursWorked: entry.hoursWorked,
            workDescription: entry.workDescription || null,
          })),
        },
      },
      include: {
        entries: true,
      },
    });
    
    revalidatePath('/employee/timesheets');
    
    return { success: true, timesheetId: timesheet.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error('Failed to create timesheet:', error);
    return { success: false, error: 'Failed to create timesheet' };
  }
}

// =============================================================================
// UPDATE TIMESHEET
// =============================================================================

export async function updateTimesheet(data: z.infer<typeof updateTimesheetSchema>) {
  try {
    const validated = updateTimesheetSchema.parse(data);
    
    // Get existing timesheet
    const existing = await db.timesheet.findUnique({
      where: { id: validated.timesheetId },
      include: { entries: true },
    });
    
    if (!existing) {
      return { success: false, error: 'Timesheet not found' };
    }
    
    if (existing.status !== 'DRAFT' && existing.status !== 'REJECTED') {
      return { 
        success: false, 
        error: 'Only draft or rejected timesheets can be edited' 
      };
    }
    
    // Process entries and calculate hours
    const entriesWithHours = validated.entries.map((entry) => ({
      ...entry,
      date: parseISO(entry.date),
      hoursWorked: calculateHours(entry.startTime, entry.endTime, entry.breakMinutes),
    }));
    
    const { totalHours, regularHours, overtimeHours } = calculateTotals(entriesWithHours);
    
    // Delete old entries and create new ones
    await db.$transaction([
      db.timesheetEntry.deleteMany({
        where: { timesheetId: validated.timesheetId },
      }),
      db.timesheet.update({
        where: { id: validated.timesheetId },
        data: {
          status: 'DRAFT', // Reset to draft if was rejected
          totalHours,
          totalRegular: regularHours,
          totalOvertime: overtimeHours,
          rejectedReason: null,
          entries: {
            create: entriesWithHours.map((entry) => ({
              date: entry.date,
              clientName: entry.clientName,
              shiftId: entry.shiftId || null,
              startTime: entry.startTime,
              endTime: entry.endTime,
              breakMinutes: entry.breakMinutes,
              hoursWorked: entry.hoursWorked,
              workDescription: entry.workDescription || null,
            })),
          },
        },
      }),
    ]);
    
    revalidatePath('/employee/timesheets');
    revalidatePath(`/employee/timesheets/${validated.timesheetId}`);
    
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error('Failed to update timesheet:', error);
    return { success: false, error: 'Failed to update timesheet' };
  }
}

// =============================================================================
// SUBMIT TIMESHEET
// =============================================================================

export async function submitTimesheet(timesheetId: string) {
  try {
    const timesheet = await db.timesheet.findUnique({
      where: { id: timesheetId },
      include: { entries: true },
    });
    
    if (!timesheet) {
      return { success: false, error: 'Timesheet not found' };
    }
    
    if (timesheet.status !== 'DRAFT' && timesheet.status !== 'REJECTED') {
      return { 
        success: false, 
        error: 'Timesheet has already been submitted' 
      };
    }
    
    if (timesheet.entries.length === 0) {
      return { 
        success: false, 
        error: 'Cannot submit an empty timesheet' 
      };
    }
    
    await db.timesheet.update({
      where: { id: timesheetId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        rejectedReason: null,
      },
    });
    
    revalidatePath('/employee/timesheets');
    revalidatePath(`/employee/timesheets/${timesheetId}`);
    revalidatePath('/admin/timesheets');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to submit timesheet:', error);
    return { success: false, error: 'Failed to submit timesheet' };
  }
}

// =============================================================================
// GET SHIFTS FOR TIMESHEET (Auto-populate)
// =============================================================================

export async function getShiftsForTimesheet(workerId: string, weekStarting: string) {
  try {
    const weekStart = parseISO(weekStarting);
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    
    // Get all completed/confirmed bookings for this worker in the week
    const bookings = await db.shiftBooking.findMany({
      where: {
        workerId,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        shift: {
          date: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
      },
      include: {
        shift: {
          include: {
            client: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        shift: {
          date: 'asc',
        },
      },
    });
    
    // Transform to timesheet entry format
    const entries = bookings.map((booking) => ({
      date: formatDateUS(booking.shift.date, 'iso'),
      clientName: booking.shift.client.careRecipientName || 
        `${booking.shift.client.user.firstName} ${booking.shift.client.user.lastName}`,
      shiftId: booking.shiftId,
      startTime: booking.shift.startTime,
      endTime: booking.shift.endTime,
      breakMinutes: 0,
      workDescription: '',
    }));
    
    return { success: true, entries };
  } catch (error) {
    console.error('Failed to get shifts for timesheet:', error);
    return { success: false, error: 'Failed to get shifts', entries: [] };
  }
}

// =============================================================================
// ADMIN ACTIONS
// =============================================================================

export async function approveTimesheet(timesheetId: string) {
  try {
    await db.timesheet.update({
      where: { id: timesheetId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        // In production, get approvedBy from auth session
        approvedBy: 'admin',
      },
    });

    revalidatePath('/admin/timesheets');
    revalidatePath(`/admin/timesheets/${timesheetId}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to approve timesheet:', error);
    return { success: false, error: 'Failed to approve timesheet' };
  }
}

export async function rejectTimesheet(timesheetId: string, reason: string) {
  try {
    await db.timesheet.update({
      where: { id: timesheetId },
      data: {
        status: 'REJECTED',
        rejectedReason: reason,
      },
    });

    revalidatePath('/admin/timesheets');
    revalidatePath(`/admin/timesheets/${timesheetId}`);
    revalidatePath('/employee/timesheets');

    return { success: true };
  } catch (error) {
    console.error('Failed to reject timesheet:', error);
    return { success: false, error: 'Failed to reject timesheet' };
  }
}
