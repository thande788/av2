"use client";

import { SignUp } from '@clerk/nextjs';
import { useSyncExternalStore } from 'react';

interface SignUpClientProps {
  role?: 'client' | 'caregiver';
  clientType?: 'SELF' | 'FAMILY' | 'FACILITY';
}

export function SignUpClient({ role, clientType }: SignUpClientProps) {
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
      unsafeMetadata={
        role
          ? {
              role,
              ...(role === 'client' && clientType ? { clientType } : {}),
            }
          : undefined
      }
      appearance={{
        elements: {
          rootBox: 'mx-auto lg:mx-0',
          card: 'shadow-none',
        },
      }}
    />
  );
}
