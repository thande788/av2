'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { logAuditEvent } from '@/app/actions/audit-log';

const faqSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters'),
  answer: z.string().min(10, 'Answer must be at least 10 characters'),
  category: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

export type FAQFormState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function createFAQ(
  prevState: FAQFormState,
  formData: FormData
): Promise<FAQFormState> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, message: 'Unauthorized' };
  }

  const rawData = {
    question: formData.get('question'),
    answer: formData.get('answer'),
    category: formData.get('category') || undefined,
    sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
    isPublished: formData.get('isPublished') === 'true',
  };

  const result = faqSchema.safeParse(rawData);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const faq = await db.fAQ.create({
    data: {
      ...result.data,
      category: result.data.category || null,
    },
  });

  await logAuditEvent({
    action: 'CREATE',
    entity: 'FAQ',
    entityId: faq.id,
    details: { question: faq.question },
  });

  revalidatePath('/admin/faqs');
  revalidatePath('/faqs');
  redirect('/admin/faqs');
}

export async function updateFAQ(
  id: string,
  prevState: FAQFormState,
  formData: FormData
): Promise<FAQFormState> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, message: 'Unauthorized' };
  }

  const rawData = {
    question: formData.get('question'),
    answer: formData.get('answer'),
    category: formData.get('category') || undefined,
    sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
    isPublished: formData.get('isPublished') === 'true',
  };

  const result = faqSchema.safeParse(rawData);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  await db.fAQ.update({
    where: { id },
    data: {
      ...result.data,
      category: result.data.category || null,
    },
  });

  await logAuditEvent({
    action: 'UPDATE',
    entity: 'FAQ',
    entityId: id,
    details: { question: result.data.question },
  });

  revalidatePath('/admin/faqs');
  revalidatePath('/faqs');
  redirect('/admin/faqs');
}

export async function toggleFAQPublished(id: string, isPublished: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await db.fAQ.update({
    where: { id },
    data: { isPublished },
  });

  await logAuditEvent({
    action: 'STATUS_CHANGE',
    entity: 'FAQ',
    entityId: id,
    details: { isPublished },
  });

  revalidatePath('/admin/faqs');
  revalidatePath('/faqs');
}

export async function deleteFAQ(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const faq = await db.fAQ.findUnique({ where: { id } });

  await db.fAQ.delete({ where: { id } });

  await logAuditEvent({
    action: 'DELETE',
    entity: 'FAQ',
    entityId: id,
    details: { question: faq?.question },
  });

  revalidatePath('/admin/faqs');
  revalidatePath('/faqs');
}

export async function reorderFAQs(ids: string[]) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await Promise.all(
    ids.map((id, index) =>
      db.fAQ.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  revalidatePath('/admin/faqs');
  revalidatePath('/faqs');
}
