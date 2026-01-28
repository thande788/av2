/**
 * JSON-LD Schema Generators
 * 
 * Creates structured data schemas for SEO following schema.org specifications.
 * These help search engines understand content and enable rich snippets.
 * 
 * @see https://schema.org
 * @see https://developers.google.com/search/docs/appearance/structured-data
 */

import type {
  Organization,
  MedicalBusiness,
  Service,
  FAQPage,
  JobPosting,
  Review,
  WithContext,
} from "schema-dts";
import { siteMetadata } from "./site-metadata";
import type { Job } from "@/types/job";
import type { FAQItem } from "@/types/faq";

/**
 * Base organization schema used across multiple schemas
 */
export const organizationSchema: WithContext<Organization> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteMetadata.url}/#organization`,
  name: siteMetadata.name,
  url: siteMetadata.url,
  logo: `${siteMetadata.url}${siteMetadata.images.logo}`,
  description: siteMetadata.description,
  telephone: siteMetadata.phone.primaryE164,
  email: siteMetadata.email,
  foundingDate: siteMetadata.foundingDate,
  contactPoint: {
    "@type": "ContactPoint",
    telephone: siteMetadata.phone.primaryE164,
    contactType: "customer service",
    availableLanguage: ["English"],
    areaServed: siteMetadata.serviceAreas.map((city) => ({
      "@type": "City",
      name: city,
    })),
  },
  sameAs: [
    siteMetadata.social.facebook,
    siteMetadata.social.linkedin,
    siteMetadata.social.instagram,
  ],
  address: {
    "@type": "PostalAddress",
    ...siteMetadata.address,
  },
};

/**
 * LocalBusiness schema for home page
 */
export const localBusinessSchema: WithContext<MedicalBusiness> = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "@id": `${siteMetadata.url}/#localbusiness`,
  name: siteMetadata.name,
  description: siteMetadata.description,
  url: siteMetadata.url,
  telephone: siteMetadata.phone.primaryE164,
  email: siteMetadata.email,
  priceRange: siteMetadata.priceRange,
  image: `${siteMetadata.url}${siteMetadata.images.logo}`,
  logo: `${siteMetadata.url}${siteMetadata.images.logo}`,
  foundingDate: siteMetadata.foundingDate,
  address: {
    "@type": "PostalAddress",
    ...siteMetadata.address,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: siteMetadata.geo.latitude,
    longitude: siteMetadata.geo.longitude,
  },
  areaServed: siteMetadata.serviceAreas.map((city) => ({
    "@type": "City",
    name: city,
    containedInPlace: {
      "@type": "State",
      name: "Massachusetts",
    },
  })),
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "00:00",
    closes: "23:59",
  },
  sameAs: [
    siteMetadata.social.facebook,
    siteMetadata.social.linkedin,
    siteMetadata.social.instagram,
  ],
};

/**
 * Service schema for individual services
 */
export interface ServiceInput {
  name: string;
  description: string;
  category?: string;
}

export function createServiceSchema(
  service: ServiceInput
): WithContext<Service> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: {
      "@type": "LocalBusiness",
      name: siteMetadata.name,
      "@id": `${siteMetadata.url}/#localbusiness`,
    },
    areaServed: siteMetadata.serviceAreas.map((city) => ({
      "@type": "City",
      name: city,
    })),
    serviceType: service.category || "Home Health Care",
  };
}

/**
 * FAQPage schema for FAQ sections
 */
export function createFAQPageSchema(faqs: FAQItem[]): WithContext<FAQPage> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * JobPosting schema for career listings
 */
export function createJobPostingSchema(job: Job): WithContext<JobPosting> {
  const employmentTypeMap: Record<string, string> = {
    "full-time": "FULL_TIME",
    "part-time": "PART_TIME",
    "per-diem": "PER_DIEM",
    contract: "CONTRACTOR",
  };

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.postedAt.toISOString(),
    validThrough: job.closesAt?.toISOString(),
    employmentType: employmentTypeMap[job.type] || "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: siteMetadata.name,
      sameAs: siteMetadata.url,
      logo: `${siteMetadata.url}${siteMetadata.images.logo}`,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location || "Lowell",
        addressRegion: "MA",
        addressCountry: "US",
      },
    },
    baseSalary: job.salaryRange
      ? {
          "@type": "MonetaryAmount",
          currency: "USD",
          value: {
            "@type": "QuantitativeValue",
            minValue: job.salaryRange.min,
            maxValue: job.salaryRange.max,
            unitText: job.salaryRange.period === "hourly" ? "HOUR" : "YEAR",
          },
        }
      : undefined,
    applicantLocationRequirements: {
      "@type": "Country",
      name: "United States",
    },
    jobBenefits: job.benefits?.join(", "),
  };
}

/**
 * Review schema for testimonials
 */
export interface TestimonialInput {
  id: string;
  content: string;
  author: string;
  rating?: number;
  date?: Date;
  relationship?: string;
}

export function createReviewSchema(
  testimonial: TestimonialInput
): WithContext<Review> {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    reviewBody: testimonial.content,
    author: {
      "@type": "Person",
      name: testimonial.author,
    },
    reviewRating: testimonial.rating
      ? {
          "@type": "Rating",
          ratingValue: testimonial.rating,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    datePublished: testimonial.date?.toISOString(),
    itemReviewed: {
      "@id": `${siteMetadata.url}/#localbusiness`,
    },
  };
}

/**
 * Aggregate rating schema for testimonials page
 */
export function createAggregateRatingSchema(
  testimonials: TestimonialInput[]
): WithContext<MedicalBusiness> {
  const ratingsWithValues = testimonials.filter((t) => t.rating);
  const avgRating =
    ratingsWithValues.length > 0
      ? ratingsWithValues.reduce((sum, t) => sum + (t.rating || 0), 0) /
        ratingsWithValues.length
      : 5;

  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": `${siteMetadata.url}/#localbusiness`,
    name: siteMetadata.name,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avgRating.toFixed(1),
      reviewCount: testimonials.length,
      bestRating: 5,
      worstRating: 1,
    },
  };
}
