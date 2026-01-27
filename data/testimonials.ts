import type { Testimonial } from "@/types/cards";

/**
 * Testimonials data for Angel Touch Homecare
 * Backend-ready: includes all fields needed for future database storage
 */
export const testimonials: Testimonial[] = [
  {
    id: "evelyn-r",
    name: "Evelyn R.",
    text: "Angel Touch provided my mother with the most caring and attentive support. Their team truly goes above and beyond! The personalized care plan made such a difference in her daily life.",
    relation: "Daughter of client",
    rating: 5,
    date: "December 2025",
  },
  {
    id: "samuel-p",
    name: "Samuel P.",
    text: "The caregivers are professional, friendly, and always on time. I have peace of mind knowing my father is in good hands. The communication with family is excellent.",
    relation: "Son of client",
    rating: 5,
    date: "November 2025",
  },
  {
    id: "patricia-l",
    name: "Patricia L.",
    text: "Their personalized care plans made all the difference for our family. The companion care has brought so much joy to my daily routine. Highly recommend Angel Touch!",
    relation: "Client",
    rating: 5,
    date: "October 2025",
  },
  {
    id: "maria-g",
    name: "Maria G.",
    text: "After my surgery, Angel Touch helped me transition back to independence safely. The meal preparation and light housekeeping were exactly what I needed.",
    relation: "Client",
    rating: 5,
    date: "September 2025",
  },
  {
    id: "robert-k",
    name: "Robert K.",
    text: "The transportation services have been a lifesaver for my medical appointments. The caregivers are patient, kind, and truly understand our needs.",
    relation: "Client",
    rating: 5,
    date: "August 2025",
  },
  {
    id: "jennifer-m",
    name: "Jennifer M.",
    text: "We've tried other agencies before, but Angel Touch is different. They truly care about matching the right caregiver with each client. Our whole family is grateful.",
    relation: "Daughter of client",
    rating: 5,
    date: "July 2025",
  },
  {
    id: "david-w",
    name: "David W.",
    text: "The level of professionalism and compassion from every team member has been outstanding. They treat my wife with dignity and respect every single day.",
    relation: "Husband of client",
    rating: 5,
    date: "June 2025",
  },
  {
    id: "susan-t",
    name: "Susan T.",
    text: "Finding Angel Touch was a blessing. The caregivers have become like extended family to us. Their dedication to quality care is evident in everything they do.",
    relation: "Client",
    rating: 5,
    date: "May 2025",
  },
];

/**
 * Featured testimonials for homepage or highlights
 */
export const featuredTestimonials = testimonials.slice(0, 3);

/**
 * Get testimonial by ID
 */
export function getTestimonialById(id: string): Testimonial | undefined {
  return testimonials.find((t) => t.id === id);
}

/**
 * Get testimonials by relation type
 */
export function getTestimonialsByRelation(relation: string): Testimonial[] {
  return testimonials.filter((t) =>
    t.relation.toLowerCase().includes(relation.toLowerCase())
  );
}
