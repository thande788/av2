'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { createShift, type CreateShiftInput } from '@/app/actions/shifts';
import { IconLoader2, IconCalendarPlus } from '@tabler/icons-react';
import type { ServiceLevel } from '@prisma/client';
import type { ServiceTypeOption } from '@/lib/service-types';

interface Client {
  id: string;
  careRecipientName: string | null;
  billingRate: number;
  serviceLevel: ServiceLevel;
  city: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface CreateShiftFormProps {
  clients: Client[];
  serviceTypes: ServiceTypeOption[];
}

const WEEKDAY_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export function CreateShiftForm({ clients, serviceTypes }: CreateShiftFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [workerRateMode, setWorkerRateMode] = useState<'fixed' | 'percentage'>('percentage');
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string>(
    serviceTypes[0]?.id ?? ''
  );
  const [workerRatePercentInput, setWorkerRatePercentInput] = useState<string>(
    String(serviceTypes[0]?.defaultWorkerRatePercent ?? 65)
  );
  const [dateInput, setDateInput] = useState('');
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(false);
  const [recurrenceMode, setRecurrenceMode] = useState<'DAILY' | 'WEEKDAYS' | 'WEEKLY' | 'CUSTOM'>('WEEKLY');
  const [recurrencePattern, setRecurrencePattern] = useState<'DAILY' | 'WEEKLY'>('WEEKLY');
  const [recurrenceInterval, setRecurrenceInterval] = useState('1');
  const [recurrenceWeekdays, setRecurrenceWeekdays] = useState<number[]>([1, 3, 5]);
  const [recurrenceEndType, setRecurrenceEndType] = useState<'COUNT' | 'UNTIL'>('COUNT');
  const [recurrenceOccurrences, setRecurrenceOccurrences] = useState('4');
  const [recurrenceUntilDate, setRecurrenceUntilDate] = useState('');
  const [showAdvancedRecurrence, setShowAdvancedRecurrence] = useState(false);

  function getDefaultPercentForServiceType(serviceTypeId: string) {
    return serviceTypes.find((type) => type.id === serviceTypeId)?.defaultWorkerRatePercent ?? 65;
  }

  const selectedServiceType =
    serviceTypes.find((type) => type.id === selectedServiceTypeId) || serviceTypes[0];

  const toggleWeekday = (day: number) => {
    setRecurrenceWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b)
    );
  };

  const recurrenceWeekdaySet = useMemo(() => {
    if (recurrenceMode === 'DAILY') return [0, 1, 2, 3, 4, 5, 6];
    if (recurrenceMode === 'WEEKDAYS') return [1, 2, 3, 4, 5];
    return recurrenceWeekdays;
  }, [recurrenceMode, recurrenceWeekdays]);

  const recurrencePatternEffective = recurrenceMode === 'CUSTOM'
    ? recurrencePattern
    : recurrenceMode === 'WEEKLY'
      ? 'WEEKLY'
      : 'DAILY';

  const recurrenceIntervalEffective = recurrenceMode === 'CUSTOM'
    ? Math.max(1, Number(recurrenceInterval || '1'))
    : 1;

  const recurrenceConfig = recurrenceEnabled
    ? {
        pattern: recurrencePatternEffective,
        interval: recurrenceIntervalEffective,
        weekdays: recurrenceWeekdaySet,
        endType: recurrenceEndType,
        occurrences: recurrenceEndType === 'COUNT' ? Number(recurrenceOccurrences || '1') : undefined,
        untilDate: recurrenceEndType === 'UNTIL' ? recurrenceUntilDate || undefined : undefined,
      }
    : null;

  function getRecurringPreviewDates(limit = 5): string[] {
    if (!recurrenceEnabled || !recurrenceConfig || !dateInput) return [];

    const start = new Date(`${dateInput}T00:00:00`);
    if (Number.isNaN(start.getTime())) return [];

    const endDate =
      recurrenceConfig.endType === 'UNTIL' && recurrenceConfig.untilDate
        ? new Date(`${recurrenceConfig.untilDate}T00:00:00`)
        : null;
    const maxOccurrences = recurrenceConfig.endType === 'COUNT' ? recurrenceConfig.occurrences ?? 1 : null;

    const dates: string[] = [];
    const cursor = new Date(start);
    const weekdays = new Set(recurrenceConfig.weekdays);

    for (let i = 0; i < 730 && dates.length < limit; i++) {
      if (endDate && cursor > endDate) break;

      const day = cursor.getDay();
      const dayOffset = Math.floor((cursor.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      let include = false;
      if (recurrenceConfig.pattern === 'DAILY') {
        include = weekdays.has(day) && dayOffset % recurrenceConfig.interval === 0;
      } else {
        const weeksOffset = Math.floor(dayOffset / 7);
        include = weekdays.has(day) && weeksOffset % recurrenceConfig.interval === 0;
      }

      if (include) {
        dates.push(
          new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }).format(cursor)
        );
        if (maxOccurrences && dates.length >= maxOccurrences) break;
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    return dates;
  }

  function getRecurringEstimatedCount(): number | null {
    if (!recurrenceEnabled || !recurrenceConfig || !dateInput) return null;

    const start = new Date(`${dateInput}T00:00:00`);
    if (Number.isNaN(start.getTime())) return null;

    const endDate =
      recurrenceConfig.endType === 'UNTIL' && recurrenceConfig.untilDate
        ? new Date(`${recurrenceConfig.untilDate}T00:00:00`)
        : null;
    const maxOccurrences = recurrenceConfig.endType === 'COUNT' ? recurrenceConfig.occurrences ?? 1 : null;

    let count = 0;
    const cursor = new Date(start);
    const weekdays = new Set(recurrenceConfig.weekdays);

    for (let i = 0; i < 730; i++) {
      if (endDate && cursor > endDate) break;

      const day = cursor.getDay();
      const dayOffset = Math.floor((cursor.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      let include = false;
      if (recurrenceConfig.pattern === 'DAILY') {
        include = weekdays.has(day) && dayOffset % recurrenceConfig.interval === 0;
      } else {
        const weeksOffset = Math.floor(dayOffset / 7);
        include = weekdays.has(day) && weeksOffset % recurrenceConfig.interval === 0;
      }

      if (include) {
        count += 1;
        if (maxOccurrences && count >= maxOccurrences) break;
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    return count;
  }

  const recurrencePreviewDates = getRecurringPreviewDates();
  const recurrenceEstimatedCount = getRecurringEstimatedCount();

  const recurrenceSummary = useMemo(() => {
    if (!recurrenceEnabled || !recurrenceConfig) return '';

    const sortedDays = [...recurrenceConfig.weekdays].sort((a, b) => a - b);
    const isEveryDay = sortedDays.length === 7;
    const isWeekdays = sortedDays.length === 5 && sortedDays.join(',') === '1,2,3,4,5';
    const dayLabels = sortedDays
      .map((d) => WEEKDAY_OPTIONS.find((o) => o.value === d)?.label)
      .filter((label): label is string => Boolean(label));

    const unitSingular = recurrenceConfig.pattern === 'DAILY' ? 'day' : 'week';
    const unitPlural = recurrenceConfig.pattern === 'DAILY' ? 'days' : 'weeks';
    const everyText = recurrenceConfig.interval === 1
      ? `every ${unitSingular}`
      : `every ${recurrenceConfig.interval} ${unitPlural}`;

    let dayText = '';
    if (isEveryDay) {
      dayText = '';
    } else if (isWeekdays) {
      dayText = ' on weekdays';
    } else {
      dayText = ` on ${dayLabels.join('/')}`;
    }

    const endText = recurrenceConfig.endType === 'COUNT'
      ? `for ${recurrenceConfig.occurrences ?? 1} shifts`
      : recurrenceConfig.untilDate
        ? `until ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${recurrenceConfig.untilDate}T00:00:00`))}`
        : 'until the selected date';

    return `Repeats ${everyText}${dayText}, ${endText}.`;
  }, [recurrenceEnabled, recurrenceConfig]);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);

    try {
      const clientId = formData.get('clientId') as string;
      const date = formData.get('date') as string;
      const startTime = formData.get('startTime') as string;
      const endTime = formData.get('endTime') as string;
      const serviceTypeId = formData.get('serviceTypeId') as string;
      const clientRate = parseFloat(formData.get('clientRate') as string);
      const workerRate = parseFloat(formData.get('workerRate') as string);
      const workerRateModeValue = formData.get('workerRateMode') as 'fixed' | 'percentage';
      const workerRatePercent = parseFloat(formData.get('workerRatePercent') as string);
      const notes = formData.get('notes') as string;
      const recurrenceRaw = formData.get('recurrence') as string;

      let recurrence: CreateShiftInput['recurrence'];
      if (recurrenceRaw) {
        const parsedRecurrence = JSON.parse(recurrenceRaw) as NonNullable<CreateShiftInput['recurrence']>;
        recurrence = parsedRecurrence;
        if (!parsedRecurrence.weekdays?.length) {
          setError('Select at least one day for the recurring shift.');
          setIsPending(false);
          return;
        }
      }

      const input: CreateShiftInput = {
        clientId,
        date,
        startTime,
        endTime,
        serviceTypeId,
        clientRate,
        workerRateMode: workerRateModeValue,
        workerRate: workerRateModeValue === 'fixed' && Number.isFinite(workerRate) ? workerRate : undefined,
        workerRatePercent:
          workerRateModeValue === 'percentage' && Number.isFinite(workerRatePercent)
            ? workerRatePercent
            : undefined,
        notes: notes || undefined,
        recurrence,
      };

      const result = await createShift(input);

      if (result.success) {
        router.push(`/admin/shifts/${result.shiftId}`);
      } else {
        setError(result.error || 'Failed to create shift');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsPending(false);
    }
  }

  function handleClientChange(clientId: string) {
    const client = clients.find((c) => c.id === clientId);
    setSelectedClient(client || null);
    if (client && workerRateMode === 'percentage') {
      setWorkerRatePercentInput(String(getDefaultPercentForServiceType(selectedServiceTypeId)));
    }
  }

  // Get tomorrow's date as the minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const recurrencePayload = recurrenceEnabled && recurrenceConfig
    ? JSON.stringify(recurrenceConfig)
    : '';

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Client Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Client Details</CardTitle>
          <CardDescription>Select the client for this shift</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientId">Client *</Label>
            <Select name="clientId" onValueChange={handleClientChange} required>
              <SelectTrigger id="clientId">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.careRecipientName ||
                      `${client.user.firstName} ${client.user.lastName}`}{' '}
                    - {client.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedClient && (
            <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Location:</span>{' '}
                {selectedClient.city}
              </p>
              <p>
                <span className="text-muted-foreground">Service Level:</span>{' '}
                {selectedClient.serviceLevel}
              </p>
              <p>
                <span className="text-muted-foreground">Standard Rate:</span> $
                {selectedClient.billingRate}/hr
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
          <CardDescription>Set the date and time for this shift</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              type="date"
              id="date"
              name="date"
              min={minDate}
              value={dateInput}
              onChange={(event) => {
                const nextDate = event.target.value;
                setDateInput(nextDate);
                if (recurrenceMode === 'WEEKLY' && nextDate) {
                  const day = new Date(`${nextDate}T00:00:00`).getDay();
                  if (!Number.isNaN(day)) {
                    setRecurrenceWeekdays([day]);
                  }
                }
              }}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                type="time"
                id="startTime"
                name="startTime"
                defaultValue="09:00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                type="time"
                id="endTime"
                name="endTime"
                defaultValue="17:00"
                required
              />
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-border/50 bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Recurring Shift</p>
                <p className="text-xs text-muted-foreground">Use presets for quick setup, or customize as needed.</p>
              </div>
              <Switch
                checked={recurrenceEnabled}
                onCheckedChange={setRecurrenceEnabled}
                aria-label="Toggle recurring shift"
              />
            </div>

            {recurrenceEnabled && (
              <>
                <input type="hidden" name="recurrence" value={recurrencePayload} />

                <div className="space-y-2">
                  <Label>How often</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'DAILY', label: 'Daily' },
                      { key: 'WEEKDAYS', label: 'Weekdays' },
                      { key: 'WEEKLY', label: 'Weekly' },
                      { key: 'CUSTOM', label: 'Custom' },
                    ].map((option) => (
                      <Button
                        key={option.key}
                        type="button"
                        size="sm"
                        variant={recurrenceMode === option.key ? 'default' : 'outline'}
                        onClick={() => {
                          const mode = option.key as typeof recurrenceMode;
                          setRecurrenceMode(mode);
                          if (mode === 'DAILY') {
                            setRecurrencePattern('DAILY');
                            setRecurrenceInterval('1');
                            setRecurrenceWeekdays([0, 1, 2, 3, 4, 5, 6]);
                          }
                          if (mode === 'WEEKDAYS') {
                            setRecurrencePattern('DAILY');
                            setRecurrenceInterval('1');
                            setRecurrenceWeekdays([1, 2, 3, 4, 5]);
                          }
                          if (mode === 'WEEKLY') {
                            setRecurrencePattern('WEEKLY');
                            setRecurrenceInterval('1');
                            if (dateInput) {
                              const day = new Date(`${dateInput}T00:00:00`).getDay();
                              if (!Number.isNaN(day)) {
                                setRecurrenceWeekdays([day]);
                              }
                            }
                          }
                        }}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {(recurrenceMode === 'WEEKLY' || recurrenceMode === 'CUSTOM') && (
                  <div className="space-y-2">
                    <Label>Repeat On</Label>
                    <div className="flex flex-wrap gap-2">
                      {WEEKDAY_OPTIONS.map((day) => {
                        const selected = recurrenceWeekdaySet.includes(day.value);
                        return (
                          <Button
                            key={day.value}
                            type="button"
                            size="sm"
                            variant={selected ? 'default' : 'outline'}
                            onClick={() => toggleWeekday(day.value)}
                            disabled={recurrenceMode !== 'CUSTOM' && recurrenceMode !== 'WEEKLY'}
                          >
                            {day.label}
                          </Button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Select the days to include in the schedule.
                    </p>
                  </div>
                )}

                {recurrenceMode === 'CUSTOM' && (
                  <div className="space-y-3 rounded-md border border-border/40 bg-background/70 p-3">
                    <div className="flex items-center justify-between">
                      <Label>Advanced options</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowAdvancedRecurrence((prev) => !prev)}
                      >
                        {showAdvancedRecurrence ? 'Hide' : 'Show'}
                      </Button>
                    </div>

                    {showAdvancedRecurrence && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Pattern</Label>
                          <RadioGroup
                            value={recurrencePattern}
                            onValueChange={(value) => setRecurrencePattern(value as 'DAILY' | 'WEEKLY')}
                            className="space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <RadioGroupItem id="recurrence-custom-weekly" value="WEEKLY" />
                              <Label htmlFor="recurrence-custom-weekly" className="font-normal">Weekly</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <RadioGroupItem id="recurrence-custom-daily" value="DAILY" />
                              <Label htmlFor="recurrence-custom-daily" className="font-normal">Daily</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="recurrence-interval">
                            Repeat every {recurrenceInterval || '1'} {recurrencePattern === 'DAILY' ? 'day(s)' : 'week(s)'}
                          </Label>
                          <Input
                            id="recurrence-interval"
                            type="number"
                            min="1"
                            max="30"
                            value={recurrenceInterval}
                            onChange={(event) => setRecurrenceInterval(event.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Ends</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={recurrenceEndType === 'COUNT' ? 'default' : 'outline'}
                      onClick={() => setRecurrenceEndType('COUNT')}
                    >
                      After number of shifts
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={recurrenceEndType === 'UNTIL' ? 'default' : 'outline'}
                      onClick={() => setRecurrenceEndType('UNTIL')}
                    >
                      On specific date
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {recurrenceEndType === 'COUNT' ? (
                    <>
                      <Label htmlFor="recurrence-occurrences">Number of shifts</Label>
                      <Input
                        id="recurrence-occurrences"
                        type="number"
                        min="1"
                        max="180"
                        value={recurrenceOccurrences}
                        onChange={(event) => setRecurrenceOccurrences(event.target.value)}
                      />
                    </>
                  ) : (
                    <>
                      <Label htmlFor="recurrence-until">End date</Label>
                      <Input
                        id="recurrence-until"
                        type="date"
                        min={minDate}
                        value={recurrenceUntilDate}
                        onChange={(event) => setRecurrenceUntilDate(event.target.value)}
                      />
                    </>
                  )}
                </div>

                {recurrenceSummary && (
                  <p className="rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
                    {recurrenceSummary}
                  </p>
                )}

                {recurrenceEstimatedCount !== null && (
                  <p className="text-xs text-muted-foreground">
                    Estimated shifts to create: <span className="font-semibold text-foreground">{recurrenceEstimatedCount}</span>
                  </p>
                )}

                {recurrencePreviewDates.length > 0 && (
                  <div className="space-y-2">
                    <Label>Next shifts</Label>
                    <div className="flex flex-wrap gap-2">
                      {recurrencePreviewDates.map((label) => (
                        <Badge key={label} variant="secondary">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Service Details */}
      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
          <CardDescription>
            Specify the type of care and required skills
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Type *</Label>
            <Select
              name="serviceTypeId"
              value={selectedServiceTypeId}
              onValueChange={(value) => {
                setSelectedServiceTypeId(value);
                if (workerRateMode === 'percentage') {
                  setWorkerRatePercentInput(String(getDefaultPercentForServiceType(value)));
                }
              }}
            >
              <SelectTrigger id="serviceType">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((serviceType) => (
                  <SelectItem key={serviceType.id} value={serviceType.id}>
                    {serviceType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Assigned Skills</Label>
            <div className="flex flex-wrap gap-2 rounded-lg border border-border/50 bg-muted/20 p-3">
              {selectedServiceType?.skills.length ? (
                selectedServiceType.skills.map((skill) => (
                  <Badge key={`service-skill-${skill}`} variant="secondary">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No skills are assigned to this service type yet.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any special instructions or requirements..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Billing & Pay Rates</CardTitle>
          <CardDescription>Set the hourly rates for this shift</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clientRate">Client Rate ($/hr) *</Label>
              <Input
                type="number"
                id="clientRate"
                name="clientRate"
                step="0.01"
                min="0"
                defaultValue={selectedClient?.billingRate || 32}
                required
              />
              <p className="text-xs text-muted-foreground">
                Amount billed to the client
              </p>
            </div>
            <div className="space-y-2">
              <Label>Worker Rate Method</Label>
              <input type="hidden" name="workerRateMode" value={workerRateMode} />
              <RadioGroup
                value={workerRateMode}
                onValueChange={(value) => setWorkerRateMode(value as 'fixed' | 'percentage')}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="worker-rate-percentage" value="percentage" />
                  <Label htmlFor="worker-rate-percentage" className="font-normal">Percentage of client rate</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="worker-rate-fixed" value="fixed" />
                  <Label htmlFor="worker-rate-fixed" className="font-normal">Fixed worker rate</Label>
                </div>
              </RadioGroup>

              {workerRateMode === 'percentage' ? (
                <>
                  <Label htmlFor="workerRatePercent" className="sr-only">Worker Rate Percentage</Label>
                  <Input
                    type="number"
                    id="workerRatePercent"
                    name="workerRatePercent"
                    step="0.1"
                    min="1"
                    max="100"
                    value={workerRatePercentInput}
                    onChange={(event) => setWorkerRatePercentInput(event.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Worker earns this percent of client rate (default 65%).
                  </p>
                </>
              ) : (
                <>
                  <Label htmlFor="workerRate" className="sr-only">Worker Rate</Label>
                  <Input
                    type="number"
                    id="workerRate"
                    name="workerRate"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 22.00"
                  />
                  <p className="text-xs text-muted-foreground">
                    Set an explicit hourly worker rate for this shift.
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <IconLoader2 className="size-4 mr-2 animate-spin" />
          ) : (
            <IconCalendarPlus className="size-4 mr-2" />
          )}
          Create Shift
        </Button>
      </div>
    </form>
  );
}
