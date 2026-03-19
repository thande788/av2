'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconArrowLeft,
  IconCheck,
  IconClock,
  IconLoader2,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import type { Timesheet, TimesheetEntry, TimesheetStatus, Worker, PortalUser } from '@prisma/client';

import { cn, type Serialized } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { approveTimesheet, rejectTimesheet } from '@/app/actions/timesheets';

type TimesheetWithRelations = Serialized<Timesheet & {
  worker: Worker & {
    user: PortalUser;
  };
  entries: TimesheetEntry[];
}>;

interface TimesheetDetailProps {
  timesheet: TimesheetWithRelations;
}

const statusColors: Record<TimesheetStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  SUBMITTED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
  APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
  PROCESSED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
};

const statusLabels: Record<TimesheetStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Pending Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  PROCESSED: 'Processed',
};

export function TimesheetDetail({ timesheet }: TimesheetDetailProps) {
  const router = useRouter();
  const [isApproving, setIsApproving] = React.useState(false);
  const [isRejecting, setIsRejecting] = React.useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState('');

  const handleApprove = async () => {
    setIsApproving(true);
    const result = await approveTimesheet(timesheet.id);
    setIsApproving(false);
    if (result.success) {
      router.refresh();
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    setIsRejecting(true);
    const result = await rejectTimesheet(timesheet.id, rejectionReason);
    setIsRejecting(false);
    if (result.success) {
      setRejectDialogOpen(false);
      router.refresh();
    }
  };

  const weekStart = new Date(timesheet.weekStarting);
  const weekEnd = new Date(timesheet.weekEnding);
  const status = timesheet.status as TimesheetStatus;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/timesheets">
            <Button variant="ghost" size="icon">
              <IconArrowLeft className="size-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              Timesheet: {timesheet.worker.user.firstName} {timesheet.worker.user.lastName}
            </h1>
            <p className="text-muted-foreground">
              Week of {weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} -{' '}
              {weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
        <Badge className={cn('text-sm px-3 py-1', statusColors[status])}>
          {statusLabels[status]}
        </Badge>
      </div>

      {/* Actions for pending timesheets */}
      {status === 'SUBMITTED' && (
        <Card className="border-yellow-500/40 bg-yellow-50 dark:bg-yellow-900/10">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-400">
                This timesheet is awaiting your review
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-500">
                Review the entries below and approve or reject
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => setRejectDialogOpen(true)}
              >
                <IconX className="mr-2 size-4" />
                Reject
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <IconCheck className="mr-2 size-4" />
                    Approve
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Approve Timesheet</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will approve the timesheet for{' '}
                      <strong>
                        {timesheet.worker.user.firstName} {timesheet.worker.user.lastName}
                      </strong>{' '}
                      with {Number(timesheet.totalHours).toFixed(1)} total hours. This action marks
                      the timesheet as ready for payroll processing.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleApprove}
                      disabled={isApproving}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isApproving && <IconLoader2 className="mr-2 size-4 animate-spin" />}
                      Approve Timesheet
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Timesheet</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. The worker will be notified and can make
              corrections.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Rejection Reason</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Missing entries for Tuesday, incorrect break times..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isRejecting || !rejectionReason.trim()}
            >
              {isRejecting && <IconLoader2 className="mr-2 size-4 animate-spin" />}
              Reject Timesheet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{Number(timesheet.totalHours).toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Regular Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{Number(timesheet.totalRegular).toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overtime Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {Number(timesheet.totalOvertime).toFixed(1)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Worker Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUser className="size-5" />
            Worker Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">
              {timesheet.worker.user.firstName} {timesheet.worker.user.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Employee ID</p>
            <p className="font-medium font-mono">{timesheet.worker.employeeId || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{timesheet.worker.user.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Submitted</p>
            <p className="font-medium">
              {timesheet.submittedAt
                ? new Date(timesheet.submittedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                : 'Not submitted'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconClock className="size-5" />
            Time Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timesheet.entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No entries recorded</p>
          ) : (
            <div className="space-y-3">
              {timesheet.entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">{entry.clientName}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="font-mono">
                        {entry.startTime} - {entry.endTime}
                      </span>
                      {entry.breakMinutes > 0 && (
                        <span className="text-muted-foreground ml-2">
                          ({entry.breakMinutes} min break)
                        </span>
                      )}
                    </div>
                    <Badge variant="secondary">
                      {Number(entry.hoursWorked).toFixed(1)} hrs
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejection reason if rejected */}
      {status === 'REJECTED' && timesheet.rejectedReason && (
        <Card className="border-red-500/40">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Rejection Reason</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{timesheet.rejectedReason}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
