"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

/**
 * Hero slide data structure
 */
export interface HeroSlide {
  /** Unique identifier */
  id: string;
  /** Slide headline */
  title: string;
  /** Supporting description */
  description?: string;
  /** Background image URL */
  image?: string;
  /** Image alt text */
  imageAlt?: string;
  /** Primary CTA button text */
  ctaText?: string;
  /** Primary CTA link */
  ctaHref?: string;
  /** Secondary CTA text */
  secondaryCtaText?: string;
  /** Secondary CTA link */
  secondaryCtaHref?: string;
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Custom overlay gradient */
  overlay?: string;
}

export interface HeroCarouselProps {
  /** Array of slide data */
  slides: HeroSlide[];
  /** Autoplay delay in ms (0 to disable) */
  autoplayDelay?: number;
  /** Stop autoplay on user interaction */
  stopOnInteraction?: boolean;
  /** Loop slides */
  loop?: boolean;
  /** Show navigation arrows */
  showArrows?: boolean;
  /** Show dot indicators */
  showDots?: boolean;
  /** Aspect ratio class */
  aspectRatio?: string;
  /** Additional container class */
  className?: string;
  /** Callback when slide changes */
  onSlideChange?: (index: number) => void;
}

/**
 * Reusable hero carousel with autoplay, navigation, and dot indicators
 */
export function HeroCarousel({
  slides,
  autoplayDelay = 5000,
  stopOnInteraction = true,
  loop = true,
  showArrows = true,
  showDots = true,
  aspectRatio = "aspect-[16/9] md:aspect-[21/9]",
  className,
  onSlideChange,
}: HeroCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  // Autoplay plugin ref
  const autoplayPlugin = React.useRef(
    autoplayDelay > 0
      ? Autoplay({ delay: autoplayDelay, stopOnInteraction })
      : null
  );

  // Track slide changes
  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      const index = api.selectedScrollSnap();
      setCurrent(index);
      onSlideChange?.(index);
    });
  }, [api, onSlideChange]);

  // Handle dot click
  const scrollTo = React.useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  // Pause autoplay on hover
  const handleMouseEnter = React.useCallback(() => {
    autoplayPlugin.current?.stop();
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    autoplayPlugin.current?.reset();
  }, []);

  if (!slides.length) return null;

  return (
    <div className={cn("relative w-full", className)}>
      <Carousel
        setApi={setApi}
        opts={{ loop }}
        plugins={autoplayPlugin.current ? [autoplayPlugin.current] : []}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="w-full"
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div
                className={cn(
                  "relative overflow-hidden rounded-2xl md:rounded-3xl",
                  aspectRatio
                )}
              >
                {/* Background Image */}
                {slide.image && (
                  <Image
                    src={slide.image}
                    alt={slide.imageAlt || slide.title}
                    fill
                    className="object-cover"
                    priority={slides.indexOf(slide) === 0}
                    sizes="100vw"
                    unoptimized={slide.image.startsWith("http")}
                  />
                )}

                {/* Overlay */}
                <div
                  className={cn(
                    "absolute inset-0",
                    slide.overlay ||
                      "bg-gradient-to-t from-black/70 via-black/30 to-black/10"
                  )}
                />

                {/* Content */}
                <div
                  className={cn(
                    "absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-14",
                    slide.align === "center" && "items-center text-center",
                    slide.align === "right" && "items-end text-right",
                    (!slide.align || slide.align === "left") && "items-start text-left"
                  )}
                >
                  <div className="max-w-2xl">
                    <h2 className="mb-2 md:mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                      {slide.title}
                    </h2>

                    {slide.description && (
                      <p className="mb-4 md:mb-6 text-sm sm:text-base md:text-lg text-white/90 leading-relaxed line-clamp-3">
                        {slide.description}
                      </p>
                    )}

                    {(slide.ctaText || slide.secondaryCtaText) && (
                      <div className="flex flex-wrap gap-3">
                        {slide.ctaText && slide.ctaHref && (
                          <Button asChild size="lg" className="font-semibold">
                            <Link href={slide.ctaHref}>{slide.ctaText}</Link>
                          </Button>
                        )}
                        {slide.secondaryCtaText && slide.secondaryCtaHref && (
                          <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="border-white/30 text-white hover:bg-white/10"
                          >
                            <Link href={slide.secondaryCtaHref}>
                              {slide.secondaryCtaText}
                            </Link>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Arrows - always show when autoplay is off, otherwise respect showArrows */}
        {(showArrows || autoplayDelay === 0) && slides.length > 1 && (
          <>
            <CarouselPrevious
              className={cn(
                "left-4 md:left-6",
                "bg-white/20 hover:bg-white/40 border-white/30",
                "text-white backdrop-blur-sm"
              )}
            />
            <CarouselNext
              className={cn(
                "right-4 md:right-6",
                "bg-white/20 hover:bg-white/40 border-white/30",
                "text-white backdrop-blur-sm"
              )}
            />
          </>
        )}
      </Carousel>

      {/* Dot Indicators */}
      {showDots && count > 1 && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
          role="tablist"
          aria-label="Slide indicators"
        >
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              role="tab"
              aria-selected={current === index}
              aria-label={`Go to slide ${index + 1}`}
              className={cn(
                "size-2.5 rounded-full transition-all duration-300",
                current === index
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/70"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Example usage with static data
 */
export const exampleSlides: HeroSlide[] = [
  {
    id: "1",
    title: "Compassionate Care at Home",
    description:
      "Professional, personalized homecare services for your loved ones in the Greater Lowell area.",
    image: "https://images.pexels.com/photos/7551442/pexels-photo-7551442.jpeg",
    ctaText: "Get Started",
    ctaHref: "/contact",
    secondaryCtaText: "Our Services",
    secondaryCtaHref: "/services",
    align: "left",
  },
  {
    id: "2",
    title: "Trusted Caregivers",
    description:
      "Our certified caregivers are background-checked, trained, and dedicated to your well-being.",
    image: "https://images.pexels.com/photos/7551617/pexels-photo-7551617.jpeg",
    ctaText: "Meet Our Team",
    ctaHref: "/caregivers",
    align: "left",
  },
  {
    id: "3",
    title: "24/7 Support Available",
    description:
      "Round-the-clock care and support whenever you need it most.",
    image: "https://images.pexels.com/photos/4057758/pexels-photo-4057758.jpeg",
    ctaText: "Call Now",
    ctaHref: "tel:978-856-9358",
    align: "center",
  },
];

export default HeroCarousel;
