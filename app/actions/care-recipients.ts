'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';

const addCareRecipientSchema = z.object({
  fullName: z.string().trim().min(1).max(160),
  relationship: z.string().trim().max(120).optional().nullable(),
  dateOfBirth: z.string().trim().optional().nullable(),
});

async function getCurrentClientEntity() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const portalUser = await db.portalUser.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true },
  });

  if (!portalUser || portalUser.role !== 'CLIENT') {
    throw new Error('Client account required');
  }

  const client = await db.client.findUnique({
    where: { userId: portalUser.id },
    include: {
      careRecipients: {
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      },
    },
  });

  if (!client) {
    throw new Error('Client profile not found');
  }

  return client;
}

export async function ensureCurrentClientPrimaryCareRecipient() {
  const client = await getCurrentClientEntity();
  if (client.careRecipients.length > 0) {
    return;
  }

  await db.careRecipient.create({
    data: {
      clientId: client.id,
      fullName: client.careRecipientName || 'Care Recipient',
      relationship: client.relationship,
      dateOfBirth: client.careRecipientDOB,
      isPrimary: true,
    },
  });

  revalidatePath('/client/care-recipients');
}

export async function addCurrentClientCareRecipient(input: z.infer<typeof addCareRecipientSchema>) {
  const data = addCareRecipientSchema.parse(input);
  const client = await getCurrentClientEntity();

  if (client.type === 'SELF' && client.careRecipients.length >= 1) {
    throw new Error('Self accounts can only have one care recipient.');
  }

  await db.careRecipient.create({
    data: {
      clientId: client.id,
      fullName: data.fullName,
      relationship: data.relationship?.trim() || null,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      isPrimary: client.careRecipients.length === 0,
    },
  });

  revalidatePath('/client/care-recipients');
}

export async function removeCurrentClientCareRecipient(careRecipientId: string) {
  const client = await getCurrentClientEntity();
  const target = client.careRecipients.find((recipient) => recipient.id === careRecipientId);

  if (!target) {
    throw new Error('Care recipient not found');
  }

  if (client.type === 'SELF') {
    throw new Error('Self accounts cannot remove their only care recipient.');
  }

  await db.careRecipient.delete({ where: { id: target.id } });

  const remaining = await db.careRecipient.findMany({
    where: { clientId: client.id },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
  });

  if (remaining.length > 0 && !remaining.some((recipient) => recipient.isPrimary)) {
    await db.careRecipient.update({
      where: { id: remaining[0].id },
      data: { isPrimary: true },
    });
  }

  revalidatePath('/client/care-recipients');
}
