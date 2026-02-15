'use client';

import { Badge } from '@/components/ui/badge';
import {
  IconUsers,
  IconFileCheck,
  IconClock,
  IconAlertTriangle,
  IconChevronRight,
} from '@tabler/icons-react';
import Link from 'next/link';

interface PendingActionsPanelProps {
  pendingWorkers: number;
  pendingTimesheets: number;
  pendingDocs: number;
  expiringDocs: number;
}

export function PendingActionsPanel({
  pendingWorkers,
  pendingTimesheets,
  pendingDocs,
  expiringDocs,
}: PendingActionsPanelProps) {
  const actions = [
    {
      title: 'Pending Worker Approvals',
      count: pendingWorkers,
      icon: IconUsers,
      href: '/admin/workers?status=PENDING',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Timesheets to Review',
      count: pendingTimesheets,
      icon: IconClock,
      href: '/admin/timesheets?status=SUBMITTED',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Documents Pending Review',
      count: pendingDocs,
      icon: IconFileCheck,
      href: '/admin/compliance?tab=pending',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Expiring Documents',
      count: expiringDocs,
      icon: IconAlertTriangle,
      href: '/admin/compliance?tab=expiring',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-500/10',
      urgent: true,
    },
  ];

  const totalActions = actions.reduce((sum, a) => sum + a.count, 0);

  return (
    <div className="rounded-xl border border-primary/40 bg-primary/5 overflow-hidden">
      <div className="flex items-center justify-between p-6 pb-4 border-b border-primary/20">
        <div className="flex items-center gap-2">
          <IconAlertTriangle className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Pending Actions</h2>
        </div>
        {totalActions > 0 && (
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            {totalActions} items
          </Badge>
        )}
      </div>
      <div className="p-6 pt-4">
        {totalActions === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">
            🎉 All caught up! No pending actions.
          </p>
        ) : (
          <div className="space-y-2">
            {actions
              .filter((a) => a.count > 0)
              .map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${action.bgColor}`}>
                        <Icon className={`size-4 ${action.color}`} />
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {action.title}
                        </p>
                        {action.urgent && action.count > 0 && (
                          <p className="text-xs text-red-500 dark:text-red-400">
                            Requires immediate attention
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={action.urgent ? 'bg-red-500/15 text-red-600 dark:text-red-400' : ''}
                      >
                        {action.count}
                      </Badge>
                      <IconChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
