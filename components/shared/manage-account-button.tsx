'use client';

import { useClerk } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

interface ManageAccountButtonProps {
  label?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ManageAccountButton({
  label = 'Manage',
  variant = 'outline',
  size = 'sm',
  className,
}: ManageAccountButtonProps) {
  const { openUserProfile } = useClerk();

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => openUserProfile()}
    >
      {label}
    </Button>
  );
}
