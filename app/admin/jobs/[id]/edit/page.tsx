import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { JobForm } from '../../job-form';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata = {
  title: 'Edit Job | Admin Dashboard',
  description: 'Edit job posting',
};

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const job = await db.job.findUnique({
    where: { id },
  });

  if (!job) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link 
          href="/admin/jobs" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="size-4 mr-1" />
          Back to Jobs
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit Job</h1>
        <p className="text-muted-foreground">
          Update the job posting details
        </p>
      </div>

      <JobForm job={job} mode="edit" />
    </div>
  );
}
