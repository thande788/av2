import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <WifiOff className="mb-4 size-16 text-muted-foreground/50" />
      <h1 className="text-2xl font-bold">You&apos;re Offline</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        It looks like you&apos;ve lost your internet connection. Some features may be limited until you&apos;re back online.
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Previously viewed shifts and schedules may still be available.
      </p>
    </div>
  );
}
