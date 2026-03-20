import { cn } from "@/lib/utils";

export interface SkipLinkProps {
  /** The target element ID to skip to (without #) */
  targetId?: string;
  /** Custom class name */
  className?: string;
  /** Custom link text */
  children?: React.ReactNode;
}

/**
 * Skip link for keyboard users to bypass navigation
 * Appears only on focus for screen reader and keyboard users
 */
export function SkipLink({
  targetId = "main-content",
  className,
  children = "Skip to main content",
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        // Visually hidden until focused
        "sr-only focus:not-sr-only",
        // Positioning
        "focus:absolute focus:top-4 focus:left-4 focus:z-[100]",
        // Styling
        "focus:inline-block focus:px-6 focus:py-3",
        "focus:bg-primary focus:text-primary-foreground",
        "focus:rounded-lg focus:shadow-lg",
        "focus:font-medium focus:text-sm",
        // Animation
        "focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "transition-all duration-200",
        className
      )}
    >
      {children}
    </a>
  );
}
