/**
 * View Transitions API Hook
 * 
 * Provides smooth page transitions using the View Transitions API
 * with graceful fallback for unsupported browsers.
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
 * 
 * @example
 * ```tsx
 * function NavLink({ href, children }) {
 *   const { navigate, isPending } = useViewTransition();
 *   
 *   return (
 *     <button 
 *       onClick={() => navigate(href)}
 *       disabled={isPending}
 *     >
 *       {children}
 *     </button>
 *   );
 * }
 * ```
 */

"use client";

import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

interface UseViewTransitionReturn {
  /** Navigate to a new route with view transition */
  navigate: (href: string) => void;
  /** Whether a navigation is in progress */
  isPending: boolean;
  /** Whether the View Transitions API is supported */
  isSupported: boolean;
}

/**
 * Hook for navigating with View Transitions API support
 */
export function useViewTransition(): UseViewTransitionReturn {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const isSupported = typeof document !== "undefined" && "startViewTransition" in document;

  const navigate = useCallback(
    (href: string) => {
      // Fallback for browsers without View Transitions API
      if (typeof document === "undefined" || !("startViewTransition" in document)) {
        startTransition(() => router.push(href));
        return;
      }

      // Use View Transitions API for smooth page transitions
      document.startViewTransition(() => {
        startTransition(() => router.push(href));
      });
    },
    [router, startTransition]
  );

  return { navigate, isPending, isSupported };
}

/**
 * Hook for replacing current route with view transition
 */
export function useViewTransitionReplace(): UseViewTransitionReturn {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const isSupported = typeof document !== "undefined" && "startViewTransition" in document;

  const navigate = useCallback(
    (href: string) => {
      if (typeof document === "undefined" || !("startViewTransition" in document)) {
        startTransition(() => router.replace(href));
        return;
      }

      document.startViewTransition(() => {
        startTransition(() => router.replace(href));
      });
    },
    [router, startTransition]
  );

  return { navigate, isPending, isSupported };
}

export default useViewTransition;
