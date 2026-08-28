import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';

import { db } from '@/lib/db';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { serialize } from '@/lib/utils';
import { EmployeeShiftDetail } from './employee-shift-detail';

interface EmployeeShiftDetailPageProps {
  params: Promise<{ bookingId: string }>;
}

export const metadata = {
  title: 'Shift Detail',
  description: 'View and manage a specific shift booking',
};

export default async function EmployeeShiftDetailPage({ params }: EmployeeShiftDetailPageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const { bookingId } = await params;

  const booking = await db.shiftBooking.findFirst({
    where: {
      id: bookingId,
      worker: {
        user: {
          clerkId: userId,
        },
      },
    },
    include: {
      worker: {
        include: {
          user: true,
        },
      },
      shift: {
        include: {
          client: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!booking) {
    notFound();
  }

  const enableShiftNotes = isFeatureEnabled('shiftNotes');
  const enableEmergencyEscalation = isFeatureEnabled('emergencyEscalation');

  const [notes, handoffNotes] = await Promise.all([
    enableShiftNotes
      ? db.shiftNote.findMany({
          where: {
            shiftId: booking.shiftId,
          },
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        })
      : Promise.resolve([]),
    enableShiftNotes
      ? db.shiftNote.findMany({
          where: {
            isPinned: true,
            shift: {
              clientId: booking.shift.clientId,
              date: { lt: booking.shift.date },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        })
      : Promise.resolve([]),
  ]);

  return (
    <EmployeeShiftDetail
      booking={serialize(booking)}
      notes={serialize(notes)}
      handoffNotes={serialize(handoffNotes)}
      enableShiftNotes={enableShiftNotes}
      enableEmergencyEscalation={enableEmergencyEscalation}
      emergencyContact={{
        emergencyName: booking.shift.client.emergencyName,
        emergencyPhone: booking.shift.client.emergencyPhone,
        emergencyRelation: booking.shift.client.emergencyRelation,
      }}
    />
  );
}
