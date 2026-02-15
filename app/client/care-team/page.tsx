import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  IconAlertCircle,
  IconUsers,
  IconPhone,
  IconMail,
  IconCertificate,
  IconLanguage,
} from '@tabler/icons-react';

export const metadata = {
  title: 'Care Team | Family Portal',
  description: 'View your care team members',
};

export default async function CareTeamPage() {
  const demoClient = await db.client.findFirst({
    where: {
      user: { status: 'ACTIVE' },
    },
    include: {
      careShifts: {
        include: {
          bookings: {
            where: {
              status: { in: ['CONFIRMED', 'ACCEPTED', 'COMPLETED'] },
            },
            include: {
              worker: {
                include: { user: true },
              },
            },
          },
        },
      },
    },
  });

  if (!demoClient) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <IconAlertCircle className="size-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">No Client Data</h2>
        <p className="text-muted-foreground">Please contact your administrator.</p>
      </div>
    );
  }

  // Get unique caregivers with visit counts
  const caregiverStats = new Map<string, { worker: typeof demoClient.careShifts[0]['bookings'][0]['worker']; visitCount: number }>();
  
  for (const shift of demoClient.careShifts) {
    for (const booking of shift.bookings) {
      const existing = caregiverStats.get(booking.worker.id);
      if (existing) {
        existing.visitCount++;
      } else {
        caregiverStats.set(booking.worker.id, {
          worker: booking.worker,
          visitCount: 1,
        });
      }
    }
  }

  const caregivers = Array.from(caregiverStats.values())
    .sort((a, b) => b.visitCount - a.visitCount);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Your Care Team</h1>
        <p className="text-muted-foreground">
          Meet the caregivers who provide care for {demoClient.careRecipientName || 'your loved one'}
        </p>
      </div>

      {caregivers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <IconUsers className="mx-auto size-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No caregivers assigned yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {caregivers.map(({ worker, visitCount }) => (
            <Card key={worker.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex size-14 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xl font-bold dark:bg-sky-900/50 dark:text-sky-400">
                    {worker.user.firstName[0]}{worker.user.lastName[0]}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {worker.user.firstName} {worker.user.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {visitCount} visit{visitCount !== 1 ? 's' : ''} completed
                      </p>
                    </div>

                    {/* Skills */}
                    {worker.skills && worker.skills.length > 0 && (
                      <div className="flex items-center gap-2">
                        <IconCertificate className="size-4 text-muted-foreground" />
                        <div className="flex flex-wrap gap-1">
                          {worker.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {worker.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{worker.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    {worker.languages && worker.languages.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <IconLanguage className="size-4" />
                        <span>{worker.languages.join(', ')}</span>
                      </div>
                    )}

                    {/* Contact info - masked for privacy */}
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {worker.user.phone && (
                        <span className="flex items-center gap-1">
                          <IconPhone className="size-3.5" />
                          •••-•••-{worker.user.phone.slice(-4)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Contact Support Card */}
      <Card>
        <CardHeader>
          <CardTitle>Questions About Your Care Team?</CardTitle>
          <CardDescription>
            Our care coordinators can help with caregiver requests, scheduling preferences, and more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <IconPhone className="size-4 text-muted-foreground" />
              (978) 555-1234
            </span>
            <span className="flex items-center gap-1">
              <IconMail className="size-4 text-muted-foreground" />
              care@angeltouch.example.com
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
