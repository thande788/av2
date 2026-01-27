import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for Resources page
 */
export default function ResourcesLoading() {
	return (
		<main className="min-h-screen" aria-label="Loading resources">
			{/* Hero Skeleton */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mt-4 mb-14 md:mb-18">
				<Skeleton className="h-48 w-full rounded-3xl" />
			</section>

			{/* Resources Grid Skeleton */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20">
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton key={i} className="h-44 rounded-2xl" />
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
