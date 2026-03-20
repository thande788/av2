'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface TourStep {
  /** CSS selector for the target element */
  target: string;
  /** Step headline */
  title: string;
  /** Explanation text */
  description: string;
  /** Preferred popover placement */
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface FeatureTourProps {
  steps: TourStep[];
  /** localStorage key to track dismissal */
  storageKey: string;
  /** Delay before starting (ms) */
  startDelay?: number;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function getPopoverPosition(
  targetRect: Rect,
  placement: TourStep['placement'] = 'bottom',
  popoverEl: HTMLDivElement | null
) {
  const padding = 12;
  const popoverWidth = popoverEl?.offsetWidth ?? 320;
  const popoverHeight = popoverEl?.offsetHeight ?? 160;

  let top = 0;
  let left = 0;

  switch (placement) {
    case 'top':
      top = targetRect.top - popoverHeight - padding;
      left = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
      break;
    case 'bottom':
      top = targetRect.top + targetRect.height + padding;
      left = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
      break;
    case 'left':
      top = targetRect.top + targetRect.height / 2 - popoverHeight / 2;
      left = targetRect.left - popoverWidth - padding;
      break;
    case 'right':
      top = targetRect.top + targetRect.height / 2 - popoverHeight / 2;
      left = targetRect.left + targetRect.width + padding;
      break;
  }

  // Clamp to viewport
  left = Math.max(8, Math.min(left, window.innerWidth - popoverWidth - 8));
  top = Math.max(8, Math.min(top, window.innerHeight - popoverHeight - 8));

  return { top, left };
}

/**
 * Lightweight guided feature tour with spotlight overlay.
 * Persists dismissal via localStorage. Respects prefers-reduced-motion.
 *
 * @example
 * ```tsx
 * <FeatureTour
 *   storageKey="admin-dashboard-tour"
 *   steps={[
 *     { target: '[data-tour="stats"]', title: 'Dashboard Stats', description: 'View key metrics at a glance.' },
 *     { target: '[data-tour="clients"]', title: 'Client List', description: 'Manage your active clients.' },
 *   ]}
 * />
 * ```
 */
export function FeatureTour({
  steps,
  storageKey,
  startDelay = 800,
}: FeatureTourProps) {
  const [active, setActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only mount detection
  useEffect(() => { setMounted(true); }, []);

  // Check if tour was already dismissed
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const dismissed = localStorage.getItem(`tour-dismissed:${storageKey}`);
    if (dismissed) return;

    // Check prefers-reduced-motion
    const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!motionOk) return;

    const timer = setTimeout(() => setActive(true), startDelay);
    return () => clearTimeout(timer);
  }, [storageKey, startDelay]);

  // Update target rect whenever step changes
  const updateRect = useCallback(() => {
    if (!active || !steps[currentStep]) return;

    const el = document.querySelector(steps[currentStep].target);
    if (!el) {
      setTargetRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });

    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [active, currentStep, steps]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- must measure DOM element rects
    updateRect();

    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [updateRect]);

  // Compute popover position in an effect (refs can't be read during render)
  useEffect(() => {
    if (!active || !steps[currentStep]) return;
    const step = steps[currentStep];
    if (targetRect) {
      setPopoverPos(getPopoverPosition(targetRect, step.placement, popoverRef.current));
    } else {
      setPopoverPos({ top: window.innerHeight / 2 - 80, left: window.innerWidth / 2 - 160 });
    }
  }, [active, currentStep, targetRect, steps]);

  // Permanently dismiss (persists to localStorage)
  function dismiss() {
    localStorage.setItem(`tour-dismissed:${storageKey}`, 'true');
    setActive(false);
    setCurrentStep(0);
  }

  // Temporarily close (no localStorage write — can be restarted)
  function close() {
    setActive(false);
    setCurrentStep(0);
  }

  // Listen for restart event from TourTrigger
  useEffect(() => {
    function handleRestart(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.storageKey === storageKey) {
        localStorage.removeItem(`tour-dismissed:${storageKey}`);
        setCurrentStep(0);
        setActive(true);
      }
    }
    window.addEventListener('tour:restart', handleRestart);
    return () => window.removeEventListener('tour:restart', handleRestart);
  }, [storageKey]);

  function next() {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      dismiss();
    }
  }

  function prev() {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }

  if (!mounted || !active || !steps.length || !popoverPos) return null;

  const step = steps[currentStep];
  const spotlightPad = 8;

  return createPortal(
    <>
      {/* Overlay backdrop — click to temporarily close (not permanently dismiss) */}
      <div
        className="fixed inset-0 z-[9998] bg-black/50 transition-opacity duration-300"
        onClick={close}
        aria-hidden="true"
      />

      {/* Spotlight cutout */}
      {targetRect && (
        <div
          className="fixed z-[9999] rounded-lg ring-2 ring-primary/60 pointer-events-none transition-all duration-300"
          style={{
            top: targetRect.top - spotlightPad,
            left: targetRect.left - spotlightPad,
            width: targetRect.width + spotlightPad * 2,
            height: targetRect.height + spotlightPad * 2,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
          }}
        />
      )}

      {/* Popover */}
      <div
        ref={popoverRef}
        role="dialog"
        aria-label={step.title}
        className={cn(
          'fixed z-[10000] w-80 rounded-xl border border-primary/30 bg-popover shadow-xl',
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}
        style={{ top: popoverPos.top, left: popoverPos.left }}
      >
        <div className="flex items-start justify-between p-4 pb-2">
          <h3 className="text-sm font-semibold text-popover-foreground pr-6">{step.title}</h3>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded-md p-1 text-popover-foreground/60 hover:text-popover-foreground transition-colors"
            aria-label="Close tour"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="px-4 pb-3 text-sm text-popover-foreground/80">{step.description}</p>
        <div className="flex items-center justify-between border-t border-primary/20 px-4 py-3">
          <span className="text-xs text-popover-foreground/60">
            {currentStep + 1} of {steps.length}
          </span>
          <div className="flex gap-1.5">
            {currentStep > 0 && (
              <Button variant="ghost" size="sm" onClick={prev} className="h-7 px-2">
                <ChevronLeft className="size-3.5 mr-0.5" />
                Back
              </Button>
            )}
            <Button size="sm" onClick={next} className="h-7 px-3">
              {currentStep < steps.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="size-3.5 ml-0.5" />
                </>
              ) : (
                'Done'
              )}
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

/** Helper button to restart a dismissed tour (no page reload) */
export function TourTrigger({
  storageKey,
  children,
  className,
}: {
  storageKey: string;
  children: React.ReactNode;
  className?: string;
}) {
  function restart() {
    window.dispatchEvent(
      new CustomEvent('tour:restart', { detail: { storageKey } })
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={restart} className={className}>
      {children}
    </Button>
  );
}
