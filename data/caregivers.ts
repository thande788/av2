import type { Caregiver } from "@/types/cards";

/**
 * Caregiver team data
 *
 * photoBase references images in public/caregivers/original/<photoBase>.jpg
 * For now using photoUrl with placeholder images until actual photos are migrated.
 */
export const caregivers: Caregiver[] = [
	{
		id: "maria-thompson",
		fullName: "Maria Thompson",
		photoUrl:
			"https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=600",
		bio: "Certified Home Health Aide with 8+ years supporting dementia and companionship needs; known for warm, person-centered care.",
		yearsExperience: 8,
		rating: 4.9,
		specialties: ["Dementia", "Companionship", "Medication Reminders"],
		certifications: [
			"Certified Home Health Aide",
			"CPR",
			"First Aid",
			"Dementia Care Specialist",
		],
		languages: ["English", "Spanish"],
		available: true,
	},
	{
		id: "james-carter",
		fullName: "James Carter",
		photoUrl:
			"https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=600",
		bio: "Nursing background with 12+ years in elder home care focusing on mobility support and complex chronic conditions.",
		yearsExperience: 12,
		rating: 4.8,
		specialties: ["Chronic Conditions", "Mobility Support", "Post-op"],
		certifications: [
			"RN Consultant",
			"Medication Management",
			"Elder Abuse Prevention",
		],
		languages: ["English"],
		available: true,
	},
	{
		id: "sophia-martinez",
		fullName: "Sophia Martinez",
		photoUrl:
			"https://images.pexels.com/photos/5452199/pexels-photo-5452199.jpeg?auto=compress&cs=tinysrgb&w=600",
		bio: "Detail-oriented caregiver emphasizing safe daily living support, encouragement, and collaborative family communication.",
		yearsExperience: 7,
		rating: 4.7,
		specialties: ["Personal Care", "Companionship", "Medication Reminders"],
		certifications: ["Personal Care Assistant", "CPR", "Infection Control"],
		languages: ["English", "Spanish"],
		available: true,
	},
	{
		id: "ethan-bailey",
		fullName: "Ethan Bailey",
		photoUrl:
			"https://images.pexels.com/photos/5452268/pexels-photo-5452268.jpeg?auto=compress&cs=tinysrgb&w=600",
		bio: "Supportive male caregiver focusing on post-operative recovery, safe mobility, and confidence-building daily routines.",
		yearsExperience: 6,
		rating: 4.6,
		specialties: ["Mobility Support", "Post-op", "Companionship"],
		certifications: ["Safe Transfer Training", "CPR", "First Aid"],
		languages: ["English"],
		available: false,
	},
	{
		id: "ava-johnson",
		fullName: "Ava Johnson",
		photoUrl:
			"https://images.pexels.com/photos/5452196/pexels-photo-5452196.jpeg?auto=compress&cs=tinysrgb&w=600",
		bio: "Reliable caregiver with strong background in medication routines, emotional support, and daily activity engagement.",
		yearsExperience: 5,
		rating: 4.8,
		specialties: ["Medication Reminders", "Companionship", "Nutrition"],
		certifications: ["Medication Management", "First Aid", "CPR"],
		languages: ["English"],
		available: true,
	},
	{
		id: "michael-lee",
		fullName: "Michael Lee",
		photoUrl:
			"https://images.pexels.com/photos/5452274/pexels-photo-5452274.jpeg?auto=compress&cs=tinysrgb&w=600",
		bio: "Calm and attentive caregiver experienced in cognitive support, routine structure, and senior engagement activities.",
		yearsExperience: 9,
		rating: 4.9,
		specialties: ["Dementia", "Cognitive Support", "Companionship"],
		certifications: ["CPR", "First Aid", "Dementia Care"],
		languages: ["English", "Mandarin"],
		available: true,
	},
	{
		id: "jorge-hernandes",
		fullName: "Jorge Hernandes",
		photoUrl:
			"https://images.pexels.com/photos/5452205/pexels-photo-5452205.jpeg?auto=compress&cs=tinysrgb&w=600",
		bio: "Compassionate caregiver specializing in overnight support and ensuring safe, restful nights for clients and families.",
		yearsExperience: 4,
		rating: 4.5,
		specialties: ["Overnight Care", "Personal Care", "Light Housekeeping"],
		certifications: ["Personal Care Assistant", "CPR", "First Aid"],
		languages: ["English", "Spanish"],
		available: true,
	},
	{
		id: "daniel-wright",
		fullName: "Daniel Wright",
		photoUrl:
			"https://images.pexels.com/photos/5452287/pexels-photo-5452287.jpeg?auto=compress&cs=tinysrgb&w=600",
		bio: "Patient and encouraging caregiver helping clients maintain independence through safe mobility and daily activity support.",
		yearsExperience: 10,
		rating: 4.7,
		specialties: ["Mobility Support", "Transportation", "Companionship"],
		certifications: ["Safe Transfer Training", "CPR", "Defensive Driving"],
		languages: ["English"],
		available: true,
	},
];
