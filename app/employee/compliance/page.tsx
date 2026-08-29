/**
 * Employee Compliance Documents Page
 *
 * Displays the worker's compliance documents and allows uploading new ones.
 */

import { Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { serialize } from '@/lib/utils';
import { getCurrentWorkerWithCompliance } from '@/lib/auth';
import { maybeSignBlobReadUrl } from '@/lib/azure-blob';
import { ComplianceDocumentsList } from './compliance-documents-list';
import { UploadDocumentDialog } from './upload-document-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Compliance Documents',
  description: 'View and upload your compliance documents',
};

async function getWorkerWithDocs() {
  return getCurrentWorkerWithCompliance();
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
    redirect('/employee/complete-profile');
  }

  const docsWithSignedUrls = await Promise.all(
    worker.complianceDocs.map(async (doc) => ({
      ...doc,
      fileUrl: (await maybeSignBlobReadUrl(doc.fileUrl)) || doc.fileUrl,
    })),
  );

  const serializedDocs = serialize(docsWithSignedUrls);

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
