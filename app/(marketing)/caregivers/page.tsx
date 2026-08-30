import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconPhone } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CaregiverCardGrid } from "@/components/caregivers/caregiver-card";
import { caregivers as staticCaregivers } from "@/data/caregivers";
import { getCanonicalAlternates } from "@/lib/seo";
import { db } from "@/lib/db";
import { maybeSignBlobReadUrl } from "@/lib/azure-blob";
import { computeCaregiverRatingsBatch } from "@/lib/ratings";
import type { Caregiver } from "@/types";

export const metadata: Metadata = {
	title: "Caregivers",
	description:
		"Meet our compassionate, certified caregivers dedicated to providing exceptional in-home care in the Greater Lowell area.",
	keywords: [
		"home caregivers Lowell",
		"certified caregivers Massachusetts",
		"in-home care providers",
		"senior care professionals",
		"compassionate caregivers",
	],
	alternates: getCanonicalAlternates("/caregivers"),
	openGraph: {
		title: "Meet Our Caregivers | Angel Touch Homecare",
		description:
			"Our dedicated team of certified professionals brings expertise, warmth, and care to every client's home.",
		type: "website",
	},
};

/**
 * Fetch public caregiver profiles from the database.
 * Falls back to static data if no approved public profiles exist.
 */
async function getCaregivers(): Promise<Caregiver[]> {
	try {
		const workers = await db.worker.findMany({
			where: {
				isPublicProfile: true,
				profileStatus: "APPROVED",
				user: { status: "ACTIVE" },
			},
			include: { user: true },
		});

		if (workers.length === 0) {
			return staticCaregivers;
		}

		const workerIds = workers.map((w) => w.id);
		const ratings = await computeCaregiverRatingsBatch(workerIds);

		const withSignedPhotos = await Promise.all(
			workers.map(async (w) => maybeSignBlobReadUrl(w.marketingPhotoUrl))
		);

		return workers.map((w, idx) => ({
			id: w.id,
			fullName: `${w.user.firstName} ${w.user.lastName}`,
			photoUrl: withSignedPhotos[idx] || undefined,
			bio: w.marketingBio || "",
			yearsExperience: w.yearsExperience ?? 0,
			rating: ratings.get(w.id)?.average ?? 5,
			specialties: w.marketingSpecialties,
			certifications: w.marketingCertifications,
			languages: w.marketingLanguages,
			available: true,
		}));
	} catch {
		return staticCaregivers;
	}
}

/**
 * Caregivers page
 *
 * Displays the caregiver team in a responsive grid layout
 * with hero, team grid, and join CTA sections.
 */
export default async function CaregiversPage() {
	const caregivers = await getCaregivers();

	return (
		<main className="min-h-screen" aria-label="Meet Our Caregivers">
			{/* Hero Section */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mt-4 mb-14 md:mb-18">
				<div className="relative rounded-3xl overflow-hidden">
					<div className="absolute inset-0">
						<Image
							src="https://images.pexels.com/photos/5452228/pexels-photo-5452228.jpeg?auto=compress&cs=tinysrgb&w=1600"
							alt="Our compassionate caregivers"
							fill
							className="object-cover"
							priority
							sizes="100vw"
							unoptimized
						/>
						<div className="absolute inset-0 bg-black/30" />
           				<div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />
					</div>

					<div className="relative z-10 px-6 md:px-10 py-14 md:py-20">
						<div className="max-w-3xl">
							<h1 className="text-4xl md:text-6xl font-bold text-decorative mb-6 leading-tight">
								Meet Our
								<br />
								<span className="text-primary">Compassionate Caregivers</span>
							</h1>
							<p className="italic text-xl md:text-2xl text-decorative/70 mb-8 leading-relaxed">
								Our dedicated team of certified professionals brings expertise,
								warmth, and care to every client&apos;s home.
							</p>
							<div className="flex flex-col sm:flex-row gap-4">
								<Button
									asChild
									size="lg"
									className="px-6 text-base sm:px-8 sm:text-lg"
								>
									<Link href="/contact">Connect With Us</Link>
								</Button>
								<Button
									asChild
									size="lg"
									variant="outline"
									className="px-6 text-base sm:px-8 sm:text-lg"
								>
									<a href="#team">Meet the Team</a>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Caregiver Grid */}
			<section
				id="team"
				className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20 scroll-mt-24"
				aria-labelledby="caregiver-team-heading"
			>
				<div className="text-center mb-10 md:mb-12">
					<h2
						id="caregiver-team-heading"
						className="text-3xl md:text-4xl font-bold text-foreground mb-4"
					>
						Our <span className="text-primary">Caregiver Team</span>
					</h2>
					<p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
						Each caregiver is carefully selected, background-checked, and
						trained to provide exceptional care.
					</p>
				</div>

				<Card className="relative overflow-hidden p-6 sm:p-8 md:p-10 bg-card/10 border-border/50">
					<div
						className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/0.10),transparent_60%)]"
						aria-hidden="true"
					/>
					<div className="relative z-10">
						<CaregiverCardGrid caregivers={caregivers} />
					</div>
				</Card>
			</section>

			{/* Join CTA Section */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mb-16">
				<Card
					className={cn(
						"p-8 md:p-12 text-center",
						"bg-gradient-to-r from-primary to-primary/80",
						"text-primary-foreground border-0"
					)}
				>
					<h2 className="text-2xl md:text-3xl font-bold mb-4">
						Join Our Caregiver Team
					</h2>
					<p className="text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed mb-8">
						Are you passionate about making a difference? Join our team of
						dedicated caregivers and help us provide exceptional care.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button
							asChild
							size="lg"
							variant="secondary"
							className="font-bold text-base sm:text-lg"
						>
							<Link href="/careers">Apply Today</Link>
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
