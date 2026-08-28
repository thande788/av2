'use client';

import { useMemo, useState, useTransition } from 'react';
import { updateBulkAvailability, type AvailabilitySlot } from '@/app/actions/availability';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Check,
  Clock3,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  WandSparkles,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface AvailabilityCalendarProps {
  initialSlots: Record<number, Array<{ startTime: string; endTime: string; isAvailable: boolean }>>;
  days: string[];
}

interface DayRange {
  id: string;
  startTime: string;
  endTime: string;
}

const PRESETS: Array<{ id: string; label: string; ranges: Array<{ startTime: string; endTime: string }> }> = [
  {
    id: 'weekday-day',
    label: 'Weekday Day Shift',
    ranges: [{ startTime: '09:00', endTime: '17:00' }],
  },
  {
    id: 'early-morning',
    label: 'Early Morning',
    ranges: [{ startTime: '00:00', endTime: '06:00' }],
  },
  {
    id: 'split',
    label: 'Split Day',
    ranges: [
      { startTime: '08:00', endTime: '12:00' },
      { startTime: '14:00', endTime: '18:00' },
    ],
  },
];

function cloneRanges(source: Record<number, DayRange[]>): Record<number, DayRange[]> {
  const next: Record<number, DayRange[]> = {};
  for (let day = 0; day < 7; day++) {
    next[day] = (source[day] ?? []).map((range) => ({ ...range }));
  }
  return next;
}

function sortRanges(ranges: DayRange[]): DayRange[] {
  return [...ranges].sort((a, b) => {
    if (a.startTime === b.startTime) return a.endTime.localeCompare(b.endTime);
    return a.startTime.localeCompare(b.startTime);
  });
}

function buildInitialRanges(
  slots: Record<number, Array<{ startTime: string; endTime: string; isAvailable: boolean }>>
): Record<number, DayRange[]> {
  const ranges: Record<number, DayRange[]> = {};
  for (let day = 0; day < 7; day++) {
    ranges[day] = (slots[day] ?? [])
      .filter((slot) => slot.isAvailable)
      .map((slot, index) => ({
        id: `${day}-${slot.startTime}-${slot.endTime}-${index}`,
        startTime: slot.startTime,
        endTime: slot.endTime,
      }));
  }

  return ranges;
}

