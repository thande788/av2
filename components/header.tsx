import { Button } from '@/components/ui/button';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

/**
 * Simple header component for auth pages (sign-in/sign-up)
 * Uses modal mode for sign-in to avoid page navigation
 */
export function Header() {
  return (
    <header className='flex h-16 items-center justify-between gap-4 border-b px-4'>
      <Link
        href='/'
        className='flex items-center gap-x-3'
      >
        <span className='font-semibold'>Angel Touch Homecare</span>
      </Link>
      <div className='flex items-center gap-x-4'>
        <SignedOut>
          <SignInButton mode='modal'>
            <Button variant='ghost'>Sign in</Button>
          </SignInButton>
          <SignUpButton>
            <Button>Sign up</Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}
