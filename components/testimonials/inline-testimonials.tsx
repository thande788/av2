/**
 * Inline Testimonials Component
 * 
 * A compact testimonial display for embedding in other pages.
 * Shows a rotating quote or a mini-grid of testimonials.
 * 
 * @example
 * ```tsx
 * <InlineTestimonials limit={3} />
 * ```
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { IconQuote, IconChevronLeft, IconChevronRight, IconStarFilled } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import { testimonials } from "@/data/testimonials";
import type { Testimonial } from "@/types/cards";

interface InlineTestimonialsProps {
  className?: string;
  /** Number of testimonials to show (for grid mode) */
  limit?: number;
  /** Display mode */
  variant?: "carousel" | "grid" | "single";
  /** Auto-rotate interval in ms (carousel only) */
  autoRotateInterval?: number;
  /** Filter testimonials by minimum rating */
  minRating?: number;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const gradientColors = [
  "from-blue-500 to-blue-600",
  "from-green-500 to-green-600",
  "from-purple-500 to-purple-600",
  "from-pink-500 to-pink-600",
  "from-indigo-500 to-indigo-600",
] as const;

function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradientColors[Math.abs(hash) % gradientColors.length];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <IconStarFilled
          key={i}
          className={cn(
            "size-3.5",
            i < rating ? "text-amber-400" : "text-muted-foreground/20"
          )}
        />
      ))}
    </div>
  );
}

function TestimonialQuote({ testimonial }: { testimonial: Testimonial }) {
  const initials = getInitials(testimonial.name);
  const gradient = getAvatarGradient(testimonial.name);
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="size-10 shrink-0">
          <AvatarFallback className={cn("bg-gradient-to-br text-white text-sm", gradient)}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground truncate">{testimonial.relation}</p>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <IconQuote className="absolute -top-1 -left-1 size-6 text-primary/10" aria-hidden="true" />
        <p className="text-sm text-muted-foreground leading-relaxed pl-4 line-clamp-4">
          {testimonial.text}
        </p>
      </div>
      
      {testimonial.rating && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <StarRating rating={testimonial.rating} />
        </div>
      )}
    </div>
  );
}

export function InlineTestimonials({
  className,
  limit = 3,
  variant = "carousel",
  autoRotateInterval = 5000,
  minRating = 4,
}: InlineTestimonialsProps) {
  const filteredTestimonials = testimonials.filter(
    (t) => !minRating || (t.rating && t.rating >= minRating)
  );
  
  const displayTestimonials = filteredTestimonials.slice(0, Math.max(limit, filteredTestimonials.length));
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % displayTestimonials.length);
  }, [displayTestimonials.length]);
  
  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + displayTestimonials.length) % displayTestimonials.length);
  }, [displayTestimonials.length]);
  
  // Auto-rotate for carousel
  useEffect(() => {
    if (variant !== "carousel" || isPaused || prefersReducedMotion) return;
    
    const timer = setInterval(goToNext, autoRotateInterval);
    return () => clearInterval(timer);
  }, [variant, isPaused, prefersReducedMotion, autoRotateInterval, goToNext]);
  
  if (displayTestimonials.length === 0) return null;
  
  // Single testimonial
  if (variant === "single") {
    const testimonial = displayTestimonials[0];
    return (
      <Card className={cn("p-4 bg-card/50 border-border/50", className)}>
        <TestimonialQuote testimonial={testimonial} />
      </Card>
    );
  }
  
  // Grid layout
  if (variant === "grid") {
    return (
      <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
        {displayTestimonials.slice(0, limit).map((testimonial) => (
          <Card key={testimonial.slug ?? testimonial.id ?? testimonial.name} className="p-4 bg-card/50 border-border/50">
            <TestimonialQuote testimonial={testimonial} />
          </Card>
        ))}
      </div>
    );
  }
  
  // Carousel layout
  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Card className="p-6 bg-card/50 border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1">
            {displayTestimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "size-2 rounded-full transition-all",
                  idx === currentIndex ? "bg-primary w-4" : "bg-muted-foreground/30"
                )}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={goToPrev}
              aria-label="Previous testimonial"
            >
              <IconChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={goToNext}
              aria-label="Next testimonial"
            >
              <IconChevronRight className="size-4" />
            </Button>
          </div>
        </div>
        
        <TestimonialQuote testimonial={displayTestimonials[currentIndex]} />
      </Card>
    </div>
  );
}

export default InlineTestimonials;
