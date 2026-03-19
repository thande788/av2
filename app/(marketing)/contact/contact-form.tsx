"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { IconCheck, IconLoader2, IconUser } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	submitContactForm,
	type ContactFormState,
} from "@/app/actions/contact";

const serviceOptions = [
	{ value: "personal-care", label: "Personal Care Assistance" },
	{ value: "companionship", label: "Companionship Services" },
	{ value: "housekeeping", label: "Light Housekeeping" },
	{ value: "meal-prep", label: "Meal Preparation" },
	{ value: "transportation", label: "Transportation" },
	{ value: "medication", label: "Medication Reminders" },
	{ value: "general", label: "General Inquiry" },
];

const urgencyOptions = [
	{ value: "not-urgent", label: "Not urgent - within 2 weeks" },
	{ value: "moderate", label: "Moderate - within 1 week" },
	{ value: "urgent", label: "Urgent - within 3 days" },
	{ value: "very-urgent", label: "Very urgent - within 24 hours" },
];

const initialState: ContactFormState = {
	success: false,
	message: "",
};

export function ContactForm() {
	const searchParams = useSearchParams();
	const caregiverId = searchParams.get('caregiver');
	const caregiverName = searchParams.get('caregiverName');

	const [state, formAction, isPending] = useActionState(
		submitContactForm,
		initialState
	);

	if (state.success) {
		return (
			<Card className="p-8 md:p-10 bg-card/50 border-border/50 text-center">
				<div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-green-500/20">
					<IconCheck className="size-8 text-green-500" />
				</div>
				<h2 className="text-2xl font-bold text-foreground mb-4">
					Message Sent!
				</h2>
				<p className="text-muted-foreground">{state.message}</p>
			</Card>
		);
	}

	return (
		<Card className="p-6 md:p-8 bg-card/50 border-border/50">
			<h2 className="text-2xl font-bold text-foreground mb-6">
				Send us a Message
			</h2>

			<form action={formAction} className="space-y-6">
				{/* Hidden fields for caregiver tracking */}
				{caregiverId && (
					<>
						<input type="hidden" name="caregiverId" value={caregiverId} />
						<input type="hidden" name="source" value="caregiver-profile" />
					</>
				)}

				{/* Caregiver request banner */}
				{caregiverName && (
					<div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
						<IconUser className="size-5 text-primary shrink-0" />
						<div>
							<p className="text-sm font-medium">Requesting Caregiver</p>
							<p className="text-sm text-muted-foreground">
								{caregiverName}
							</p>
						</div>
						<Badge className="ml-auto bg-primary/10 text-primary">Preferred</Badge>
					</div>
				)}

				{/* Honeypot field - hidden from real users, catches bots */}
				<div className="absolute -left-[9999px]" aria-hidden="true">
					<Label htmlFor="website">Website</Label>
					<Input
						id="website"
						name="website"
						type="text"
						tabIndex={-1}
						autoComplete="off"
					/>
				</div>

				{/* Name Field */}
				<div className="space-y-2">
					<Label htmlFor="name">Full Name *</Label>
					<Input
						id="name"
						name="name"
						type="text"
						placeholder="Enter your full name"
						required
						aria-describedby={state.errors?.name ? "name-error" : undefined}
					/>
					{state.errors?.name && (
						<p id="name-error" className="text-sm text-destructive">
							{state.errors.name[0]}
						</p>
					)}
				</div>

				{/* Email Field */}
				<div className="space-y-2">
					<Label htmlFor="email">Email Address *</Label>
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="your@email.com"
						required
						aria-describedby={state.errors?.email ? "email-error" : undefined}
					/>
					{state.errors?.email && (
						<p id="email-error" className="text-sm text-destructive">
							{state.errors.email[0]}
						</p>
					)}
				</div>

				{/* Phone Field */}
				<div className="space-y-2">
					<Label htmlFor="phone">Phone Number</Label>
					<Input
						id="phone"
						name="phone"
						type="tel"
						placeholder="(555) 123-4567"
					/>
				</div>

				{/* Service Selection */}
				<div className="space-y-2">
					<Label htmlFor="service">Service of Interest *</Label>
					<Select name="service" defaultValue="general" required>
						<SelectTrigger id="service">
							<SelectValue placeholder="Select a service" />
						</SelectTrigger>
						<SelectContent>
							{serviceOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{state.errors?.service && (
						<p className="text-sm text-destructive">{state.errors.service[0]}</p>
					)}
				</div>

				{/* Urgency Selection */}
				<div className="space-y-2">
					<Label htmlFor="urgency">Urgency Level *</Label>
					<Select name="urgency" defaultValue="not-urgent" required>
						<SelectTrigger id="urgency">
							<SelectValue placeholder="Select urgency" />
						</SelectTrigger>
						<SelectContent>
							{urgencyOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{state.errors?.urgency && (
						<p className="text-sm text-destructive">{state.errors.urgency[0]}</p>
					)}
				</div>

				{/* Message Field */}
				<div className="space-y-2">
					<Label htmlFor="message">Message *</Label>
					<Textarea
						id="message"
						name="message"
						placeholder="Tell us about your care needs..."
						rows={4}
						required
						aria-describedby={
							state.errors?.message ? "message-error" : undefined
						}
					/>
					{state.errors?.message && (
						<p id="message-error" className="text-sm text-destructive">
							{state.errors.message[0]}
						</p>
					)}
				</div>

				{/* Preferred Contact Method */}
				<div className="space-y-3">
					<Label>Preferred Contact Method</Label>
					<RadioGroup
						name="preferredContact"
						defaultValue="email"
						className="flex gap-6"
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="email" id="contact-email" />
							<Label htmlFor="contact-email" className="font-normal">
								Email
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="phone" id="contact-phone" />
							<Label htmlFor="contact-phone" className="font-normal">
								Phone
							</Label>
						</div>
					</RadioGroup>
				</div>

				{/* Error Message */}
				{state.message && !state.success && (
					<p className="text-sm text-destructive">{state.message}</p>
				)}

				{/* Submit Button */}
				<Button type="submit" size="lg" className="w-full" disabled={isPending}>
					{isPending ? (
						<>
							<IconLoader2 className="mr-2 size-4 animate-spin" />
							Sending...
						</>
					) : (
						"Send Message"
					)}
				</Button>
			</form>
		</Card>
	);
}
