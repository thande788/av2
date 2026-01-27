import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function ApplyLoading() {
  return (
    <div className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Back Link Skeleton */}
          <Skeleton className="h-5 w-40 mb-6" />

          {/* Job Summary Header Skeleton */}
          <div className="bg-card border rounded-xl p-6 mb-8">
            <div className="flex gap-2 mb-3">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-8 w-3/4 mb-4" />
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Application Form Skeleton */}
          <div className="bg-card border rounded-xl p-6 md:p-8">
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-5 w-full mb-6" />

            {/* Personal Information */}
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-full rounded-full" />
                </div>
              ))}
            </div>

            <Separator className="my-8" />

            {/* Address */}
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4 mb-8">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-full rounded-full" />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-9 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-8" />

            {/* Experience */}
            <Skeleton className="h-6 w-28 mb-4" />
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-9 w-full rounded-full" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-full rounded-full" />
              </div>
            </div>

            <Separator className="my-8" />

            {/* Availability */}
            <Skeleton className="h-6 w-28 mb-4" />
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-9 w-full rounded-full" />
                </div>
              ))}
            </div>
            
            {/* Shifts */}
            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>

            <Separator className="my-8" />

            {/* Additional Info */}
            <Skeleton className="h-6 w-44 mb-4" />
            <Skeleton className="h-24 w-full rounded-xl mb-8" />

            {/* Submit */}
            <Skeleton className="h-12 w-48" />
          </div>
        </div>
      </div>
    </div>
  );
}
