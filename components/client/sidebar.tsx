'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  Menu,
  LogOut,
  Star,
  MessageSquareHeart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';
import { SignOutButton } from '@clerk/nextjs';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/client',
    icon: LayoutDashboard,
  },
  {
    title: 'Schedule',
    href: '/client/schedule',
    icon: Calendar,
  },
  {
    title: 'Care Team',
    href: '/client/care-team',
    icon: Users,
  },
  {
    title: 'Invoices',
    href: '/client/invoices',
    icon: FileText,
  },
  {
    title: 'Reviews',
    href: '/client/reviews',
    icon: Star,
  },
  {
    title: 'Testimonials',
    href: '/client/testimonials',
    icon: MessageSquareHeart,
  },
  {
    title: 'Settings',
    href: '/client/settings',
    icon: Settings,
  },
];

export function ClientSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (onNavigate?: () => void) => (
    <>
      <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/client' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sky-500/15 text-sky-700 dark:text-sky-400'
                  : 'text-muted-foreground hover:bg-sky-500/10 hover:text-foreground'
              )}
            >
              <item.icon className="size-5 shrink-0" />
              <span className="flex-1">{item.title}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="rounded-full bg-sky-500 px-2 py-0.5 text-xs text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sky-500/20 p-3">
        <SignOutButton signOutOptions={{ redirectUrl: '/portals' }}>
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600"
          >
            <LogOut className="size-5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </SignOutButton>
      </div>
    </>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-sky-500/20 bg-sky-500/5 px-4 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-sky-500/10">
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(22rem,92vw)] p-0" showCloseButton={false}>
            <SheetTitle className="sr-only">Family Portal Navigation</SheetTitle>
            <div className="flex h-full flex-col bg-background">
              <div className="flex h-14 items-center border-b border-sky-500/20 px-4">
                <Link href="/client" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <div className="size-9 overflow-hidden rounded-lg">
                    <Image
                      src="/angel_pink.png"
                      alt="Angel Touch"
                      width={200}
                      height={200}
                      className="size-[250%] max-w-none -translate-x-[30%] -translate-y-[28%]"
                    />
                  </div>
                  <span className="font-semibold text-sky-600 dark:text-sky-500">Family Portal</span>
                </Link>
              </div>
              {navContent(() => setMobileOpen(false))}
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/client" className="flex items-center gap-2 min-w-0">
          <div className="size-8 overflow-hidden rounded-lg">
            <Image
              src="/angel_pink.png"
              alt="Angel Touch"
              width={200}
              height={200}
              className="size-[250%] max-w-none -translate-x-[30%] -translate-y-[28%]"
            />
          </div>
          <span className="truncate font-semibold text-sky-600 dark:text-sky-500">Family Portal</span>
        </Link>
      </div>

      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 overflow-hidden border-r border-sky-500/40 bg-sky-500/5 transition-all duration-300 lg:flex lg:flex-col',
          collapsed ? 'w-20' : 'w-72'
        )}
      >
        <div className={cn('flex h-16 items-center border-b border-sky-500/20 px-4', collapsed ? 'justify-center' : 'justify-between')}>
          <Link href="/client" className={cn('flex min-w-0 items-center gap-2', collapsed && 'justify-center')}>
            <div className="size-9 overflow-hidden rounded-lg">
              <Image
                src="/angel_pink.png"
                alt="Angel Touch"
                width={200}
                height={200}
                className="size-[250%] max-w-none -translate-x-[30%] -translate-y-[28%]"
              />
            </div>
            {!collapsed && (
              <span className="truncate font-semibold text-sky-600 dark:text-sky-500">Family Portal</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn('hover:bg-sky-500/10', collapsed && 'absolute right-3')}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <Menu className="size-5" /> : <ChevronLeft className="size-5" />}
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/client' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sky-500/15 text-sky-700 dark:text-sky-400'
                    : 'text-muted-foreground hover:bg-sky-500/10 hover:text-foreground',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className="size-5 shrink-0" />
                {!collapsed && <span className="flex-1">{item.title}</span>}
                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="rounded-full bg-sky-500 px-2 py-0.5 text-xs text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sky-500/20 p-3">
          <SignOutButton signOutOptions={{ redirectUrl: '/portals' }}>
            <button
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                'text-muted-foreground hover:bg-red-500/10 hover:text-red-600',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? 'Sign Out' : undefined}
            >
              <LogOut className="size-5 shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </SignOutButton>
        </div>
      </aside>
    </>
  );
}
