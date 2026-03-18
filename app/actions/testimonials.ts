'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getCurrentPortalUser } from '@/lib/auth';
import { z } from 'zod';

const clientTestimonialSchema = z.object({
  content: z
    .string()
    .min(10, 'Please write at least 10 characters')
    .max(2000, 'Testimonial must be under 2000 characters'),
  rating: z.number().min(1, 'Please select a rating').max(5),
});

export type ClientTestimonialData = z.infer<typeof clientTestimonialSchema>;

/**
 * Submit a testimonial from a client (queued for admin review).
 */
export async function submitClientTestimonial(
  data: ClientTestimonialData
): Promise<{ success: boolean; error?: string }> {
  try {
    const portalUser = await getCurrentPortalUser();
    if (!portalUser) {
      return { success: false, error: 'Not authenticated' };
    }

    if (portalUser.role !== 'CLIENT') {
      return { success: false, error: 'Only clients can submit testimonials' };
    }

    const parsed = clientTestimonialSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid data' };
    }

    // Get the client record for the relationship label
    const client = await db.client.findFirst({
      where: { userId: portalUser.id },
    });

    await db.testimonial.create({
      data: {
        name: `${portalUser.firstName} ${portalUser.lastName}`,
        role: client?.relationship ? `${client.relationship} of client` : 'Client',
        content: parsed.data.content,
        rating: parsed.data.rating,
        isPublished: false, // Always queued for admin review
        submittedById: portalUser.id,
      },
    });

    revalidatePath('/client/testimonials');
    revalidatePath('/admin/testimonials');

    return { success: true };
  } catch (error) {
    console.error('Failed to submit testimonial:', error);
    return { success: false, error: 'Failed to submit testimonial' };
  }
}
