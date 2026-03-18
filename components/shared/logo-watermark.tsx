import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoWatermarkProps {
  className?: string;
}

/**
 * A subtle logo watermark for portal backgrounds
 * Positioned as a background element behind all content
 */
export function LogoWatermark({ className }: LogoWatermarkProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden select-none',
        className
      )}
      aria-hidden="true"
    >
      <div className="size-[500px] overflow-hidden opacity-[0.05] dark:opacity-[0.03] lg:size-[600px]">
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
