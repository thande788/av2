'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Keyboard, Moon, Search, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';
import { isFeatureEnabled } from '@/lib/feature-flags';
import {
  getVisibleAdminNavSections,
  getVisibleAdminQuickActions,
} from './navigation-config';

interface PaletteItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  group: string;
  keywords?: string[];
  shortcut?: string;
}

function isMacPlatform(): boolean {
  return typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');
}

export function toggleAdminCommandPalette() {
  if (typeof document === 'undefined') {
    return;
  }

  document.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: isMacPlatform(),
      ctrlKey: !isMacPlatform(),
      bubbles: true,
    })
  );
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const navigationSections = getVisibleAdminNavSections(isFeatureEnabled);
  const navigationItems: PaletteItem[] = navigationSections.flatMap((section) =>
    section.items.map((item) => ({
      id: item.id,
      title: item.title,
      icon: item.icon,
      action: () => navigate(item.href),
      group: section.title,
      keywords: item.keywords,
      shortcut: item.shortcut,
    }))
  );

  const quickActions: PaletteItem[] = getVisibleAdminQuickActions(isFeatureEnabled).map((action) => ({
    id: action.id,
    title: action.title,
    icon: action.icon,
    action: () => navigate(action.href),
    group: 'Quick Actions',
    keywords: action.keywords,
  }));

  const themeActions: PaletteItem[] = [
    {
      id: 'light-mode',
      title: 'Switch to Light Mode',
      icon: Sun,
      action: () => {
        setTheme('light');
        setOpen(false);
      },
      group: 'Appearance',
      keywords: ['theme', 'light', 'bright'],
    },
    {
      id: 'dark-mode',
      title: 'Switch to Dark Mode',
      icon: Moon,
      action: () => {
        setTheme('dark');
        setOpen(false);
      },
      group: 'Appearance',
      keywords: ['theme', 'dark', 'night'],
    },
  ];

  const helpActions: PaletteItem[] = [
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

  const allItems = [...navigationItems, ...quickActions, ...themeActions, ...helpActions];
  const groups = [
    ...navigationSections.map((section) => section.title),
    'Quick Actions',
    'Appearance',
    'Help',
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Command Palette">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {groups.map((group, index) => {
          const items = allItems.filter((item) => item.group === group);
          if (items.length === 0) {
            return null;
          }

          return (
            <div key={group}>
              {index > 0 && <CommandSeparator />}
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

export function CommandPaletteTrigger({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const isMac = isMacPlatform();

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleAdminCommandPalette}
        className={cn('hover:bg-primary/10', className)}
        aria-label="Open command palette"
      >
        <Search className="size-5" />
      </Button>
    );
  }

  return (
    <button
      onClick={toggleAdminCommandPalette}
      className={cn(
        'flex h-11 w-full items-center gap-2 rounded-2xl border border-border/50 bg-muted/30 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground',
        className
      )}
    >
      <Search className="size-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate text-left whitespace-nowrap">
        Search or jump...
      </span>
      <kbd className="pointer-events-none hidden h-5 shrink-0 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">{isMac ? '⌘' : 'Ctrl'}</span>K
      </kbd>
    </button>
  );
}