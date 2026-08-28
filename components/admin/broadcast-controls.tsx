'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Filter,
  Eye,
  Users,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  previewBroadcast,
  sendTargetedBroadcast,
  type BroadcastFilter,
  type BroadcastPreview,
} from '@/app/actions/shift-broadcast';
import { toast } from 'sonner';

interface BroadcastControlsProps {
  shiftId: string;
  defaultSkills?: string[];
  filterOptions: {
    skills: string[];
    cities: string[];
    languages: string[];
  };
}

export function BroadcastControls({ shiftId, defaultSkills = [], filterOptions }: BroadcastControlsProps) {
  const initialSkills = defaultSkills.filter((skill) => filterOptions.skills.includes(skill));
  const [isPending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);
  const [preview, setPreview] = useState<BroadcastPreview | null>(null);
  const [filter, setFilter] = useState<BroadcastFilter>({
    skills: initialSkills,
    cities: [],
    languages: [],
    complianceOnly: true,
  });
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);

  const toggleItem = (key: 'skills' | 'cities' | 'languages', item: string) => {
    setFilter((prev) => {
      const current = prev[key] || [];
      const next = current.includes(item) ? current.filter((i) => i !== item) : [...current, item];
      return { ...prev, [key]: next };
    });
    setPreview(null);
  };

  const handlePreview = () => {
    startTransition(async () => {
      const res = await previewBroadcast(shiftId, filter);
      if (res.success && res.preview) {
        setPreview(res.preview);
      } else {
        toast.error(res.error || 'Failed to preview');
      }
    });
  };

  const handleSend = () => {
    if (!preview) {
      toast.error('Preview recipients before sending the broadcast');
      return;
    }

    startTransition(async () => {
      const res = await sendTargetedBroadcast(shiftId, filter);
      if (res.success) {
        setResult({ sent: res.sent, failed: res.failed });
        toast.success(`Notified ${res.sent} worker(s)`);
        setPreview(null);
      } else {
        toast.error(res.error || 'Failed to send');
      }
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-border/50 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Broadcast to Workers</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="mr-1.5 size-3.5" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {showFilters && (
        <div className="space-y-3 rounded-lg border border-border/30 bg-muted/30 p-4">
          {/* Skills filter */}
          {filterOptions.skills.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {filterOptions.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant={filter.skills?.includes(skill) ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => toggleItem('skills', skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Cities filter */}
          {filterOptions.cities.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Cities</p>
              <div className="flex flex-wrap gap-1.5">
                {filterOptions.cities.map((city) => (
                  <Badge
                    key={city}
                    variant={filter.cities?.includes(city) ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => toggleItem('cities', city)}
                  >
                    {city}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Languages filter */}
          {filterOptions.languages.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Languages</p>
              <div className="flex flex-wrap gap-1.5">
                {filterOptions.languages.map((lang) => (
                  <Badge
                    key={lang}
                    variant={filter.languages?.includes(lang) ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => toggleItem('languages', lang)}
                  >
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Compliance only toggle */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filter.complianceOnly}
              onChange={(e) => {
                setFilter((p) => ({ ...p, complianceOnly: e.target.checked }));
                setPreview(null);
              }}
              className="rounded border-border"
            />
            <span>Compliant workers only</span>
          </label>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Users className="size-4 text-blue-600" />
            {preview.totalMatching} worker(s) match filters
          </div>
          <div className="max-h-40 space-y-1 overflow-y-auto text-xs">
            {preview.workers.map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded px-2 py-1 hover:bg-blue-500/10">
                <span>{w.name}</span>
                <div className="flex items-center gap-2">
                  {w.city && <span className="text-muted-foreground">{w.city}</span>}
                  {w.hasPhone ? (
                    <CheckCircle2 className="size-3 text-emerald-500" />
                  ) : (
                    <XCircle className="size-3 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {preview.workers.filter((w) => w.hasPhone).length} with phone numbers
          </p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={cn(
          'rounded-lg p-3 text-sm',
          result.failed === 0
            ? 'border border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400'
            : 'border border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400'
        )}>
          Sent to {result.sent} worker(s). {result.failed > 0 && `${result.failed} failed.`}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreview}
          disabled={isPending}
        >
          <Eye className="mr-1.5 size-3.5" />
          Preview Recipients
        </Button>
        <Button
          size="sm"
          onClick={handleSend}
          disabled={isPending || !preview || preview.totalMatching === 0}
        >
          <Send className="mr-1.5 size-3.5" />
          {isPending ? 'Sending…' : 'Send Broadcast'}
        </Button>
      </div>
      {!preview && (
        <p className="text-xs text-muted-foreground">
          Preview recipients first, then send broadcast.
        </p>
      )}
    </div>
  );
}
