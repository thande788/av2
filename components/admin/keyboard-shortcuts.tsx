'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Shortcut {
  keys: string;
  description: string;
  category: string;
}

const SHORTCUTS: Shortcut[] = [
  // Global
  { keys: '⌘ K', description: 'Open command palette', category: 'Global' },
  { keys: '?', description: 'Show keyboard shortcuts', category: 'Global' },
  { keys: 'G D', description: 'Go to Dashboard', category: 'Navigation' },
  { keys: 'G A', description: 'Go to Applications', category: 'Navigation' },
  { keys: 'G J', description: 'Go to Jobs', category: 'Navigation' },
  { keys: 'G C', description: 'Go to Contacts', category: 'Navigation' },
  { keys: 'G I', description: 'Go to Inquiries', category: 'Navigation' },
  { keys: 'G T', description: 'Go to Testimonials', category: 'Navigation' },
  { keys: 'G N', description: 'Go to Analytics', category: 'Navigation' },
  { keys: 'G L', description: 'Go to Activity Log', category: 'Navigation' },
  { keys: 'G U', description: 'Go to User Management', category: 'Navigation' },
  // Table
  { keys: 'J', description: 'Next row', category: 'Table Navigation' },
  { keys: 'K', description: 'Previous row', category: 'Table Navigation' },
  { keys: 'Enter', description: 'Open selected row', category: 'Table Navigation' },
  { keys: '/', description: 'Focus search', category: 'Table Navigation' },
  { keys: 'Escape', description: 'Clear selection / close', category: 'Table Navigation' },
];

/**
 * Shortcuts help dialog — shows available keyboard shortcuts.
 * Listens for custom `open-shortcuts-help` event dispatched by command palette.
 */
export function ShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    document.addEventListener('open-shortcuts-help', handleOpen);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger on '?' when not in an input/textarea
      if (e.key === '?' && !isInputFocused()) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('open-shortcuts-help', handleOpen);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const categories = [...new Set(SHORTCUTS.map((s) => s.category))];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 max-h-[60vh] overflow-y-auto py-2">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                {category}
              </h3>
              <div className="space-y-1">
                {SHORTCUTS.filter((s) => s.category === category).map((shortcut) => (
                  <div
                    key={shortcut.keys}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm"
                  >
                    <span className="text-foreground">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.split(' ').map((key, i) => (
                        <kbd
                          key={i}
                          className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook that registers global navigation shortcuts (G + key sequences).
 * Place in admin layout to enable portal-wide shortcuts.
 */
export function useAdminShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const [gPressed, setGPressed] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isInputFocused()) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const navMap: Record<string, string> = {
        d: '/admin',
        a: '/admin/applications',
        j: '/admin/jobs',
        c: '/admin/contacts',
        i: '/admin/inquiries',
        t: '/admin/testimonials',
        n: '/admin/analytics',
        l: '/admin/audit-log',
        u: '/admin/users',
      };

      // G + key navigation
      if (gPressed) {
        setGPressed(false);
        const target = navMap[e.key.toLowerCase()];
        if (target && target !== pathname) {
          e.preventDefault();
          router.push(target);
        }
        return;
      }

      if (e.key === 'g') {
        setGPressed(true);
        // Reset after 1 second
        setTimeout(() => setGPressed(false), 1000);
        return;
      }

      // '/' to focus search input
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          '[data-slot="table-search"]'
        );
        searchInput?.focus();
      }
    },
    [gPressed, pathname, router]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Client component that enables admin-wide keyboard shortcuts.
 */
export function AdminShortcuts() {
  useAdminShortcuts();
  return <ShortcutsHelp />;
}

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    (el as HTMLElement).isContentEditable
  );
}
