/**
 * Central site metadata configuration for SEO
 * Used by JSON-LD schemas, Open Graph, and sitemap generation
 */

export const siteMetadata = {
  name: "Angel Touch Homecare Services",
  shortName: "Angel Touch Homecare",
  description:
    "Compassionate, reliable, and personalized in-home care for seniors and individuals with disabilities in Greater Lowell, MA.",
  url: "https://angeltouch.services",
  
  // Contact information
  phone: {
    primary: "(978) 856-9358",
    secondary: "(254) 245-6917",
    // E.164 format for structured data
    primaryE164: "+19788569358",
    secondaryE164: "+12542456917",
  },
  email: "info@angeltouch.services",
  
  // Physical address
  address: {
    streetAddress: "123 Main Street", // TODO: Update with actual address
    addressLocality: "Lowell",
    addressRegion: "MA",
    postalCode: "01852",
    addressCountry: "US",
  },
  
  // Geographic coordinates (Lowell, MA)
  geo: {
    latitude: 42.6334,
    longitude: -71.3162,
  },
  
  // Service area
  serviceAreas: [
    "Lowell",
    "Dracut",
    "Chelmsford",
    "Tewksbury",
    "Billerica",
  ] as const,
  
  // Business details
  priceRange: "$28-$35/hour",
  foundingDate: "2015",
  
  // Social profiles
  social: {
    facebook: "https://facebook.com/angeltouchhomecare",
    linkedin: "https://linkedin.com/company/angeltouchhomecare",
    instagram: "https://instagram.com/angeltouchhomecare",
  },
  
  // Images
  images: {
    logo: "/logo.png",
    ogImage: "/og-image.png",
    angelIcon: "/angel_pink.png",
  },
} as const;

export type ServiceArea = typeof siteMetadata.serviceAreas[number];

/**
 * Generate a canonical URL for a given path
 * @param path - The path relative to the site root (e.g., "/about", "/services")
 * @returns Full canonical URL (e.g., "https://angeltouch.services/about")
 */
export function getCanonicalUrl(path: string = ""): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const normalizedPath = cleanPath === "/" ? "" : cleanPath;
  return `${siteMetadata.url}${normalizedPath}`;
}

/**
 * Generate metadata alternates object with canonical URL
 * Use in page metadata exports
 */
export function getCanonicalAlternates(path: string = "") {
  return {
    canonical: getCanonicalUrl(path),
  };
}
