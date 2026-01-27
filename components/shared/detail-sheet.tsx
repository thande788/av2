"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * Props for DetailSheet component
 */
export interface DetailSheetProps {
  /** Element that triggers the sheet (card, button, etc.) */
  trigger?: React.ReactNode;
  /** Sheet title */
  title: string;
  /** Sheet description */
  description?: string;
  /** Optional icon to display alongside title */
  icon?: React.ReactNode;
  /** Optional header image */
  headerImage?: string;
  /** Header image alt text */
  headerImageAlt?: string;
  /** Main content of the sheet */
  children: React.ReactNode;
  /** Optional footer CTA text */
  ctaText?: string;
  /** Optional footer CTA link */
  ctaHref?: string;
  /** Optional secondary CTA text */
  secondaryCtaText?: string;
  /** Optional secondary CTA link */
  secondaryCtaHref?: string;
  /** Footer prompt text above CTAs */
  footerPrompt?: string;
  /** Sheet side position */
  side?: "top" | "right" | "bottom" | "left";
  /** Additional class for sheet content */
  className?: string;
  /** Content container class */
  contentClassName?: string;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Reusable detail sheet component for displaying expandable content
 * with optional header image, icon, and footer CTAs.
 * Fullscreen on mobile with swipe-to-close support.
 */
export function DetailSheet({
  trigger,
  title,
  description,
  icon,
  headerImage,
  headerImageAlt,
  children,
  ctaText,
  ctaHref,
  secondaryCtaText,
  secondaryCtaHref,
  footerPrompt,
  side = "right",
  className,
  contentClassName,
  open,
  onOpenChange,
}: DetailSheetProps) {
  // Swipe gesture handling for mobile
  const contentRef = React.useRef<HTMLDivElement>(null);
  const touchStartX = React.useRef<number>(0);
  const touchEndX = React.useRef<number>(0);

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = React.useCallback(() => {
    const swipeDistance = touchEndX.current - touchStartX.current;
    const minSwipeDistance = 100; // minimum swipe distance to trigger close

    // Swipe right to close (for right-side sheet)
    if (side === "right" && swipeDistance > minSwipeDistance) {
      onOpenChange?.(false);
    }
    // Swipe left to close (for left-side sheet)
    if (side === "left" && swipeDistance < -minSwipeDistance) {
      onOpenChange?.(false);
    }

    // Reset values
    touchStartX.current = 0;
    touchEndX.current = 0;
  }, [side, onOpenChange]);

  const sheetContent = (
    <SheetContent
      ref={contentRef}
      side={side}
      className={cn(
        // Fullscreen on mobile, constrained on larger screens
        "w-full max-w-full",
        "sm:w-3/4 sm:max-w-md md:max-w-lg",
        "flex flex-col overflow-hidden",
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe indicator for mobile */}
      <div className="sm:hidden flex justify-center pt-2 pb-1">
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
      </div>

      {/* Optional Header Image */}
      {headerImage && (
        <div className="relative h-40 sm:h-48 w-full shrink-0">
          <Image
            src={headerImage}
            alt={headerImageAlt || title}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 32rem, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/90" />
        </div>
      )}

      {/* Header */}
      <SheetHeader className={cn(headerImage && "-mt-12 relative z-10")}>
        <div className="flex items-center gap-4">
          {icon && (
            <div
              className={cn(
                "size-14 shrink-0 rounded-full",
                "bg-gradient-to-br from-primary to-primary/80",
                "flex items-center justify-center",
                "text-primary-foreground shadow-lg"
              )}
            >
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <SheetTitle className="text-xl md:text-2xl truncate">
              {title}
            </SheetTitle>
            {description && (
              <SheetDescription className="line-clamp-2">
                {description}
              </SheetDescription>
            )}
          </div>
        </div>
      </SheetHeader>

      {/* Main Content - Scrollable */}
      <div className={cn("flex-1 overflow-y-auto py-6", contentClassName)}>
        {children}
      </div>

      {/* Footer with CTAs */}
      {(ctaText || secondaryCtaText || footerPrompt) && (
        <SheetFooter className="shrink-0 border-t border-border p-4">
          {footerPrompt && (
            <p className="text-muted-foreground text-sm text-center mb-2">
              {footerPrompt}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            {ctaText && ctaHref && (
              <Button asChild size="lg" className="flex-1">
                <Link href={ctaHref}>{ctaText}</Link>
              </Button>
            )}
            {secondaryCtaText && secondaryCtaHref && (
              <Button asChild size="lg" variant="outline" className="flex-1">
                <Link href={secondaryCtaHref}>{secondaryCtaText}</Link>
              </Button>
            )}
          </div>
        </SheetFooter>
      )}
    </SheetContent>
  );

  // If no trigger provided, render controlled sheet without trigger
  if (!trigger) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        {sheetContent}
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      {sheetContent}
    </Sheet>
  );
}

export default DetailSheet;
