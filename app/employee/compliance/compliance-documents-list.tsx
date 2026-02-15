/**
 * Compliance Documents List Component
 *
 * Displays a grid of compliance document cards with status badges.
 */

'use client';

import { useState } from 'react';
import { ComplianceDoc, DocStatus } from '@prisma/client';
import {
  IconFileText,
  IconCheck,
  IconClock,
  IconX,
  IconAlertTriangle,
  IconExternalLink,
  IconTrash,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteComplianceDocument } from '@/app/actions';

interface ComplianceDocumentsListProps {
  documents: ComplianceDoc[];
  workerId: string;
}

const statusConfig: Record<
  DocStatus,
  { label: string; icon: typeof IconCheck; color: string; bgColor: string }
> = {
  APPROVED: {
    label: 'Approved',
    icon: IconCheck,
    color: 'text-emerald-600 dark:text-emerald-500',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  PENDING_REVIEW: {
    label: 'Pending Review',
    icon: IconClock,
    color: 'text-yellow-600 dark:text-yellow-500',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  REJECTED: {
    label: 'Rejected',
    icon: IconX,
    color: 'text-red-600 dark:text-red-500',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  EXPIRED: {
    label: 'Expired',
    icon: IconAlertTriangle,
    color: 'text-orange-600 dark:text-orange-500',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
};

const docTypeLabels: Record<string, string> = {
  DRIVERS_LICENSE: "Driver's License",
  CPR_CERTIFICATION: 'CPR Certification',
  CNA_LICENSE: 'CNA License',
  HHA_CERTIFICATION: 'HHA Certification',
  BACKGROUND_CHECK: 'Background Check',
  TB_TEST: 'TB Test',
  PHYSICAL_EXAM: 'Physical Exam',
  I9_FORM: 'I-9 Form',
  W4_FORM: 'W-4 Form',
  DIRECT_DEPOSIT: 'Direct Deposit',
  OTHER: 'Other Document',
};

export function ComplianceDocumentsList({
  documents,
  workerId,
}: ComplianceDocumentsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/50 bg-card p-12 text-center">
        <IconFileText className="mx-auto size-12 text-muted-foreground/50" />
        <p className="mt-4 text-lg font-medium text-muted-foreground">
          No documents uploaded yet
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Click &quot;Upload Document&quot; to add your first compliance document.
        </p>
      </div>
    );
  }

  const handleDelete = async (documentId: string) => {
    setDeletingId(documentId);
    try {
      const result = await deleteComplianceDocument(documentId, workerId);
      if (!result.success) {
        console.error('Failed to delete:', result.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => {
        const config = statusConfig[doc.status];
        const StatusIcon = config.icon;
        const isExpiringSoon =
          doc.expiresAt &&
          doc.status === 'APPROVED' &&
          new Date(doc.expiresAt) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        return (
          <div
            key={doc.id}
            className={cn(
              'relative overflow-hidden rounded-xl border p-4 transition-all hover:shadow-md',
              'border-border/50 bg-card',
              doc.status === 'REJECTED' && 'border-red-500/40'
            )}
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-500/10 p-2">
                    <IconFileText className="size-5 text-emerald-600 dark:text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {docTypeLabels[doc.type] || doc.type}
                    </p>
                  </div>
                </div>
                <Badge className={cn('font-medium', config.bgColor, config.color)}>
                  <StatusIcon className="mr-1 size-3" />
                  {config.label}
                </Badge>
              </div>

              {/* Details */}
              <div className="space-y-1 text-sm">
                {doc.issuedDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Issued:</span>
                    <span>{new Date(doc.issuedDate).toLocaleDateString()}</span>
                  </div>
                )}
                {doc.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expires:</span>
                    <span
                      className={cn(
                        isExpiringSoon && 'font-medium text-orange-600 dark:text-orange-500'
                      )}
                    >
                      {new Date(doc.expiresAt).toLocaleDateString()}
                      {isExpiringSoon && (
                        <IconAlertTriangle className="ml-1 inline size-3" />
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uploaded:</span>
                  <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Rejection Note */}
              {doc.status === 'REJECTED' && doc.rejectionNote && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm">
                  <p className="font-medium text-red-700 dark:text-red-400">Rejection Reason:</p>
                  <p className="mt-1 text-red-600 dark:text-red-400">{doc.rejectionNote}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(doc.fileUrl, '_blank')}
                >
                  <IconExternalLink className="mr-1 size-4" />
                  View
                </Button>
                {doc.status !== 'APPROVED' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        disabled={deletingId === doc.id}
                      >
                        <IconTrash className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Document?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;{doc.name}&quot;? This action cannot
                          be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(doc.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
