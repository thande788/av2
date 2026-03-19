'use client';

import { useRouter } from 'next/navigation';
import { DataTable, type Column, type TableFilter, type BulkAction } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { formatDateUS } from '@/lib/utils';
import { bulkUpdateApplicationStatus } from '@/app/actions/audit-log';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import type { Application, Job, ApplicationStatus } from '@prisma/client';

type ApplicationWithJob = Application & {
  job: Pick<Job, 'title' | 'department'>;
};

const statusColors: Record<ApplicationStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  REVIEWING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  INTERVIEW: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  OFFERED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  HIRED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  WITHDRAWN: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

const columns: Column<ApplicationWithJob>[] = [
  {
    key: 'name',
    header: 'Applicant',
    mobileTitle: true,
    render: (app) => (
      <div>
        <p className="font-medium">{app.firstName} {app.lastName}</p>
        <p className="text-sm text-muted-foreground">{app.email}</p>
      </div>
    ),
  },
  {
    key: 'job.title',
    header: 'Position',
    render: (app) => (
      <div>
        <p>{app.job.title}</p>
        <p className="text-sm text-muted-foreground capitalize">
          {app.job.department.toLowerCase().replace('_', ' ')}
        </p>
      </div>
    ),
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
    key: 'submittedAt',
    header: 'Submitted',
    sortable: true,
    hideOnMobile: true,
    render: (app) => formatDateUS(app.submittedAt),
  },
];

export function ApplicationsTable({
  applications,
}: {
  applications: ApplicationWithJob[];
}) {
  const router = useRouter();

  const filters: TableFilter[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'Pending', value: 'PENDING' },
        { label: 'Reviewing', value: 'REVIEWING' },
        { label: 'Interview', value: 'INTERVIEW' },
        { label: 'Offered', value: 'OFFERED' },
        { label: 'Hired', value: 'HIRED' },
        { label: 'Rejected', value: 'REJECTED' },
        { label: 'Withdrawn', value: 'WITHDRAWN' },
      ],
    },
  ];

  const bulkActions: BulkAction<ApplicationWithJob>[] = [
    {
      label: 'Mark Reviewing',
      icon: RefreshCw,
      action: async (ids) => {
        try {
          await bulkUpdateApplicationStatus(ids, 'REVIEWING');
          toast.success(`${ids.length} application(s) updated to Reviewing`);
          router.refresh();
        } catch {
          toast.error('Failed to update applications');
        }
      },
    },
  ];

  return (
    <DataTable
      data={applications}
      columns={columns}
      searchKeys={['firstName', 'lastName', 'email']}
      onRowClick={(app) => router.push(`/admin/applications/${app.id}`)}
      filters={filters}
      selectable
      bulkActions={bulkActions}
      exportable
      exportFilename="applications"
      emptyMessage="No applications found."
    />
  );
}
