'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { formatDateUS } from '@/lib/utils';
import { getEntityAuditLog } from '@/app/actions/audit-log';
import { Clock, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AuditLog } from '@prisma/client';

const actionIcons: Record<string, string> = {
  STATUS_CHANGE: '🔄',
  EMAIL_SENT: '📧',
  BULK_STATUS_UPDATE: '📋',
  BULK_MARK_READ: '✅',
  BULK_DELETE: '🗑️',
  CREATED: '✨',
  UPDATED: '✏️',
  NOTE_ADDED: '📝',
};

interface AuditTimelineProps {
  entity: string;
  entityId: string;
}

export function AuditTimeline({ entity, entityId }: AuditTimelineProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getEntityAuditLog(entity, entityId);
      setLogs(data);
    } catch {
      // Silently handle - timeline is supplementary
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, entityId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-4 animate-pulse" />
          Loading activity...
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-border/50 p-4 text-center text-sm text-muted-foreground">
        No activity recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Activity
        </h3>
        <Button variant="ghost" size="sm" onClick={fetchLogs} className="h-7">
          <RefreshCw className="size-3" />
        </Button>
      </div>
      <div className="relative space-y-0">
        {/* Timeline line */}
        <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />

        {logs.map((log) => {
          const details = log.details as Record<string, unknown> | null;
          return (
            <div key={log.id} className="relative flex gap-3 py-2.5">
              <div className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-background border border-border text-xs">
                {actionIcons[log.action] || '•'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs h-5">
                    {log.action.replace(/_/g, ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="size-3" />
                    {log.userName || 'System'}
                  </span>
                </div>
                {details && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {details.newStatus ? `→ ${String(details.newStatus)}` : null}
                    {details.subject ? `Subject: ${String(details.subject)}` : null}
                    {details.count ? `${String(details.count)} items` : null}
                  </p>
                )}
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  {formatDateUS(log.createdAt, 'datetime')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
