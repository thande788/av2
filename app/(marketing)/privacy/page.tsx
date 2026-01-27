import type { Metadata } from "next";
import { IconMail, IconShieldLock } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
	title: "Privacy Policy",
	description:
		"Learn how Angel Touch Homecare Services collects, uses, and protects your personal information.",
	openGraph: {
		title: "Privacy Policy | Angel Touch Homecare",
		description:
			"Our commitment to protecting your privacy and personal information.",
		type: "website",
	},
};

export default function PrivacyPolicyPage() {
	return (
		<main className="min-h-screen" aria-label="Privacy Policy">
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
							<IconShieldLock className="size-8 text-primary" />
						</div>
						<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
							Privacy <span className="text-primary">Policy</span>
						</h1>
						<p className="text-muted-foreground text-base md:text-lg leading-relaxed">
							Your privacy matters. Learn how we collect, use, and protect your
							personal information.
						</p>
					</div>
				</Card>
			</section>

			{/* Policy Content */}
			<section className="px-4 md:px-8 max-w-4xl mx-auto mb-16 md:mb-20">
				<Card className="p-6 sm:p-8 md:p-10 bg-card/50 border-border/50">
					<article className="prose prose-invert prose-lg max-w-none">
						<p className="text-muted-foreground leading-relaxed">
							Angel Touch Homecare Services values your privacy and is committed
							to protecting your personal information. This Privacy Policy
							describes how we collect, use, disclose, and safeguard your data
							when you use our website and services.
						</p>

						<h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
							1. Information We Collect
						</h2>
						<ul className="space-y-2 text-muted-foreground">
							<li>
								<strong className="text-foreground">
									Personal Information:
								</strong>{" "}
								Name, address, email, phone number, health information, and
								other details you provide.
							</li>
							<li>
								<strong className="text-foreground">Usage Data:</strong>{" "}
								Information about your interactions with our website, including
								IP address, browser type, device information, and pages visited.
							</li>
							<li>
								<strong className="text-foreground">
									Cookies &amp; Tracking:
								</strong>{" "}
								We use cookies and similar technologies to enhance your
								experience and analyze site usage.
							</li>
						</ul>

						<h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
							2. How We Use Your Information
						</h2>
						<ul className="space-y-2 text-muted-foreground">
							<li>
								To provide, personalize, and improve our homecare services
							</li>
							<li>
								To communicate with you regarding your care, appointments, and
								inquiries
							</li>
							<li>
								To comply with legal, regulatory, and insurance requirements
							</li>
							<li>To analyze site usage and improve our website</li>
						</ul>

						<h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
							3. Information Sharing &amp; Disclosure
						</h2>
						<ul className="space-y-2 text-muted-foreground">
							<li>
								We do <strong className="text-foreground">not</strong> sell or
								rent your personal information.
							</li>
							<li>
								We may share information with trusted partners, caregivers, and
								service providers only as necessary to deliver our services.
							</li>
							<li>
								We may disclose information if required by law, regulation, or
								court order.
							</li>
						</ul>

						<h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
							4. Data Security
						</h2>
						<p className="text-muted-foreground">
							We implement industry-standard security measures to protect your
							data from unauthorized access, alteration, or disclosure. However,
							no method of transmission over the Internet is 100% secure.
						</p>

						<h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
							5. Your Rights &amp; Choices
						</h2>
						<ul className="space-y-2 text-muted-foreground">
							<li>
								You may request access, correction, or deletion of your personal
								data at any time.
							</li>
							<li>
								You may opt out of certain communications by contacting us.
							</li>
							<li>
								To exercise your rights, email{" "}
								<a
									href="mailto:info@angeltouch.services"
									className="text-primary hover:underline"
								>
									info@angeltouch.services
								</a>
								.
							</li>
						</ul>

						<h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
							6. Children&apos;s Privacy
						</h2>
						<p className="text-muted-foreground">
							Our services are not intended for children under 13. We do not
							knowingly collect personal information from children.
						</p>

						<h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
							7. Third-Party Links
						</h2>
						<p className="text-muted-foreground">
							Our website may contain links to third-party sites. We are not
							responsible for their privacy practices. Please review their
							policies before providing information.
						</p>

						<h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
							8. Changes to This Policy
						</h2>
						<p className="text-muted-foreground">
							We may update this Privacy Policy periodically. Changes will be
							posted on this page with the effective date.
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
						Questions About Your Privacy?
					</h2>
					<p className="text-muted-foreground mb-6">
						Contact us at any time for questions or concerns about this policy.
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
