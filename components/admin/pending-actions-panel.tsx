import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  IconAlertTriangle,
  IconChevronRight,
  IconClock,
  IconFileCheck,
  IconUsers,
} from '@tabler/icons-react';
import { DashboardPanel } from './dashboard-panel';

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
      href: '/admin/workers?tab=pending',
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

  const totalActions = actions.reduce((sum, action) => sum + action.count, 0);

  return (
    <DashboardPanel
      title="Pending Actions"
      icon={IconAlertTriangle}
      badge={
        totalActions > 0 ? (
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            {totalActions} items
          </Badge>
        ) : undefined
      }
    >
      {totalActions === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          All caught up. No pending actions.
        </p>
      ) : (
        <div className="space-y-2">
          {actions
            .filter((action) => action.count > 0)
            .map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group block rounded-lg p-3 transition-colors hover:bg-accent/50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`rounded-lg p-2 ${action.bgColor}`}>
                        <Icon className={`size-4 ${action.color}`} />
                      </div>
                      <div>
                        <p className="font-medium transition-colors group-hover:text-primary">
                          {action.title}
                        </p>
                        {action.urgent && (
                          <p className="text-xs text-red-500 dark:text-red-400">
                            Requires immediate attention
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                      <Badge
                        variant="secondary"
                        className={action.urgent ? 'bg-red-500/15 text-red-600 dark:text-red-400' : ''}
                      >
                        {action.count}
                      </Badge>
                      <IconChevronRight className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      )}
    </DashboardPanel>
  );
}
