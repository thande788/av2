/**
 * Lazy Chat Widget Loader
 * 
 * Defers loading of the ChatWidget component until:
 * 1. User scrolls the page
 * 2. User clicks anywhere
 * 3. Idle timeout expires (default 5s)
 * 
 * This keeps the initial bundle small and improves LCP.
 * 
 * @example
 * ```tsx
 * // In layout.tsx
 * <LazyChatWidget />
 * ```
 */

"use client";

import { useState, useEffect, lazy, Suspense } from "react";

// Lazy load the actual widget
const ChatWidget = lazy(() => import("./chat-widget"));

interface LazyChatWidgetProps {
  /** Delay before loading the widget (ms) */
  loadDelay?: number;
  /** Props to pass to ChatWidget */
  greeting?: string;
  position?: "bottom-right" | "bottom-left";
  /** Contextual help links */
  helpLinks?: { label: string; href: string }[];
}

export function LazyChatWidget({
  loadDelay = 3000,
  greeting,
  position,
  helpLinks,
}: LazyChatWidgetProps) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    let hasTriggered = false;

    const triggerLoad = () => {
      if (!hasTriggered) {
        hasTriggered = true;
        setShouldLoad(true);
      }
    };

    // Load after delay
    const timer = setTimeout(triggerLoad, loadDelay);

    // Or load on user interaction
    const events = ["scroll", "click", "touchstart", "mousemove"];
    
    const handleInteraction = () => {
      triggerLoad();
      // Clean up listeners after first interaction
      events.forEach((event) => {
        window.removeEventListener(event, handleInteraction);
      });
    };

    events.forEach((event) => {
      window.addEventListener(event, handleInteraction, { 
        once: true, 
        passive: true 
      });
    });

    return () => {
      clearTimeout(timer);
      events.forEach((event) => {
        window.removeEventListener(event, handleInteraction);
      });
    };
  }, [loadDelay]);

  if (!shouldLoad) return null;

  return (
    <Suspense fallback={null}>
      <ChatWidget 
        greeting={greeting} 
        position={position}
        helpLinks={helpLinks}
        immediate // Already delayed by this wrapper
      />
    </Suspense>
  );
}

export default LazyChatWidget;
