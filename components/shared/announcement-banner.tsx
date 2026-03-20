"use client";

import { useState } from "react";
import Link from "next/link";
import { IconSpeakerphone, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface AnnouncementBannerProps {
  enabled: boolean;
  message: string;
  ctaText?: string;
  ctaHref?: string;
  variant?: "info" | "warning" | "success";
}

const variantStyles = {
  info: {
    container:
      "bg-gradient-to-r from-blue-500/15 via-blue-500/8 to-blue-500/15 border-blue-500/30",
    icon: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    text: "text-blue-700 dark:text-blue-300",
    cta: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300",
  },
  warning: {
    container:
      "bg-gradient-to-r from-yellow-500/15 via-yellow-500/8 to-yellow-500/15 border-yellow-500/30",
    icon: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
    text: "text-yellow-700 dark:text-yellow-300",
    cta: "text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300",
  },
  success: {
    container:
      "bg-gradient-to-r from-emerald-500/15 via-emerald-500/8 to-emerald-500/15 border-emerald-500/30",
    icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    text: "text-emerald-700 dark:text-emerald-300",
    cta: "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300",
  },
};

export function AnnouncementBanner({
  enabled,
  message,
  ctaText,
  ctaHref,
  variant = "info",
}: AnnouncementBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!enabled || !message || isDismissed) return null;

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "border rounded-xl",
        "px-4 py-3 sm:px-5 sm:py-3.5",
        "flex items-center gap-3 sm:gap-4",
        "text-sm",
        styles.container
      )}
      role="status"
      aria-label="Site announcement"
    >
      {/* Icon */}
      <span
        className={cn(
          "hidden sm:flex shrink-0 items-center justify-center size-9 rounded-full",
          styles.icon
        )}
      >
        <IconSpeakerphone className="size-[18px]" aria-hidden="true" />
      </span>

      {/* Message — fills remaining space */}
      <p className={cn("flex-1 min-w-0", styles.text)}>{message}</p>

      {/* CTA + Dismiss — pinned right, no overlap */}
      <div className="flex shrink-0 items-center gap-2">
        {ctaText && ctaHref && (
          <Link
            href={ctaHref}
            className={cn(
              "inline-flex items-center gap-1 font-medium whitespace-nowrap",
              "hover:underline underline-offset-4 transition-colors",
              styles.cta
            )}
          >
            {ctaText} <span aria-hidden="true">→</span>
          </Link>
        )}

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className={cn(
            "p-1.5 rounded-lg shrink-0",
            "text-muted-foreground hover:text-foreground",
            "hover:bg-black/5 dark:hover:bg-white/10",
            "transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          aria-label="Dismiss announcement"
        >
          <IconX className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
