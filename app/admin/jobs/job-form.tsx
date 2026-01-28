'use client';

import { useState, useTransition } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Plus, X, Loader2 } from 'lucide-react';
import { createJob, updateJob, type JobFormData } from './actions';

type JobData = {
  id: string;
  slug: string;
  title: string;
  department: string;
  type: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  salaryPeriod: string;
  description: string;
  responsibilities: string[];
  qualificationsReq: string[];
  qualificationsPref: string[];
  benefits: string[];
  isActive: boolean;
  closesAt: Date | null;
};

interface JobFormProps {
  job?: JobData;
  mode: 'create' | 'edit';
}

type Department = 'CAREGIVING' | 'ADMINISTRATIVE' | 'NURSING';
type JobType = 'FULL_TIME' | 'PART_TIME' | 'PER_DIEM';
type SalaryPeriod = 'HOURLY' | 'ANNUAL';

export function JobForm({ job, mode }: JobFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    slug: job?.slug ?? '',
    title: job?.title ?? '',
    department: (job?.department ?? 'CAREGIVING') as Department,
    type: (job?.type ?? 'FULL_TIME') as JobType,
    location: job?.location ?? 'Washington, D.C. Metro Area',
    salaryMin: job?.salaryMin ?? 15,
    salaryMax: job?.salaryMax ?? 25,
    salaryPeriod: (job?.salaryPeriod ?? 'HOURLY') as SalaryPeriod,
    description: job?.description ?? '',
    responsibilities: job?.responsibilities ?? [''],
    qualificationsReq: job?.qualificationsReq ?? [''],
    qualificationsPref: job?.qualificationsPref ?? [''],
    benefits: job?.benefits ?? [''],
    isActive: job?.isActive ?? true,
    closesAt: job?.closesAt ?? null,
  });

  const handleArrayAdd = (field: keyof typeof formData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] as string[]), ''],
    }));
  };

  const handleArrayRemove = (field: keyof typeof formData, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  const handleArrayChange = (field: keyof typeof formData, index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => (i === index ? value : item)),
    }));
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const data: JobFormData = {
          ...formData,
          responsibilities: formData.responsibilities.filter(Boolean),
          qualificationsReq: formData.qualificationsReq.filter(Boolean),
          qualificationsPref: formData.qualificationsPref.filter(Boolean),
          benefits: formData.benefits.filter(Boolean),
        };

        if (mode === 'create') {
          await createJob(data);
        } else if (job) {
          await updateJob(job.id, data);
        }

        router.push('/admin/jobs');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="rounded-xl border border-border/50 bg-card p-6 space-y-6">
        <h2 className="text-lg font-semibold">Basic Information</h2>
        
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Certified Nursing Assistant"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <div className="flex gap-2">
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="certified-nursing-assistant"
                pattern="^[a-z0-9-]+$"
                required
              />
              <Button type="button" variant="outline" onClick={generateSlug}>
                Generate
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value as Department }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CAREGIVING">Caregiving</SelectItem>
                <SelectItem value="ADMINISTRATIVE">Administrative</SelectItem>
                <SelectItem value="NURSING">Nursing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Employment Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value as JobType }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FULL_TIME">Full-time</SelectItem>
                <SelectItem value="PART_TIME">Part-time</SelectItem>
                <SelectItem value="PER_DIEM">Per Diem</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Washington, D.C."
              required
            />
          </div>

          <div className="flex items-center gap-4 pt-6">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked: boolean) => setFormData((prev) => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="isActive">Active (visible on careers page)</Label>
          </div>
        </div>
      </div>

      {/* Salary */}
      <div className="rounded-xl border border-border/50 bg-card p-6 space-y-6">
        <h2 className="text-lg font-semibold">Compensation</h2>
        
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="salaryMin">Minimum</Label>
            <Input
              id="salaryMin"
              type="number"
              min="0"
              value={formData.salaryMin}
              onChange={(e) => setFormData((prev) => ({ ...prev, salaryMin: Number(e.target.value) }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salaryMax">Maximum</Label>
            <Input
              id="salaryMax"
              type="number"
              min="0"
              value={formData.salaryMax}
              onChange={(e) => setFormData((prev) => ({ ...prev, salaryMax: Number(e.target.value) }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salaryPeriod">Period</Label>
            <Select
              value={formData.salaryPeriod}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, salaryPeriod: value as SalaryPeriod }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HOURLY">Hourly</SelectItem>
                <SelectItem value="ANNUAL">Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-xl border border-border/50 bg-card p-6 space-y-6">
        <h2 className="text-lg font-semibold">Job Description</h2>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the role, team, and what makes this opportunity great..."
            rows={6}
            required
          />
        </div>
      </div>

      {/* Responsibilities */}
      <div className="rounded-xl border border-border/50 bg-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Responsibilities</h2>
          <Button type="button" variant="outline" size="sm" onClick={() => handleArrayAdd('responsibilities')}>
            <Plus className="size-4 mr-1" /> Add
          </Button>
        </div>
        
        <div className="space-y-3">
          {formData.responsibilities.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => handleArrayChange('responsibilities', index, e.target.value)}
                placeholder="Enter a responsibility..."
              />
              {formData.responsibilities.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleArrayRemove('responsibilities', index)}
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Required Qualifications */}
      <div className="rounded-xl border border-border/50 bg-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Required Qualifications</h2>
          <Button type="button" variant="outline" size="sm" onClick={() => handleArrayAdd('qualificationsReq')}>
            <Plus className="size-4 mr-1" /> Add
          </Button>
        </div>
        
        <div className="space-y-3">
          {formData.qualificationsReq.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => handleArrayChange('qualificationsReq', index, e.target.value)}
                placeholder="Enter a required qualification..."
              />
              {formData.qualificationsReq.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleArrayRemove('qualificationsReq', index)}
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Preferred Qualifications */}
      <div className="rounded-xl border border-border/50 bg-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Preferred Qualifications</h2>
          <Button type="button" variant="outline" size="sm" onClick={() => handleArrayAdd('qualificationsPref')}>
            <Plus className="size-4 mr-1" /> Add
          </Button>
        </div>
        
        <div className="space-y-3">
          {formData.qualificationsPref.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => handleArrayChange('qualificationsPref', index, e.target.value)}
                placeholder="Enter a preferred qualification..."
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleArrayRemove('qualificationsPref', index)}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="rounded-xl border border-border/50 bg-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Benefits</h2>
          <Button type="button" variant="outline" size="sm" onClick={() => handleArrayAdd('benefits')}>
            <Plus className="size-4 mr-1" /> Add
          </Button>
        </div>
        
        <div className="space-y-3">
          {formData.benefits.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => handleArrayChange('benefits', index, e.target.value)}
                placeholder="Enter a benefit..."
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleArrayRemove('benefits', index)}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
          {mode === 'create' ? 'Create Job' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
