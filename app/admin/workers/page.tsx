import { db } from '@/lib/db';
import { serialize } from '@/lib/utils';
import { WorkersTable } from './workers-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Workers | Admin Dashboard',
  description: 'Manage caregivers and staff',
};

export default async function WorkersPage() {
  const workers = await db.worker.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
    },
  });

  // Serialize Prisma objects to plain objects for client components
  const serializedWorkers = serialize(workers);

  const pendingCount = serializedWorkers.filter(
    (w) => w.user.status === 'PENDING'
  ).length;
  const activeCount = serializedWorkers.filter(
    (w) => w.user.status === 'ACTIVE'
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Workers</h1>
        <p className="text-muted-foreground">
          Manage caregivers and staff members
        </p>
      </div>

      <Tabs defaultValue={pendingCount > 0 ? 'pending' : 'all'} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All Workers
            <Badge variant="secondary" className="ml-2">
              {serializedWorkers.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Approval
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">
            Active
            <Badge variant="secondary" className="ml-2">
              {activeCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <WorkersTable workers={serializedWorkers} />
        </TabsContent>
        
        <TabsContent value="pending">
          <WorkersTable 
            workers={serializedWorkers.filter((w) => w.user.status === 'PENDING')} 
          />
        </TabsContent>
        
        <TabsContent value="active">
          <WorkersTable 
            workers={serializedWorkers.filter((w) => w.user.status === 'ACTIVE')} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
