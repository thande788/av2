'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ShiftStatus, BookingStatus } from '@prisma/client';

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
    await db.careShift.update({
      where: { id: shiftId },
      data: { status },
    });

    revalidatePath('/admin/shifts');
    revalidatePath(`/admin/shifts/${shiftId}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to update shift status:', error);
    return { success: false, error: 'Failed to update shift status' };
  }
}
