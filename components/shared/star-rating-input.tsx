'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { IconStar, IconStarFilled } from '@tabler/icons-react';

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'size-5',
  md: 'size-7',
  lg: 'size-9',
};

export function StarRatingInput({
  value,
  onChange,
  max = 5,
  size = 'md',
  disabled = false,
  className,
}: StarRatingInputProps) {
  const [hoverValue, setHoverValue] = React.useState(0);

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      role="radiogroup"
      aria-label="Rating"
    >
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= (hoverValue || value);

        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={starValue === value}
            aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
            disabled={disabled}
            onClick={() => onChange(starValue)}
            onMouseEnter={() => !disabled && setHoverValue(starValue)}
            onMouseLeave={() => setHoverValue(0)}
            className={cn(
              'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm',
              disabled ? 'cursor-default opacity-50' : 'cursor-pointer',
              isFilled ? 'text-amber-400' : 'text-muted-foreground/30'
            )}
          >
            {isFilled ? (
              <IconStarFilled className={sizeClasses[size]} />
            ) : (
              <IconStar className={sizeClasses[size]} />
            )}
          </button>
        );
      })}
    </div>
  );
}
