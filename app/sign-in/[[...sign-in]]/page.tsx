import { SignIn } from '@clerk/nextjs';

/**
 * Sign-in page - fallback for direct URL access
 * Primary sign-in is handled via modal from the navbar.
 * This page catches /sign-in routes for OAuth callbacks and direct links.
 */
export default function SignInPage() {
  return (
    <div className='flex min-h-[60vh] w-full flex-1 items-center justify-center p-6 md:p-10'>
      <SignIn
        forceRedirectUrl='/portals'
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-none bg-transparent',
          },
        }}
      />
    </div>
  );
}
