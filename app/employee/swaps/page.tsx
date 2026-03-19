import type { Metadata } from 'next';
import { getMySwapRequests } from '@/app/actions/shift-swaps';
import { serialize, formatDateUS } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ArrowRightLeft, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Shift Swaps',
};

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  ACCEPTED: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  APPROVED: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  REJECTED: 'bg-red-500/10 text-red-700 dark:text-red-400',
  CANCELLED: 'bg-muted text-muted-foreground',
  EXPIRED: 'bg-muted text-muted-foreground',
};

export default async function EmployeeSwapsPage() {
  const swaps = await getMySwapRequests();
  const serialized = serialize(swaps);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Shift Swaps</h1>
        <p className="mt-1 text-muted-foreground">
          View your swap requests and their status.
        </p>
      </div>

      {serialized.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-muted/30 p-8 text-center">
          <ArrowRightLeft className="mx-auto mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No swap requests yet. You can request a swap from your shift details page.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {serialized.map((swap) => (
            <div
              key={swap.id}
              className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-emerald-500/40 hover:shadow-md"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
              <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatDateUS(swap.originalBooking.shift.date, 'weekday-short')}{' '}
                      {swap.originalBooking.shift.startTime}–{swap.originalBooking.shift.endTime}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{swap.reason}</p>
                </div>
                <Badge className={statusStyles[swap.status] || ''}>
                  {swap.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
