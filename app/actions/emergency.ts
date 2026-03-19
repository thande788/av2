'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getCurrentPortalUser } from '@/lib/auth';
import { z } from 'zod';
import { IncidentType, IncidentSeverity } from '@prisma/client';
import { twilio } from '@/lib/twilio';

const emergencyIncidentSchema = z.object({
  shiftId: z.string().optional(),
  clientId: z.string().optional(),
  type: z.nativeEnum(IncidentType),
  description: z.string().min(10, 'Please provide more details').max(2000),
  severity: z.nativeEnum(IncidentSeverity).default('MEDIUM'),
});

export type EmergencyIncidentData = z.infer<typeof emergencyIncidentSchema>;

/**
 * Report an emergency incident
 * Sends SMS to office and creates incident record
 */
export async function reportEmergencyIncident(
  data: EmergencyIncidentData
): Promise<{ success: boolean; incidentId?: string; error?: string }> {
  try {
    const portalUser = await getCurrentPortalUser();
    if (!portalUser) return { success: false, error: 'Not authenticated' };

    const parsed = emergencyIncidentSchema.parse(data);

    const incident = await db.emergencyIncident.create({
      data: {
        reporterId: portalUser.id,
        reporterName: `${portalUser.firstName} ${portalUser.lastName}`,
        shiftId: parsed.shiftId,
        clientId: parsed.clientId,
        type: parsed.type,
        description: parsed.description,
        severity: parsed.severity,
        status: 'OPEN',
      },
    });

    // Send SMS notification to office for HIGH/CRITICAL severity
    if (parsed.severity === 'HIGH' || parsed.severity === 'CRITICAL') {
      const officePhone = process.env.OFFICE_PHONE_NUMBER;
      if (officePhone) {
        await twilio.sendSMS({
          to: officePhone,
          body: `🚨 EMERGENCY ALERT (${parsed.severity})\n\nType: ${parsed.type.replace(/_/g, ' ')}\nReported by: ${portalUser.firstName} ${portalUser.lastName}\n\n${parsed.description.slice(0, 200)}${parsed.description.length > 200 ? '...' : ''}\n\nIncident ID: ${incident.id}`,
        });
      }
    }

    // Create in-app notification for all admins
    const admins = await db.portalUser.findMany({
      where: { role: { in: ['ADMIN', 'MANAGER'] }, status: 'ACTIVE' },
      select: { id: true },
    });

    if (admins.length > 0) {
      await db.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          channel: 'IN_APP' as const,
          type: 'GENERAL' as const,
          title: `Emergency: ${parsed.type.replace(/_/g, ' ')}`,
          body: `${portalUser.firstName} ${portalUser.lastName} reported a ${parsed.severity.toLowerCase()} severity incident.`,
          data: { incidentId: incident.id, shiftId: parsed.shiftId },
          status: 'SENT' as const,
          sentAt: new Date(),
        })),
      });
    }

    revalidatePath('/admin');
    revalidatePath('/employee');

    return { success: true, incidentId: incident.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error('Failed to report incident:', error);
    return { success: false, error: 'Failed to report incident' };
  }
}

/**
 * Get all incidents (admin view)
 */
export async function getIncidents(filters?: { status?: string; severity?: string }) {
  const where: Record<string, unknown> = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.severity) where.severity = filters.severity;

  return db.emergencyIncident.findMany({
    where,
    orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
  });
}

/**
 * Resolve an incident (admin only)
 */
export async function resolveIncident(
  incidentId: string,
  resolution: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const portalUser = await getCurrentPortalUser();
    if (!portalUser) return { success: false, error: 'Not authenticated' };

    await db.emergencyIncident.update({
      where: { id: incidentId },
      data: {
        status: 'RESOLVED',
        resolvedBy: portalUser.id,
        resolvedAt: new Date(),
        resolution,
      },
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Failed to resolve incident:', error);
    return { success: false, error: 'Failed to resolve incident' };
  }
}

/**
 * Get emergency contacts for a client
 */
export async function getClientEmergencyContacts(clientId: string) {
  const client = await db.client.findUnique({
    where: { id: clientId },
    select: {
      emergencyName: true,
      emergencyPhone: true,
      emergencyRelation: true,
    },
  });

  return client;
}
