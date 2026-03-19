'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { logAuditEvent } from '@/app/actions/audit-log';

// ---------------------------------------------------------------------------
// Service Category schemas & actions
// ---------------------------------------------------------------------------

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  icon: z.string().min(1, 'Icon is required'),
  image: z.string().url().optional().or(z.literal('')),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type ServiceFormState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function createServiceCategory(
  prevState: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  const { userId } = await auth();
  if (!userId) return { success: false, message: 'Unauthorized' };

  const rawData = {
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    icon: formData.get('icon'),
    image: formData.get('image') || undefined,
    sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
    isActive: formData.get('isActive') === 'true',
  };

  const result = categorySchema.safeParse(rawData);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const category = await db.serviceCategory.create({
    data: {
      ...result.data,
      image: result.data.image || null,
    },
  });

  await logAuditEvent({
    action: 'CREATE',
    entity: 'ServiceCategory',
    entityId: category.id,
    details: { name: category.name },
  });

  revalidatePath('/admin/services');
  revalidatePath('/services');
  redirect('/admin/services');
}

export async function updateServiceCategory(
  id: string,
  prevState: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  const { userId } = await auth();
  if (!userId) return { success: false, message: 'Unauthorized' };

  const rawData = {
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    icon: formData.get('icon'),
    image: formData.get('image') || undefined,
    sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
    isActive: formData.get('isActive') === 'true',
  };

  const result = categorySchema.safeParse(rawData);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  await db.serviceCategory.update({
    where: { id },
    data: {
      ...result.data,
      image: result.data.image || null,
    },
  });

  await logAuditEvent({
    action: 'UPDATE',
    entity: 'ServiceCategory',
    entityId: id,
    details: { name: result.data.name },
  });

  revalidatePath('/admin/services');
  revalidatePath('/services');
  redirect('/admin/services');
}

export async function toggleCategoryActive(id: string, isActive: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await db.serviceCategory.update({
    where: { id },
    data: { isActive },
  });

  await logAuditEvent({
    action: 'STATUS_CHANGE',
    entity: 'ServiceCategory',
    entityId: id,
    details: { isActive },
  });

  revalidatePath('/admin/services');
  revalidatePath('/services');
}

export async function deleteServiceCategory(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const category = await db.serviceCategory.findUnique({ where: { id } });

  await db.serviceCategory.delete({ where: { id } });

  await logAuditEvent({
    action: 'DELETE',
    entity: 'ServiceCategory',
    entityId: id,
    details: { name: category?.name },
  });

  revalidatePath('/admin/services');
  revalidatePath('/services');
}

// ---------------------------------------------------------------------------
// Service Item schemas & actions
// ---------------------------------------------------------------------------

const serviceItemSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  features: z.string().transform((val) => val.split('\n').map((f) => f.trim()).filter(Boolean)),
  icon: z.string().min(1, 'Icon is required'),
  priceFrom: z.number().positive().optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  categoryId: z.string().cuid('Invalid category'),
});

export async function createServiceItem(
  prevState: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  const { userId } = await auth();
  if (!userId) return { success: false, message: 'Unauthorized' };

  const priceRaw = formData.get('priceFrom') as string;
  const rawData = {
    title: formData.get('title'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    features: formData.get('features'),
    icon: formData.get('icon'),
    priceFrom: priceRaw ? parseFloat(priceRaw) || null : null,
    sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
    isActive: formData.get('isActive') === 'true',
    categoryId: formData.get('categoryId'),
  };

  const result = serviceItemSchema.safeParse(rawData);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const item = await db.serviceItem.create({ data: result.data });

  await logAuditEvent({
    action: 'CREATE',
    entity: 'ServiceItem',
    entityId: item.id,
    details: { title: item.title },
  });

  revalidatePath('/admin/services');
  revalidatePath('/services');
  redirect(`/admin/services/${result.data.categoryId}`);
}

export async function updateServiceItem(
  id: string,
  prevState: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  const { userId } = await auth();
  if (!userId) return { success: false, message: 'Unauthorized' };

  const priceRaw = formData.get('priceFrom') as string;
  const rawData = {
    title: formData.get('title'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    features: formData.get('features'),
    icon: formData.get('icon'),
    priceFrom: priceRaw ? parseFloat(priceRaw) || null : null,
    sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
    isActive: formData.get('isActive') === 'true',
    categoryId: formData.get('categoryId'),
  };

  const result = serviceItemSchema.safeParse(rawData);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  await db.serviceItem.update({ where: { id }, data: result.data });

  await logAuditEvent({
    action: 'UPDATE',
    entity: 'ServiceItem',
    entityId: id,
    details: { title: result.data.title },
  });

  revalidatePath('/admin/services');
  revalidatePath('/services');
  redirect(`/admin/services/${result.data.categoryId}`);
}

export async function toggleServiceItemActive(id: string, isActive: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await db.serviceItem.update({ where: { id }, data: { isActive } });

  await logAuditEvent({
    action: 'STATUS_CHANGE',
    entity: 'ServiceItem',
    entityId: id,
    details: { isActive },
  });

  revalidatePath('/admin/services');
  revalidatePath('/services');
}

export async function deleteServiceItem(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const item = await db.serviceItem.findUnique({ where: { id } });

  await db.serviceItem.delete({ where: { id } });

  await logAuditEvent({
    action: 'DELETE',
    entity: 'ServiceItem',
    entityId: id,
    details: { title: item?.title },
  });

  revalidatePath('/admin/services');
  revalidatePath('/services');
}
