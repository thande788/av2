import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for FAQs page
 */
export default function FAQsLoading() {
  return (
    <main
      className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16"
      aria-label="Loading FAQs"
      aria-busy="true"
    >
      {/* Title skeleton */}
      <div className="flex justify-center mb-8 md:mb-12">
        <Skeleton className="h-12 w-80" />
      </div>

      {/* Hero image skeleton */}
      <div className="mb-12 md:mb-16 flex justify-center">
        <Skeleton className="w-full max-w-2xl h-64 md:h-80 rounded-2xl" />
      </div>

      {/* Description skeleton */}
      <div className="flex justify-center mb-8">
        <Skeleton className="h-6 w-96 max-w-full" />
      </div>

      {/* FAQ accordion skeletons */}
      <div className="max-w-3xl mx-auto space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/50 bg-card/50 p-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-5 w-5 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* CTA skeleton */}
      <div className="mt-12 md:mt-16 max-w-2xl mx-auto">
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    </main>
  );
}
