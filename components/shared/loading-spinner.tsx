"use client";

import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: "sm" | "md" | "lg" | "xl";
  /** Custom class name */
  className?: string;
  /** Accessible label for screen readers */
  label?: string;
}

const sizeClasses = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-8 border-3",
  xl: "size-12 border-4",
} as const;

/**
 * Accessible loading spinner with customizable size
 * Uses CSS animation that respects prefers-reduced-motion
 */
export function LoadingSpinner({
  size = "md",
  className,
  label = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("inline-flex items-center justify-center", className)}
    >
      <div
        className={cn(
          "rounded-full border-muted-foreground/30 border-t-primary",
          "animate-spin motion-reduce:animate-none",
          sizeClasses[size]
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export interface LoadingDotsProps {
  /** Custom class name */
  className?: string;
  /** Accessible label for screen readers */
  label?: string;
}

/**
 * Loading dots animation (alternative to spinner)
 * Useful for inline loading states
 */
export function LoadingDots({ className, label = "Loading..." }: LoadingDotsProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("inline-flex items-center gap-1", className)}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "size-2 rounded-full bg-current",
            "animate-pulse motion-reduce:animate-none",
            i === 1 && "animation-delay-150",
            i === 2 && "animation-delay-300"
          )}
          style={{ animationDelay: `${i * 150}ms` }}
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}

export interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  isLoading: boolean;
  /** Custom class name for the overlay */
  className?: string;
  /** Accessible label */
  label?: string;
  /** Children to render behind the overlay */
  children?: React.ReactNode;
}

/**
 * Full overlay loading state for containers
 * Covers content while loading
 */
export function LoadingOverlay({
  isLoading,
  className,
  label = "Loading content...",
  children,
}: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 z-10",
            "flex items-center justify-center",
            "bg-background/80 backdrop-blur-sm",
            "transition-opacity duration-200",
            className
          )}
          role="alert"
          aria-busy="true"
          aria-label={label}
        >
          <LoadingSpinner size="lg" label={label} />
        </div>
      )}
    </div>
  );
}
