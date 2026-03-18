import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoWatermarkProps {
  className?: string;
}

/**
 * A subtle logo watermark for portal backgrounds
 * Positioned in the bottom-right corner with low opacity
 */
export function LogoWatermark({ className }: LogoWatermarkProps) {
  return (
    <div
      className={cn(
        'pointer-events-none fixed bottom-8 right-8 z-0 select-none opacity-[0.03] dark:opacity-[0.02]',
        className
      )}
      aria-hidden="true"
    >
      <Image
        src="/angel_pink.png"
        alt=""
        width={400}
        height={400}
        className="size-64 sm:size-80 lg:size-96"
        priority={false}
      />
    </div>
  );
}
