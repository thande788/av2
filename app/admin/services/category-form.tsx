'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { getServiceIcon } from '@/lib/icons';
import type { ServiceCategory } from '@prisma/client';
import {
  createServiceCategory,
  updateServiceCategory,
  type ServiceFormState,
} from './actions';

const ICON_OPTIONS = [
  { value: 'personal-care', label: 'Personal Care' },
  { value: 'household-services', label: 'Household Services' },
  { value: 'companionship', label: 'Companionship' },
  { value: 'bath', label: 'Bath' },
  { value: 'wheelchair', label: 'Wheelchair' },
  { value: 'pill', label: 'Pill' },
  { value: 'broom', label: 'Broom' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'package', label: 'Package' },
  { value: 'users', label: 'Users' },
  { value: 'palette', label: 'Palette' },
  { value: 'car', label: 'Car' },
];

interface CategoryFormProps {
  category?: ServiceCategory;
}

export function CategoryForm({ category }: CategoryFormProps) {
  const isEditing = !!category;

  const boundAction = isEditing
    ? updateServiceCategory.bind(null, category.id)
    : createServiceCategory;

  const [state, formAction, isPending] = useActionState<ServiceFormState, FormData>(
    boundAction,
    { success: false }
  );

  return (
    <form action={formAction}>
      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={category?.name}
                placeholder="e.g. Personal Care"
                required
              />
              {state.errors?.name && (
                <p className="text-sm text-destructive">{state.errors.name[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={category?.slug}
                placeholder="e.g. personal-care"
                required
              />
              {state.errors?.slug && (
                <p className="text-sm text-destructive">{state.errors.slug[0]}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={category?.description}
              placeholder="Describe this service category..."
              rows={3}
              required
            />
            {state.errors?.description && (
              <p className="text-sm text-destructive">{state.errors.description[0]}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="icon">Icon *</Label>
              <Select name="icon" defaultValue={category?.icon || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        {getServiceIcon(opt.value, 'size-4')}
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.icon && (
                <p className="text-sm text-destructive">{state.errors.icon[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={category?.sortOrder ?? 0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <Select
                name="isActive"
                defaultValue={category?.isActive !== false ? 'true' : 'false'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image URL (optional)</Label>
            <Input
              id="image"
              name="image"
              type="url"
              defaultValue={category?.image || ''}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        {state.message && !state.success && (
          <p className="text-sm text-destructive">{state.message}</p>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="ghost" asChild>
            <Link href="/admin/services">
              <ArrowLeft className="size-4 mr-2" />
              Back
            </Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4 mr-2" />
                {isEditing ? 'Update' : 'Create'} Category
              </>
            )}
          </Button>
        </div>
      </Card>
    </form>
  );
}
