import { db } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground">
            Manage customer testimonials displayed on the website
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
