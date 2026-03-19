'use server';

import { db } from '@/lib/db';
import { twilio } from '@/lib/twilio';
import { formatDateUS } from '@/lib/utils';

/**
 * Send shift reminders to workers.
 * Call this from a cron job (e.g., Vercel Cron or external scheduler).
 *
 * - Day-before reminder: sent at ~6 PM the day before
 * - One-hour reminder: sent ~1 hour before shift start
 */
export async function sendShiftReminders(
  type: 'day-before' | 'one-hour'
): Promise<{ sent: number; failed: number; skipped: number }> {
  const now = new Date();
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  if (type === 'day-before') {
    // Find shifts scheduled for tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    const shifts = await db.careShift.findMany({
      where: {
        date: { equals: new Date(tomorrowStr) },
        status: { in: ['BOOKED', 'PENDING_BOOK'] },
      },
      include: {
        client: {
          include: { user: true },
        },
        bookings: {
          where: { status: { in: ['ACCEPTED', 'CONFIRMED'] } },
          include: {
            worker: { include: { user: true } },
          },
        },
      },
    });

    for (const shift of shifts) {
      for (const booking of shift.bookings) {
        if (!booking.worker.user.phone) {
          skipped++;
          continue;
        }

        const clientName =
          shift.client.careRecipientName ||
          `${shift.client.user.firstName} ${shift.client.user.lastName}`;

        const message =
          `Reminder: You have a shift tomorrow.\n\n` +
          `📅 ${formatDateUS(shift.date, 'weekday-long')}\n` +
          `⏰ ${shift.startTime} - ${shift.endTime}\n` +
          `👤 Client: ${clientName}\n` +
          `📍 ${shift.client.city}, ${shift.client.state}\n\n` +
          `— Angel Touch Homecare`;

        const result = await twilio.sendSMS({
          to: booking.worker.user.phone,
          body: message,
        });

        if (result.success) {
          // Log notification
          await db.notification.create({
            data: {
              userId: booking.worker.userId,
              channel: 'SMS',
              type: 'SHIFT_REMINDER',
              title: 'Shift Reminder',
              body: `Reminder for shift on ${formatDateUS(shift.date, 'medium')}`,
              data: { shiftId: shift.id, reminderType: 'day-before' },
              status: 'SENT',
              sentAt: new Date(),
              twilioSid: result.messageId,
            },
          });
          sent++;
        } else {
          failed++;
        }

        // Rate limit
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  } else if (type === 'one-hour') {
    // Find shifts starting in ~1 hour
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const targetHour = `${String(oneHourFromNow.getUTCHours()).padStart(2, '0')}:00`;
    const todayStr = now.toISOString().slice(0, 10);

    const shifts = await db.careShift.findMany({
      where: {
        date: { equals: new Date(todayStr) },
        startTime: targetHour,
        status: { in: ['BOOKED', 'PENDING_BOOK'] },
      },
      include: {
        client: {
          include: { user: true },
        },
        bookings: {
          where: { status: { in: ['ACCEPTED', 'CONFIRMED'] } },
          include: {
            worker: { include: { user: true } },
          },
        },
      },
    });

    for (const shift of shifts) {
      for (const booking of shift.bookings) {
        if (!booking.worker.user.phone) {
          skipped++;
          continue;
        }

        const message =
          `⏰ Your shift starts in 1 hour!\n\n` +
          `📍 ${shift.client.street || ''} ${shift.client.city}, ${shift.client.state}\n` +
          `⏰ ${shift.startTime} - ${shift.endTime}\n\n` +
          `— Angel Touch Homecare`;

        const result = await twilio.sendSMS({
          to: booking.worker.user.phone,
          body: message,
        });

        if (result.success) {
          await db.notification.create({
            data: {
              userId: booking.worker.userId,
              channel: 'SMS',
              type: 'SHIFT_REMINDER',
              title: 'Shift Starting Soon',
              body: `Your shift starts in 1 hour`,
              data: { shiftId: shift.id, reminderType: 'one-hour' },
              status: 'SENT',
              sentAt: new Date(),
              twilioSid: result.messageId,
            },
          });
          sent++;
        } else {
          failed++;
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }

  return { sent, failed, skipped };
}
