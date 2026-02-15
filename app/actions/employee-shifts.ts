'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Accept a shift booking request (as a worker)
 */
export async function acceptShiftBooking(
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const booking = await db.shiftBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    if (booking.status !== 'PENDING') {
      return { success: false, error: 'Booking is not pending' };
    }

    await db.shiftBooking.update({
      where: { id: bookingId },
      data: {
        status: 'ACCEPTED',
        respondedAt: new Date(),
      },
    });

    revalidatePath('/employee');
    revalidatePath('/employee/shifts');
    revalidatePath('/admin/shifts');

    return { success: true };
  } catch (error) {
    console.error('Failed to accept booking:', error);
    return { success: false, error: 'Failed to accept booking' };
  }
}

/**
 * Decline a shift booking request (as a worker)
 */
export async function declineShiftBooking(
  bookingId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const booking = await db.shiftBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    if (booking.status !== 'PENDING') {
      return { success: false, error: 'Booking is not pending' };
    }

    await db.shiftBooking.update({
      where: { id: bookingId },
      data: {
        status: 'DECLINED',
        respondedAt: new Date(),
        declinedReason: reason,
      },
    });

    revalidatePath('/employee');
    revalidatePath('/employee/shifts');
    revalidatePath('/admin/shifts');

    return { success: true };
  } catch (error) {
    console.error('Failed to decline booking:', error);
    return { success: false, error: 'Failed to decline booking' };
  }
}

/**
 * Check in to a shift
 */
export async function checkInToShift(
  bookingId: string,
  latitude?: number,
  longitude?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const booking = await db.shiftBooking.findUnique({
      where: { id: bookingId },
      include: { shift: true },
    });

    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    if (booking.status !== 'CONFIRMED') {
      return { success: false, error: 'Booking is not confirmed' };
    }

    await db.shiftBooking.update({
      where: { id: bookingId },
      data: {
        checkedInAt: new Date(),
        checkInLat: latitude,
        checkInLng: longitude,
      },
    });

    // Update shift status to IN_PROGRESS
    await db.careShift.update({
      where: { id: booking.shiftId },
      data: { status: 'IN_PROGRESS' },
    });

    revalidatePath('/employee');
    revalidatePath('/employee/shifts');

    return { success: true };
  } catch (error) {
    console.error('Failed to check in:', error);
    return { success: false, error: 'Failed to check in' };
  }
}

/**
 * Check out from a shift
 */
export async function checkOutFromShift(
  bookingId: string,
  latitude?: number,
  longitude?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const booking = await db.shiftBooking.findUnique({
      where: { id: bookingId },
      include: { shift: true },
    });

    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    if (!booking.checkedInAt) {
      return { success: false, error: 'Must check in before checking out' };
    }

    await db.shiftBooking.update({
      where: { id: bookingId },
      data: {
        checkedOutAt: new Date(),
        checkOutLat: latitude,
        checkOutLng: longitude,
        status: 'COMPLETED',
      },
    });

    // Update shift status to COMPLETED
    await db.careShift.update({
      where: { id: booking.shiftId },
      data: { status: 'COMPLETED' },
    });

    revalidatePath('/employee');
    revalidatePath('/employee/shifts');

    return { success: true };
  } catch (error) {
    console.error('Failed to check out:', error);
    return { success: false, error: 'Failed to check out' };
  }
}
