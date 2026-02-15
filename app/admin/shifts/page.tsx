import { db } from '@/lib/db';
import { serialize } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShiftsTable } from './shifts-table';

export const metadata = {
  title: 'Shifts | Admin',
  description: 'Manage care shifts',
};

export default async function ShiftsPage() {
  const shifts = await db.careShift.findMany({
    include: {
      client: {
        include: {
          user: true,
        },
      },
      bookings: {
        include: {
          worker: {
            include: {
              user: true,
            },
          },
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  });

  // Serialize Prisma objects to plain objects for client components
  const serializedShifts = serialize(shifts);

  const openShifts = serializedShifts.filter((s) => s.status === 'OPEN');
  const bookedShifts = serializedShifts.filter((s) => ['BOOKED', 'IN_PROGRESS'].includes(s.status));
  const completedShifts = serializedShifts.filter((s) => s.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shifts</h1>
          <p className="text-muted-foreground">Manage care shifts and assignments</p>
        </div>
        {/* Future: Add "Create Shift" button */}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Open</p>
          <p className="text-2xl font-bold text-foreground">{openShifts.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Booked</p>
          <p className="text-2xl font-bold text-foreground">{bookedShifts.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-foreground">{completedShifts.length}</p>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All Shifts ({shifts.length})
          </TabsTrigger>
          <TabsTrigger value="open">
            Open ({openShifts.length})
          </TabsTrigger>
          <TabsTrigger value="booked">
            Booked ({bookedShifts.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedShifts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <ShiftsTable shifts={serializedShifts} />
        </TabsContent>

        <TabsContent value="open" className="mt-4">
          <ShiftsTable shifts={openShifts} />
        </TabsContent>

        <TabsContent value="booked" className="mt-4">
          <ShiftsTable shifts={bookedShifts} />
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <ShiftsTable shifts={completedShifts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
