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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen bg-emerald-500/5 border-r border-emerald-500/40 flex flex-col transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-emerald-500/20 px-4">
        <Link href="/employee" className="flex items-center gap-2">
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
            <span className="font-semibold text-emerald-600 dark:text-emerald-500">Employee Portal</span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn('hover:bg-emerald-500/10', collapsed && 'ml-auto')}
        >
          {collapsed ? <Menu className="size-5" /> : <ChevronLeft className="size-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/employee' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-500 border border-emerald-500/30'
                  : 'text-muted-foreground hover:bg-emerald-500/10 hover:text-foreground',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className={cn('size-5 shrink-0', isActive && 'text-emerald-600 dark:text-emerald-500')} />
              {!collapsed && <span>{item.title}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-500">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 mt-auto">
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
    </aside>
  );
}
