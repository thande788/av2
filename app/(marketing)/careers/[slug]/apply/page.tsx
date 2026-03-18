import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft, IconMapPin, IconCurrencyDollar, IconClock } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { ApplicationForm } from "@/components/careers/application-form";
import { formatSalaryRange, formatJobType, formatDepartment } from "@/data/jobs";
import { fetchJobBySlug, fetchJobSlugs } from "@/lib/jobs";

interface ApplyPageProps {
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
export async function generateMetadata({ params }: ApplyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await fetchJobBySlug(slug);

  if (!job) {
    return {
      title: "Job Not Found | Angel Touch Homecare Services",
    };
  }

  return {
    title: `Apply for ${job.title} | Careers | Angel Touch Homecare Services`,
    description: `Submit your application for ${job.title} at Angel Touch Homecare Services. ${formatJobType(job.type)} position in ${job.location}.`,
    robots: {
      index: false, // Don't index application pages
    },
  };
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { slug } = await params;
  const job = await fetchJobBySlug(slug);

  if (!job) {
    notFound();
  }

  if (!job.isActive) {
    return (
      <div className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Position Closed</h1>
            <p className="text-muted-foreground mb-6">
              We&apos;re no longer accepting applications for this position. 
              Please check our other open positions.
            </p>
            <Link 
              href="/careers"
              className="inline-flex items-center text-primary hover:underline"
            >
              <IconArrowLeft className="mr-2 h-4 w-4" />
              View Open Positions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const departmentColors: Record<string, string> = {
    caregiving: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    nursing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    administrative: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  };

  return (
    <div className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Back Link */}
          <Link 
            href={`/careers/${job.slug}`}
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <IconArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back to job details
          </Link>

          {/* Job Summary Header */}
          <header className="bg-card border rounded-xl p-6 mb-8">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge 
                variant="secondary" 
                className={departmentColors[job.department]}
              >
                {formatDepartment(job.department)}
              </Badge>
              <Badge variant="outline">
                {formatJobType(job.type)}
              </Badge>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              Apply for: {job.title}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <IconMapPin className="h-4 w-4" aria-hidden="true" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IconCurrencyDollar className="h-4 w-4" aria-hidden="true" />
                <span>{formatSalaryRange(job)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IconClock className="h-4 w-4" aria-hidden="true" />
                <span>{formatJobType(job.type)}</span>
              </div>
            </div>
          </header>

          {/* Application Form */}
          <div className="bg-card border rounded-xl p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Application Form</h2>
              <p className="text-muted-foreground">
                Please fill out the form below to apply for this position. 
                Fields marked with * are required.
              </p>
            </div>

            <ApplicationForm job={job} />
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Questions about this position?{" "}
              <Link href="/contact" className="text-primary hover:underline">
                Contact us
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
