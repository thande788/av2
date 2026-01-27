import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Reusable skeleton patterns for common UI elements
 * These provide consistent loading states across the application
 */

export interface SkeletonCardProps {
  /** Show image placeholder */
  showImage?: boolean;
  /** Number of text lines */
  lines?: number;
  /** Custom class name */
  className?: string;
}

/**
 * Generic card skeleton for service cards, etc.
 */
export function SkeletonCard({
  showImage = true,
  lines = 3,
  className,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6 space-y-4",
        className
      )}
      role="status"
      aria-label="Loading card"
    >
      {showImage && (
        <Skeleton className="h-40 w-full rounded-lg" />
      )}
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-4", i === lines - 1 ? "w-1/2" : "w-full")}
          />
        ))}
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export interface SkeletonAvatarProps {
  /** Size of the avatar */
  size?: "sm" | "md" | "lg";
  /** Show name line next to avatar */
  showName?: boolean;
  /** Custom class name */
  className?: string;
}

const avatarSizes = {
  sm: "size-8",
  md: "size-12",
  lg: "size-16",
} as const;

/**
 * Avatar skeleton with optional name
 */
export function SkeletonAvatar({
  size = "md",
  showName = false,
  className,
}: SkeletonAvatarProps) {
  return (
    <div
      className={cn("flex items-center gap-3", className)}
      role="status"
      aria-label="Loading user"
    >
      <Skeleton className={cn("rounded-full", avatarSizes[size])} />
      {showName && (
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export interface SkeletonTestimonialProps {
  /** Custom class name */
  className?: string;
}

/**
 * Testimonial card skeleton
 */
export function SkeletonTestimonial({ className }: SkeletonTestimonialProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6 space-y-4",
        className
      )}
      role="status"
      aria-label="Loading testimonial"
    >
      {/* Quote icon placeholder */}
      <Skeleton className="size-8" />
      
      {/* Quote text */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      
      {/* Author */}
      <div className="flex items-center gap-3 pt-2">
        <Skeleton className="size-10 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <span className="sr-only">Loading testimonial...</span>
    </div>
  );
}

export interface SkeletonCaregiverProps {
  /** Custom class name */
  className?: string;
}

/**
 * Caregiver card skeleton
 */
export function SkeletonCaregiver({ className }: SkeletonCaregiverProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6 text-center space-y-4",
        className
      )}
      role="status"
      aria-label="Loading caregiver"
    >
      {/* Avatar */}
      <div className="flex justify-center">
        <Skeleton className="size-24 rounded-full" />
      </div>
      
      {/* Name & title */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-32 mx-auto" />
        <Skeleton className="h-4 w-24 mx-auto" />
      </div>
      
      {/* Bio */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3 mx-auto" />
      </div>
      
      {/* Badge */}
      <Skeleton className="h-6 w-20 mx-auto rounded-full" />
      <span className="sr-only">Loading caregiver...</span>
    </div>
  );
}

export interface SkeletonServiceProps {
  /** Custom class name */
  className?: string;
}

/**
 * Service card skeleton
 */
export function SkeletonService({ className }: SkeletonServiceProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6 space-y-4",
        className
      )}
      role="status"
      aria-label="Loading service"
    >
      {/* Icon */}
      <Skeleton className="size-12 rounded-lg" />
      
      {/* Title */}
      <Skeleton className="h-6 w-2/3" />
      
      {/* Description */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      
      {/* CTA */}
      <Skeleton className="h-10 w-28 rounded-full" />
      <span className="sr-only">Loading service...</span>
    </div>
  );
}

/**
 * Page-level loading skeleton
 */
export function SkeletonPage() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-8" role="status" aria-label="Loading page">
      {/* Hero */}
      <div className="space-y-4 text-center">
        <Skeleton className="h-12 w-2/3 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
      </div>
      
      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <span className="sr-only">Loading page content...</span>
    </div>
  );
}
