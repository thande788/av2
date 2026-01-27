import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
	IconPhone,
	IconHeartHandshake,
	IconUsers,
	IconClock24,
	IconShieldCheck,
	IconHome,
	IconPill,
	IconToolsKitchen2,
	IconCar,
	IconHeart,
	IconArrowRight,
} from "@tabler/icons-react";
import { Bubbles as IconBubbles} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TestimonialCard } from "@/components/testimonials/testimonial-card";
import { featuredTestimonials } from "@/data/testimonials";
import {
	FeatureCarousel,
	type FeatureSlide,
} from "@/components/shared/feature-carousel";
import { HiringBanner } from "@/components/shared/hiring-banner";

export const metadata: Metadata = {
	title: "Angel Touch Homecare | Compassionate In-Home Care in Lowell, MA",
	description:
		"Providing compassionate, reliable, and personalized in-home care for seniors and individuals with disabilities in Lowell, MA and surrounding communities.",
	keywords: [
		"home care Lowell MA",
		"in-home care services",
		"senior care Massachusetts",
		"elderly care Lowell",
		"compassionate caregivers",
		"home health aide",
	],
	openGraph: {
		title: "Angel Touch Homecare | Compassion in Every Touch",
		description:
			"Compassionate, reliable in-home care for seniors and individuals with disabilities in Lowell, MA.",
		type: "website",
	},
};

const stats = [
	{
		icon: IconUsers,
		number: "500+",
		label: "Families Served",
	},
	{
		icon: IconHeartHandshake,
		number: "10+",
		label: "Years Experience",
	},
	{
		icon: IconClock24,
		number: "24/7",
		label: "Care Available",
	},
	{
		icon: IconShieldCheck,
		number: "100%",
		label: "Licensed & Insured",
	},
];

const services = [
	{
		icon: IconHome,
		title: "Personal Care",
		description: "Bathing, grooming, and daily living assistance",
	},
	{
		icon: IconPill,
		title: "Medication Management",
		description: "Reminders and organization for medications",
	},
	{
		icon: IconToolsKitchen2,
		title: "Meal Preparation",
		description: "Nutritious meals tailored to dietary needs",
	},
	{
		icon: IconBubbles,
		title: "Light Housekeeping",
		description: "Maintaining a clean and safe environment",
	},
	{
		icon: IconCar,
		title: "Transportation",
		description: "Appointments and errands assistance",
	},
	{
		icon: IconHeart,
		title: "Companionship",
		description: "Social interaction and emotional support",
	},
];

const whyChooseUsSlides: FeatureSlide[] = [
	{
		id: "personalized-care",
		title: "Custom Care Plans",
		description:
			"No cookie-cutter approach here. We develop individualized care plans based on a thorough assessment of your needs, lifestyle, and personal preferences.",
		image:
			"https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=1600",
		imageAlt: "Caregiver creating personalized care plan with client",
		ctaText: "Our Services",
		ctaHref: "/services",
		align: "left",
	},
	{
		id: "consistent-caregivers",
		title: "Familiar Faces You Trust",
		description:
			"We match you with caregivers who fit your personality and needs—and keep them consistent so real relationships can form.",
		image:
			"https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=1600",
		imageAlt: "Trusted caregiver with senior client",
		ctaText: "Meet Our Team",
		ctaHref: "/caregivers",
		align: "left",
	},
	{
		id: "local-roots",
		title: "Deep Local Roots",
		description:
			"Based in Lowell, we proudly serve Dracut, Chelmsford, Tewksbury, and Billerica. We're your neighbors—invested in the same community you call home.",
		image:
			"https://images.pexels.com/photos/7551664/pexels-photo-7551664.jpeg?auto=compress&cs=tinysrgb&w=1600",
		imageAlt: "Local community care",
		ctaText: "About Us",
		ctaHref: "/about",
		align: "left",
	},
	{
		id: "clear-pricing",
		title: "Honest, Upfront Pricing",
		description:
			"No surprises on your bill. We provide clear quotes and flexible payment options so you can plan with confidence.",
		image:
			"https://images.pexels.com/photos/7176325/pexels-photo-7176325.jpeg?auto=compress&cs=tinysrgb&w=1600",
		imageAlt: "Family consultation about care options",
		ctaText: "Get a Quote",
		ctaHref: "/contact",
		align: "left",
	},
];

/**
 * Home page - Marketing landing page
 *
 * Sections: Hero, Stats, Services Preview, Why Choose Us, Testimonials, CTA
 */
