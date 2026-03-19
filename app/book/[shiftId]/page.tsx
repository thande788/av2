import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { formatDateUS } from '@/lib/utils';
import { BookShiftCard } from './book-shift-card';

interface BookingPageProps {
  params: Promise<{ shiftId: string }>;
}

export async function generateMetadata({ params }: BookingPageProps) {
  const { shiftId } = await params;
  const shift = await db.careShift.findUnique({
    where: { id: shiftId },
    include: {
      client: { include: { user: true } },
    },
  });

  if (!shift) {
    return {
      title: 'Shift Not Found | Angel Touch Homecare',
    };
  }

  return {
    title: `Book Shift - ${formatDateUS(shift.date)} | Angel Touch Homecare`,
    description: `Book a caregiving shift on ${formatDateUS(shift.date)} from ${shift.startTime} to ${shift.endTime}.`,
  };
}

export default async function BookShiftPage({ params }: BookingPageProps) {
  // Gate behind shift scheduling feature flag
  if (!isFeatureEnabled('shiftScheduling')) {
    redirect('/');
  }

  const { shiftId } = await params;

  // Get authenticated user
  const { userId: clerkUserId } = await auth();

  // Get shift details
  const shift = await db.careShift.findUnique({
    where: { id: shiftId },
    include: {
      client: {
        include: { user: true },
      },
      bookings: {
        include: {
          worker: { include: { user: true } },
        },
      },
    },
  });

  if (!shift) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/5 via-background to-background p-4">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <svg
              className="size-8 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold">Shift Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            This shift may have been cancelled or removed.
          </p>
        </div>
      </div>
    );
  }

  // Get worker info if authenticated
  let worker = null;
  let existingBooking = null;

  if (clerkUserId) {
    const portalUser = await db.portalUser.findUnique({
      where: { clerkId: clerkUserId },
      include: { worker: true },
    });

    if (portalUser?.worker) {
      worker = {
        ...portalUser.worker,
        user: portalUser,
      };

      // Check for existing booking
      existingBooking = shift.bookings.find(
        (b) => b.workerId === portalUser.worker!.id
      );
    }
  }

  // Format shift data for the card
  const shiftData = {
    id: shift.id,
    date: formatDateUS(shift.date, 'weekday-long'),
    startTime: shift.startTime,
    endTime: shift.endTime,
    duration: shift.duration.toNumber(),
    clientName:
      shift.client.careRecipientName ||
      `${shift.client.user.firstName} ${shift.client.user.lastName}`,
    clientCity: shift.client.city,
    clientState: shift.client.state,
    serviceType: shift.serviceType,
    skillsRequired: shift.skillsRequired,
    rate: shift.workerRate?.toNumber() || 22.0,
    status: shift.status,
    isBooked: shift.bookings.some(
      (b) => b.status === 'CONFIRMED' || b.status === 'ACCEPTED'
    ),
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/5 via-background to-background p-4">
      <BookShiftCard
        shift={shiftData}
        isAuthenticated={!!clerkUserId}
        hasWorkerProfile={!!worker}
        isCompliant={worker?.complianceStatus === 'COMPLIANT'}
        existingBooking={
          existingBooking
            ? {
                id: existingBooking.id,
                status: existingBooking.status,
              }
            : null
        }
      />
    </div>
  );
}
