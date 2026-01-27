import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for Services page
 */
export default function ServicesLoading() {
  return (
    <main className="min-h-screen">
      {/* Hero Skeleton */}
      <section className="relative rounded-3xl overflow-hidden mx-4 md:mx-8 mt-4 mb-14 md:mb-18">
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </section>

      {/* Stats Skeleton */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </section>

      {/* Service Categories Skeleton */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto mb-16">
        <Skeleton className="h-12 w-64 mx-auto mb-4" />
        <Skeleton className="h-6 w-96 mx-auto mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      </section>

      {/* Pricing Skeleton */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto mb-16">
        <Skeleton className="h-12 w-48 mx-auto mb-4" />
        <Skeleton className="h-6 w-80 mx-auto mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-2xl" />
          ))}
        </div>
      </section>
    </main>
  );
}
