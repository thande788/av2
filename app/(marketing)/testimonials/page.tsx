import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconPhone } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TestimonialCardGrid } from "@/components/testimonials/testimonial-card";
import { testimonials as staticTestimonials } from "@/data/testimonials";
import { JsonLdGraph } from "@/components/seo";
import {
  createReviewSchema,
  createAggregateRatingSchema,
  getCanonicalAlternates,
  type TestimonialInput,
} from "@/lib/seo";
import { db } from "@/lib/db";
import type { Testimonial } from "@/types";

/**
 * Fetch testimonials from the database, combining published shift reviews
 * with manually-entered testimonials. Falls back to static data.
 */
async function getTestimonials(): Promise<Testimonial[]> {
  try {
    // Published client reviews
    const publishedReviews = await db.shiftReview.findMany({
      where: {
        isPublished: true,
        reviewerType: "CLIENT",
        comment: { not: null },
      },
      include: {
        shift: {
          include: {
            client: {
              include: { user: true },
            },
          },
        },
      },
      orderBy: { publishedAt: "desc" },
    });

    // Manual testimonials from the Testimonial model
    const manualTestimonials = await db.testimonial.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });

    const combined: Testimonial[] = [];

    // Map published shift reviews to Testimonial shape
    for (const review of publishedReviews) {
      const client = review.shift.client;
      combined.push({
        id: review.id,
        name: `${client.user.firstName} ${client.user.lastName}`,
        text: review.comment!,
        relation: client.relationship || "Client",
        rating: review.rating,
        date: review.publishedAt
          ? new Date(review.publishedAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
          : undefined,
      });
    }

    // Map manual testimonials
    for (const t of manualTestimonials) {
      combined.push({
        id: t.id,
        name: t.name,
        text: t.content,
        relation: t.role || "Client",
        rating: t.rating ?? undefined,
        avatarUrl: t.imageUrl ?? undefined,
        date: new Date(t.createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      });
    }

    if (combined.length === 0) {
      return staticTestimonials;
    }

    return combined;
  } catch {
    return staticTestimonials;
  }
}

// Convert testimonials to schema format and generate review schemas
const staticTestimonialInputs: TestimonialInput[] = staticTestimonials.map((t) => ({
  id: t.id,
  content: t.text,
  author: t.name,
  rating: t.rating,
  relationship: t.relation,
}));

const reviewSchemas = staticTestimonialInputs.map((t) => createReviewSchema(t));
const aggregateRatingSchema = createAggregateRatingSchema(staticTestimonialInputs);

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "Read stories from families who trust Angel Touch Homecare for compassionate, personalized home care services in the Greater Lowell area.",
  keywords: [
    "home care testimonials",
    "caregiver reviews",
    "Angel Touch reviews",
    "home care Lowell reviews",
    "family caregiver testimonials",
  ],
  alternates: getCanonicalAlternates("/testimonials"),
  openGraph: {
    title: "Client Testimonials | Angel Touch Homecare",
    description:
      "Hear from the families and clients who have experienced the compassionate care that makes Angel Touch special.",
    type: "website",
  },
};

/**
 * Testimonials page
 *
 * Displays client testimonials in a responsive grid layout
 * replacing the legacy carousel with a more accessible approach.
 */
export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <>
      <JsonLdGraph schemas={[aggregateRatingSchema, ...reviewSchemas]} />
      <main className="min-h-screen" aria-label="Client Testimonials">
        {/* Hero Section */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto mt-4 mb-14 md:mb-18">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://images.pexels.com/photos/5493781/pexels-photo-5493781.jpeg?auto=compress&cs=tinysrgb&w=1600"
              alt="Care and trust between families and caregivers"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />
          </div>

          <div className="relative z-10 px-6 md:px-10 py-14 md:py-20">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold text-decorative mb-6 leading-tight">
                Stories from Our
                <br />
                <span className="text-primary">Families</span>
              </h1>
              <p className="italic text-xl md:text-2xl text-decorative/70 mb-8 leading-relaxed">
                Hear from the families and clients who have experienced the
                compassionate care that makes Angel Touch special.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="px-6 text-base sm:px-8 sm:text-lg"
                >
                  <Link href="/contact">Get Started</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="px-6 text-base sm:px-8 sm:text-lg"
                >
                  <a href="#testimonials">Browse Testimonials</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section
        id="testimonials"
        className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20 scroll-mt-24"
        aria-labelledby="testimonials-heading"
      >
        <h2 id="testimonials-heading" className="sr-only">
          Client Testimonials
        </h2>

        <Card className="relative overflow-hidden p-6 sm:p-8 md:p-12 bg-card/50 border-border/50">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/0.10),transparent_60%)]"
            aria-hidden="true"
          />
          <div className="relative z-10">
            <TestimonialCardGrid testimonials={testimonials} />
          </div>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto mb-16">
        <Card
          className={cn(
            "p-8 md:p-12 text-center",
            "bg-gradient-to-r from-primary to-primary/80",
            "text-primary-foreground border-0"
          )}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Experience Compassionate Care?
          </h2>
          <p className="text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed mb-8">
            Join the families who trust Angel Touch for reliable, personalized
            home care services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="font-bold text-base sm:text-lg"
            >
              <Link href="/contact">Schedule Free Consultation</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-sm sm:text-base"
            >
              <a href="tel:978-856-9358">
                <IconPhone className="mr-2 size-4" />
                Call (978) 856-9358
              </a>
            </Button>
          </div>
        </Card>
      </section>
      </main>
    </>
  );
}
