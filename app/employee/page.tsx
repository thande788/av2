import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  IconCalendar,
  IconClock,
  IconCurrencyDollar,
  IconAlertCircle,
} from '@tabler/icons-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EmployeeStatCard } from '@/components/employee/stat-card';

export const metadata = {
  title: 'Dashboard',
  description: 'Employee dashboard overview',
};

export default async function EmployeeDashboardPage() {
  // In real app, get worker ID from auth session
  // For demo, we'll use the first active worker
  const demoWorker = await db.worker.findFirst({
    where: {
      user: {
        status: 'ACTIVE',
      },
    },
    include: {
      user: true,
      shiftBookings: {
        include: {
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
        orderBy: {
          shift: {
            date: 'asc',
          },
        },
      },
    },
  });

  if (!demoWorker) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <IconAlertCircle className="size-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">No Worker Data</h2>
        <p className="text-muted-foreground">Run the seed script to create demo workers.</p>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter upcoming shifts
  const upcomingShifts = demoWorker.shiftBookings.filter(
    (b) =>
      (b.status === 'CONFIRMED' || b.status === 'ACCEPTED') &&
      new Date(b.shift.date) >= today
  );

  // Filter pending requests
  const pendingRequests = demoWorker.shiftBookings.filter(
    (b) => b.status === 'PENDING'
  );

  // Calculate stats
  const completedShifts = demoWorker.shiftBookings.filter(
    (b) => b.status === 'COMPLETED'
  );

  const totalHours = completedShifts.reduce(
    (acc, b) => acc + Number(b.shift.duration),
    0
  );

  const totalEarnings = completedShifts.reduce(
    (acc, b) => acc + Number(b.shift.workerRate || b.shift.clientRate) * Number(b.shift.duration),
    0
  );

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {demoWorker.user.firstName}!
        </h1>
        <p className="text-muted-foreground">Here&apos;s your overview for today</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <EmployeeStatCard
          title="Upcoming Shifts"
          value={upcomingShifts.length.toString()}
          icon={IconCalendar}
          variant="success"
        />

        <EmployeeStatCard
          title="Pending Requests"
          value={pendingRequests.length.toString()}
          icon={IconAlertCircle}
          variant="warning"
        />

        <EmployeeStatCard
          title="Hours This Month"
          value={totalHours.toFixed(1)}
          icon={IconClock}
          variant="default"
        />

        <EmployeeStatCard
          title="Earnings This Month"
          value={`$${totalEarnings.toFixed(2)}`}
          icon={IconCurrencyDollar}
          variant="info"
        />
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <IconAlertCircle className="size-5 text-yellow-500" />
              Pending Shift Requests
            </CardTitle>
            <Link href="/employee/shifts?tab=pending">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.slice(0, 3).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">
                      {booking.shift.client.user.firstName} {booking.shift.client.user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.shift.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      • {booking.shift.startTime} - {booking.shift.endTime}
                    </p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                    Pending Response
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Shifts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <IconCalendar className="size-5" />
            Upcoming Shifts
          </CardTitle>
          <Link href="/employee/shifts">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {upcomingShifts.length > 0 ? (
            <div className="space-y-3">
              {upcomingShifts.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">
                      {booking.shift.client.user.firstName} {booking.shift.client.user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.shift.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      • {booking.shift.startTime} - {booking.shift.endTime}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.shift.serviceType} • {Number(booking.shift.duration).toFixed(1)} hrs
                    </p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500">
                    Confirmed
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">
              No upcoming shifts scheduled.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
