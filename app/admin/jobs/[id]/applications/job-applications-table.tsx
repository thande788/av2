'use client';

import { useRouter } from 'next/navigation';
import { DataTable, type Column } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { Application, ApplicationStatus } from '@prisma/client';

const statusColors: Record<ApplicationStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  REVIEWING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  INTERVIEW: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  OFFERED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  HIRED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  WITHDRAWN: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

const columns: Column<Application>[] = [
  {
    key: 'name',
    header: 'Applicant',
    mobileTitle: true,
    render: (app) => (
      <div>
        <p className="font-medium">
          {app.firstName} {app.lastName}
        </p>
        <p className="text-sm text-muted-foreground">{app.email}</p>
      </div>
    ),
  },
  {
    key: 'phone',
    header: 'Phone',
    hideOnMobile: true,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (app) => (
      <Badge className={statusColors[app.status]} variant="secondary">
        {app.status}
      </Badge>
    ),
  },
  {
    key: 'yearsExperience',
    header: 'Experience',
    sortable: true,
    hideOnMobile: true,
    render: (app) => `${app.yearsExperience} years`,
  },
  {
    key: 'hoursPerWeek',
    header: 'Availability',
    hideOnMobile: true,
    render: (app) => `${app.hoursPerWeek} hrs/week`,
  },
  {
    key: 'submittedAt',
    header: 'Submitted',
    sortable: true,
    render: (app) => format(app.submittedAt, 'MMM d, yyyy'),
  },
];

export function JobApplicationsTable({
  applications,
}: {
  applications: Application[];
}) {
  const router = useRouter();

  return (
    <DataTable
      data={applications}
      columns={columns}
      searchKeys={['firstName', 'lastName', 'email', 'phone']}
      onRowClick={(app) => router.push(`/admin/applications/${app.id}`)}
      emptyMessage="No applications for this job yet."
    />
  );
}
