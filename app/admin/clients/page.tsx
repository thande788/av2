import { db } from '@/lib/db';
import { serialize } from '@/lib/utils';
import { ClientsTable } from './clients-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Clients | Admin Dashboard',
  description: 'Manage client accounts and care recipients',
};

export default async function ClientsPage() {
  const clients = await db.client.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
    },
  });

  // Serialize Prisma objects to plain objects for client components
  const serializedClients = serialize(clients);

  const activeCount = serializedClients.filter(
    (c) => c.user.status === 'ACTIVE'
  ).length;
  const pendingCount = serializedClients.filter(
    (c) => c.user.status === 'PENDING'
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clients</h1>
        <p className="text-muted-foreground">
          Manage client accounts and care recipients
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All Clients
            <Badge variant="secondary" className="ml-2">
              {serializedClients.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="active">
            Active
            <Badge variant="secondary" className="ml-2">
              {activeCount}
            </Badge>
          </TabsTrigger>
          {pendingCount > 0 && (
            <TabsTrigger value="pending">
              Pending
              <Badge variant="destructive" className="ml-2">
                {pendingCount}
              </Badge>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all">
          <ClientsTable clients={serializedClients} />
        </TabsContent>
        
        <TabsContent value="active">
          <ClientsTable 
            clients={serializedClients.filter((c) => c.user.status === 'ACTIVE')} 
          />
        </TabsContent>
        
        <TabsContent value="pending">
          <ClientsTable 
            clients={serializedClients.filter((c) => c.user.status === 'PENDING')} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
