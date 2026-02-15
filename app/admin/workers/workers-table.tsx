'use client';

import { useRouter } from 'next/navigation';
import { DataTable, type Column } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import type { Worker, PortalUser, UserStatus, ComplianceStatus } from '@prisma/client';

type WorkerWithUser = Worker & {
  user: PortalUser;
};

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

  return (
    <DataTable
      data={workers}
      columns={columns}
      searchKeys={['user.firstName', 'user.lastName', 'user.email', 'employeeId']}
      onRowClick={(worker) => router.push(`/admin/workers/${worker.id}`)}
      emptyMessage="No workers found."
    />
  );
}
