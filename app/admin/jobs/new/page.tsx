import { JobForm } from '../job-form';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata = {
  title: 'Create Job | Admin Dashboard',
  description: 'Create a new job posting',
};

export default function NewJobPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Create Job</h1>
        <p className="text-muted-foreground">
          Add a new job posting to your careers page
        </p>
      </div>

      <JobForm mode="create" />
    </div>
  );
}
