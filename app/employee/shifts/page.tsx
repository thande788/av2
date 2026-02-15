import { redirect } from 'next/navigation';
import { serialize } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShiftRequestsList } from './shift-requests-list';
import { UpcomingShiftsList } from './upcoming-shifts-list';
import { IconCalendar, IconClock, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { getCurrentWorkerWithBookings } from '@/lib/auth';

export const metadata = {
  title: 'My Shifts',
  description: 'View and manage your shifts',
};

export default async function EmployeeShiftsPage() {
  // Get the current authenticated worker
  const worker = await getCurrentWorkerWithBookings();

  if (!worker) {
    redirect('/employee/complete-profile');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Serialize Prisma objects to plain objects for client components
  const serializedBookings = serialize(worker.shiftBookings);

  const pendingBookings = serializedBookings.filter(
    (b) => b.status === 'PENDING'
  );

  const upcomingBookings = serializedBookings.filter(
    (b) =>
      (b.status === 'CONFIRMED' || b.status === 'ACCEPTED') &&
      new Date(b.shift.date) >= today
  );

  const completedBookings = serializedBookings.filter(
    (b) => b.status === 'COMPLETED'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Shifts</h1>
        <p className="text-muted-foreground">View and manage your shift schedule</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
          <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900/30">
            <IconAlertCircle className="size-5 text-yellow-600 dark:text-yellow-500" />
          </div>
          <div>
            <p className="text-xl font-bold">{pendingBookings.length}</p>
            <p className="text-sm text-muted-foreground">Pending Requests</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
          <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
            <IconCalendar className="size-5 text-emerald-600 dark:text-emerald-500" />
          </div>
          <div>
            <p className="text-xl font-bold">{upcomingBookings.length}</p>
            <p className="text-sm text-muted-foreground">Upcoming Shifts</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
            <IconCheck className="size-5 text-blue-600 dark:text-blue-500" />
          </div>
          <div>
            <p className="text-xl font-bold">{completedBookings.length}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <IconAlertCircle className="size-4" />
            Pending ({pendingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="gap-2">
            <IconCalendar className="size-4" />
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <IconCheck className="size-4" />
            Completed ({completedBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <ShiftRequestsList bookings={pendingBookings} />
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4">
          <UpcomingShiftsList bookings={upcomingBookings} />
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <UpcomingShiftsList bookings={completedBookings} showCompleted />
        </TabsContent>
      </Tabs>
    </div>
  );
}
