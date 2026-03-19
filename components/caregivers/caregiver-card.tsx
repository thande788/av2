"use client";

import Image from "next/image";
import Link from "next/link";
import { IconStarFilled, IconClock, IconLanguage } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { CaregiverCardProps, Caregiver } from "@/types/cards";

/**
 * Elite caregiver card with overlay image style
 * Based on shadcn Card with image overlay pattern
 */
export function CaregiverCard({
	caregiver,
	className,
}: CaregiverCardProps) {
	const {
		id,
		fullName,
		photoBase,
		photoUrl,
		bio,
		yearsExperience,
		rating,
		specialties,
		languages,
		available,
	} = caregiver;

	// Determine image source
	const imageSrc =
		photoUrl || (photoBase ? `/caregivers/original/${photoBase}.jpg` : null);

	const profileHref = `/caregivers/${id}`;

	return (
		<Card
			className={cn(
				"group relative mx-auto w-full overflow-hidden pt-0 bg-card/45 border-border/50",
				"transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
				"focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
				className
			)}
			role="article"
			aria-labelledby={`caregiver-${id}-name`}
		>
			{/* Image with overlay */}
			<Link
				href={profileHref}
				className="relative block cursor-pointer focus:outline-none"
				aria-label={`View profile for ${fullName}`}
			>
				{/* Dark overlay */}
				<div className="absolute inset-0 z-30 aspect-[4/3] bg-black/30 transition-opacity group-hover:bg-black/40" />

				{/* Image */}
				{imageSrc ? (
					<Image
						src={imageSrc}
						alt={`Portrait of ${fullName}`}
						width={400}
						height={300}
						className="relative z-20 aspect-[4/3] w-full object-cover brightness-90 transition-all duration-500 group-hover:scale-105 group-hover:brightness-75"
						sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
					/>
				) : (
					<div className="relative z-20 flex aspect-[4/3] w-full items-center justify-center bg-muted">
						<UserAvatar name={fullName} size="2xl" rounded={false} className="rounded-none size-full border-0" />
					</div>
				)}

				{/* Badges overlay */}
				<div className="absolute top-3 left-3 right-3 z-40 flex items-start justify-between">
					{/* Availability badge */}
					{available !== undefined && (
						<Badge
							variant={available ? "default" : "secondary"}
							className={cn(
								"shadow-lg",
								available
									? "bg-green-500/90 text-white hover:bg-green-500"
									: "bg-muted text-muted-foreground"
							)}
						>
							{available ? "Available" : "Unavailable"}
						</Badge>
					)}

					{/* Rating badge */}
					<Badge
						variant="secondary"
						className="flex items-center gap-1 bg-background/90 shadow-lg backdrop-blur-sm"
					>
						<IconStarFilled className="size-3 text-amber-400" aria-hidden="true" />
						<span>{rating.toFixed(1)}</span>
					</Badge>
				</div>

				{/* Experience badge at bottom of image */}
				<div className="absolute bottom-3 left-3 z-40">
					<Badge
						variant="secondary"
						className="flex items-center gap-1.5 bg-background/90 shadow-lg backdrop-blur-sm"
					>
						<IconClock className="size-3" aria-hidden="true" />
						<span>{yearsExperience}+ years</span>
					</Badge>
				</div>
			</Link>

			<CardHeader className="pb-3">
				<CardTitle
					id={`caregiver-${id}-name`}
					className="text-lg leading-tight"
				>
					{fullName}
				</CardTitle>
				<CardDescription className="line-clamp-2 text-sm text-foreground leading-relaxed">
					{bio}
				</CardDescription>
			</CardHeader>

			{/* Specialties */}
			<div className="px-6 pb-3">
				<div className="flex flex-wrap gap-1.5" aria-label="Specialties">
					{specialties.slice(0, 3).map((specialty) => (
						<Badge
							key={specialty}
							variant="outline"
							className="text-[10px] font-medium"
						>
							{specialty}
						</Badge>
					))}
					{specialties.length > 3 && (
						<span className="self-center text-[10px] text-muted-foreground">
							+{specialties.length - 3}
						</span>
					)}
				</div>

				{/* Languages */}
				{languages && languages.length > 0 && (
					<div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
						<IconLanguage className="size-3.5" aria-hidden="true" />
						<span>{languages.join(", ")}</span>
					</div>
				)}
			</div>

			<CardFooter className="pt-0">
				<Button
					className="w-full"
					variant="outline"
					asChild
				>
					<Link href={profileHref} aria-label={`View ${fullName}'s full profile`}>
						View Profile
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}

/**
 * Grid wrapper for displaying multiple caregiver cards
 */
export function CaregiverCardGrid({
	caregivers,
	className,
	...props
}: {
	caregivers: Caregiver[];
	className?: string;
} & Omit<CaregiverCardProps, "caregiver">) {
	return (
		<div
			className={cn(
				"grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
				className
			)}
		>
			{caregivers.map((caregiver) => (
				<CaregiverCard key={caregiver.id} caregiver={caregiver} {...props} />
			))}
		</div>
	);
}