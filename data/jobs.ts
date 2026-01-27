/**
 * Job listings data for Angel Touch Homecare Services
 * 
 * This data structure is designed to be Prisma-compatible
 * for easy database migration in the future.
 */

import type { Job } from "@/types/job";

export const jobs: Job[] = [
  {
    id: "clw1abc123",
    slug: "certified-home-health-aide",
    title: "Certified Home Health Aide (HHA)",
    department: "caregiving",
    type: "full-time",
    location: "Lowell, MA & Surrounding Areas",
    salaryRange: { min: 18, max: 22, period: "hourly" },
    description: `Join our compassionate team at Angel Touch Homecare Services! We're seeking dedicated Certified Home Health Aides to provide exceptional in-home care to seniors and individuals with disabilities throughout the Greater Lowell area.

As a Home Health Aide with Angel Touch, you'll make a meaningful difference in the lives of our clients by helping them maintain their independence and quality of life in the comfort of their own homes. Our team-oriented environment provides ongoing support, training, and opportunities for growth.`,
    responsibilities: [
      "Assist clients with activities of daily living (ADLs) including bathing, dressing, grooming, and toileting",
      "Provide companionship and emotional support to clients",
      "Perform light housekeeping duties such as laundry, dishes, and maintaining a clean environment",
      "Prepare nutritious meals according to dietary requirements and preferences",
      "Assist with medication reminders (non-administering)",
      "Document care provided and report any changes in client condition to supervisors",
      "Accompany clients to medical appointments and errands when needed",
      "Maintain client confidentiality and treat all clients with dignity and respect",
    ],
    qualifications: {
      required: [
        "Valid Home Health Aide (HHA) certification in Massachusetts",
        "Current CPR and First Aid certification",
        "Reliable transportation with valid driver's license and insurance",
        "Ability to pass CORI background check",
        "Physical ability to lift up to 50 lbs and assist with transfers",
        "Excellent communication skills in English",
        "Compassionate, patient, and reliable demeanor",
      ],
      preferred: [
        "1+ years of home care or healthcare experience",
        "Experience caring for clients with dementia or Alzheimer's disease",
        "Bilingual abilities (Spanish, Portuguese, Khmer, or Vietnamese)",
        "CNA certification",
        "Experience with hoyer lifts and other medical equipment",
      ],
    },
    benefits: [
      "Competitive hourly rates ($18-$22/hour based on experience)",
      "Flexible scheduling to fit your lifestyle",
      "Paid training and ongoing education opportunities",
      "Health insurance for full-time employees",
      "Paid time off and holiday pay",
      "401(k) retirement plan",
      "Employee referral bonuses",
      "Supportive and collaborative team environment",
      "Opportunities for advancement",
    ],
    isActive: true,
    postedAt: new Date("2026-01-15"),
  },
  {
    id: "clw2def456",
    slug: "certified-nursing-assistant",
    title: "Certified Nursing Assistant (CNA)",
    department: "nursing",
    type: "full-time",
    location: "Lowell, MA & Surrounding Areas",
    salaryRange: { min: 20, max: 25, period: "hourly" },
    description: `Angel Touch Homecare Services is seeking experienced Certified Nursing Assistants to join our growing team. As a CNA, you'll provide skilled nursing care to clients in their homes, working closely with our nursing supervisors to deliver personalized care plans.

This role offers the opportunity to build meaningful relationships with clients while utilizing your clinical skills in a home care setting.`,
    responsibilities: [
      "Provide personal care including bathing, dressing, and grooming assistance",
      "Monitor and record vital signs (blood pressure, pulse, temperature, respiration)",
      "Assist with range of motion exercises and mobility",
      "Perform wound care under nursing supervision",
      "Assist with catheter care and ostomy care",
      "Implement care plans as directed by nursing staff",
      "Recognize and report changes in client condition immediately",
      "Maintain accurate documentation of all care provided",
    ],
    qualifications: {
      required: [
        "Active CNA certification in Massachusetts",
        "High school diploma or GED",
        "Current CPR and First Aid certification",
        "Minimum 6 months of CNA experience",
        "Valid driver's license and reliable transportation",
        "Ability to pass CORI background check",
        "Strong observation and communication skills",
      ],
      preferred: [
        "2+ years of home care or hospital experience",
        "Experience with ventilator or tracheostomy care",
        "Dementia care training or certification",
        "Bilingual abilities",
        "IV certification",
      ],
    },
    benefits: [
      "Competitive pay ($20-$25/hour)",
      "Weekly pay with direct deposit",
      "Flexible scheduling",
      "Comprehensive health, dental, and vision insurance",
      "Paid sick leave and vacation",
      "Continuing education opportunities with tuition reimbursement",
      "Career advancement pathways",
      "Employee assistance program",
    ],
    isActive: true,
    postedAt: new Date("2026-01-10"),
  },
  {
    id: "clw3ghi789",
    slug: "part-time-companion-caregiver",
    title: "Part-Time Companion Caregiver",
    department: "caregiving",
    type: "part-time",
    location: "Greater Lowell Area, MA",
    salaryRange: { min: 16, max: 19, period: "hourly" },
    description: `Looking for a rewarding part-time opportunity? Angel Touch Homecare Services is hiring Companion Caregivers to provide non-medical support and companionship to seniors in their homes.

This is an ideal position for individuals who want to make a positive impact while maintaining a flexible schedule. No certification required—we provide training!`,
    responsibilities: [
      "Provide friendly companionship and conversation",
      "Assist with light housekeeping and laundry",
      "Prepare meals and snacks",
      "Accompany clients on walks and outings",
      "Run errands and assist with shopping",
      "Play games, read, or engage in hobbies with clients",
      "Provide medication reminders",
      "Report any concerns to the care coordinator",
    ],
    qualifications: {
      required: [
        "High school diploma or equivalent",
        "Reliable transportation",
        "Ability to pass background check",
        "Genuine compassion for seniors",
        "Dependable and punctual",
        "Good communication skills",
      ],
      preferred: [
        "Previous caregiving experience (personal or professional)",
        "First Aid/CPR certification",
        "Experience with seniors or individuals with memory impairment",
        "Bilingual abilities",
      ],
    },
    benefits: [
      "Competitive hourly pay ($16-$19/hour)",
      "Flexible hours—choose shifts that work for you",
      "Paid training provided",
      "Supportive supervision",
      "Opportunity to transition to HHA certification",
      "Referral bonuses",
    ],
    isActive: true,
    postedAt: new Date("2026-01-20"),
  },
  {
    id: "clw4jkl012",
    slug: "weekend-live-in-caregiver",
    title: "Weekend Live-In Caregiver",
    department: "caregiving",
    type: "per-diem",
    location: "Various Locations - Lowell, Chelmsford, Dracut, MA",
    salaryRange: { min: 200, max: 275, period: "hourly" }, // Daily rate displayed as hourly type for flexibility
    description: `Angel Touch Homecare Services is seeking reliable Weekend Live-In Caregivers for 24-48 hour shifts. This position is perfect for caregivers who prefer consolidated work schedules with built-in rest periods.

Live-in caregivers stay with clients in their homes, providing care and supervision while having designated sleep time and breaks.`,
    responsibilities: [
      "Provide 24-hour supervision and care",
      "Assist with all activities of daily living",
      "Prepare all meals and ensure proper nutrition",
      "Administer medication reminders",
      "Assist with nighttime needs",
      "Light housekeeping to maintain a safe environment",
      "Engage clients in activities and provide companionship",
      "Communicate with family members about client status",
    ],
    qualifications: {
      required: [
        "HHA or CNA certification preferred (or willingness to obtain)",
        "Previous live-in or overnight care experience",
        "Ability to commit to full weekend shifts (Friday evening - Sunday evening)",
        "Excellent judgment and problem-solving skills",
        "Valid ID and ability to pass background check",
        "Calm and patient demeanor",
      ],
      preferred: [
        "Experience with dementia care",
        "Ability to work consecutive weekends",
        "Own transportation",
        "Bilingual skills",
      ],
    },
    benefits: [
      "Premium weekend rates ($200-$275 per day)",
      "Meals provided during shifts",
      "Designated sleep periods (8 hours per 24-hour shift)",
      "Consistent weekend scheduling available",
      "Holiday premium pay",
      "Supportive on-call supervision",
    ],
    isActive: true,
    postedAt: new Date("2026-01-18"),
  },
  {
    id: "clw5mno345",
    slug: "care-coordinator",
    title: "Care Coordinator / Scheduler",
    department: "administrative",
    type: "full-time",
    location: "Lowell, MA (Office-Based)",
    salaryRange: { min: 45000, max: 55000, period: "annual" },
    description: `Join our administrative team as a Care Coordinator! This office-based role is essential to our operations, matching caregivers with clients and ensuring seamless scheduling and communication.

The ideal candidate is highly organized, tech-savvy, and passionate about helping others. You'll be the central point of contact for caregivers, clients, and families.`,
    responsibilities: [
      "Create and manage caregiver schedules using scheduling software",
      "Match caregivers with clients based on skills, availability, and preferences",
      "Handle schedule changes, call-outs, and emergency coverage",
      "Conduct initial phone screenings with potential clients",
      "Communicate care plan updates to field staff",
      "Maintain accurate records in the client management system",
      "Process new caregiver onboarding paperwork",
      "Provide excellent customer service to clients and families",
    ],
    qualifications: {
      required: [
        "High school diploma required; Associate's or Bachelor's degree preferred",
        "2+ years of scheduling or coordination experience",
        "Proficiency with Microsoft Office and scheduling software",
        "Excellent organizational and multitasking abilities",
        "Strong verbal and written communication skills",
        "Ability to work in a fast-paced environment",
        "Empathy and professionalism when working with clients and families",
      ],
      preferred: [
        "Experience in home care, healthcare, or staffing industry",
        "Knowledge of home care regulations in Massachusetts",
        "Bilingual (Spanish, Portuguese, or Khmer)",
        "Experience with home care software (ClearCare, AlayaCare, etc.)",
      ],
    },
    benefits: [
      "Competitive salary ($45,000-$55,000 annually)",
      "Health, dental, and vision insurance",
      "Paid holidays and vacation time",
      "401(k) with company match",
      "Professional development opportunities",
      "Positive, team-oriented work environment",
      "Monday-Friday schedule with occasional on-call rotation",
    ],
    isActive: true,
    postedAt: new Date("2026-01-12"),
  },
];

