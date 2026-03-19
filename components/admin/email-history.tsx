'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { formatDateUS } from '@/lib/utils';
import { getEntityEmailHistory } from '@/app/actions/admin-email';
import { Mail, Clock } from 'lucide-react';
import type { AdminEmail } from '@prisma/client';

interface EmailHistoryProps {
  entity: string;
  entityId: string;
}

export function EmailHistory({ entity, entityId }: EmailHistoryProps) {
  const [emails, setEmails] = useState<AdminEmail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEntityEmailHistory(entity, entityId)
      .then(setEmails)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [entity, entityId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="size-4 animate-pulse" />
        Loading emails...
      </div>
    );
  }

  if (emails.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Email History
      </h3>
      <div className="space-y-2">
        {emails.map((email) => (
          <div
            key={email.id}
            className="rounded-lg border border-border/50 p-3 text-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Mail className="size-3.5 text-muted-foreground" />
                <span className="font-medium truncate">{email.subject}</span>
              </div>
              <Badge
                variant={email.status === 'SENT' ? 'secondary' : 'destructive'}
                className="text-xs shrink-0"
              >
                {email.status}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span>To: {email.toEmail}</span>
              <span>By: {email.sentByName || 'Admin'}</span>
              <span>{formatDateUS(email.createdAt, 'datetime')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
