import { TestimonialForm } from '../testimonial-form';

export const metadata = {
  title: 'New Testimonial',
  description: 'Add a new testimonial',
};

export default function NewTestimonialPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Add Testimonial</h1>
        <p className="text-muted-foreground">
          Create a new customer testimonial
        </p>
      </div>

      <TestimonialForm />
    </div>
  );
}
