'use client';

import { useRouter } from 'next/navigation';
import { DataTable, type Column } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import type {
  CareShift,
  ShiftStatus,
  ShiftBooking,
  Worker,
  Client,
  PortalUser,
} from '@prisma/client';

type ShiftWithRelations = CareShift & {
  client: Client & {
    user: PortalUser;
  };
  bookings: (ShiftBooking & {
    worker: Worker & {
      user: PortalUser;
    };
  })[];
};

const statusColors: Record<ShiftStatus, string> = {
  OPEN: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  PENDING_BOOK: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  BOOKED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  IN_PROGRESS: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  COMPLETED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  NO_SHOW: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const columns: Column<ShiftWithRelations>[] = [
  {
    key: 'date',
    header: 'Date & Time',
    sortable: true,
    render: (shift) => (
      <div>
        <p className="font-medium">
          {new Date(shift.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </p>
        <p className="text-sm text-muted-foreground">
          {shift.startTime} - {shift.endTime}
        </p>
      </div>
    ),
  },
  {
    key: 'client',
    header: 'Client',
    render: (shift) => (
      <div>
        <p className="font-medium">
          {shift.client.user.firstName} {shift.client.user.lastName}
        </p>
        <p className="text-sm text-muted-foreground">{shift.serviceType}</p>
      </div>
    ),
  },
  {
    key: 'worker',
    header: 'Assigned Worker',
    render: (shift) => {
      const confirmedBooking = shift.bookings.find((b) => b.status === 'CONFIRMED');
      if (confirmedBooking) {
        return (
          <span className="font-medium">
            {confirmedBooking.worker.user.firstName} {confirmedBooking.worker.user.lastName}
          </span>
        );
      }
      return <span className="text-muted-foreground">Unassigned</span>;
    },
  },
  {
    key: 'duration',
    header: 'Hours',
    render: (shift) => (
      <span>{Number(shift.duration).toFixed(1)} hrs</span>
    ),
  },
  {
    key: 'clientRate',
    header: 'Rate',
    render: (shift) => (
      <span>${Number(shift.clientRate).toFixed(2)}/hr</span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (shift) => (
      <Badge className={statusColors[shift.status]}>
        {shift.status.replace('_', ' ')}
      </Badge>
    ),
  },
];

export function ShiftsTable({
  shifts,
}: {
  shifts: ShiftWithRelations[];
}) {
  const router = useRouter();

  return (
    <DataTable
      data={shifts}
      columns={columns}
      searchKeys={['client.user.firstName', 'client.user.lastName', 'serviceType']}
      onRowClick={(shift) => router.push(`/admin/shifts/${shift.id}`)}
      emptyMessage="No shifts found."
    />
  );
}
