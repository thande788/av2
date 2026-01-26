import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
