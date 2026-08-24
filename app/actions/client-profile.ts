'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';

const phoneSchema = z.string().trim().max(32).optional().nullable();

const currentProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  phone: phoneSchema,
  relationship: z.string().trim().max(120).optional().nullable(),
  type: z.enum(['SELF', 'FAMILY', 'FACILITY']),
});

const currentCareSchema = z.object({
  careRecipientName: z.string().trim().max(160).optional().nullable(),
  careRecipientDOB: z.string().trim().optional().nullable(),
  serviceLevel: z.enum(['COMPANION', 'PERSONAL', 'SKILLED', 'LIVE_IN']),
  street: z.string().trim().min(1).max(160),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(2).max(2),
  zip: z.string().trim().min(5).max(10),
  emergencyName: z.string().trim().max(120).optional().nullable(),
  emergencyPhone: phoneSchema,
  emergencyRelation: z.string().trim().max(80).optional().nullable(),
  billingEmail: z.string().trim().email().optional().nullable(),
  preferredTimes: z.array(z.string().trim().min(1).max(40)).max(12).optional(),
  specialNeeds: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  careNotes: z.string().trim().max(4000).optional().nullable(),
  accessNotes: z.string().trim().max(4000).optional().nullable(),
});

const onboardingBasicsSchema = z.object({
  type: z.enum(['SELF', 'FAMILY', 'FACILITY']),
  phone: phoneSchema,
  relationship: z.string().trim().max(120).optional().nullable(),
  careRecipientName: z.string().trim().max(160).optional().nullable(),
  careRecipientDOB: z.string().trim().optional().nullable(),
  street: z.string().trim().min(1).max(160),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(2).max(2),
  zip: z.string().trim().min(5).max(10),
  emergencyName: z.string().trim().max(120).optional().nullable(),
  emergencyPhone: phoneSchema,
  emergencyRelation: z.string().trim().max(80).optional().nullable(),
});

const adminUpdateSchema = z.object({
  clientId: z.string().min(1),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  phone: phoneSchema,
  status: z.enum(['PENDING', 'ACTIVE', 'INACTIVE', 'TERMINATED']),
  type: z.enum(['SELF', 'FAMILY', 'FACILITY']),
  relationship: z.string().trim().max(120).optional().nullable(),
  careRecipientName: z.string().trim().max(160).optional().nullable(),
  careRecipientDOB: z.string().trim().optional().nullable(),
  serviceLevel: z.enum(['COMPANION', 'PERSONAL', 'SKILLED', 'LIVE_IN']),
  street: z.string().trim().min(1).max(160),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(2).max(2),
  zip: z.string().trim().min(5).max(10),
  emergencyName: z.string().trim().max(120).optional().nullable(),
  emergencyPhone: phoneSchema,
  emergencyRelation: z.string().trim().max(80).optional().nullable(),
  billingRate: z.number().min(0).max(1000),
  billingEmail: z.string().trim().email().optional().nullable(),
  preferredTimes: z.array(z.string().trim().min(1).max(40)).max(12).optional(),
  specialNeeds: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  careNotes: z.string().trim().max(4000).optional().nullable(),
  accessNotes: z.string().trim().max(4000).optional().nullable(),
});

async function getCurrentClientContext() {
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
    select: { id: true, userId: true },
  });

  if (!client) {
    throw new Error('Client profile not found');
  }

  return { portalUser, client };
}

function normalizeOptional(value?: string | null) {
  return value?.trim() ? value.trim() : null;
}

function normalizeStringArray(values?: string[]) {
  if (!values) return [];
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 20);
}

async function upsertPrimaryCareRecipientForClient(params: {
  clientId: string;
  fullName: string | null;
  relationship: string | null;
  dateOfBirth: Date | null;
}) {
  const existingPrimary = await db.careRecipient.findFirst({
    where: { clientId: params.clientId, isPrimary: true },
    select: { id: true },
  });

  const fullName = params.fullName?.trim() || 'Care Recipient';

  if (existingPrimary) {
    await db.careRecipient.update({
      where: { id: existingPrimary.id },
      data: {
        fullName,
        relationship: params.relationship,
        dateOfBirth: params.dateOfBirth,
      },
    });
    return;
  }

  await db.careRecipient.create({
    data: {
      clientId: params.clientId,
      fullName,
      relationship: params.relationship,
      dateOfBirth: params.dateOfBirth,
      isPrimary: true,
    },
  });
}

export async function updateCurrentClientProfile(input: z.infer<typeof currentProfileSchema>) {
  const data = currentProfileSchema.parse(input);
  const { portalUser, client } = await getCurrentClientContext();

  if (data.type === 'SELF') {
    const recipientCount = await db.careRecipient.count({ where: { clientId: client.id } });
    if (recipientCount > 1) {
      throw new Error('Self accounts can only have one care recipient.');
    }
  }

  await db.$transaction([
    db.portalUser.update({
      where: { id: portalUser.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: normalizeOptional(data.phone),
      },
    }),
    db.client.update({
      where: { id: client.id },
      data: {
        type: data.type,
        relationship: normalizeOptional(data.relationship),
      },
    }),
  ]);

  revalidatePath('/client', 'layout');
  revalidatePath('/client/settings');
}

