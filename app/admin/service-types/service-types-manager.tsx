'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { IconArrowDown, IconArrowUp, IconLoader2 } from '@tabler/icons-react';
import type { ServiceTypeOption } from '@/lib/service-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { reorderServiceTypeConfig, saveServiceTypeConfig } from './actions';

interface ServiceTypesManagerProps {
  serviceTypes: ServiceTypeOption[];
}

export function ServiceTypesManager({ serviceTypes }: ServiceTypesManagerProps) {
  const router = useRouter();
  const [rows, setRows] = React.useState(serviceTypes);
  const [saving, setSaving] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [newLabel, setNewLabel] = React.useState('');
  const [newDescription, setNewDescription] = React.useState('');
  const [newRatePercent, setNewRatePercent] = React.useState('65');
  const [newIsActive, setNewIsActive] = React.useState(true);
  const [isCreating, setIsCreating] = React.useState(false);
  const [reordering, setReordering] = React.useState<string | null>(null);

  const orderedRows = React.useMemo(
    () => [...rows].sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)),
    [rows]
  );

  React.useEffect(() => {
    setRows(serviceTypes);
  }, [serviceTypes]);

  const updateRow = <K extends keyof ServiceTypeOption>(
    id: string,
    key: K,
    value: ServiceTypeOption[K]
  ) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const handleSave = async (id: string) => {
    const row = rows.find((item) => item.id === id);
    if (!row) {
      return;
    }

    setSaving(id);
    setMessage(null);
    setError(null);

    const result = await saveServiceTypeConfig({
      id: row.id,
      label: row.label.trim(),
      description: row.description.trim() || undefined,
      defaultWorkerRatePercent: Number(row.defaultWorkerRatePercent),
      isActive: row.isActive,
    });

    setSaving(null);

    if (!result.success) {
      setError(result.error || 'Failed to save service type settings.');
      return;
    }

    setMessage(`Saved ${row.label}.`);
    router.refresh();
  };

  const handleCreate = async () => {
    const parsedRate = Number.parseFloat(newRatePercent);
    if (!newLabel.trim()) {
      setError('Label is required.');
      return;
    }
    if (!Number.isFinite(parsedRate) || parsedRate <= 0 || parsedRate > 100) {
      setError('Default worker rate % must be between 1 and 100.');
      return;
    }

    setIsCreating(true);
    setMessage(null);
    setError(null);

    const result = await saveServiceTypeConfig({
      label: newLabel.trim(),
      description: newDescription.trim() || undefined,
      defaultWorkerRatePercent: parsedRate,
      isActive: newIsActive,
    });

    setIsCreating(false);

    if (!result.success) {
      setError(result.error || 'Failed to add service type.');
      return;
    }

    const optimisticSortOrder =
      rows.length > 0 ? Math.max(...rows.map((row) => row.sortOrder)) + 1 : 0;
    setRows((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        key: `temp-${Date.now()}`,
        label: newLabel.trim(),
        description: newDescription.trim(),
        defaultWorkerRatePercent: parsedRate,
        isActive: newIsActive,
        sortOrder: optimisticSortOrder,
      },
    ]);

    setNewLabel('');
    setNewDescription('');
    setNewRatePercent('65');
    setNewIsActive(true);
    setMessage('Added new service type. Sort order assigned automatically.');
    router.refresh();
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const index = orderedRows.findIndex((row) => row.id === id);
    if (index === -1) {
      return;
    }

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= orderedRows.length) {
      return;
    }

    setError(null);
    setMessage(null);
    setReordering(`${id}:${direction}`);

    const nextRows = [...orderedRows];
    const current = nextRows[index];
    const target = nextRows[swapIndex];

    nextRows[index] = { ...target, sortOrder: current.sortOrder };
    nextRows[swapIndex] = { ...current, sortOrder: target.sortOrder };
    setRows(nextRows);

    const result = await reorderServiceTypeConfig({ id, direction });
    setReordering(null);

    if (!result.success) {
      setError(result.error || 'Failed to reorder service types.');
      router.refresh();
      return;
    }

    router.refresh();
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          {message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add New Service Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-service-type-label">Label</Label>
            <Input
              id="new-service-type-label"
              value={newLabel}
              onChange={(event) => setNewLabel(event.target.value)}
              placeholder="e.g. Post-Surgery Recovery"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-service-type-description">Description</Label>
            <Textarea
              id="new-service-type-description"
              rows={2}
              value={newDescription}
              onChange={(event) => setNewDescription(event.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-service-type-rate">Default Worker Rate %</Label>
              <Input
                id="new-service-type-rate"
                type="number"
                min="1"
                max="100"
                step="0.1"
                value={newRatePercent}
                onChange={(event) => setNewRatePercent(event.target.value)}
              />
            </div>
            <div className="flex items-end">
              <div className="flex items-center gap-2 pb-2">
                <Checkbox
                  id="new-service-type-active"
                  checked={newIsActive}
                  onCheckedChange={(checked) => setNewIsActive(checked === true)}
                />
                <Label htmlFor="new-service-type-active">Active in shift forms</Label>
              </div>
            </div>
          </div>

          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating && <IconLoader2 className="mr-2 size-4 animate-spin" />}
            Add Service Type
          </Button>
        </CardContent>
      </Card>

      {orderedRows.map((row, index) => (
        <Card key={row.id}>
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <CardTitle className="text-base">{row.label}</CardTitle>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleReorder(row.id, 'up')}
                disabled={index === 0 || !!reordering}
                aria-label={`Move ${row.label} up`}
              >
                {reordering === `${row.id}:up` ? (
                  <IconLoader2 className="size-4 animate-spin" />
                ) : (
                  <IconArrowUp className="size-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleReorder(row.id, 'down')}
                disabled={index === orderedRows.length - 1 || !!reordering}
                aria-label={`Move ${row.label} down`}
              >
                {reordering === `${row.id}:down` ? (
                  <IconLoader2 className="size-4 animate-spin" />
                ) : (
                  <IconArrowDown className="size-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${row.id}-label`}>Label</Label>
              <Input
                id={`${row.id}-label`}
                value={row.label}
                onChange={(event) => updateRow(row.id, 'label', event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${row.id}-description`}>Description</Label>
              <Textarea
                id={`${row.id}-description`}
                rows={2}
                value={row.description}
                onChange={(event) => updateRow(row.id, 'description', event.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`${row.id}-default-rate`}>Default Worker Rate %</Label>
                <Input
                  id={`${row.id}-default-rate`}
                  type="number"
                  min="1"
                  max="100"
                  step="0.1"
                  value={row.defaultWorkerRatePercent}
                  onChange={(event) =>
                    updateRow(
                      row.id,
                      'defaultWorkerRatePercent',
                      Number.parseFloat(event.target.value || '0')
                    )
                  }
                />
              </div>
              <div className="flex items-end">
                <div className="flex items-center gap-2 pb-2">
                  <Checkbox
                    id={`${row.id}-active`}
                    checked={row.isActive}
                    onCheckedChange={(checked) => updateRow(row.id, 'isActive', checked === true)}
                  />
                  <Label htmlFor={`${row.id}-active`}>Active in shift forms</Label>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">Use arrows to control display order.</p>

            <Button onClick={() => handleSave(row.id)} disabled={saving === row.id || isCreating}>
              {saving === row.id && <IconLoader2 className="mr-2 size-4 animate-spin" />}
              Save
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
