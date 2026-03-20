import { db } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { JobsTable } from './jobs-table';

export const metadata = {
  title: 'Jobs',
  description: 'Manage job postings',
};

export default async function JobsPage() {
  const jobs = await db.job.findMany({
    orderBy: { postedAt: 'desc' },
    include: {
      _count: {
        select: { applications: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">
            Create and manage job postings
          </p>
        </div>
        <Link href="/admin/jobs/new">
          <Button className="gap-2">
            <Plus className="size-4" />
            Create Job
          </Button>
        </Link>
      </div>

      <JobsTable jobs={jobs} />
    </div>
  );
}
