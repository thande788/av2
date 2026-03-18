'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getCurrentClient, getCurrentPortalUser, isAdminOrManager } from '@/lib/auth';
import { shiftReviewSchema, type ShiftReviewData } from '@/lib/validation/shift-review';

/**
 * Submit a shift review (client or admin).
 */
export async function submitShiftReview(
  data: ShiftReviewData
): Promise<{ success: boolean; error?: string }> {
  try {
    const portalUser = await getCurrentPortalUser();
    if (!portalUser) {
      return { success: false, error: 'Not authenticated' };
    }

    const parsed = shiftReviewSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid data' };
    }

    // Fetch the shift with its booking to get the worker
    const shift = await db.careShift.findUnique({
      where: { id: parsed.data.shiftId },
      include: {
        client: true,
        bookings: {
          where: { status: 'COMPLETED' },
          take: 1,
        },
      },
    });

    if (!shift) {
      return { success: false, error: 'Shift not found' };
    }

    if (shift.status !== 'COMPLETED') {
      return { success: false, error: 'Can only review completed shifts' };
    }

    const completedBooking = shift.bookings[0];
    if (!completedBooking) {
      return { success: false, error: 'No completed booking found for this shift' };
    }

    // Determine reviewer type and validate authorization
    const isAdmin = await isAdminOrManager();
    let reviewerType: 'CLIENT' | 'ADMIN';

    if (isAdmin) {
      reviewerType = 'ADMIN';
    } else if (portalUser.role === 'CLIENT') {
      // Verify this client owns the shift
      const client = await getCurrentClient();
      if (!client || client.id !== shift.clientId) {
        return { success: false, error: 'You can only review shifts for your own care' };
      }
      reviewerType = 'CLIENT';
    } else {
      return { success: false, error: 'Only clients and admins can submit reviews' };
    }

    // Check for duplicate review
    const existing = await db.shiftReview.findUnique({
      where: {
        shiftId_reviewerType_reviewerId: {
          shiftId: parsed.data.shiftId,
          reviewerType,
          reviewerId: portalUser.id,
        },
      },
    });

    if (existing) {
      return { success: false, error: 'You have already reviewed this shift' };
    }

    await db.shiftReview.create({
      data: {
        shiftId: parsed.data.shiftId,
        workerId: completedBooking.workerId,
        reviewerType,
        reviewerId: portalUser.id,
        rating: parsed.data.rating,
        comment: parsed.data.comment || null,
      },
    });

    revalidatePath('/client/reviews');
    revalidatePath('/admin/reviews');
    revalidatePath('/caregivers');

    return { success: true };
  } catch (error) {
    console.error('Failed to submit shift review:', error);
    return { success: false, error: 'Failed to submit review' };
  }
}

/**
 * Get completed shifts awaiting review by the current client.
 */
export async function getCompletedShiftsAwaitingReview() {
  const client = await getCurrentClient();
  if (!client) return [];

  const completedShifts = await db.careShift.findMany({
    where: {
      clientId: client.id,
      status: 'COMPLETED',
      // Exclude shifts already reviewed by this client
      reviews: {
        none: {
          reviewerType: 'CLIENT',
          reviewerId: client.userId,
        },
      },
    },
    include: {
      bookings: {
        where: { status: 'COMPLETED' },
        include: {
          worker: {
            include: { user: true },
          },
        },
      },
    },
    orderBy: { date: 'desc' },
  });

  return completedShifts;
}

/**
 * Get past reviews submitted by the current client.
 */
export async function getClientReviews() {
  const portalUser = await getCurrentPortalUser();
  if (!portalUser) return [];

  return db.shiftReview.findMany({
    where: {
      reviewerId: portalUser.id,
      reviewerType: 'CLIENT',
    },
    include: {
      shift: true,
      worker: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Publish a review (admin action — makes it visible on the testimonials page).
 */
export async function publishReview(
  reviewId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const isAdmin = await isAdminOrManager();
    if (!isAdmin) {
      return { success: false, error: 'Admin access required' };
    }

    await db.shiftReview.update({
      where: { id: reviewId },
      data: {
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    revalidatePath('/admin/reviews');
    revalidatePath('/testimonials');

    return { success: true };
  } catch (error) {
    console.error('Failed to publish review:', error);
    return { success: false, error: 'Failed to publish review' };
  }
}

/**
 * Unpublish a review (admin action).
 */
export async function unpublishReview(
  reviewId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const isAdmin = await isAdminOrManager();
    if (!isAdmin) {
      return { success: false, error: 'Admin access required' };
    }

    await db.shiftReview.update({
      where: { id: reviewId },
      data: {
        isPublished: false,
        publishedAt: null,
      },
    });

    revalidatePath('/admin/reviews');
    revalidatePath('/testimonials');

    return { success: true };
  } catch (error) {
    console.error('Failed to unpublish review:', error);
    return { success: false, error: 'Failed to unpublish review' };
  }
}
