'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { logAuditEvent } from '@/app/actions/audit-log';
import type { InquiryStatus } from '@prisma/client';

export async function updateInquiryStatus(
  inquiryId: string,
  status: InquiryStatus
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const existing = await db.serviceInquiry.findUnique({
    where: { id: inquiryId },
    select: { status: true },
  });

  await db.serviceInquiry.update({
    where: { id: inquiryId },
    data: { status },
  });

  await logAuditEvent({
    action: 'STATUS_CHANGE',
    entity: 'ServiceInquiry',
    entityId: inquiryId,
    details: {
      previousStatus: existing?.status,
      newStatus: status,
    },
  });

  revalidatePath('/admin/inquiries');
  revalidatePath('/admin');
}
