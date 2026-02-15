import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconCertificate,
  IconLanguage,
  IconEdit,
  IconShieldCheck,
  IconAlertCircle,
} from '@tabler/icons-react';
import Link from 'next/link';
import { format } from 'date-fns';

export const metadata = {
  title: 'My Profile',
  description: 'View and manage your employee profile',
};

const complianceStatusColors: Record<string, string> = {
  COMPLIANT: 'bg-green-500/15 text-green-600 dark:text-green-400',
  PENDING: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  INCOMPLETE: 'bg-red-500/15 text-red-600 dark:text-red-400',
  EXPIRED: 'bg-red-500/15 text-red-600 dark:text-red-400',
};

export default async function EmployeeProfilePage() {
  // In real app, get worker ID from auth session
  // For demo, we'll use the first active worker
  const worker = await db.worker.findFirst({
    where: {
      user: {
        status: 'ACTIVE',
      },
    },
    include: {
      user: true,
      complianceDocs: {
        where: {
          status: 'APPROVED',
        },
        orderBy: {
          expiresAt: 'asc',
        },
      },
      availabilities: {
        orderBy: {
          dayOfWeek: 'asc',
        },
      },
    },
  });

  if (!worker) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <IconAlertCircle className="size-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">No Profile Found</h2>
        <p className="text-muted-foreground">
          Please contact your administrator.
        </p>
      </div>
    );
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">
            View and manage your profile information
          </p>
        </div>
        <Button variant="outline" disabled>
          <IconEdit className="size-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUser className="size-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
                {worker.user.firstName[0]}
                {worker.user.lastName[0]}
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {worker.user.firstName} {worker.user.lastName}
                </h2>
                {worker.employeeId && (
                  <p className="text-sm text-muted-foreground">
                    Employee ID: {worker.employeeId}
                  </p>
                )}
                <Badge
                  variant="secondary"
                  className={complianceStatusColors[worker.complianceStatus]}
                >
                  {worker.complianceStatus === 'COMPLIANT' && (
                    <IconShieldCheck className="size-3 mr-1" />
                  )}
                  {worker.complianceStatus}
                </Badge>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <IconMail className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{worker.user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <IconPhone className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">
                    {worker.user.phone || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <IconMapPin className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium">
                    {worker.city && worker.state
                      ? `${worker.city}, ${worker.state} ${worker.zip}`
                      : 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <IconCalendar className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hire Date</p>
                  <p className="text-sm font-medium">
                    {worker.hireDate
                      ? format(new Date(worker.hireDate), 'MMMM d, yyyy')
                      : 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <IconCertificate className="size-4" />
                Skills & Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {worker.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {worker.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No skills listed
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <IconLanguage className="size-4" />
                Languages
              </CardTitle>
            </CardHeader>
            <CardContent>
              {worker.languages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {worker.languages.map((lang) => (
                    <Badge key={lang} variant="outline">
                      {lang}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No languages listed
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCalendar className="size-5" />
            Weekly Availability
          </CardTitle>
          <CardDescription>
            Your current availability schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          {worker.availabilities.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {worker.availabilities.map((avail) => (
                <div
                  key={avail.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <span className="font-medium">
                    {dayNames[avail.dayOfWeek]}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {avail.startTime} - {avail.endTime}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                No availability set. Contact your administrator to update.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Documents Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconShieldCheck className="size-5" />
              Compliance Documents
            </CardTitle>
            <CardDescription>
              Your approved certifications and documents
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/employee/compliance">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {worker.complianceDocs.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {worker.complianceDocs.slice(0, 6).map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="truncate">
                    <p className="font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.type.replace('_', ' ')}
                    </p>
                  </div>
                  {doc.expiresAt && (
                    <p className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      Exp: {format(new Date(doc.expiresAt), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No approved documents yet.</p>
              <Button variant="link" asChild>
                <Link href="/employee/compliance">Upload Documents</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
