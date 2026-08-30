import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  IconPhone,
  IconBuildingHospital,
  IconShieldCheck,
  IconLock,
  IconUserCheck,
  IconStar,
  IconCertificate,
  IconHeartHandshake,
  IconTarget,
  IconBook,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCanonicalAlternates } from "@/lib/seo";

export const metadata: Metadata = {
	title: "About",
	description:
		"Learn about Angel Touch Homecare—our mission, story, credentials, and commitment to compassionate in-home care in the Greater Lowell area.",
	keywords: [
		"about Angel Touch",
		"home care Lowell",
		"homecare agency Massachusetts",
		"licensed insured home care",
		"HIPAA compliant home care",
	],
	alternates: getCanonicalAlternates("/about"),
	openGraph: {
		title: "About Angel Touch Homecare",
		description:
			"Founded on compassion, built on expertise—learn about our mission, story, and credentials.",
		type: "website",
	},
};

const credentials = [
	{
		icon: IconBuildingHospital,
		title: "Licensed Agency",
		desc: "Registered Home Care Agency (MA Executive Office of Health and Human Services)",
	},
	{
		icon: IconShieldCheck,
		title: "Full Insurance",
		desc: "Liability insurance & worker\u0027s compensation coverage",
	},
	{
		icon: IconLock,
		title: "HIPAA Compliant",
		desc: "Compliance for client data privacy protection",
	},
	{
		icon: IconUserCheck,
		title: "Verified Staff",
		desc: "Staff CORI checks & verified caregiver qualifications",
	},
	{
		icon: IconStar,
		title: "Experienced",
		desc: "10+ years hands-on caregiving experience",
	},
	{
		icon: IconCertificate,
		title: "Certified",
		desc: "Small Business Administration certificate",
	},
];

export default function AboutPage() {
	return (
		<main className="min-h-screen" aria-label="About Angel Touch Homecare">
			{/* Hero Section */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mt-4 mb-14 md:mb-18">
				<div className="relative rounded-3xl overflow-hidden">
					<div className="absolute inset-0">
						<Image
							src="https://images.pexels.com/photos/4342498/pexels-photo-4342498.jpeg?auto=compress&cs=tinysrgb&w=1600"
							alt="Angel Touch Homecare"
							fill
							className="object-cover"
							priority
							sizes="100vw"
							unoptimized
						/>
						<div className="absolute inset-0 bg-black/40" />
						<div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent" />
					</div>

					<div className="relative z-10 px-6 md:px-10 py-14 md:py-20">
						<div className="max-w-3xl">
							<h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 leading-tight">
								About Angel Touch
								<br />
								<span className="text-decorative">Homecare</span>
							</h1>
							<p className="italic text-xl md:text-2xl text-decorative/70 mb-8 leading-relaxed">
								Founded on compassion, built on expertise, and dedicated to
								enhancing lives through deeply personalized in-home care.
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
									<a href="#about">Learn More</a>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Mission & Story */}
			<section
				id="about"
				className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20 scroll-mt-24"
			>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
					<Card
						className={cn(
							"lg:col-span-1",
							"bg-card/50 border-border/50",
							"backdrop-blur-md",
							"p-6 md:p-8"
						)}
					>
						<div
							className={cn(
								"mx-auto mb-6 flex size-20 items-center justify-center rounded-full",
								"bg-gradient-to-br from-decorative/20 to-decorative/10",
								"text-icon"
							)}
							aria-hidden="true"
						>
							<IconHeartHandshake className="size-10" />
						</div>
						<h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 text-center">
							Our Founder&apos;s Vision
						</h2>
						<p className="text-muted-foreground leading-relaxed text-center italic">
							&ldquo;Every person deserves care that honors their dignity,
							independence, and unique story. We&apos;re not just providing
							services—we&apos;re creating meaningful connections.&rdquo;
						</p>
					</Card>

					<div className="lg:col-span-2 grid grid-cols-1 gap-6">
						<Card className="bg-card/50 border-border/50 backdrop-blur-md p-6 md:p-8">
							<h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-3 mb-3">
								<IconTarget className="size-7 text-icon" aria-hidden="true" />
								Our Mission
							</h2>
							<p className="text-muted-foreground leading-relaxed">
								To provide compassionate, reliable, and personalized
								non-medical in-home care services that enhance the quality of
								life for seniors and individuals with disabilities in Lowell,
								Massachusetts and surrounding communities.
							</p>
						</Card>

						<Card className="bg-card/50 border-border/50 backdrop-blur-md p-6 md:p-8">
							<h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-3 mb-3">
								<IconBook className="size-7 text-icon" aria-hidden="true" />
								Our Story
							</h2>
							<p className="text-muted-foreground leading-relaxed">
								Angel Touch was founded by a certified home health aide with
								over a decade of caregiving experience and a background in
								healthcare management. Inspired by a passion for dignity,
								independence, and holistic support, our founder built Angel
								Touch to deliver the highest standards of care with warmth and
								professionalism.
							</p>
						</Card>
					</div>
				</div>
			</section>

			{/* Credentials */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20">
				<div className="text-center mb-10 md:mb-12">
					<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
						Our <span className="text-primary">Credentials</span>
					</h2>
					<p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
						We&apos;re committed to safe, reliable care—backed by the training,
						compliance, and standards families deserve.
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{credentials.map((c) => (
						<Card
							key={c.title}
							className={cn(
								"p-6 text-center",
								"bg-card/50 backdrop-blur-md",
								"border-border/50 hover:border-primary/30",
								"transition-all duration-300 hover:-translate-y-1"
							)}
						>
							<div className="mb-4 flex justify-center text-icon" aria-hidden="true">
								<c.icon className="size-12" />
							</div>
							<h3 className="text-lg font-semibold text-foreground mb-2">
								{c.title}
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{c.desc}
							</p>
						</Card>
					))}
				</div>
			</section>

			{/* Legal & Service Area */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20">
				<Card className="relative overflow-hidden p-6 sm:p-8 md:p-12 bg-card/50 border-border/50 text-center">
					<div
						className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/0.10),transparent_60%)]"
						aria-hidden="true"
					/>
					<div className="relative z-10">
						<h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
							Legal Structure &amp; Service Area
						</h2>
						<p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-base md:text-lg">
							We are a Limited Liability Company (LLC) headquartered in Lowell,
							MA, proudly serving families throughout Lowell and the surrounding
							communities of Dracut, Chelmsford, Tewksbury, and Billerica.
						</p>
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
						Ready to Get Started?
					</h2>
					<p className="text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed mb-8">
						Contact us for a free consultation and a personalized care plan.
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
	);
}
