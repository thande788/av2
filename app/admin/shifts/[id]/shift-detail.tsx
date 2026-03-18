'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconArrowLeft,
  IconCalendar,
  IconCheck,
  IconClock,
  IconLoader2,
  IconMapPin,
  IconMessageForward,
  IconStar,
  IconUser,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import type {
  CareShift,
  ShiftStatus,
  ShiftBooking,
  BookingStatus,
  Worker,
  Client,
  PortalUser,
} from '@prisma/client';

import { cn, type Serialized } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  sendBookingRequest,
  confirmBooking,
  cancelShift,
  completeShift,
} from '@/app/actions/shifts';
import { sendShiftNotification } from '@/app/actions/sms-notifications';
import { AdminShiftRating } from './admin-shift-rating';

type ShiftWithRelations = CareShift & {
  client: Client & {
    user: PortalUser;
  };
  bookings: (ShiftBooking & {
    worker: Worker & {
      user: PortalUser;
    };
  })[];
};

type WorkerWithUser = Worker & {
  user: PortalUser;
};

interface ShiftDetailProps {
  shift: Serialized<ShiftWithRelations>;
  availableWorkers: Serialized<WorkerWithUser>[];
}

const statusColors: Record<ShiftStatus, string> = {
  OPEN: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500',
  PENDING_BOOK: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
  BOOKED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
  IN_PROGRESS: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500',
  COMPLETED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
  NO_SHOW: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
};

const bookingStatusColors: Record<BookingStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
  ACCEPTED: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-500',
  CONFIRMED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500',
  DECLINED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
  CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
  NO_SHOW: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
};

