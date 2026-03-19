'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { twilio } from '@/lib/twilio';
import { formatDateUS } from '@/lib/utils';

const satisfactionSurveySchema = z.object({
  shiftId: z.string().min(1),
  overallRating: z.number().min(1).max(5),
  punctuality: z.number().min(1).max(5).optional(),
  communication: z.number().min(1).max(5).optional(),
  careQuality: z.number().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
  wouldRecommend: z.boolean().optional(),
});

export type SatisfactionSurveyData = z.infer<typeof satisfactionSurveySchema>;

/**
 * Submit a satisfaction survey for a completed shift
 */
export async function submitSatisfactionSurvey(
  data: SatisfactionSurveyData
): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = satisfactionSurveySchema.parse(data);

    // Get the shift to find client
    const shift = await db.careShift.findUnique({
      where: { id: parsed.shiftId },
      include: { client: true, survey: true },
    });

    if (!shift) return { success: false, error: 'Shift not found' };
    if (shift.status !== 'COMPLETED') return { success: false, error: 'Shift not completed' };
    if (shift.survey) return { success: false, error: 'Survey already submitted' };

    await db.satisfactionSurvey.create({
      data: {
        shiftId: parsed.shiftId,
        clientId: shift.clientId,
        overallRating: parsed.overallRating,
        punctuality: parsed.punctuality,
        communication: parsed.communication,
        careQuality: parsed.careQuality,
        comment: parsed.comment,
        wouldRecommend: parsed.wouldRecommend,
        completedAt: new Date(),
      },
    });

    // If low rating, create alert notification for admin
    if (parsed.overallRating <= 2) {
      const admins = await db.portalUser.findMany({
        where: { role: { in: ['ADMIN', 'MANAGER'] }, status: 'ACTIVE' },
        select: { id: true },
      });

      await db.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          channel: 'IN_APP' as const,
          type: 'GENERAL' as const,
          title: '⚠️ Low Satisfaction Rating',
          body: `A client rated a shift ${parsed.overallRating}/5 stars. Immediate attention may be needed.`,
          data: { shiftId: parsed.shiftId, rating: parsed.overallRating },
          status: 'SENT' as const,
          sentAt: new Date(),
        })),
      });
    }

    revalidatePath('/client');
    revalidatePath('/admin');

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error('Failed to submit survey:', error);
    return { success: false, error: 'Failed to submit survey' };
  }
}

/**
 * Send a satisfaction survey link via SMS to a client after shift completion
 */
export async function sendSurveyLink(shiftId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const shift = await db.careShift.findUnique({
      where: { id: shiftId },
      include: {
        client: { include: { user: true } },
        bookings: {
          where: { status: 'COMPLETED' },
          include: { worker: { include: { user: true } } },
        },
      },
    });

    if (!shift) return { success: false, error: 'Shift not found' };
    if (!shift.client.user.phone) return { success: false, error: 'Client has no phone number' };

    const workerName = shift.bookings[0]?.worker?.user
      ? `${shift.bookings[0].worker.user.firstName}`
      : 'your caregiver';

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const surveyUrl = `${baseUrl}/client/survey/${shiftId}`;

    const message =
      `Hi ${shift.client.user.firstName}! How was your care visit on ${formatDateUS(shift.date, 'medium')} with ${workerName}?\n\n` +
      `Please take a moment to share your feedback:\n${surveyUrl}\n\n` +
      `— Angel Touch Homecare`;

    const result = await twilio.sendSMS({
      to: shift.client.user.phone,
      body: message,
    });

    if (result.success) {
      // Mark the survey as requested
      await db.satisfactionSurvey.upsert({
        where: { shiftId },
        update: { requestedAt: new Date() },
        create: {
          shiftId,
          clientId: shift.clientId,
          overallRating: 0, // Placeholder until actually completed
          requestedAt: new Date(),
        },
      });
    }

    return { success: result.success, error: result.error };
  } catch (error) {
    console.error('Failed to send survey link:', error);
    return { success: false, error: 'Failed to send survey link' };
  }
}

/**
 * Get satisfaction metrics for the admin dashboard
 */
export async function getSatisfactionMetrics(days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const surveys = await db.satisfactionSurvey.findMany({
    where: {
      completedAt: { not: null, gte: since },
      overallRating: { gt: 0 },
    },
    select: {
      overallRating: true,
      punctuality: true,
      communication: true,
      careQuality: true,
      wouldRecommend: true,
    },
  });

  if (surveys.length === 0) {
    return {
      totalResponses: 0,
      averageRating: 0,
      averagePunctuality: 0,
      averageCommunication: 0,
      averageCareQuality: 0,
      recommendRate: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const avg = (arr: (number | null)[]) => {
    const valid = arr.filter((v): v is number => v !== null);
    return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
  };

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;
  surveys.forEach((s) => {
    if (s.overallRating >= 1 && s.overallRating <= 5) {
      distribution[s.overallRating]++;
    }
  });

  const recommendCount = surveys.filter((s) => s.wouldRecommend === true).length;
  const recommendTotal = surveys.filter((s) => s.wouldRecommend !== null).length;

  return {
    totalResponses: surveys.length,
    averageRating: Math.round(avg(surveys.map((s) => s.overallRating)) * 10) / 10,
    averagePunctuality: Math.round(avg(surveys.map((s) => s.punctuality)) * 10) / 10,
    averageCommunication: Math.round(avg(surveys.map((s) => s.communication)) * 10) / 10,
    averageCareQuality: Math.round(avg(surveys.map((s) => s.careQuality)) * 10) / 10,
    recommendRate: recommendTotal > 0 ? Math.round((recommendCount / recommendTotal) * 100) : 0,
    ratingDistribution: distribution,
  };
}
