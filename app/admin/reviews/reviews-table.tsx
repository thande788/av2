'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  IconCheck,
  IconEyeOff,
  IconLoader2,
  IconStarFilled,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { publishReview, unpublishReview } from '@/app/actions/shift-reviews';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  reviewerType: string;
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
    client: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
  };
}

interface ReviewsTableProps {
  reviews: Review[];
}

function ReviewCard({ review }: { review: Review }) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = React.useState(false);

  const handleTogglePublish = async () => {
    setIsPublishing(true);
    const result = review.isPublished
      ? await unpublishReview(review.id)
      : await publishReview(review.id);
    setIsPublishing(false);
    if (result.success) {
      router.refresh();
    }
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border p-4 transition-all',
        'border-border/50 bg-card hover:shadow-md'
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold">
                {review.worker.user.firstName} {review.worker.user.lastName}
              </p>
              <Badge variant="outline" className="text-xs">
                {review.reviewerType === 'CLIENT' ? 'Client Review' : 'Admin Review'}
              </Badge>
              <Badge
                className={cn(
                  'text-xs',
                  review.isPublished
                    ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {review.isPublished ? 'Published' : 'Unpublished'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Reviewed by: {review.shift.client.user.firstName} {review.shift.client.user.lastName}
              {' '}&bull;{' '}
              {new Date(review.shift.date).toLocaleDateString('en-US')} ({review.shift.startTime} - {review.shift.endTime})
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {Array.from({ length: 5 }, (_, i) => (
              <IconStarFilled
                key={i}
                className={cn(
                  'size-4',
                  i < review.rating ? 'text-amber-400' : 'text-muted-foreground/20'
                )}
              />
            ))}
          </div>
        </div>

        {review.comment && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            &ldquo;{review.comment}&rdquo;
          </p>
        )}

        {/* Only show publish actions for client reviews with comments */}
        {review.reviewerType === 'CLIENT' && review.comment && (
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTogglePublish}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <IconLoader2 className="mr-2 size-3.5 animate-spin" />
              ) : review.isPublished ? (
                <IconEyeOff className="mr-2 size-3.5" />
              ) : (
                <IconCheck className="mr-2 size-3.5" />
              )}
              {review.isPublished ? 'Unpublish' : 'Publish to Website'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ReviewsTable({ reviews }: ReviewsTableProps) {
  const clientReviews = reviews.filter((r) => r.reviewerType === 'CLIENT');
  const adminReviews = reviews.filter((r) => r.reviewerType === 'ADMIN');
  const publishedReviews = reviews.filter((r) => r.isPublished);

  return (
    <Tabs defaultValue="all">
      <TabsList className="bg-transparent border border-border">
        <TabsTrigger value="all">
          All
          <Badge variant="secondary" className="ml-2">{reviews.length}</Badge>
        </TabsTrigger>
        <TabsTrigger value="client">
          Client
          <Badge variant="secondary" className="ml-2">{clientReviews.length}</Badge>
        </TabsTrigger>
        <TabsTrigger value="admin">
          Admin
          <Badge variant="secondary" className="ml-2">{adminReviews.length}</Badge>
        </TabsTrigger>
        <TabsTrigger value="published">
          Published
          <Badge variant="secondary" className="ml-2">{publishedReviews.length}</Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-4 space-y-3">
        {reviews.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No reviews yet</p>
          </Card>
        ) : (
          reviews.map((r) => <ReviewCard key={r.id} review={r} />)
        )}
      </TabsContent>

      <TabsContent value="client" className="mt-4 space-y-3">
        {clientReviews.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No client reviews yet</p>
          </Card>
        ) : (
          clientReviews.map((r) => <ReviewCard key={r.id} review={r} />)
        )}
      </TabsContent>

      <TabsContent value="admin" className="mt-4 space-y-3">
        {adminReviews.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No admin reviews yet</p>
          </Card>
        ) : (
          adminReviews.map((r) => <ReviewCard key={r.id} review={r} />)
        )}
      </TabsContent>

      <TabsContent value="published" className="mt-4 space-y-3">
        {publishedReviews.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No published reviews yet</p>
          </Card>
        ) : (
          publishedReviews.map((r) => <ReviewCard key={r.id} review={r} />)
        )}
      </TabsContent>
    </Tabs>
  );
}
