import { db } from '@/lib/db';
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

  const activeCount = clients.filter(
    (c) => c.user.status === 'ACTIVE'
  ).length;
  const pendingCount = clients.filter(
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
              {clients.length}
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
          <ClientsTable clients={clients} />
        </TabsContent>
        
        <TabsContent value="active">
          <ClientsTable 
            clients={clients.filter((c) => c.user.status === 'ACTIVE')} 
          />
        </TabsContent>
        
        <TabsContent value="pending">
          <ClientsTable 
            clients={clients.filter((c) => c.user.status === 'PENDING')} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
