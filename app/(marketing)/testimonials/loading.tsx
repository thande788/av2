import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for Testimonials page
 */
export default function TestimonialsLoading() {
  return (
    <main
      className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto"
      aria-label="Loading testimonials"
    >
      {/* Hero Skeleton */}
      <section className="text-center mb-16">
        <Skeleton className="h-[400px] w-full max-w-4xl mx-auto rounded-3xl" />
      </section>

      {/* Testimonials Grid Skeleton */}
      <section className="mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </section>

      {/* CTA Skeleton */}
      <section className="text-center">
        <Skeleton className="h-48 w-full max-w-4xl mx-auto rounded-3xl" />
      </section>
    </main>
  );
}
