import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { getVisibleAdminQuickActions } from './navigation-config';

export function QuickActions() {
  const actions = getVisibleAdminQuickActions(isFeatureEnabled).slice(0, 4);

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action, index) => {
        const Icon = action.icon;

        return (
          <Button
            key={action.id}
            variant={index === 0 ? 'default' : 'outline'}
            size="sm"
            asChild
          >
            <Link href={action.href}>
              <Icon className="mr-2 size-4" />
              {action.title}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}