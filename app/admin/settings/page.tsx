import { getSiteSettings } from '@/app/actions/site-settings';
import { SettingsForm } from './settings-form';

export const metadata = {
  title: 'Site Settings',
  description: 'Configure site-wide banners, branding, and feature toggles',
};

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
        <p className="text-muted-foreground">
          Configure banners, branding accents, and other site-wide options
        </p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
