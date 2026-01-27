/**
 * OptimizedImage - A wrapper around Next.js Image with sensible defaults
 * 
 * Features:
 * - Automatic AVIF/WebP format selection (via next.config.ts)
 * - Blur placeholder support (base64 or color)
 * - Responsive sizing helpers
 * - Loading state handling
 * - Error fallback support
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <OptimizedImage
 *   src="/hero.jpg"
 *   alt="Hero image"
 *   fill
 *   priority
 * />
 * 
 * // With blur placeholder
 * <OptimizedImage
 *   src="/photo.jpg"
 *   alt="Photo"
 *   width={800}
 *   height={600}
 *   blurColor="#e5e7eb"
 * />
 * ```
 */

"use client";

import Image, { ImageProps } from "next/image";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

/**
 * Common aspect ratios for consistent image sizing
 */
export const aspectRatios = {
  square: 1,
  video: 16 / 9,
  portrait: 3 / 4,
  landscape: 4 / 3,
  wide: 21 / 9,
  hero: 2.5, // Common hero banner ratio
} as const;

export type AspectRatio = keyof typeof aspectRatios;

/**
 * Responsive size presets for common use cases
 */
export const sizePresets = {
  /** Full-width hero images */
  hero: "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw",
  /** Card thumbnails */
  card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  /** Avatar/profile images */
  avatar: "96px",
  /** Gallery grid items */
  gallery: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  /** Inline content images */
  content: "(max-width: 768px) 100vw, 768px",
} as const;

export type SizePreset = keyof typeof sizePresets;

interface OptimizedImageProps extends Omit<ImageProps, "placeholder"> {
  /** Use a solid color as blur placeholder (hex color) */
  blurColor?: string;
  /** Use a base64-encoded blur data URL */
  blurDataURL?: string;
  /** Preset sizes for responsive images */
  sizePreset?: SizePreset;
  /** Show loading skeleton while image loads */
  showSkeleton?: boolean;
  /** Fallback image URL if primary fails to load */
  fallbackSrc?: string;
  /** Wrapper className for additional styling */
  wrapperClassName?: string;
  /** Aspect ratio preset (only used with fill={false}) */
  aspectRatio?: AspectRatio;
}

export function OptimizedImage({
  src,
  alt,
  className,
  wrapperClassName,
  blurColor,
  blurDataURL,
  sizePreset,
  sizes,
  showSkeleton = false,
  fallbackSrc,
  aspectRatio,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Handle image load complete
  const handleLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      setIsLoading(false);
      onLoad?.(event);
    },
    [onLoad]
  );

  // Handle image error with optional fallback
  const handleError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
      } else {
        setHasError(true);
      }
      onError?.(event);
    },
    [fallbackSrc, currentSrc, onError]
  );

  // Determine placeholder settings
  const placeholder = blurDataURL || blurColor ? "blur" : "empty";
  const resolvedBlurDataURL =
    blurDataURL ||
    (blurColor
      ? `data:image/svg+xml;base64,${Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect fill="${blurColor}" width="1" height="1"/></svg>`
        ).toString("base64")}`
      : undefined);

  // Resolve sizes from preset or explicit value
  const resolvedSizes = sizes || (sizePreset ? sizePresets[sizePreset] : undefined);

  // Calculate dimensions from aspect ratio if provided
  const aspectRatioDimensions =
    aspectRatio && typeof props.width === "number"
      ? { height: Math.round(props.width / aspectRatios[aspectRatio]) }
      : {};

  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          wrapperClassName
        )}
        role="img"
        aria-label={alt}
      >
        <span className="text-sm">Failed to load image</span>
      </div>
    );
  }

  const imageElement = (
    <Image
      src={currentSrc}
      alt={alt}
      className={cn(
        "transition-opacity duration-300",
        isLoading && showSkeleton ? "opacity-0" : "opacity-100",
        className
      )}
      placeholder={placeholder}
      blurDataURL={resolvedBlurDataURL}
      sizes={resolvedSizes}
      onLoad={handleLoad}
      onError={handleError}
      {...aspectRatioDimensions}
      {...props}
    />
  );

  // Wrap with skeleton container if needed
  if (showSkeleton) {
    return (
      <div className={cn("relative overflow-hidden", wrapperClassName)}>
        {isLoading && (
          <div
            className="absolute inset-0 animate-pulse bg-muted"
            aria-hidden="true"
          />
        )}
        {imageElement}
      </div>
    );
  }

  return imageElement;
}

/**
 * Generates a simple SVG blur placeholder
 * Useful for generating blurDataURL at build time
 */
export function generateBlurPlaceholder(color: string = "#e5e7eb"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect fill="${color}" width="1" height="1"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export default OptimizedImage;
