/**
 * useReducedMotion Hook
 * 
 * Detects user's motion preference for accessibility.
 * Returns true if user prefers reduced motion.
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
 * 
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 * 
 * if (prefersReducedMotion) {
 *   // Skip animations
 * }
 * ```
 */

"use client";

import { useState, useEffect } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Hook that returns true if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  // Default to reduced motion on server (safer default)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY);
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Get the current reduced motion preference (non-reactive)
 * Useful for one-time checks outside of React components
 */
export function getReducedMotionPreference(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia(QUERY).matches;
}

export default useReducedMotion;
