'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  IconAlertTriangle,
  IconRefresh,
  IconHome,
  IconHeadset,
  IconShieldOff,
  IconUserOff,
  IconLock,
} from '@tabler/icons-react';

export type ErrorType =
  | 'general'
  | 'not-found'
  | 'unauthorized'
  | 'forbidden'
  | 'account-pending'
  | 'account-inactive'
  | 'account-terminated'
  | 'network';

interface ErrorDisplayProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  error?: Error & { digest?: string };
  reset?: () => void;
  showHomeLink?: boolean;
  showContactLink?: boolean;
  homeUrl?: string;
  className?: string;
}

const errorConfig: Record<
  ErrorType,
  {
    icon: typeof IconAlertTriangle;
    title: string;
    message: string;
    iconColor: string;
    bgColor: string;
  }
> = {
  general: {
    icon: IconAlertTriangle,
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    iconColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  'not-found': {
    icon: IconAlertTriangle,
    title: 'Page not found',
    message: "The page you're looking for doesn't exist or has been moved.",
    iconColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  unauthorized: {
    icon: IconLock,
    title: 'Sign in required',
    message: 'You need to sign in to access this page.',
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  forbidden: {
    icon: IconShieldOff,
    title: 'Access denied',
    message: "You don't have permission to access this page. Please contact your administrator if you believe this is an error.",
    iconColor: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  'account-pending': {
    icon: IconUserOff,
    title: 'Account pending approval',
    message: 'Your account is waiting for administrator approval. You will receive an email once your account has been activated.',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  'account-inactive': {
    icon: IconUserOff,
    title: 'Account inactive',
    message: 'Your account has been deactivated. Please contact support to reactivate your account.',
    iconColor: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800/30',
  },
  'account-terminated': {
    icon: IconUserOff,
    title: 'Account terminated',
    message: 'Your account has been terminated. If you believe this is an error, please contact support.',
    iconColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  network: {
    icon: IconAlertTriangle,
    title: 'Connection error',
    message: 'Unable to connect to the server. Please check your internet connection and try again.',
    iconColor: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
};

export function ErrorDisplay({
  type = 'general',
  title,
  message,
  error,
  reset,
  showHomeLink = true,
  showContactLink = true,
  homeUrl = '/',
  className = '',
}: ErrorDisplayProps) {
  const config = errorConfig[type];
  const Icon = config.icon;
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;

  // Log error to console in development
  useEffect(() => {
    if (error) {
      console.error('Error caught by ErrorDisplay:', error);
    }
  }, [error]);

  return (
    <div className={`flex min-h-[60vh] items-center justify-center px-4 ${className}`}>
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="text-center">
            {/* Icon */}
            <div className={`mx-auto mb-4 flex size-16 items-center justify-center rounded-full ${config.bgColor}`}>
              <Icon className={`size-8 ${config.iconColor}`} />
            </div>

            {/* Title */}
            <h1 className="mb-2 text-2xl font-bold text-foreground">{displayTitle}</h1>

            {/* Message */}
            <p className="mb-6 text-muted-foreground">{displayMessage}</p>

            {/* Error details in development */}
            {error?.message && process.env.NODE_ENV === 'development' && (
              <div className="mb-6 rounded-lg bg-muted p-3 text-left">
                <p className="text-xs font-medium text-muted-foreground">Error details:</p>
                <p className="mt-1 text-sm font-mono text-destructive">{error.message}</p>
                {error.digest && (
                  <p className="mt-1 text-xs text-muted-foreground">Digest: {error.digest}</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              {/* Retry button */}
              {reset && (
                <Button onClick={reset} variant="default">
                  <IconRefresh className="mr-2 size-4" />
                  Try again
                </Button>
              )}

              {/* Home link */}
              {showHomeLink && (
                <Button asChild variant={reset ? 'outline' : 'default'}>
                  <Link href={homeUrl}>
                    <IconHome className="mr-2 size-4" />
                    Go home
                  </Link>
                </Button>
              )}

              {/* Contact support */}
              {showContactLink && (
                <Button asChild variant="outline">
                  <Link href="/contact">
                    <IconHeadset className="mr-2 size-4" />
                    Contact support
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
