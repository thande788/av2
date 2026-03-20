'use client';

import { SignOutButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  LogOut,
  Menu,
  Plus,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AnimatedThemeToggle } from '@/components/ui/animated-theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { cn } from '@/lib/utils';
import { CommandPaletteTrigger } from './command-palette';
import {
  getActiveAdminNavItem,
  getVisibleAdminNavSections,
  getVisibleAdminQuickActions,
  isAdminNavItemActive,
  type AdminBadgeCounts,
  type AdminNavItem,
  type VisibleAdminNavSection,
} from './navigation-config';
import { NotificationBell } from './notification-bell';

const SIDEBAR_STORAGE_KEY = 'admin-sidebar-collapsed';
const SIDEBAR_STORAGE_EVENT = 'admin-sidebar-preference-change';

interface AdminSidebarProps {
  badgeCounts?: AdminBadgeCounts;
}

function formatBadgeCount(value: number): string {
  if (value > 99) {
    return '99+';
  }

  return String(value);
}

function subscribeToSidebarPreference(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleChange = () => onStoreChange();

  window.addEventListener('storage', handleChange);
  window.addEventListener(SIDEBAR_STORAGE_EVENT, handleChange);

  return () => {
    window.removeEventListener('storage', handleChange);
    window.removeEventListener(SIDEBAR_STORAGE_EVENT, handleChange);
  };
}

function getSidebarCollapsedSnapshot(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
}

function updateSidebarCollapsedPreference(value: boolean) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(value));
  window.dispatchEvent(new Event(SIDEBAR_STORAGE_EVENT));
}

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

