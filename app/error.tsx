'use client';

import { ErrorDisplay } from '@/components/shared/error-display';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorDisplay
      type="general"
      error={error}
      reset={reset}
      homeUrl="/"
    />
  );
}
