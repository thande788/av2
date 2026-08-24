import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export type StatCardVariant = 'default' | 'success' | 'warning' | 'info';

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: LucideIcon;
  href?: string;
  highlight?: boolean;
  variant?: StatCardVariant;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const variantStyles: Record<StatCardVariant, { container: string; accent: string }> = {
  default: {
    container: 'border-primary/40 bg-primary/5 hover:bg-primary/10',
    accent: 'bg-primary/10 text-primary',
  },
  success: {
    container: 'border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10',
    accent: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  warning: {
    container: 'border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10',
    accent: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  info: {
    container: 'border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10',
    accent: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  highlight,
  variant,
  trend,
}: StatCardProps) {
  const resolvedVariant = variant ?? (highlight ? 'warning' : 'default');

  const cardContent = (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <p
              className={cn(
                'text-xs font-medium',
                trend.isPositive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('rounded-lg p-2.5', variantStyles[resolvedVariant].accent)}>
            <Icon className="size-5" />
          </div>
        )}
      </div>
    </>
  );

  const cardClassName = cn(
    'relative overflow-hidden rounded-xl border p-6 transition-all hover:shadow-md',
    variantStyles[resolvedVariant].container,
    href && 'block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
  );

  if (href) {
    return <Link href={href} className={cardClassName}>{cardContent}</Link>;
  }

  return (
    <div className={cardClassName}>{cardContent}</div>
  );
}
