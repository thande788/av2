import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { isFeatureEnabled } from '@/lib/feature-flags';

export const metadata: Metadata = {
  title: 'Worker Availability',
  description: 'Weekly availability overview for all workers',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function getSlotDurationHours(start: string, end: string): number {
  const startMinutes = timeToMinutes(start);
  let endMinutes = timeToMinutes(end);
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }
  return (endMinutes - startMinutes) / 60;
}

export default async function WorkerAvailabilityPage() {
  if (!isFeatureEnabled('availabilityCalendar')) {
    redirect('/admin/workers');
  }

  const workers = await db.worker.findMany({
    where: {
      user: { status: 'ACTIVE' },
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          status: true,
        },
      },
      availabilities: {
        where: { isAvailable: true },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      },
    },
    orderBy: [{ user: { lastName: 'asc' } }, { user: { firstName: 'asc' } }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Worker Availability</h1>
          <p className="text-muted-foreground">
            Weekly snapshot of active caregivers and their available time blocks.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/workers">Back to Workers</Link>
        </Button>
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-border/50 md:block">
        <table className="w-full min-w-[72rem] text-sm">
          <thead className="bg-muted/40">
            <tr className="border-b border-border/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Worker</th>
              {DAYS.map((day) => (
                <th key={day} className="px-3 py-3 text-left font-medium text-muted-foreground">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {workers.map((worker) => (
              <tr key={worker.id} className="align-top hover:bg-muted/20">
                <td className="px-4 py-3">
                  <p className="font-medium">
                    {worker.user.firstName} {worker.user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{worker.city || 'Location not set'}</p>
                </td>
                {DAYS.map((_, dayIndex) => {
                  const slots = worker.availabilities.filter((slot) => slot.dayOfWeek === dayIndex);
                  const totalHours = slots.reduce(
                    (sum, slot) => sum + getSlotDurationHours(slot.startTime, slot.endTime),
                    0
                  );
                  return (
                    <td key={`${worker.id}-${dayIndex}`} className="px-3 py-3">
                      {slots.length > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-emerald-600">
                            <Check className="size-4" />
                            <span className="text-xs font-medium">{totalHours.toFixed(1)}h</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {slots.map((slot) => `${slot.startTime}-${slot.endTime}`).join(', ')}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-500">
                          <X className="size-4" />
                          <span className="text-xs">Unavailable</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {workers.map((worker) => (
          <div key={worker.id} className="rounded-xl border border-border/50 bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  {worker.user.firstName} {worker.user.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{worker.city || 'Location not set'}</p>
              </div>
              <Badge variant="secondary">{worker.availabilities.length} slots</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DAYS.map((day, dayIndex) => {
                const hasSlots = worker.availabilities.some((slot) => slot.dayOfWeek === dayIndex);
                return (
                  <div
                    key={`${worker.id}-mobile-${day}`}
                    className="flex items-center justify-between rounded-md border border-border/40 px-2 py-1.5"
                  >
                    <span className="text-xs text-muted-foreground">{day}</span>
                    {hasSlots ? (
                      <Check className="size-4 text-emerald-600" />
                    ) : (
                      <X className="size-4 text-red-500" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
