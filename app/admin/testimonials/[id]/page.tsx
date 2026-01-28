import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { TestimonialForm } from '../testimonial-form';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const testimonial = await db.testimonial.findUnique({
    where: { id },
  });

  if (!testimonial) {
    return { title: 'Testimonial Not Found' };
  }

  return {
    title: `Edit ${testimonial.name}'s Testimonial | Admin`,
  };
}

export default async function EditTestimonialPage({ params }: Props) {
  const { id } = await params;
  
  const testimonial = await db.testimonial.findUnique({
    where: { id },
  });

  if (!testimonial) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Edit Testimonial</h1>
        <p className="text-muted-foreground">Update testimonial details</p>
      </div>

      <TestimonialForm testimonial={testimonial} />
    </div>
  );
}
