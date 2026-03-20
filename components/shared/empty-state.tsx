import * as React from "react";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  /** Icon to display. Defaults to Inbox. */
  icon?: React.ComponentType<{ className?: string }>;
  /** Headline text */
  title: string;
  /** Descriptive subtext */
  description?: string;
  /** Optional action button / link */
  action?: React.ReactNode;
  /** Additional class on outline wrapper */
  className?: string;
}

/**
 * Reusable empty state for lists, tables, and dashboards.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={Calendar}
 *   title="No shifts scheduled"
 *   description="Your upcoming shifts will appear here once assigned."
 *   action={<Button asChild><Link href="/employee/availability">Set Availability</Link></Button>}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed py-12 px-6 text-center",
        className
      )}
    >
      <div className="rounded-full bg-muted p-3">
        <Icon className="size-8 text-muted-foreground/60" />
      </div>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
