'use client';

import { useRouter } from 'next/navigation';
import { DataTable, type Column, type TableFilter } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { formatDateUS } from '@/lib/utils';
import type { AuditLog } from '@prisma/client';

const entityRoutes: Record<string, (id: string) => string> = {
  Application: (id) => `/admin/applications/${id}`,
  ContactSubmission: (id) => `/admin/contacts?highlight=${id}`,
  ServiceInquiry: (id) => `/admin/inquiries?highlight=${id}`,
  Job: (id) => `/admin/jobs/${id}/edit`,
};

const actionColors: Record<string, string> = {
  STATUS_CHANGE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  BULK_STATUS_UPDATE: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  BULK_MARK_READ: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  BULK_DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  EMAIL_SENT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  CREATED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  UPDATED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  DELETED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const columns: Column<AuditLog>[] = [
  {
    key: 'createdAt',
    header: 'Time',
    sortable: true,
    mobileTitle: true,
    render: (log) => (
      <span className="text-sm">{formatDateUS(log.createdAt, 'datetime')}</span>
    ),
  },
  {
    key: 'userName',
    header: 'User',
    render: (log) => (
      <span className="font-medium">{log.userName || 'System'}</span>
    ),
  },
  {
    key: 'action',
    header: 'Action',
    sortable: true,
    render: (log) => (
      <Badge
        className={actionColors[log.action] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}
        variant="secondary"
      >
        {log.action.replace(/_/g, ' ')}
      </Badge>
    ),
  },
  {
    key: 'entity',
    header: 'Entity',
    sortable: true,
    render: (log) => (
      <Badge variant="outline">{log.entity}</Badge>
    ),
  },
  {
    key: 'details',
    header: 'Details',
    hideOnMobile: true,
    className: 'max-w-xs',
    render: (log) => {
      if (!log.details) return '-';
      const details = log.details as Record<string, unknown>;
      const summary = Object.entries(details)
        .filter(([key]) => key !== 'ids')
        .map(([key, val]) => `${key}: ${val}`)
        .join(', ');
      return (
        <span className="text-sm text-muted-foreground truncate block max-w-xs">
          {summary || '-'}
        </span>
      );
    },
  },
];

export function AuditLogTable({
  logs,
  entities,
  actions,
}: {
  logs: AuditLog[];
  entities: string[];
  actions: string[];
}) {
  const filters: TableFilter[] = [
    {
      key: 'entity',
      label: 'Entity',
      options: entities.map((e) => ({ label: e, value: e })),
    },
    {
      key: 'action',
      label: 'Action',
      options: actions.map((a) => ({ label: a.replace(/_/g, ' '), value: a })),
    },
  ];

  const router = useRouter();

  const handleRowClick = (log: AuditLog) => {
    const routeFn = entityRoutes[log.entity];
    if (routeFn) {
      router.push(routeFn(log.entityId));
    }
  };

  return (
    <DataTable
      data={logs}
      columns={columns}
      searchKeys={['userName', 'action', 'entity']}
      filters={filters}
      exportable
      exportFilename="audit-log"
      emptyMessage="No audit log entries yet."
      onRowClick={handleRowClick}
    />
  );
}
