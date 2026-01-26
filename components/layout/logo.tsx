"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import type { LogoProps } from "@/types/navigation";

const sizeClasses = {
  sm: "w-10 h-10 sm:w-12 sm:h-12",
  md: "w-12 h-12 sm:w-14 sm:h-14",
  lg: "w-14 h-14 sm:w-16 sm:h-16",
} as const;

const textSizeClasses = {
  sm: "text-[10px] sm:text-xs",
  md: "text-[12px] sm:text-sm",
  lg: "text-sm sm:text-base",
} as const;

/**
 * Angel Touch Homecare logo component with optional company name
 */
export function Logo({
  className,
  size = "md",
  showText = true,
}: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 sm:gap-3 no-underline transition-all duration-300",
        "active:scale-95 sm:hover:-translate-y-0.5",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "rounded-md p-1",
        className
      )}
      aria-label="Angel Touch Homecare Services - Navigate to Home Page"
    >
      <div
        className={cn("relative flex-shrink-0", sizeClasses[size])}
        role="img"
        aria-label="Angel Touch Homecare Logo"
      >
        <Image
          src="/Angel Touch Logo-09-1.png"
          alt="Angel Touch Homecare Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <div
          className={cn(
            "flex flex-col leading-tight",
            "text-primary-foreground drop-shadow-lg",
            "max-w-[65vw] sm:max-w-none lg:max-w-[280px] xl:max-w-none",
            "whitespace-normal break-words",
            textSizeClasses[size]
          )}
        >
          <span className="font-bold tracking-tight">
            ANGEL TOUCH HOMECARE SERVICES
          </span>
        </div>
      )}
    </Link>
  );
}
