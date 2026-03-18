/**
 * Composite caregiver rating computation
 *
 * Computes a weighted average of all ShiftReview ratings for a worker,
 * combining both CLIENT and ADMIN reviews with equal weight.
 */

import { db } from '@/lib/db';

export interface CaregiverRating {
  average: number;
  clientCount: number;
  adminCount: number;
  totalCount: number;
}

/**
 * Compute the composite rating for a caregiver from all their shift reviews.
 * Returns null if the worker has no reviews.
 */
export async function computeCaregiverRating(
  workerId: string
): Promise<CaregiverRating | null> {
  const reviews = await db.shiftReview.findMany({
    where: { workerId },
    select: { rating: true, reviewerType: true },
  });

  if (reviews.length === 0) return null;

  const clientReviews = reviews.filter((r) => r.reviewerType === 'CLIENT');
  const adminReviews = reviews.filter((r) => r.reviewerType === 'ADMIN');
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);

  return {
    average: Math.round((sum / reviews.length) * 10) / 10,
    clientCount: clientReviews.length,
    adminCount: adminReviews.length,
    totalCount: reviews.length,
  };
}

/**
 * Batch-compute ratings for multiple workers.
 * More efficient than calling computeCaregiverRating in a loop.
 */
export async function computeCaregiverRatingsBatch(
  workerIds: string[]
): Promise<Map<string, CaregiverRating>> {
  if (workerIds.length === 0) return new Map();

  const reviews = await db.shiftReview.findMany({
    where: { workerId: { in: workerIds } },
    select: { workerId: true, rating: true, reviewerType: true },
  });

  const map = new Map<string, CaregiverRating>();

  // Group reviews by worker
  const grouped = new Map<string, typeof reviews>();
  for (const review of reviews) {
    const existing = grouped.get(review.workerId) || [];
    existing.push(review);
    grouped.set(review.workerId, existing);
  }

  for (const [workerId, workerReviews] of grouped) {
    const clientReviews = workerReviews.filter((r) => r.reviewerType === 'CLIENT');
    const adminReviews = workerReviews.filter((r) => r.reviewerType === 'ADMIN');
    const sum = workerReviews.reduce((acc, r) => acc + r.rating, 0);

    map.set(workerId, {
      average: Math.round((sum / workerReviews.length) * 10) / 10,
      clientCount: clientReviews.length,
      adminCount: adminReviews.length,
      totalCount: workerReviews.length,
    });
  }

  return map;
}
