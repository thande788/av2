import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoWatermarkProps {
  className?: string;
}

/**
 * A subtle logo watermark for portal backgrounds
 * Positioned in the bottom-right corner with low opacity
 * Uses CSS overflow clipping to remove whitespace from the source image
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
      <div className="size-64 overflow-hidden sm:size-80 lg:size-96">
        <Image
          src="/angel_pink.png"
          alt=""
          width={600}
          height={600}
          className="size-[250%] max-w-none -translate-x-[30%] -translate-y-[28%]"
          priority={false}
        />
      </div>
    </div>
  );
}
