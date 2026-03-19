'use client';

import { useState, useTransition } from 'react';
import { cn, formatDateUS } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, ArrowRightLeft, Clock, User } from 'lucide-react';
import { approveSwapRequest, rejectSwapRequest } from '@/app/actions/shift-swaps';
import { toast } from 'sonner';

interface SwapData {
  id: string;
  requesterId: string;
  targetWorkerId: string | null;
  reason: string;
  status: string;
  createdAt: string | Date;
  originalBooking: {
    id: string;
    shift: {
      id: string;
      date: string | Date;
      startTime: string;
      endTime: string;
      client: {
        user: { firstName: string; lastName: string };
      };
    };
    worker: {
      user: { firstName: string; lastName: string };
    };
  };
}

export function SwapReviewQueue({ swaps }: { swaps: SwapData[] }) {
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const handleApprove = (swapId: string) => {
    startTransition(async () => {
      const result = await approveSwapRequest(swapId, notes[swapId]);
      if (result.success) toast.success('Swap approved');
      else toast.error(result.error || 'Failed');
    });
  };

  const handleReject = (swapId: string) => {
    startTransition(async () => {
      const result = await rejectSwapRequest(swapId, notes[swapId]);
      if (result.success) toast.success('Swap rejected');
      else toast.error(result.error || 'Failed');
    });
  };

  if (swaps.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-muted/30 p-8 text-center">
        <ArrowRightLeft className="mx-auto mb-3 size-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No pending swap requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {swaps.map((swap) => {
        const booking = swap.originalBooking;
        return (
          <div
            key={swap.id}
            className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="size-4 text-primary" />
                  <span className="font-semibold">
                    {booking.worker.user.firstName} {booking.worker.user.lastName}
                  </span>
                  <Badge
                    variant={swap.status === 'ACCEPTED' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {swap.status === 'ACCEPTED' ? 'Worker Found' : 'Pending'}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDateUS(swap.createdAt, 'medium')}
                </span>
              </div>

              {/* Shift info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {formatDateUS(booking.shift.date, 'weekday-short')} {booking.shift.startTime}–{booking.shift.endTime}
                </div>
                <div className="flex items-center gap-1">
                  <User className="size-3.5" />
                  {booking.shift.client.user.firstName} {booking.shift.client.user.lastName}
                </div>
              </div>

              {/* Reason */}
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Reason:</p>
                {swap.reason}
              </div>

              {/* Admin note + actions */}
              <div className="flex flex-wrap items-end gap-2">
                <div className="flex-1">
                  <Textarea
                    placeholder="Admin note (optional)"
                    rows={2}
                    value={notes[swap.id] || ''}
                    onChange={(e) => setNotes((p) => ({ ...p, [swap.id]: e.target.value }))}
                    className="resize-none text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(swap.id)}
                    disabled={isPending}
                    className="text-red-600 hover:bg-red-500/10"
                  >
                    <XCircle className="mr-1.5 size-3.5" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(swap.id)}
                    disabled={isPending}
                  >
                    <CheckCircle className="mr-1.5 size-3.5" />
                    Approve
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
