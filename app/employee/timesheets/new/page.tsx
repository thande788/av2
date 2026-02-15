import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { startOfWeek, format, parseISO } from 'date-fns';
import { TimesheetForm } from '../timesheet-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IconArrowLeft } from '@tabler/icons-react';

export const metadata = {
  title: 'New Timesheet',
  description: 'Create a new weekly timesheet',
};

interface NewTimesheetPageProps {
  searchParams: Promise<{ week?: string }>;
}

export default async function NewTimesheetPage({ searchParams }: NewTimesheetPageProps) {
  const params = await searchParams;
  
  // In real app, get worker ID from auth session
  // For demo, we'll use the first active worker
  const demoWorker = await db.worker.findFirst({
    where: {
      user: {
        status: 'ACTIVE',
      },
    },
  });

  if (!demoWorker) {
    redirect('/employee/timesheets');
  }

  // Get week starting date (default to current week's Monday)
  let weekStarting: Date;
  if (params.week) {
    try {
      weekStarting = startOfWeek(parseISO(params.week), { weekStartsOn: 1 });
    } catch {
      weekStarting = startOfWeek(new Date(), { weekStartsOn: 1 });
    }
  } else {
    weekStarting = startOfWeek(new Date(), { weekStartsOn: 1 });
  }

  const weekStartingStr = format(weekStarting, 'yyyy-MM-dd');

  // Check if timesheet already exists for this week
  const existingTimesheet = await db.timesheet.findUnique({
    where: {
      workerId_weekStarting: {
        workerId: demoWorker.id,
        weekStarting,
      },
    },
  });

  if (existingTimesheet) {
    // Redirect to edit page
    redirect(`/employee/timesheets/${existingTimesheet.id}/edit`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/employee/timesheets">
            <IconArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Timesheet</h1>
          <p className="text-muted-foreground">Enter your hours for the week</p>
        </div>
      </div>

      <TimesheetForm 
        workerId={demoWorker.id} 
        weekStarting={weekStartingStr} 
      />
    </div>
  );
}
