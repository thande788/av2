import type { Metadata } from "next";
import {
	IconPhone,
	IconMail,
	IconClock,
	IconMapPin,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
	title: "Contact Us",
	description:
		"Get in touch with Angel Touch Homecare Services. Schedule a free consultation or ask about our compassionate home care services in Lowell, MA.",
	keywords: [
		"contact Angel Touch",
		"home care consultation",
		"Lowell home care",
		"schedule care assessment",
		"home care inquiry",
	],
	openGraph: {
		title: "Contact Us | Angel Touch Homecare",
		description:
			"Ready to learn more? Contact us for a free consultation about our home care services.",
		type: "website",
	},
};

const contactInfo = [
	{
		icon: IconPhone,
		title: "(978) 856-9358",
		subtitle: "Primary • Available 24/7",
		href: "tel:978-856-9358",
	},
	{
		icon: IconPhone,
		title: "(254) 245-6917",
		subtitle: "Alternative • Available 24/7",
		href: "tel:254-245-6917",
	},
	{
		icon: IconMail,
		title: "info@angeltouch.services",
		subtitle: "We'll respond within 24 hours",
		href: "mailto:info@angeltouch.services",
	},
];

const officeHours = [
	{ day: "Monday - Friday", hours: "8:00 AM - 6:00 PM" },
	{ day: "Saturday", hours: "9:00 AM - 4:00 PM" },
	{ day: "Sunday", hours: "Emergency calls only" },
];

export default function ContactPage() {
	return (
		<main className="min-h-screen" aria-label="Contact Us">
			{/* Hero Section */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mt-4 mb-14 md:mb-18">
				<Card className="relative overflow-hidden p-6 sm:p-8 md:p-12 bg-card/50 border-border/50">
					<div
						className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/0.10),transparent_60%)]"
						aria-hidden="true"
					/>
					<div className="relative z-10 text-center max-w-3xl mx-auto">
						<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
							Get in <span className="text-primary">Touch</span>
						</h1>
						<p className="text-muted-foreground text-base md:text-lg leading-relaxed">
							Ready to learn more about our services? We&apos;re here to help
							you find the perfect care solution for your family.
						</p>
					</div>
				</Card>
			</section>

			{/* Contact Content */}
			<section className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
					{/* Contact Form */}
					<ContactForm />

					{/* Contact Information */}
					<div className="space-y-6">
						{/* Quick Contact */}
						<Card
							className={cn(
								"p-6 md:p-8",
								"bg-gradient-to-br from-primary to-primary/80",
								"text-primary-foreground border-0"
							)}
						>
							<h3 className="text-xl font-bold mb-6">Quick Contact</h3>
							<div className="space-y-4">
								{contactInfo.map((item) => (
									<a
										key={item.title}
										href={item.href}
										className="flex items-center gap-4 text-primary-foreground hover:text-primary-foreground/80 transition-colors no-underline group"
									>
										<div className="flex size-10 items-center justify-center rounded-lg bg-primary-foreground/20 group-hover:bg-primary-foreground/30 transition-colors">
											<item.icon className="size-5" />
										</div>
										<div>
											<p className="font-medium">{item.title}</p>
											<p className="text-sm text-primary-foreground/80">
												{item.subtitle}
											</p>
										</div>
									</a>
								))}
							</div>
						</Card>

						{/* Office Hours */}
						<Card className="p-6 md:p-8 bg-card/50 border-border/50">
							<div className="flex items-center gap-3 mb-6">
								<IconClock className="size-6 text-icon" />
								<h3 className="text-xl font-bold text-foreground">
									Office Hours
								</h3>
							</div>
							<div className="space-y-3">
								{officeHours.map((item) => (
									<div
										key={item.day}
										className="flex justify-between text-sm"
									>
										<span className="text-muted-foreground">{item.day}</span>
										<span className="text-foreground font-medium">
											{item.hours}
										</span>
									</div>
								))}
							</div>
							<div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
								<p className="text-sm text-foreground">
									<strong>Emergency services available 24/7</strong> for
									existing clients
								</p>
							</div>
						</Card>

						{/* Location */}
						<Card className="p-6 md:p-8 bg-card/50 border-border/50">
							<div className="flex items-center gap-3 mb-4">
								<IconMapPin className="size-6 text-icon" />
								<h3 className="text-xl font-bold text-foreground">
									Service Area
								</h3>
							</div>
							<p className="text-muted-foreground leading-relaxed">
								Proudly serving Lowell, Dracut, Chelmsford, Tewksbury, Billerica,
								and surrounding communities in the Greater Lowell area.
							</p>
						</Card>
					</div>
				</div>
			</section>
		</main>
	);
}
