'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { isFeatureEnabled } from '@/lib/feature-flags';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  HelpCircle,
  Star,
  Briefcase,
  ChevronLeft,
  Menu,
  Users,
  UserCheck,
  Calendar,
  ClipboardCheck,
  LogOut,
  DollarSign,
  Shield,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { useState } from 'react';
import { SignOutButton } from '@clerk/nextjs';
import { NotificationBell } from './notification-bell';
import { CommandPaletteTrigger } from './command-palette';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  demoOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  // Demo Portal Items
  {
    title: 'Workers',
    href: '/admin/workers',
    icon: Users,
    demoOnly: true,
  },
  {
    title: 'Clients',
    href: '/admin/clients',
    icon: UserCheck,
    demoOnly: true,
  },
  {
    title: 'Shifts',
    href: '/admin/shifts',
    icon: Calendar,
    demoOnly: true,
  },
  {
    title: 'Timesheets',
    href: '/admin/timesheets',
    icon: ClipboardCheck,
    demoOnly: true,
  },
  {
    title: 'Payroll',
    href: '/admin/payroll',
    icon: DollarSign,
    demoOnly: true,
  },
  {
    title: 'Compliance',
    href: '/admin/compliance',
    icon: FileText,
    demoOnly: true,
  },
  {
    title: 'Reviews',
    href: '/admin/reviews',
    icon: Star,
    demoOnly: true,
  },
  // Standard Items
  {
    title: 'Jobs',
    href: '/admin/jobs',
    icon: Briefcase,
  },
  {
    title: 'Applications',
    href: '/admin/applications',
    icon: FileText,
  },
  {
    title: 'Contacts',
    href: '/admin/contacts',
    icon: MessageSquare,
  },
  {
    title: 'Inquiries',
    href: '/admin/inquiries',
    icon: HelpCircle,
  },
  {
    title: 'Testimonials',
    href: '/admin/testimonials',
    icon: Star,
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    title: 'Activity Log',
    href: '/admin/audit-log',
    icon: Shield,
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Filter demo-only items based on feature flag
  const demoEnabled = isFeatureEnabled('workerManagement');
  const filteredNavItems = navItems.filter(
    (item) => !item.demoOnly || demoEnabled
  );

  // Shared nav content
  const navContent = (onNavigate?: () => void) => (
    <>
      {/* Command Palette Trigger */}
      <div className="p-3 pb-0">
        <CommandPaletteTrigger />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground'
              )}
            >
              <item.icon className={cn('size-5 shrink-0', isActive && 'text-primary')} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 mt-auto">
        <SignOutButton signOutOptions={{ redirectUrl: '/portals' }}>
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-red-500/10 text-muted-foreground hover:text-red-600 dark:hover:text-red-500"
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
      {/* Mobile Header Bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-primary/20 bg-primary/5 px-4 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0" showCloseButton={false}>
            <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
            <div className="flex h-full flex-col">
              {/* Mobile Drawer Header */}
              <div className="flex h-14 items-center border-b border-primary/20 px-4">
                <Link href="/admin" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <div className="size-9 overflow-hidden rounded-lg">
                    <Image
                      src="/angel_pink.png"
                      alt="Angel Touch"
                      width={200}
                      height={200}
                      className="size-[250%] max-w-none -translate-x-[30%] -translate-y-[28%]"
                    />
                  </div>
                  <span className="font-semibold text-primary">Admin Portal</span>
                </Link>
              </div>
              {navContent(() => setMobileOpen(false))}
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/admin" className="flex items-center gap-2">
          <div className="size-8 overflow-hidden rounded-lg">
            <Image
              src="/angel_pink.png"
              alt="Angel Touch"
              width={200}
              height={200}
              className="size-[250%] max-w-none -translate-x-[30%] -translate-y-[28%]"
            />
          </div>
          <span className="font-semibold text-primary text-sm">Admin</span>
        </Link>
        <div className="ml-auto">
          <NotificationBell />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'sticky top-0 h-screen bg-primary/5 border-r border-primary/40 flex-col transition-all duration-300 hidden md:flex',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-primary/20 px-4">
          <Link href="/admin" className="flex items-center gap-2">
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
              <span className="font-semibold text-primary">Admin Portal</span>
            )}
          </Link>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className={cn('hover:bg-primary/10', collapsed && 'ml-auto')}
            >
              {collapsed ? <Menu className="size-5" /> : <ChevronLeft className="size-5" />}
            </Button>
          </div>
        </div>

        {/* Command Palette Trigger */}
        {!collapsed && (
          <div className="p-3 pb-0">
            <CommandPaletteTrigger />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary/15 text-primary border border-primary/30'
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className={cn('size-5 shrink-0', isActive && 'text-primary')} />
                {!collapsed && <span>{item.title}</span>}
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
    </>
  );
}
