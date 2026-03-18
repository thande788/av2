'use client';

import { Badge } from '@/components/ui/badge';
import { IconStarFilled } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isPublished: boolean;
  createdAt: string | Date;
  worker: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  shift: {
    date: string | Date;
    startTime: string;
    endTime: string;
  };
}

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        You haven&apos;t submitted any reviews yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div
          key={review.id}
          className={cn(
            'relative overflow-hidden rounded-xl border p-4 transition-all',
            'border-border/50 bg-card'
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium">
                {review.worker.user.firstName} {review.worker.user.lastName}
              </p>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={cn(
                    review.isPublished
                      ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {review.isPublished ? 'Published' : 'Pending'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <IconStarFilled
                  key={i}
                  className={cn(
                    'size-4',
                    i < review.rating ? 'text-amber-400' : 'text-muted-foreground/20'
                  )}
                />
              ))}
              <span className="ml-2 text-xs text-muted-foreground">
                {new Date(review.shift.date).toLocaleDateString()} • {review.shift.startTime} - {review.shift.endTime}
              </span>
            </div>

            {review.comment && (
              <p className="text-sm text-muted-foreground">{review.comment}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