export function ShiftDetail({ shift, availableWorkers }: ShiftDetailProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isNotifying, setIsNotifying] = React.useState(false);
  const [notificationResult, setNotificationResult] = React.useState<{
    sent: number;
    failed: number;
  } | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = React.useState<string>('');

  const confirmedBooking = shift.bookings.find((b) => b.status === 'CONFIRMED');
  const pendingBookings = shift.bookings.filter((b) => b.status === 'PENDING');
  const isOpen = shift.status === 'OPEN' || shift.status === 'PENDING_BOOK';
  const isBooked = shift.status === 'BOOKED' || shift.status === 'IN_PROGRESS';

  const handleSendNotification = async () => {
    setIsNotifying(true);
    setNotificationResult(null);
    const result = await sendShiftNotification(shift.id);
    setNotificationResult({
      sent: result.totalSent,
      failed: result.totalFailed,
    });
    setIsNotifying(false);
    router.refresh();
  };

  const handleSendRequest = async () => {
    if (!selectedWorkerId) return;
    setIsLoading(true);
    const result = await sendBookingRequest(shift.id, selectedWorkerId);
    setIsLoading(false);
    if (result.success) {
      setSelectedWorkerId('');
      router.refresh();
    }
  };

  const handleConfirmBooking = async (bookingId: string) => {
    setIsLoading(true);
    const result = await confirmBooking(bookingId);
    setIsLoading(false);
    if (result.success) {
      router.refresh();
    }
  };

  const handleCancelShift = async () => {
    setIsLoading(true);
    await cancelShift(shift.id);
    setIsLoading(false);
    router.push('/admin/shifts');
  };

  const handleCompleteShift = async () => {
    setIsLoading(true);
    const result = await completeShift(shift.id);
    setIsLoading(false);
    if (result.success) {
      router.refresh();
    }
  };

  // Filter out workers that already have bookings for this shift
  const bookedWorkerIds = shift.bookings.map((b) => b.workerId);
  const filteredWorkers = availableWorkers.filter(
    (w) => !bookedWorkerIds.includes(w.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/shifts">
              <IconArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Shift for {shift.client.user.firstName} {shift.client.user.lastName}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge className={cn('font-medium', statusColors[shift.status])}>
                {shift.status.replace('_', ' ')}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {new Date(shift.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isOpen && (
            <Button
              variant="outline"
              onClick={handleSendNotification}
              disabled={isNotifying}
              className="text-blue-600 hover:text-blue-700"
            >
              {isNotifying ? (
                <IconLoader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <IconMessageForward className="mr-2 size-4" />
              )}
              Notify Workers
            </Button>
          )}

          {isBooked && (
            <Button onClick={handleCompleteShift} disabled={isLoading}>
              {isLoading ? (
                <IconLoader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <IconCheck className="mr-2 size-4" />
              )}
              Complete Shift
            </Button>
          )}

          {shift.status !== 'COMPLETED' && shift.status !== 'CANCELLED' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-600 hover:text-red-700">
                  <IconX className="mr-2 size-4" />
                  Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Shift?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will cancel the shift and notify any assigned workers.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Shift</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelShift}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Cancel Shift
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <Separator />

      {/* Notification Result Banner */}
      {notificationResult && (
        <div
          className={cn(
            'rounded-lg border p-4',
            notificationResult.failed > 0
              ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/30'
              : 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/30'
          )}
        >
          <p className="text-sm">
            <span className="font-medium">
              SMS notifications sent:{' '}
            </span>
            <span className="text-emerald-700 dark:text-emerald-400">
              {notificationResult.sent} successful
            </span>
            {notificationResult.failed > 0 && (
              <>
                {', '}
                <span className="text-red-700 dark:text-red-400">
                  {notificationResult.failed} failed
                </span>
              </>
            )}
          </p>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Shift Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCalendar className="size-5" />
              Shift Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <IconClock className="size-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">
                  {shift.startTime} - {shift.endTime}
                </p>
                <p className="text-sm text-muted-foreground">
                  {Number(shift.duration).toFixed(1)} hours
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <IconUser className="size-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Service Type</p>
                <p className="text-sm text-muted-foreground">{shift.serviceType}</p>
              </div>
            </div>

            {shift.skillsRequired.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Required Skills</p>
                <div className="flex flex-wrap gap-1">
                  {shift.skillsRequired.map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Client Rate</span>
              <span className="font-medium">${Number(shift.clientRate).toFixed(2)}/hr</span>
            </div>
            {shift.workerRate && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Worker Rate</span>
                <span className="font-medium">${Number(shift.workerRate).toFixed(2)}/hr</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUser className="size-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-medium text-foreground">
              {shift.client.user.firstName} {shift.client.user.lastName}
            </p>
            {shift.client.user.phone && (
              <p className="text-sm text-muted-foreground">{shift.client.user.phone}</p>
            )}
            {(shift.client.street || shift.client.city) && (
              <div className="flex items-start gap-2">
                <IconMapPin className="mt-0.5 size-4 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  {shift.client.street && <p>{shift.client.street}</p>}
                  <p>
                    {[shift.client.city, shift.client.state].filter(Boolean).join(', ')}
                    {shift.client.zip && ` ${shift.client.zip}`}
                  </p>
                </div>
              </div>
            )}
            {shift.notes && (
              <div className="mt-4 rounded-lg bg-muted p-3">
                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                <p className="mt-1 text-sm text-foreground">{shift.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Worker Assignment */}
      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUsers className="size-5" />
              Assign Worker
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select a worker" />
                </SelectTrigger>
                <SelectContent>
                  {filteredWorkers.map((worker) => (
                    <SelectItem key={worker.id} value={worker.id}>
                      {worker.user.firstName} {worker.user.lastName}
                      {worker.employeeId && ` (${worker.employeeId})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleSendRequest}
                disabled={!selectedWorkerId || isLoading}
              >
                {isLoading ? (
                  <IconLoader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                Send Request
              </Button>
            </div>

            {filteredWorkers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                All available workers have already been sent requests for this shift.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Booking Requests */}
      {shift.bookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUsers className="size-5" />
              Booking Requests ({shift.bookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {shift.bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {booking.worker.user.firstName} {booking.worker.user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.worker.employeeId || booking.worker.user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn('font-medium', bookingStatusColors[booking.status])}>
                      {booking.status}
                    </Badge>
                    {booking.status === 'PENDING' && (
                      <Button
                        size="sm"
                        onClick={() => handleConfirmBooking(booking.id)}
                        disabled={isLoading}
                      >
                        Confirm
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assigned Worker */}
      {confirmedBooking && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUser className="size-5" />
              Assigned Worker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <IconUser className="size-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {confirmedBooking.worker.user.firstName} {confirmedBooking.worker.user.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {confirmedBooking.worker.employeeId} • {confirmedBooking.worker.user.phone}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Caregiver Rating (completed shifts only) */}
      {shift.status === 'COMPLETED' && confirmedBooking && (
        <AdminShiftRating
          shiftId={shift.id}
          caregiverName={`${confirmedBooking.worker.user.firstName} ${confirmedBooking.worker.user.lastName}`}
        />
      )}
    </div>
  );
}
