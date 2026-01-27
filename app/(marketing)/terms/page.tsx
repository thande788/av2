import type { Metadata } from "next";
import { IconMail, IconScale } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
	title: "Terms of Service",
	description:
		"Terms and conditions for using Angel Touch Homecare Services website and services.",
	openGraph: {
		title: "Terms of Service | Angel Touch Homecare",
		description:
			"Please review our terms and conditions before using our services.",
		type: "website",
	},
};

export default function TermsOfServicePage() {
	return (
		<main className="min-h-screen" aria-label="Terms of Service">
			{/* Hero Section */}
			<section className="px-4 md:px-8 max-w-4xl mx-auto mt-4 mb-14 md:mb-18">
				<Card className="relative overflow-hidden p-6 sm:p-8 md:p-12 bg-card/50 border-border/50">
					<div
						className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/0.10),transparent_60%)]"
						aria-hidden="true"
					/>
					<div className="relative z-10 text-center max-w-2xl mx-auto">
						<div
							className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10"
							aria-hidden="true"
						>
							<IconScale className="size-8 text-primary" />
						</div>
						<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
							Terms of <span className="text-primary">Service</span>
						</h1>
						<p className="text-muted-foreground text-base md:text-lg leading-relaxed">
							Please read these terms carefully before using our website or
							services.
						</p>
					</div>
				</Card>
			</section>

			{/* Terms Content */}
			<section className="px-4 md:px-8 max-w-4xl mx-auto mb-16 md:mb-20">
				<Card className="p-6 sm:p-8 md:p-10 bg-card/50 border-border/50">
					<article className="prose prose-invert prose-lg max-w-none">
						<p className="text-muted-foreground leading-relaxed">
							By accessing or using Angel Touch Homecare Services, you agree to
							the following terms and conditions. Please read them carefully
							before using our website or services.
						</p>

						<h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
							1. Acceptance of Terms
						</h2>
						<p className="text-muted-foreground">
							Your use of our services constitutes acceptance of these Terms. If
							you do not agree, please do not use our services.
						</p>

						<h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
							2. Use of Services
						</h2>
						<ul className="space-y-2 text-muted-foreground">
							<li>Services are for personal, non-commercial use only.</li>
							<li>
								You agree to provide accurate, complete information and comply
								with all applicable laws.
							</li>
							<li>
								Do not misuse, disrupt, or attempt unauthorized access to our
								services.
							</li>
						</ul>

						<h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
							3. User Responsibilities
						</h2>
						<ul className="space-y-2 text-muted-foreground">
							<li>
								Respect caregivers, staff, and other users at all times.
							</li>
							<li>
								Maintain confidentiality of login credentials and sensitive
								information.
							</li>
							<li>
								Report any suspected abuse, fraud, or security issues promptly.
							</li>
						</ul>

						<h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
							4. Intellectual Property
						</h2>
						<p className="text-muted-foreground">
							All content, trademarks, and materials on this site are the
							property of Angel Touch Homecare Services or its licensors.
							Unauthorized use is prohibited.
						</p>

						<h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
							5. Limitation of Liability
						</h2>
						<p className="text-muted-foreground">
							Angel Touch Homecare Services is not liable for any indirect,
							incidental, or consequential damages arising from the use of our
							services or website. Services are provided &quot;as is&quot;
							without warranties of any kind.
						</p>

						<h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
							6. Indemnification
						</h2>
						<p className="text-muted-foreground">
							You agree to indemnify and hold harmless Angel Touch Homecare
							Services, its staff, and affiliates from any claims, damages, or
							expenses resulting from your use of our services.
						</p>

						<h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
							7. Changes to Terms
						</h2>
						<p className="text-muted-foreground">
							We may update these Terms of Service at any time. Continued use of
							our services constitutes acceptance of the revised terms.
						</p>

						<h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
							8. Governing Law
						</h2>
						<p className="text-muted-foreground">
							These Terms are governed by the laws of the Commonwealth of
							Massachusetts, without regard to conflict of law principles.
						</p>

						<p className="text-sm text-muted-foreground/70 mt-8 pt-4 border-t border-border">
							Last updated: January 27, 2026
						</p>
					</article>
				</Card>
			</section>

			{/* Contact CTA */}
			<section className="px-4 md:px-8 max-w-4xl mx-auto mb-16">
				<Card
					className={cn(
						"p-6 md:p-8 text-center",
						"bg-card/50 border-border/50"
					)}
				>
					<h2 className="text-xl font-semibold text-foreground mb-2">
						Questions About These Terms?
					</h2>
					<p className="text-muted-foreground mb-6">
						Contact us for clarification or concerns about our terms.
					</p>
					<Button asChild variant="outline">
						<a href="mailto:info@angeltouch.services">
							<IconMail className="mr-2 size-4" />
							info@angeltouch.services
						</a>
					</Button>
				</Card>
			</section>
		</main>
	);
}
