'use client';

import { ErrorDisplay } from '@/components/shared/error-display';

export default function ClientError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorDisplay
      type="general"
      title="Client Portal Error"
      message="Something went wrong loading your information. Please try again or contact our support team."
      error={error}
      reset={reset}
      homeUrl="/client"
    />
  );
}
