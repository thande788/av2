'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { IconLoader2, IconSend } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StarRatingInput } from '@/components/shared/star-rating-input';
import { submitShiftReview } from '@/app/actions/shift-reviews';

interface ShiftReviewFormProps {
  shiftId: string;
  caregiverName: string;
  shiftDate: string;
  onSuccess?: () => void;
}

export function ShiftReviewForm({
  shiftId,
  caregiverName,
  shiftDate,
  onSuccess,
}: ShiftReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
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
      onSuccess?.();
      router.refresh();
    } else {
      setError(result.error || 'Failed to submit review');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="font-medium">{caregiverName}</p>
        <p className="text-sm text-muted-foreground">{shiftDate}</p>
      </div>

      <div className="space-y-2">
        <Label>Rating</Label>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`comment-${shiftId}`}>
          Comment <span className="text-muted-foreground text-xs">(optional)</span>
        </Label>
        <Textarea
          id={`comment-${shiftId}`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this caregiver..."
          rows={3}
          maxLength={2000}
          className="resize-none"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0} size="sm">
        {isSubmitting ? (
          <IconLoader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <IconSend className="mr-2 size-4" />
        )}
        Submit Review
      </Button>
    </div>
  );
}
