'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
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

  await db.application.update({
    where: { id: applicationId },
    data: {
      status,
      internalNotes: internalNotes || null,
      reviewedBy: userId,
      reviewedAt: new Date(),
    },
  });

  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath('/admin/applications');
  revalidatePath('/admin');
}
