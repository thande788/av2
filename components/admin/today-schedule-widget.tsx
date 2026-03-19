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
                className="group flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex min-w-[70px] flex-col items-center justify-center rounded-lg bg-primary/10 px-3 py-2">
                    <span className="text-sm font-semibold text-primary">
                      {shift.startTime}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {shift.endTime}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium transition-colors group-hover:text-primary">
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
    </DashboardPanel>
  );
}