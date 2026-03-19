'use client';

import { useState } from 'react';
import { DataTable, type Column, type TableFilter, type BulkAction } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDateUS } from '@/lib/utils';
import { bulkUpdateInquiryStatus, bulkDeleteInquiries } from '@/app/actions/audit-log';
import { SendEmailDialog } from '@/components/admin/send-email-dialog';
import { toast } from 'sonner';
import type { ServiceInquiry, InquiryStatus } from '@prisma/client';
import { updateInquiryStatus } from './actions';
import { Mail, Phone, Calendar, Clock, Save, Loader2, Trash2, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const statusColors: Record<InquiryStatus, string> = {
  NEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  CONTACTED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  CONSULTATION_SCHEDULED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  CONVERTED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

const statusLabels: Record<InquiryStatus, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  CONSULTATION_SCHEDULED: 'Consultation Scheduled',
  CONVERTED: 'Converted',
  CLOSED: 'Closed',
};

const statusOptions: InquiryStatus[] = [
  'NEW',
  'CONTACTED',
  'CONSULTATION_SCHEDULED',
  'CONVERTED',
  'CLOSED',
];

const columns: Column<ServiceInquiry>[] = [
  {
    key: 'name',
    header: 'Name',
    mobileTitle: true,
    render: (inquiry) => (
      <div className="flex items-center gap-2">
        {inquiry.status === 'NEW' && (
          <span className="size-2 rounded-full bg-primary shrink-0" />
        )}
        <span className={inquiry.status === 'NEW' ? 'font-semibold' : ''}>
          {inquiry.name}
        </span>
      </div>
    ),
  },
  {
    key: 'serviceType',
    header: 'Service',
    render: (inquiry) => (
      <Badge variant="secondary">{inquiry.serviceType}</Badge>
    ),
  },
  {
    key: 'phone',
    header: 'Phone',
    hideOnMobile: true,
  },
  {
    key: 'hoursNeeded',
    header: 'Hours/Week',
    hideOnMobile: true,
    render: (inquiry) => (inquiry.hoursNeeded ? `${inquiry.hoursNeeded} hrs` : '-'),
  },
  {
    key: 'submittedAt',
    header: 'Date',
    sortable: true,
    render: (inquiry) => formatDateUS(inquiry.submittedAt),
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (inquiry) => (
      <Badge className={statusColors[inquiry.status]} variant="secondary">
        {statusLabels[inquiry.status]}
      </Badge>
    ),
  },
];

export function InquiriesTable({ inquiries }: { inquiries: ServiceInquiry[] }) {
  const router = useRouter();
  const [selectedInquiry, setSelectedInquiry] = useState<ServiceInquiry | null>(
    null
  );
  const [status, setStatus] = useState<InquiryStatus | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleRowClick = (inquiry: ServiceInquiry) => {
    setSelectedInquiry(inquiry);
    setStatus(inquiry.status);
  };

  const handleSaveStatus = async () => {
    if (!selectedInquiry || !status) return;
    setIsSaving(true);
    try {
      await updateInquiryStatus(selectedInquiry.id, status);
      toast.success(`Status updated to ${statusLabels[status]}`);
      router.refresh();
      setSelectedInquiry(null);
    } catch {
      toast.error('Failed to update inquiry');
    } finally {
      setIsSaving(false);
    }
  };

  const filters: TableFilter[] = [
    {
      key: 'status',
      label: 'Status',
      options: statusOptions.map((s) => ({ label: statusLabels[s], value: s })),
    },
  ];

  const bulkActions: BulkAction<ServiceInquiry>[] = [
    {
      label: 'Mark Contacted',
      icon: CheckCircle,
      action: async (ids) => {
        try {
          await bulkUpdateInquiryStatus(ids, 'CONTACTED');
          toast.success(`${ids.length} inquiry(ies) marked as Contacted`);
          router.refresh();
        } catch {
          toast.error('Failed to update inquiries');
        }
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      action: async (ids) => {
        if (!confirm(`Delete ${ids.length} inquiry(ies)? This cannot be undone.`)) return;
        try {
          await bulkDeleteInquiries(ids);
          toast.success(`${ids.length} inquiry(ies) deleted`);
          router.refresh();
        } catch {
          toast.error('Failed to delete inquiries');
        }
      },
    },
  ];

  return (
    <>
      <DataTable
        data={inquiries}
        columns={columns}
        searchKeys={['name', 'email', 'phone', 'serviceType']}
        onRowClick={handleRowClick}
        emptyMessage="No service inquiries yet."
        filters={filters}
        selectable
        bulkActions={bulkActions}
        exportable
        exportFilename="inquiries"
      />

      <Dialog
        open={!!selectedInquiry}
        onOpenChange={() => setSelectedInquiry(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Service Inquiry</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedInquiry.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {formatDateUS(selectedInquiry.submittedAt, 'datetime')}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <a
                  href={`mailto:${selectedInquiry.email}`}
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Mail className="size-4" />
                  {selectedInquiry.email}
                </a>
                <a
                  href={`tel:${selectedInquiry.phone}`}
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Phone className="size-4" />
                  {selectedInquiry.phone}
                </a>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Service Type</p>
                  <Badge variant="secondary" className="mt-1">
                    {selectedInquiry.serviceType}
                  </Badge>
                </div>
                {selectedInquiry.careRecipient && (
                  <div>
                    <p className="text-sm text-muted-foreground">Care Recipient</p>
                    <p className="font-medium">{selectedInquiry.careRecipient}</p>
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {selectedInquiry.startDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Desired Start</p>
                      <p className="font-medium">
                        {formatDateUS(selectedInquiry.startDate)}
                      </p>
                    </div>
                  </div>
                )}
                {selectedInquiry.hoursNeeded && (
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Hours Needed</p>
                      <p className="font-medium">
                        {selectedInquiry.hoursNeeded} hours/week
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {selectedInquiry.message && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Additional Notes
                  </p>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="whitespace-pre-wrap">{selectedInquiry.message}</p>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Update Status</p>
                <div className="flex gap-2">
                  <Select
                    value={status || undefined}
                    onValueChange={(val) => setStatus(val as InquiryStatus)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s} value={s}>
                          {statusLabels[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleSaveStatus}
                    disabled={status === selectedInquiry.status || isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedInquiry(null)}
                >
                  Close
                </Button>
                <SendEmailDialog
                  toEmail={selectedInquiry.email}
                  toName={selectedInquiry.name}
                  entity="ServiceInquiry"
                  entityId={selectedInquiry.id}
                  trigger={
                    <Button variant="outline">
                      <Mail className="size-4 mr-2" />
                      Email
                    </Button>
                  }
                />
                <Button asChild>
                  <a href={`tel:${selectedInquiry.phone}`}>
                    <Phone className="size-4 mr-2" />
                    Call
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
