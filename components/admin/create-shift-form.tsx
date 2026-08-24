'use client';

import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createShift, type CreateShiftInput } from '@/app/actions/shifts';
import { IconLoader2, IconCalendarPlus } from '@tabler/icons-react';

interface Client {
  id: string;
  careRecipientName: string | null;
  billingRate: number;
  serviceLevel: string;
  city: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface CreateShiftFormProps {
  clients: Client[];
}

const SERVICE_LEVELS = [
  { value: 'COMPANION', label: 'Companion Care' },
  { value: 'PERSONAL', label: 'Personal Care' },
  { value: 'SKILLED', label: 'Skilled Nursing' },
  { value: 'LIVE_IN', label: 'Live-In Care' },
];

const SKILLS = [
  'Personal Care',
  'Dementia Care',
  'Hoyer Lift',
  'Meal Prep',
  'Companionship',
  'Medication Reminders',
  'Light Housekeeping',
  'Transportation',
];

export function CreateShiftForm({ clients }: CreateShiftFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [workerRateMode, setWorkerRateMode] = useState<'fixed' | 'percentage'>('percentage');

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);

    try {
      const clientId = formData.get('clientId') as string;
      const date = formData.get('date') as string;
      const startTime = formData.get('startTime') as string;
      const endTime = formData.get('endTime') as string;
      const serviceType = formData.get('serviceType') as 'COMPANION' | 'PERSONAL' | 'SKILLED' | 'LIVE_IN';
      const clientRate = parseFloat(formData.get('clientRate') as string);
      const workerRate = parseFloat(formData.get('workerRate') as string);
      const workerRateModeValue = formData.get('workerRateMode') as 'fixed' | 'percentage';
      const workerRatePercent = parseFloat(formData.get('workerRatePercent') as string);
      const notes = formData.get('notes') as string;

      const input: CreateShiftInput = {
        clientId,
        date,
        startTime,
        endTime,
        serviceType,
        skillsRequired: selectedSkills,
        clientRate,
        workerRateMode: workerRateModeValue,
        workerRate: workerRateModeValue === 'fixed' && Number.isFinite(workerRate) ? workerRate : undefined,
        workerRatePercent:
          workerRateModeValue === 'percentage' && Number.isFinite(workerRatePercent)
            ? workerRatePercent
            : undefined,
        notes: notes || undefined,
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
  }

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  // Get tomorrow's date as the minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

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
              name="serviceType"
              defaultValue={selectedClient?.serviceLevel || 'PERSONAL'}
            >
              <SelectTrigger id="serviceType">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Required Skills</Label>
            <div className="grid grid-cols-2 gap-2">
              {SKILLS.map((skill) => (
                <div key={skill} className="flex items-center space-x-2">
                  <Checkbox
                    id={`skill-${skill}`}
                    checked={selectedSkills.includes(skill)}
                    onCheckedChange={() => toggleSkill(skill)}
                  />
                  <label
                    htmlFor={`skill-${skill}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {skill}
                  </label>
                </div>
              ))}
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
                    defaultValue="65"
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