export default function HomePage() {
	return (
		<main className="min-h-screen" aria-label="Angel Touch Homecare">
			{/* Hero Section */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mt-4 mb-14 md:mb-18">
				<div className="relative rounded-3xl overflow-hidden">
					<div className="absolute inset-0">
						<Image
							src="https://images.pexels.com/photos/7345465/pexels-photo-7345465.jpeg?auto=compress&cs=tinysrgb&w=1600"
							alt="Compassionate caregiver with senior client"
							fill
							className="object-cover"
							priority
							sizes="100vw"
						/>
						{/* Light mode: minimal overlay to preserve image brightness */}
						{/* Dark mode: stronger overlay for text contrast */}
						<div className="absolute inset-0 bg-background/40 dark:bg-background/70" />
						<div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-transparent dark:from-background/60 dark:via-background/30" />
					</div>

					<div className="relative z-10 px-6 md:px-10 py-16 md:py-24 lg:py-28">
						<div className="max-w-3xl">
							<h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
								<span className="text-decorative">Compassion in</span>
								<br />
								<span className="text-primary">Every Touch</span>
							</h1>
							<p className="text-xl md:text-2xl text-foreground mb-8 leading-relaxed max-w-2xl">
								Providing compassionate, reliable, and personalized in-home care
								for seniors and individuals with disabilities in Lowell, MA and
								surrounding communities.
							</p>
							<div className="flex flex-col sm:flex-row gap-4">
								<Button
									asChild
									size="lg"
									className="px-6 text-base sm:px-8 sm:text-lg"
								>
									<Link href="/contact">Book Free Consultation</Link>
								</Button>
								<Button
									asChild
									size="lg"
									variant="outline"
									className="px-6 text-base sm:px-8 sm:text-lg"
								>
									<Link href="/services">View Our Services</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Hiring Banner - Toggleable via siteConfig */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mb-8">
				<HiringBanner />
			</section>

			{/* Statistics Section */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
					{stats.map((stat) => (
						<Card
							key={stat.label}
							className={cn(
								"text-center p-4 sm:p-6 md:p-8",
								"bg-card/50 backdrop-blur-md",
								"border-border/50 hover:border-primary/30",
								"transition-all duration-300 hover:-translate-y-1"
							)}
						>
							<div
								className="text-icon mb-3 flex justify-center"
								aria-hidden="true"
							>
								<stat.icon className="size-8 md:size-10" />
							</div>
							<div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">
								{stat.number}
							</div>
							<div className="text-muted-foreground font-medium text-sm md:text-base">
								{stat.label}
							</div>
						</Card>
					))}
				</div>
			</section>

			{/* Welcome / Mission Section */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20">
				<Card className="relative overflow-hidden p-6 sm:p-8 md:p-12 bg-card/50 border-border/50">
					<div
						className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/0.10),transparent_60%)]"
						aria-hidden="true"
					/>
					<div className="relative z-10 text-center max-w-4xl mx-auto">
						<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
							Welcome to{" "}
							<span className="text-decorative">Angel Touch Homecare</span>
						</h2>
						<p className="text-muted-foreground text-base md:text-lg leading-relaxed italic">
							Our mission is to enhance quality of life through deeply
							personalized care plans, delivered by experienced and certified
							caregivers. We use advanced client management software for
							seamless communication, scheduling, and care coordination.
						</p>
					</div>
				</Card>
			</section>

			{/* Services Preview Section */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20">
				<div className="text-center mb-10 md:mb-12">
					<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
						Our Services at a <span className="text-primary">Glance</span>
					</h2>
					<p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
						Comprehensive care services designed to support independence and
						enhance quality of life.
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{services.map((service) => (
						<Card
							key={service.title}
							className={cn(
								"p-6 text-center",
								"bg-card/50 backdrop-blur-md",
								"border-border/50 hover:border-primary/30",
								"transition-all duration-300 hover:-translate-y-1"
							)}
						>
							<div
								className="text-icon mb-4 flex justify-center"
								aria-hidden="true"
							>
								<service.icon className="size-12" />
							</div>
							<h3 className="text-lg font-semibold text-foreground mb-2">
								{service.title}
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{service.description}
							</p>
						</Card>
					))}
				</div>

				<div className="text-center mt-8">
					<Button asChild variant="outline" size="lg">
						<Link href="/services">
							View All Services
							<IconArrowRight className="ml-2 size-4" />
						</Link>
					</Button>
				</div>
			</section>

			{/* Why Choose Us Section - Carousel */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20">
				<div className="text-center mb-10 md:mb-12">
					<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
						Why Choose <span className="text-primary">Angel Touch?</span>
					</h2>
					<p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
						Custom care plans, consistent caregiver assignments, strong local
						ties, and transparent pricing set us apart.
					</p>
				</div>

				<FeatureCarousel
					slides={whyChooseUsSlides}
					autoplayDelay={6000}
					showArrows={true}
					showDots={true}
					aspectRatio="aspect-[16/9] md:aspect-[21/9]"
					className="rounded-3xl overflow-hidden"
				/>
			</section>

			{/* Testimonials Preview Section */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20">
				<div className="text-center mb-10 md:mb-12">
					<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
						What <span className="text-primary">Families</span> Say
					</h2>
					<p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
						Hear from the families who trust Angel Touch for their loved
						ones&apos; care.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{featuredTestimonials.map((testimonial) => (
						<TestimonialCard key={testimonial.id} testimonial={testimonial} />
					))}
				</div>

				<div className="text-center mt-8">
					<Button asChild variant="outline" size="lg">
						<Link href="/testimonials">
							Read More Stories
							<IconArrowRight className="ml-2 size-4" />
						</Link>
					</Button>
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
						Ready to Experience Compassionate Care?
					</h2>
					<p className="text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed mb-8">
						Contact us today for a free consultation. Let us create a
						personalized care plan for you or your loved one.
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
