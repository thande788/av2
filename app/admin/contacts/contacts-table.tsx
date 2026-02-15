'use client';

import { useState } from 'react';
import { DataTable, type Column } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import type { ContactSubmission } from '@prisma/client';
import { markContactAsRead } from './actions';
import { Mail, Phone, Check, Eye } from 'lucide-react';

const columns: Column<ContactSubmission>[] = [
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
    render: (contact) => format(contact.submittedAt, 'MMM d, yyyy'),
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

export function ContactsTable({ contacts }: { contacts: ContactSubmission[] }) {
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(
    null
  );

  const handleRowClick = async (contact: ContactSubmission) => {
    setSelectedContact(contact);
    if (!contact.isRead) {
      await markContactAsRead(contact.id);
    }
  };

  return (
    <>
      <DataTable
        data={contacts}
        columns={columns}
        searchKeys={['name', 'email', 'message']}
        onRowClick={handleRowClick}
        emptyMessage="No contact messages yet."
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
                    {format(selectedContact.submittedAt, 'MMMM d, yyyy h:mm a')}
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
                <Button asChild>
                  <a href={`mailto:${selectedContact.email}`}>
                    <Mail className="size-4 mr-2" />
                    Reply
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
