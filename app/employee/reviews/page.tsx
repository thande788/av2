import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconStarFilled, IconMessageCircle, IconTrendingUp } from '@tabler/icons-react';
import { cn, formatDateUS } from '@/lib/utils';
import { getCurrentWorkerWithBookings } from '@/lib/auth';
import { serialize } from '@/lib/utils';
import { db } from '@/lib/db';

export const metadata = {
  title: 'My Reviews',
  description: 'View anonymous feedback on your performance',
};

export default async function EmployeeReviewsPage() {
  const worker = await getCurrentWorkerWithBookings();

  if (!worker) {
    redirect('/employee/complete-profile');
  }

  const reviews = await db.shiftReview.findMany({
    where: {
      workerId: worker.id,
    },
    include: {
      shift: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const serializedReviews = serialize(reviews);

  const clientReviews = serializedReviews.filter((r) => r.reviewerType === 'CLIENT');
  const adminReviews = serializedReviews.filter((r) => r.reviewerType === 'ADMIN');

  // Calculate average rating
  const avgRating = serializedReviews.length > 0
    ? serializedReviews.reduce((sum, r) => sum + r.rating, 0) / serializedReviews.length
    : 0;

  // Rating distribution
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: serializedReviews.filter((r) => r.rating === stars).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Reviews</h1>
        <p className="text-muted-foreground">
          Anonymous feedback from clients and supervisors
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
                <IconStarFilled className="size-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {avgRating > 0 ? avgRating.toFixed(1) : '—'}
                </p>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-sky-100 p-2 dark:bg-sky-900/30">
                <IconMessageCircle className="size-5 text-sky-600 dark:text-sky-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{clientReviews.length}</p>
                <p className="text-sm text-muted-foreground">Client Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
                <IconTrendingUp className="size-5 text-emerald-600 dark:text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{adminReviews.length}</p>
                <p className="text-sm text-muted-foreground">Supervisor Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      {serializedReviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {distribution.map(({ stars, count }) => {
                const pct = serializedReviews.length > 0
                  ? (count / serializedReviews.length) * 100
                  : 0;
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="w-12 text-sm text-muted-foreground text-right">
                      {stars} star{stars !== 1 ? 's' : ''}
                    </span>
                    <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-sm text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Anonymous Reviews List */}
      {serializedReviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <IconStarFilled className="mx-auto size-10 text-muted-foreground/30" />
            <h3 className="mt-4 font-semibold">No Reviews Yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Reviews will appear here after your shifts are completed and reviewed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {serializedReviews.map((review) => (
            <Card key={review.id} className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
              <CardContent className="relative pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {review.reviewerType === 'CLIENT' ? 'Client Feedback' : 'Supervisor Feedback'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDateUS(review.shift.date, 'month-year')}
                        </span>
                      </div>
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
