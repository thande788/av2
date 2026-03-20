'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { logAuditEvent } from '@/app/actions/audit-log';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const pricingTierSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  price: z.number().positive('Price must be positive'),
  period: z.enum(['hour', 'day', 'week', 'month']),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  features: z
    .string()
    .transform((val) =>
      val
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean)
    ),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
  ctaText: z.string().optional().or(z.literal('')),
  ctaHref: z.string().optional().or(z.literal('')),
});

export type PricingFormState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createPricingTier(
  prevState: PricingFormState,
  formData: FormData
): Promise<PricingFormState> {
  const { userId } = await auth();
  if (!userId) return { success: false, message: 'Unauthorized' };

  const rawData = {
    title: formData.get('title'),
    slug: formData.get('slug'),
    price: parseFloat(formData.get('price') as string) || 0,
    period: formData.get('period'),
    description: formData.get('description'),
    features: formData.get('features'),
    isPopular: formData.get('isPopular') === 'true',
    isActive: formData.get('isActive') === 'true',
    sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
    ctaText: formData.get('ctaText') || undefined,
    ctaHref: formData.get('ctaHref') || undefined,
  };

  const result = pricingTierSchema.safeParse(rawData);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const tier = await db.pricingTier.create({
    data: {
      ...result.data,
      ctaText: result.data.ctaText || null,
      ctaHref: result.data.ctaHref || null,
    },
  });

  await logAuditEvent({
    action: 'CREATE',
    entity: 'PricingTier',
    entityId: tier.id,
    details: { title: tier.title, price: tier.price },
  });

  revalidatePath('/admin/pricing');
  revalidatePath('/services');
  redirect('/admin/pricing');
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updatePricingTier(
  id: string,
  prevState: PricingFormState,
  formData: FormData
): Promise<PricingFormState> {
  const { userId } = await auth();
  if (!userId) return { success: false, message: 'Unauthorized' };

  const rawData = {
    title: formData.get('title'),
    slug: formData.get('slug'),
    price: parseFloat(formData.get('price') as string) || 0,
    period: formData.get('period'),
    description: formData.get('description'),
    features: formData.get('features'),
    isPopular: formData.get('isPopular') === 'true',
    isActive: formData.get('isActive') === 'true',
    sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
    ctaText: formData.get('ctaText') || undefined,
    ctaHref: formData.get('ctaHref') || undefined,
  };

  const result = pricingTierSchema.safeParse(rawData);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  await db.pricingTier.update({
    where: { id },
    data: {
      ...result.data,
      ctaText: result.data.ctaText || null,
      ctaHref: result.data.ctaHref || null,
    },
  });

  await logAuditEvent({
    action: 'UPDATE',
    entity: 'PricingTier',
    entityId: id,
    details: { title: result.data.title, price: result.data.price },
  });

  revalidatePath('/admin/pricing');
  revalidatePath('/services');
  redirect('/admin/pricing');
}

// ---------------------------------------------------------------------------
// Toggle active
// ---------------------------------------------------------------------------

export async function togglePricingTierActive(id: string, isActive: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await db.pricingTier.update({
    where: { id },
    data: { isActive },
  });

  await logAuditEvent({
    action: 'STATUS_CHANGE',
    entity: 'PricingTier',
    entityId: id,
    details: { isActive },
  });

  revalidatePath('/admin/pricing');
  revalidatePath('/services');
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deletePricingTier(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const tier = await db.pricingTier.findUnique({ where: { id } });

  await db.pricingTier.delete({ where: { id } });

  await logAuditEvent({
    action: 'DELETE',
    entity: 'PricingTier',
    entityId: id,
    details: { title: tier?.title },
  });

  revalidatePath('/admin/pricing');
  revalidatePath('/services');
}
