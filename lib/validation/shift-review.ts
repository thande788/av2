/**
 * Shift Review Validation Schema
 *
 * Validates client and admin reviews for completed shifts.
 */

import { z } from 'zod';

export const shiftReviewSchema = z.object({
  shiftId: z.string().min(1, 'Shift ID is required'),
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating must not exceed 5 stars'),
  comment: z
    .string()
    .max(2000, 'Comment must not exceed 2000 characters')
    .optional()
    .transform((val) => val?.trim() || undefined),
});

export type ShiftReviewData = z.infer<typeof shiftReviewSchema>;
