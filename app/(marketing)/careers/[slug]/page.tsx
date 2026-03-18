import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobListing } from "@/components/careers/job-listing";
import { formatSalaryRange, formatJobType } from "@/data/jobs";
import { fetchJobBySlug, fetchJobSlugs } from "@/lib/jobs";

interface JobPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Generate static paths for all jobs at build time
 */
export async function generateStaticParams() {
  const slugs = await fetchJobSlugs();
  return slugs.map((slug) => ({ slug }));
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await fetchJobBySlug(slug);

  if (!job) {
    return {
      title: "Job Not Found | Angel Touch Homecare Services",
    };
  }

  return {
    title: `${job.title} | Careers | Angel Touch Homecare Services`,
    description: `Apply for ${job.title} at Angel Touch Homecare Services. ${formatJobType(job.type)} position in ${job.location}. ${formatSalaryRange(job)}. Join our compassionate team!`,
    keywords: [
      job.title,
      `${job.title} job`,
      `${job.department} jobs Lowell MA`,
      "home care jobs Massachusetts",
      "caregiver positions",
    ],
    openGraph: {
      title: `${job.title} - Join Our Team`,
      description: `${formatJobType(job.type)} • ${job.location} • ${formatSalaryRange(job)}`,
      type: "website",
    },
  };
}

export default async function JobPage({ params }: JobPageProps) {
  const { slug } = await params;
  const job = await fetchJobBySlug(slug);

  if (!job) {
    notFound();
  }

  return (
    <div className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <JobListing job={job} />
      </div>
    </div>
  );
}
