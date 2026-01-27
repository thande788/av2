import Link from "next/link";
import Image from "next/image";
import { IconPhone, IconMail, IconArrowRight } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  footerNavLinks,
  policyLinks,
  contactInfo,
  socialLinks,
  companyDescription,
  licensingBadge,
  accessibilityBadges,
  bottomTagline,
} from "@/data/footer";
import type { FooterProps } from "@/types/footer";

/**
 * Site footer with contact info, navigation, and social links
 */
export function Footer({
  className,
  includeStructuredData = true,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14">
          {/* Brand / Description */}
          <div className="md:col-span-5 lg:col-span-4">
            <div className="flex items-center gap-3 mb-5">
              <span className="relative inline-flex items-center justify-center w-16 h-16 sm:w-16 sm:h-16 md:w-20 md:h-20">
                <Image
                  src="/angel_pink.png"
                  width={80}
                  height={80}
                  alt="Angel Touch Homecare logo"
                  className="w-16 h-16 md:w-20 md:h-20 object-contain select-none drop-shadow-md"
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
              {contactInfo.phones.map((phone, index) => (
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
                  href={`mailto:${contactInfo.email}`}
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
                  <span>{contactInfo.email}</span>
                </a>
              </li>
              <li className="text-xs text-white/60 leading-relaxed pl-0">
                {contactInfo.serviceArea}
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
              email: contactInfo.email,
              telephone: "+1-978-856-9358",
              sameAs: socialLinks.map((s) => s.href),
              address: {
                "@type": "PostalAddress",
                addressLocality: "Lowell",
                addressRegion: "MA",
                addressCountry: "US",
              },
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  telephone: "+1-978-856-9358",
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
