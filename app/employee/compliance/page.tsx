/**
 * Employee Compliance Documents Page
 *
 * Displays the worker's compliance documents and allows uploading new ones.
 */

import { Suspense } from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { serialize } from '@/lib/utils';
import { ComplianceDocumentsList } from './compliance-documents-list';
import { UploadDocumentDialog } from './upload-document-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Compliance Documents',
  description: 'View and upload your compliance documents',
};

// For demo, we use a hardcoded worker ID
// In production, this would come from the authenticated user's session
const DEMO_WORKER_ID = 'demo-worker-1';

async function getWorkerWithDocs() {
  // In production: get worker ID from Clerk session
  // const { userId } = auth();
  // const worker = await db.worker.findFirst({ where: { user: { clerkId: userId } } });

  // For demo, find the first worker
  const worker = await db.worker.findFirst({
    include: {
      user: true,
      complianceDocs: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return worker;
}

function CompliancePageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

async function ComplianceContent() {
  const worker = await getWorkerWithDocs();

  if (!worker) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-8 text-center">
        <p className="text-muted-foreground">Worker profile not found.</p>
      </div>
    );
  }

  // Serialize Prisma objects to plain objects for client components
  const serializedDocs = serialize(worker.complianceDocs);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Compliance Documents
          </h1>
          <p className="mt-1 text-muted-foreground">
            Upload and manage your required compliance documents
          </p>
        </div>
        <UploadDocumentDialog workerId={worker.id} />
      </div>

      {/* Status Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          label="Total Documents"
          value={serializedDocs.length}
          variant="default"
        />
        <StatusCard
          label="Approved"
          value={serializedDocs.filter((d) => d.status === 'APPROVED').length}
          variant="success"
        />
        <StatusCard
          label="Pending Review"
          value={serializedDocs.filter((d) => d.status === 'PENDING_REVIEW').length}
          variant="warning"
        />
        <StatusCard
          label="Needs Action"
          value={serializedDocs.filter((d) => d.status === 'REJECTED').length}
          variant="danger"
        />
      </div>

      {/* Documents List */}
      <ComplianceDocumentsList documents={serializedDocs} workerId={worker.id} />
    </div>
  );
}

function StatusCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: 'default' | 'success' | 'warning' | 'danger';
}) {
  const styles = {
    default: 'border-border/50 bg-card',
    success: 'border-emerald-500/40 bg-emerald-500/5',
    warning: 'border-yellow-500/40 bg-yellow-500/5',
    danger: 'border-red-500/40 bg-red-500/5',
  };

  const valueColors = {
    default: 'text-foreground',
    success: 'text-emerald-600 dark:text-emerald-500',
    warning: 'text-yellow-600 dark:text-yellow-500',
    danger: 'text-red-600 dark:text-red-500',
  };

  return (
    <div className={`rounded-xl border p-4 ${styles[variant]}`}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold ${valueColors[variant]}`}>{value}</p>
    </div>
  );
}

export default function CompliancePage() {
  return (
    <Suspense fallback={<CompliancePageSkeleton />}>
      <ComplianceContent />
    </Suspense>
  );
}
