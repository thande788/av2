'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { BookingStatus, ShiftStatus } from '@prisma/client';
import { sendShiftConfirmation } from './sms-notifications';

interface BookShiftResult {
  success: boolean;
  error?: string;
  bookingId?: string;
}

/**
 * Book a shift from the public booking link (SMS link)
 * 
 * This function handles the case where a worker clicks a booking link
 * from an SMS notification. It:
 * 1. Verifies the worker is authenticated
 * 2. Checks the shift is still available
 * 3. Creates or updates a booking request
 * 4. Sends a confirmation SMS
 */
export async function bookShiftFromLink(shiftId: string): Promise<BookShiftResult> {
  try {
    // Get authenticated user
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return {
        success: false,
        error: 'You must be signed in to book a shift',
      };
    }

    // Find the portal user and worker
    const portalUser = await db.portalUser.findUnique({
      where: { clerkId: clerkUserId },
      include: {
        worker: true,
      },
    });

    if (!portalUser || !portalUser.worker) {
      return {
        success: false,
        error: 'Worker profile not found. Please complete your registration.',
      };
    }

    const worker = portalUser.worker;

    // Check worker status
    if (portalUser.status !== 'ACTIVE') {
      return {
        success: false,
        error: 'Your account is not active. Please contact HR.',
      };
    }

    if (worker.complianceStatus !== 'COMPLIANT') {
      return {
        success: false,
        error: 'Your compliance documents are not up to date. Please update your documents.',
      };
    }

    // Get the shift
    const shift = await db.careShift.findUnique({
      where: { id: shiftId },
      include: {
        client: {
          include: { user: true },
        },
        bookings: true,
      },
    });

    if (!shift) {
      return {
        success: false,
        error: 'Shift not found',
      };
    }

    // Check shift is still bookable
    if (shift.status !== ShiftStatus.OPEN && shift.status !== ShiftStatus.PENDING_BOOK) {
      return {
        success: false,
        error: 'This shift is no longer available',
      };
    }

    // Check if shift is already booked by this worker
    const existingBooking = shift.bookings.find(
      (b) => b.workerId === worker.id
    );

    if (existingBooking) {
      return {
        success: false,
        error: 'You have already requested this shift',
      };
    }

    // Check for confirmed booking (someone else got it)
    const confirmedBooking = shift.bookings.find(
      (b) => b.status === BookingStatus.CONFIRMED
    );

    if (confirmedBooking) {
      return {
        success: false,
        error: 'This shift has already been assigned to another caregiver',
      };
    }

    // Create booking request
    const booking = await db.shiftBooking.create({
      data: {
        shiftId: shift.id,
        workerId: worker.id,
        status: BookingStatus.PENDING,
      },
    });

    // Send confirmation SMS
    await sendShiftConfirmation(shiftId, worker.id);

    // Revalidate relevant paths
    revalidatePath('/employee');
    revalidatePath('/employee/shifts');
    revalidatePath('/admin/shifts');
    revalidatePath(`/admin/shifts/${shiftId}`);
    revalidatePath(`/book/${shiftId}`);

    return {
      success: true,
      bookingId: booking.id,
    };
  } catch (error) {
    console.error('Failed to book shift:', error);
    return {
      success: false,
      error: 'An error occurred while booking the shift. Please try again.',
    };
  }
}

/**
 * Cancel a shift booking (worker side)
 */
export async function cancelShiftBooking(
  bookingId: string,
  reason?: string
): Promise<BookShiftResult> {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return { success: false, error: 'Not authenticated' };
    }

    const booking = await db.shiftBooking.findUnique({
      where: { id: bookingId },
      include: {
        worker: {
          include: { user: true },
        },
        shift: true,
      },
    });

    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    // Verify ownership
    if (booking.worker.user.clerkId !== clerkUserId) {
      return { success: false, error: 'Not authorized to cancel this booking' };
    }

    // Can only cancel pending or accepted bookings
    if (booking.status !== 'PENDING' && booking.status !== 'ACCEPTED') {
      return { success: false, error: 'Cannot cancel this booking' };
    }

    await db.shiftBooking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        declinedReason: reason || 'Cancelled by worker',
      },
    });

    // If this was the only accepted booking, reopen the shift
    const remainingBookings = await db.shiftBooking.count({
      where: {
        shiftId: booking.shiftId,
        status: { in: ['PENDING', 'ACCEPTED', 'CONFIRMED'] },
      },
    });

    if (remainingBookings === 0) {
      await db.careShift.update({
        where: { id: booking.shiftId },
        data: { status: ShiftStatus.OPEN },
      });
    }

    revalidatePath('/employee');
    revalidatePath('/employee/shifts');
    revalidatePath('/admin/shifts');
    revalidatePath(`/admin/shifts/${booking.shiftId}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to cancel booking:', error);
    return { success: false, error: 'Failed to cancel booking' };
  }
}
