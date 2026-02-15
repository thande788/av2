import { db } from '@/lib/db';
import { serialize } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TimesheetsTable } from './timesheets-table';

export const metadata = {
  title: 'Timesheets | Admin',
  description: 'Review and approve worker timesheets',
};

export default async function TimesheetsPage() {
  const timesheets = await db.timesheet.findMany({
    include: {
      worker: {
        include: {
          user: true,
        },
      },
      entries: true,
    },
    orderBy: [
      { weekStarting: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  // Serialize Prisma objects to plain objects for client components
  const serializedTimesheets = serialize(timesheets);

  const pendingCount = serializedTimesheets.filter((t) => t.status === 'SUBMITTED').length;
  const approvedCount = serializedTimesheets.filter((t) => t.status === 'APPROVED').length;
  const draftCount = serializedTimesheets.filter((t) => t.status === 'DRAFT').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Timesheets</h1>
          <p className="text-muted-foreground">Review and approve worker timesheets</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-foreground">{serializedTimesheets.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">{pendingCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Approved</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{approvedCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Draft</p>
          <p className="text-2xl font-bold text-muted-foreground">{draftCount}</p>
        </div>
      </div>

      <Tabs defaultValue={pendingCount > 0 ? 'pending' : 'all'} className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All Timesheets
            <Badge variant="secondary" className="ml-2">
              {serializedTimesheets.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Review
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <TimesheetsTable timesheets={serializedTimesheets} />
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <TimesheetsTable 
            timesheets={serializedTimesheets.filter((t) => t.status === 'SUBMITTED')} 
          />
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          <TimesheetsTable 
            timesheets={serializedTimesheets.filter((t) => t.status === 'APPROVED')} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
