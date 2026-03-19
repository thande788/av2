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
      <div className="flex items-center justify-between gap-4 border-b border-primary/20 p-6 pb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="size-5 text-primary" />}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {badge}
          {panelAction}
        </div>
      </div>
      <div className={cn('p-6 pt-4', contentClassName)}>{children}</div>
    </section>
  );
}