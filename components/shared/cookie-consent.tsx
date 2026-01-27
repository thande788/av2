/**
 * CookieConsent Component
 * 
 * GDPR/CCPA compliant cookie consent banner.
 * Stores preference in localStorage.
 * 
 * @example
 * ```tsx
 * // In layout.tsx
 * <CookieConsent />
 * ```
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconCookie, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

const CONSENT_KEY = "cookie-consent";
const CONSENT_VERSION = "1"; // Increment to re-prompt users

export type ConsentLevel = "essential" | "analytics" | "all";

interface CookiePreferences {
  version: string;
  level: ConsentLevel;
  timestamp: number;
}

interface CookieConsentProps {
  className?: string;
  /** Called when user makes a consent choice */
  onConsent?: (level: ConsentLevel) => void;
}

export function CookieConsent({ className, onConsent }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Check for existing consent on mount
  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    
    if (stored) {
      try {
        const prefs: CookiePreferences = JSON.parse(stored);
        // Show again if version changed
        if (prefs.version !== CONSENT_VERSION) {
          setIsVisible(true);
        }
      } catch {
        setIsVisible(true);
      }
    } else {
      // Delay showing banner for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = useCallback(
    (level: ConsentLevel) => {
      const prefs: CookiePreferences = {
        version: CONSENT_VERSION,
        level,
        timestamp: Date.now(),
      };
      localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
      setIsVisible(false);
      onConsent?.(level);

      // Dispatch custom event for analytics scripts to listen to
      window.dispatchEvent(
        new CustomEvent("cookieConsent", { detail: { level } })
      );
    },
    [onConsent]
  );

  const handleAcceptAll = () => saveConsent("all");
  const handleAcceptEssential = () => saveConsent("essential");
  const handleAcceptAnalytics = () => saveConsent("analytics");

  if (!isVisible) return null;

  const content = (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6",
        "bg-background/95 backdrop-blur-md border-t border-border",
        "shadow-lg",
        className
      )}
      role="dialog"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-description"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          {/* Icon and text */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <IconCookie className="size-5 text-primary" aria-hidden="true" />
              <h2 id="cookie-title" className="font-semibold text-foreground">
                Cookie Preferences
              </h2>
            </div>
            <p id="cookie-description" className="text-sm text-muted-foreground mb-3">
              We use cookies to enhance your experience. Essential cookies are required
              for the site to function. Analytics cookies help us improve our services.
            </p>

            {/* Expanded options */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 py-3 border-t border-border/50">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="essential"
                        checked
                        disabled
                        className="mt-1 rounded"
                      />
                      <label htmlFor="essential" className="text-sm">
                        <span className="font-medium">Essential</span>
                        <span className="text-muted-foreground block">
                          Required for site functionality. Cannot be disabled.
                        </span>
                      </label>
                    </div>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="analytics"
                        defaultChecked
                        className="mt-1 rounded"
                      />
                      <label htmlFor="analytics" className="text-sm">
                        <span className="font-medium">Analytics</span>
                        <span className="text-muted-foreground block">
                          Helps us understand how visitors use our site.
                        </span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 md:flex-col lg:flex-row">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground"
            >
              {isExpanded ? "Hide Options" : "Customize"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAcceptEssential}
            >
              Essential Only
            </Button>
            <Button size="sm" onClick={handleAcceptAll}>
              Accept All
            </Button>
          </div>

          {/* Close button (mobile) */}
          <button
            onClick={handleAcceptEssential}
            className="absolute top-4 right-4 md:hidden p-1 text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <IconX className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );

  if (prefersReducedMotion) {
    return content;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to check current cookie consent level
 */
export function useCookieConsent(): ConsentLevel | null {
  const [consent, setConsent] = useState<ConsentLevel | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      try {
        const prefs: CookiePreferences = JSON.parse(stored);
        setConsent(prefs.level);
      } catch {
        setConsent(null);
      }
    }

    // Listen for consent changes
    const handleConsent = (e: CustomEvent<{ level: ConsentLevel }>) => {
      setConsent(e.detail.level);
    };

    window.addEventListener("cookieConsent", handleConsent as EventListener);
    return () => {
      window.removeEventListener("cookieConsent", handleConsent as EventListener);
    };
  }, []);

  return consent;
}

/**
 * Check if analytics cookies are allowed
 */
export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  
  const stored = localStorage.getItem(CONSENT_KEY);
  if (!stored) return false;

  try {
    const prefs: CookiePreferences = JSON.parse(stored);
    return prefs.level === "all" || prefs.level === "analytics";
  } catch {
    return false;
  }
}

export default CookieConsent;
