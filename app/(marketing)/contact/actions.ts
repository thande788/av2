"use server";

import { z } from "zod";

/**
 * Contact form validation schema
 */
export const contactFormSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Please enter a valid email address"),
	phone: z.string().optional(),
	service: z.string().min(1, "Please select a service"),
	urgency: z.string().min(1, "Please select an urgency level"),
	message: z.string().min(10, "Message must be at least 10 characters"),
	preferredContact: z.enum(["email", "phone"]),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export type ContactFormState = {
	success: boolean;
	message: string;
	errors?: Record<string, string[]>;
};

/**
 * Server Action for contact form submission
 */
export async function submitContactForm(
	prevState: ContactFormState,
	formData: FormData
): Promise<ContactFormState> {
	// Parse form data
	const rawData = {
		name: formData.get("name"),
		email: formData.get("email"),
		phone: formData.get("phone"),
		service: formData.get("service"),
		urgency: formData.get("urgency"),
		message: formData.get("message"),
		preferredContact: formData.get("preferredContact"),
	};

	// Validate
	const validated = contactFormSchema.safeParse(rawData);

	if (!validated.success) {
		return {
			success: false,
			message: "Please fix the errors below.",
			errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
		};
	}

	// In production, this would:
	// 1. Send email notification
	// 2. Store in database
	// 3. Integrate with CRM
	// 4. Send confirmation email to user

	// Simulate async operation
	await new Promise((resolve) => setTimeout(resolve, 1000));

	// Log for development
	console.log("Contact form submission:", validated.data);

	return {
		success: true,
		message:
			"Thank you for your message! We'll get back to you within 24 hours.",
	};
}