function rangesToSnapshot(ranges: Record<number, DayRange[]>): string {
  const normalized = Array.from({ length: 7 }, (_, day) => {
    const sorted = sortRanges(ranges[day] ?? []);
    return sorted.map((range) => `${range.startTime}-${range.endTime}`);
  });
  return JSON.stringify(normalized);
}

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(value: number): string {
  const normalized = ((value % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function getRangeHours(startTime: string, endTime: string): number {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (end <= start) {
    return 0;
  }
  return (end - start) / 60;
}

function hasOverlap(
  startTime: string,
  endTime: string,
  existing: DayRange[],
  ignoreId?: string
): boolean {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (end <= start) {
    return true;
  }

  return existing.some((range) => {
    if (ignoreId && range.id === ignoreId) {
      return false;
    }

    const otherStart = timeToMinutes(range.startTime);
    const otherEnd = timeToMinutes(range.endTime);
    if (otherEnd <= otherStart) {
      return true;
    }

    return start < otherEnd && otherStart < end;
  });
}

function toAvailabilitySlots(ranges: Record<number, DayRange[]>): AvailabilitySlot[] {
  const dedupe = new Set<string>();
  const slots: AvailabilitySlot[] = [];

  for (let day = 0; day < 7; day++) {
    for (const range of ranges[day] ?? []) {
      if (!range.startTime || !range.endTime || range.startTime === range.endTime) {
        continue;
      }

      if (timeToMinutes(range.endTime) <= timeToMinutes(range.startTime)) {
        continue;
      }

      const key = `${day}-${range.startTime}-${range.endTime}`;
      if (dedupe.has(key)) {
        continue;
      }

      dedupe.add(key);
      slots.push({
        dayOfWeek: day,
        startTime: range.startTime,
        endTime: range.endTime,
        isAvailable: true,
      });
    }
  }

  return slots;
}

export function AvailabilityCalendar({ initialSlots, days }: AvailabilityCalendarProps) {
  const initialRanges = useMemo(() => buildInitialRanges(initialSlots), [initialSlots]);
  const [rangesByDay, setRangesByDay] = useState<Record<number, DayRange[]>>(() =>
    cloneRanges(initialRanges)
  );
  const [baselineRanges, setBaselineRanges] = useState<Record<number, DayRange[]>>(() =>
    cloneRanges(initialRanges)
  );
  const [isPending, startTransition] = useTransition();

  const hasChanges = rangesToSnapshot(rangesByDay) !== rangesToSnapshot(baselineRanges);

  const dayHours = useMemo(
    () =>
      Array.from({ length: 7 }, (_, day) =>
        (rangesByDay[day] ?? []).reduce(
          (sum, range) => sum + getRangeHours(range.startTime, range.endTime),
          0
        )
      ),
    [rangesByDay]
  );

  const totalHours = dayHours.reduce((sum, hours) => sum + hours, 0);

  const addRange = (day: number, seed?: { startTime: string; endTime: string }) => {
    setRangesByDay((prev) => {
      const current = prev[day] ?? [];
      const sortedCurrent = sortRanges(current);
      const last = sortedCurrent[sortedCurrent.length - 1];

      const startTime =
        seed?.startTime ??
        (last ? last.endTime : '09:00');
      const endTime =
        seed?.endTime ??
        minutesToTime(Math.min(timeToMinutes(startTime) + 120, 23 * 60 + 59));

      if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
        toast.error('No room left in this day for another range');
        return prev;
      }

      if (hasOverlap(startTime, endTime, current)) {
        toast.error('That range overlaps an existing range for this day');
        return prev;
      }

      return {
        ...prev,
        [day]: [
          ...current,
          {
            id: `${day}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
            startTime,
            endTime,
          },
        ],
      };
    });
  };

  const removeRange = (day: number, id: string) => {
    setRangesByDay((prev) => {
      const current = prev[day] ?? [];
      return {
        ...prev,
        [day]: current.filter((range) => range.id !== id),
      };
    });
  };

  const updateRange = (
    day: number,
    id: string,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    setRangesByDay((prev) => {
      const current = prev[day] ?? [];
      const target = current.find((range) => range.id === id);
      if (!target) return prev;

      const nextRange = {
        ...target,
        [field]: value,
      };

      if (nextRange.startTime === nextRange.endTime) {
        toast.error('Start and end cannot be the same time');
        return prev;
      }

      if (timeToMinutes(nextRange.endTime) <= timeToMinutes(nextRange.startTime)) {
        toast.error('End time must be after start time');
        return prev;
      }

      if (hasOverlap(nextRange.startTime, nextRange.endTime, current, id)) {
        toast.error('That range overlaps another range for this day');
        return prev;
      }

      return {
        ...prev,
        [day]: current.map((range) => (range.id === id ? nextRange : range)),
      };
    });
  };

  const applyPresetToDay = (day: number, presetRanges: Array<{ startTime: string; endTime: string }>) => {
    const mapped: DayRange[] = presetRanges.map((range, index) => ({
      id: `${day}-preset-${index}-${Date.now()}`,
      startTime: range.startTime,
      endTime: range.endTime,
    }));

    setRangesByDay((prev) => ({
      ...prev,
      [day]: mapped,
    }));
  };

  const clearDay = (day: number) => {
    setRangesByDay((prev) => ({
      ...prev,
      [day]: [],
    }));
  };

  const applyWeekdayPreset = () => {
    const dayPreset = PRESETS.find((preset) => preset.id === 'weekday-day');
    if (!dayPreset) return;

    setRangesByDay((prev) => {
      const next = cloneRanges(prev);
      for (let day = 1; day <= 5; day++) {
        next[day] = dayPreset.ranges.map((range, index) => ({
          id: `${day}-weekday-${index}-${Date.now()}`,
          startTime: range.startTime,
          endTime: range.endTime,
        }));
      }
      return next;
    });
  };

  const reset = () => {
    setRangesByDay(cloneRanges(baselineRanges));
  };

  const save = () => {
    const slots = toAvailabilitySlots(rangesByDay);

    startTransition(async () => {
      const result = await updateBulkAvailability({ slots });
      if (result.success) {
        toast.success('Availability saved');
        setBaselineRanges(cloneRanges(rangesByDay));
      } else {
        toast.error(result.error || 'Failed to save');
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Summary & actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4">
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium">
            {totalHours.toFixed(1)} hours/week available
          </span>
          <div className="flex items-center gap-2">
            <Check className="size-4 text-emerald-600" />
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <X className="size-4 text-red-500" />
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
            onClick={applyWeekdayPreset}
            disabled={isPending}
          >
            <WandSparkles className="mr-1.5 size-3.5" />
            Weekday Preset
          </Button>
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

      {/* Default editor: custom ranges by day */}
      <div className="space-y-3 rounded-xl border border-border/50 bg-card p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Custom ranges by day</p>
          <span className="text-xs text-muted-foreground">Default editor</span>
        </div>

        <div className="space-y-3">
          {days.map((day, dayIndex) => {
            const dayRanges = sortRanges(rangesByDay[dayIndex] ?? []);
            return (
              <div key={day} className="rounded-lg border border-border/40 p-3">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{day}</p>
                    <p className="text-xs text-muted-foreground">
                      {dayHours[dayIndex].toFixed(1)}h total
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => addRange(dayIndex)}
                    >
                      <Plus className="mr-1.5 size-3.5" />
                      Add Range
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => clearDay(dayIndex)}
                      disabled={dayRanges.length === 0}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                  {PRESETS.map((preset) => (
                    <Button
                      key={`${day}-${preset.id}`}
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => applyPresetToDay(dayIndex, preset.ranges)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>

                {dayRanges.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No ranges set for this day.</p>
                ) : (
                  <div className="space-y-2">
                    {dayRanges.map((range, rangeIndex) => {
                      const previousRange = dayRanges[rangeIndex - 1];
                      const nextRange = dayRanges[rangeIndex + 1];
                      const startMin = previousRange?.endTime ?? '00:00';
                      const startMax = minutesToTime(
                        Math.max(
                          timeToMinutes(startMin),
                          timeToMinutes(range.endTime) - 1
                        )
                      );
                      const endMin = minutesToTime(timeToMinutes(range.startTime) + 1);
                      const endMax = nextRange?.startTime ?? '23:59';

                      return (
                      <div key={range.id} className="flex items-center gap-2">
                        <Clock3 className="size-4 text-muted-foreground" />
                        <input
                          type="time"
                          value={range.startTime}
                          min={startMin}
                          max={startMax}
                          step={1800}
                          onChange={(event) =>
                            updateRange(dayIndex, range.id, 'startTime', event.target.value)
                          }
                          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                        />
                        <span className="text-sm text-muted-foreground">to</span>
                        <input
                          type="time"
                          value={range.endTime}
                          min={endMin}
                          max={endMax}
                          step={1800}
                          onChange={(event) =>
                            updateRange(dayIndex, range.id, 'endTime', event.target.value)
                          }
                          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                        />
                        <span className="text-xs text-muted-foreground">
                          {getRangeHours(range.startTime, range.endTime).toFixed(1)}h
                        </span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeRange(dayIndex, range.id)}
                          aria-label="Remove range"
                        >
                          <Trash2 className="size-4 text-red-500" />
                        </Button>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
