/**
 * Compliance Review Queue Component
 *
 * Displays documents pending review with approve/reject actions.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ComplianceDoc, Worker, PortalUser, DocStatus } from '@prisma/client';
import type { Serialized } from '@/lib/utils';
import {
  IconFileText,
  IconCheck,
  IconX,
  IconExternalLink,
  IconUser,
  IconClock,
  IconAlertTriangle,
  IconLoader2,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { approveComplianceDocument, rejectComplianceDocument } from '@/app/actions';

type DocumentWithWorker = Serialized<ComplianceDoc & {
  worker: Worker & {
    user: PortalUser;
  };
}>;

interface ComplianceReviewQueueProps {
  documents: DocumentWithWorker[];
  showExpiry?: boolean;
  showStatus?: boolean;
}

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

const statusConfig: Record<DocStatus, { label: string; color: string }> = {
  PENDING_REVIEW: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' },
  APPROVED: { label: 'Approved', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500' },
  EXPIRED: { label: 'Expired', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500' },
};

export function ComplianceReviewQueue({
  documents,
  showExpiry = false,
  showStatus = false,
}: ComplianceReviewQueueProps) {
  const [actionDoc, setActionDoc] = useState<DocumentWithWorker | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/50 bg-card p-12 text-center">
        <IconFileText className="mx-auto size-12 text-muted-foreground/50" />
        <p className="mt-4 text-lg font-medium text-muted-foreground">
          No documents to review
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          All caught up! Check back later for new submissions.
        </p>
      </div>
    );
  }

  const handleApprove = async () => {
    if (!actionDoc) return;
    setIsProcessing(true);

    try {
      // In production, get admin ID from Clerk session
      const result = await approveComplianceDocument(actionDoc.id, 'admin');
      if (!result.success) {
        console.error('Approval failed:', result.error);
      }
    } catch (error) {
      console.error('Approval error:', error);
    } finally {
      setIsProcessing(false);
      setActionDoc(null);
      setActionType(null);
    }
  };

  const handleReject = async () => {
    if (!actionDoc || !rejectionNote.trim()) return;
    setIsProcessing(true);

    try {
      const result = await rejectComplianceDocument(actionDoc.id, 'admin', rejectionNote);
      if (!result.success) {
        console.error('Rejection failed:', result.error);
      }
    } catch (error) {
      console.error('Rejection error:', error);
    } finally {
      setIsProcessing(false);
      setActionDoc(null);
      setActionType(null);
      setRejectionNote('');
    }
  };

  const getDaysUntilExpiry = (expiresAt: Date | null) => {
    if (!expiresAt) return null;
    const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <>
      <div className="space-y-3">
        {documents.map((doc) => {
          const daysUntilExpiry = getDaysUntilExpiry(doc.expiresAt);
          const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;
          const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;

          return (
            <div
              key={doc.id}
              className={cn(
                'relative overflow-hidden rounded-xl border p-4 transition-all hover:shadow-md',
                'border-border/50 bg-card'
              )}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Document Info */}
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <IconFileText className="size-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{doc.name}</p>
                      {showStatus && (
                        <Badge className={statusConfig[doc.status].color}>
                          {statusConfig[doc.status].label}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {docTypeLabels[doc.type] || doc.type}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Link
                        href={`/admin/workers/${doc.workerId}`}
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <IconUser className="size-4" />
                        {doc.worker.user.firstName} {doc.worker.user.lastName}
                      </Link>
                      <span className="flex items-center gap-1">
                        <IconClock className="size-4" />
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {showExpiry && doc.expiresAt && (
                      <div
                        className={cn(
                          'flex items-center gap-1 text-sm',
                          isExpired
                            ? 'text-red-600 dark:text-red-500'
                            : isExpiringSoon
                            ? 'text-orange-600 dark:text-orange-500'
                            : 'text-muted-foreground'
                        )}
                      >
                        <IconAlertTriangle className="size-4" />
                        {isExpired
                          ? 'Expired'
                          : `Expires in ${daysUntilExpiry} days`}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(doc.fileUrl, '_blank')}
                  >
                    <IconExternalLink className="mr-1 size-4" />
                    View
                  </Button>
                  {doc.status === 'PENDING_REVIEW' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        onClick={() => {
                          setActionDoc(doc);
                          setActionType('approve');
                        }}
                      >
                        <IconCheck className="mr-1 size-4" />
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => {
                          setActionDoc(doc);
                          setActionType('reject');
                        }}
                      >
                        <IconX className="mr-1 size-4" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Approval Confirmation Dialog */}
      <Dialog
        open={actionType === 'approve' && !!actionDoc}
        onOpenChange={() => {
          setActionDoc(null);
          setActionType(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Document?</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve &quot;{actionDoc?.name}&quot; for{' '}
              {actionDoc?.worker.user.firstName} {actionDoc?.worker.user.lastName}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionDoc(null);
                setActionType(null);
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isProcessing ? (
                <>
                  <IconLoader2 className="mr-2 size-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <IconCheck className="mr-2 size-4" />
                  Approve
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog
        open={actionType === 'reject' && !!actionDoc}
        onOpenChange={() => {
          setActionDoc(null);
          setActionType(null);
          setRejectionNote('');
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting &quot;{actionDoc?.name}&quot;. This will be
              visible to the worker.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejection-note">Rejection Reason *</Label>
            <Textarea
              id="rejection-note"
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              placeholder="e.g., Document is expired, image is blurry, etc."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionDoc(null);
                setActionType(null);
                setRejectionNote('');
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={isProcessing || !rejectionNote.trim()}
              variant="destructive"
            >
              {isProcessing ? (
                <>
                  <IconLoader2 className="mr-2 size-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <IconX className="mr-2 size-4" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
