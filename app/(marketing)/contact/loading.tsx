import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for Contact page
 */
export default function ContactLoading() {
	return (
		<main className="min-h-screen" aria-label="Loading contact page">
			{/* Hero Skeleton */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mt-4 mb-14 md:mb-18">
				<Skeleton className="h-40 w-full rounded-3xl" />
			</section>

			{/* Contact Content Skeleton */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
					{/* Form Skeleton */}
					<Skeleton className="h-[600px] rounded-2xl" />

					{/* Info Skeleton */}
					<div className="space-y-6">
						<Skeleton className="h-64 rounded-2xl" />
						<Skeleton className="h-48 rounded-2xl" />
						<Skeleton className="h-32 rounded-2xl" />
					</div>
				</div>
			</section>
		</main>
	);
}
