import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DashboardPanelProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  action?: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
  badge?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function DashboardPanel({
  title,
  icon: Icon,
  children,
  action,
  actionHref,
  actionLabel,
  badge,
  className,
  contentClassName,
}: DashboardPanelProps) {
  const panelAction = action ??
    (actionHref && actionLabel ? (
      <Button asChild variant="ghost" size="sm">
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    ) : null);

  return (
    <section
      className={cn(
        'overflow-hidden rounded-xl border border-primary/40 bg-primary/5',
        className
      )}
    >
      <div className="flex flex-col gap-3 border-b border-primary/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-6 sm:pb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="size-5 text-primary" />}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {badge}
          {panelAction}
        </div>
      </div>
      <div className={cn('px-4 py-4 sm:px-6 sm:pt-4 sm:pb-6', contentClassName)}>{children}</div>
    </section>
  );
}