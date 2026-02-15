'use client';

import { Button } from '@/components/ui/button';
import {
  IconCalendarPlus,
  IconUserPlus,
  IconFileText,
  IconBriefcase,
} from '@tabler/icons-react';
import Link from 'next/link';

export function QuickActions() {
  const actions = [
    {
      label: 'Create Shift',
      icon: IconCalendarPlus,
      href: '/admin/shifts/new',
      variant: 'default' as const,
    },
    {
      label: 'Add Worker',
      icon: IconUserPlus,
      href: '/admin/workers/new',
      variant: 'outline' as const,
    },
    {
      label: 'Post Job',
      icon: IconBriefcase,
      href: '/admin/jobs/new',
      variant: 'outline' as const,
    },
    {
      label: 'New Inquiry',
      icon: IconFileText,
      href: '/admin/inquiries/new',
      variant: 'outline' as const,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button key={action.label} variant={action.variant} size="sm" asChild>
            <Link href={action.href}>
              <Icon className="size-4 mr-2" />
              {action.label}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}
