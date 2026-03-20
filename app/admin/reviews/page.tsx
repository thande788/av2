import { db } from '@/lib/db';
import { serialize } from '@/lib/utils';
import { ReviewsTable } from './reviews-table';

export const metadata = {
  title: 'Review Moderation',
  description: 'Manage and moderate client and admin reviews',
};

export default async function AdminReviewsPage() {
  const reviews = await db.shiftReview.findMany({
    include: {
      shift: {
        include: {
          client: {
            include: { user: true },
          },
        },
      },
      worker: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reviews</h1>
        <p className="text-muted-foreground">
          Moderate client and admin shift reviews
        </p>
      </div>
      <ReviewsTable reviews={serialize(reviews)} />
    </div>
  );
}
