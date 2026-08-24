import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SignInClient } from './sign-in-client';

/**
 * Sign-in page - fallback for direct URL access
 * Primary sign-in is handled via modal from the navbar.
 * This page catches /sign-in routes for OAuth callbacks and direct links.
 */
interface SignInPageProps {
  searchParams: Promise<{ issue?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const showMissingRoleHelp = params.issue === 'missing-role';

  return (
    <div className='flex min-h-[60vh] w-full flex-1 flex-col items-center justify-center gap-4 p-6 md:p-10'>
      {showMissingRoleHelp && (
        <div className="w-full max-w-md rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-sm text-foreground">
            Your account is signed in, but your portal role is missing. Please contact support so we can finish setup.
          </p>
          <div className="mt-3">
            <Button asChild size="sm" variant="outline">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      )}
      <SignInClient />
    </div>
  );
}
