import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import {
  IconBell,
  IconMail,
  IconDeviceMobile,
  IconLock,
  IconUser,
  IconMapPin,
} from '@tabler/icons-react';
import { ManageAccountButton } from '@/components/shared/manage-account-button';
import { getCurrentClient } from '@/lib/auth';
import { getClientProfileCompletion } from '@/lib/client-profile-completion';
import { ClientSetupNeeded } from '@/components/client/client-setup-needed';
import { ProfileSettingsForm } from '@/components/client/settings/profile-settings-form';
import { CareSettingsForm } from '@/components/client/settings/care-settings-form';

export const metadata = {
  title: 'Settings',
  description: 'Manage your account settings',
};

export default async function ClientSettingsPage() {
  const currentClient = await getCurrentClient();

  const demoClient = currentClient
    ? await db.client.findUnique({
        where: { id: currentClient.id },
        include: { user: true },
      })
    : null;

  if (!demoClient) {
    return <ClientSetupNeeded />;
  }

  const completion = getClientProfileCompletion(demoClient);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href="#profile-edit">Edit Profile</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="#care-edit">Update Care Information</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Completion</CardTitle>
          <CardDescription>
            {completion.completedFields}/{completion.totalFields} profile fields complete
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={completion.percentComplete} aria-label="Client profile completion" />
          <p className="text-sm text-muted-foreground">
            {completion.percentComplete}% complete
            {completion.missingFields.length > 0
              ? ` - add missing phone, care recipient, and emergency details to finish setup.`
              : ' - your profile is complete.'}
          </p>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUser className="size-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProfileSettingsForm
            firstName={demoClient.user.firstName}
            lastName={demoClient.user.lastName}
            email={demoClient.user.email}
            phone={demoClient.user.phone}
            relationship={demoClient.relationship}
            type={demoClient.type}
          />
        </CardContent>
      </Card>

      {/* Care Recipient */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUser className="size-5" />
            Care Recipient
          </CardTitle>
          <CardDescription>Information about the person receiving care</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/20 p-4">
            <Label className="text-muted-foreground">Current Care Address</Label>
            <div className="mt-1 flex items-start gap-2">
              <IconMapPin className="mt-0.5 size-4 text-muted-foreground" />
              <p className="font-medium">
                {demoClient.street}
                <br />
                {demoClient.city}, {demoClient.state} {demoClient.zip}
              </p>
            </div>
          </div>
          <CareSettingsForm
            careRecipientName={demoClient.careRecipientName}
            careRecipientDOB={
              demoClient.careRecipientDOB
                ? new Date(demoClient.careRecipientDOB).toISOString().slice(0, 10)
                : null
            }
            serviceLevel={demoClient.serviceLevel}
            street={demoClient.street}
            city={demoClient.city}
            state={demoClient.state}
            zip={demoClient.zip}
            emergencyName={demoClient.emergencyName}
            emergencyPhone={demoClient.emergencyPhone}
            emergencyRelation={demoClient.emergencyRelation}
            billingEmail={demoClient.billingEmail}
            preferredTimes={demoClient.preferredTimes}
            specialNeeds={demoClient.specialNeeds}
            careNotes={demoClient.careNotes}
            accessNotes={demoClient.accessNotes}
          />
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBell className="size-5" />
            Notifications
          </CardTitle>
          <CardDescription>Choose how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconMail className="size-5 text-muted-foreground" />
              <div>
                <Label htmlFor="email-notifs" className="font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Schedule updates and caregiver assignments
                </p>
              </div>
            </div>
            <Switch id="email-notifs" defaultChecked disabled />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconDeviceMobile className="size-5 text-muted-foreground" />
              <div>
                <Label htmlFor="sms-notifs" className="font-medium">
                  SMS Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Caregiver arrivals and important alerts
                </p>
              </div>
            </div>
            <Switch id="sms-notifs" defaultChecked disabled />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconBell className="size-5 text-muted-foreground" />
              <div>
                <Label htmlFor="invoice-notifs" className="font-medium">
                  Invoice Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Payment due date reminders
                </p>
              </div>
            </div>
            <Switch id="invoice-notifs" defaultChecked disabled />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconLock className="size-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">Manage via your account profile</p>
            </div>
            <ManageAccountButton label="Change Password" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Enhanced account security</p>
            </div>
            <ManageAccountButton label="Setup 2FA" />
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Contact us at (978) 555-1234 to make changes to your account settings.
      </p>
    </div>
  );
}
