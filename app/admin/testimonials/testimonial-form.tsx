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
import type { Testimonial } from '@prisma/client';
import {
  createTestimonial,
  updateTestimonial,
  type TestimonialFormState,
} from './actions';

interface TestimonialFormProps {
  testimonial?: Testimonial;
}

export function TestimonialForm({ testimonial }: TestimonialFormProps) {
  const isEditing = !!testimonial;

  const boundAction = isEditing
    ? updateTestimonial.bind(null, testimonial.id)
    : createTestimonial;

  const [state, formAction, isPending] = useActionState<TestimonialFormState, FormData>(
    boundAction,
    { success: false }
  );

  return (
    <form action={formAction}>
      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={testimonial?.name}
              placeholder="John Doe"
              required
            />
            {state.errors?.name && (
              <p className="text-sm text-destructive">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role / Relationship</Label>
            <Input
              id="role"
              name="role"
              defaultValue={testimonial?.role || ''}
              placeholder="Family Member, Client, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Testimonial *</Label>
            <Textarea
              id="content"
              name="content"
              defaultValue={testimonial?.content}
              placeholder="Write the testimonial here..."
              rows={5}
              required
            />
            {state.errors?.content && (
              <p className="text-sm text-destructive">
                {state.errors.content[0]}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Select
                name="rating"
                defaultValue={String(testimonial?.rating || 5)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((r) => (
                    <SelectItem key={r} value={String(r)}>
                      {r} Star{r !== 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isPublished">Status</Label>
              <Select
                name="isPublished"
                defaultValue={testimonial?.isPublished ? 'true' : 'false'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Published</SelectItem>
                  <SelectItem value="false">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL (optional)</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              defaultValue={testimonial?.imageUrl || ''}
              placeholder="https://example.com/photo.jpg"
            />
            {state.errors?.imageUrl && (
              <p className="text-sm text-destructive">
                {state.errors.imageUrl[0]}
              </p>
            )}
          </div>
        </div>

        {state.message && !state.success && (
          <p className="text-sm text-destructive">{state.message}</p>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="ghost" asChild>
            <Link href="/admin/testimonials">
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
                {isEditing ? 'Update' : 'Create'} Testimonial
              </>
            )}
          </Button>
        </div>
      </Card>
    </form>
  );
}