/**
 * Get all active jobs
 */
export function getActiveJobs(): Job[] {
  return jobs.filter((job) => job.isActive);
}

/**
 * Get a job by its slug
 */
export function getJobBySlug(slug: string): Job | undefined {
  return jobs.find((job) => job.slug === slug);
}

/**
 * Get jobs by department
 */
export function getJobsByDepartment(department: Job["department"]): Job[] {
  return jobs.filter((job) => job.department === department && job.isActive);
}

/**
 * Get all unique departments that have active jobs
 */
export function getActiveDepartments(): Job["department"][] {
  const departments = new Set(getActiveJobs().map((job) => job.department));
  return Array.from(departments);
}

/**
 * Format salary range for display
 */
export function formatSalaryRange(job: Pick<Job, "salaryRange">): string {
  const { min, max, period } = job.salaryRange;
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  if (period === "hourly") {
    return `${formatter.format(min)} - ${formatter.format(max)}/hr`;
  }
  return `${formatter.format(min)} - ${formatter.format(max)}/year`;
}

/**
 * Format job type for display
 */
export function formatJobType(type: Job["type"]): string {
  const typeLabels: Record<Job["type"], string> = {
    "full-time": "Full-Time",
    "part-time": "Part-Time",
    "per-diem": "Per Diem",
  };
  return typeLabels[type];
}

/**
 * Format department for display
 */
export function formatDepartment(department: Job["department"]): string {
  const deptLabels: Record<Job["department"], string> = {
    caregiving: "Caregiving",
    administrative: "Administrative",
    nursing: "Nursing",
  };
  return deptLabels[department];
}
