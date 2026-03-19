'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { logAuditEvent } from '@/app/actions/audit-log';
import type { ApplicationStatus } from '@prisma/client';

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  internalNotes: string
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const existing = await db.application.findUnique({
    where: { id: applicationId },
    select: { status: true },
  });

  await db.application.update({
    where: { id: applicationId },
    data: {
      status,
      internalNotes: internalNotes || null,
      reviewedBy: userId,
      reviewedAt: new Date(),
    },
  });

  await logAuditEvent({
    action: 'STATUS_CHANGE',
    entity: 'Application',
    entityId: applicationId,
    details: {
      previousStatus: existing?.status,
      newStatus: status,
      hasNotes: !!internalNotes,
    },
  });

  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath('/admin/applications');
  revalidatePath('/admin');
}
