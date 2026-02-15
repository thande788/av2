import {
  IconBrandFacebook,
  IconBrandLinkedin,
} from "@tabler/icons-react";
import type { FooterLink, ContactInfo, SocialLink } from "@/types/footer";

/**
 * Quick navigation links for the footer
 */
export const footerNavLinks: FooterLink[] = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "FAQs", href: "/faqs" },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
  { label: "Careers", href: "/careers" },
  { label: "Portals", href: "/portals" },
];

/**
 * Legal/policy links for the footer
 */
export const policyLinks: FooterLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

/**
 * Contact information
 */
export const contactInfo: ContactInfo = {
  phones: ["(978) 856-9358", "(254) 245-6917"],
  email: "info@angeltouch.services",
  serviceArea: "Serving Lowell, Dracut, Chelmsford, Tewksbury & Billerica",
};

/**
 * Social media links
 */
export const socialLinks: SocialLink[] = [
  {
    platform: "Facebook",
    href: "https://www.facebook.com/angeltouchhomecare",
    icon: <IconBrandFacebook className="size-5" />,
  },
  {
    platform: "LinkedIn",
    href: "https://www.linkedin.com/company/angeltouchhomecare",
    icon: <IconBrandLinkedin className="size-5" />,
  },
];

/**
 * Company tagline for the footer
 */
export const companyDescription =
  "Compassionate, reliable, and personalized in-home care for seniors & individuals with disabilities in Greater Lowell.";

/**
 * Badge text for licensing info
 */
export const licensingBadge = "Licensed & Insured • 24/7 Support";

/**
 * Bottom bar badges
 */
export const accessibilityBadges = [
  "Accessible & Mobile-First Design",
  "WCAG-Focused UI",
  "Secure & Private",
];

/**
 * Bottom tagline
 */
export const bottomTagline =
  "Licensed & Insured • Background-Checked Caregivers • 24/7 On-Call Support";
