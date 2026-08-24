import { cache } from 'react';
import { endOfDay, startOfDay } from 'date-fns';
import { db } from '@/lib/db';
import { isFeatureEnabled } from '@/lib/feature-flags';
import type { ShiftWithDetails } from '@/components/admin/today-schedule-widget';

export interface AdminDashboardFeatureState {
  workerManagement: boolean;
  clientManagement: boolean;
  shiftScheduling: boolean;
  timesheets: boolean;
  complianceDocs: boolean;
}

export interface AdminDashboardIntakeData {
  applicationCount: number;
  pendingApplications: number;
  contactCount: number;
  unreadContacts: number;
  inquiryCount: number;
  newInquiries: number;
  testimonialCount: number;
}

export interface AdminDashboardRecentApplication {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  submittedAt: Date;
  jobTitle: string;
}

export interface AdminDashboardRecentContact {
  id: string;
  name: string;
  message: string;
  isRead: boolean;
  submittedAt: Date;
  service: string | null;
}

export interface AdminDashboardRecentActivityData {
  recentApplications: AdminDashboardRecentApplication[];
  recentContacts: AdminDashboardRecentContact[];
}

export interface AdminDashboardOperationsData {
  features: AdminDashboardFeatureState;
  totalWorkers: number;
  activeWorkers: number;
  pendingWorkers: number;
  totalClients: number;
  openShifts: number;
  bookedToday: number;
  pendingTimesheets: number;
  pendingDocs: number;
  expiringDocs: number;
  pendingActionsTotal: number;
  todayShifts: ShiftWithDetails[];
}

export const getAdminDashboardFeatureState = cache(
  (): AdminDashboardFeatureState => ({
    workerManagement: isFeatureEnabled('workerManagement'),
    clientManagement: isFeatureEnabled('clientManagement'),
    shiftScheduling: isFeatureEnabled('shiftScheduling'),
    timesheets: isFeatureEnabled('timesheets'),
    complianceDocs: isFeatureEnabled('complianceDocs'),
  })
);

export const getAdminDashboardIntakeData = cache(
  async (): Promise<AdminDashboardIntakeData> => {
    const [
      applicationCount,
      pendingApplications,
      contactCount,
      unreadContacts,
      inquiryCount,
      newInquiries,
      testimonialCount,
    ] = await Promise.all([
      db.application.count(),
      db.application.count({ where: { status: 'PENDING' } }),
      db.contactSubmission.count(),
      db.contactSubmission.count({ where: { isRead: false } }),
      db.serviceInquiry.count(),
      db.serviceInquiry.count({ where: { status: 'NEW' } }),
      db.testimonial.count({ where: { isPublished: true } }),
    ]);

    return {
      applicationCount,
      pendingApplications,
      contactCount,
      unreadContacts,
      inquiryCount,
      newInquiries,
      testimonialCount,
    };
  }
);

export const getAdminDashboardRecentActivityData = cache(
  async (): Promise<AdminDashboardRecentActivityData> => {
    const [recentApplications, recentContacts] = await Promise.all([
      db.application.findMany({
        take: 5,
        orderBy: { submittedAt: 'desc' },
        include: { job: { select: { title: true } } },
      }),
      db.contactSubmission.findMany({
        take: 5,
        orderBy: [{ isRead: 'asc' }, { submittedAt: 'desc' }],
        select: {
          id: true,
          name: true,
          message: true,
          isRead: true,
          submittedAt: true,
          service: true,
        },
      }),
    ]);

    return {
      recentApplications: recentApplications.map((application) => ({
        id: application.id,
        firstName: application.firstName,
        lastName: application.lastName,
        status: application.status,
        submittedAt: application.submittedAt,
        jobTitle: application.job.title,
      })),
      recentContacts,
    };
  }
);

export const getAdminDashboardOperationsData = cache(
  async (): Promise<AdminDashboardOperationsData | null> => {
    const features = getAdminDashboardFeatureState();

    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const thirtyDaysFromNow = new Date(
      today.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    const [
      totalWorkers,
      activeWorkers,
      pendingWorkers,
      totalClients,
      openShifts,
      bookedToday,
      pendingTimesheets,
      pendingDocs,
      expiringDocs,
      todayShifts,
    ] = await Promise.all([
      db.worker.count(),
      db.worker.count({ where: { user: { status: 'ACTIVE' } } }),
      db.portalUser.count({ where: { role: 'CAREGIVER', status: 'PENDING' } }),
      db.client.count(),
      db.careShift.count({ where: { status: 'OPEN' } }),
      db.careShift.count({
        where: {
          date: { gte: todayStart, lte: todayEnd },
          status: { in: ['BOOKED', 'IN_PROGRESS'] },
        },
      }),
      db.timesheet.count({ where: { status: 'SUBMITTED' } }),
      db.complianceDoc.count({ where: { status: 'PENDING_REVIEW' } }),
      db.complianceDoc.count({
        where: {
          status: 'APPROVED',
          expiresAt: { lte: thirtyDaysFromNow, gte: today },
        },
      }),
      db.careShift.findMany({
        where: { date: { gte: todayStart, lte: todayEnd } },
        include: {
          client: {
            include: { user: true },
          },
          bookings: {
            include: {
              worker: {
                include: { user: true },
              },
            },
          },
        },
        orderBy: { startTime: 'asc' },
        take: 5,
      }),
    ]);

    const normalizedTodayShifts: ShiftWithDetails[] = todayShifts.map((shift) => ({
      id: shift.id,
      date: shift.date.toISOString(),
      startTime: shift.startTime,
      endTime: shift.endTime,
      status: shift.status,
      client: {
        careRecipientName: shift.client.careRecipientName,
        city: shift.client.city,
        user: {
          firstName: shift.client.user.firstName,
          lastName: shift.client.user.lastName,
        },
      },
      bookings: shift.bookings.map((booking) => ({
        id: booking.id,
        status: booking.status,
        worker: {
          user: {
            firstName: booking.worker.user.firstName,
            lastName: booking.worker.user.lastName,
          },
        },
      })),
    }));

    return {
      features,
      totalWorkers,
      activeWorkers,
      pendingWorkers,
      totalClients,
      openShifts,
      bookedToday,
      pendingTimesheets,
      pendingDocs,
      expiringDocs,
      pendingActionsTotal:
        pendingWorkers + pendingTimesheets + pendingDocs + expiringDocs,
      todayShifts: normalizedTodayShifts,
    };
  }
);
