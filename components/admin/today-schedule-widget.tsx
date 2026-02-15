'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconCalendar, IconUser, IconMapPin } from '@tabler/icons-react';
import Link from 'next/link';

export interface ShiftWithDetails {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  client: {
    careRecipientName?: string | null;
    user: {
      firstName: string;
      lastName: string;
    };
    city?: string | null;
  };
  bookings: Array<{
    id: string;
    status: string;
    worker: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
  }>;
}

interface TodayScheduleWidgetProps {
  // Accept any array that can be cast to ShiftWithDetails
  shifts: ShiftWithDetails[];
}

const statusColors: Record<string, string> = {
  OPEN: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  PENDING_BOOK: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  BOOKED: 'bg-green-500/15 text-green-600 dark:text-green-400',
  IN_PROGRESS: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  COMPLETED: 'bg-muted text-muted-foreground',
  CANCELLED: 'bg-red-500/15 text-red-600 dark:text-red-400',
};

export function TodayScheduleWidget({ shifts }: TodayScheduleWidgetProps) {
  const confirmedBooking = (shift: ShiftWithDetails) =>
    shift.bookings.find((b) => b.status === 'CONFIRMED' || b.status === 'ACCEPTED');

  return (
    <div className="rounded-xl border border-primary/40 bg-primary/5 overflow-hidden">
      <div className="flex items-center justify-between p-6 pb-4 border-b border-primary/20">
        <div className="flex items-center gap-2">
          <IconCalendar className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Today&apos;s Schedule</h2>
        </div>
        <Link href="/admin/shifts">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </div>
      <div className="p-6 pt-4">
        {shifts.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">
            No shifts scheduled for today
          </p>
        ) : (
          <div className="space-y-3">
            {shifts.map((shift) => {
              const assignedWorker = confirmedBooking(shift);
              return (
                <Link
                  key={shift.id}
                  href={`/admin/shifts/${shift.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center rounded-lg bg-primary/10 px-3 py-2 min-w-[70px]">
                      <span className="text-sm font-semibold text-primary">
                        {shift.startTime}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {shift.endTime}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {shift.client.careRecipientName ||
                          `${shift.client.user.firstName} ${shift.client.user.lastName}`}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <IconMapPin className="size-3" />
                        <span>{shift.client.city}</span>
                        {assignedWorker && (
                          <>
                            <span className="text-xs">•</span>
                            <IconUser className="size-3" />
                            <span>
                              {assignedWorker.worker.user.firstName}{' '}
                              {assignedWorker.worker.user.lastName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={statusColors[shift.status] || 'bg-muted'}
                  >
                    {shift.status.replace('_', ' ')}
                  </Badge>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
