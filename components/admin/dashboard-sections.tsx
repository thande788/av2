import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  Briefcase,
  Clock,
  FileText,
  HelpCircle,
  MessageSquare,
  Quote,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  getAdminDashboardIntakeData,
  getAdminDashboardOperationsData,
  getAdminDashboardRecentActivityData,
} from '@/lib/admin/dashboard';
import { DashboardPanel } from './dashboard-panel';
import { PendingActionsPanel } from './pending-actions-panel';
import { QuickActions } from './quick-actions';
import { StatCard, type StatCardVariant } from './stat-card';
import { TodayScheduleWidget } from './today-schedule-widget';

interface DashboardMetric {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  href?: string;
  variant?: StatCardVariant;
}

function SectionIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function MetricsGrid({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <StatCard
          key={metric.title}
          title={metric.title}
          value={metric.value}
          description={metric.description}
          icon={metric.icon}
          href={metric.href}
          variant={metric.variant}
        />
      ))}
    </div>
  );
}

export function DashboardHeader() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
        <p className="text-muted-foreground">
          Focus on staffing, intake, and the queues that need attention first.
        </p>
      </div>
      <QuickActions />
    </div>
  );
}

export async function OperationsOverviewSection() {
  const operations = await getAdminDashboardOperationsData();

  if (!operations) {
    return null;
  }

  const metrics: DashboardMetric[] = [
    {
      title: 'Active Workers',
      value: operations.activeWorkers,
      description: `${operations.totalWorkers} total workers`,
      icon: Users,
      href: '/admin/workers?tab=active',
      variant: 'success',
    },
    {
      title: 'Open Shifts',
      value: operations.openShifts,
      description: 'Coverage still needed',
      icon: Clock,
      href: '/admin/shifts',
      variant: operations.openShifts > 0 ? 'warning' : 'default',
    },
    {
      title: 'Booked Today',
      value: operations.bookedToday,
      description: 'Confirmed or in progress today',
      icon: Briefcase,
      href: '/admin/shifts',
      variant: 'info',
    },
    {
      title: 'Pending Actions',
      value: operations.pendingActionsTotal,
      description: 'Approvals and reviews waiting',
      icon: AlertTriangle,
      href: '/admin/compliance?tab=pending',
      variant: operations.pendingActionsTotal > 0 ? 'warning' : 'default',
    },
  ];

  return (
    <section className="space-y-4">
      <SectionIntro
        title="Operations"
        description="Staffing, scheduling, and internal queues across enabled portal modules."
      />
      <MetricsGrid metrics={metrics.slice(0, 4)} />
    </section>
  );
}

export async function IntakeOverviewSection() {
  const intake = await getAdminDashboardIntakeData();

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <SectionIntro
          title="Intake"
          description="Recruiting, outreach, and family inquiries that drive the pipeline."
        />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Quote className="size-4 text-primary" />
          <span>{intake.testimonialCount} published testimonials live</span>
        </div>
      </div>
      <MetricsGrid
        metrics={[
          {
            title: 'Applications',
            value: intake.applicationCount,
            description: 'All submitted candidates',
            icon: FileText,
            href: '/admin/applications',
          },
          {
            title: 'Pending Review',
            value: intake.pendingApplications,
            description: 'Candidates waiting on a decision',
            icon: Clock,
            href: '/admin/applications',
            variant: intake.pendingApplications > 0 ? 'warning' : 'default',
          },
          {
            title: 'Unread Messages',
            value: intake.unreadContacts,
            description: `${intake.contactCount} total contact submissions`,
            icon: MessageSquare,
            href: '/admin/contacts',
            variant: intake.unreadContacts > 0 ? 'info' : 'default',
          },
          {
            title: 'New Inquiries',
            value: intake.newInquiries,
            description: `${intake.inquiryCount} service inquiries received`,
            icon: HelpCircle,
            href: '/admin/inquiries',
            variant: intake.newInquiries > 0 ? 'warning' : 'default',
          },
        ]}
      />
    </section>
  );
}

