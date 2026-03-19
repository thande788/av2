'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { logAuditEvent } from '@/app/actions/audit-log';
import type { TestimonialStatus } from '@prisma/client';

const testimonialSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.string().optional(),
  content: z.string().min(10, 'Testimonial must be at least 10 characters'),
  rating: z.number().min(1).max(5).default(5),
  imageUrl: z.string().url().optional().or(z.literal('')),
  videoUrl: z.string().url().optional().or(z.literal('')),
  videoType: z.enum(['youtube', 'vimeo', 'upload', '']).optional(),
  status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'PUBLISHED', 'REJECTED']).default('SUBMITTED'),
  serviceCategoryId: z.string().cuid().optional().or(z.literal('')),
});

export type TestimonialFormState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function createTestimonial(
  prevState: TestimonialFormState,
  formData: FormData
): Promise<TestimonialFormState> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, message: 'Unauthorized' };
  }

  const status = (formData.get('status') as string) || 'SUBMITTED';
  const rawData = {
    name: formData.get('name'),
    role: formData.get('role') || undefined,
    content: formData.get('content'),
    rating: parseInt(formData.get('rating') as string) || 5,
    imageUrl: formData.get('imageUrl') || undefined,
    videoUrl: formData.get('videoUrl') || undefined,
    videoType: formData.get('videoType') || undefined,
    status,
    serviceCategoryId: formData.get('serviceCategoryId') || undefined,
  };

  const result = testimonialSchema.safeParse(rawData);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const isPublished = result.data.status === 'PUBLISHED';

  const testimonial = await db.testimonial.create({
    data: {
      name: result.data.name,
      role: result.data.role || null,
      content: result.data.content,
      rating: result.data.rating,
      imageUrl: result.data.imageUrl || null,
      videoUrl: result.data.videoUrl || null,
      videoType: result.data.videoType || null,
      status: result.data.status as TestimonialStatus,
      isPublished,
      serviceCategoryId: result.data.serviceCategoryId || null,
    },
  });

  await logAuditEvent({
    action: 'CREATE',
    entity: 'Testimonial',
    entityId: testimonial.id,
    details: { name: testimonial.name, status: result.data.status },
  });

  revalidatePath('/admin/testimonials');
  revalidatePath('/testimonials');
  redirect('/admin/testimonials');
}

export async function updateTestimonial(
  id: string,
  prevState: TestimonialFormState,
  formData: FormData
): Promise<TestimonialFormState> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, message: 'Unauthorized' };
  }

  const status = (formData.get('status') as string) || 'SUBMITTED';
  const rawData = {
    name: formData.get('name'),
    role: formData.get('role') || undefined,
    content: formData.get('content'),
    rating: parseInt(formData.get('rating') as string) || 5,
    imageUrl: formData.get('imageUrl') || undefined,
    videoUrl: formData.get('videoUrl') || undefined,
    videoType: formData.get('videoType') || undefined,
    status,
    serviceCategoryId: formData.get('serviceCategoryId') || undefined,
  };

  const result = testimonialSchema.safeParse(rawData);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const isPublished = result.data.status === 'PUBLISHED';
  const reviewData =
    result.data.status === 'PUBLISHED' || result.data.status === 'REJECTED'
      ? { reviewedBy: userId, reviewedAt: new Date() }
      : {};

  await db.testimonial.update({
    where: { id },
    data: {
      name: result.data.name,
      role: result.data.role || null,
      content: result.data.content,
      rating: result.data.rating,
      imageUrl: result.data.imageUrl || null,
      videoUrl: result.data.videoUrl || null,
      videoType: result.data.videoType || null,
      status: result.data.status as TestimonialStatus,
      isPublished,
      serviceCategoryId: result.data.serviceCategoryId || null,
      ...reviewData,
    },
  });

  await logAuditEvent({
    action: 'UPDATE',
    entity: 'Testimonial',
    entityId: id,
    details: { name: result.data.name, status: result.data.status },
  });

  revalidatePath('/admin/testimonials');
  revalidatePath('/testimonials');
  redirect('/admin/testimonials');
}

export async function updateTestimonialStatus(
  id: string,
  status: TestimonialStatus,
  rejectionNote?: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const isPublished = status === 'PUBLISHED';

  await db.testimonial.update({
    where: { id },
    data: {
      status,
      isPublished,
      reviewedBy: userId,
      reviewedAt: new Date(),
      rejectionNote: rejectionNote || null,
    },
  });

  await logAuditEvent({
    action: 'STATUS_CHANGE',
    entity: 'Testimonial',
    entityId: id,
    details: { status, rejectionNote },
  });

  revalidatePath('/admin/testimonials');
  revalidatePath('/testimonials');
}

export async function togglePublishStatus(id: string, isPublished: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await db.testimonial.update({
    where: { id },
    data: {
      isPublished,
      status: isPublished ? 'PUBLISHED' : 'SUBMITTED',
      reviewedBy: userId,
      reviewedAt: new Date(),
    },
  });

  await logAuditEvent({
    action: 'STATUS_CHANGE',
    entity: 'Testimonial',
    entityId: id,
    details: { isPublished },
  });

  revalidatePath('/admin/testimonials');
  revalidatePath('/testimonials');
}

export async function deleteTestimonial(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const testimonial = await db.testimonial.findUnique({ where: { id } });

  await db.testimonial.delete({ where: { id } });

  await logAuditEvent({
    action: 'DELETE',
    entity: 'Testimonial',
    entityId: id,
    details: { name: testimonial?.name },
  });

  revalidatePath('/admin/testimonials');
  revalidatePath('/testimonials');
}

export async function requestTestimonial(data: {
  email: string;
  name: string;
  message?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'Unauthorized' };

  try {
    // Create a placeholder testimonial in REQUESTED state
    const testimonial = await db.testimonial.create({
      data: {
        name: data.name,
        content: '',
        status: 'REQUESTED',
        isPublished: false,
        requestedAt: new Date(),
        requestedBy: userId,
        requestEmail: data.email,
      },
    });

    // Send the request email via the existing admin email system
    const { sendAdminEmail } = await import('@/app/actions/admin-email');
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://angeltouch.services';
    const submitUrl = `${siteUrl}/client/testimonials`;
    await sendAdminEmail({
      toEmail: data.email,
      toName: data.name,
      subject: 'Share Your Experience with Angel Touch Homecare',
      body:
        data.message ||
        `We hope you and your family have been happy with the care provided by Angel Touch Homecare.\n\nYour feedback is incredibly valuable to us and helps other families discover the compassionate care we offer. Would you be willing to share a brief testimonial about your experience?\n\nYou can submit your testimonial through our client portal:\n${submitUrl}\n\nIf you don't have a portal account, feel free to call us at (978) 856-9358 or email info@angeltouch.services and we'll be happy to help.\n\nThank you so much for your trust in us!`,
      template: 'testimonial-request',
      entity: 'Testimonial',
      entityId: testimonial.id,
    });

    await logAuditEvent({
      action: 'TESTIMONIAL_REQUEST',
      entity: 'Testimonial',
      entityId: testimonial.id,
      details: { email: data.email, name: data.name },
    });

    revalidatePath('/admin/testimonials');

    return { success: true };
  } catch (error) {
    console.error('Failed to request testimonial:', error);
    return { success: false, error: 'Failed to send testimonial request' };
  }
}
