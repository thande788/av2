'use client';

import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertTriangle,
  Phone,
  ShieldAlert,
  Send,
  User,
} from 'lucide-react';
import { reportEmergencyIncident, type EmergencyIncidentData } from '@/app/actions/emergency';
import { toast } from 'sonner';

type IncidentType = 'FALL' | 'MEDICAL_EMERGENCY' | 'BEHAVIORAL' | 'SAFETY_CONCERN' | 'MISSED_MEDICATION' | 'PROPERTY_DAMAGE' | 'OTHER';
type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

const incidentTypes: { value: IncidentType; label: string }[] = [
  { value: 'FALL', label: 'Fall' },
  { value: 'MEDICAL_EMERGENCY', label: 'Medical Emergency' },
  { value: 'BEHAVIORAL', label: 'Behavioral Issue' },
  { value: 'SAFETY_CONCERN', label: 'Safety Concern' },
  { value: 'MISSED_MEDICATION', label: 'Missed Medication' },
  { value: 'PROPERTY_DAMAGE', label: 'Property Damage' },
  { value: 'OTHER', label: 'Other' },
];

const severityOptions: { value: IncidentSeverity; label: string; color: string }[] = [
  { value: 'LOW', label: 'Low', color: 'border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-400' },
  { value: 'MEDIUM', label: 'Medium', color: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400' },
  { value: 'HIGH', label: 'High', color: 'border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-400' },
  { value: 'CRITICAL', label: 'Critical', color: 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400' },
];

interface EmergencyPanelProps {
  shiftId?: string;
  clientId?: string;
  emergencyContact?: {
    emergencyName: string | null;
    emergencyPhone: string | null;
    emergencyRelation: string | null;
  } | null;
}

export function EmergencyPanel({ shiftId, clientId, emergencyContact }: EmergencyPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<IncidentType>('OTHER');
  const [severity, setSeverity] = useState<IncidentSeverity>('MEDIUM');
  const [description, setDescription] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!description.trim() || description.trim().length < 10) {
      toast.error('Please provide more details (at least 10 characters)');
      return;
    }

    startTransition(async () => {
      const result = await reportEmergencyIncident({
        shiftId,
        clientId,
        type,
        description: description.trim(),
        severity,
      });

      if (result.success) {
        toast.success('Incident reported. Office has been notified.');
        setShowForm(false);
        setDescription('');
        setSeverity('MEDIUM');
        setType('OTHER');
      } else {
        toast.error(result.error || 'Failed to report');
      }
    });
  };

  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <ShieldAlert className="size-5 text-red-600 dark:text-red-400" />
        <h3 className="font-semibold text-red-700 dark:text-red-400">Emergency & Escalation</h3>
      </div>

      {/* Emergency contacts */}
      {emergencyContact?.emergencyPhone && (
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-border/50 bg-background p-3">
          <User className="size-4 text-muted-foreground" />
          <div className="flex-1 text-sm">
            <p className="font-medium">{emergencyContact.emergencyName || 'Emergency Contact'}</p>
            {emergencyContact.emergencyRelation && (
              <p className="text-xs text-muted-foreground">{emergencyContact.emergencyRelation}</p>
            )}
          </div>
          <a
            href={`tel:${emergencyContact.emergencyPhone}`}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
          >
            <Phone className="size-3" />
            Call
          </a>
        </div>
      )}

      {/* Office contact */}
      <div className="mb-3 flex items-center gap-3 rounded-lg border border-border/50 bg-background p-3">
        <Phone className="size-4 text-muted-foreground" />
        <div className="flex-1 text-sm">
          <p className="font-medium">Angel Touch Office</p>
          <p className="text-xs text-muted-foreground">24/7 Support Line</p>
        </div>
        <a
          href="tel:+19781234567"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Phone className="size-3" />
          Call Office
        </a>
      </div>

      {/* Report incident button or form */}
      {!showForm ? (
        <Button
          variant="outline"
          className="w-full border-red-500/30 text-red-700 hover:bg-red-500/10 dark:text-red-400"
          onClick={() => setShowForm(true)}
        >
          <AlertTriangle className="mr-2 size-4" />
          Report Incident
        </Button>
      ) : (
        <div className="space-y-3 rounded-lg border border-border/50 bg-background p-4">
          {/* Type selection */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Incident Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as IncidentType)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {incidentTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Severity</label>
            <div className="flex gap-1.5">
              {severityOptions.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  className={cn(
                    'rounded-md border px-3 py-1 text-xs font-medium transition-colors',
                    severity === s.value ? s.color : 'border-border bg-muted text-muted-foreground'
                  )}
                  onClick={() => setSeverity(s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the incident in detail..."
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Send className="mr-1.5 size-3.5" />
              {isPending ? 'Reporting…' : 'Report Incident'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