export async function updateCurrentClientCareInfo(input: z.infer<typeof currentCareSchema>) {
  const data = currentCareSchema.parse(input);
  const { client } = await getCurrentClientContext();

  await db.client.update({
    where: { id: client.id },
    data: {
      careRecipientName: normalizeOptional(data.careRecipientName),
      careRecipientDOB: data.careRecipientDOB ? new Date(data.careRecipientDOB) : null,
      serviceLevel: data.serviceLevel,
      street: data.street,
      city: data.city,
      state: data.state.toUpperCase(),
      zip: data.zip,
      emergencyName: normalizeOptional(data.emergencyName),
      emergencyPhone: normalizeOptional(data.emergencyPhone),
      emergencyRelation: normalizeOptional(data.emergencyRelation),
      billingEmail: normalizeOptional(data.billingEmail),
      preferredTimes: normalizeStringArray(data.preferredTimes),
      specialNeeds: normalizeStringArray(data.specialNeeds),
      careNotes: normalizeOptional(data.careNotes),
      accessNotes: normalizeOptional(data.accessNotes),
    },
  });

  await upsertPrimaryCareRecipientForClient({
    clientId: client.id,
    fullName: normalizeOptional(data.careRecipientName),
    relationship: null,
    dateOfBirth: data.careRecipientDOB ? new Date(data.careRecipientDOB) : null,
  });

  revalidatePath('/client', 'layout');
  revalidatePath('/client/settings');
}

export async function saveCurrentClientOnboardingBasics(input: z.infer<typeof onboardingBasicsSchema>) {
  const data = onboardingBasicsSchema.parse(input);
  const { portalUser, client } = await getCurrentClientContext();

  if (data.type === 'SELF') {
    const recipientCount = await db.careRecipient.count({ where: { clientId: client.id } });
    if (recipientCount > 1) {
      throw new Error('Self accounts can only have one care recipient.');
    }
  }

  await db.$transaction([
    db.portalUser.update({
      where: { id: portalUser.id },
      data: {
        phone: normalizeOptional(data.phone),
      },
    }),
    db.client.update({
      where: { id: client.id },
      data: {
        relationship: normalizeOptional(data.relationship),
        careRecipientName: normalizeOptional(data.careRecipientName),
        careRecipientDOB: data.careRecipientDOB ? new Date(data.careRecipientDOB) : null,
        street: data.street,
        city: data.city,
        state: data.state.toUpperCase(),
        zip: data.zip,
        emergencyName: normalizeOptional(data.emergencyName),
        emergencyPhone: normalizeOptional(data.emergencyPhone),
        emergencyRelation: normalizeOptional(data.emergencyRelation),
      },
    }),
  ]);

  await upsertPrimaryCareRecipientForClient({
    clientId: client.id,
    fullName: normalizeOptional(data.careRecipientName),
    relationship: normalizeOptional(data.relationship),
    dateOfBirth: data.careRecipientDOB ? new Date(data.careRecipientDOB) : null,
  });

  revalidatePath('/client', 'layout');
  revalidatePath('/client/settings');
}

export async function updateClientByAdmin(input: z.infer<typeof adminUpdateSchema>) {
  const data = adminUpdateSchema.parse(input);
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const actingUser = await db.portalUser.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!actingUser || (actingUser.role !== 'ADMIN' && actingUser.role !== 'MANAGER')) {
    throw new Error('Admin or manager access required');
  }

  const clientRecord = await db.client.findUnique({
    where: { id: data.clientId },
    select: { id: true, userId: true },
  });

  if (!clientRecord) {
    throw new Error('Client not found');
  }

  await db.$transaction([
    db.portalUser.update({
      where: { id: clientRecord.userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: normalizeOptional(data.phone),
        status: data.status,
      },
    }),
    db.client.update({
      where: { id: clientRecord.id },
      data: {
        type: data.type,
        relationship: normalizeOptional(data.relationship),
        careRecipientName: normalizeOptional(data.careRecipientName),
        careRecipientDOB: data.careRecipientDOB ? new Date(data.careRecipientDOB) : null,
        serviceLevel: data.serviceLevel,
        street: data.street,
        city: data.city,
        state: data.state.toUpperCase(),
        zip: data.zip,
        emergencyName: normalizeOptional(data.emergencyName),
        emergencyPhone: normalizeOptional(data.emergencyPhone),
        emergencyRelation: normalizeOptional(data.emergencyRelation),
        billingRate: data.billingRate,
        billingEmail: normalizeOptional(data.billingEmail),
        preferredTimes: normalizeStringArray(data.preferredTimes),
        specialNeeds: normalizeStringArray(data.specialNeeds),
        careNotes: normalizeOptional(data.careNotes),
        accessNotes: normalizeOptional(data.accessNotes),
      },
    }),
  ]);

  await upsertPrimaryCareRecipientForClient({
    clientId: clientRecord.id,
    fullName: normalizeOptional(data.careRecipientName),
    relationship: normalizeOptional(data.relationship),
    dateOfBirth: data.careRecipientDOB ? new Date(data.careRecipientDOB) : null,
  });

  revalidatePath('/admin/clients');
  revalidatePath(`/admin/clients/${data.clientId}`);
  revalidatePath(`/admin/clients/${data.clientId}/edit`);
}
