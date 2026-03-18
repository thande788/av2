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
 * DATE FORMATTING UTILITIES
 * =============================================================================
 *
 * All user-facing dates MUST use formatDateUS() to ensure:
 *  1. American format (MM/DD/YYYY)
 *  2. UTC timezone (prevents server/client hydration mismatches)
 *
 * Do NOT use date-fns format() or toLocaleDateString() for display dates.
 * Date-fns format() uses local timezone which differs between server and client.
 * =============================================================================
 */

type DateStyle =
  | 'short'          // 3/18/2026
  | 'medium'         // Mar 18, 2026
  | 'long'           // March 18, 2026
  | 'short-no-year'  // 3/18
  | 'medium-no-year' // Mar 18
  | 'datetime'       // 3/18/2026, 3:45 PM
  | 'datetime-long'  // March 18, 2026 at 3:45 PM
  | 'month-year'     // March 2026
  | 'weekday-short'  // Tue, 3/18
  | 'weekday-long'   // Tuesday, March 18
  | 'iso';           // 2026-03-18 (for data, not display)

const dateFormatOptions: Record<Exclude<DateStyle, 'iso'>, Intl.DateTimeFormatOptions> = {
  short:           { month: 'numeric', day: 'numeric', year: 'numeric', timeZone: 'UTC' },
  medium:          { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' },
  long:            { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' },
  'short-no-year': { month: 'numeric', day: 'numeric', timeZone: 'UTC' },
  'medium-no-year':{ month: 'short', day: 'numeric', timeZone: 'UTC' },
  datetime:        { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' },
  'datetime-long': { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' },
  'month-year':    { month: 'long', year: 'numeric', timeZone: 'UTC' },
  'weekday-short': { weekday: 'short', month: 'numeric', day: 'numeric', timeZone: 'UTC' },
  'weekday-long':  { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' },
};

/**
 * Format a date in American format using UTC timezone.
 * Prevents hydration mismatches between server and client.
 */
export function formatDateUS(date: Date | string, style: DateStyle = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (style === 'iso') {
    return d.toISOString().slice(0, 10);
  }

  return new Intl.DateTimeFormat('en-US', dateFormatOptions[style]).format(d);
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