function getRouteDetailLabel(pathname: string, item: AdminNavItem): string | null {
  const pathnameSegments = pathname.split('/').filter(Boolean);
  const itemSegments = item.href.split('/').filter(Boolean);
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

function SidebarTooltip({
  children,
  label,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={10}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function QuickActionsMenu({
  actions,
  compact = false,
  onNavigate,
}: {
  actions: ReturnType<typeof getVisibleAdminQuickActions>;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();

  const trigger = compact ? (
    <Button
      variant="ghost"
      size="icon"
      className="hover:bg-primary/10"
      aria-label="Open quick actions"
    >
      <Plus className="size-5" />
    </Button>
  ) : (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-between gap-2 border border-border/50 bg-background/70 hover:bg-primary/8"
    >
      <Plus className="size-4" />
      <span>New</span>
      <ChevronsUpDown className="size-3.5 text-muted-foreground" />
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={compact ? 'end' : 'start'} className="w-64">
        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.id}
            onSelect={() => {
              onNavigate?.();
              router.push(action.href);
            }}
          >
            <action.icon className="size-4" />
            <span>{action.title}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AdminSidebar({ badgeCounts = {} }: AdminSidebarProps) {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(
    subscribeToSidebarPreference,
    getSidebarCollapsedSnapshot,
    () => false
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const sections = getVisibleAdminNavSections(isFeatureEnabled);
  const quickActions = getVisibleAdminQuickActions(isFeatureEnabled);
  const activeItem = getActiveAdminNavItem(pathname, sections);
  const activeSection = sections.find((section) =>
    section.items.some((item) => item.id === activeItem?.id)
  );
  const routeDetail = activeItem ? getRouteDetailLabel(pathname, activeItem) : null;
  const activeContextLabel = activeItem
    ? [activeSection?.title, activeItem.title, routeDetail].filter(Boolean).join(' / ')
    : null;

  const renderNavItem = ({
    item,
    compact,
    onNavigate,
  }: {
    item: AdminNavItem;
    compact: boolean;
    onNavigate?: () => void;
  }) => {
    const isActive = isAdminNavItemActive(item, pathname);
    const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] ?? 0 : 0;

    const link = (
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'group relative flex w-full items-center overflow-hidden rounded-2xl text-sm font-medium transition-all duration-200',
          compact ? 'h-12 justify-center rounded-xl px-2' : 'gap-3 px-3 py-2.5',
          isActive
            ? 'bg-primary/12 text-primary shadow-sm ring-1 ring-primary/20'
            : 'text-muted-foreground hover:bg-background/90 hover:text-foreground hover:shadow-sm'
        )}
      >
        <span
          className={cn(
            'absolute left-0 top-2 bottom-2 w-1 rounded-r-full transition-colors',
            isActive ? 'bg-primary' : 'bg-transparent group-hover:bg-primary/20'
          )}
        />
        <div className="relative shrink-0">
          <item.icon className={cn('size-5', isActive && 'text-primary')} />
          {compact && badgeCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {badgeCount > 9 ? '9+' : badgeCount}
            </span>
          )}
        </div>
        {!compact && (
          <>
            <div className="min-w-0 flex-1">
              <span className="block truncate">{item.title}</span>
            </div>
            {badgeCount > 0 && (
              <Badge variant={item.badgeVariant ?? 'secondary'}>
                {formatBadgeCount(badgeCount)}
              </Badge>
            )}
            {isActive && <ChevronRight className="size-4 text-primary/80" />}
          </>
        )}
      </Link>
    );

    return (
      <SidebarTooltip
        key={item.id}
        label={
          badgeCount > 0
            ? `${item.title} (${formatBadgeCount(badgeCount)})`
            : item.title
        }
        disabled={!compact}
      >
        {link}
      </SidebarTooltip>
    );
  };

  const renderSection = (
    section: VisibleAdminNavSection,
    options?: { compact?: boolean; onNavigate?: () => void }
  ) => {
    const compact = options?.compact ?? false;
    const sectionIsActive = section.items.some((item) =>
      isAdminNavItemActive(item, pathname)
    );

    return (
      <div key={section.id} className={cn('space-y-2', compact && 'space-y-2.5')}>
        {compact ? (
          <div className="mx-auto h-px w-10 bg-border/70" />
        ) : (
          <div className="px-3 pt-1">
            <div className="flex items-center justify-between gap-2">
              <p
                className={cn(
                  'text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/85',
                  sectionIsActive && 'text-primary'
                )}
              >
                {section.title}
              </p>
              {section.badgeLabel && (
                <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                  {section.badgeLabel}
                </Badge>
              )}
            </div>
          </div>
        )}
        <div className={cn('space-y-1', compact && 'space-y-1.5')}>
          {section.items.map((item) =>
            renderNavItem({ item, compact, onNavigate: options?.onNavigate })
          )}
        </div>
      </div>
    );
  };

  const navigation = (options?: { compact?: boolean; onNavigate?: () => void }) => {
    const compact = options?.compact ?? false;

    return (
      <nav
        className={cn(
          'min-h-0 flex-1 overflow-y-auto',
            compact ? 'px-3 py-4' : 'px-3 py-4'
        )}
      >
        <div className={cn('space-y-4', compact && 'space-y-5')}>
          {sections.map((section) => renderSection(section, options))}
        </div>
      </nav>
    );
  };

  return (
    <>
      <div className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-primary/20 bg-background/95 px-4 backdrop-blur lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(22rem,92vw)] p-0" showCloseButton={false}>
            <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
            <div className="flex h-full flex-col bg-background">
              <div className="border-b border-primary/20 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <Link href="/admin" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                    <div className="size-9 overflow-hidden rounded-lg">
                      <Image
                        src="/angel_pink.png"
                        alt="Angel Touch"
                        width={650}
                        height={731}
                        className="size-full object-contain"
                      />
                    </div>
                    <div>
                      <span className="block font-semibold text-primary">Admin Portal</span>
                      {activeItem && (
                        <span className="block text-xs text-muted-foreground">{activeItem.title}</span>
                      )}
                    </div>
                  </Link>
                  <QuickActionsMenu actions={quickActions} compact onNavigate={() => setMobileOpen(false)} />
                </div>
              </div>

              <div className="border-b border-primary/10 px-3 py-3">
                <div className="flex items-center gap-2">
                  <CommandPaletteTrigger className="flex-1" />
                  <NotificationBell />
                </div>
              </div>

              {activeContextLabel && (
                <div className="border-b border-primary/10 px-3 py-3">
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 px-3 py-2.5">
                    <p className="truncate text-sm font-medium text-foreground">
                      {activeContextLabel}
                    </p>
                  </div>
                </div>
              )}

              {navigation({ onNavigate: () => setMobileOpen(false) })}

              <div className="border-t border-primary/10 p-3 space-y-1">
                <div className="flex items-center gap-2 rounded-2xl px-3 py-1.5">
                  <AnimatedThemeToggle className="size-8" />
                  <span className="text-sm text-muted-foreground">Theme</span>
                </div>
                <SignOutButton signOutOptions={{ redirectUrl: '/portals' }}>
                  <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-500">
                    <LogOut className="size-5 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </SignOutButton>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/admin" className="flex min-w-0 items-center gap-2">
          <div className="size-8 overflow-hidden rounded-lg">
            <Image
              src="/angel_pink.png"
              alt="Angel Touch"
              width={650}
              height={731}
              className="size-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-sm font-semibold text-primary">Admin Portal</span>
            {activeItem && (
              <span className="block truncate text-xs text-muted-foreground">{activeItem.title}</span>
            )}
          </div>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <CommandPaletteTrigger compact />
          <QuickActionsMenu actions={quickActions} compact />
          <NotificationBell />
        </div>
      </div>

      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 overflow-visible border-r border-primary/40 bg-linear-to-b from-primary/10 via-background to-background transition-all duration-300 lg:flex lg:flex-col',
          collapsed ? 'w-28' : 'w-80'
        )}
      >
        <div className={cn('border-b border-primary/20 px-4 py-4', collapsed && 'px-3')}>
          {collapsed ? (
            <div className="flex flex-col items-center gap-3">
              <Link href="/admin" className="flex justify-center">
                <div className="size-12 overflow-hidden rounded-2xl border border-primary/15 bg-background/80 shadow-sm ring-1 ring-primary/10">
                  <Image
                    src="/angel_pink.png"
                    alt="Angel Touch"
                    width={650}
                    height={731}
                    className="size-full object-contain"
                  />
                </div>
              </Link>

              <div className="grid w-full grid-cols-2 gap-2 rounded-2xl border border-border/50 bg-background/60 p-1.5">
                <SidebarTooltip label="Notifications">
                  <div className="flex justify-center">
                    <NotificationBell />
                  </div>
                </SidebarTooltip>
                <SidebarTooltip label="Expand sidebar">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateSidebarCollapsedPreference(!collapsed)}
                    className="hover:bg-primary/10"
                    aria-label="Expand sidebar"
                  >
                    <Menu className="size-5" />
                  </Button>
                </SidebarTooltip>
              </div>

              <div className="grid w-full grid-cols-2 gap-2 rounded-2xl border border-border/50 bg-background/60 p-1.5">
                <CommandPaletteTrigger compact />
                <SidebarTooltip label="Quick actions">
                  <div className="flex justify-center">
                    <QuickActionsMenu actions={quickActions} compact />
                  </div>
                </SidebarTooltip>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <Link href="/admin" className="flex min-w-0 items-center gap-3">
                <div className="size-10 overflow-hidden rounded-xl ring-1 ring-primary/10">
                  <Image
                    src="/angel_pink.png"
                    alt="Angel Touch"
                    width={650}
                    height={731}
                    className="size-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <span className="block truncate font-semibold text-primary">Admin Portal</span>
                  {activeItem && (
                    <span className="block truncate text-xs text-muted-foreground">{activeItem.title}</span>
                  )}
                </div>
              </Link>

              <div className="flex items-center gap-1">
                <NotificationBell />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => updateSidebarCollapsedPreference(!collapsed)}
                  className="hover:bg-primary/10"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft className="size-5" />
                </Button>
              </div>
            </div>
          )}

          {!collapsed && activeContextLabel && (
            <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/5 px-3 py-2.5">
              <p className="truncate text-sm font-medium text-foreground">
                {activeContextLabel}
              </p>
            </div>
          )}

          {!collapsed && (
            <div className="mt-4 flex flex-col gap-2">
              <CommandPaletteTrigger className="flex-1" />
              <SidebarTooltip label="Quick actions" disabled>
                <div className="w-full">
                  <QuickActionsMenu actions={quickActions} />
                </div>
              </SidebarTooltip>
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          {navigation({ compact: collapsed })}
          <div className="border-t border-primary/10 p-3 space-y-1">
            <SidebarTooltip label="Theme" disabled={!collapsed}>
              <div className={cn('flex items-center rounded-2xl px-3 py-1.5', collapsed ? 'justify-center' : 'gap-2')}>
                <AnimatedThemeToggle className="size-8" />
                {!collapsed && <span className="text-sm text-muted-foreground">Theme</span>}
              </div>
            </SidebarTooltip>
            <SidebarTooltip label="Sign Out" disabled={!collapsed}>
              <SignOutButton signOutOptions={{ redirectUrl: '/portals' }}>
                <button
                  className={cn(
                    'flex w-full items-center rounded-2xl px-3 py-2.5 text-sm font-medium transition-all',
                    collapsed ? 'justify-center' : 'gap-3',
                    'text-muted-foreground hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-500'
                  )}
                >
                  <LogOut className="size-5 shrink-0" />
                  {!collapsed && <span>Sign Out</span>}
                </button>
              </SignOutButton>
            </SidebarTooltip>
          </div>
        </div>
      </aside>
    </>
  );
}