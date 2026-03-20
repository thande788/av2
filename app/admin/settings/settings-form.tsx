'use client';

import { useState, useTransition } from 'react';
import {
  updateSiteSettings,
  type SiteSettings,
} from '@/app/actions/site-settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Megaphone,
  Briefcase,
  Palette,
  Save,
  Loader2,
} from 'lucide-react';

interface SettingsFormProps {
  initialSettings: SiteSettings;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [isPending, startTransition] = useTransition();

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateSiteSettings(settings);
      if (result.success) {
        toast.success('Settings saved successfully');
      } else {
        toast.error(result.error ?? 'Failed to save settings');
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* ── Hiring Banner ───────────────────────────────────────── */}
      <section className="rounded-xl border p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2.5">
            <Briefcase className="size-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Hiring Banner</h2>
            <p className="text-sm text-muted-foreground">
              Promotional banner shown across the marketing site
            </p>
          </div>
          <div className="ml-auto">
            <Badge variant={settings['hiringBanner.enabled'] ? 'default' : 'secondary'}>
              {settings['hiringBanner.enabled'] ? 'Active' : 'Disabled'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="hiringBanner.enabled">Show hiring banner</Label>
          <Switch
            id="hiringBanner.enabled"
            checked={settings['hiringBanner.enabled']}
            onCheckedChange={(v) => update('hiringBanner.enabled', v)}
          />
        </div>

        {settings['hiringBanner.enabled'] && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="hiringBanner.message">Message</Label>
              <Input
                id="hiringBanner.message"
                value={settings['hiringBanner.message']}
                onChange={(e) => update('hiringBanner.message', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hiringBanner.ctaText">Button text</Label>
              <Input
                id="hiringBanner.ctaText"
                value={settings['hiringBanner.ctaText']}
                onChange={(e) => update('hiringBanner.ctaText', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hiringBanner.ctaHref">Button link</Label>
              <Input
                id="hiringBanner.ctaHref"
                value={settings['hiringBanner.ctaHref']}
                onChange={(e) => update('hiringBanner.ctaHref', e.target.value)}
                placeholder="/careers"
              />
            </div>
          </div>
        )}
      </section>

      {/* ── Announcement Banner ─────────────────────────────────── */}
      <section className="rounded-xl border p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-500/10 p-2.5">
            <Megaphone className="size-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Announcement Banner</h2>
            <p className="text-sm text-muted-foreground">
              General-purpose banner for promotions or alerts
            </p>
          </div>
          <div className="ml-auto">
            <Badge variant={settings['announcementBanner.enabled'] ? 'default' : 'secondary'}>
              {settings['announcementBanner.enabled'] ? 'Active' : 'Disabled'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="announcementBanner.enabled">Show announcement banner</Label>
          <Switch
            id="announcementBanner.enabled"
            checked={settings['announcementBanner.enabled']}
            onCheckedChange={(v) => update('announcementBanner.enabled', v)}
          />
        </div>

        {settings['announcementBanner.enabled'] && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="announcementBanner.message">Message</Label>
              <Input
                id="announcementBanner.message"
                value={settings['announcementBanner.message']}
                onChange={(e) => update('announcementBanner.message', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="announcementBanner.ctaText">Button text</Label>
              <Input
                id="announcementBanner.ctaText"
                value={settings['announcementBanner.ctaText']}
                onChange={(e) => update('announcementBanner.ctaText', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="announcementBanner.ctaHref">Button link</Label>
              <Input
                id="announcementBanner.ctaHref"
                value={settings['announcementBanner.ctaHref']}
                onChange={(e) => update('announcementBanner.ctaHref', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="announcementBanner.variant">Style</Label>
              <Select
                value={settings['announcementBanner.variant']}
                onValueChange={(v) =>
                  update('announcementBanner.variant', v as SiteSettings['announcementBanner.variant'])
                }
              >
                <SelectTrigger id="announcementBanner.variant">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info (blue)</SelectItem>
                  <SelectItem value="warning">Warning (yellow)</SelectItem>
                  <SelectItem value="success">Success (green)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </section>

      {/* ── Brand Accents ───────────────────────────────────────── */}
      <section className="rounded-xl border p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2.5">
            <Palette className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Brand Accents</h2>
            <p className="text-sm text-muted-foreground">
              Toggle decorative color accents across the site
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="brandAccents.babyBlue">Baby Blue accents</Label>
              <p className="text-xs text-muted-foreground">
                Navbar highlights, decorative borders, card accents
              </p>
            </div>
            <Switch
              id="brandAccents.babyBlue"
              checked={settings['brandAccents.babyBlue']}
              onCheckedChange={(v) => update('brandAccents.babyBlue', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="brandAccents.rose">Rose accents</Label>
              <p className="text-xs text-muted-foreground">
                Icons, hover states, gradients
              </p>
            </div>
            <Switch
              id="brandAccents.rose"
              checked={settings['brandAccents.rose']}
              onCheckedChange={(v) => update('brandAccents.rose', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="brandAccents.useDeepRoseForIcons">Use deep rose for icons</Label>
              <p className="text-xs text-muted-foreground">
                Use #E37383 instead of base rose for icon colors
              </p>
            </div>
            <Switch
              id="brandAccents.useDeepRoseForIcons"
              checked={settings['brandAccents.useDeepRoseForIcons']}
              onCheckedChange={(v) => update('brandAccents.useDeepRoseForIcons', v)}
            />
          </div>
        </div>
      </section>

      {/* ── Save ─────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending} size="lg">
          {isPending ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : (
            <Save className="size-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
