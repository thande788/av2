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
import type { ServiceItem } from '@prisma/client';
import {
  createServiceItem,
  updateServiceItem,
  type ServiceFormState,
} from '../../actions';

const ICON_OPTIONS = [
  { value: 'bath', label: 'Bath' },
  { value: 'wheelchair', label: 'Wheelchair' },
  { value: 'pill', label: 'Pill' },
  { value: 'broom', label: 'Broom' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'package', label: 'Package' },
  { value: 'users', label: 'Users' },
  { value: 'palette', label: 'Palette' },
  { value: 'car', label: 'Car' },
  { value: 'personal-care', label: 'Personal Care' },
  { value: 'household-services', label: 'Household' },
  { value: 'companionship', label: 'Companionship' },
];

interface ServiceItemFormProps {
  item?: ServiceItem;
  categoryId: string;
}

export function ServiceItemForm({ item, categoryId }: ServiceItemFormProps) {
  const isEditing = !!item;

  const boundAction = isEditing
    ? updateServiceItem.bind(null, item.id)
    : createServiceItem;

  const [state, formAction, isPending] = useActionState<ServiceFormState, FormData>(
    boundAction,
    { success: false }
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="categoryId" value={categoryId} />
      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={item?.title}
                placeholder="e.g. Daily Living Assistance"
                required
              />
              {state.errors?.title && (
                <p className="text-sm text-destructive">{state.errors.title[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={item?.slug}
                placeholder="e.g. daily-living"
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
              defaultValue={item?.description}
              placeholder="Describe this service..."
              rows={3}
              required
            />
            {state.errors?.description && (
              <p className="text-sm text-destructive">{state.errors.description[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Features (one per line)</Label>
            <Textarea
              id="features"
              name="features"
              defaultValue={item?.features?.join('\n') || ''}
              placeholder="Bathing assistance&#10;Hair care&#10;Dressing support"
              rows={5}
            />
            {state.errors?.features && (
              <p className="text-sm text-destructive">{state.errors.features[0]}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Icon *</Label>
              <Select name="icon" defaultValue={item?.icon || ''}>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceFrom">Price From ($)</Label>
              <Input
                id="priceFrom"
                name="priceFrom"
                type="number"
                min={0}
                step={0.01}
                defaultValue={item?.priceFrom ?? ''}
                placeholder="28"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={item?.sortOrder ?? 0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <Select
                name="isActive"
                defaultValue={item?.isActive !== false ? 'true' : 'false'}
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
        </div>

        {state.message && !state.success && (
          <p className="text-sm text-destructive">{state.message}</p>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="ghost" asChild>
            <Link href={`/admin/services/${categoryId}`}>
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
                {isEditing ? 'Update' : 'Create'} Service
              </>
            )}
          </Button>
        </div>
      </Card>
    </form>
  );
}
