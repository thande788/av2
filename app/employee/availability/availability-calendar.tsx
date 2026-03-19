'use client';

import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { updateBulkAvailability, type AvailabilitySlot } from '@/app/actions/availability';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface AvailabilityCalendarProps {
  initialSlots: Record<number, Array<{ startTime: string; endTime: string; isAvailable: boolean }>>;
  days: string[];
}

// Time blocks: 6 AM to 12 AM in 2-hour increments
const TIME_BLOCKS = [
  { label: '6–8 AM', start: '06:00', end: '08:00' },
  { label: '8–10 AM', start: '08:00', end: '10:00' },
  { label: '10–12 PM', start: '10:00', end: '12:00' },
  { label: '12–2 PM', start: '12:00', end: '14:00' },
  { label: '2–4 PM', start: '14:00', end: '16:00' },
  { label: '4–6 PM', start: '16:00', end: '18:00' },
  { label: '6–8 PM', start: '18:00', end: '20:00' },
  { label: '8–10 PM', start: '20:00', end: '22:00' },
  { label: '10–12 AM', start: '22:00', end: '00:00' },
];

function buildGrid(slots: Record<number, Array<{ startTime: string; endTime: string; isAvailable: boolean }>>) {
  // grid[day][blockIndex] = available
  const grid: boolean[][] = [];
  for (let day = 0; day < 7; day++) {
    grid[day] = TIME_BLOCKS.map((block) => {
      return slots[day]?.some(
        (s) => s.startTime === block.start && s.endTime === block.end && s.isAvailable
      ) ?? false;
    });
  }
  return grid;
}

export function AvailabilityCalendar({ initialSlots, days }: AvailabilityCalendarProps) {
  const [grid, setGrid] = useState(() => buildGrid(initialSlots));
  const [isPending, startTransition] = useTransition();
  const [hasChanges, setHasChanges] = useState(false);

  const toggle = (day: number, blockIndex: number) => {
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[day][blockIndex] = !next[day][blockIndex];
      return next;
    });
    setHasChanges(true);
  };

  const selectAllDay = (day: number) => {
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      const allSelected = next[day].every(Boolean);
      next[day] = next[day].map(() => !allSelected);
      return next;
    });
    setHasChanges(true);
  };

  const reset = () => {
    setGrid(buildGrid(initialSlots));
    setHasChanges(false);
  };

  const save = () => {
    const slots: AvailabilitySlot[] = [];
    for (let day = 0; day < 7; day++) {
      for (let b = 0; b < TIME_BLOCKS.length; b++) {
        if (grid[day][b]) {
          slots.push({
            dayOfWeek: day,
            startTime: TIME_BLOCKS[b].start,
            endTime: TIME_BLOCKS[b].end,
            isAvailable: true,
          });
        }
      }
    }

    startTransition(async () => {
      const result = await updateBulkAvailability({ slots });
      if (result.success) {
        toast.success('Availability saved');
        setHasChanges(false);
      } else {
        toast.error(result.error || 'Failed to save');
      }
    });
  };

  const totalHours = grid.flat().filter(Boolean).length * 2;

  return (
    <div className="space-y-4">
      {/* Summary & actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4">
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium">
            {totalHours} hours/week available
          </span>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-sm bg-emerald-500" />
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-sm border border-border bg-muted" />
            <span className="text-muted-foreground">Unavailable</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <div className="mr-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-3" />
              Unsaved changes
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={reset}
            disabled={!hasChanges || isPending}
          >
            <RotateCcw className="mr-1.5 size-3.5" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={save}
            disabled={!hasChanges || isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Save className="mr-1.5 size-3.5" />
            {isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Desktop grid */}
      <div className="hidden overflow-hidden rounded-xl border border-border/50 md:block">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="w-24 px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">
                Time
              </th>
              {days.map((day, i) => (
                <th
                  key={day}
                  className="cursor-pointer px-1 py-2.5 text-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => selectAllDay(i)}
                  title={`Click to toggle all ${day}`}
                >
                  <span className="hidden lg:inline">{day}</span>
                  <span className="lg:hidden">{day.slice(0, 3)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {TIME_BLOCKS.map((block, bi) => (
              <tr key={block.start}>
                <td className="px-3 py-1 text-xs text-muted-foreground whitespace-nowrap">
                  {block.label}
                </td>
                {days.map((_, di) => (
                  <td key={di} className="px-1 py-1">
                    <button
                      type="button"
                      onClick={() => toggle(di, bi)}
                      className={cn(
                        'mx-auto block h-8 w-full max-w-20 rounded-md transition-all',
                        grid[di][bi]
                          ? 'bg-emerald-500/70 hover:bg-emerald-500/90 shadow-sm'
                          : 'bg-muted hover:bg-muted/80 border border-border/50'
                      )}
                      aria-label={`${days[di]} ${block.label}: ${grid[di][bi] ? 'available' : 'unavailable'}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="space-y-3 md:hidden">
        {days.map((day, di) => {
          const dayHours = grid[di].filter(Boolean).length * 2;
          return (
            <div key={day} className="rounded-xl border border-border/50 bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">{day}</h3>
                <span className="text-xs text-muted-foreground">{dayHours}h available</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {TIME_BLOCKS.map((block, bi) => (
                  <button
                    key={block.start}
                    type="button"
                    onClick={() => toggle(di, bi)}
                    className={cn(
                      'rounded-md px-2 py-1.5 text-xs font-medium transition-all',
                      grid[di][bi]
                        ? 'bg-emerald-500/70 text-white'
                        : 'bg-muted text-muted-foreground border border-border/50'
                    )}
                  >
                    {block.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
