'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { logAuditEvent } from '@/app/actions/audit-log';

export async function markContactAsRead(contactId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  await db.contactSubmission.update({
    where: { id: contactId },
    data: { isRead: true },
  });

  await logAuditEvent({
    action: 'STATUS_CHANGE',
    entity: 'ContactSubmission',
    entityId: contactId,
    details: { newStatus: 'READ' },
  });

  revalidatePath('/admin/contacts');
  revalidatePath('/admin');
}
