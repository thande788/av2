'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SendEmailDialog } from '@/components/admin/send-email-dialog';
import { formatDateUS } from '@/lib/utils';
import { markContactAsRead } from '../contacts/actions';
import { useRouter } from 'next/navigation';
import { UserRoundCheck, Mail, Phone, ChevronRight } from 'lucide-react';
import type { ContactSubmission, Worker, PortalUser } from '@prisma/client';

type RequestWithCaregiver = ContactSubmission & {
  preferredCaregiver: (Worker & { user: PortalUser }) | null;
};

export function CaregiverRequestsCard({ requests }: { requests: RequestWithCaregiver[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<RequestWithCaregiver | null>(null);

  const handleOpen = async (request: RequestWithCaregiver) => {
    setSelected(request);
    if (!request.isRead) {
      await markContactAsRead(request.id);
      router.refresh();
    }
  };

  const unreadCount = requests.filter((r) => !r.isRead).length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserRoundCheck className="size-5 text-primary" />
                Caregiver Requests
                {unreadCount > 0 && (
                  <Badge className="bg-primary/10 text-primary">{unreadCount} new</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Contact submissions where a specific caregiver was requested
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/contacts">
                View All Contacts
                <ChevronRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/50">
            {requests.map((request) => {
              const caregiverName = request.preferredCaregiver
                ? `${request.preferredCaregiver.user.firstName} ${request.preferredCaregiver.user.lastName}`
                : 'Unknown';

              return (
                <button
                  key={request.id}
                  type="button"
                  onClick={() => handleOpen(request)}
                  className="w-full flex items-center gap-4 py-3 px-2 text-left transition-colors hover:bg-muted/50 rounded-lg -mx-2"
                >
                  {!request.isRead && (
                    <span className="size-2 rounded-full bg-primary shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={!request.isRead ? 'font-semibold text-sm' : 'text-sm'}>
                        {request.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateUS(request.submittedAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {request.message}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5">
                    <UserRoundCheck className="size-3.5 text-primary" />
                    <span className="text-sm font-medium">{caregiverName}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Caregiver Request</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              {/* Requested caregiver */}
              <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
                <UserRoundCheck className="size-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium">Requested Caregiver</p>
                  <p className="text-sm text-muted-foreground">
                    {selected.preferredCaregiver
                      ? `${selected.preferredCaregiver.user.firstName} ${selected.preferredCaregiver.user.lastName}`
                      : 'Unknown'}
                  </p>
                </div>
                <Badge className="ml-auto bg-primary/10 text-primary">Preferred</Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selected.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {formatDateUS(selected.submittedAt, 'datetime')}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <a
                  href={`mailto:${selected.email}`}
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Mail className="size-4" />
                  {selected.email}
                </a>
                {selected.phone && (
                  <a
                    href={`tel:${selected.phone}`}
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Phone className="size-4" />
                    {selected.phone}
                  </a>
                )}
              </div>

              {selected.service && (
                <div>
                  <p className="text-sm text-muted-foreground">Service of Interest</p>
                  <Badge variant="secondary" className="mt-1">
                    {selected.service}
                  </Badge>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-2">Message</p>
                <div className="rounded-lg bg-muted p-4">
                  <p className="whitespace-pre-wrap">{selected.message}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelected(null)}>
                  Close
                </Button>
                <SendEmailDialog
                  toEmail={selected.email}
                  toName={selected.name}
                  entity="ContactSubmission"
                  entityId={selected.id}
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
