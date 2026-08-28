import { db } from '@/lib/db';
import { serialize } from '@/lib/utils';
import { getServiceTypeOptions } from '@/lib/service-types';
import { CreateShiftForm } from '@/components/admin/create-shift-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IconArrowLeft } from '@tabler/icons-react';

export const metadata = {
  title: 'Create Shift',
  description: 'Create a new care shift',
};

export default async function CreateShiftPage() {
  // Fetch all active clients for the dropdown
  const clients = await db.client.findMany({
    where: {
      user: {
        status: 'ACTIVE',
      },
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      careRecipients: {
        select: {
          id: true,
          fullName: true,
          isPrimary: true,
        },
        orderBy: [
          { isPrimary: 'desc' },
          { fullName: 'asc' },
        ],
      },
    },
    orderBy: {
      user: {
        lastName: 'asc',
      },
    },
  });

  const serializedClients = serialize(clients).map((client) => ({
    id: client.id,
    careRecipientName: client.careRecipientName,
    careRecipients: client.careRecipients,
    billingRate: Number(client.billingRate),
    serviceLevel: client.serviceLevel,
    city: client.city,
    user: client.user,
  }));

  const serviceTypes = await getServiceTypeOptions();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/shifts">
            <IconArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create New Shift</h1>
          <p className="text-muted-foreground">
            Schedule a new care shift for a client
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <CreateShiftForm clients={serializedClients} serviceTypes={serviceTypes} />
      </div>
    </div>
  );
}
