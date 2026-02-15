import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Users } from 'lucide-react';
import { JobApplicationsTable } from './job-applications-table';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await db.job.findUnique({
    where: { id },
    select: { title: true },
  });

  return {
    title: job ? `Applications for ${job.title}` : 'Job Applications',
    description: 'View applications for this job posting',
  };
}

export default async function JobApplicationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const job = await db.job.findUnique({
    where: { id },
    include: {
      applications: {
        orderBy: { submittedAt: 'desc' },
      },
      _count: {
        select: { applications: true },
      },
    },
  });

  if (!job) {
    notFound();
  }

  // Calculate status counts
  const statusCounts = job.applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {/* Back link and header */}
      <div>
        <Link
          href="/admin/jobs"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="size-4 mr-1" />
          Back to Jobs
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Applications for {job.title}
            </h1>
            <p className="mt-1 text-muted-foreground capitalize">
              {job.department.toLowerCase().replace('_', ' ')} &middot;{' '}
              {job.type.toLowerCase().replace('_', ' ')} &middot; {job.location}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
            <Users className="size-5 text-muted-foreground" />
            <span className="text-lg font-semibold">{job._count.applications}</span>
            <span className="text-sm text-muted-foreground">total</span>
          </div>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <StatusCard label="Pending" count={statusCounts.PENDING || 0} variant="warning" />
        <StatusCard label="Reviewing" count={statusCounts.REVIEWING || 0} variant="info" />
        <StatusCard label="Interview" count={statusCounts.INTERVIEW || 0} variant="purple" />
        <StatusCard label="Offered" count={statusCounts.OFFERED || 0} variant="success" />
        <StatusCard label="Hired" count={statusCounts.HIRED || 0} variant="emerald" />
        <StatusCard label="Rejected" count={statusCounts.REJECTED || 0} variant="danger" />
        <StatusCard label="Withdrawn" count={statusCounts.WITHDRAWN || 0} variant="muted" />
      </div>

      {/* Applications table */}
      <JobApplicationsTable applications={job.applications} />
    </div>
  );
}

function StatusCard({
  label,
  count,
  variant,
}: {
  label: string;
  count: number;
  variant: 'warning' | 'info' | 'purple' | 'success' | 'emerald' | 'danger' | 'muted';
}) {
  const styles = {
    warning: 'border-yellow-500/40 bg-yellow-500/5 text-yellow-600 dark:text-yellow-500',
    info: 'border-blue-500/40 bg-blue-500/5 text-blue-600 dark:text-blue-500',
    purple: 'border-purple-500/40 bg-purple-500/5 text-purple-600 dark:text-purple-500',
    success: 'border-green-500/40 bg-green-500/5 text-green-600 dark:text-green-500',
    emerald: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-600 dark:text-emerald-500',
    danger: 'border-red-500/40 bg-red-500/5 text-red-600 dark:text-red-500',
    muted: 'border-border/50 bg-muted/30 text-muted-foreground',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-3 ${styles[variant]}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative text-center">
        <p className="text-xl font-bold">{count}</p>
        <p className="text-xs font-medium opacity-80">{label}</p>
      </div>
    </div>
  );
}
