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
import {
  createPricingTier,
  updatePricingTier,
  type PricingFormState,
} from './actions';

type PricingTierData = {
  id: string;
  slug: string;
  title: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  ctaText: string | null;
  ctaHref: string | null;
};

interface PricingTierFormProps {
  tier?: PricingTierData;
}

export function PricingTierForm({ tier }: PricingTierFormProps) {
  const isEditing = !!tier;

  const boundAction = isEditing
    ? updatePricingTier.bind(null, tier.id)
    : createPricingTier;

  const [state, formAction, isPending] = useActionState<PricingFormState, FormData>(
    boundAction,
    { success: false }
  );

  return (
    <form action={formAction}>
      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          {/* Title + Slug */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={tier?.title}
                placeholder="e.g. Companion Care"
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
                defaultValue={tier?.slug}
                placeholder="e.g. companion"
                required
              />
              {state.errors?.slug && (
                <p className="text-sm text-destructive">{state.errors.slug[0]}</p>
              )}
            </div>
          </div>

          {/* Price + Period */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min={0}
                defaultValue={tier?.price}
                placeholder="28"
                required
              />
              {state.errors?.price && (
                <p className="text-sm text-destructive">{state.errors.price[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">Billing Period *</Label>
              <Select name="period" defaultValue={tier?.period || 'hour'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">Per Hour</SelectItem>
                  <SelectItem value="day">Per Day</SelectItem>
                  <SelectItem value="week">Per Week</SelectItem>
                  <SelectItem value="month">Per Month</SelectItem>
                </SelectContent>
              </Select>
              {state.errors?.period && (
                <p className="text-sm text-destructive">{state.errors.period[0]}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={tier?.description}
              placeholder="Brief description of what this tier includes..."
              rows={2}
              required
            />
            {state.errors?.description && (
              <p className="text-sm text-destructive">{state.errors.description[0]}</p>
            )}
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label htmlFor="features">Features (one per line) *</Label>
            <Textarea
              id="features"
              name="features"
              defaultValue={tier?.features.join('\n')}
              placeholder={"Light housekeeping\nMeal preparation\nMedication reminders"}
              rows={5}
              required
            />
            {state.errors?.features && (
              <p className="text-sm text-destructive">{state.errors.features[0]}</p>
            )}
          </div>

          {/* Sort Order, Status, Popular */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={tier?.sortOrder ?? 0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <Select
                name="isActive"
                defaultValue={tier?.isActive !== false ? 'true' : 'false'}
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
            <div className="space-y-2">
              <Label htmlFor="isPopular">Popular Badge</Label>
              <Select
                name="isPopular"
                defaultValue={tier?.isPopular ? 'true' : 'false'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">No</SelectItem>
                  <SelectItem value="true">Yes — show &quot;Popular&quot; badge</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* CTA Overrides */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ctaText">CTA Text (optional)</Label>
              <Input
                id="ctaText"
                name="ctaText"
                defaultValue={tier?.ctaText || ''}
                placeholder="Get Started"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ctaHref">CTA Link (optional)</Label>
              <Input
                id="ctaHref"
                name="ctaHref"
                defaultValue={tier?.ctaHref || ''}
                placeholder="/contact"
              />
            </div>
          </div>
        </div>

        {state.message && !state.success && (
          <p className="text-sm text-destructive">{state.message}</p>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="ghost" asChild>
            <Link href="/admin/pricing">
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
                {isEditing ? 'Update' : 'Create'} Tier
              </>
            )}
          </Button>
        </div>
      </Card>
    </form>
  );
}
