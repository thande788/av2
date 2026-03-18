'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  IconCheck,
  IconLoader2,
  IconStarFilled,
} from '@tabler/icons-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StarRatingInput } from '@/components/shared/star-rating-input';
import { submitShiftReview } from '@/app/actions/shift-reviews';

interface AdminShiftRatingProps {
  shiftId: string;
  caregiverName: string;
}

export function AdminShiftRating({ shiftId, caregiverName }: AdminShiftRatingProps) {
  const router = useRouter();
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await submitShiftReview({
      shiftId,
      rating,
      comment: comment || undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      setSubmitted(true);
      router.refresh();
    } else {
      // If already reviewed, show as submitted
      if (result.error?.includes('already reviewed')) {
        setSubmitted(true);
      } else {
        setError(result.error || 'Failed to submit rating');
      }
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-6">
          <div className="rounded-full bg-green-500/15 p-2">
            <IconCheck className="size-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium">Rating Submitted</p>
            <p className="text-sm text-muted-foreground">
              Your rating for {caregiverName} has been recorded.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconStarFilled className="size-5 text-amber-400" />
          Rate Caregiver
        </CardTitle>
        <CardDescription>
          Rate {caregiverName}&apos;s performance on this shift
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Performance Rating</Label>
          <StarRatingInput value={rating} onChange={setRating} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-comment">
            Notes <span className="text-muted-foreground text-xs">(optional)</span>
          </Label>
          <Textarea
            id="admin-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How did the caregiver perform?"
            rows={2}
            maxLength={2000}
            className="resize-none"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0} size="sm">
          {isSubmitting ? (
            <IconLoader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <IconCheck className="mr-2 size-4" />
          )}
          Submit Rating
        </Button>
      </CardContent>
    </Card>
  );
}
