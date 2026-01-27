import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function JobLoading() {
  return (
    <div className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <article className="max-w-4xl mx-auto">
          {/* Back Link Skeleton */}
          <Skeleton className="h-5 w-40 mb-6" />

          {/* Header Skeleton */}
          <header className="mb-8">
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            
            <Skeleton className="h-10 w-3/4 mb-4" />
            
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-40" />
            </div>
          </header>

          {/* Apply CTA Skeleton */}
          <div className="bg-card border rounded-lg p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div>
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-12 w-36" />
            </div>
          </div>

          {/* Description Skeleton */}
          <section className="mb-8">
            <Skeleton className="h-7 w-48 mb-4" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-5 w-3/4 mb-4" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-5 w-5/6" />
          </section>

          <Separator className="my-8" />

          {/* Responsibilities Skeleton */}
          <section className="mb-8">
            <Skeleton className="h-7 w-52 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </div>
          </section>

          <Separator className="my-8" />

          {/* Qualifications Skeleton */}
          <section className="mb-8">
            <Skeleton className="h-7 w-40 mb-4" />
            
            <div className="mb-6">
              <Skeleton className="h-5 w-24 mb-3" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Skeleton className="h-4 w-4 flex-shrink-0" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Skeleton className="h-5 w-40 mb-3" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Skeleton className="h-4 w-4 flex-shrink-0" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Separator className="my-8" />

          {/* Benefits Skeleton */}
          <section className="mb-8">
            <Skeleton className="h-7 w-44 mb-4" />
            <div className="grid sm:grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </section>

          {/* Bottom CTA Skeleton */}
          <div className="bg-primary/10 rounded-xl p-8 text-center">
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-5 w-96 mx-auto mb-6" />
            <Skeleton className="h-12 w-48 mx-auto" />
          </div>
        </article>
      </div>
    </div>
  );
}
