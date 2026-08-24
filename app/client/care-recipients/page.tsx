import { db } from '@/lib/db';
import { getCurrentClient } from '@/lib/auth';
import { ClientSetupNeeded } from '@/components/client/client-setup-needed';
import { ensureCurrentClientPrimaryCareRecipient } from '@/app/actions/care-recipients';
import { CareRecipientsManager } from './care-recipients-manager';

export const metadata = {
  title: 'Care Recipients',
  description: 'Manage the people receiving care under your account',
};

export default async function ClientCareRecipientsPage() {
  const currentClient = await getCurrentClient();

  if (!currentClient) {
    return <ClientSetupNeeded />;
  }

  await ensureCurrentClientPrimaryCareRecipient();

  const client = await db.client.findUnique({
    where: { id: currentClient.id },
    include: {
      careRecipients: {
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      },
    },
  });

  if (!client) {
    return <ClientSetupNeeded />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Care Recipients</h1>
        <p className="text-muted-foreground">
          Add or manage recipients under this account.
        </p>
      </div>

      <CareRecipientsManager
        clientType={client.type}
        careRecipients={client.careRecipients.map((recipient) => ({
          id: recipient.id,
          fullName: recipient.fullName,
          relationship: recipient.relationship,
          dateOfBirth: recipient.dateOfBirth ? recipient.dateOfBirth.toISOString() : null,
          isPrimary: recipient.isPrimary,
        }))}
      />
    </div>
  );
}
