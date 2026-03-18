"use client";

import { IconQuote, IconStar, IconStarFilled } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { TestimonialCardProps, Testimonial } from "@/types/cards";

/**
 * Get initials from a name (max 2 characters)
 */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Generate a consistent gradient class based on name
 */
const gradientColors = [
  "from-blue-500 to-blue-600",
  "from-green-500 to-green-600",
  "from-purple-500 to-purple-600",
  "from-pink-500 to-pink-600",
  "from-indigo-500 to-indigo-600",
  "from-teal-500 to-teal-600",
  "from-orange-500 to-orange-600",
  "from-rose-500 to-rose-600",
] as const;

function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradientColors[Math.abs(hash) % gradientColors.length];
}

/**
 * Render star rating
 */
function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => {
        const isFilled = i < Math.floor(rating);
        const Icon = isFilled ? IconStarFilled : IconStar;
        return (
          <Icon
            key={i}
            className={cn(
              "size-4",
              isFilled ? "text-amber-400" : "text-muted-foreground/30"
            )}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}

/**
 * Testimonial card component displaying a customer quote
 * Uses shadcn Card with Avatar for author display
 */
export function TestimonialCard({
  testimonial,
  className,
  size = "default",
}: TestimonialCardProps) {
  const { name, text, relation, rating, avatarUrl, date } = testimonial;
  const initials = getInitials(name);
  const gradientClass = getAvatarGradient(name);

  return (
    <Card
      className={cn(
        "group h-full transition-all duration-300 bg-card/45 border-border/50",
        "hover:shadow-lg hover:-translate-y-1",
        size === "compact" && "py-4",
        className
      )}
      tabIndex={0}
      aria-label={`Testimonial from ${name}`}
    >
      <CardContent className={cn("relative", size === "compact" && "py-0")}>
        {/* Quote icon */}
        <div
          className={cn(
            "mb-4 flex size-10 items-center justify-center rounded-lg",
            "bg-icon/10 text-icon"
          )}
          aria-hidden="true"
        >
          <IconQuote className="size-5" />
        </div>

        {/* Quote text */}
        <blockquote
          className={cn(
            "text-foreground leading-relaxed",
            size === "default" ? "text-base" : "text-sm",
            "mb-4"
          )}
        >
          &ldquo;{text}&rdquo;
        </blockquote>

        {/* Rating */}
        {rating !== undefined && (
          <div className="mb-4">
            <StarRating rating={rating} />
          </div>
        )}
      </CardContent>

      <CardFooter className="mt-auto border-t border-border pt-4">
        <div className="flex items-center gap-3">
          <Avatar className={cn("size-12", !avatarUrl && `bg-gradient-to-br ${gradientClass}`)}>
            {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
            <AvatarFallback
              className={cn(
                "text-sm font-semibold text-white",
                `bg-gradient-to-br ${gradientClass}`
              )}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">{name}</span>
            <span className="text-sm text-muted-foreground">{relation}</span>
            {date && (
              <span className="text-xs text-muted-foreground/70">{date}</span>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

/**
 * Grid wrapper for displaying multiple testimonial cards
 */
export function TestimonialCardGrid({
  testimonials,
  className,
  ...props
}: {
  testimonials: Testimonial[];
  className?: string;
} & Omit<TestimonialCardProps, "testimonial">) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {testimonials.map((testimonial) => (
        <TestimonialCard
          key={testimonial.slug ?? testimonial.id ?? testimonial.name}
          testimonial={testimonial}
          {...props}
        />
      ))}
    </div>
  );
}
