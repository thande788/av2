'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, type Column, type TableFilter, type BulkAction } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDateUS } from '@/lib/utils';
import { bulkMarkContactsRead, bulkDeleteContacts } from '@/app/actions/audit-log';
import { SendEmailDialog } from '@/components/admin/send-email-dialog';
import { toast } from 'sonner';
import type { ContactSubmission } from '@prisma/client';
import { markContactAsRead } from './actions';
import { Mail, Phone, Check, Trash2, UserRoundCheck } from 'lucide-react';

type CaregiverRef = { id: string; user: { firstName: string; lastName: string } };

type ContactWithCaregiver = ContactSubmission & {
  preferredCaregiver?: CaregiverRef | null;
};

const columns: Column<ContactWithCaregiver>[] = [
  {
    key: 'name',
    header: 'Name',
    mobileTitle: true,
    render: (contact) => (
      <div className="flex items-center gap-2">
        {!contact.isRead && (
          <span className="size-2 rounded-full bg-primary shrink-0" />
        )}
        <span className={!contact.isRead ? 'font-semibold' : ''}>
          {contact.name}
        </span>
      </div>
    ),
  },
  {
    key: 'email',
    header: 'Email',
    hideOnMobile: true,
  },
  {
    key: 'service',
    header: 'Service',
    render: (contact) => contact.service || '-',
  },
  {
    key: 'preferredCaregiverId',
    header: 'Requested Caregiver',
    hideOnMobile: true,
    render: (contact) => {
      if (!contact.preferredCaregiver) return '-';
      const name = `${contact.preferredCaregiver.user.firstName} ${contact.preferredCaregiver.user.lastName}`;
      return (
        <div className="flex items-center gap-1.5">
          <UserRoundCheck className="size-3.5 text-primary" />
          <span className="text-sm">{name}</span>
        </div>
      );
    },
  },
  {
    key: 'message',
    header: 'Message',
    className: 'max-w-xs',
    hideOnMobile: true,
    render: (contact) => (
      <p className="truncate text-muted-foreground">{contact.message}</p>
    ),
  },
  {
    key: 'submittedAt',
    header: 'Date',
    sortable: true,
    render: (contact) => formatDateUS(contact.submittedAt),
  },
  {
    key: 'isRead',
    header: 'Status',
    render: (contact) =>
      contact.isRead ? (
        <Badge variant="secondary">Read</Badge>
      ) : (
        <Badge className="bg-primary/10 text-primary">New</Badge>
      ),
  },
];

export function ContactsTable({ contacts }: { contacts: ContactWithCaregiver[] }) {
  const router = useRouter();
  const [selectedContact, setSelectedContact] = useState<ContactWithCaregiver | null>(
    null
  );

  const handleRowClick = async (contact: ContactWithCaregiver) => {
    setSelectedContact(contact);
    if (!contact.isRead) {
      await markContactAsRead(contact.id);
    }
  };

  const filters: TableFilter[] = [
    {
      key: 'isRead',
      label: 'Status',
      options: [
        { label: 'Unread', value: 'false' },
        { label: 'Read', value: 'true' },
      ],
    },
  ];

  const bulkActions: BulkAction<ContactWithCaregiver>[] = [
    {
      label: 'Mark Read',
      icon: Check,
      action: async (ids) => {
        try {
          await bulkMarkContactsRead(ids);
          toast.success(`${ids.length} contact(s) marked as read`);
          router.refresh();
        } catch {
          toast.error('Failed to update contacts');
        }
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      action: async (ids) => {
        if (!confirm(`Delete ${ids.length} contact(s)? This cannot be undone.`)) return;
        try {
          await bulkDeleteContacts(ids);
          toast.success(`${ids.length} contact(s) deleted`);
          router.refresh();
        } catch {
          toast.error('Failed to delete contacts');
        }
      },
    },
  ];

  return (
    <>
      <DataTable
        data={contacts}
        columns={columns}
        searchKeys={['name', 'email', 'message']}
        onRowClick={handleRowClick}
        emptyMessage="No contact messages yet."
        filters={filters}
        selectable
        bulkActions={bulkActions}
        exportable
        exportFilename="contacts"
      />

      <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Contact Message</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedContact.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {formatDateUS(selectedContact.submittedAt, 'datetime')}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <a
                  href={`mailto:${selectedContact.email}`}
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Mail className="size-4" />
                  {selectedContact.email}
                </a>
                {selectedContact.phone && (
                  <a
                    href={`tel:${selectedContact.phone}`}
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Phone className="size-4" />
                    {selectedContact.phone}
                  </a>
                )}
              </div>

              {selectedContact.service && (
                <div>
                  <p className="text-sm text-muted-foreground">Service of Interest</p>
                  <Badge variant="secondary" className="mt-1">
                    {selectedContact.service}
                  </Badge>
                </div>
              )}

              {selectedContact.urgency && (
                <div>
                  <p className="text-sm text-muted-foreground">Urgency</p>
                  <p className="font-medium capitalize">{selectedContact.urgency}</p>
                </div>
              )}

              {selectedContact.preferredCaregiver && (
                <div>
                  <p className="text-sm text-muted-foreground">Requested Caregiver</p>
                  <div className="mt-1 flex items-center gap-2">
                    <UserRoundCheck className="size-4 text-primary" />
                    <span className="font-medium">
                      {selectedContact.preferredCaregiver.user.firstName}{' '}
                      {selectedContact.preferredCaregiver.user.lastName}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-2">Message</p>
                <div className="rounded-lg bg-muted p-4">
                  <p className="whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedContact(null)}
                >
                  Close
                </Button>
                <SendEmailDialog
                  toEmail={selectedContact.email}
                  toName={selectedContact.name}
                  entity="ContactSubmission"
                  entityId={selectedContact.id}
                  trigger={
                    <Button>
                      <Mail className="size-4 mr-2" />
                      Reply
                    </Button>
                  }
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
