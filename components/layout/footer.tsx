import Link from "next/link";
import Image from "next/image";
import { IconPhone, IconMail, IconArrowRight, IconBrandFacebook, IconBrandLinkedin, IconBrandInstagram } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  footerNavLinks,
  policyLinks,
  companyDescription,
  licensingBadge,
  accessibilityBadges,
  bottomTagline,
} from "@/data/footer";
import { getSiteSettings } from "@/app/actions/site-settings";
import type { FooterProps } from "@/types/footer";

/**
 * Site footer with contact info, navigation, and social links.
 * Reads contact data from DB-backed site settings with static defaults.
 */
export async function Footer({
  className,
  includeStructuredData = true,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  let settings;
  try {
    settings = await getSiteSettings();
  } catch {
    settings = null;
  }

  const phones = [
    settings?.['contact.phonePrimary'] || '(978) 856-9358',
    settings?.['contact.phoneSecondary'] || '(254) 245-6917',
  ].filter(Boolean);
  const email = settings?.['contact.email'] || 'info@angeltouch.services';
  const serviceArea = settings?.['contact.serviceArea'] || 'Serving Lowell, Dracut, Chelmsford, Tewksbury & Billerica';

  const socialLinks = [
    { platform: 'Facebook', href: settings?.['social.facebook'] || 'https://facebook.com/angeltouchhomecare', icon: <IconBrandFacebook className="size-5" /> },
    { platform: 'LinkedIn', href: settings?.['social.linkedin'] || 'https://linkedin.com/company/angeltouchhomecare', icon: <IconBrandLinkedin className="size-5" /> },
    ...(settings?.['social.instagram'] ? [{ platform: 'Instagram', href: settings['social.instagram'], icon: <IconBrandInstagram className="size-5" /> }] : []),
  ].filter((s) => s.href);

  const address = {
    city: settings?.['address.city'] || 'Lowell',
    state: settings?.['address.state'] || 'MA',
  };
  const primaryPhoneE164 = `+1${phones[0]?.replace(/\D/g, '')}`;

  return (
    <footer
      aria-label="Site Footer"
      className={cn(
        "relative mt-20",
        // Footer always uses dark background regardless of theme
        "bg-gradient-to-b from-[#1a2332]/95 via-[#1a2332] to-[#050a17]",
        "text-white backdrop-blur-sm",
        "border-t border-white/10",
        className
      )}
    >
      {/* Decorative top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-decorative via-accent-rose-deep to-decorative opacity-80"
        aria-hidden="true"
      />

      <div className="app-shell relative py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14">
          {/* Brand / Description */}
          <div className="md:col-span-5 lg:col-span-4">
            <div className="flex items-center gap-3 mb-5">
              <span className="relative inline-flex items-center justify-center size-12 sm:size-14 md:size-16 overflow-hidden rounded-lg">
                <Image
                  src="/angel_pink.png"
                  width={200}
                  height={200}
                  alt="Angel Touch Homecare logo"
                  className="size-full object-contain select-none drop-shadow-md"
                  loading="lazy"
                />
              </span>
              <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap">
                Angel Touch Homecare
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/80 max-w-sm">
              {companyDescription}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-[11px] tracking-wide uppercase text-white/70">
              {licensingBadge}
            </div>
          </div>

          {/* Quick Links */}
          <nav
            className="md:col-span-3 lg:col-span-3"
            aria-labelledby="footer-quick-links"
          >
            <h3
              id="footer-quick-links"
              className="text-sm font-semibold tracking-wider text-white/90 mb-4 uppercase"
            >
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              {footerNavLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "inline-flex items-center gap-1",
                      "text-white/70 hover:text-icon",
                      "transition-colors duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-icon focus-visible:ring-offset-2 focus-visible:ring-offset-primary-navy",
                      "rounded-sm"
                    )}
                  >
                    <span>{link.label}</span>
                    <IconArrowRight
                      className="size-3 opacity-60"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div
            className="md:col-span-4 lg:col-span-3"
            aria-labelledby="footer-contact"
          >
            <h3
              id="footer-contact"
              className="text-sm font-semibold tracking-wider text-white/90 mb-4 uppercase"
            >
              Contact
            </h3>
            <ul className="space-y-3 text-sm">
              {phones.map((phone, index) => (
                <li key={index}>
                  <a
                    href={`tel:${phone.replace(/\D/g, "")}`}
                    className={cn(
                      "inline-flex items-center gap-3",
                      "text-white/80 hover:text-icon",
                      "transition-colors whitespace-nowrap",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-icon focus-visible:ring-offset-2 focus-visible:ring-offset-primary-navy",
                      "rounded-sm"
                    )}
                  >
                    <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/10 text-icon">
                      <IconPhone className="size-4" />
                    </span>
                    <span className="leading-none">{phone}</span>
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${email}`}
                  className={cn(
                    "inline-flex items-center gap-3",
                    "text-white/80 hover:text-icon",
                    "transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-icon focus-visible:ring-offset-2 focus-visible:ring-offset-primary-navy",
                    "rounded-sm"
                  )}
                >
                  <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/10 text-icon">
                    <IconMail className="size-4" />
                  </span>
                  <span>{email}</span>
                </a>
              </li>
              <li className="text-xs text-white/60 leading-relaxed pl-0">
                {serviceArea}
              </li>
            </ul>
          </div>

          {/* Social / Policies */}
          <div
            className="md:col-span-12 lg:col-span-2 flex md:block flex-col gap-6"
            aria-labelledby="footer-social"
          >
            <div>
              <h3
                id="footer-social"
                className="text-sm font-semibold tracking-wider text-white/90 mb-4 uppercase"
              >
                Follow Us
              </h3>
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.platform}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.platform}
                    className={cn(
                      "group",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-icon focus-visible:ring-offset-2 focus-visible:ring-offset-primary-navy",
                      "rounded-xl"
                    )}
                  >
                    <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-icon group-hover:bg-white/20 transition-colors">
                      {social.icon}
                    </span>
                  </a>
                ))}
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {policyLinks.map((link) => (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-white/60 hover:text-icon",
                      "transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-icon focus-visible:ring-offset-2 focus-visible:ring-offset-primary-navy",
                      "rounded-sm"
                    )}
                  >
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <Separator className="mt-14 mb-8 bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {/* Legal + Accessibility */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-white/60">
          <div>
            © {currentYear} Angel Touch Homecare. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {accessibilityBadges.map((badge) => (
              <span key={badge}>{badge}</span>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[11px] tracking-wide text-white/55 uppercase">
            {bottomTagline}
          </p>
        </div>
      </div>

      {/* Structured Data: Organization */}
      {includeStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Angel Touch Homecare",
              url: "https://angeltouch.services",
              logo: "https://angeltouch.services/angel_pink.png",
              image: "https://angeltouch.services/angel_pink.png",
              email: email,
              telephone: primaryPhoneE164,
              sameAs: socialLinks.map((s) => s.href),
              address: {
                "@type": "PostalAddress",
                addressLocality: address.city,
                addressRegion: address.state,
                addressCountry: "US",
              },
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  telephone: primaryPhoneE164,
                  contactType: "customer service",
                  areaServed: "US-MA",
                  availableLanguage: ["English"],
                },
              ],
            }),
          }}
        />
      )}
    </footer>
  );
}
