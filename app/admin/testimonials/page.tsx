import { db } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { TestimonialsTable } from './testimonials-table';

export const metadata = {
  title: 'Testimonials | Admin Dashboard',
  description: 'Manage testimonials',
};

export default async function TestimonialsPage() {
  const testimonials = await db.testimonial.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const pendingClientSubmissions = testimonials.filter(
    (t) => t.submittedById && !t.isPublished
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Testimonials
            {pendingClientSubmissions > 0 && (
              <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 text-sm font-medium">
                {pendingClientSubmissions} pending
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            Manage testimonials and review client submissions
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/testimonials/new">
            <Plus className="size-4 mr-2" />
            Add Testimonial
          </Link>
        </Button>
      </div>

      <TestimonialsTable testimonials={testimonials} />
    </div>
  );
}
