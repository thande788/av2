import { Skeleton } from "@/components/ui/skeleton";

export default function CareersLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Skeleton className="h-8 w-32 mx-auto mb-6 rounded-full" />
            <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-12 w-2/3 mx-auto mb-6" />
            <Skeleton className="h-6 w-full mx-auto mb-2" />
            <Skeleton className="h-6 w-5/6 mx-auto mb-8" />
            
            <div className="flex gap-4 justify-center">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 w-36" />
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="container mx-auto px-4 mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center p-4 rounded-lg bg-card border">
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section Skeleton */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-card rounded-xl p-6 border">
                <Skeleton className="h-12 w-12 rounded-full mb-4" />
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions Skeleton */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Skeleton className="h-10 w-52 mx-auto mb-4" />
            <Skeleton className="h-6 w-80 mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-card rounded-2xl p-6 border">
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
