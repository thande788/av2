'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { ShiftBooking, CareShift, Client, PortalUser } from '@prisma/client';
import type { Serialized } from '@/lib/utils';
import {
  IconMapPin,
  IconClock,
  IconPhone,
  IconLoader2,
  IconLogin,
  IconLogout,
} from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { checkInToShift, checkOutFromShift } from '@/app/actions/employee-shifts';

type BookingWithRelations = Serialized<ShiftBooking & {
  shift: CareShift & {
    client: Client & {
      user: PortalUser;
    };
  };
}>;

interface UpcomingShiftsListProps {
  bookings: BookingWithRelations[];
  showCompleted?: boolean;
}

export function UpcomingShiftsList({ bookings, showCompleted }: UpcomingShiftsListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  const handleCheckIn = async (bookingId: string) => {
    setLoadingId(bookingId);
    // In a real app, we'd get GPS coordinates here
    const result = await checkInToShift(bookingId);
    setLoadingId(null);
    if (result.success) {
      router.refresh();
    }
  };

  const handleCheckOut = async (bookingId: string) => {
    setLoadingId(bookingId);
    const result = await checkOutFromShift(bookingId);
    setLoadingId(null);
    if (result.success) {
      router.refresh();
    }
  };

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">
            {showCompleted ? 'No completed shifts yet' : 'No upcoming shifts scheduled'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const isLoading = loadingId === booking.id;
        const shift = booking.shift;
        const client = shift.client;
        
        const isToday = new Date(shift.date).toDateString() === new Date().toDateString();
        const canCheckIn = booking.status === 'CONFIRMED' && isToday && !booking.checkedInAt;
        const canCheckOut = booking.checkedInAt && !booking.checkedOutAt;
        const isCompleted = booking.status === 'COMPLETED' || !!booking.checkedOutAt;

        return (
          <Card key={booking.id}>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500">
                        Completed
                      </Badge>
                    ) : booking.checkedInAt ? (
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500">
                        In Progress
                      </Badge>
                    ) : isToday ? (
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500">
                        Today
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                        Upcoming
                      </Badge>
                    )}
                  </div>

                  {/* Date & Time */}
                  <h3 className="text-lg font-semibold">
                    {new Date(shift.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <IconClock className="size-4" />
                    {shift.startTime} - {shift.endTime} ({Number(shift.duration).toFixed(1)} hrs)
                  </div>

                  {/* Client Info */}
                  <div className="mt-4 space-y-2 rounded-lg bg-muted p-3">
                    <p className="font-medium">
                      {client.user.firstName} {client.user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{shift.serviceType}</p>
                    
                    {client.user.phone && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <IconPhone className="size-3" />
                        <a href={`tel:${client.user.phone}`} className="hover:underline">
                          {client.user.phone}
                        </a>
                      </div>
                    )}
                    
                    {(client.street || client.city) && (
                      <div className="flex items-start gap-1 text-sm text-muted-foreground">
                        <IconMapPin className="mt-0.5 size-3 shrink-0" />
                        <div>
                          {client.street && <span>{client.street}, </span>}
                          {[client.city, client.state].filter(Boolean).join(', ')}
                          {client.zip && ` ${client.zip}`}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Check-in/out times */}
                  {(booking.checkedInAt || booking.checkedOutAt) && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {booking.checkedInAt && (
                        <p>
                          Checked in: {new Date(booking.checkedInAt).toLocaleTimeString()}
                        </p>
                      )}
                      {booking.checkedOutAt && (
                        <p>
                          Checked out: {new Date(booking.checkedOutAt).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!showCompleted && (
                  <div className="flex gap-2 sm:flex-col">
                    {canCheckIn && (
                      <Button
                        onClick={() => handleCheckIn(booking.id)}
                        disabled={isLoading}
                        className="flex-1 sm:flex-none"
                      >
                        {isLoading ? (
                          <IconLoader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                          <IconLogin className="mr-2 size-4" />
                        )}
                        Check In
                      </Button>
                    )}
                    
                    {canCheckOut && (
                      <Button
                        onClick={() => handleCheckOut(booking.id)}
                        disabled={isLoading}
                        variant="secondary"
                        className="flex-1 sm:flex-none"
                      >
                        {isLoading ? (
                          <IconLoader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                          <IconLogout className="mr-2 size-4" />
                        )}
                        Check Out
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
