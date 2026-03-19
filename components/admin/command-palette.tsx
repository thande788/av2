'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { isFeatureEnabled } from '@/lib/feature-flags';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  HelpCircle,
  Star,
  Briefcase,
  Users,
  UserCheck,
  Calendar,
  ClipboardCheck,
  DollarSign,
  Shield,
  BarChart3,
  Plus,
  Search,
  Moon,
  Sun,
  Keyboard,
  Layers,
  CircleHelp,
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface CommandItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  group: string;
  keywords?: string[];
  shortcut?: string;
  demoOnly?: boolean;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();
  const demoEnabled = isFeatureEnabled('workerManagement');

  // Open with Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  const navigationItems: CommandItem[] = [
    { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, action: () => navigate('/admin'), group: 'Navigation', shortcut: 'G D' },
    { id: 'workers', title: 'Workers', icon: Users, action: () => navigate('/admin/workers'), group: 'Navigation', demoOnly: true },
    { id: 'clients', title: 'Clients', icon: UserCheck, action: () => navigate('/admin/clients'), group: 'Navigation', demoOnly: true },
    { id: 'shifts', title: 'Shifts', icon: Calendar, action: () => navigate('/admin/shifts'), group: 'Navigation', demoOnly: true },
    { id: 'timesheets', title: 'Timesheets', icon: ClipboardCheck, action: () => navigate('/admin/timesheets'), group: 'Navigation', demoOnly: true },
    { id: 'payroll', title: 'Payroll', icon: DollarSign, action: () => navigate('/admin/payroll'), group: 'Navigation', demoOnly: true },
    { id: 'jobs', title: 'Jobs', icon: Briefcase, action: () => navigate('/admin/jobs'), group: 'Navigation' },
    { id: 'applications', title: 'Applications', icon: FileText, action: () => navigate('/admin/applications'), group: 'Navigation' },
    { id: 'contacts', title: 'Contacts', icon: MessageSquare, action: () => navigate('/admin/contacts'), group: 'Navigation' },
    { id: 'inquiries', title: 'Inquiries', icon: HelpCircle, action: () => navigate('/admin/inquiries'), group: 'Navigation' },
    { id: 'testimonials', title: 'Testimonials', icon: Star, action: () => navigate('/admin/testimonials'), group: 'Navigation' },
    { id: 'faqs', title: 'FAQs', icon: CircleHelp, action: () => navigate('/admin/faqs'), group: 'Navigation' },
    { id: 'services', title: 'Services', icon: Layers, action: () => navigate('/admin/services'), group: 'Navigation' },
    { id: 'analytics', title: 'Analytics', icon: BarChart3, action: () => navigate('/admin/analytics'), group: 'Navigation' },
    { id: 'audit-log', title: 'Activity Log', icon: Shield, action: () => navigate('/admin/audit-log'), group: 'Navigation' },
    { id: 'user-management', title: 'User Management', icon: Users, action: () => navigate('/admin/users'), group: 'Navigation' },
  ];

  const quickActions: CommandItem[] = [
    { id: 'new-job', title: 'Create New Job', icon: Plus, action: () => navigate('/admin/jobs/new'), group: 'Quick Actions', keywords: ['add', 'create', 'job'] },
    { id: 'new-shift', title: 'Create New Shift', icon: Plus, action: () => navigate('/admin/shifts/new'), group: 'Quick Actions', keywords: ['add', 'schedule'], demoOnly: true },
    { id: 'new-faq', title: 'Create New FAQ', icon: Plus, action: () => navigate('/admin/faqs/new'), group: 'Quick Actions', keywords: ['add', 'create', 'faq', 'question'] },
    { id: 'new-testimonial', title: 'Add Testimonial', icon: Plus, action: () => navigate('/admin/testimonials/new'), group: 'Quick Actions', keywords: ['add', 'create', 'testimonial', 'review'] },
    { id: 'new-service-category', title: 'Add Service Category', icon: Plus, action: () => navigate('/admin/services/new'), group: 'Quick Actions', keywords: ['add', 'create', 'service', 'category'] },
  ];

  const themeActions: CommandItem[] = [
    {
      id: 'light-mode',
      title: 'Switch to Light Mode',
      icon: Sun,
      action: () => { setTheme('light'); setOpen(false); },
      group: 'Appearance',
      keywords: ['theme', 'light', 'bright'],
    },
    {
      id: 'dark-mode',
      title: 'Switch to Dark Mode',
      icon: Moon,
      action: () => { setTheme('dark'); setOpen(false); },
      group: 'Appearance',
      keywords: ['theme', 'dark', 'night'],
    },
  ];

  const helpActions: CommandItem[] = [
    {
      id: 'shortcuts',
      title: 'Keyboard Shortcuts',
      icon: Keyboard,
      action: () => {
        setOpen(false);
        document.dispatchEvent(new CustomEvent('open-shortcuts-help'));
      },
      group: 'Help',
      shortcut: '?',
    },
  ];

  const allItems = [...navigationItems, ...quickActions, ...themeActions, ...helpActions]
    .filter((item) => !item.demoOnly || demoEnabled);

  const groups = ['Navigation', 'Quick Actions', 'Appearance', 'Help'];

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Command Palette">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {groups.map((group, i) => {
          const items = allItems.filter((item) => item.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group}>
              {i > 0 && <CommandSeparator />}
              <CommandGroup heading={group}>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={item.action}
                    keywords={item.keywords}
                  >
                    <item.icon className="mr-2 size-4" />
                    <span>{item.title}</span>
                    {item.shortcut && (
                      <CommandShortcut>{item.shortcut}</CommandShortcut>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}

/**
 * Trigger button to open the command palette.
 * Can be placed in sidebar or header.
 */
export function CommandPaletteTrigger() {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');

  return (
    <button
      onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: isMac, ctrlKey: !isMac }))}
      className="flex w-full items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
    >
      <Search className="size-4" />
      <span className="flex-1 text-left">Search...</span>
      <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">{isMac ? '⌘' : 'Ctrl'}</span>K
      </kbd>
    </button>
  );
}
