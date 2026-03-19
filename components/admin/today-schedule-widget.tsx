import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DashboardPanel } from './dashboard-panel';
import { IconCalendar, IconMapPin, IconUser } from '@tabler/icons-react';

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
    shift.bookings.find((booking) =>
      booking.status === 'CONFIRMED' || booking.status === 'ACCEPTED'
    );

  return (
    <DashboardPanel
      title="Today's Schedule"
      icon={IconCalendar}
      action={
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/shifts">View all</Link>
        </Button>
      }
    >
      {shifts.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No shifts scheduled for today.
        </p>
      ) : (
        <div className="space-y-3">
          {shifts.map((shift) => {
            const assignedWorker = confirmedBooking(shift);

            return (
              <Link
                key={shift.id}
                href={`/admin/shifts/${shift.id}`}
                className="group block rounded-lg p-3 transition-colors hover:bg-accent/50"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex items-start gap-3 sm:items-center sm:gap-4">
                    <div className="flex min-w-[84px] shrink-0 items-center justify-between rounded-lg bg-primary/10 px-3 py-2 sm:min-w-[70px] sm:flex-col sm:justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {shift.startTime}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {shift.endTime}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium transition-colors group-hover:text-primary sm:text-base">
                        {shift.client.careRecipientName ||
                          `${shift.client.user.firstName} ${shift.client.user.lastName}`}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span className="inline-flex min-w-0 items-center gap-1.5">
                          <IconMapPin className="size-3 shrink-0" />
                          <span className="truncate">{shift.client.city || 'Location pending'}</span>
                        </span>
                        {assignedWorker && (
                          <span className="inline-flex min-w-0 items-center gap-1.5">
                            <IconUser className="size-3 shrink-0" />
                            <span className="truncate">
                              {assignedWorker.worker.user.firstName}{' '}
                              {assignedWorker.worker.user.lastName}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-start sm:justify-end">
                    <Badge
                      variant="secondary"
                      className={statusColors[shift.status] || 'bg-muted'}
                    >
                      {shift.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </DashboardPanel>
  );
}