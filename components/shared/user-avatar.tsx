import Image from 'next/image';
import { cn } from '@/lib/utils';

const FALLBACK_AVATAR = '/images/avatar-fallback.svg';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'size-8',
  sm: 'size-10',
  md: 'size-14',
  lg: 'size-20',
  xl: 'size-28',
  '2xl': 'size-36',
};

const sizePx: Record<AvatarSize, number> = {
  xs: 32,
  sm: 40,
  md: 56,
  lg: 80,
  xl: 112,
  '2xl': 144,
};

const initialsText: Record<AvatarSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-3xl',
  '2xl': 'text-4xl',
};

interface UserAvatarProps {
  /** URL to profile photo */
  src?: string | null;
  /** Full name for alt text and initials extraction */
  name?: string | null;
  /** Pre-computed initials (takes priority over name) */
  initials?: string;
  /** Avatar size preset */
  size?: AvatarSize;
  /** Whether to render as a circle (true) or rectangle (false) */
  rounded?: boolean;
  /** Additional CSS classes on the outer container */
  className?: string;
}

/**
 * Unified avatar component with a three-tier fallback:
 * 1. Profile photo (if `src` is provided)
 * 2. Initials circle (if `name` or `initials` provided)
 * 3. Generic silhouette SVG
 */
export function UserAvatar({
  src,
  name,
  initials: initialsProp,
  size = 'md',
  rounded = true,
  className,
}: UserAvatarProps) {
  const computedInitials =
    initialsProp ??
    (name
      ? name
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((w) => w[0])
          .join('')
          .toUpperCase()
      : null);

  const shapeClass = rounded ? 'rounded-full' : 'rounded-lg';

  // Tier 1: Photo
  if (src) {
    return (
      <div
        className={cn(
          'relative shrink-0 overflow-hidden border-2 border-primary/20',
          sizeClasses[size],
          shapeClass,
          className,
        )}
      >
        <Image
          src={src}
          alt={name ? `${name} profile photo` : 'Profile photo'}
          fill
          className="object-cover"
          sizes={`${sizePx[size]}px`}
        />
      </div>
    );
  }

  // Tier 2: Initials
  if (computedInitials) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center bg-primary/10 font-bold text-primary',
          sizeClasses[size],
          initialsText[size],
          shapeClass,
          className,
        )}
        aria-label={name ?? undefined}
      >
        {computedInitials}
      </div>
    );
  }

  // Tier 3: Generic silhouette fallback
  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden bg-muted',
        sizeClasses[size],
        shapeClass,
        className,
      )}
    >
      <Image
        src={FALLBACK_AVATAR}
        alt="Default avatar"
        fill
        className="object-cover"
        sizes={`${sizePx[size]}px`}
      />
    </div>
  );
}
