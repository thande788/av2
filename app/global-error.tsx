'use client';

import { ErrorDisplay } from '@/components/shared/error-display';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <ErrorDisplay
          type="general"
          error={error}
          reset={reset}
          homeUrl="/"
        />
      </body>
    </html>
  );
}
