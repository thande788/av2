'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface AccountSetupWaitingProps {
  error?: string;
}

export function AccountSetupWaiting({ error }: AccountSetupWaitingProps) {
  const router = useRouter();
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const maxAutoRetries = 5;

  // Auto-refresh every 2 seconds for first few attempts
  useEffect(() => {
    if (retryCount >= maxAutoRetries) return;

    const timer = setTimeout(() => {
      setRetryCount((c) => c + 1);
      router.refresh();
    }, 2000);

    return () => clearTimeout(timer);
  }, [retryCount, router]);

  const handleManualRetry = () => {
    setIsRetrying(true);
    setRetryCount(0); // Reset retry count to restart auto-refresh
    router.refresh();
    setTimeout(() => setIsRetrying(false), 1000);
  };

  const showError = retryCount >= maxAutoRetries;

  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-12">
      <div className="text-center">
        {!showError ? (
          <>
            <div className="mx-auto mb-6 size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <h1 className="mb-2 text-2xl font-bold">Setting up your account...</h1>
            <p className="mb-6 text-muted-foreground">
              Please wait a moment while we finish setting up your account.
            </p>
            <p className="text-sm text-muted-foreground">
              This usually takes just a few seconds.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="size-8 text-destructive" />
            </div>
            <h1 className="mb-2 text-2xl font-bold">Account Setup Issue</h1>
            <p className="mb-4 text-muted-foreground">
              We&apos;re having trouble setting up your account. This might be a temporary issue.
            </p>
            {error && (
              <p className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                Error: {error}
              </p>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={handleManualRetry} disabled={isRetrying}>
                <RefreshCw className={`mr-2 size-4 ${isRetrying ? 'animate-spin' : ''}`} />
                Try Again
              </Button>
              <Button variant="outline" asChild>
                <a href="/contact">Contact Support</a>
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              If this issue persists, please contact support with your email address.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
