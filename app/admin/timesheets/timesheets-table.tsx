'use client';

import { useRouter } from 'next/navigation';
import { DataTable, type Column } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import type { Timesheet, TimesheetEntry, TimesheetStatus, Worker, PortalUser } from '@prisma/client';
import type { Serialized } from '@/lib/utils';

type TimesheetWithRelations = Serialized<Timesheet & {
  worker: Worker & {
    user: PortalUser;
  };
  entries: TimesheetEntry[];
}>;

const statusColors: Record<TimesheetStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  SUBMITTED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  PROCESSED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

const statusLabels: Record<TimesheetStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Pending Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  PROCESSED: 'Processed',
};

const columns: Column<TimesheetWithRelations>[] = [
  {
    key: 'worker',
    header: 'Worker',
    mobileTitle: true,
    render: (timesheet) => (
      <div>
        <p className="font-medium">
          {timesheet.worker.user.firstName} {timesheet.worker.user.lastName}
        </p>
        <p className="text-sm text-muted-foreground">
          {timesheet.worker.employeeId || 'No ID'}
        </p>
      </div>
    ),
  },
  {
    key: 'period',
    header: 'Period',
    sortable: true,
    render: (timesheet) => {
      const start = new Date(timesheet.weekStarting);
      const end = new Date(timesheet.weekEnding);
      return (
        <div>
          <p className="font-medium">
            {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
            {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="text-sm text-muted-foreground">
            {timesheet.entries.length} entries
          </p>
        </div>
      );
    },
  },
  {
    key: 'totalHours',
    header: 'Hours',
    hideOnMobile: true,
    render: (timesheet) => (
      <div>
        <p className="font-medium">{Number(timesheet.totalHours).toFixed(1)} hrs</p>
        {Number(timesheet.totalOvertime) > 0 && (
          <p className="text-sm text-orange-600 dark:text-orange-400">
            +{Number(timesheet.totalOvertime).toFixed(1)} OT
          </p>
        )}
      </div>
    ),
  },
  {
    key: 'submittedAt',
    header: 'Submitted',
    hideOnMobile: true,
    render: (timesheet) => {
      if (!timesheet.submittedAt) {
        return <span className="text-muted-foreground">Not submitted</span>;
      }
      return (
        <span className="text-sm">
          {new Date(timesheet.submittedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </span>
      );
    },
  },
  {
    key: 'status',
    header: 'Status',
    render: (timesheet) => (
      <Badge className={statusColors[timesheet.status as TimesheetStatus]}>
        {statusLabels[timesheet.status as TimesheetStatus]}
      </Badge>
    ),
  },
];

interface TimesheetsTableProps {
  timesheets: TimesheetWithRelations[];
}

export function TimesheetsTable({ timesheets }: TimesheetsTableProps) {
  const router = useRouter();

  const handleRowClick = (timesheet: TimesheetWithRelations) => {
    router.push(`/admin/timesheets/${timesheet.id}`);
  };

  return (
    <DataTable
      data={timesheets}
      columns={columns}
      searchable
      searchKeys={['worker.user.firstName', 'worker.user.lastName', 'worker.employeeId']}
      onRowClick={handleRowClick}
      emptyMessage="No timesheets found"
    />
  );
}
