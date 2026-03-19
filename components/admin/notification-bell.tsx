'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDateUS } from '@/lib/utils';
import {
  getUnreadNotificationCount,
  getRecentNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/app/actions/notifications';
import type { Notification } from '@prisma/client';

const typeIcons: Record<string, string> = {
  SHIFT_AVAILABLE: '📅',
  SHIFT_BOOKED: '✅',
  SHIFT_CANCELLED: '❌',
  DOCUMENT_EXPIRING: '⚠️',
  TIMESHEET_DUE: '📋',
  GENERAL: '📢',
};

export function NotificationBell() {
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch count periodically
  const fetchCount = useCallback(async () => {
    try {
      const c = await getUnreadNotificationCount();
      setCount(c);
    } catch {
      // Silently ignore
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchCount]);

  const handleOpen = async () => {
    if (!open) {
      setLoading(true);
      try {
        const notifs = await getRecentNotifications(15);
        setNotifications(notifs);
      } catch {
        // Silently ignore
      } finally {
        setLoading(false);
      }
    }
    setOpen(!open);
  };

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date() } : n))
    );
    setCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt || new Date() }))
    );
    setCount(0);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpen}
        className="relative hover:bg-primary/10"
        aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
      >
        <Bell className="size-5" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-xl border border-border bg-background shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="font-semibold text-sm">Notifications</h3>
              <div className="flex items-center gap-1">
                {count > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllRead}
                    className="h-7 text-xs"
                  >
                    <CheckCheck className="size-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  className="size-7"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            </div>

            {/* Body */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
                  <Bell className="size-8 mb-2 opacity-30" />
                  No notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      'flex items-start gap-3 border-b border-border/50 px-4 py-3 transition-colors last:border-0',
                      !notif.readAt && 'bg-primary/5'
                    )}
                  >
                    <span className="text-base mt-0.5">
                      {typeIcons[notif.type] || '📢'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm', !notif.readAt && 'font-medium')}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notif.body}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {formatDateUS(notif.createdAt, 'datetime')}
                      </p>
                    </div>
                    {!notif.readAt && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMarkRead(notif.id)}
                        className="size-6 shrink-0"
                        aria-label="Mark as read"
                      >
                        <Check className="size-3" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t px-4 py-2 text-center">
                <Badge variant="secondary" className="text-xs">
                  {count} unread
                </Badge>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
