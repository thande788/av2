'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

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

    return { success: true };
  } catch (error) {
    console.error('Failed to reject timesheet:', error);
    return { success: false, error: 'Failed to reject timesheet' };
  }
}
