import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for About page
 */
export default function AboutLoading() {
  return (
    <main className="min-h-screen" aria-label="Loading about page">
      {/* Hero Skeleton */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto mt-4 mb-14 md:mb-18">
        <Skeleton className="h-[420px] w-full rounded-3xl" />
      </section>

      {/* Mission/Story Skeleton */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <div className="lg:col-span-2 grid grid-cols-1 gap-6">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        </div>
      </section>

      {/* Credentials Skeleton */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20">
        <Skeleton className="h-10 w-64 mx-auto mb-4" />
        <Skeleton className="h-6 w-96 mx-auto mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      </section>

      {/* CTA Skeleton */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto mb-16">
        <Skeleton className="h-48 w-full rounded-3xl" />
      </section>
    </main>
  );
}
