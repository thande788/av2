'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  User,
  Settings,
  ChevronLeft,
  Menu,
  LogOut,
  FileCheck,
  BarChart3,
  CalendarClock,
  ArrowRightLeft,
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
    href: '/employee',
    icon: LayoutDashboard,
  },
  {
    title: 'My Shifts',
    href: '/employee/shifts',
    icon: Calendar,
  },
  {
    title: 'Availability',
    href: '/employee/availability',
    icon: CalendarClock,
  },
  {
    title: 'Timesheets',
    href: '/employee/timesheets',
    icon: Clock,
  },
  {
    title: 'Compliance',
    href: '/employee/compliance',
    icon: FileCheck,
  },
  {
    title: 'Shift Swaps',
    href: '/employee/swaps',
    icon: ArrowRightLeft,
  },
  {
    title: 'My Reviews',
    href: '/employee/reviews',
    icon: BarChart3,
  },
  {
    title: 'Profile',
    href: '/employee/profile',
    icon: User,
  },
  {
    title: 'Settings',
    href: '/employee/settings',
    icon: Settings,
  },
];

export function EmployeeSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = (options?: { onNavigate?: () => void; compact?: boolean }) => (
      <nav className="min-h-0 flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/employee' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={options?.onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-500 border border-emerald-500/30'
                  : 'text-muted-foreground hover:bg-emerald-500/10 hover:text-foreground',
                options?.compact && 'justify-center px-2'
              )}
              title={options?.compact ? item.title : undefined}
            >
              <item.icon className={cn('size-5 shrink-0', isActive && 'text-emerald-600 dark:text-emerald-500')} />
              {!options?.compact && <span>{item.title}</span>}
              {!options?.compact && item.badge && (
                <span className="ml-auto rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-500">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-emerald-500/20 bg-emerald-500/5 px-4 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-emerald-500/10">
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(22rem,92vw)] p-0" showCloseButton={false}>
            <SheetTitle className="sr-only">Employee Portal Navigation</SheetTitle>
            <div className="flex h-full flex-col bg-background">
              <div className="flex h-14 items-center border-b border-emerald-500/20 px-4">
                <Link href="/employee" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <div className="size-9 overflow-hidden rounded-lg">
                    <Image
                      src="/angel_pink.png"
                      alt="Angel Touch"
                      width={650}
                      height={731}
                      className="size-full object-contain"
                    />
                  </div>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-500">Employee Portal</span>
                </Link>
              </div>
              {navLinks({ onNavigate: () => setMobileOpen(false) })}
              <div className="p-3 mt-auto border-t border-emerald-500/20">
                <SignOutButton signOutOptions={{ redirectUrl: '/portals' }}>
                  <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-red-500/10 text-muted-foreground hover:text-red-600 dark:hover:text-red-500">
                    <LogOut className="size-5 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </SignOutButton>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/employee" className="flex min-w-0 items-center gap-2">
          <div className="size-8 overflow-hidden rounded-lg">
            <Image
              src="/angel_pink.png"
              alt="Angel Touch"
              width={650}
              height={731}
              className="size-full object-contain"
            />
          </div>
          <span className="truncate font-semibold text-emerald-600 dark:text-emerald-500">Employee Portal</span>
        </Link>
      </div>

      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 overflow-hidden border-r border-emerald-500/40 bg-emerald-500/5 transition-all duration-300 lg:flex lg:flex-col',
          collapsed ? 'w-20' : 'w-72'
        )}
      >
        <div className={cn('relative flex h-16 items-center border-b border-emerald-500/20 px-4', collapsed ? 'justify-center' : 'justify-between')}>
          <Link href="/employee" className={cn('flex items-center gap-2', collapsed && 'justify-center')}>
          <div className="size-9 overflow-hidden rounded-lg">
            <Image
              src="/angel_pink.png"
              alt="Angel Touch"
              width={650}
              height={731}
              className="size-full object-contain"
            />
          </div>
          {!collapsed && (
            <span className="font-semibold text-emerald-600 dark:text-emerald-500">Employee Portal</span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn('hover:bg-emerald-500/10', collapsed && 'absolute right-3')}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <Menu className="size-5" /> : <ChevronLeft className="size-5" />}
        </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          {navLinks({ compact: collapsed })}
          <div className="border-t border-emerald-500/20 p-3">
            <SignOutButton signOutOptions={{ redirectUrl: '/portals' }}>
              <button
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  'hover:bg-red-500/10 text-muted-foreground hover:text-red-600 dark:hover:text-red-500',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? 'Sign Out' : undefined}
              >
                <LogOut className="size-5 shrink-0" />
                {!collapsed && <span>Sign Out</span>}
              </button>
            </SignOutButton>
          </div>
        </div>
      </aside>
    </>
  );
}
