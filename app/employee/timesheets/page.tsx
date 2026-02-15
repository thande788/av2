import { db } from '@/lib/db';
import { serialize } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  IconAlertCircle,
  IconClock,
  IconCalendarWeek,
  IconCheck,
  IconX,
  IconSend,
  IconFileText,
  IconPlus,
  IconEdit,
} from '@tabler/icons-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import Link from 'next/link';

export const metadata = {
  title: 'Timesheets',
  description: 'View and manage your weekly timesheets',
};

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

export default async function EmployeeTimesheetsPage() {
  // In real app, get worker ID from auth session
  // For demo, we'll use the first active worker
  const demoWorker = await db.worker.findFirst({
    where: {
      user: {
        status: 'ACTIVE',
      },
    },
    include: {
      timesheets: {
        include: {
          entries: true,
        },
        orderBy: {
          weekStarting: 'desc',
        },
        take: 12, // Last 12 weeks
      },
    },
  });

  if (!demoWorker) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <IconAlertCircle className="size-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">No Worker Data</h2>
        <p className="text-muted-foreground">
          Please contact your administrator.
        </p>
      </div>
    );
  }

  // Get the current week's Monday
  const today = new Date();
  const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });

  // Serialize Prisma objects to plain objects
  const timesheets = serialize(demoWorker.timesheets);

  const draftTimesheets = timesheets.filter((t) => t.status === 'DRAFT');
  const submittedTimesheets = timesheets.filter((t) => t.status === 'SUBMITTED');
  const approvedTimesheets = timesheets.filter(
    (t) => t.status === 'APPROVED' || t.status === 'PROCESSED'
  );

  // Calculate summary stats
  const totalHoursThisMonth = timesheets
    .filter((t) => {
      const weekStart = new Date(t.weekStarting);
      return weekStart.getMonth() === today.getMonth();
    })
    .reduce((sum, t) => sum + Number(t.totalHours || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Timesheets</h1>
        <p className="text-muted-foreground">
          Track your hours and submit timesheets for approval
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
          <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-900/30">
            <IconFileText className="size-5 text-slate-600 dark:text-slate-500" />
          </div>
          <div>
            <p className="text-xl font-bold">{draftTimesheets.length}</p>
            <p className="text-sm text-muted-foreground">Draft Timesheets</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
            <IconSend className="size-5 text-blue-600 dark:text-blue-500" />
          </div>
          <div>
            <p className="text-xl font-bold">{submittedTimesheets.length}</p>
            <p className="text-sm text-muted-foreground">Awaiting Approval</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
          <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
            <IconClock className="size-5 text-emerald-600 dark:text-emerald-500" />
          </div>
          <div>
            <p className="text-xl font-bold">{totalHoursThisMonth.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">Hours This Month</p>
          </div>
        </div>
      </div>

      {/* Current Week Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCalendarWeek className="size-5" />
            Current Week
          </CardTitle>
          <CardDescription>
            {format(thisWeekStart, 'MMM d')} -{' '}
            {format(endOfWeek(thisWeekStart, { weekStartsOn: 1 }), 'MMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            const currentTimesheet = timesheets.find(
              (t) =>
                format(new Date(t.weekStarting), 'yyyy-MM-dd') ===
                format(thisWeekStart, 'yyyy-MM-dd')
            );

            if (currentTimesheet) {
              return (
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <Badge className={statusColors[currentTimesheet.status]}>
                        {statusLabels[currentTimesheet.status]}
                      </Badge>
                      <span className="font-medium">
                        {Number(currentTimesheet.totalHours || 0).toFixed(1)} hours logged
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentTimesheet.entries.length} entries
                    </p>
                  </div>
                  {currentTimesheet.status === 'DRAFT' || currentTimesheet.status === 'REJECTED' ? (
                    <Button variant="outline" asChild>
                      <Link href={`/employee/timesheets/${currentTimesheet.id}/edit`}>
                        <IconEdit className="size-4 mr-2" />
                        Edit Timesheet
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" asChild>
                      <Link href={`/employee/timesheets/${currentTimesheet.id}`}>
                        View Details
                      </Link>
                    </Button>
                  )}
                </div>
              );
            }

            return (
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  No timesheet started for this week yet.
                </p>
                <Button asChild>
                  <Link href="/employee/timesheets/new">
                    <IconPlus className="size-4 mr-2" />
                    Start Timesheet
                  </Link>
                </Button>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Timesheets List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-transparent border border-border">
          <TabsTrigger value="all">
            All Timesheets
            <Badge variant="secondary" className="ml-2">
              {timesheets.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {timesheets.length === 0 ? (
            <EmptyState />
          ) : (
            timesheets.map((timesheet) => (
              <TimesheetCard key={timesheet.id} timesheet={timesheet} />
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-3">
          {[...draftTimesheets, ...submittedTimesheets].length === 0 ? (
            <EmptyState message="No pending timesheets" />
          ) : (
            [...draftTimesheets, ...submittedTimesheets].map((timesheet) => (
              <TimesheetCard key={timesheet.id} timesheet={timesheet} />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-3">
          {approvedTimesheets.length === 0 ? (
            <EmptyState message="No approved timesheets yet" />
          ) : (
            approvedTimesheets.map((timesheet) => (
              <TimesheetCard key={timesheet.id} timesheet={timesheet} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface TimesheetCardProps {
  timesheet: {
    id: string;
    weekStarting: string | Date;
    weekEnding: string | Date;
    status: string;
    totalHours: string | number;
    totalRegular: string | number;
    totalOvertime: string | number;
    submittedAt: string | Date | null;
    approvedAt: string | Date | null;
    rejectedReason: string | null;
    entries: unknown[];
  };
}

function TimesheetCard({ timesheet }: TimesheetCardProps) {
  const weekStart = new Date(timesheet.weekStarting);
  const weekEnd = new Date(timesheet.weekEnding);

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-4">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <span className="font-medium">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </span>
          <Badge className={statusColors[timesheet.status]}>
            {statusLabels[timesheet.status]}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <IconClock className="size-3.5" />
            {Number(timesheet.totalHours || 0).toFixed(1)} total hours
          </span>
          {Number(timesheet.totalOvertime || 0) > 0 && (
            <span className="text-amber-600 dark:text-amber-400">
              +{Number(timesheet.totalOvertime).toFixed(1)} OT
            </span>
          )}
          <span>{timesheet.entries.length} entries</span>
        </div>
        {timesheet.status === 'REJECTED' && timesheet.rejectedReason && (
          <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
            <IconX className="size-3.5" />
            {timesheet.rejectedReason}
          </div>
        )}
        {timesheet.status === 'APPROVED' && timesheet.approvedAt && (
          <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
            <IconCheck className="size-3.5" />
            Approved on {format(new Date(timesheet.approvedAt), 'MMM d, yyyy')}
          </div>
        )}
      </div>
      {timesheet.status === 'DRAFT' || timesheet.status === 'REJECTED' ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/employee/timesheets/${timesheet.id}/edit`}>
            <IconEdit className="size-4 mr-1" />
            Edit
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/employee/timesheets/${timesheet.id}`}>
            View
          </Link>
        </Button>
      )}
    </div>
  );
}

function EmptyState({ message = 'No timesheets found' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <IconFileText className="size-12 text-muted-foreground/50" />
      <p className="mt-4 text-muted-foreground">{message}</p>
    </div>
  );
}
