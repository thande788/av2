"use client";

import { SignIn } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export function SignInClient() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
