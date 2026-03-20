import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  IconBell,
  IconMail,
  IconDeviceMobile,
  IconLock,
  IconAlertCircle,
  IconUser,
  IconMapPin,
} from '@tabler/icons-react';

export const metadata = {
  title: 'Settings',
  description: 'Manage your account settings',
};

export default async function ClientSettingsPage() {
  const demoClient = await db.client.findFirst({
    where: {
      user: { status: 'ACTIVE' },
    },
    include: { user: true },
  });

  if (!demoClient) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <IconAlertCircle className="size-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">No Account Found</h2>
        <p className="text-muted-foreground">Please contact your administrator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <p className="font-medium">
                {demoClient.user.firstName} {demoClient.user.lastName}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium">{demoClient.user.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Phone</Label>
              <p className="font-medium">{demoClient.user.phone || 'Not provided'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Relationship</Label>
              <p className="font-medium">{demoClient.relationship || 'Not specified'}</p>
            </div>
          </div>
          <Button variant="outline" disabled>
            Edit Profile
          </Button>
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <p className="font-medium">{demoClient.careRecipientName || 'Same as account holder'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Service Level</Label>
              <Badge variant="secondary">{demoClient.serviceLevel}</Badge>
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Care Address</Label>
            <div className="flex items-start gap-2 mt-1">
              <IconMapPin className="size-4 text-muted-foreground mt-0.5" />
              <p className="font-medium">
                {demoClient.street}<br />
                {demoClient.city}, {demoClient.state} {demoClient.zip}
              </p>
            </div>
          </div>
          <Button variant="outline" disabled>
            Update Care Information
          </Button>
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
              <p className="text-sm text-muted-foreground">Last changed: Never (using SSO)</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Change Password
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Enhanced account security</p>
            </div>
            <Badge variant="outline" className="bg-amber-500/15 text-amber-600">
              Not Enabled
            </Badge>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Contact us at (978) 555-1234 to make changes to your account settings.
      </p>
    </div>
  );
}
