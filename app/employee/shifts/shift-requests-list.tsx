'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { ShiftBooking, CareShift, Client, PortalUser } from '@prisma/client';
import type { Serialized } from '@/lib/utils';
import {
  IconCheck,
  IconX,
  IconLoader2,
  IconMapPin,
  IconClock,
  IconCurrencyDollar,
} from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { acceptShiftBooking, declineShiftBooking } from '@/app/actions/employee-shifts';
import { formatDateUS } from '@/lib/utils';

type BookingWithRelations = Serialized<ShiftBooking & {
  shift: CareShift & {
    client: Client & {
      user: PortalUser;
    };
  };
}>;

interface ShiftRequestsListProps {
  bookings: BookingWithRelations[];
}

export function ShiftRequestsList({ bookings }: ShiftRequestsListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  const handleAccept = async (bookingId: string) => {
    setLoadingId(bookingId);
    const result = await acceptShiftBooking(bookingId);
    setLoadingId(null);
    if (result.success) {
      router.refresh();
    }
  };

  const handleDecline = async (bookingId: string) => {
    setLoadingId(bookingId);
    const result = await declineShiftBooking(bookingId);
    setLoadingId(null);
    if (result.success) {
      router.refresh();
    }
  };

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No pending shift requests</p>
          <p className="text-sm text-muted-foreground">
            New shift offers will appear here
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
        const estimatedPay = Number(shift.workerRate || shift.clientRate) * Number(shift.duration);

        return (
          <Card key={booking.id}>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  {/* Date & Time */}
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                      New Request
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Respond within 24 hours
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold">
                    {formatDateUS(shift.date, 'weekday-long')}
                  </h3>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <IconClock className="size-4" />
                      {shift.startTime} - {shift.endTime} ({Number(shift.duration).toFixed(1)} hrs)
                    </div>
                    <div className="flex items-center gap-1">
                      <IconCurrencyDollar className="size-4" />
                      ${estimatedPay.toFixed(2)} estimated
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="mt-4 rounded-lg bg-muted p-3">
                    <p className="font-medium">
                      {client.user.firstName} {client.user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{shift.serviceType}</p>
                    {(client.city || client.state) && (
                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <IconMapPin className="size-3" />
                        {[client.city, client.state].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Skills Required */}
                  {shift.skillsRequired.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {shift.skillsRequired.map((skill: string) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {shift.notes && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Note: {shift.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 sm:flex-col">
                  <Button
                    onClick={() => handleAccept(booking.id)}
                    disabled={isLoading}
                    className="flex-1 sm:flex-none"
                  >
                    {isLoading ? (
                      <IconLoader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <IconCheck className="mr-2 size-4" />
                    )}
                    Accept
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={isLoading}
                        className="flex-1 text-red-600 hover:text-red-700 sm:flex-none"
                      >
                        <IconX className="mr-2 size-4" />
                        Decline
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Decline Shift Request?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to decline this shift? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDecline(booking.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Decline Shift
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
