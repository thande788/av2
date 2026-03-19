'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Get unread in-app notification count for the current user
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const { userId } = await auth();
  if (!userId) return 0;

  return db.notification.count({
    where: {
      userId,
      channel: 'IN_APP',
      readAt: null,
    },
  });
}

/**
 * Get recent in-app notifications for the current user
 */
export async function getRecentNotifications(limit = 10) {
  const { userId } = await auth();
  if (!userId) return [];

  return db.notification.findMany({
    where: {
      userId,
      channel: 'IN_APP',
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(notificationId: string) {
  const { userId } = await auth();
  if (!userId) return;

  await db.notification.update({
    where: { id: notificationId, userId },
    data: { readAt: new Date() },
  });

  revalidatePath('/admin');
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead() {
  const { userId } = await auth();
  if (!userId) return;

  await db.notification.updateMany({
    where: {
      userId,
      channel: 'IN_APP',
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  revalidatePath('/admin');
}

/**
 * Create an in-app notification for a user
 */
export async function createInAppNotification({
  userId,
  type,
  title,
  body,
  data,
}: {
  userId: string;
  type: 'SHIFT_AVAILABLE' | 'SHIFT_BOOKED' | 'SHIFT_CANCELLED' | 'DOCUMENT_EXPIRING' | 'TIMESHEET_DUE' | 'GENERAL';
  title: string;
  body: string;
  data?: Record<string, unknown>;
}) {
  await db.notification.create({
    data: {
      userId,
      channel: 'IN_APP',
      type,
      title,
      body,
      data: data ? JSON.parse(JSON.stringify(data)) : undefined,
      status: 'DELIVERED',
      deliveredAt: new Date(),
    },
  });
}
