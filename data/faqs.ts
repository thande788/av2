import type { FAQItem } from "@/types/faq";

/**
 * FAQ data for Angel Touch Homecare
 */
export const faqs: FAQItem[] = [
  {
    id: "areas-served",
    question: "What areas do you serve?",
    answer:
      "We serve Lowell, Dracut, Chelmsford, Tewksbury, Billerica, and nearby towns throughout the Greater Lowell area.",
    category: "General",
  },
  {
    id: "caregiver-certification",
    question: "Are your caregivers certified?",
    answer:
      "Yes, all caregivers are experienced, certified, and undergo comprehensive background checks, CORI screening, and ongoing training to maintain the highest standards of care.",
    category: "Caregivers",
  },
  {
    id: "getting-started",
    question: "How do I get started with services?",
    answer:
      "Contact us via our online form or phone to schedule a complimentary consultation. We'll conduct a comprehensive assessment and create a personalized care plan tailored to your specific needs.",
    category: "Getting Started",
  },
  {
    id: "payment-options",
    question: "What payment options are available?",
    answer:
      "We accept private pay, long-term care insurance, and some Medicaid programs. We'll work with you to find the most suitable payment option for your situation.",
    category: "Billing",
  },
  {
    id: "choose-caregiver",
    question: "Can I choose my caregiver?",
    answer:
      "Absolutely! We strive for consistent caregiver assignments and carefully match clients with caregivers who best fit their personality, needs, and preferences.",
    category: "Caregivers",
  },
  {
    id: "confidentiality",
    question: "Is my information kept confidential?",
    answer:
      "Yes, we are fully HIPAA-compliant and prioritize client privacy and data security. All personal and medical information is kept strictly confidential.",
    category: "Privacy",
  },
  {
    id: "24-hour-care",
    question: "Do you provide 24-hour care?",
    answer:
      "We offer flexible scheduling including hourly, daily, and extended care options. While we currently focus on scheduled visits, we're expanding to offer 24-hour live-in care.",
    category: "Services",
  },
  {
    id: "satisfaction",
    question: "What if I'm not satisfied with the service?",
    answer:
      "Your satisfaction is our priority. We offer ongoing communication and will adjust care plans or reassign caregivers as needed to ensure you receive the best possible care.",
    category: "Quality",
  },
];

/**
 * Get FAQs by category
 */
export function getFAQsByCategory(category: string): FAQItem[] {
  return faqs.filter((faq) => faq.category === category);
}

/**
 * Get all unique FAQ categories
 */
export function getFAQCategories(): string[] {
  const categories = new Set(faqs.map((faq) => faq.category).filter(Boolean));
  return Array.from(categories) as string[];
}
