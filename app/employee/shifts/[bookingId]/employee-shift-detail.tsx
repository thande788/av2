'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { CareShift, Client, PortalUser, ShiftBooking } from '@prisma/client';
import {
  IconArrowLeft,
  IconCheck,
  IconClock,
  IconLoader2,
  IconLogin,
  IconLogout,
  IconMapPin,
  IconX,
} from '@tabler/icons-react';

import { ShiftNotes } from '@/components/shared/shift-notes';
import { EmergencyPanel } from '@/components/shared/emergency-panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  acceptShiftBooking,
  checkInToShift,
  checkOutFromShift,
  declineShiftBooking,
} from '@/app/actions/employee-shifts';
import { cancelShiftBooking } from '@/app/actions/shift-booking';
import { cn, formatDateUS, type Serialized } from '@/lib/utils';

type BookingWithRelations = Serialized<ShiftBooking & {
  shift: CareShift & {
    client: Client & {
      user: PortalUser;
    };
  };
}>;

type ShiftNoteView = {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  category: 'GENERAL' | 'CARE_UPDATE' | 'MEDICATION' | 'INCIDENT' | 'HANDOFF';
  isVisibleToClient: boolean;
  isPinned: boolean;
  createdAt: Date | string;
};

interface EmployeeShiftDetailProps {
  booking: BookingWithRelations;
  notes: ShiftNoteView[];
  handoffNotes: ShiftNoteView[];
  enableShiftNotes: boolean;
  enableEmergencyEscalation: boolean;
  emergencyContact: {
    emergencyName: string | null;
    emergencyPhone: string | null;
    emergencyRelation: string | null;
  } | null;
}

const statusClasses: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
  ACCEPTED: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-500',
  CONFIRMED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500',
  DECLINED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
  CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
  NO_SHOW: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
};

export function EmployeeShiftDetail({
  booking,
  notes,
  handoffNotes,
  enableShiftNotes,
  enableEmergencyEscalation,
  emergencyContact,
}: EmployeeShiftDetailProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const shift = booking.shift;

  const isToday = formatDateUS(shift.date, 'iso') === formatDateUS(new Date(), 'iso');
  const canAccept = booking.status === 'PENDING';
  const canCheckIn = booking.status === 'CONFIRMED' && isToday && !booking.checkedInAt;
  const canCheckOut = !!booking.checkedInAt && !booking.checkedOutAt;
  const canCancel = (booking.status === 'PENDING' || booking.status === 'ACCEPTED') && !booking.checkedInAt;

  const runAction = async (action: () => Promise<{ success: boolean }>) => {
    setIsLoading(true);
    const result = await action();
    setIsLoading(false);
    if (result.success) {
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/employee/shifts" aria-label="Back to my shifts">
            <IconArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Shift Details</h1>
          <p className="text-sm text-muted-foreground">{formatDateUS(shift.date, 'weekday-long')}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Visit Overview</span>
              <Badge className={cn('font-medium', statusClasses[booking.status] || statusClasses.CANCELLED)}>
                {booking.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <IconClock className="size-4 text-muted-foreground" />
              <span>{shift.startTime} - {shift.endTime} ({Number(shift.duration).toFixed(1)} hrs)</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Service Type</p>
              <p className="font-medium">{shift.serviceType}</p>
            </div>
            {shift.skillsRequired.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {shift.skillsRequired.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                ))}
              </div>
            )}
            {shift.notes && (
              <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-sm">
                {shift.notes}
              </div>
            )}
            {(booking.checkedInAt || booking.checkedOutAt) && (
              <div className="text-sm text-muted-foreground">
                {booking.checkedInAt && <p>Checked in: {new Date(booking.checkedInAt).toLocaleTimeString()}</p>}
                {booking.checkedOutAt && <p>Checked out: {new Date(booking.checkedOutAt).toLocaleTimeString()}</p>}
              </div>
            )}
            <Separator />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/employee/shifts">Back to List</Link>
              </Button>
              {canAccept && (
                <>
                  <Button disabled={isLoading} onClick={() => runAction(() => acceptShiftBooking(booking.id))}>
                    {isLoading ? <IconLoader2 className="mr-2 size-4 animate-spin" /> : <IconCheck className="mr-2 size-4" />}
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    disabled={isLoading}
                    onClick={() => runAction(() => declineShiftBooking(booking.id))}
                  >
                    <IconX className="mr-2 size-4" />
                    Decline
                  </Button>
                </>
              )}
              {canCheckIn && (
                <Button disabled={isLoading} onClick={() => runAction(() => checkInToShift(booking.id))}>
                  {isLoading ? <IconLoader2 className="mr-2 size-4 animate-spin" /> : <IconLogin className="mr-2 size-4" />}
                  Check In
                </Button>
              )}
              {canCheckOut && (
                <Button variant="secondary" disabled={isLoading} onClick={() => runAction(() => checkOutFromShift(booking.id))}>
                  {isLoading ? <IconLoader2 className="mr-2 size-4 animate-spin" /> : <IconLogout className="mr-2 size-4" />}
                  Check Out
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  disabled={isLoading}
                  onClick={() => runAction(() => cancelShiftBooking(booking.id))}
                >
                  {isLoading ? <IconLoader2 className="mr-2 size-4 animate-spin" /> : <IconX className="mr-2 size-4" />}
                  Cancel Booking
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">
              {shift.client.careRecipientName || `${shift.client.user.firstName} ${shift.client.user.lastName}`}
            </p>
            {shift.client.user.phone && (
              <a href={`tel:${shift.client.user.phone}`} className="text-sm text-muted-foreground underline">
                {shift.client.user.phone}
              </a>
            )}
            {(shift.client.street || shift.client.city) && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <IconMapPin className="mt-0.5 size-4" />
                <div>
                  {shift.client.street && <p>{shift.client.street}</p>}
                  <p>
                    {[shift.client.city, shift.client.state].filter(Boolean).join(', ')}
                    {shift.client.zip && ` ${shift.client.zip}`}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {enableEmergencyEscalation && (
        <EmergencyPanel
          shiftId={shift.id}
          clientId={shift.clientId}
          emergencyContact={emergencyContact}
        />
      )}

      {enableShiftNotes && (
        <ShiftNotes
          shiftId={shift.id}
          notes={notes}
          handoffNotes={handoffNotes}
          canAdd={booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED'}
        />
      )}
    </div>
  );
}
