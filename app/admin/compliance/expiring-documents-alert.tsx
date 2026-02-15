/**
 * Expiring Documents Alert Component
 *
 * Alert banner showing documents expiring soon.
 */

import Link from 'next/link';
import { ComplianceDoc, Worker, PortalUser } from '@prisma/client';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

type DocumentWithWorker = ComplianceDoc & {
  worker: Worker & {
    user: PortalUser;
  };
};

interface ExpiringDocumentsAlertProps {
  documents: DocumentWithWorker[];
}

export function ExpiringDocumentsAlert({ documents }: ExpiringDocumentsAlertProps) {
  if (documents.length === 0) return null;

  // Group by worker for better readability
  const byWorker = documents.reduce((acc, doc) => {
    const key = doc.workerId;
    if (!acc[key]) {
      acc[key] = {
        worker: doc.worker,
        documents: [],
      };
    }
    acc[key].documents.push(doc);
    return acc;
  }, {} as Record<string, { worker: DocumentWithWorker['worker']; documents: ComplianceDoc[] }>);

  const workerCount = Object.keys(byWorker).length;

  return (
    <div className="rounded-xl border border-orange-500/40 bg-orange-50 dark:bg-orange-900/20 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-2">
          <IconAlertTriangle className="size-5 text-orange-600 dark:text-orange-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-orange-800 dark:text-orange-400">
            Expiring Documents
          </h3>
          <p className="mt-1 text-sm text-orange-700 dark:text-orange-400/80">
            {documents.length} document{documents.length !== 1 ? 's' : ''} from{' '}
            {workerCount} worker{workerCount !== 1 ? 's' : ''} will expire within 30 days.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(byWorker)
              .slice(0, 3)
              .map(([workerId, { worker, documents: docs }]) => (
                <Link key={workerId} href={`/admin/workers/${workerId}`}>
                  <Button variant="outline" size="sm" className="border-orange-500/40 hover:bg-orange-100 dark:hover:bg-orange-900/30">
                    {worker.user.firstName} {worker.user.lastName} ({docs.length})
                  </Button>
                </Link>
              ))}
            {workerCount > 3 && (
              <Button variant="ghost" size="sm" className="text-orange-700 dark:text-orange-400">
                +{workerCount - 3} more
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
