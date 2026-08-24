'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { IconArrowDown, IconArrowUp, IconLoader2 } from '@tabler/icons-react';
import type { ServiceTypeOption } from '@/lib/service-types';
import type { SkillOption } from '@/lib/skills';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  reorderServiceTypeConfig,
  reorderSkillConfig,
  saveServiceTypeConfig,
  saveSkillConfig,
} from './actions';

interface ServiceTypesManagerProps {
  serviceTypes: ServiceTypeOption[];
  skills: SkillOption[];
}

export function ServiceTypesManager({ serviceTypes, skills }: ServiceTypesManagerProps) {
  const router = useRouter();
  const [serviceTypeRows, setServiceTypeRows] = React.useState(serviceTypes);
  const [skillRows, setSkillRows] = React.useState(skills);
  const [saving, setSaving] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [newServiceTypeLabel, setNewServiceTypeLabel] = React.useState('');
  const [newServiceTypeDescription, setNewServiceTypeDescription] = React.useState('');
  const [newServiceTypeRatePercent, setNewServiceTypeRatePercent] = React.useState('65');
  const [newServiceTypeIsActive, setNewServiceTypeIsActive] = React.useState(true);
  const [isCreatingServiceType, setIsCreatingServiceType] = React.useState(false);
  const [isSkillLibraryOpen, setIsSkillLibraryOpen] = React.useState(false);
  const [isAddServiceTypeOpen, setIsAddServiceTypeOpen] = React.useState(false);

  const [newSkillLabel, setNewSkillLabel] = React.useState('');
  const [newSkillIsActive, setNewSkillIsActive] = React.useState(true);
  const [isCreatingSkill, setIsCreatingSkill] = React.useState(false);
  const [reordering, setReordering] = React.useState<string | null>(null);
  const [serviceTypeOpenState, setServiceTypeOpenState] = React.useState<Record<string, boolean>>({});

  const orderedServiceTypes = React.useMemo(
    () =>
      [...serviceTypeRows].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)
      ),
    [serviceTypeRows]
  );
  const orderedSkills = React.useMemo(
    () => [...skillRows].sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)),
    [skillRows]
  );

  const skillIdSetEquals = (a: string[], b: string[]) => {
    if (a.length !== b.length) {
      return false;
    }

    const bSet = new Set(b);
    return a.every((id) => bSet.has(id));
  };

  const isSkillDirty = (row: SkillOption) => {
    const original = skills.find((item) => item.id === row.id);
    if (!original) {
      return true;
    }

    return row.label.trim() !== original.label || row.isActive !== original.isActive;
  };

  const isServiceTypeDirty = (row: ServiceTypeOption) => {
    const original = serviceTypes.find((item) => item.id === row.id);
    if (!original) {
      return true;
    }

    return (
      row.label.trim() !== original.label ||
      row.description.trim() !== original.description ||
      Number(row.defaultWorkerRatePercent) !== Number(original.defaultWorkerRatePercent) ||
      row.isActive !== original.isActive ||
      !skillIdSetEquals(row.skillIds, original.skillIds)
    );
  };

  React.useEffect(() => {
    setServiceTypeRows(serviceTypes);
  }, [serviceTypes]);

  React.useEffect(() => {
    setSkillRows(skills);
  }, [skills]);

  React.useEffect(() => {
    setServiceTypeOpenState((prev) => {
      const next: Record<string, boolean> = {};
      for (const row of serviceTypeRows) {
        next[row.id] = prev[row.id] ?? false;
      }
      return next;
    });
  }, [serviceTypeRows]);

  const updateServiceTypeRow = <K extends keyof ServiceTypeOption>(
    id: string,
    key: K,
    value: ServiceTypeOption[K]
  ) => {
    setServiceTypeRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const updateSkillRow = <K extends keyof SkillOption>(
    id: string,
    key: K,
    value: SkillOption[K]
  ) => {
    setSkillRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const toggleServiceTypeSkill = (serviceTypeId: string, skillId: string) => {
    const skill = skillRows.find((row) => row.id === skillId);
    if (!skill) {
      return;
    }

    setServiceTypeRows((prev) =>
      prev.map((row) => {
        if (row.id !== serviceTypeId) {
          return row;
        }

        const exists = row.skillIds.includes(skillId);
        if (exists) {
          return {
            ...row,
            skillIds: row.skillIds.filter((id) => id !== skillId),
            skills: row.skills.filter((name) => name !== skill.label),
          };
        }

        return {
          ...row,
          skillIds: [...row.skillIds, skillId],
          skills: [...row.skills, skill.label],
        };
      })
    );
  };

  const handleSaveServiceType = async (id: string) => {
    const row = serviceTypeRows.find((item) => item.id === id);
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
      skillIds: row.skillIds,
    });

    setSaving(null);

    if (!result.success) {
      setError(result.error || 'Failed to save service type settings.');
      return;
    }

    setMessage(`Saved ${row.label}.`);
    router.refresh();
  };

  const handleSaveSkill = async (id: string) => {
    const row = skillRows.find((item) => item.id === id);
    if (!row) {
      return;
    }

    setSaving(id);
    setMessage(null);
    setError(null);

    const result = await saveSkillConfig({
      id: row.id,
      label: row.label.trim(),
      isActive: row.isActive,
    });

    setSaving(null);

    if (!result.success) {
      setError(result.error || 'Failed to save skill settings.');
      return;
    }

    setMessage(`Saved skill ${row.label}.`);
    router.refresh();
  };

  const handleCreateServiceType = async () => {
    const parsedRate = Number.parseFloat(newServiceTypeRatePercent);
    if (!newServiceTypeLabel.trim()) {
      setError('Service type label is required.');
      return;
    }
    if (!Number.isFinite(parsedRate) || parsedRate <= 0 || parsedRate > 100) {
      setError('Default worker rate % must be between 1 and 100.');
      return;
    }

    setIsCreatingServiceType(true);
    setMessage(null);
    setError(null);

    const result = await saveServiceTypeConfig({
      label: newServiceTypeLabel.trim(),
      description: newServiceTypeDescription.trim() || undefined,
      defaultWorkerRatePercent: parsedRate,
      isActive: newServiceTypeIsActive,
      skillIds: [],
    });

    setIsCreatingServiceType(false);

    if (!result.success) {
      setError(result.error || 'Failed to add service type.');
      return;
    }

    setNewServiceTypeLabel('');
    setNewServiceTypeDescription('');
    setNewServiceTypeRatePercent('65');
    setNewServiceTypeIsActive(true);
    setMessage('Added new service type.');
    router.refresh();
  };

  const handleCreateSkill = async () => {
    if (!newSkillLabel.trim()) {
      setError('Skill label is required.');
      return;
    }

    setIsCreatingSkill(true);
    setMessage(null);
    setError(null);

    const result = await saveSkillConfig({
      label: newSkillLabel.trim(),
      isActive: newSkillIsActive,
    });

    setIsCreatingSkill(false);

    if (!result.success) {
      setError(result.error || 'Failed to add skill.');
      return;
    }

    const optimisticSortOrder =
      skillRows.length > 0 ? Math.max(...skillRows.map((row) => row.sortOrder)) + 1 : 0;
    const tempId = `temp-skill-${Date.now()}`;
    setSkillRows((prev) => [
      ...prev,
      {
        id: tempId,
        key: tempId,
        label: newSkillLabel.trim(),
        isActive: newSkillIsActive,
        sortOrder: optimisticSortOrder,
      },
    ]);

    setNewSkillLabel('');
    setNewSkillIsActive(true);
    setMessage('Added new skill.');
    router.refresh();
  };

  const handleServiceTypeReorder = async (id: string, direction: 'up' | 'down') => {
    setReordering(`service-type:${id}:${direction}`);
    setError(null);
    setMessage(null);

    const result = await reorderServiceTypeConfig({ id, direction });
    setReordering(null);

    if (!result.success) {
      setError(result.error || 'Failed to reorder service types.');
      return;
    }

    router.refresh();
  };

  const handleSkillReorder = async (id: string, direction: 'up' | 'down') => {
    setReordering(`skill:${id}:${direction}`);
    setError(null);
    setMessage(null);

    const result = await reorderSkillConfig({ id, direction });
    setReordering(null);

    if (!result.success) {
      setError(result.error || 'Failed to reorder skills.');
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
        <Collapsible open={isSkillLibraryOpen} onOpenChange={setIsSkillLibraryOpen}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Skill Library</CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">
                {isSkillLibraryOpen ? 'Hide' : 'Show'}
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid gap-4 pb-3 md:grid-cols-[1fr_auto]">
                <div className="space-y-2">
                  <Label htmlFor="new-skill-label">Skill Name</Label>
                  <Input
                    id="new-skill-label"
                    value={newSkillLabel}
                    onChange={(event) => setNewSkillLabel(event.target.value)}
                    placeholder="e.g. Catheter Care"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex items-center gap-2 pb-2">
                    <Checkbox
                      id="new-skill-active"
                      checked={newSkillIsActive}
                      onCheckedChange={(checked) => setNewSkillIsActive(checked === true)}
                    />
                    <Label htmlFor="new-skill-active">Active</Label>
                  </div>
                  <Button
                    onClick={handleCreateSkill}
                    disabled={isCreatingSkill || !newSkillLabel.trim()}
                  >
                    {isCreatingSkill && <IconLoader2 className="mr-2 size-4 animate-spin" />}
                    Add Skill
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {orderedSkills.map((skill, index) => (
                  <div key={skill.id} className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleSkillReorder(skill.id, 'up')}
                        disabled={index === 0 || !!reordering}
                      >
                        {reordering === `skill:${skill.id}:up` ? (
                          <IconLoader2 className="size-4 animate-spin" />
                        ) : (
                          <IconArrowUp className="size-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleSkillReorder(skill.id, 'down')}
                        disabled={index === orderedSkills.length - 1 || !!reordering}
                      >
                        {reordering === `skill:${skill.id}:down` ? (
                          <IconLoader2 className="size-4 animate-spin" />
                        ) : (
                          <IconArrowDown className="size-4" />
                        )}
                      </Button>
                    </div>
                    <Input
                      value={skill.label}
                      onChange={(event) => updateSkillRow(skill.id, 'label', event.target.value)}
                      className="w-64"
                    />
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`${skill.id}-active`}
                        checked={skill.isActive}
                        onCheckedChange={(checked) =>
                          updateSkillRow(skill.id, 'isActive', checked === true)
                        }
                      />
                      <Label htmlFor={`${skill.id}-active`}>Active</Label>
                    </div>
                    <Button
                      onClick={() => handleSaveSkill(skill.id)}
                      disabled={saving === skill.id || !!reordering || !isSkillDirty(skill)}
                    >
                      {saving === skill.id && <IconLoader2 className="mr-2 size-4 animate-spin" />}
                      Save
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Service Types</CardTitle>
        </CardHeader>
        <CardContent>
          <Collapsible open={isAddServiceTypeOpen} onOpenChange={setIsAddServiceTypeOpen}>
            <div className="mb-3 flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
              <p className="text-sm font-medium">Add New Service Type</p>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  {isAddServiceTypeOpen ? 'Hide' : 'Show'}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <div className="space-y-4 pb-2">
                <div className="space-y-2">
                  <Label htmlFor="new-service-type-label">Label</Label>
                  <Input
                    id="new-service-type-label"
                    value={newServiceTypeLabel}
                    onChange={(event) => setNewServiceTypeLabel(event.target.value)}
                    placeholder="e.g. Post-Surgery Recovery"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-service-type-description">Description</Label>
                  <Textarea
                    id="new-service-type-description"
                    rows={2}
                    value={newServiceTypeDescription}
                    onChange={(event) => setNewServiceTypeDescription(event.target.value)}
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
                      value={newServiceTypeRatePercent}
                      onChange={(event) => setNewServiceTypeRatePercent(event.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center gap-2 pb-2">
                      <Checkbox
                        id="new-service-type-active"
                        checked={newServiceTypeIsActive}
                        onCheckedChange={(checked) => setNewServiceTypeIsActive(checked === true)}
                      />
                      <Label htmlFor="new-service-type-active">Active in shift forms</Label>
                    </div>
                  </div>
                </div>

                <Button onClick={handleCreateServiceType} disabled={isCreatingServiceType}>
                  {isCreatingServiceType && <IconLoader2 className="mr-2 size-4 animate-spin" />}
                  Add Service Type
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {orderedServiceTypes.map((serviceType, index) => (
        <Collapsible
          key={serviceType.id}
          open={serviceTypeOpenState[serviceType.id] ?? false}
          onOpenChange={(open) =>
            setServiceTypeOpenState((prev) => ({
              ...prev,
              [serviceType.id]: open,
            }))
          }
        >
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
              <CardTitle className="text-base">{serviceType.label}</CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleServiceTypeReorder(serviceType.id, 'up')}
                  disabled={index === 0 || !!reordering}
                  aria-label={`Move ${serviceType.label} up`}
                >
                  {reordering === `service-type:${serviceType.id}:up` ? (
                    <IconLoader2 className="size-4 animate-spin" />
                  ) : (
                    <IconArrowUp className="size-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleServiceTypeReorder(serviceType.id, 'down')}
                  disabled={index === orderedServiceTypes.length - 1 || !!reordering}
                  aria-label={`Move ${serviceType.label} down`}
                >
                  {reordering === `service-type:${serviceType.id}:down` ? (
                    <IconLoader2 className="size-4 animate-spin" />
                  ) : (
                    <IconArrowDown className="size-4" />
                  )}
                </Button>
                <CollapsibleTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    {serviceTypeOpenState[serviceType.id] ? 'Hide' : 'Edit'}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${serviceType.id}-label`}>Label</Label>
              <Input
                id={`${serviceType.id}-label`}
                value={serviceType.label}
                onChange={(event) => updateServiceTypeRow(serviceType.id, 'label', event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${serviceType.id}-description`}>Description</Label>
              <Textarea
                id={`${serviceType.id}-description`}
                rows={2}
                value={serviceType.description}
                onChange={(event) =>
                  updateServiceTypeRow(serviceType.id, 'description', event.target.value)
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`${serviceType.id}-default-rate`}>Default Worker Rate %</Label>
                <Input
                  id={`${serviceType.id}-default-rate`}
                  type="number"
                  min="1"
                  max="100"
                  step="0.1"
                  value={serviceType.defaultWorkerRatePercent}
                  onChange={(event) =>
                    updateServiceTypeRow(
                      serviceType.id,
                      'defaultWorkerRatePercent',
                      Number.parseFloat(event.target.value || '0')
                    )
                  }
                />
              </div>
              <div className="flex items-end">
                <div className="flex items-center gap-2 pb-2">
                  <Checkbox
                    id={`${serviceType.id}-active`}
                    checked={serviceType.isActive}
                    onCheckedChange={(checked) =>
                      updateServiceTypeRow(serviceType.id, 'isActive', checked === true)
                    }
                  />
                  <Label htmlFor={`${serviceType.id}-active`}>Active in shift forms</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assigned Skills</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {orderedSkills.map((skill) => {
                  const checked = serviceType.skillIds.includes(skill.id);
                  return (
                    <label
                      key={`${serviceType.id}-${skill.id}`}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border p-2"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleServiceTypeSkill(serviceType.id, skill.id)}
                      />
                      <span className="text-sm">{skill.label}</span>
                    </label>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2">
                {serviceType.skills.map((skill) => (
                  <Badge key={`${serviceType.id}-pill-${skill}`} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">Use arrows to control display order.</p>

            <Button
              onClick={() => handleSaveServiceType(serviceType.id)}
              disabled={saving === serviceType.id || !!reordering || !isServiceTypeDirty(serviceType)}
            >
              {saving === serviceType.id && <IconLoader2 className="mr-2 size-4 animate-spin" />}
              Save
            </Button>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  );
}
