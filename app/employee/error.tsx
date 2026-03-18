'use client';

import { ErrorDisplay } from '@/components/shared/error-display';

export default function EmployeeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorDisplay
      type="general"
      title="Employee Portal Error"
      message="Something went wrong. Please try again or contact your supervisor if the problem persists."
      error={error}
      reset={reset}
      homeUrl="/employee"
    />
  );
}
