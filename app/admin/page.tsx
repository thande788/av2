import { db } from '@/lib/db';
import { StatCard } from '@/components/admin/stat-card';
import { TodayScheduleWidget, type ShiftWithDetails } from '@/components/admin/today-schedule-widget';
import { PendingActionsPanel } from '@/components/admin/pending-actions-panel';
import { QuickActions } from '@/components/admin/quick-actions';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { serialize } from '@/lib/utils';
import {
  FileText,
  MessageSquare,
  HelpCircle,
  Star,
  Clock,
  CheckCircle,
  Calendar,
  Users,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow, startOfDay, endOfDay } from 'date-fns';

export default async function AdminDashboard() {
  const portalEnabled = isFeatureEnabled('workerManagement');
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Core CRM stats
  const [
    applicationCount,
    pendingApplications,
    contactCount,
    unreadContacts,
    inquiryCount,
    newInquiries,
    testimonialCount,
    recentApplications,
    recentContacts,
  ] = await Promise.all([
    db.application.count(),
    db.application.count({ where: { status: 'PENDING' } }),
    db.contactSubmission.count(),
    db.contactSubmission.count({ where: { isRead: false } }),
    db.serviceInquiry.count(),
    db.serviceInquiry.count({ where: { status: 'NEW' } }),
    db.testimonial.count({ where: { isPublished: true } }),
    db.application.findMany({
      take: 5,
      orderBy: { submittedAt: 'desc' },
      include: { job: { select: { title: true } } },
    }),
    db.contactSubmission.findMany({
      take: 5,
      orderBy: { submittedAt: 'desc' },
    }),
  ]);

  // Portal stats (only fetch when demo enabled)
  let portalStats = {
    totalWorkers: 0,
    activeWorkers: 0,
    pendingWorkers: 0,
    totalClients: 0,
    openShifts: 0,
    bookedShifts: 0,
    pendingTimesheets: 0,
    pendingDocs: 0,
    expiringDocs: 0,
    // todayShifts will be serialized and cast to ShiftWithDetails[]
    todayShifts: [] as unknown[],
  };

  if (portalEnabled) {
    const [
      totalWorkers,
      activeWorkers,
      pendingWorkers,
      totalClients,
      openShifts,
      bookedShifts,
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
      db.careShift.count({ where: { status: { in: ['BOOKED', 'IN_PROGRESS'] } } }),
      db.timesheet.count({ where: { status: 'SUBMITTED' } }),
      db.complianceDoc.count({ where: { status: 'PENDING_REVIEW' } }),
      db.complianceDoc.count({
        where: {
          status: 'APPROVED',
          expiresAt: { lte: thirtyDaysFromNow, gte: today },
        },
      }),
      db.careShift.findMany({
        where: {
          date: { gte: todayStart, lte: todayEnd },
        },
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

    portalStats = {
      totalWorkers,
      activeWorkers,
      pendingWorkers,
      totalClients,
      openShifts,
      bookedShifts,
      pendingTimesheets,
      pendingDocs,
      expiringDocs,
      todayShifts,
    };
  }

  // Get greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting}! <span className="text-2xl">👋</span>
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening at Angel Touch Homecare today
          </p>
        </div>
        {portalEnabled && <QuickActions />}
      </div>

      {/* Portal Stats */}
      {portalEnabled && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Workers"
            value={portalStats.activeWorkers}
            description={`${portalStats.totalWorkers} total`}
            icon={Users}
          />
          <StatCard
            title="Open Shifts"
            value={portalStats.openShifts}
            icon={Calendar}
            highlight={portalStats.openShifts > 0}
          />
          <StatCard
            title="Booked Today"
            value={portalStats.bookedShifts}
            icon={CheckCircle}
          />
          <StatCard
            title="Pending Actions"
            value={portalStats.pendingWorkers + portalStats.pendingDocs + portalStats.pendingTimesheets}
            icon={AlertTriangle}
            highlight={(portalStats.pendingWorkers + portalStats.pendingDocs + portalStats.pendingTimesheets) > 0}
          />
        </div>
      )}

      {/* CRM Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Applications"
          value={applicationCount}
          icon={FileText}
        />
        <StatCard
          title="Pending Review"
          value={pendingApplications}
          icon={Clock}
          highlight={pendingApplications > 0}
        />
        <StatCard
          title="Contact Messages"
          value={contactCount}
          icon={MessageSquare}
        />
        <StatCard
          title="Unread Messages"
          value={unreadContacts}
          icon={CheckCircle}
          highlight={unreadContacts > 0}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Service Inquiries"
          value={inquiryCount}
          icon={HelpCircle}
        />
        <StatCard
          title="New Inquiries"
          value={newInquiries}
          icon={Clock}
          highlight={newInquiries > 0}
        />
        <StatCard
          title="Published Testimonials"
          value={testimonialCount}
          icon={Star}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <div className="rounded-xl border border-primary/40 bg-primary/5 overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4 border-b border-primary/20">
            <h2 className="text-lg font-semibold">Recent Applications</h2>
            <Link
              href="/admin/applications"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="p-6 pt-4">
          {recentApplications.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No applications yet.</p>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <Link
                  key={app.id}
                  href={`/admin/applications/${app.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors group"
                >
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors">
                      {app.firstName} {app.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {app.job.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        app.status === 'PENDING'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : app.status === 'REVIEWING'
                          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                          : app.status === 'HIRED'
                          ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {app.status}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {formatDistanceToNow(app.submittedAt, { addSuffix: true })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          </div>
        </div>

        {/* Recent Contacts */}
        <div className="rounded-xl border border-primary/40 bg-primary/5 overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4 border-b border-primary/20">
            <h2 className="text-lg font-semibold">Recent Messages</h2>
            <Link
              href="/admin/contacts"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="p-6 pt-4">
          {recentContacts.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No messages yet.</p>
          ) : (
            <div className="space-y-3">
              {recentContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`flex items-start justify-between p-3 rounded-lg transition-colors ${
                    !contact.isRead ? 'bg-primary/5 border border-primary/10' : 'hover:bg-accent/50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{contact.name}</p>
                      {!contact.isRead && (
                        <span className="size-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {contact.message}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground ml-4 whitespace-nowrap">
                    {formatDistanceToNow(contact.submittedAt, { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Portal Widgets */}
      {portalEnabled && (
        <div className="grid gap-6 lg:grid-cols-2">
          <TodayScheduleWidget shifts={serialize(portalStats.todayShifts) as ShiftWithDetails[]} />
          <PendingActionsPanel
            pendingWorkers={portalStats.pendingWorkers}
            pendingTimesheets={portalStats.pendingTimesheets}
            pendingDocs={portalStats.pendingDocs}
            expiringDocs={portalStats.expiringDocs}
          />
        </div>
      )}
    </div>
  );
}
