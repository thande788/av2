interface ClientProfileCompletionInput {
  type?: 'SELF' | 'FAMILY' | 'FACILITY';
  careRecipientName: string | null;
  careRecipientDOB: Date | string | null;
  billingEmail?: string | null;
  relationship: string | null;
  street: string;
  city: string;
  state: string;
  zip: string;
  emergencyName: string | null;
  emergencyPhone: string | null;
  user: {
    phone: string | null;
  };
}

const PROFILE_SCORE_TOTAL = 10;

export function getMissingClientProfileFields(client: ClientProfileCompletionInput) {
  const missing: string[] = [];
  if (!client.user.phone) missing.push('phone');
  if (client.type === 'FAMILY' && !client.relationship) missing.push('relationship');
  if (!client.careRecipientName) missing.push('careRecipientName');
  if (!client.street || client.street === 'Address pending') missing.push('street');
  if (!client.city) missing.push('city');
  if (!client.state) missing.push('state');
  if (!client.zip) missing.push('zip');
  if (!client.emergencyName) missing.push('emergencyName');
  if (!client.emergencyPhone) missing.push('emergencyPhone');
  return missing;
}

export function getClientProfileCompletion(
  client: ClientProfileCompletionInput,
  viewer: 'client' | 'admin' = 'client'
) {
  const missingFields = getMissingClientProfileFields(client);
  if (viewer === 'admin') {
    if (!client.careRecipientDOB) missingFields.push('careRecipientDOB');
    if (!client.billingEmail) missingFields.push('billingEmail');
  }

  const totalFields = PROFILE_SCORE_TOTAL;
  const completedFields = Math.max(0, totalFields - missingFields.length);
  const percentComplete = Math.round((completedFields / totalFields) * 100);

  return {
    missingFields,
    totalFields,
    completedFields,
    percentComplete,
    profileStatus: missingFields.length > 0 ? 'INCOMPLETE' : 'COMPLETE',
  } as const;
}
