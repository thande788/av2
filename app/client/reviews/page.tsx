import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { IconStarFilled, IconMessageCircle } from '@tabler/icons-react';
import { getCurrentClient, getCurrentPortalUser } from '@/lib/auth';
import { serialize } from '@/lib/utils';
import { db } from '@/lib/db';
import { ShiftReviewForm } from '@/components/client/shift-review-form';
import { ReviewList } from '@/components/client/review-list';

export const metadata = {
  title: 'Reviews',
  description: 'Review your completed care visits',
};

export default async function ClientReviewsPage() {
  const client = await getCurrentClient();
  const portalUser = await getCurrentPortalUser();

  if (!client || !portalUser) {
    redirect('/client');
  }

  // Completed shifts awaiting review
  const awaitingReview = await db.careShift.findMany({
    where: {
      clientId: client.id,
      status: 'COMPLETED',
      reviews: {
        none: {
          reviewerType: 'CLIENT',
          reviewerId: portalUser.id,
        },
      },
    },
    include: {
      bookings: {
        where: { status: 'COMPLETED' },
        include: {
          worker: {
            include: { user: true },
          },
        },
      },
    },
    orderBy: { date: 'desc' },
  });

  // Past reviews
  const pastReviews = await db.shiftReview.findMany({
    where: {
      reviewerId: portalUser.id,
      reviewerType: 'CLIENT',
    },
    include: {
      shift: true,
      worker: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Filter to shifts that actually have a completed booking with a worker
  const reviewableShifts = awaitingReview.filter((s) => s.bookings.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reviews</h1>
        <p className="text-muted-foreground">
          Share your feedback about completed care visits
        </p>
      </div>

      {/* Shifts Awaiting Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconStarFilled className="size-5 text-amber-400" />
            Awaiting Your Review
          </CardTitle>
          <CardDescription>
            {reviewableShifts.length > 0
              ? `You have ${reviewableShifts.length} completed visit${reviewableShifts.length > 1 ? 's' : ''} to review.`
              : 'All caught up! No visits awaiting your review.'}
          </CardDescription>
        </CardHeader>
        {reviewableShifts.length > 0 && (
          <CardContent>
            <div className="divide-y divide-border">
              {reviewableShifts.map((shift) => {
                const booking = shift.bookings[0];
                if (!booking) return null;

                return (
                  <div key={shift.id} className="py-4 first:pt-0 last:pb-0">
                    <ShiftReviewForm
                      shiftId={shift.id}
                      caregiverName={`${booking.worker.user.firstName} ${booking.worker.user.lastName}`}
                      shiftDate={`${new Date(shift.date).toLocaleDateString('en-US')} • ${shift.startTime} - ${shift.endTime}`}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Past Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconMessageCircle className="size-5" />
            Your Past Reviews
          </CardTitle>
          <CardDescription>
            Reviews you&apos;ve submitted for completed visits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReviewList reviews={serialize(pastReviews)} />
        </CardContent>
      </Card>
    </div>
  );
}
