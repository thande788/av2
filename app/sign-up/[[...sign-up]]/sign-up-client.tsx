"use client";

import { SignUp } from '@clerk/nextjs';
import { useSyncExternalStore } from 'react';

export function SignUpClient() {
  const isMounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  if (!isMounted) {
    return <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />;
  }

  return (
    <SignUp
      forceRedirectUrl='/portals'
      appearance={{
        elements: {
          rootBox: 'mx-auto lg:mx-0',
          card: 'shadow-none',
        },
      }}
    />
  );
}
