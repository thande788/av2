'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { IconLoader2, IconSend, IconCheck } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StarRatingInput } from '@/components/shared/star-rating-input';
import { submitClientTestimonial } from '@/app/actions/testimonials';

export function TestimonialForm() {
  const router = useRouter();
  const [rating, setRating] = React.useState(0);
  const [content, setContent] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (content.trim().length < 10) {
      setError('Please write at least 10 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await submitClientTestimonial({ content, rating });

    setIsSubmitting(false);

    if (result.success) {
      setSubmitted(true);
      router.refresh();
    } else {
      setError(result.error || 'Failed to submit testimonial');
    }
  };

  if (submitted) {
    return (
      <div className="py-8 text-center space-y-3">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <IconCheck className="size-6 text-green-600 dark:text-green-500" />
        </div>
        <h3 className="font-semibold">Thank You!</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Your testimonial has been submitted for review. Once approved by our
          team, it may be featured on our website.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSubmitted(false);
            setRating(0);
            setContent('');
          }}
        >
          Write Another
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>How would you rate our service overall?</Label>
        <StarRatingInput value={rating} onChange={setRating} size="lg" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="testimonial-content">Share your experience</Label>
        <Textarea
          id="testimonial-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tell us about your experience with Angel Touch Homecare. What has made a difference for you or your family?"
          rows={5}
          maxLength={2000}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground text-right">
          {content.length}/2000
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || rating === 0 || content.trim().length < 10}
      >
        {isSubmitting ? (
          <IconLoader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <IconSend className="mr-2 size-4" />
        )}
        Submit Testimonial
      </Button>
    </div>
  );
}
