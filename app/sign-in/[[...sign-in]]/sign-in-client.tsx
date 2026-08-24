"use client";

import { SignIn } from '@clerk/nextjs';
import { useSyncExternalStore } from 'react';

export function SignInClient() {
  const isMounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  if (!isMounted) {
    return <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />;
  }

  return (
    <SignIn
      forceRedirectUrl='/portals'
      appearance={{
        elements: {
          rootBox: 'mx-auto',
          card: 'shadow-none bg-transparent',
        },
      }}
    />
  );
}
