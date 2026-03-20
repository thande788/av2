import { redirect } from 'next/navigation';
import { getCurrentWorker } from '@/lib/auth';
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
  IconPalette,
  IconLanguage,
  IconShieldCheck,
} from '@tabler/icons-react';
import { ManageAccountButton } from '@/components/shared/manage-account-button';

export const metadata = {
  title: 'Settings',
  description: 'Manage your account settings and preferences',
};

export default async function EmployeeSettingsPage() {
  // Get the current authenticated worker
  const worker = await getCurrentWorker();

  if (!worker) {
    redirect('/employee/complete-profile');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and notifications
        </p>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBell className="size-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Choose how you want to be notified about updates
          </CardDescription>
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
                  Receive shift assignments and updates via email
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
                  Receive important alerts via text message
                </p>
              </div>
            </div>
            <Switch id="sms-notifs" defaultChecked disabled />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconBell className="size-5 text-muted-foreground" />
              <div>
                <Label htmlFor="shift-reminders" className="font-medium">
                  Shift Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded 24 hours before scheduled shifts
                </p>
              </div>
            </div>
            <Switch id="shift-reminders" defaultChecked disabled />
          </div>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconLock className="size-5" />
            Account Security
          </CardTitle>
          <CardDescription>
            Manage your password and account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">
                Manage via your account profile
              </p>
            </div>
            <ManageAccountButton label="Change Password" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <ManageAccountButton label="Setup 2FA" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Active Sessions</p>
              <p className="text-sm text-muted-foreground">
                Manage devices where you&apos;re logged in
              </p>
            </div>
            <ManageAccountButton label="View Sessions" />
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconPalette className="size-5" />
            Preferences
          </CardTitle>
          <CardDescription>
            Customize your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconPalette className="size-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">
                  Choose between light and dark mode
                </p>
              </div>
            </div>
            <Badge variant="secondary">System Default</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconLanguage className="size-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Language</p>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred language
                </p>
              </div>
            </div>
            <Badge variant="secondary">English (US)</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconShieldCheck className="size-5" />
            Privacy
          </CardTitle>
          <CardDescription>
            Manage your data and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Download Your Data</p>
              <p className="text-sm text-muted-foreground">
                Get a copy of your personal data
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Request Data
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-600 dark:text-red-400">
                Delete Account
              </p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive" size="sm" disabled>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Some settings are managed by your administrator and cannot be changed.
      </p>
    </div>
  );
}
