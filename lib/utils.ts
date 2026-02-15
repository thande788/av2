import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * =============================================================================
 * PRISMA SERIALIZATION UTILITIES
 * =============================================================================
 * 
 * Next.js Server Components cannot pass non-plain objects to Client Components.
 * Prisma Decimal objects must be converted to numbers before serialization.
 * 
 * Use `serialize()` on any Prisma query result before passing to a client component.
 * =============================================================================
 */

/**
 * Type helper to convert Decimal fields to number in a type.
 * Works with Prisma's Decimal type by detecting the `toNumber` method.
 */
export type Serialized<T> = T extends { toNumber(): number }
  ? number
  : T extends Date
    ? Date
    : T extends Array<infer U>
      ? Array<Serialized<U>>
      : T extends object
        ? { [K in keyof T]: Serialized<T[K]> }
        : T;

/**
 * Deep serializes Prisma objects for passing to Client Components.
 * Converts Decimal to number, preserves other types.
 */
export function serialize<T>(data: T): Serialized<T> {
  if (data === null || data === undefined) {
    return data as Serialized<T>;
  }

  // Handle Decimal (Prisma.Decimal has toNumber method)
  if (
    typeof data === "object" &&
    data !== null &&
    "toNumber" in data &&
    typeof (data as { toNumber: unknown }).toNumber === "function"
  ) {
    return (data as { toNumber: () => number }).toNumber() as Serialized<T>;
  }

  // Handle Date - keep as is (Next.js handles Date serialization)
  if (data instanceof Date) {
    return data as Serialized<T>;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => serialize(item)) as Serialized<T>;
  }

  // Handle plain objects
  if (typeof data === "object" && data !== null) {
    const result: Record<string, unknown> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = serialize((data as Record<string, unknown>)[key]);
      }
    }
    return result as Serialized<T>;
  }

  // Primitives pass through
  return data as Serialized<T>;
}

/**
 * =============================================================================
 * COLOR USAGE GUIDELINES (Theme Awareness)
 * =============================================================================
 * 
 * NEVER use these in components that adapt to theme:
 * - `text-white`, `text-black` (hardcoded, won't adapt)
 * - `text-primary-foreground` outside of a `bg-primary` context
 * - `bg-white`, `bg-black` (use semantic tokens instead)
 * 
 * ALWAYS use these semantic tokens:
 * - `text-foreground` — main text color (adapts to theme)
 * - `text-muted-foreground` — secondary text
 * - `bg-background` — main background
 * - `bg-muted` — secondary/hover background
 * - `bg-card` / `text-card-foreground` — for card surfaces
 * - `border-border` — borders
 * 
 * EXCEPTION: Fixed-color sections (e.g., always-dark footer):
 * - Use explicit hex values: `bg-[#1a2332]`, `text-white`
 * - Add a comment explaining why: "// Footer always dark regardless of theme"
 * 
 * PAIRING RULE:
 * - `text-primary-foreground` MUST be on `bg-primary`
 * - `text-secondary-foreground` MUST be on `bg-secondary`
 * - `text-accent-foreground` MUST be on `bg-accent`
 * =============================================================================
 */
