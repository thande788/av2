import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for Home page
 */
export default function HomeLoading() {
	return (
		<main className="min-h-screen" aria-label="Loading home page">
			{/* Hero Skeleton */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mt-4 mb-14 md:mb-18">
				<Skeleton className="h-[450px] md:h-[550px] w-full rounded-3xl" />
			</section>

			{/* Stats Skeleton */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-32 md:h-40 rounded-2xl" />
					))}
				</div>
			</section>

			{/* Welcome Skeleton */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20">
				<Skeleton className="h-40 md:h-48 w-full rounded-2xl" />
			</section>

			{/* Services Skeleton */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20">
				<Skeleton className="h-10 w-64 mx-auto mb-4" />
				<Skeleton className="h-6 w-96 mx-auto mb-10" />
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton key={i} className="h-44 rounded-2xl" />
					))}
				</div>
			</section>

			{/* Why Choose Us Skeleton */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20">
				<Skeleton className="h-[400px] w-full rounded-2xl" />
			</section>

			{/* Testimonials Skeleton */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20">
				<Skeleton className="h-10 w-48 mx-auto mb-4" />
				<Skeleton className="h-6 w-80 mx-auto mb-10" />
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{Array.from({ length: 3 }).map((_, i) => (
						<Skeleton key={i} className="h-56 rounded-2xl" />
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
