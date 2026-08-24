'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { isFeatureEnabled } from '@/lib/feature-flags';
import {
  getActiveAdminNavItem,
  getVisibleAdminNavSections,
} from '@/components/admin/navigation-config';

function isDynamicPathSegment(segment: string): boolean {
  return /^[a-z0-9]{8,}$/i.test(segment);
}

function titleCaseSegment(segment: string): string {
  if (segment === 'new') {
    return 'Create';
  }

  if (segment === 'edit') {
    return 'Edit';
  }

  return segment
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getRouteDetailLabel(pathname: string, itemHref: string): string | null {
  const pathnameSegments = pathname.split('/').filter(Boolean);
  const itemSegments = itemHref.split('/').filter(Boolean);
  const trailingSegments = pathnameSegments.slice(itemSegments.length);

  if (trailingSegments.length === 0) {
    return null;
  }

  const descriptiveSegments = trailingSegments.filter(
    (segment) => !isDynamicPathSegment(segment)
  );

  if (descriptiveSegments.length === 0) {
    return 'Details';
  }

  return descriptiveSegments.map(titleCaseSegment).join(' / ');
}

export function PageBreadcrumbs() {
  const pathname = usePathname();
  const sections = getVisibleAdminNavSections(isFeatureEnabled);
  const activeItem = getActiveAdminNavItem(pathname, sections);
  const activeSection = sections.find((section) =>
    section.items.some((item) => item.id === activeItem?.id)
  );
  const routeDetail = activeItem ? getRouteDetailLabel(pathname, activeItem.href) : null;

  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <li>
          <Link href="/admin" className="transition-colors hover:text-foreground">
            Admin
          </Link>
        </li>
        {activeSection && (
          <>
            <li aria-hidden="true" className="text-muted-foreground/70">
              <ChevronRight className="size-4" />
            </li>
            <li>{activeSection.title}</li>
          </>
        )}
        {activeItem && (
          <>
            <li aria-hidden="true" className="text-muted-foreground/70">
              <ChevronRight className="size-4" />
            </li>
            <li>
              <Link href={activeItem.href} className="transition-colors hover:text-foreground">
                {activeItem.title}
              </Link>
            </li>
          </>
        )}
        {routeDetail && (
          <>
            <li aria-hidden="true" className="text-muted-foreground/70">
              <ChevronRight className="size-4" />
            </li>
            <li className="font-medium text-foreground">{routeDetail}</li>
          </>
        )}
      </ol>
    </nav>
  );
}
