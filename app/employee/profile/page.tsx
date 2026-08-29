import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  IconCalendar,
  IconShieldCheck,
} from '@tabler/icons-react';
import Link from 'next/link';
import { formatDateUS } from '@/lib/utils';
import { getCurrentWorkerWithProfile } from '@/lib/auth';
import { maybeSignBlobReadUrl } from '@/lib/azure-blob';
import { MarketingProfileForm } from '@/components/employee/marketing-profile-form';
import { EditableProfileSection } from '@/components/employee/editable-profile-section';

export const metadata = {
  title: 'My Profile',
  description: 'View and manage your employee profile',
};

export default async function EmployeeProfilePage() {
  // Get the current authenticated worker
  const worker = await getCurrentWorkerWithProfile();

  if (!worker) {
    redirect('/employee/complete-profile');
  }

  const signedMarketingPhotoUrl = await maybeSignBlobReadUrl(worker.marketingPhotoUrl);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      <EditableProfileSection
        data={{
          firstName: worker.user.firstName,
          lastName: worker.user.lastName,
          email: worker.user.email,
          phone: worker.user.phone,
          employeeId: worker.employeeId,
          complianceStatus: worker.complianceStatus,
          hireDate: worker.hireDate ? String(worker.hireDate) : null,
          city: worker.city,
          state: worker.state,
          zip: worker.zip,
          skills: worker.skills,
          languages: worker.languages,
        }}
      />

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
                      Exp: {formatDateUS(new Date(doc.expiresAt))}
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

      {/* Marketing Profile */}
      <MarketingProfileForm
        initialData={{
          marketingBio: worker.marketingBio,
          marketingPhotoUrl: signedMarketingPhotoUrl,
          marketingSpecialties: worker.marketingSpecialties,
          marketingLanguages: worker.marketingLanguages,
          marketingCertifications: worker.marketingCertifications,
          yearsExperience: worker.yearsExperience,
          profileStatus: worker.profileStatus,
          profileRejectionNote: worker.profileRejectionNote,
          isPublicProfile: worker.isPublicProfile,
        }}
      />
    </div>
  );
}
