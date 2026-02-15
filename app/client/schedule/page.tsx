import { db } from '@/lib/db';
import { serialize } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  IconAlertCircle,
  IconClock,
  IconCalendarWeek,
  IconUser,
} from '@tabler/icons-react';
import { format, isToday, isTomorrow, startOfWeek, endOfWeek, addWeeks } from 'date-fns';

export const metadata = {
  title: 'Schedule | Family Portal',
  description: 'View your care schedule',
};

const statusColors: Record<string, string> = {
  OPEN: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  BOOKED: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  IN_PROGRESS: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  COMPLETED: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
  CANCELLED: 'bg-red-500/15 text-red-600 dark:text-red-400',
};

export default async function ClientSchedulePage() {
  const demoClient = await db.client.findFirst({
    where: {
      user: { status: 'ACTIVE' },
    },
    include: {
      careShifts: {
        where: {
          date: {
            gte: startOfWeek(new Date(), { weekStartsOn: 1 }),
            lte: endOfWeek(addWeeks(new Date(), 3), { weekStartsOn: 1 }),
          },
        },
        include: {
          bookings: {
            where: {
              status: { in: ['CONFIRMED', 'ACCEPTED'] },
            },
            include: {
              worker: {
                include: { user: true },
              },
            },
          },
        },
        orderBy: { date: 'asc' },
      },
    },
  });

  if (!demoClient) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <IconAlertCircle className="size-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">No Client Data</h2>
        <p className="text-muted-foreground">Please contact your administrator.</p>
      </div>
    );
  }

  const shifts = serialize(demoClient.careShifts);

  // Group shifts by week
  const shiftsByWeek = shifts.reduce((acc, shift) => {
    const weekStart = startOfWeek(new Date(shift.date), { weekStartsOn: 1 });
    const weekKey = format(weekStart, 'yyyy-MM-dd');
    if (!acc[weekKey]) {
      acc[weekKey] = [];
    }
    acc[weekKey].push(shift);
    return acc;
  }, {} as Record<string, typeof shifts>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Care Schedule</h1>
        <p className="text-muted-foreground">View your upcoming care visits</p>
      </div>

      {Object.keys(shiftsByWeek).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <IconCalendarWeek className="mx-auto size-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No visits scheduled</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(shiftsByWeek).map(([weekKey, weekShifts]) => {
          const weekStart = new Date(weekKey);
          const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
          const isCurrentWeek = isToday(weekStart) || (new Date() >= weekStart && new Date() <= weekEnd);

          return (
            <Card key={weekKey}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconCalendarWeek className="size-5" />
                  Week of {format(weekStart, 'MMMM d')}
                  {isCurrentWeek && (
                    <Badge className="bg-sky-500/15 text-sky-600">This Week</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {weekShifts.map((shift) => {
                  const shiftDate = new Date(shift.date);
                  const caregiver = shift.bookings[0]?.worker;

                  return (
                    <div
                      key={shift.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">
                            {isToday(shiftDate) ? 'Today' : isTomorrow(shiftDate) ? 'Tomorrow' : format(shiftDate, 'EEEE, MMM d')}
                          </span>
                          <Badge className={statusColors[shift.status]}>
                            {shift.status === 'OPEN' ? 'Pending Assignment' : shift.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <IconClock className="size-3.5" />
                            {shift.startTime} - {shift.endTime}
                          </span>
                          <span>{shift.serviceType}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {caregiver ? (
                          <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-sm font-semibold dark:bg-sky-900/50 dark:text-sky-400">
                              {caregiver.user.firstName[0]}{caregiver.user.lastName[0]}
                            </div>
                            <span className="text-sm font-medium">
                              {caregiver.user.firstName}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <IconUser className="size-4" />
                            <span className="text-sm">Assigning...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
