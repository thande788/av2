import { db } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { TestimonialsTable } from './testimonials-table';
import { RequestTestimonialDialog } from './request-testimonial-dialog';

export const metadata = {
  title: 'Testimonials',
  description: 'Manage testimonials',
};

export default async function TestimonialsPage() {
  const testimonials = await db.testimonial.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const pendingCount = testimonials.filter(
    (t) => t.status === 'SUBMITTED' || t.status === 'UNDER_REVIEW'
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Testimonials
            {pendingCount > 0 && (
              <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 text-sm font-medium">
                {pendingCount} pending review
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            Manage testimonials, review client submissions, and request new testimonials
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RequestTestimonialDialog />
          <Button asChild>
            <Link href="/admin/testimonials/new">
              <Plus className="size-4 mr-2" />
              Add Testimonial
            </Link>
          </Button>
        </div>
      </div>

      {/* Workflow Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Requested', count: testimonials.filter((t) => t.status === 'REQUESTED').length, color: 'blue' },
          { label: 'Submitted', count: testimonials.filter((t) => t.status === 'SUBMITTED').length, color: 'amber' },
          { label: 'Under Review', count: testimonials.filter((t) => t.status === 'UNDER_REVIEW').length, color: 'purple' },
          { label: 'Published', count: testimonials.filter((t) => t.status === 'PUBLISHED').length, color: 'green' },
          { label: 'Rejected', count: testimonials.filter((t) => t.status === 'REJECTED').length, color: 'red' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-lg border p-3 text-center border-${stat.color}-500/30 bg-${stat.color}-500/5`}
          >
            <p className="text-2xl font-bold">{stat.count}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <TestimonialsTable testimonials={testimonials} />
    </div>
  );
}
