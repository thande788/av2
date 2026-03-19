'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { parseISO, addDays } from 'date-fns';
import { formatDateUS } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  IconPlus,
  IconTrash,
  IconCalendarWeek,
  IconSend,
  IconDeviceFloppy,
  IconSparkles,
  IconLoader2,
} from '@tabler/icons-react';
import { createTimesheet, updateTimesheet, submitTimesheet, getShiftsForTimesheet } from '@/app/actions/timesheets';

interface TimesheetEntry {
  id?: string;
  date: string;
  clientName: string;
  shiftId?: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  workDescription: string;
}

interface TimesheetFormProps {
  workerId: string;
  weekStarting: string;
  existingTimesheet?: {
    id: string;
    status: string;
    entries: TimesheetEntry[];
  };
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function TimesheetForm({ workerId, weekStarting, existingTimesheet }: TimesheetFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isAutoPopulating, setIsAutoPopulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<TimesheetEntry[]>(
    existingTimesheet?.entries || []
  );

  const weekStart = parseISO(weekStarting);
  const weekEnd = addDays(weekStart, 6);
  const isEditing = !!existingTimesheet;
  const canEdit = !existingTimesheet || 
    existingTimesheet.status === 'DRAFT' || 
    existingTimesheet.status === 'REJECTED';

  // Calculate totals
  const totalHours = entries.reduce((sum, entry) => {
    const [startH, startM] = entry.startTime.split(':').map(Number);
    const [endH, endM] = entry.endTime.split(':').map(Number);
    const startMins = startH * 60 + startM;
    let endMins = endH * 60 + endM;
    if (endMins < startMins) endMins += 24 * 60;
    const mins = Math.max(0, endMins - startMins - entry.breakMinutes);
    return sum + mins / 60;
  }, 0);

  const regularHours = Math.min(totalHours, 40);
  const overtimeHours = Math.max(0, totalHours - 40);

  const addEntry = (dayOffset: number = 0) => {
    const entryDate = addDays(weekStart, dayOffset);
    setEntries([
      ...entries,
      {
        date: formatDateUS(entryDate, 'iso'),
        clientName: '',
        startTime: '09:00',
        endTime: '17:00',
        breakMinutes: 30,
        workDescription: '',
      },
    ]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof TimesheetEntry, value: string | number) => {
    setEntries(entries.map((entry, i) => 
      i === index ? { ...entry, [field]: value } : entry
    ));
  };

  const handleAutoPopulate = async () => {
    setIsAutoPopulating(true);
    setError(null);
    
    try {
      const result = await getShiftsForTimesheet(workerId, weekStarting);
      if (result.success && result.entries.length > 0) {
        // Merge with existing entries (don't duplicate shifts)
        const existingShiftIds = new Set(entries.map((e) => e.shiftId).filter(Boolean));
        const newEntries = result.entries.filter(
          (e) => !e.shiftId || !existingShiftIds.has(e.shiftId)
        );
        setEntries([...entries, ...newEntries]);
      } else if (result.entries.length === 0) {
        setError('No confirmed shifts found for this week');
      }
    } catch {
      setError('Failed to retrieve shifts');
    } finally {
      setIsAutoPopulating(false);
    }
  };

  const handleSave = () => {
    if (entries.length === 0) {
      setError('Please add at least one entry');
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = isEditing
        ? await updateTimesheet({ timesheetId: existingTimesheet!.id, entries })
        : await createTimesheet({ workerId, weekStarting, entries });

      if (result.success) {
        router.push('/employee/timesheets');
        router.refresh();
      } else {
        setError(result.error || 'Failed to save timesheet');
      }
    });
  };

  const handleSubmit = () => {
    if (entries.length === 0) {
      setError('Please add at least one entry before submitting');
      return;
    }

    setError(null);
    startTransition(async () => {
      // First save if there are changes
      const saveResult = isEditing
        ? await updateTimesheet({ timesheetId: existingTimesheet!.id, entries })
        : await createTimesheet({ workerId, weekStarting, entries });

      if (!saveResult.success) {
        setError(saveResult.error || 'Failed to save timesheet');
        return;
      }

      let timesheetId: string;
      if (isEditing) {
        timesheetId = existingTimesheet!.id;
      } else {
        const createResult = saveResult as { success: true; timesheetId: string };
        timesheetId = createResult.timesheetId;
      }
      
      if (!timesheetId) {
        setError('Failed to get timesheet ID');
        return;
      }

      const submitResult = await submitTimesheet(timesheetId);
      if (submitResult.success) {
        router.push('/employee/timesheets');
        router.refresh();
      } else {
        setError(submitResult.error || 'Failed to submit timesheet');
      }
    });
  };

  // Group entries by day for display
  const entriesByDay = DAYS_OF_WEEK.map((day, index) => {
    const dayDate = formatDateUS(addDays(weekStart, index), 'iso');
    return {
      day,
      date: dayDate,
      entries: entries
        .map((entry, originalIndex) => ({ entry, originalIndex }))
        .filter(({ entry }) => entry.date === dayDate),
    };
  });

  return (
    <div className="space-y-6">
      {/* Week Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconCalendarWeek className="size-5" />
                Week of {formatDateUS(weekStart, 'medium-no-year')} - {formatDateUS(weekEnd)}
              </CardTitle>
              <CardDescription>
                {isEditing ? 'Edit your timesheet entries' : 'Create a new timesheet for this week'}
              </CardDescription>
            </div>
            {existingTimesheet && (
              <Badge className={
                existingTimesheet.status === 'REJECTED' 
                  ? 'bg-red-500/15 text-red-600' 
                  : 'bg-slate-500/15 text-slate-600'
              }>
                {existingTimesheet.status}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Total Hours:</span>{' '}
                <span className="font-semibold">{totalHours.toFixed(1)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Regular:</span>{' '}
                <span className="font-semibold">{regularHours.toFixed(1)}</span>
              </div>
              {overtimeHours > 0 && (
                <div className="text-amber-600 dark:text-amber-400">
                  <span>Overtime:</span>{' '}
                  <span className="font-semibold">+{overtimeHours.toFixed(1)}</span>
                </div>
              )}
            </div>
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoPopulate}
                disabled={isAutoPopulating || isPending}
              >
                {isAutoPopulating ? (
                  <IconLoader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  <IconSparkles className="size-4 mr-2" />
                )}
                Auto-populate from Shifts
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Entries by Day */}
      <div className="space-y-4">
        {entriesByDay.map(({ day, date, entries: dayEntries }) => (
          <Card key={date}>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">
                  {day}, {formatDateUS(parseISO(date), 'medium-no-year')}
                </CardTitle>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addEntry(DAYS_OF_WEEK.indexOf(day))}
                    disabled={isPending}
                  >
                    <IconPlus className="size-4 mr-1" />
                    Add Entry
                  </Button>
                )}
              </div>
            </CardHeader>
            {dayEntries.length > 0 ? (
              <CardContent className="space-y-4">
                {dayEntries.map(({ entry, originalIndex }) => (
                  <div key={originalIndex} className="grid gap-4 rounded-lg border p-4 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                      <Label htmlFor={`client-${originalIndex}`}>Client Name</Label>
                      <Input
                        id={`client-${originalIndex}`}
                        value={entry.clientName}
                        onChange={(e) => updateEntry(originalIndex, 'clientName', e.target.value)}
                        placeholder="Client name"
                        disabled={!canEdit || isPending}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`start-${originalIndex}`}>Start Time</Label>
                      <Input
                        id={`start-${originalIndex}`}
                        type="time"
                        value={entry.startTime}
                        onChange={(e) => updateEntry(originalIndex, 'startTime', e.target.value)}
                        disabled={!canEdit || isPending}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`end-${originalIndex}`}>End Time</Label>
                      <Input
                        id={`end-${originalIndex}`}
                        type="time"
                        value={entry.endTime}
                        onChange={(e) => updateEntry(originalIndex, 'endTime', e.target.value)}
                        disabled={!canEdit || isPending}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`break-${originalIndex}`}>Break (min)</Label>
                      <Input
                        id={`break-${originalIndex}`}
                        type="number"
                        min={0}
                        max={120}
                        value={entry.breakMinutes}
                        onChange={(e) => updateEntry(originalIndex, 'breakMinutes', parseInt(e.target.value) || 0)}
                        disabled={!canEdit || isPending}
                      />
                    </div>
                    <div className="flex items-end">
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:bg-red-100 hover:text-red-700"
                          onClick={() => removeEntry(originalIndex)}
                          disabled={isPending}
                        >
                          <IconTrash className="size-4" />
                        </Button>
                      )}
                    </div>
                    <div className="sm:col-span-6">
                      <Label htmlFor={`desc-${originalIndex}`}>Work Description (optional)</Label>
                      <Textarea
                        id={`desc-${originalIndex}`}
                        value={entry.workDescription}
                        onChange={(e) => updateEntry(originalIndex, 'workDescription', e.target.value)}
                        placeholder="Describe the work performed..."
                        rows={2}
                        disabled={!canEdit || isPending}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            ) : (
              <CardContent>
                <p className="text-sm text-muted-foreground py-2">No entries for this day</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Actions */}
      {canEdit && (
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/employee/timesheets')}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isPending || entries.length === 0}
          >
            {isPending ? (
              <IconLoader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <IconDeviceFloppy className="size-4 mr-2" />
            )}
            Save Draft
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || entries.length === 0}
          >
            {isPending ? (
              <IconLoader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <IconSend className="size-4 mr-2" />
            )}
            Submit for Approval
          </Button>
        </div>
      )}
    </div>
  );
}
