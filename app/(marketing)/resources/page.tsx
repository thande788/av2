import type { Metadata } from "next";
import Link from "next/link";
import {
	IconExternalLink,
	IconHeartHandshake,
	IconPhone,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCanonicalAlternates } from "@/lib/seo";

export const metadata: Metadata = {
	title: "Resources",
	description:
		"Trusted organizations and helpful resources for seniors, caregivers, and families in the Greater Lowell area.",
	keywords: [
		"senior resources Lowell",
		"caregiver resources Massachusetts",
		"elder services",
		"Alzheimer's support",
		"aging resources",
	],
	alternates: getCanonicalAlternates("/resources"),
	openGraph: {
		title: "Helpful Resources | Angel Touch Homecare",
		description:
			"Trusted organizations and information portals to support seniors, caregivers, and families.",
		type: "website",
	},
};

const resources = [
	{
		name: "Massachusetts Executive Office of Health and Human Services",
		description:
			"State agency overseeing health and human services programs across Massachusetts.",
		url: "https://www.mass.gov/orgs/executive-office-of-health-and-human-services",
	},
	{
		name: "Elder Services of the Merrimack Valley",
		description:
			"Local agency providing support services for seniors and caregivers in the Merrimack Valley.",
		url: "https://www.esmv.org/",
	},
	{
		name: "Lowell Senior Center",
		description:
			"Community center offering programs, activities, and services for Lowell-area seniors.",
		url: "https://www.lowellma.gov/317/Senior-Center",
	},
	{
		name: "Alzheimer's Association MA/NH Chapter",
		description:
			"Support, education, and resources for individuals and families affected by Alzheimer's and dementia.",
		url: "https://www.alz.org/manh",
	},
	{
		name: "MassOptions (Aging & Disability Resource Consortium)",
		description:
			"One-stop resource for information on aging and disability services in Massachusetts.",
		url: "https://www.massoptions.org/",
	},
];

export default function ResourcesPage() {
	return (
		<main className="min-h-screen" aria-label="Helpful Resources">
			{/* Hero Section */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mt-4 mb-14 md:mb-18">
				<Card className="relative overflow-hidden p-6 sm:p-8 md:p-12 bg-card/50 border-border/50">
					<div
						className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/0.10),transparent_60%)]"
						aria-hidden="true"
					/>
					<div className="relative z-10 text-center max-w-3xl mx-auto">
						<div
							className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10"
							aria-hidden="true"
						>
							<IconHeartHandshake className="size-8 text-icon" />
						</div>
						<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
							Helpful <span className="text-primary">Resources</span>
						</h1>
						<p className="text-muted-foreground text-base md:text-lg leading-relaxed">
							Trusted organizations and information portals to support seniors,
							caregivers, and families in the Greater Lowell area.
						</p>
					</div>
				</Card>
			</section>

			{/* Resources Grid */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20">
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{resources.map((resource) => (
						<Card
							key={resource.name}
							className={cn(
								"p-6",
								"bg-card/50 backdrop-blur-md",
								"border-border/50 hover:border-primary/30",
								"transition-all duration-300 hover:-translate-y-1",
								"flex flex-col"
							)}
						>
							<h2 className="text-lg font-semibold text-foreground mb-2 leading-snug">
								{resource.name}
							</h2>
							<p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-grow">
								{resource.description}
							</p>
							<Button asChild variant="outline" size="sm" className="w-fit">
								<a
									href={resource.url}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`Visit ${resource.name} (opens in new tab)`}
								>
									Visit Site
									<IconExternalLink className="ml-2 size-4" />
								</a>
							</Button>
						</Card>
					))}
				</div>
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
						Need Personalized Guidance?
					</h2>
					<p className="text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed mb-8">
						Our team can help connect you with the right resources and services
						for your unique situation.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button
							asChild
							size="lg"
							variant="secondary"
							className="font-bold text-base sm:text-lg"
						>
							<Link href="/contact">Contact Us</Link>
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
