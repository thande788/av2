import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
	IconStarFilled,
	IconClock,
	IconLanguage,
	IconCertificate,
	IconArrowLeft,
	IconPhone,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/shared/user-avatar";
import { caregivers as staticCaregivers } from "@/data/caregivers";
import { db } from "@/lib/db";
import { computeCaregiverRatingsBatch } from "@/lib/ratings";
import { getCanonicalAlternates } from "@/lib/seo";
import type { Caregiver } from "@/types";

interface CaregiverPageProps {
	params: Promise<{ id: string }>;
}

/**
 * Fetch a single caregiver by ID from DB or static data.
 */
async function getCaregiver(id: string): Promise<Caregiver | null> {
	// Try DB first
	try {
		const worker = await db.worker.findFirst({
			where: {
				id,
				isPublicProfile: true,
				profileStatus: "APPROVED",
				user: { status: "ACTIVE" },
			},
			include: { user: true },
		});

		if (worker) {
			const ratings = await computeCaregiverRatingsBatch([worker.id]);
			const ratingData = ratings.get(worker.id);
			return {
				id: worker.id,
				fullName: `${worker.user.firstName} ${worker.user.lastName}`,
				photoUrl: worker.marketingPhotoUrl || undefined,
				bio: worker.marketingBio || "",
				yearsExperience: worker.yearsExperience ?? 0,
				rating: ratingData?.average ?? 5,
				reviewCount: ratingData?.totalCount,
				specialties: worker.marketingSpecialties,
				certifications: worker.marketingCertifications,
				languages: worker.marketingLanguages,
				available: true,
			};
		}
	} catch {
		// DB unavailable — fall through to static
	}

	// Fallback to static data
	return staticCaregivers.find((c) => c.id === id) ?? null;
}

export async function generateMetadata({
	params,
}: CaregiverPageProps): Promise<Metadata> {
	const { id } = await params;
	const caregiver = await getCaregiver(id);

	if (!caregiver) {
		return { title: "Caregiver Not Found | Angel Touch Homecare" };
	}

	return {
		title: `${caregiver.fullName} | Caregiver Profile | Angel Touch Homecare`,
		description: caregiver.bio,
		alternates: getCanonicalAlternates(`/caregivers/${id}`),
		openGraph: {
			title: `${caregiver.fullName} — Angel Touch Homecare Caregiver`,
			description: caregiver.bio,
			type: "profile",
		},
	};
}

export default async function CaregiverProfilePage({
	params,
}: CaregiverPageProps) {
	const { id } = await params;
	const caregiver = await getCaregiver(id);

	if (!caregiver) {
		notFound();
	}

	const {
		fullName,
		photoUrl,
		photoBase,
		bio,
		yearsExperience,
		rating,
		reviewCount,
		specialties,
		certifications,
		languages,
		available,
	} = caregiver;

	const imageSrc =
		photoUrl || (photoBase ? `/caregivers/original/${photoBase}.jpg` : null);

	return (
		<main className="min-h-screen" aria-label={`${fullName} — Caregiver Profile`}>
			{/* Back Navigation */}
			<div className="px-4 md:px-8 max-w-7xl mx-auto mt-6">
				<Button variant="ghost" size="sm" asChild>
					<Link href="/caregivers">
						<IconArrowLeft className="mr-2 size-4" />
						Back to Caregivers
					</Link>
				</Button>
			</div>

			{/* Profile Section */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mt-4 mb-16">
				<Card className="overflow-hidden p-0">
					<div className="md:flex">
						{/* Photo */}
						<div className="relative md:w-1/3 lg:w-1/4 shrink-0">
							{imageSrc ? (
								<Image
									src={imageSrc}
									alt={`Portrait of ${fullName}`}
									width={600}
									height={800}
									className="w-full h-64 md:h-full object-cover"
									sizes="(min-width: 768px) 33vw, 100vw"
									priority
								/>
							) : (
								<div className="w-full h-64 md:h-full bg-muted flex items-center justify-center">
								<UserAvatar name={fullName} size="2xl" />
								</div>
							)}
							{/* Availability overlay */}
							{available !== undefined && (
								<div className="absolute top-4 left-4">
									<Badge
										className={cn(
											"shadow-lg",
											available
												? "bg-green-500/90 text-white hover:bg-green-500"
												: "bg-muted text-muted-foreground"
										)}
									>
										{available ? "Available" : "Unavailable"}
									</Badge>
								</div>
							)}
						</div>

						{/* Details */}
						<div className="flex-1 p-6 md:p-8 space-y-6">
							<div>
								<h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
									{fullName}
								</h1>
								<div className="flex flex-wrap items-center gap-4 text-muted-foreground">
									<div className="flex items-center gap-1.5">
										{Array.from({ length: 5 }, (_, i) => (
											<IconStarFilled
												key={i}
												className={cn(
													"size-4",
													i < Math.round(rating)
														? "text-amber-400"
														: "text-muted-foreground/20"
												)}
											/>
										))}
										<span className="ml-1 text-sm font-medium text-foreground">
											{rating.toFixed(1)}
										</span>
										{reviewCount !== undefined && (
											<span className="text-sm">
												({reviewCount} review{reviewCount !== 1 ? "s" : ""})
											</span>
										)}
									</div>
									<div className="flex items-center gap-1.5">
										<IconClock className="size-4" />
										<span className="text-sm">{yearsExperience}+ years experience</span>
									</div>
								</div>
							</div>

							<p className="text-foreground leading-relaxed text-lg">{bio}</p>

							{/* Specialties */}
							{specialties.length > 0 && (
								<div>
									<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
										Specialties
									</h2>
									<div className="flex flex-wrap gap-2">
										{specialties.map((s) => (
											<Badge key={s} variant="secondary" className="text-sm">
												{s}
											</Badge>
										))}
									</div>
								</div>
							)}

							{/* Certifications */}
							{certifications && certifications.length > 0 && (
								<div>
									<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
										Certifications
									</h2>
									<div className="flex flex-wrap gap-2">
										{certifications.map((c) => (
											<Badge
												key={c}
												variant="outline"
												className="flex items-center gap-1.5 text-sm"
											>
												<IconCertificate className="size-3.5" />
												{c}
											</Badge>
										))}
									</div>
								</div>
							)}

							{/* Languages */}
							{languages && languages.length > 0 && (
								<div className="flex items-center gap-2 text-muted-foreground">
									<IconLanguage className="size-5" />
									<span className="text-sm font-medium">
										{languages.join(", ")}
									</span>
								</div>
							)}

							{/* CTA */}
							<div className="flex flex-col sm:flex-row gap-3 pt-2">
								<Button size="lg" asChild>
									<Link href={`/contact?caregiver=${encodeURIComponent(caregiver.id)}&caregiverName=${encodeURIComponent(fullName)}`}>
										<IconPhone className="mr-2 size-4" />
										Request This Caregiver
									</Link>
								</Button>
								<Button size="lg" variant="outline" asChild>
									<Link href="/caregivers">View All Caregivers</Link>
								</Button>
							</div>
						</div>
					</div>
				</Card>
			</section>
		</main>
	);
}
