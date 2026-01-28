'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import type { InquiryStatus } from '@prisma/client';

export async function updateInquiryStatus(
  inquiryId: string,
  status: InquiryStatus
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  await db.serviceInquiry.update({
    where: { id: inquiryId },
    data: { status },
  });

  revalidatePath('/admin/inquiries');
  revalidatePath('/admin');
}
