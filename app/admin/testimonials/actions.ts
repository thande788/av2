'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const testimonialSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.string().optional(),
  content: z.string().min(10, 'Testimonial must be at least 10 characters'),
  rating: z.number().min(1).max(5).default(5),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isPublished: z.boolean().default(false),
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

  const rawData = {
    name: formData.get('name'),
    role: formData.get('role') || undefined,
    content: formData.get('content'),
    rating: parseInt(formData.get('rating') as string) || 5,
    imageUrl: formData.get('imageUrl') || undefined,
    isPublished: formData.get('isPublished') === 'true',
  };

  const result = testimonialSchema.safeParse(rawData);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  await db.testimonial.create({
    data: {
      ...result.data,
      imageUrl: result.data.imageUrl || null,
      role: result.data.role || null,
    },
  });

  revalidatePath('/admin/testimonials');
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

  const rawData = {
    name: formData.get('name'),
    role: formData.get('role') || undefined,
    content: formData.get('content'),
    rating: parseInt(formData.get('rating') as string) || 5,
    imageUrl: formData.get('imageUrl') || undefined,
    isPublished: formData.get('isPublished') === 'true',
  };

  const result = testimonialSchema.safeParse(rawData);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  await db.testimonial.update({
    where: { id },
    data: {
      ...result.data,
      imageUrl: result.data.imageUrl || null,
      role: result.data.role || null,
    },
  });

  revalidatePath('/admin/testimonials');
  redirect('/admin/testimonials');
}

export async function togglePublishStatus(id: string, isPublished: boolean) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  await db.testimonial.update({
    where: { id },
    data: { isPublished },
  });

  revalidatePath('/admin/testimonials');
}

export async function deleteTestimonial(id: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  await db.testimonial.delete({
    where: { id },
  });

  revalidatePath('/admin/testimonials');
}
