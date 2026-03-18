import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconPhone } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FAQSection } from "@/components/faqs";
import { faqs as staticFaqs } from "@/data/faqs";
import { JsonLd } from "@/components/seo";
import { createFAQPageSchema, getCanonicalAlternates } from "@/lib/seo";
import type { FAQItem } from "@/types/faq";

async function getFAQs(): Promise<FAQItem[]> {
  try {
    const rows = await db.fAQ.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
    });
    if (rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        question: r.question,
        answer: r.answer,
        category: r.category ?? undefined,
      }));
    }
  } catch {
    // DB unavailable — fall through to static
  }
  return staticFaqs;
}

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "Find answers to common questions about Angel Touch Homecare services, caregiver qualifications, payment options, and getting started with home care.",
  keywords: [
    "home care FAQ",
    "caregiver questions",
    "home care services Lowell",
    "homecare payment options",
    "HIPAA compliant home care",
  ],
  alternates: getCanonicalAlternates("/faqs"),
  openGraph: {
    title: "Frequently Asked Questions | Angel Touch Homecare",
    description:
      "Find answers to common questions about our compassionate home care services in the Greater Lowell area.",
    type: "website",
  },
};

/**
 * FAQs page
 *
 * Server component that displays frequently asked questions
 * using the FAQSection component from Sprint 3.
 */
export default async function FAQsPage() {
  const faqs = await getFAQs();
  const faqSchema = createFAQPageSchema(faqs);

  return (
    <>
      <JsonLd data={faqSchema} />
      <main className="min-h-screen" aria-label="Frequently Asked Questions">
        {/* Hero Section */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto mt-4 mb-14 md:mb-18">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://images.pexels.com/photos/7551615/pexels-photo-7551615.jpeg?auto=compress&cs=tinysrgb&w=1600"
              alt="Frequently asked questions"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/30 to-transparent" />
          </div>

          <div className="relative z-10 px-6 md:px-10 py-14 md:py-20">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold text-decorative mb-6 leading-tight">
                Frequently Asked
                <br />
                <span className="text-primary">Questions</span>
              </h1>
              <p className="italic text-xl md:text-2xl text-decorative/70 mb-8 leading-relaxed">
                Clear answers about our home care services, caregivers, and
                getting started.
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
                  <a href="#faqs">Browse FAQs</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faqs"
        className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20 scroll-mt-24"
      >
        <Card className="relative overflow-hidden p-6 sm:p-8 md:p-12 bg-card/50 border-border/50">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/0.10),transparent_60%)]"
            aria-hidden="true"
          />
          <div className="relative z-10">
            <FAQSection
              items={faqs}
              title=""
              description="Get answers to the most common questions about our home care services."
              showCTA={false}
            />
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
            Still Have Questions?
          </h2>
          <p className="text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed mb-8">
            Reach out anytime—our team will walk you through options and next
            steps.
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
