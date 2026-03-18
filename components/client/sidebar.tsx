'use client';

import Link from 'next/link';
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
    title: 'Settings',
    href: '/client/settings',
    icon: Settings,
  },
];

export function ClientSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen bg-sky-500/5 border-r border-sky-500/40 flex flex-col transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-4">
        {!collapsed && (
          <Link href="/client" className="font-semibold text-lg text-sky-600 dark:text-sky-500">
            Family Portal
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn('hover:bg-sky-500/10', collapsed && 'mx-auto')}
        >
          {collapsed ? <Menu className="size-5" /> : <ChevronLeft className="size-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
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
            >
              <item.icon className="size-5 shrink-0" />
              {!collapsed && (
                <span className="flex-1">{item.title}</span>
              )}
              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="rounded-full bg-sky-500 px-2 py-0.5 text-xs text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sky-500/20 p-3">
        <SignOutButton>
          <button
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              'text-muted-foreground hover:bg-red-500/10 hover:text-red-600',
              collapsed && 'justify-center px-2'
            )}
          >
            <LogOut className="size-5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}
