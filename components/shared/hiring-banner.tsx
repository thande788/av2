"use client";

import { useState } from "react";
import Link from "next/link";
import { IconSparkles, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { siteConfig, isHiringBannerActive } from "@/data/site-config";

/**
 * Subtle hiring banner component
 * 
 * Displays a dismissible banner promoting open positions.
 * Controlled via siteConfig.hiringBanner.enabled
 * 
 * Note: Dismissal is session-based (resets on page refresh).
 * For persistent dismissal, could integrate with localStorage or user preferences.
 */
export function HiringBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isHiringBannerActive() || isDismissed) {
    return null;
  }

  const { message, ctaText, ctaHref } = siteConfig.hiringBanner;

  return (
    <div
      className={cn(
        "group relative",
        "bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10",
        "border border-primary/20 rounded-xl",
        "px-4 py-3 sm:px-6 sm:py-4",
        "flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4",
        "text-sm"
      )}
      role="banner"
      aria-label="Hiring announcement"
    >
      {/* Decorative sparkle */}
      <span className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
        <IconSparkles className="size-4" aria-hidden="true" />
      </span>

      {/* Message */}
      <p className="text-center sm:text-left text-foreground/90">
        <span className="font-semibold text-primary">We&apos;re hiring!</span>{" "}
        <span className="text-muted-foreground">{message.replace("We're hiring! ", "")}</span>
      </p>

      {/* CTA Link */}
      <Link
        href={ctaHref}
        className={cn(
          "inline-flex items-center gap-1.5",
          "text-primary font-medium",
          "hover:underline underline-offset-4",
          "transition-colors",
          "whitespace-nowrap"
        )}
      >
        {ctaText}
        <span aria-hidden="true">→</span>
      </Link>

      {/* Close button */}
      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2",
          "p-1.5 rounded-lg",
          "text-muted-foreground hover:text-foreground",
          "hover:bg-primary/10",
          "transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
        aria-label="Dismiss hiring banner"
      >
        <IconX className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export default HiringBanner;
