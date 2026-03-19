import { db } from '@/lib/db';
import { AuditLogTable } from './audit-log-table';

export const metadata = {
  title: 'Audit Log | Admin Dashboard',
  description: 'View activity and audit trail',
};

export default async function AuditLogPage() {
  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  // Get unique entity types and actions for filters
  const entities: string[] = [...new Set(logs.map((l: { entity: string }) => l.entity))];
  const actions: string[] = [...new Set(logs.map((l: { action: string }) => l.action))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Activity Log</h1>
        <p className="text-muted-foreground">
          Track all admin actions and changes
        </p>
      </div>

      <AuditLogTable logs={logs} entities={entities} actions={actions} />
    </div>
  );
}
