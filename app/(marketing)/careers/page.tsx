import type { Metadata } from "next";
import Link from "next/link";
import { IconBriefcase, IconUsers, IconHeart } from "@tabler/icons-react";
import { JobCard } from "@/components/careers/job-card";
import { BenefitsSection } from "@/components/careers/benefits-section";
import { formatDepartment } from "@/data/jobs";
import { Button } from "@/components/ui/button";
import { JsonLdGraph } from "@/components/seo";
import { createJobPostingSchema, organizationSchema, getCanonicalAlternates } from "@/lib/seo";
import { fetchActiveJobs } from "@/lib/jobs";
import type { Job } from "@/types/job";

export const metadata: Metadata = {
  title: "Careers | Join Our Team | Angel Touch Homecare Services",
  description:
    "Join the Angel Touch Homecare Services team! We're hiring compassionate caregivers, CNAs, and home health aides in the Greater Lowell, MA area. Competitive pay, flexible schedules, and meaningful work.",
  keywords: [
    "home health aide jobs Lowell MA",
    "caregiver jobs Massachusetts",
    "CNA jobs near me",
    "home care careers",
    "Angel Touch Homecare careers",
    "healthcare jobs Lowell",
  ],
  alternates: getCanonicalAlternates("/careers"),
  openGraph: {
    title: "Careers at Angel Touch Homecare Services",
    description:
      "Join our team of compassionate caregivers. Competitive pay, flexible schedules, and the opportunity to make a difference.",
    type: "website",
  },
};

export default async function CareersPage() {
  const jobs = await fetchActiveJobs();
  const departments = Array.from(new Set(jobs.map((j) => j.department)));

  // Generate JSON-LD schemas for active positions
  const jobSchemas = jobs.map((job) => createJobPostingSchema(job));

  return (
    <>
      <JsonLdGraph schemas={[organizationSchema, ...jobSchemas]} />
      <div className="min-h-screen">
        {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <IconBriefcase className="h-4 w-4" />
              We&apos;re Hiring
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Build a Career That{" "}
              <span className="text-primary">Makes a Difference</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Join the Angel Touch family and become part of a team dedicated to providing 
              compassionate, quality care to seniors in the Greater Lowell area. 
              We offer competitive pay, flexible schedules, and the rewarding experience 
              of helping others maintain their independence and dignity.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="#open-positions">
                  View Open Positions
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">
                  Learn About Us
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="container mx-auto px-4 mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: "10+", label: "Years Serving the Community" },
              { value: "50+", label: "Dedicated Caregivers" },
              { value: "500+", label: "Families Served" },
              { value: "4.9★", label: "Employee Satisfaction" },
            ].map((stat) => (
              <div 
                key={stat.label}
                className="text-center p-4 rounded-lg bg-card border"
              >
                <div className="text-2xl md:text-3xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Open Positions */}
      <section id="open-positions" className="py-16 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Open Positions
            </h2>
            <p className="text-muted-foreground text-lg">
              Explore our current job openings and find the perfect fit for your skills and career goals.
            </p>
          </div>

          {/* Department Filter Pills */}
          {departments.length > 1 && (
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              <span className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                All Positions ({jobs.length})
              </span>
              {departments.map((dept) => (
                <span
                  key={dept}
                  className="px-4 py-2 bg-muted rounded-full text-sm font-medium text-muted-foreground"
                >
                  {formatDepartment(dept)} ({jobs.filter(j => j.department === dept).length})
                </span>
              ))}
            </div>
          )}

          {/* Job Cards Grid */}
          {jobs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {jobs.map((job) => (
                <JobCard key={job.slug} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-xl max-w-2xl mx-auto">
              <IconUsers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Open Positions</h3>
              <p className="text-muted-foreground mb-4">
                We don&apos;t have any openings right now, but we&apos;re always looking for talented caregivers.
              </p>
              <Button variant="outline" asChild>
                <Link href="/contact">
                  Contact Us About Future Opportunities
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <IconHeart className="h-12 w-12 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl font-bold mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Join our team of compassionate caregivers and help seniors in your community 
              live their best lives. We&apos;d love to hear from you!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                asChild
              >
                <a href="#open-positions">
                  Browse Open Positions
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="/contact">
                  General Inquiry
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
