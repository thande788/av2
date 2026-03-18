import { db } from '@/lib/db';
import { serialize, formatDateUS } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  IconCalendarEvent,
  IconUsers,
  IconFileInvoice,
  IconAlertCircle,
  IconClock,
  IconStarFilled,
} from '@tabler/icons-react';
import { addDays, isBefore, isToday, isTomorrow } from 'date-fns';
import { getCurrentClient, getCurrentPortalUser } from '@/lib/auth';

export const metadata = {
  title: 'Family Portal | Dashboard',
  description: 'View your care schedule and team',
};

export default async function ClientDashboardPage() {
  // Get authenticated client or fall back to first active for demo
  let clientRecord = await getCurrentClient();
  
  if (!clientRecord) {
    // Fallback for demo: use first active client
    clientRecord = await db.client.findFirst({
      where: { user: { status: 'ACTIVE' } },
      include: { user: true },
    });
  }

  const portalUser = await getCurrentPortalUser();

  const demoClient = clientRecord ? await db.client.findUnique({
    where: { id: clientRecord.id },
    include: {
      user: true,
      careShifts: {
        where: {
          date: {
            gte: new Date(),
          },
          status: {
            in: ['BOOKED', 'IN_PROGRESS', 'OPEN'],
          },
        },
        include: {
          bookings: {
            where: {
              status: { in: ['CONFIRMED', 'ACCEPTED'] },
            },
            include: {
              worker: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
        orderBy: {
          date: 'asc',
        },
        take: 7,
      },
      invoices: {
        where: {
          status: 'SENT',
        },
        orderBy: {
          dueDate: 'asc',
        },
        take: 3,
      },
    },
  }) : null;

  // Count completed shifts awaiting review
  const pendingReviewCount = clientRecord && portalUser ? await db.careShift.count({
    where: {
      clientId: clientRecord.id,
      status: 'COMPLETED',
      reviews: {
        none: {
          reviewerType: 'CLIENT',
          reviewerId: portalUser.id,
        },
      },
      bookings: {
        some: { status: 'COMPLETED' },
      },
    },
  }) : 0;

  if (!demoClient) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <IconAlertCircle className="size-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">No Client Data</h2>
        <p className="text-muted-foreground">Run the seed script to create demo clients.</p>
      </div>
    );
  }

  const serializedShifts = serialize(demoClient.careShifts);
  const serializedInvoices = serialize(demoClient.invoices);

  const upcomingShifts = serializedShifts.filter((s) => 
    ['BOOKED', 'IN_PROGRESS'].includes(s.status)
  );
  const openShifts = serializedShifts.filter((s) => s.status === 'OPEN');

  // Get unique caregivers
  const caregivers = new Map();
  for (const shift of serializedShifts) {
    for (const booking of shift.bookings) {
      if (!caregivers.has(booking.worker.id)) {
        caregivers.set(booking.worker.id, booking.worker);
      }
    }
  }

  const pendingInvoices = serializedInvoices.filter((i) => i.status === 'SENT');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome, {demoClient.user.firstName}
        </h1>
        <p className="text-muted-foreground">
          Care for {demoClient.careRecipientName || 'your loved one'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-sky-100 p-2 dark:bg-sky-900/30">
                <IconCalendarEvent className="size-5 text-sky-600 dark:text-sky-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingShifts.length}</p>
                <p className="text-sm text-muted-foreground">Upcoming Visits</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
                <IconUsers className="size-5 text-emerald-600 dark:text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{caregivers.size}</p>
                <p className="text-sm text-muted-foreground">Care Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${pendingInvoices.length > 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-900/30'}`}>
                <IconFileInvoice className={`size-5 ${pendingInvoices.length > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-slate-600 dark:text-slate-500'}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingInvoices.length}</p>
                <p className="text-sm text-muted-foreground">Pending Invoices</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Open Shifts Alert */}
      {openShifts.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
          <div className="flex items-center gap-2">
            <IconAlertCircle className="size-5 text-amber-600" />
            <p className="font-medium text-amber-800 dark:text-amber-400">
              {openShifts.length} upcoming visit{openShifts.length > 1 ? 's need' : ' needs'} caregiver assignment
            </p>
          </div>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-500">
            We&apos;re working to assign a caregiver. You&apos;ll be notified once confirmed.
          </p>
        </div>
      )}

      {/* Pending Reviews Nudge */}
      {pendingReviewCount > 0 && (
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconStarFilled className="size-5 text-amber-400" />
              <div>
                <p className="font-medium text-sky-800 dark:text-sky-400">
                  {pendingReviewCount} completed visit{pendingReviewCount > 1 ? 's' : ''} awaiting your review
                </p>
                <p className="mt-0.5 text-sm text-sky-700 dark:text-sky-500">
                  Your feedback helps us improve care quality.
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href="/client/reviews">Leave a Review</Link>
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Visits */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <IconCalendarEvent className="size-5" />
                  Upcoming Visits
                </CardTitle>
                <CardDescription>Your scheduled care visits</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/client/schedule">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingShifts.length === 0 ? (
              <p className="py-6 text-center text-muted-foreground">
                No upcoming visits scheduled
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingShifts.slice(0, 4).map((shift) => {
                  const shiftDate = new Date(shift.date);
                  const caregiver = shift.bookings[0]?.worker;
                  
                  return (
                    <div
                      key={shift.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {isToday(shiftDate) ? 'Today' : isTomorrow(shiftDate) ? 'Tomorrow' : formatDateUS(shiftDate, 'weekday-short')}
                          </span>
                          {isToday(shiftDate) && (
                            <Badge className="bg-sky-500/15 text-sky-600">Today</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <IconClock className="size-3.5" />
                          {shift.startTime} - {shift.endTime}
                        </div>
                      </div>
                      <div className="text-right">
                        {caregiver ? (
                          <p className="text-sm font-medium">
                            {caregiver.user.firstName} {caregiver.user.lastName[0]}.
                          </p>
                        ) : (
                          <Badge variant="outline" className="text-amber-600">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Care Team */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <IconUsers className="size-5" />
                  Your Care Team
                </CardTitle>
                <CardDescription>Caregivers assigned to your care</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/client/care-team">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {caregivers.size === 0 ? (
              <p className="py-6 text-center text-muted-foreground">
                No caregivers assigned yet
              </p>
            ) : (
              <div className="space-y-3">
                {Array.from(caregivers.values()).slice(0, 4).map((worker) => (
                  <div
                    key={worker.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="flex size-10 items-center justify-center rounded-full bg-sky-100 text-sky-700 font-semibold dark:bg-sky-900/50 dark:text-sky-400">
                      {worker.user.firstName[0]}{worker.user.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium">
                        {worker.user.firstName} {worker.user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {worker.skills?.slice(0, 2).join(', ') || 'Caregiver'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>Contact our care coordination team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" asChild>
              <a href="tel:+19785551234">
                Call: (978) 555-1234
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="mailto:care@angeltouch.example.com">
                Email Support
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
