"use client";

import Image from "next/image";
import { IconStarFilled, IconArrowRight } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CaregiverCardProps, Caregiver } from "@/types/cards";

/**
 * Caregiver card component displaying a caregiver profile
 * Dark-themed card matching the Angel Touch brand aesthetic
 */
export function CaregiverCard({
  caregiver,
  className,
  onSelect,
  variant = "default",
}: CaregiverCardProps) {
  const {
    id,
    fullName,
    photoBase,
    photoUrl,
    bio,
    yearsExperience,
    rating,
    specialties,
    available,
  } = caregiver;

  // Determine image source
  const imageSrc = photoUrl || (photoBase ? `/caregivers/original/${photoBase}.jpg` : null);

  const handleClick = () => {
    onSelect?.(caregiver);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl",
        // Dark themed card (fixed colors - always dark)
        "bg-[#1a2332]/95 border border-white/10 backdrop-blur-sm",
        "p-5 shadow-lg transition-all duration-300",
        "hover:shadow-xl hover:-translate-y-1",
        "focus-within:ring-2 focus-within:ring-accent-rose focus-within:ring-offset-2 focus-within:ring-offset-[#1a2332]",
        variant === "compact" && "p-4",
        className
      )}
      aria-labelledby={`caregiver-${id}-name`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="cursor-pointer text-left focus:outline-none"
        aria-label={`View profile for caregiver ${fullName}`}
      >
        {/* Photo */}
        {imageSrc && (
          <div className="relative mb-5 overflow-hidden rounded-xl">
            <div className="aspect-[3/4] relative">
              <Image
                src={imageSrc}
                alt={`Portrait of caregiver ${fullName}`}
                fill
                className={cn(
                  "object-cover transition-transform duration-500",
                  "group-hover:scale-[1.03]"
                )}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
            {/* Gradient overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#1a2332]/70 via-[#1a2332]/20 to-transparent"
              aria-hidden="true"
            />
            {/* Availability badge */}
            {available !== undefined && (
              <Badge
                variant={available ? "default" : "secondary"}
                className={cn(
                  "absolute top-3 right-3",
                  available
                    ? "bg-green-500/90 text-white hover:bg-green-500"
                    : "bg-white/20 text-white/70"
                )}
              >
                {available ? "Available" : "Unavailable"}
              </Badge>
            )}
          </div>
        )}

        {/* Name */}
        <h3
          id={`caregiver-${id}-name`}
          className="mb-1 text-lg font-bold text-white drop-shadow-sm"
        >
          {fullName}
        </h3>

        {/* Bio */}
        <p
          className={cn(
            "mb-3 text-sm leading-relaxed text-white/90",
            variant === "default" ? "line-clamp-3" : "line-clamp-2"
          )}
        >
          {bio}
        </p>

        {/* Stats */}
        <div
          className="mb-3 flex items-center gap-2"
          aria-label={`${yearsExperience}+ years experience, ${rating.toFixed(1)} star rating`}
        >
          <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-white">
            {yearsExperience}+ yrs
          </span>
          <span className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-white">
            <IconStarFilled className="size-3 text-amber-400" aria-hidden="true" />
            {rating.toFixed(1)}
          </span>
        </div>

        {/* Specialties */}
        {specialties.length > 0 && (
          <ul
            className="mb-4 flex flex-wrap gap-2"
            aria-label="Specialties"
          >
            {specialties.slice(0, 3).map((specialty) => (
              <li key={specialty}>
                <span
                  className={cn(
                    "inline-block rounded-full px-2 py-1",
                    "bg-[#1a2332]/60 border border-accent-rose/40",
                    "text-[11px] font-medium text-[#e7a9b6] shadow-sm"
                  )}
                >
                  {specialty}
                </span>
              </li>
            ))}
            {specialties.length > 3 && (
              <li>
                <span className="text-[11px] text-white/50">
                  +{specialties.length - 3} more
                </span>
              </li>
            )}
          </ul>
        )}

        {/* CTA */}
        <Button
          variant="link"
          className="h-auto p-0 text-sm font-semibold text-white hover:text-accent-rose"
          tabIndex={-1}
        >
          View Profile
          <IconArrowRight className="ml-1 size-4" aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}

/**
 * Grid wrapper for displaying multiple caregiver cards
 */
export function CaregiverCardGrid({
  caregivers,
  className,
  ...props
}: {
  caregivers: Caregiver[];
  className?: string;
} & Omit<CaregiverCardProps, "caregiver">) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {caregivers.map((caregiver) => (
        <CaregiverCard key={caregiver.id} caregiver={caregiver} {...props} />
      ))}
    </div>
  );
}
