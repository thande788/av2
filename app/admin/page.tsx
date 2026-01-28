import { db } from '@/lib/db';
import { StatCard } from '@/components/admin/stat-card';
import { Card } from '@/components/ui/card';
import {
  FileText,
  MessageSquare,
  HelpCircle,
  Star,
  Clock,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default async function AdminDashboard() {
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your Angel Touch Homecare admin panel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Applications</h2>
            <Link
              href="/admin/applications"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {recentApplications.length === 0 ? (
            <p className="text-muted-foreground text-sm">No applications yet.</p>
          ) : (
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <Link
                  key={app.id}
                  href={`/admin/applications/${app.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium">
                      {app.firstName} {app.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {app.job.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        app.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : app.status === 'REVIEWING'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {app.status}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(app.submittedAt, { addSuffix: true })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Contacts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Messages</h2>
            <Link
              href="/admin/contacts"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {recentContacts.length === 0 ? (
            <p className="text-muted-foreground text-sm">No messages yet.</p>
          ) : (
            <div className="space-y-4">
              {recentContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`flex items-start justify-between p-3 rounded-lg ${
                    !contact.isRead ? 'bg-primary/5' : 'hover:bg-muted'
                  } transition-colors`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{contact.name}</p>
                      {!contact.isRead && (
                        <span className="size-2 rounded-full bg-primary" />
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
        </Card>
      </div>
    </div>
  );
}
