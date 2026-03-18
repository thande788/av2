'use client';

import { ErrorDisplay } from '@/components/shared/error-display';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorDisplay
      type="general"
      title="Admin Portal Error"
      message="Something went wrong in the admin portal. Please try again or contact technical support."
      error={error}
      reset={reset}
      homeUrl="/admin"
    />
  );
}
