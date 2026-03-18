import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IconHome, IconSearch } from '@tabler/icons-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="text-center">
            {/* 404 Number */}
            <div className="mb-4">
              <span className="text-8xl font-bold text-primary/20">404</span>
            </div>

            {/* Title */}
            <h1 className="mb-2 text-2xl font-bold text-foreground">Page not found</h1>

            {/* Message */}
            <p className="mb-6 text-muted-foreground">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/">
                  <IconHome className="mr-2 size-4" />
                  Go home
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/services">
                  <IconSearch className="mr-2 size-4" />
                  Browse services
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
