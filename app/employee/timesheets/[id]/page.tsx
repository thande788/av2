import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  IconArrowLeft,
  IconClock,
  IconCalendarWeek,
  IconCheck,
  IconX,
} from '@tabler/icons-react';

export const metadata = {
  title: 'View Timesheet',
  description: 'View timesheet details',
};

interface TimesheetDetailPageProps {
  params: Promise<{ id: string }>;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
  SUBMITTED: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  APPROVED: 'bg-green-500/15 text-green-600 dark:text-green-400',
  REJECTED: 'bg-red-500/15 text-red-600 dark:text-red-400',
  PROCESSED: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  PROCESSED: 'Processed',
};

export default async function TimesheetDetailPage({ params }: TimesheetDetailPageProps) {
  const { id } = await params;

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

  // Group entries by day
  const entriesByDay = timesheet.entries.reduce((acc, entry) => {
    const dayKey = format(entry.date, 'yyyy-MM-dd');
    if (!acc[dayKey]) {
      acc[dayKey] = [];
    }
    acc[dayKey].push(entry);
    return acc;
  }, {} as Record<string, typeof timesheet.entries>);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/employee/timesheets">
            <IconArrowLeft className="size-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Timesheet Details</h1>
          <p className="text-muted-foreground">
            Week of {format(timesheet.weekStarting, 'MMMM d')} - {format(timesheet.weekEnding, 'MMMM d, yyyy')}
          </p>
        </div>
        <Badge className={statusColors[timesheet.status]}>
          {statusLabels[timesheet.status]}
        </Badge>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCalendarWeek className="size-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-2xl font-bold">{Number(timesheet.totalHours).toFixed(1)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Regular Hours</p>
              <p className="text-2xl font-bold">{Number(timesheet.totalRegular).toFixed(1)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overtime Hours</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {Number(timesheet.totalOvertime).toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Entries</p>
              <p className="text-2xl font-bold">{timesheet.entries.length}</p>
            </div>
          </div>

          {timesheet.status === 'APPROVED' && timesheet.approvedAt && (
            <div className="mt-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400">
              <IconCheck className="size-4" />
              Approved on {format(timesheet.approvedAt, 'MMMM d, yyyy')}
            </div>
          )}

          {timesheet.status === 'REJECTED' && timesheet.rejectedReason && (
            <div className="mt-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              <IconX className="size-4" />
              Rejected: {timesheet.rejectedReason}
            </div>
          )}

          {timesheet.submittedAt && (
            <p className="mt-4 text-sm text-muted-foreground">
              Submitted on {format(timesheet.submittedAt, 'MMMM d, yyyy \'at\' h:mm a')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Entries by Day */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Time Entries</h2>
        
        {Object.entries(entriesByDay).map(([dayKey, dayEntries]) => (
          <Card key={dayKey}>
            <CardHeader className="py-3">
              <CardTitle className="text-base font-medium">
                {format(new Date(dayKey), 'EEEE, MMMM d')}
              </CardTitle>
              <CardDescription>
                {dayEntries.reduce((sum, e) => sum + Number(e.hoursWorked), 0).toFixed(1)} hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dayEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start justify-between rounded-md border p-3"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{entry.clientName}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <IconClock className="size-3.5" />
                        {entry.startTime} - {entry.endTime}
                      </span>
                      {entry.breakMinutes > 0 && (
                        <span>({entry.breakMinutes} min break)</span>
                      )}
                    </div>
                    {entry.workDescription && (
                      <p className="text-sm text-muted-foreground">{entry.workDescription}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{Number(entry.hoursWorked).toFixed(1)} hrs</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
