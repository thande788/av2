import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { ClientEditForm } from '../client-edit-form';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Edit Client',
  description: 'Update client profile and care details',
};

export default async function EditClientPage({ params }: Props) {
  const { id } = await params;

  const client = await db.client.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });

  if (!client) {
    notFound();
  }

  return (
    <ClientEditForm
      client={{
        id: client.id,
        type: client.type,
        relationship: client.relationship,
        careRecipientName: client.careRecipientName,
        careRecipientDOB: client.careRecipientDOB
          ? client.careRecipientDOB.toISOString().slice(0, 10)
          : null,
        serviceLevel: client.serviceLevel,
        street: client.street,
        city: client.city,
        state: client.state,
        zip: client.zip,
        emergencyName: client.emergencyName,
        emergencyPhone: client.emergencyPhone,
        emergencyRelation: client.emergencyRelation,
        billingRate: Number(client.billingRate),
        billingEmail: client.billingEmail,
        preferredTimes: client.preferredTimes,
        specialNeeds: client.specialNeeds,
        careNotes: client.careNotes,
        accessNotes: client.accessNotes,
        user: {
          firstName: client.user.firstName,
          lastName: client.user.lastName,
          email: client.user.email,
          phone: client.user.phone,
          status: client.user.status,
        },
      }}
    />
  );
}
