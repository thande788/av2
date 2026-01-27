/**
 * Blur Placeholder Generation Utilities
 * 
 * Uses plaiceholder to generate base64 blur data URLs for images.
 * These can be used with Next.js Image component's blurDataURL prop.
 * 
 * @see https://plaiceholder.co/docs
 */

import { getPlaiceholder } from "plaiceholder";

/**
 * Generate a blur placeholder for a remote image URL
 * 
 * @param imageUrl - The URL of the image to generate a placeholder for
 * @returns Base64 blur data URL and image metadata
 * 
 * @example
 * ```ts
 * const { base64, metadata } = await getBlurPlaceholder(
 *   "https://images.pexels.com/photos/7345465/pexels-photo-7345465.jpeg"
 * );
 * ```
 */
export async function getBlurPlaceholder(imageUrl: string) {
  try {
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const buffer = Buffer.from(await response.arrayBuffer());
    
    const {
      base64,
      metadata: { height, width },
    } = await getPlaiceholder(buffer, { size: 10 });
    
    return {
      base64,
      metadata: { height, width },
    };
  } catch (error) {
    console.error(`Error generating blur placeholder for ${imageUrl}:`, error);
    // Return a simple gray placeholder as fallback
    return {
      base64: generateColorPlaceholder("#e5e7eb"),
      metadata: { height: 0, width: 0 },
    };
  }
}

/**
 * Generate a blur placeholder for a local image file
 * 
 * @param imagePath - Path to the local image file (relative to project root)
 * @returns Base64 blur data URL and image metadata
 */
export async function getLocalBlurPlaceholder(imagePath: string) {
  try {
    const { readFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    
    const fullPath = join(process.cwd(), "public", imagePath);
    const buffer = await readFile(fullPath);
    
    const {
      base64,
      metadata: { height, width },
    } = await getPlaiceholder(buffer, { size: 10 });
    
    return {
      base64,
      metadata: { height, width },
    };
  } catch (error) {
    console.error(`Error generating blur placeholder for ${imagePath}:`, error);
    return {
      base64: generateColorPlaceholder("#e5e7eb"),
      metadata: { height: 0, width: 0 },
    };
  }
}

/**
 * Generate multiple blur placeholders in parallel
 * Useful for galleries or pages with multiple images
 * 
 * @param imageUrls - Array of image URLs
 * @returns Map of URL to blur data
 */
export async function getBlurPlaceholders(imageUrls: string[]) {
  const results = await Promise.allSettled(
    imageUrls.map(async (url) => {
      const data = await getBlurPlaceholder(url);
      return { url, ...data };
    })
  );
  
  const placeholders = new Map<string, { base64: string; metadata: { height: number; width: number } }>();
  
  for (const result of results) {
    if (result.status === "fulfilled") {
      const { url, base64, metadata } = result.value;
      placeholders.set(url, { base64, metadata });
    }
  }
  
  return placeholders;
}

/**
 * Generate a simple solid color placeholder
 * Used as a fallback when blur generation fails
 * 
 * @param color - Hex color code (e.g., "#e5e7eb")
 * @returns Base64 data URL of a 1x1 SVG
 */
export function generateColorPlaceholder(color: string = "#e5e7eb"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect fill="${color}" width="1" height="1"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/**
 * Common placeholder colors matching the design system
 */
export const placeholderColors = {
  neutral: "#e5e7eb",
  primary: "#2563eb",
  muted: "#f3f4f6",
  warm: "#fef3c7",
  cool: "#dbeafe",
} as const;
