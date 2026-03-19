'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import {
  IconCalendar,
  IconClock,
  IconUser,
  IconMapPin,
  IconCurrencyDollar,
  IconBriefcase,
  IconLoader2,
  IconCheck,
  IconAlertCircle,
  IconCircleCheck,
  IconInfoCircle,
} from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { bookShiftFromLink } from '@/app/actions/shift-booking';

interface ShiftData {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  clientName: string;
  clientCity: string;
  clientState: string;
  serviceType: string;
  skillsRequired: string[];
  rate: number;
  status: string;
  isBooked: boolean;
}

interface BookShiftCardProps {
  shift: ShiftData;
  isAuthenticated: boolean;
  hasWorkerProfile: boolean;
  isCompliant: boolean;
  existingBooking: {
    id: string;
    status: string;
  } | null;
}

const serviceTypeLabels: Record<string, string> = {
  COMPANION: 'Companionship',
  PERSONAL: 'Personal Care',
  SKILLED: 'Skilled Nursing',
  LIVE_IN: '24-Hour Care',
};

const initialState = {
  success: false,
  error: undefined as string | undefined,
  bookingId: undefined as string | undefined,
};

export function BookShiftCard({
  shift,
  isAuthenticated,
  hasWorkerProfile,
  isCompliant,
  existingBooking,
}: BookShiftCardProps) {
  const [state, formAction, isPending] = useActionState(
    async () => bookShiftFromLink(shift.id),
    initialState
  );

  const renderContent = () => {
    // Already booked by this worker
    if (existingBooking) {
      const statusMessages: Record<string, { icon: React.ReactNode; title: string; description: string }> = {
        PENDING: {
          icon: <IconClock className="size-8 text-yellow-600 dark:text-yellow-400" />,
          title: 'Booking Pending',
          description: 'Your booking request has been submitted. You\'ll be notified once it\'s confirmed.',
        },
        ACCEPTED: {
          icon: <IconCheck className="size-8 text-blue-600 dark:text-blue-400" />,
          title: 'Booking Accepted',
          description: 'Your request has been accepted! Waiting for final confirmation.',
        },
        CONFIRMED: {
          icon: <IconCircleCheck className="size-8 text-green-600 dark:text-green-400" />,
          title: 'Booking Confirmed!',
          description: 'You\'re all set for this shift. We\'ll send you a reminder 24 hours before.',
        },
        DECLINED: {
          icon: <IconAlertCircle className="size-8 text-red-600 dark:text-red-400" />,
          title: 'Booking Declined',
          description: 'Unfortunately, this booking was not approved. Please contact the office for details.',
        },
      };

      const statusInfo = statusMessages[existingBooking.status] || statusMessages.PENDING;

      return (
        <div className="space-y-6 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
            {statusInfo.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold">{statusInfo.title}</h2>
            <p className="mt-2 text-muted-foreground">{statusInfo.description}</p>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link href="/employee/shifts">View My Shifts</Link>
          </Button>
        </div>
      );
    }

    // Shift already booked by someone else
    if (shift.isBooked) {
      return (
        <div className="space-y-6 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
            <IconInfoCircle className="size-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Shift Already Assigned</h2>
            <p className="mt-2 text-muted-foreground">
              This shift has been assigned to another caregiver. Check out other available shifts.
            </p>
          </div>
          <Button asChild className="w-full">
            <Link href="/employee/shifts">Browse Available Shifts</Link>
          </Button>
        </div>
      );
    }

    // Booking successful
    if (state.success) {
      return (
        <div className="space-y-6 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
            <IconCircleCheck className="size-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-green-800 dark:text-green-200">
              Booking Requested!
            </h2>
            <p className="mt-2 text-green-700 dark:text-green-300">
              Your request has been submitted. You&apos;ll receive a confirmation once approved.
            </p>
          </div>
          <Button asChild className="w-full">
            <Link href="/employee/shifts">View My Shifts</Link>
          </Button>
        </div>
      );
    }

    // Not authenticated
    if (!isAuthenticated) {
      return (
        <>
          {renderShiftDetails()}
          <div className="space-y-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/30">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Sign in to book this shift.</strong> If you don&apos;t have an account, you&apos;ll need to register first.
            </p>
            <div className="flex gap-3">
              <Button asChild className="flex-1">
                <Link href={`/sign-in?redirect_url=/book/${shift.id}`}>Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/sign-up">Register</Link>
              </Button>
            </div>
          </div>
        </>
      );
    }

    // No worker profile
    if (!hasWorkerProfile) {
      return (
        <>
          {renderShiftDetails()}
          <div className="space-y-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/30">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Complete your caregiver profile to book shifts.</strong>
            </p>
            <Button asChild className="w-full">
              <Link href="/sign-up">Complete Registration</Link>
            </Button>
          </div>
        </>
      );
    }

    // Not compliant
    if (!isCompliant) {
      return (
        <>
          {renderShiftDetails()}
          <div className="space-y-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/30">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Your compliance documents need attention.</strong> Please update your documents to book shifts.
            </p>
            <Button asChild className="w-full">
              <Link href="/employee/compliance">Update Documents</Link>
            </Button>
          </div>
        </>
      );
    }

    // Ready to book
    return (
      <>
        {renderShiftDetails()}

        {state.error && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
            <IconAlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{state.error}</p>
          </div>
        )}

        <form action={formAction}>
          <Button type="submit" className="w-full gap-2" size="lg" disabled={isPending}>
            {isPending ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                Booking...
              </>
            ) : (
              <>
                <IconCheck className="size-4" />
                Book This Shift
              </>
            )}
          </Button>
        </form>
      </>
    );
  };

  const renderShiftDetails = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <Badge variant="outline" className="mb-2">
          {serviceTypeLabels[shift.serviceType] || shift.serviceType}
        </Badge>
        <h1 className="text-2xl font-bold">Available Shift</h1>
        <p className="text-muted-foreground">Book this shift to add it to your schedule</p>
      </div>

      {/* Shift Info */}
      <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <IconCalendar className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">{shift.date}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <IconClock className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Time</p>
            <p className="font-medium">
              {shift.startTime} - {shift.endTime}{' '}
              <span className="text-muted-foreground">
                ({shift.duration} hours)
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <IconUser className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Client</p>
            <p className="font-medium">{shift.clientName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <IconMapPin className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Location</p>
            <p className="font-medium">
              {shift.clientCity}, {shift.clientState}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10">
            <IconCurrencyDollar className="size-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pay Rate</p>
            <p className="font-semibold text-emerald-600">
              ${shift.rate.toFixed(2)}/hour
            </p>
          </div>
        </div>

        {shift.skillsRequired.length > 0 && (
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <IconBriefcase className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Skills Required</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {shift.skillsRequired.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Estimated Earnings */}
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/30">
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          <strong>Estimated Earnings:</strong>{' '}
          <span className="text-lg font-bold">
            ${(shift.rate * shift.duration).toFixed(2)}
          </span>{' '}
          for this shift
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-lg sm:p-8">
      <div className="space-y-6">{renderContent()}</div>
    </div>
  );
}
