"use client";

import Link from "next/link";
import { 
  IconArrowLeft, 
  IconMapPin, 
  IconCurrencyDollar, 
  IconBriefcase,
  IconChecklist,
  IconStar,
  IconHeart,
  IconCalendarEvent,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatSalaryRange, formatJobType, formatDepartment } from "@/data/jobs";
import type { JobListingProps } from "@/types/job";

/**
 * JobListing component displays the full details of a job
 * Used on individual job pages (/careers/[slug])
 */
export function JobListing({ job }: JobListingProps) {
  const departmentColors: Record<string, string> = {
    caregiving: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    nursing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    administrative: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  };

  const typeColors: Record<string, string> = {
    "full-time": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    "part-time": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    "per-diem": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  };

  return (
    <article className="max-w-4xl mx-auto">
      {/* Back Link */}
      <Link 
        href="/careers"
        className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <IconArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
        Back to all positions
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge 
            variant="secondary" 
            className={departmentColors[job.department]}
          >
            {formatDepartment(job.department)}
          </Badge>
          <Badge 
            variant="secondary"
            className={typeColors[job.type]}
          >
            {formatJobType(job.type)}
          </Badge>
          {!job.isActive && (
            <Badge variant="destructive">Position Closed</Badge>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          {job.title}
        </h1>

        <div className="flex flex-wrap gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <IconMapPin className="h-5 w-5" aria-hidden="true" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <IconCurrencyDollar className="h-5 w-5" aria-hidden="true" />
            <span>{formatSalaryRange(job)}</span>
          </div>
          <div className="flex items-center gap-2">
            <IconCalendarEvent className="h-5 w-5" aria-hidden="true" />
            <span>
              Posted {new Date(job.postedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </header>

      {/* Apply CTA - Sticky on mobile */}
      <div className="bg-card border rounded-lg p-6 mb-8 sticky top-20 z-10 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <p className="font-medium">Interested in this position?</p>
            <p className="text-sm text-muted-foreground">
              Submit your application today!
            </p>
          </div>
          <Button size="lg" asChild className="w-full sm:w-auto">
            <Link href={`/careers/${job.slug}/apply`}>
              <IconBriefcase className="mr-2 h-5 w-5" aria-hidden="true" />
              Apply Now
            </Link>
          </Button>
        </div>
      </div>

      {/* Description */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <IconHeart className="h-5 w-5 text-primary" aria-hidden="true" />
          About This Role
        </h2>
        <div className="prose prose-gray dark:prose-invert max-w-none">
          {job.description.split("\n\n").map((paragraph, index) => (
            <p key={index} className="text-muted-foreground leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <Separator className="my-8" />

      {/* Responsibilities */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <IconChecklist className="h-5 w-5 text-primary" aria-hidden="true" />
          Key Responsibilities
        </h2>
        <ul className="space-y-3">
          {job.responsibilities.map((responsibility, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <span className="text-muted-foreground">{responsibility}</span>
            </li>
          ))}
        </ul>
      </section>

      <Separator className="my-8" />

      {/* Qualifications */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <IconStar className="h-5 w-5 text-primary" aria-hidden="true" />
          Qualifications
        </h2>

        {/* Required */}
        <div className="mb-6">
          <h3 className="font-medium mb-3 text-green-700 dark:text-green-400">
            Required
          </h3>
          <ul className="space-y-2">
            {job.qualifications.required.map((qual, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                <span className="text-muted-foreground">{qual}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Preferred */}
        {job.qualifications.preferred.length > 0 && (
          <div>
            <h3 className="font-medium mb-3 text-blue-700 dark:text-blue-400">
              Preferred (Nice to Have)
            </h3>
            <ul className="space-y-2">
              {job.qualifications.preferred.map((qual, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">○</span>
                  <span className="text-muted-foreground">{qual}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <Separator className="my-8" />

      {/* Benefits */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <IconHeart className="h-5 w-5 text-primary" aria-hidden="true" />
          What We Offer
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {job.benefits.map((benefit, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10"
            >
              <span className="text-primary">★</span>
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Ready to Join Our Team?</h2>
        <p className="text-muted-foreground mb-6">
          Take the next step in your caregiving career with Angel Touch Homecare.
        </p>
        <Button size="lg" asChild>
          <Link href={`/careers/${job.slug}/apply`}>
            <IconBriefcase className="mr-2 h-5 w-5" aria-hidden="true" />
            Apply for This Position
          </Link>
        </Button>
      </div>
    </article>
  );
}

export default JobListing;
