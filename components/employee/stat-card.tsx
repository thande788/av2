import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface EmployeeStatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'warning' | 'success' | 'info';
}

const variantStyles = {
  default: {
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/5',
    hoverBg: 'hover:bg-emerald-500/10',
    gradient: 'from-emerald-500/5',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-500',
  },
  warning: {
    border: 'border-yellow-500/40',
    bg: 'bg-yellow-500/5',
    hoverBg: 'hover:bg-yellow-500/10',
    gradient: 'from-yellow-500/5',
    iconBg: 'bg-yellow-500/10',
    iconColor: 'text-yellow-600 dark:text-yellow-500',
  },
  success: {
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/5',
    hoverBg: 'hover:bg-emerald-500/10',
    gradient: 'from-emerald-500/5',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-500',
  },
  info: {
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/5',
    hoverBg: 'hover:bg-blue-500/10',
    gradient: 'from-blue-500/5',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600 dark:text-blue-500',
  },
};

export function EmployeeStatCard({
  title,
  value,
  description,
  icon: Icon,
  variant = 'default',
}: EmployeeStatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border p-6 transition-all hover:shadow-md',
        styles.border,
        styles.bg,
        styles.hoverBg
      )}
    >
      {/* Subtle gradient accent */}
      <div className={cn('absolute inset-0 bg-gradient-to-br via-transparent to-transparent pointer-events-none', styles.gradient)} />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {Icon && (
          <div className={cn('rounded-lg p-2.5', styles.iconBg)}>
            <Icon className={cn('size-5', styles.iconColor)} />
          </div>
        )}
      </div>
    </div>
  );
}
