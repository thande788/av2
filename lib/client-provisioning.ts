import { db } from '@/lib/db';

type ClientTypeValue = 'SELF' | 'FAMILY' | 'FACILITY';

function resolveClientType(value?: string | null): ClientTypeValue {
  if (value === 'SELF' || value === 'FAMILY' || value === 'FACILITY') {
    return value;
  }
  return 'FAMILY';
}

interface EnsureClientProfileInput {
  portalUserId: string;
  firstName: string;
  lastName: string;
  clientType?: string | null;
}

export async function ensureClientProfileForPortalUser({
  portalUserId,
  firstName,
  lastName,
  clientType,
}: EnsureClientProfileInput) {
  const existing = await db.client.findUnique({
    where: { userId: portalUserId },
    select: { id: true },
  });

  if (existing) {
    return existing;
  }

  const displayName = [firstName, lastName].filter(Boolean).join(' ').trim() || 'Client';
  const resolvedClientType = resolveClientType(clientType);

  return db.client.create({
    data: {
      userId: portalUserId,
      type: resolvedClientType,
      careRecipientName: displayName,
      relationship: resolvedClientType === 'SELF' ? 'Self' : null,
      serviceLevel: 'COMPANION',
      preferredTimes: [],
      specialNeeds: [],
      street: 'Address pending',
      city: 'Lowell',
      state: 'MA',
      zip: '01850',
      billingRate: 32,
      billingEmail: null,
      careNotes: null,
      accessNotes: null,
      careRecipients: {
        create: {
          fullName: displayName,
          relationship: resolvedClientType === 'SELF' ? 'Self' : null,
          isPrimary: true,
        },
      },
    },
    select: { id: true },
  });
}
