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
import { ArrowLeft, Loader2, Save, Video } from 'lucide-react';
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

          <div className="grid gap-4 sm:grid-cols-3">
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
              <Label htmlFor="status">Status</Label>
              <Select
                name="status"
                defaultValue={testimonial?.status || 'SUBMITTED'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceCategoryId">Service Category</Label>
              <Input
                id="serviceCategoryId"
                name="serviceCategoryId"
                defaultValue={testimonial?.serviceCategoryId || ''}
                placeholder="Optional category ID"
              />
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

          {/* Video Testimonial Support */}
          <div className="rounded-lg border border-border/50 p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Video className="size-4 text-primary" />
              Video Testimonial (optional)
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  name="videoUrl"
                  type="url"
                  defaultValue={testimonial?.videoUrl || ''}
                  placeholder="https://youtube.com/watch?v=..."
                />
                {state.errors?.videoUrl && (
                  <p className="text-sm text-destructive">
                    {state.errors.videoUrl[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoType">Video Type</Label>
                <Select
                  name="videoType"
                  defaultValue={testimonial?.videoType || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="vimeo">Vimeo</SelectItem>
                    <SelectItem value="upload">Uploaded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
