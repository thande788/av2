'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getCurrentPortalUser, isAdminOrManager } from '@/lib/auth';
import { z } from 'zod';
import { SwapStatus } from '@prisma/client';

const swapRequestSchema = z.object({
  bookingId: z.string().min(1),
  targetWorkerId: z.string().optional(),
  reason: z.string().min(5, 'Please provide a reason').max(500),
});

export type SwapRequestData = z.infer<typeof swapRequestSchema>;

/**
 * Request a shift swap (employee wants to give up a booking)
 */
export async function requestShiftSwap(
  data: SwapRequestData
): Promise<{ success: boolean; swapId?: string; error?: string }> {
  try {
    const portalUser = await getCurrentPortalUser();
    if (!portalUser) return { success: false, error: 'Not authenticated' };

    const parsed = swapRequestSchema.parse(data);

    // Get booking and verify ownership
    const booking = await db.shiftBooking.findUnique({
      where: { id: parsed.bookingId },
      include: {
        worker: true,
        shift: true,
      },
    });

    if (!booking) return { success: false, error: 'Booking not found' };
    if (booking.worker.userId !== portalUser.id) {
      return { success: false, error: 'Not your booking' };
    }
    if (!['ACCEPTED', 'CONFIRMED'].includes(booking.status)) {
      return { success: false, error: 'Only active bookings can be swapped' };
    }

    // Check for existing pending swap
    const existingSwap = await db.swapRequest.findFirst({
      where: {
        originalBookingId: parsed.bookingId,
        status: SwapStatus.PENDING,
      },
    });
    if (existingSwap) {
      return { success: false, error: 'A swap request already exists for this booking' };
    }

    const swap = await db.swapRequest.create({
      data: {
        originalBookingId: parsed.bookingId,
        requesterId: booking.workerId,
        targetWorkerId: parsed.targetWorkerId || null,
        reason: parsed.reason,
        status: SwapStatus.PENDING,
      },
    });

    // Notify admins
    const admins = await db.portalUser.findMany({
      where: { role: { in: ['ADMIN', 'MANAGER'] }, status: 'ACTIVE' },
      select: { id: true },
    });

    if (admins.length > 0) {
      await db.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          channel: 'IN_APP' as const,
          type: 'GENERAL' as const,
          title: 'Shift Swap Request',
          body: `${portalUser.firstName} ${portalUser.lastName} requested to swap a shift.`,
          data: { swapId: swap.id, shiftId: booking.shiftId },
          status: 'SENT' as const,
          sentAt: new Date(),
        })),
      });
    }

    revalidatePath('/employee/shifts');
    revalidatePath('/admin/swaps');

    return { success: true, swapId: swap.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error('Failed to request swap:', error);
    return { success: false, error: 'Failed to request swap' };
  }
}

/**
 * Accept a swap request (target worker)
 */
export async function acceptSwapRequest(
  swapId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const portalUser = await getCurrentPortalUser();
    if (!portalUser) return { success: false, error: 'Not authenticated' };

    const swap = await db.swapRequest.findUnique({
      where: { id: swapId },
      include: { originalBooking: { include: { shift: true } } },
    });

    if (!swap) return { success: false, error: 'Swap request not found' };
    if (swap.status !== SwapStatus.PENDING) return { success: false, error: 'Swap is no longer pending' };

    // Verify the accepting worker is the target
    const worker = await db.worker.findUnique({ where: { userId: portalUser.id } });
    if (!worker || (swap.targetWorkerId && swap.targetWorkerId !== worker.id)) {
      return { success: false, error: 'Not authorized to accept this swap' };
    }

    await db.swapRequest.update({
      where: { id: swapId },
      data: { status: SwapStatus.ACCEPTED, targetWorkerId: worker.id },
    });

    revalidatePath('/employee/shifts');
    revalidatePath('/admin/swaps');

    return { success: true };
  } catch (error) {
    console.error('Failed to accept swap:', error);
    return { success: false, error: 'Failed to accept swap' };
  }
}

/**
 * Admin approves a swap — actually reassigns the booking
 */
export async function approveSwapRequest(
  swapId: string,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const portalUser = await getCurrentPortalUser();
    if (!portalUser) return { success: false, error: 'Not authenticated' };

    const admin = await isAdminOrManager();
    if (!admin) return { success: false, error: 'Admin access required' };

    const swap = await db.swapRequest.findUnique({
      where: { id: swapId },
      include: {
        originalBooking: { include: { shift: true, worker: true } },
      },
    });

    if (!swap) return { success: false, error: 'Swap request not found' };
    if (swap.status !== SwapStatus.PENDING && swap.status !== SwapStatus.ACCEPTED) {
      return { success: false, error: 'Swap is no longer actionable' };
    }

    // If a target worker accepted, reassign the booking
    if (swap.targetWorkerId) {
      // Cancel original booking
      await db.shiftBooking.update({
        where: { id: swap.originalBookingId },
        data: { status: 'CANCELLED' },
      });

      // Create new booking for target worker
      await db.shiftBooking.create({
        data: {
          shiftId: swap.originalBooking.shiftId,
          workerId: swap.targetWorkerId,
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
      });
    } else {
      // No target worker: just cancel the original booking, reopen shift
      await db.shiftBooking.update({
        where: { id: swap.originalBookingId },
        data: { status: 'CANCELLED' },
      });

      await db.careShift.update({
        where: { id: swap.originalBooking.shiftId },
        data: { status: 'OPEN' },
      });
    }

    await db.swapRequest.update({
      where: { id: swapId },
      data: {
        status: SwapStatus.APPROVED,
        reviewedBy: portalUser.id,
        reviewedAt: new Date(),
        reviewNote: note,
      },
    });

    revalidatePath('/employee/shifts');
    revalidatePath('/admin/shifts');
    revalidatePath('/admin/swaps');

    return { success: true };
  } catch (error) {
    console.error('Failed to approve swap:', error);
    return { success: false, error: 'Failed to approve swap' };
  }
}

/**
 * Admin rejects a swap
 */
export async function rejectSwapRequest(
  swapId: string,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const portalUser = await getCurrentPortalUser();
    if (!portalUser) return { success: false, error: 'Not authenticated' };

    const admin = await isAdminOrManager();
    if (!admin) return { success: false, error: 'Admin access required' };

    await db.swapRequest.update({
      where: { id: swapId },
      data: {
        status: SwapStatus.REJECTED,
        reviewedBy: portalUser.id,
        reviewedAt: new Date(),
        reviewNote: note,
      },
    });

    revalidatePath('/employee/shifts');
    revalidatePath('/admin/swaps');

    return { success: true };
  } catch (error) {
    console.error('Failed to reject swap:', error);
    return { success: false, error: 'Failed to reject swap' };
  }
}

/**
 * Get pending swap requests (admin view)
 */
export async function getPendingSwapRequests() {
  return db.swapRequest.findMany({
    where: { status: { in: [SwapStatus.PENDING, SwapStatus.ACCEPTED] } },
    include: {
      originalBooking: {
        include: {
          shift: {
            include: { client: { include: { user: true } } },
          },
          worker: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get my swap requests (employee view)
 */
export async function getMySwapRequests() {
  const portalUser = await getCurrentPortalUser();
  if (!portalUser) return [];

  const worker = await db.worker.findUnique({ where: { userId: portalUser.id } });
  if (!worker) return [];

  return db.swapRequest.findMany({
    where: {
      OR: [
        { requesterId: worker.id },
        { targetWorkerId: worker.id },
      ],
    },
    include: {
      originalBooking: {
        include: {
          shift: { select: { id: true, date: true, startTime: true, endTime: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
