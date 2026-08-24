import Link from 'next/link';
import { IconAlertCircle } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

export function ClientSetupNeeded() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <IconAlertCircle className="size-12 text-muted-foreground" />
      <h2 className="mt-4 text-xl font-semibold">We are finishing your client setup</h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        Your account is active, but your client profile is still being created. Refresh in a few
        moments, or contact support if this continues.
      </p>
      <div className="mt-5">
        <Button asChild variant="outline">
          <Link href="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  );
}
