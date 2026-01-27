import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for Caregivers page
 */
export default function CaregiversLoading() {
	return (
		<main className="min-h-screen" aria-label="Loading caregivers">
			{/* Hero Skeleton */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mt-4 mb-14 md:mb-18">
				<Skeleton className="h-[420px] w-full rounded-3xl" />
			</section>

			{/* Caregiver Grid Skeleton */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20">
				<Skeleton className="h-10 w-64 mx-auto mb-4" />
				<Skeleton className="h-6 w-96 mx-auto mb-10" />
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{Array.from({ length: 8 }).map((_, i) => (
						<Skeleton key={i} className="h-96 w-full rounded-2xl" />
					))}
				</div>
			</section>

			{/* CTA Skeleton */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mb-16">
				<Skeleton className="h-48 w-full rounded-3xl" />
			</section>
		</main>
	);
}