export async function RecentActivitySection() {
  const [activity, intake] = await Promise.all([
    getAdminDashboardRecentActivityData(),
    getAdminDashboardIntakeData(),
  ]);

  return (
    <section className="space-y-4">
      <SectionIntro
        title="Queues"
        description="Recent submissions and content tasks most likely to need follow-up."
      />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.1fr_0.8fr]">
        <DashboardPanel
          title="Recent Applications"
          icon={FileText}
          actionHref="/admin/applications"
          actionLabel="View all"
        >
          {activity.recentApplications.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No applications yet.
            </p>
          ) : (
            <div className="space-y-3">
              {activity.recentApplications.map((application) => (
                <Link
                  key={application.id}
                  href={`/admin/applications/${application.id}`}
                  className="group block rounded-lg p-3 transition-colors hover:bg-accent/50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-medium transition-colors group-hover:text-primary">
                        {application.firstName} {application.lastName}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {application.jobTitle}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <Badge
                          variant="secondary"
                          className={cn(
                            application.status === 'PENDING' &&
                              'bg-amber-500/15 text-amber-600 dark:text-amber-400',
                            application.status === 'REVIEWING' &&
                              'bg-blue-500/15 text-blue-600 dark:text-blue-400',
                            application.status === 'HIRED' &&
                              'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          )}
                        >
                          {application.status}
                        </Badge>
                        <span className="text-xs font-medium text-primary sm:hidden">Review</span>
                      </div>
                      <div className="sm:mt-1.5">
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(application.submittedAt, { addSuffix: true })}
                        </p>
                        <p className="mt-1 hidden text-xs font-medium text-primary sm:block">Review</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </DashboardPanel>

        <DashboardPanel
          title="Recent Messages"
          icon={MessageSquare}
          actionHref="/admin/contacts"
          actionLabel="Open inbox"
        >
          {activity.recentContacts.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No messages yet.
            </p>
          ) : (
            <div className="space-y-3">
              {activity.recentContacts.map((contact) => (
                <Link
                  key={contact.id}
                  href="/admin/contacts"
                  className={cn(
                    'group block rounded-lg p-3 transition-colors hover:bg-accent/50',
                    !contact.isRead && 'border border-primary/10 bg-primary/5'
                  )}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium transition-colors group-hover:text-primary">
                          {contact.name}
                        </p>
                        {!contact.isRead && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground sm:truncate">
                        {contact.message}
                      </p>
                      {contact.service && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Service: {contact.service}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:ml-4 sm:block sm:text-right">
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <Badge variant={contact.isRead ? 'outline' : 'secondary'}>
                          {contact.isRead ? 'Read' : 'Unread'}
                        </Badge>
                        <span className="text-xs font-medium text-primary sm:hidden">Open inbox</span>
                      </div>
                      <div className="sm:mt-1.5">
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(contact.submittedAt, { addSuffix: true })}
                        </p>
                        <p className="mt-1 hidden text-xs font-medium text-primary sm:block">Open inbox</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </DashboardPanel>

        <DashboardPanel
          title="Content Snapshot"
          icon={Quote}
          actionHref="/admin/testimonials"
          actionLabel="Manage"
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-medium text-muted-foreground">Published Testimonials</p>
              <p className="mt-2 text-3xl font-bold tracking-tight">{intake.testimonialCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Social proof currently visible on the public site.
              </p>
            </div>
            <div className="grid gap-2">
              <Button asChild variant="outline" size="sm" className="justify-start">
                <Link href="/admin/testimonials">Review Testimonials</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="justify-start">
                <Link href="/admin/faqs">Manage FAQs</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="justify-start">
                <Link href="/admin/services">Update Services</Link>
              </Button>
            </div>
          </div>
        </DashboardPanel>
      </div>
    </section>
  );
}

export async function OperationsWidgetsSection() {
  const operations = await getAdminDashboardOperationsData();

  if (!operations) {
    return null;
  }

  const showSchedule = true;
  const showPendingActions = true;

  if (!showSchedule && !showPendingActions) {
    return null;
  }

  return (
    <section className="space-y-4">
      <SectionIntro
        title="Operations Detail"
        description="Today's staffing picture and the review queues behind it."
      />
      <div className={cn('grid gap-6', showSchedule && showPendingActions && 'xl:grid-cols-2')}>
        {showSchedule && <TodayScheduleWidget shifts={operations.todayShifts} />}
        {showPendingActions && (
          <PendingActionsPanel
            pendingWorkers={operations.pendingWorkers}
            pendingTimesheets={operations.pendingTimesheets}
            pendingDocs={operations.pendingDocs}
            expiringDocs={operations.expiringDocs}
          />
        )}
      </div>
    </section>
  );
}

export function DashboardMetricsSkeleton({ cardCount = 4 }: { cardCount?: number }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: cardCount }).map((_, index) => (
          <div key={index} className="rounded-xl border border-border/60 p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="size-10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardPanelsSkeleton({ columns = 2 }: { columns?: 2 | 3 }) {
  return (
    <div
      className={cn(
        'grid gap-6',
        columns === 2 && 'xl:grid-cols-2',
        columns === 3 && 'xl:grid-cols-3'
      )}
    >
      {Array.from({ length: columns }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border border-border/60">
          <div className="border-b p-6 pb-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
          <div className="space-y-3 p-6 pt-4">
            {Array.from({ length: 4 }).map((__, rowIndex) => (
              <Skeleton key={rowIndex} className="h-16 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
