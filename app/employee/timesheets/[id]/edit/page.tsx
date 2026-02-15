import { db } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import { format } from 'date-fns';
import { serialize } from '@/lib/utils';
import { getClerkUserId } from '@/lib/auth';
import { TimesheetForm } from '../../timesheet-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IconArrowLeft } from '@tabler/icons-react';

export const metadata = {
  title: 'Edit Timesheet',
  description: 'Edit your weekly timesheet',
};

interface EditTimesheetPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTimesheetPage({ params }: EditTimesheetPageProps) {
  const { id } = await params;
  
  // Get current user's clerk ID
  const clerkId = await getClerkUserId();
  if (!clerkId) {
    redirect('/sign-in');
  }

  const timesheet = await db.timesheet.findUnique({
    where: { id },
    include: {
      worker: {
        include: {
          user: true,
        },
      },
      entries: {
        orderBy: { date: 'asc' },
      },
    },
  });

  if (!timesheet) {
    notFound();
  }

  // Verify ownership - only allow editing your own timesheet
  if (timesheet.worker.user.clerkId !== clerkId) {
    redirect('/employee/timesheets');
  }

  // Check if timesheet can be edited
  if (timesheet.status !== 'DRAFT' && timesheet.status !== 'REJECTED') {
    redirect('/employee/timesheets');
  }

  const serializedTimesheet = serialize({
    id: timesheet.id,
    status: timesheet.status,
    entries: timesheet.entries.map((entry) => ({
      id: entry.id,
      date: format(entry.date, 'yyyy-MM-dd'),
      clientName: entry.clientName,
      shiftId: entry.shiftId || undefined,
      startTime: entry.startTime,
      endTime: entry.endTime,
      breakMinutes: entry.breakMinutes,
      workDescription: entry.workDescription || '',
    })),
  });

  const weekStartingStr = format(timesheet.weekStarting, 'yyyy-MM-dd');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/employee/timesheets">
            <IconArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Timesheet</h1>
          <p className="text-muted-foreground">
            Update your hours for the week of {format(timesheet.weekStarting, 'MMMM d, yyyy')}
          </p>
        </div>
      </div>

      <TimesheetForm
        workerId={timesheet.workerId}
        weekStarting={weekStartingStr}
        existingTimesheet={serializedTimesheet}
      />
    </div>
  );
}
