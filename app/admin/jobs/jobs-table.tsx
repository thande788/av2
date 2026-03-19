'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Users,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleJobActive, deleteJob } from './actions';

type Job = {
  id: string;
  slug: string;
  title: string;
  department: string;
  type: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  salaryPeriod: string;
  isActive: boolean;
  postedAt: Date;
  _count: {
    applications: number;
  };
};

interface JobsTableProps {
  jobs: Job[];
}

const departmentLabels: Record<string, string> = {
  CAREGIVING: 'Caregiving',
  ADMINISTRATIVE: 'Administrative',
  NURSING: 'Nursing',
};

const typeLabels: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  PER_DIEM: 'Per Diem',
};

export function JobsTable({ jobs }: JobsTableProps) {
  const [isPending, startTransition] = useTransition();
  const [actionJobId, setActionJobId] = useState<string | null>(null);

  const handleToggleActive = (jobId: string) => {
    setActionJobId(jobId);
    startTransition(async () => {
      try {
        await toggleJobActive(jobId);
      } catch (error) {
        console.error('Failed to toggle job:', error);
      } finally {
        setActionJobId(null);
      }
    });
  };

  const handleDelete = (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This cannot be undone.')) {
      return;
    }
    setActionJobId(jobId);
    startTransition(async () => {
      try {
        await deleteJob(jobId);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to delete job');
      } finally {
        setActionJobId(null);
      }
    });
  };

  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
        <p className="text-muted-foreground mb-4">No jobs created yet.</p>
        <Link href="/admin/jobs/new">
          <Button>Create your first job</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Job</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Department</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Type</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Applications</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Posted</th>
              <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr
                key={job.slug}
                className={cn(
                  'border-b border-border/30 last:border-0 transition-colors',
                  isPending && actionJobId === job.id && 'opacity-50',
                  'hover:bg-accent/30'
                )}
              >
                <td className="py-4 px-6">
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-muted-foreground">{job.location}</p>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm">{departmentLabels[job.department]}</span>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm">{typeLabels[job.type]}</span>
                </td>
                <td className="py-4 px-6">
                  <Link
                    href={`/admin/jobs/${job.id}/applications`}
                    className="inline-flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
                  >
                    <Users className="size-4" />
                    {job._count.applications}
                  </Link>
                </td>
                <td className="py-4 px-6">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
                      job.isActive
                        ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {job.isActive ? (
                      <>
                        <Eye className="size-3" />
                        Active
                      </>
                    ) : (
                      <>
                        <EyeOff className="size-3" />
                        Inactive
                      </>
                    )}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(job.postedAt, { addSuffix: true })}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/careers/${job.slug}`} target="_blank">
                      <Button variant="ghost" size="icon" className="size-8" title="View on site">
                        <ExternalLink className="size-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/jobs/${job.id}/edit`}>
                      <Button variant="ghost" size="icon" className="size-8" title="Edit">
                        <Pencil className="size-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => handleToggleActive(job.id)}
                      disabled={isPending && actionJobId === job.id}
                      title={job.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {job.isActive ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(job.id)}
                      disabled={isPending && actionJobId === job.id}
                      title="Delete"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
