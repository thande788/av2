'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import {
  twilio,
  createShiftNotificationMessage,
  createShiftConfirmationMessage,
  createShiftCancellationMessage,
  type ShiftNotificationData,
  type SMSResult,
} from '@/lib/twilio';
import { ShiftStatus } from '@prisma/client';
import { format } from 'date-fns';

export interface NotificationResult {
  success: boolean;
  totalSent: number;
  totalFailed: number;
  results: Array<{
    workerId: string;
    workerName: string;
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
}

/**
 * Send shift availability notification to matching workers
 */
export async function sendShiftNotification(
  shiftId: string
): Promise<NotificationResult> {
  try {
    // Get shift with client info
    const shift = await db.careShift.findUnique({
      where: { id: shiftId },
      include: {
        client: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!shift) {
      return {
        success: false,
        totalSent: 0,
        totalFailed: 0,
        results: [],
      };
    }

    // Get matching workers
    // Simple matching: compliant workers in same ZIP area
    const workers = await db.worker.findMany({
      where: {
        complianceStatus: 'COMPLIANT',
        user: {
          status: 'ACTIVE',
        },
        // Match at least one required skill
        skills: {
          hasSome: shift.skillsRequired.length > 0 
            ? shift.skillsRequired 
            : ['Personal Care', 'Companionship'],
        },
      },
      include: {
        user: true,
      },
    });

    if (workers.length === 0) {
      return {
        success: true,
        totalSent: 0,
        totalFailed: 0,
        results: [],
      };
    }

    // Prepare notification data
    const notificationData: Omit<ShiftNotificationData, 'workerName' | 'workerPhone'> = {
      shiftId: shift.id,
      clientName: shift.client.careRecipientName || 
        `${shift.client.user.firstName} ${shift.client.user.lastName}`,
      date: format(shift.date, 'EEEE, MMMM d'),
      startTime: shift.startTime,
      endTime: shift.endTime,
      address: `${shift.client.city}, ${shift.client.state}`,
      rate: `$${shift.workerRate?.toNumber().toFixed(2) || '22.00'}`,
    };

    // Send SMS to each worker
    const results: NotificationResult['results'] = [];
    let totalSent = 0;
    let totalFailed = 0;

    for (const worker of workers) {
      if (!worker.user.phone) {
        results.push({
          workerId: worker.id,
          workerName: `${worker.user.firstName} ${worker.user.lastName}`,
          success: false,
          error: 'No phone number on file',
        });
        totalFailed++;
        continue;
      }

      const message = createShiftNotificationMessage({
        ...notificationData,
        workerName: worker.user.firstName,
        workerPhone: worker.user.phone,
      });

      const smsResult = await twilio.sendSMS({
        to: worker.user.phone,
        body: message,
      });

      results.push({
        workerId: worker.id,
        workerName: `${worker.user.firstName} ${worker.user.lastName}`,
        success: smsResult.success,
        messageId: smsResult.messageId,
        error: smsResult.error,
      });

      if (smsResult.success) {
        totalSent++;
      } else {
        totalFailed++;
      }

      // Small delay between messages
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Update shift status to indicate notifications were sent
    if (totalSent > 0) {
      await db.careShift.update({
        where: { id: shiftId },
        data: { status: ShiftStatus.PENDING_BOOK },
      });

      revalidatePath('/admin/shifts');
      revalidatePath(`/admin/shifts/${shiftId}`);
    }

    return {
      success: true,
      totalSent,
      totalFailed,
      results,
    };
  } catch (error) {
    console.error('Failed to send shift notifications:', error);
    return {
      success: false,
      totalSent: 0,
      totalFailed: 0,
      results: [],
    };
  }
}

/**
 * Send shift confirmation SMS to worker
 */
export async function sendShiftConfirmation(
  shiftId: string,
  workerId: string
): Promise<SMSResult> {
  try {
    const [shift, worker] = await Promise.all([
      db.careShift.findUnique({
        where: { id: shiftId },
        include: {
          client: {
            include: { user: true },
          },
        },
      }),
      db.worker.findUnique({
        where: { id: workerId },
        include: { user: true },
      }),
    ]);

    if (!shift || !worker || !worker.user.phone) {
      return {
        success: false,
        error: 'Shift or worker not found, or worker has no phone number',
      };
    }

    const message = createShiftConfirmationMessage({
      workerName: worker.user.firstName,
      clientName:
        shift.client.careRecipientName ||
        `${shift.client.user.firstName} ${shift.client.user.lastName}`,
      date: format(shift.date, 'EEEE, MMMM d'),
      startTime: shift.startTime,
      address: `${shift.client.street}, ${shift.client.city}, ${shift.client.state} ${shift.client.zip}`,
    });

    return await twilio.sendSMS({
      to: worker.user.phone,
      body: message,
    });
  } catch (error) {
    console.error('Failed to send shift confirmation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send shift cancellation SMS to worker
 */
export async function sendShiftCancellation(
  shiftId: string,
  workerId: string,
  reason?: string
): Promise<SMSResult> {
  try {
    const [shift, worker] = await Promise.all([
      db.careShift.findUnique({
        where: { id: shiftId },
        include: {
          client: {
            include: { user: true },
          },
        },
      }),
      db.worker.findUnique({
        where: { id: workerId },
        include: { user: true },
      }),
    ]);

    if (!shift || !worker || !worker.user.phone) {
      return {
        success: false,
        error: 'Shift or worker not found, or worker has no phone number',
      };
    }

    const message = createShiftCancellationMessage({
      workerName: worker.user.firstName,
      date: format(shift.date, 'EEEE, MMMM d'),
      clientName:
        shift.client.careRecipientName ||
        `${shift.client.user.firstName} ${shift.client.user.lastName}`,
      reason,
    });

    return await twilio.sendSMS({
      to: worker.user.phone,
      body: message,
    });
  } catch (error) {
    console.error('Failed to send shift cancellation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send notification to multiple specific workers
 */
export async function sendShiftNotificationToWorkers(
  shiftId: string,
  workerIds: string[]
): Promise<NotificationResult> {
  try {
    const shift = await db.careShift.findUnique({
      where: { id: shiftId },
      include: {
        client: {
          include: { user: true },
        },
      },
    });

    if (!shift) {
      return {
        success: false,
        totalSent: 0,
        totalFailed: 0,
        results: [],
      };
    }

    const workers = await db.worker.findMany({
      where: {
        id: { in: workerIds },
      },
      include: { user: true },
    });

    const notificationData: Omit<ShiftNotificationData, 'workerName' | 'workerPhone'> = {
      shiftId: shift.id,
      clientName:
        shift.client.careRecipientName ||
        `${shift.client.user.firstName} ${shift.client.user.lastName}`,
      date: format(shift.date, 'EEEE, MMMM d'),
      startTime: shift.startTime,
      endTime: shift.endTime,
      address: `${shift.client.city}, ${shift.client.state}`,
      rate: `$${shift.workerRate?.toNumber().toFixed(2) || '22.00'}`,
    };

    const results: NotificationResult['results'] = [];
    let totalSent = 0;
    let totalFailed = 0;

    for (const worker of workers) {
      if (!worker.user.phone) {
        results.push({
          workerId: worker.id,
          workerName: `${worker.user.firstName} ${worker.user.lastName}`,
          success: false,
          error: 'No phone number on file',
        });
        totalFailed++;
        continue;
      }

      const message = createShiftNotificationMessage({
        ...notificationData,
        workerName: worker.user.firstName,
        workerPhone: worker.user.phone,
      });

      const smsResult = await twilio.sendSMS({
        to: worker.user.phone,
        body: message,
      });

      results.push({
        workerId: worker.id,
        workerName: `${worker.user.firstName} ${worker.user.lastName}`,
        success: smsResult.success,
        messageId: smsResult.messageId,
        error: smsResult.error,
      });

      if (smsResult.success) {
        totalSent++;
      } else {
        totalFailed++;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return {
      success: true,
      totalSent,
      totalFailed,
      results,
    };
  } catch (error) {
    console.error('Failed to send shift notifications to workers:', error);
    return {
      success: false,
      totalSent: 0,
      totalFailed: 0,
      results: [],
    };
  }
}
