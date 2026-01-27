/**
 * Accessibility utilities for Angel Touch Homecare
 * 
 * These utilities help ensure WCAG 2.1 AA compliance across the application.
 * Use them to respect user preferences and provide accessible interactions.
 */

/**
 * Check if the user prefers reduced motion
 * Use this to disable or simplify animations for users who have this preference set
 * 
 * @example
 * const shouldAnimate = !prefersReducedMotion();
 * 
 * @returns true if the user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Subscribe to reduced motion preference changes
 * Useful for components that need to react to preference changes in real-time
 * 
 * @example
 * useEffect(() => {
 *   const unsubscribe = onReducedMotionChange((prefersReduced) => {
 *     setAnimationsEnabled(!prefersReduced);
 *   });
 *   return unsubscribe;
 * }, []);
 * 
 * @param callback - Function called when preference changes
 * @returns Cleanup function to remove the listener
 */
export function onReducedMotionChange(
  callback: (prefersReduced: boolean) => void
): () => void {
  if (typeof window === "undefined") return () => {};
  
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const handler = (e: MediaQueryListEvent) => callback(e.matches);
  
  mediaQuery.addEventListener("change", handler);
  return () => mediaQuery.removeEventListener("change", handler);
}

/**
 * Announce a message to screen readers using an ARIA live region
 * Use for dynamic content changes that need to be communicated to assistive tech
 * 
 * @example
 * announceToScreenReader("Form submitted successfully");
 * announceToScreenReader("Error: Please fill in all required fields", "assertive");
 * 
 * @param message - The message to announce
 * @param priority - "polite" (default) waits for pause, "assertive" interrupts
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite"
): void {
  if (typeof document === "undefined") return;

  const el = document.createElement("div");
  el.setAttribute("aria-live", priority);
  el.setAttribute("aria-atomic", "true");
  el.setAttribute("role", priority === "assertive" ? "alert" : "status");
  el.className = "sr-only";
  el.textContent = message;
  
  document.body.appendChild(el);
  
  // Remove after announcement (screen readers need a moment to read it)
  setTimeout(() => el.remove(), 1000);
}

/**
 * Move focus to the main content area
 * Useful after navigation or when implementing skip links
 * 
 * @example
 * // After route change
 * focusMainContent();
 * 
 * @param selector - CSS selector for the main content (defaults to "main" or "#main-content")
 */
export function focusMainContent(selector?: string): void {
  if (typeof document === "undefined") return;

  const main = document.querySelector<HTMLElement>(
    selector || "main, #main-content, [role='main']"
  );
  
  if (main) {
    // Temporarily make focusable if not already
    const hadTabIndex = main.hasAttribute("tabindex");
    if (!hadTabIndex) {
      main.setAttribute("tabindex", "-1");
    }
    
    main.focus({ preventScroll: false });
    
    // Clean up tabindex to avoid leaving non-interactive elements focusable
    if (!hadTabIndex) {
      // Remove after focus so it doesn't stay in tab order
      main.addEventListener(
        "blur",
        () => main.removeAttribute("tabindex"),
        { once: true }
      );
    }
  }
}

/**
 * Trap focus within a container (for modals, dialogs, etc.)
 * Note: shadcn/ui Dialog and Sheet already handle this, but useful for custom implementations
 * 
 * @example
 * const cleanup = trapFocus(modalRef.current);
 * // Later: cleanup();
 * 
 * @param container - The element to trap focus within
 * @returns Cleanup function to remove the trap
 */
export function trapFocus(container: HTMLElement | null): () => void {
  if (!container || typeof document === "undefined") return () => {};

  const focusableSelectors = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(", ");

  const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelectors);
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      // Shift + Tab: moving backwards
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      // Tab: moving forwards
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  container.addEventListener("keydown", handleKeyDown);
  firstFocusable?.focus();

  return () => container.removeEventListener("keydown", handleKeyDown);
}

/**
 * Generate a unique ID for ARIA relationships
 * Use for connecting labels, descriptions, and controls
 * 
 * @example
 * const descriptionId = generateId("description");
 * <input aria-describedby={descriptionId} />
 * <p id={descriptionId}>Help text here</p>
 * 
 * @param prefix - Optional prefix for the ID
 * @returns A unique ID string
 */
let idCounter = 0;
export function generateId(prefix = "aria"): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * Check if an element is visible to screen readers
 * Elements can be visually hidden but still accessible
 * 
 * @param element - The element to check
 * @returns true if the element is accessible to screen readers
 */
export function isAccessible(element: HTMLElement | null): boolean {
  if (!element) return false;
  
  // Check for aria-hidden
  if (element.getAttribute("aria-hidden") === "true") return false;
  
  // Check for hidden attribute
  if (element.hidden) return false;
  
  // Check computed styles
  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") return false;
  
  return true;
}
