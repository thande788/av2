'use client';

import { useRouter } from 'next/navigation';
import { DataTable, type Column } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import type { Client, PortalUser, UserStatus, ServiceLevel, ClientType } from '@prisma/client';
import type { Serialized } from '@/lib/utils';

type ClientWithUser = Serialized<Client & {
  user: PortalUser;
}>;

const statusColors: Record<UserStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  TERMINATED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const serviceLevelColors: Record<ServiceLevel, string> = {
  COMPANION: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  PERSONAL: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  SKILLED: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  LIVE_IN: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
};

const clientTypeLabels: Record<ClientType, string> = {
  SELF: 'Self',
  FAMILY: 'Family',
  FACILITY: 'Facility',
};

const columns: Column<ClientWithUser>[] = [
  {
    key: 'name',
    header: 'Client',
    mobileTitle: true,
    render: (client) => (
      <div>
        <p className="font-medium">
          {client.user.firstName} {client.user.lastName}
        </p>
        <p className="text-sm text-muted-foreground">{client.user.email}</p>
      </div>
    ),
  },
  {
    key: 'careRecipient',
    header: 'Care Recipient',
    hideOnMobile: true,
    render: (client) => (
      <div>
        <p className="font-medium">
          {client.careRecipientName || 'Self'}
        </p>
        {client.relationship && (
          <p className="text-sm text-muted-foreground">{client.relationship}</p>
        )}
      </div>
    ),
  },
  {
    key: 'type',
    header: 'Type',
    sortable: true,
    hideOnMobile: true,
    render: (client) => (
      <span className="text-sm">
        {clientTypeLabels[client.type]}
      </span>
    ),
  },
  {
    key: 'serviceLevel',
    header: 'Service Level',
    sortable: true,
    render: (client) => (
      <Badge className={serviceLevelColors[client.serviceLevel]} variant="secondary">
        {client.serviceLevel}
      </Badge>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (client) => (
      <Badge className={statusColors[client.user.status]} variant="secondary">
        {client.user.status}
      </Badge>
    ),
  },
  {
    key: 'location',
    header: 'Location',
    hideOnMobile: true,
    render: (client) => (
      <span className="text-sm">
        {client.city && client.state ? `${client.city}, ${client.state}` : '—'}
      </span>
    ),
  },
  {
    key: 'billingRate',
    header: 'Rate',
    render: (client) => (
      <span className="font-mono text-sm">
        ${Number(client.billingRate).toFixed(2)}/hr
      </span>
    ),
  },
];

export function ClientsTable({
  clients,
}: {
  clients: ClientWithUser[];
}) {
  const router = useRouter();

  return (
    <DataTable
      data={clients}
      columns={columns}
      searchKeys={['user.firstName', 'user.lastName', 'user.email', 'careRecipientName']}
      onRowClick={(client) => router.push(`/admin/clients/${client.id}`)}
      emptyMessage="No clients found."
    />
  );
}
