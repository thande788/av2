'use client';

import { isDemoEnabled } from '@/lib/feature-flags';
import { AlertTriangle } from 'lucide-react';

/**
 * Floating banner indicating demo mode is active.
 * Displays centered at the bottom of the viewport when NEXT_PUBLIC_DEMO_MODE=true.
 *
 * Add this to your root layout to show demo status globally.
 */
export function DemoBanner() {
  if (!isDemoEnabled()) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-[9999] flex -translate-x-1/2 items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition-opacity hover:opacity-80"
    >
      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
      <span>Demo Mode</span>
    </div>
  );
}
