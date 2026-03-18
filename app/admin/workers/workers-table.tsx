'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { IconCheck, IconX, IconLoader2 } from '@tabler/icons-react';
import { DataTable, type Column } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { approveWorker, rejectWorker } from '@/app/actions/workers';
import type { Worker, PortalUser, UserStatus, ComplianceStatus } from '@prisma/client';
import type { Serialized } from '@/lib/utils';

type WorkerWithUser = Serialized<Worker & {
  user: PortalUser;
}>;

const statusColors: Record<UserStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  TERMINATED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const complianceColors: Record<ComplianceStatus, string> = {
  COMPLIANT: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  PENDING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  INCOMPLETE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  EXPIRED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const columns: Column<WorkerWithUser>[] = [
  {
    key: 'name',
    header: 'Worker',
    mobileTitle: true,
    render: (worker) => (
      <div>
        <p className="font-medium">
          {worker.user.firstName} {worker.user.lastName}
        </p>
        <p className="text-sm text-muted-foreground">{worker.user.email}</p>
      </div>
    ),
  },
  {
    key: 'employeeId',
    header: 'Employee ID',
    hideOnMobile: true,
    render: (worker) => (
      <span className="font-mono text-sm">
        {worker.employeeId || '—'}
      </span>
    ),
  },
  {
    key: 'skills',
    header: 'Skills',
    hideOnMobile: true,
    render: (worker) => (
      <div className="flex flex-wrap gap-1 max-w-xs">
        {worker.skills.slice(0, 3).map((skill) => (
          <Badge key={skill} variant="outline" className="text-xs">
            {skill}
          </Badge>
        ))}
        {worker.skills.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{worker.skills.length - 3}
          </Badge>
        )}
      </div>
    ),
  },
  {
    key: 'complianceStatus',
    header: 'Compliance',
    sortable: true,
    render: (worker) => (
      <Badge className={complianceColors[worker.complianceStatus]} variant="secondary">
        {worker.complianceStatus}
      </Badge>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (worker) => (
      <Badge className={statusColors[worker.user.status]} variant="secondary">
        {worker.user.status}
      </Badge>
    ),
  },
  {
    key: 'location',
    header: 'Location',
    render: (worker) => (
      <span className="text-sm">
        {worker.city && worker.state ? `${worker.city}, ${worker.state}` : '—'}
      </span>
    ),
  },
];

export function WorkersTable({
  workers,
}: {
  workers: WorkerWithUser[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  const handleApprove = async (e: React.MouseEvent, workerId: string) => {
    e.stopPropagation();
    setLoadingId(workerId);
    const result = await approveWorker(workerId);
    setLoadingId(null);
    if (result.success) router.refresh();
  };

  const handleReject = async (e: React.MouseEvent, workerId: string) => {
    e.stopPropagation();
    setLoadingId(workerId);
    const result = await rejectWorker(workerId);
    setLoadingId(null);
    if (result.success) router.refresh();
  };

  const columnsWithActions: Column<WorkerWithUser>[] = [
    ...columns,
    {
      key: 'actions',
      header: 'Actions',
      render: (worker) => {
        if (worker.user.status !== 'PENDING') return null;
        const isLoading = loadingId === worker.id;
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950"
              onClick={(e) => handleApprove(e, worker.id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <IconLoader2 className="mr-1 size-3.5 animate-spin" />
              ) : (
                <IconCheck className="mr-1 size-3.5" />
              )}
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={(e) => handleReject(e, worker.id)}
              disabled={isLoading}
            >
              <IconX className="mr-1 size-3.5" />
              Reject
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      data={workers}
      columns={columnsWithActions}
      searchKeys={['user.firstName', 'user.lastName', 'user.email', 'employeeId']}
      onRowClick={(worker) => router.push(`/admin/workers/${worker.id}`)}
      emptyMessage="No workers found."
    />
  );
}
