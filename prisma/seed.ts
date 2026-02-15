/**
 * Database Seed Script
 * 
 * Populates the database with demo data for client presentations.
 * Run with: pnpm db:seed
 * 
 * @see https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding
 */

import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from "@prisma/adapter-neon";
import { 
  PrismaClient, 
  Department, 
  JobType, 
  SalaryPeriod, 
  ApplicationStatus, 
  Shift, 
  InquiryStatus,
  // Portal enums
  UserRole,
  UserStatus,
  PayType,
  ComplianceStatus,
  ClientType,
  ServiceLevel,
  ShiftStatus,
  // Compliance enums
  DocType,
  DocStatus,
} from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';
import ws from 'ws';

// Load environment variables from .env.local (Next.js convention)
config({ path: resolve(process.cwd(), '.env.local') });
// Fallback to .env if .env.local doesn't exist
config({ path: resolve(process.cwd(), '.env') });

// Configure Neon to use ws for WebSocket in Node.js
neonConfig.webSocketConstructor = ws;

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set.');
  console.error('');
  console.error('To fix this:');
  console.error('  1. Copy .env.example to .env.local:');
  console.error('     cp .env.example .env.local');
  console.error('');
  console.error('  2. Add your Neon database connection string to .env.local:');
  console.error('     DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"');
  console.error('');
  console.error('  Get your connection string from: https://console.neon.tech');
  process.exit(1);
}

// Create Prisma client with Neon adapter for seeding
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// =============================================================================
// DEMO DATA
// =============================================================================

const jobs = [
  {
    slug: 'certified-nursing-assistant-lowell',
    title: 'Certified Nursing Assistant (CNA)',
    department: Department.NURSING,
    type: JobType.FULL_TIME,
    location: 'Lowell, MA',
    salaryMin: 22,
    salaryMax: 28,
    salaryPeriod: SalaryPeriod.HOURLY,
    description: `Join our compassionate team at Angel Touch Homecare Services as a Certified Nursing Assistant. You'll provide essential care to our clients in their homes, helping them maintain dignity and independence.

We're looking for CNAs who are passionate about making a difference in people's lives. You'll work one-on-one with clients, building meaningful relationships while providing quality care.

This is a rewarding opportunity for those who want to see the direct impact of their work every single day.`,
    responsibilities: [
      'Assist clients with activities of daily living (bathing, dressing, grooming)',
      'Monitor and record vital signs as directed',
      'Assist with mobility and transfers using proper techniques',
      'Provide companionship and emotional support',
      'Prepare light meals and assist with feeding when needed',
      'Perform light housekeeping duties',
      'Document care provided and report changes in client condition',
      'Communicate effectively with family members and care team',
    ],
    qualificationsReq: [
      'Valid CNA certification in Massachusetts',
      'High school diploma or GED',
      'CPR/First Aid certification',
      'Valid driver\'s license and reliable transportation',
      'Ability to pass background check',
      'Excellent communication skills',
      'Physical ability to assist with transfers and mobility',
    ],
    qualificationsPref: [
      '1+ years of home care or nursing home experience',
      'Experience with dementia/Alzheimer\'s care',
      'Bilingual (English/Spanish or English/Portuguese)',
      'Hoyer lift certification',
    ],
    benefits: [
      'Competitive hourly rates ($22-$28/hr)',
      'Flexible scheduling',
      'Health insurance for full-time employees',
      'Paid time off',
      'Ongoing training and certification support',
      'Mileage reimbursement',
      'Supportive team environment',
      'Career advancement opportunities',
    ],
    isActive: true,
    postedAt: new Date('2026-01-15'),
  },
  {
    slug: 'home-health-aide-dracut',
    title: 'Home Health Aide (HHA)',
    department: Department.CAREGIVING,
    type: JobType.PART_TIME,
    location: 'Dracut, MA',
    salaryMin: 18,
    salaryMax: 24,
    salaryPeriod: SalaryPeriod.HOURLY,
    description: `Angel Touch Homecare Services is seeking compassionate Home Health Aides to join our growing team. As an HHA, you'll provide essential non-medical care to seniors and individuals with disabilities in their homes.

This part-time position offers flexible hours perfect for students, parents, or those seeking work-life balance. We match you with clients based on your availability and location.

Make a meaningful difference in someone's life while enjoying a supportive work environment.`,
    responsibilities: [
      'Assist with personal care including bathing, dressing, and grooming',
      'Help with meal preparation and light cooking',
      'Provide medication reminders (non-administration)',
      'Assist with light housekeeping and laundry',
      'Accompany clients to appointments and errands',
      'Engage clients in social and recreational activities',
      'Monitor client safety and well-being',
      'Maintain accurate daily logs',
    ],
    qualificationsReq: [
      'HHA certification or willingness to obtain',
      'High school diploma or equivalent',
      'Valid driver\'s license and reliable vehicle',
      'Clear background check',
      'Compassionate and patient demeanor',
      'Strong communication skills',
    ],
    qualificationsPref: [
      'Previous caregiving experience',
      'First Aid/CPR certification',
      'Experience with elderly clients',
      'Multilingual abilities',
    ],
    benefits: [
      'Flexible scheduling (mornings, afternoons, evenings)',
      'Weekly pay',
      'Paid training programs',
      'Referral bonuses',
      'Supportive supervision',
      'Growth opportunities to full-time',
    ],
    isActive: true,
    postedAt: new Date('2026-01-20'),
  },
  {
    slug: 'live-in-caregiver-chelmsford',
    title: 'Live-In Caregiver',
    department: Department.CAREGIVING,
    type: JobType.FULL_TIME,
    location: 'Chelmsford, MA',
    salaryMin: 280,
    salaryMax: 350,
    salaryPeriod: SalaryPeriod.HOURLY, // Note: This is actually daily rate
    description: `We're seeking experienced live-in caregivers for a rewarding opportunity in Chelmsford. This position involves providing 24-hour care with scheduled rest periods, residing in the client's home for your assigned days.

Live-in caregivers provide comprehensive support including personal care, meal preparation, medication reminders, and companionship. This is ideal for caregivers who prefer consistent schedules with extended time off between rotations.

Room and board provided during your rotation. Typical schedule is 4 days on, 3 days off.`,
    responsibilities: [
      'Provide comprehensive personal care assistance',
      'Prepare nutritious meals according to dietary requirements',
      'Administer medication reminders and track schedules',
      'Assist with mobility and fall prevention',
      'Provide overnight supervision and assistance',
      'Maintain a safe and clean living environment',
      'Engage client in cognitive and social activities',
      'Communicate daily with family members',
      'Respond to emergencies appropriately',
    ],
    qualificationsReq: [
      'Minimum 2 years of caregiving experience',
      'HHA or CNA certification',
      'CPR/First Aid certified',
      'Experience with overnight care',
      'Ability to stay awake/alert as needed overnight',
      'Clean background check',
      'Strong references from previous employers',
      'Comfortable with pets (if applicable)',
    ],
    qualificationsPref: [
      'Experience with dementia/Alzheimer\'s patients',
      'Certified in Hoyer lift operation',
      'Training in fall prevention',
      'Bilingual (Spanish or Portuguese preferred)',
    ],
    benefits: [
      'Competitive daily rate ($280-$350)',
      'Room and board during rotation',
      'Extended time off between rotations',
      'Health insurance eligibility',
      'Paid holidays',
      'Annual bonus program',
      'Ongoing education opportunities',
    ],
    isActive: true,
    postedAt: new Date('2026-02-01'),
  },
  {
    slug: 'care-coordinator',
    title: 'Care Coordinator',
    department: Department.ADMINISTRATIVE,
    type: JobType.FULL_TIME,
    location: 'Lowell, MA (Office)',
    salaryMin: 45000,
    salaryMax: 55000,
    salaryPeriod: SalaryPeriod.ANNUAL,
    description: `Angel Touch Homecare Services is expanding and seeking a Care Coordinator to join our office team in Lowell. This role is the vital link between our clients, caregivers, and management.

As Care Coordinator, you'll manage caregiver schedules, conduct client assessments, handle family communications, and ensure exceptional care delivery. This is a growth-oriented position with opportunities for advancement.

Ideal candidates are organized, empathetic, and skilled at juggling multiple priorities.`,
    responsibilities: [
      'Coordinate caregiver schedules and client assignments',
      'Conduct initial client assessments and care plan development',
      'Handle client and family communications',
      'Process new caregiver applications and onboarding',
      'Monitor care quality through check-ins and visits',
      'Manage on-call rotation for after-hours issues',
      'Maintain accurate records in care management software',
      'Assist with billing and invoice preparation',
      'Participate in community outreach events',
    ],
    qualificationsReq: [
      'Bachelor\'s degree in healthcare, social work, or related field',
      'Minimum 2 years experience in healthcare coordination',
      'Proficiency in Microsoft Office and scheduling software',
      'Excellent written and verbal communication',
      'Valid driver\'s license',
      'Ability to work occasional evenings/weekends for on-call',
    ],
    qualificationsPref: [
      'Experience with home care agencies',
      'Knowledge of MassHealth and insurance requirements',
      'Bilingual (Spanish or Portuguese)',
      'Previous supervisory experience',
    ],
    benefits: [
      'Competitive salary ($45,000-$55,000)',
      'Health, dental, and vision insurance',
      'Paid time off (15 days starting)',
      '401(k) with company match',
      'Professional development budget',
      'Hybrid work schedule (3 office / 2 remote)',
      'Collaborative team environment',
    ],
    isActive: true,
    postedAt: new Date('2026-02-05'),
  },
  {
    slug: 'weekend-caregiver-tewksbury',
    title: 'Weekend Caregiver',
    department: Department.CAREGIVING,
    type: JobType.PER_DIEM,
    location: 'Tewksbury, MA',
    salaryMin: 20,
    salaryMax: 26,
    salaryPeriod: SalaryPeriod.HOURLY,
    description: `Looking for meaningful weekend work? Angel Touch Homecare needs reliable weekend caregivers for shifts in Tewksbury and surrounding areas.

This per diem position is perfect for those who work weekday jobs, students, or anyone who prefers weekend schedules. Shifts range from 4-12 hours, with morning, afternoon, and evening options available.

No experience required – we provide paid training!`,
    responsibilities: [
      'Assist clients with daily living activities',
      'Provide companionship and social engagement',
      'Prepare meals and assist with feeding',
      'Light housekeeping and laundry',
      'Accompany clients on outings',
      'Document care provided',
    ],
    qualificationsReq: [
      'High school diploma or GED',
      'Reliable transportation',
      'Available for weekend shifts',
      'Clear background check',
      'Compassionate personality',
      'Physical ability to assist with mobility',
    ],
    qualificationsPref: [
      'Previous caregiving experience',
      'CNA or HHA certification',
      'First Aid/CPR certified',
    ],
    benefits: [
      'Premium weekend rates ($20-$26/hr)',
      'Flexible shift selection',
      'Paid training provided',
      'Weekly pay',
      'Opportunity for additional weekday shifts',
      'Path to full-time if desired',
    ],
    isActive: true,
    postedAt: new Date('2026-02-10'),
  },
];

const applications = [
  {
    // Application 1 - Pending review
    firstName: 'Maria',
    lastName: 'Santos',
    email: 'maria.santos@email.com',
    phone: '(978) 555-0123',
    street: '45 Central Street',
    city: 'Lowell',
    state: 'MA',
    zip: '01852',
    yearsExperience: 5,
    certifications: ['CNA', 'CPR/First Aid', 'Dementia Care Certified'],
    availableStart: new Date('2026-03-01'),
    shifts: [Shift.MORNING, Shift.AFTERNOON],
    hoursPerWeek: 40,
    resumeUrl: 'https://example.com/resumes/maria-santos.pdf',
    additionalInfo: 'I have 5 years of experience caring for elderly clients with dementia. I am fluent in Portuguese and Spanish.',
    references: JSON.stringify([
      { name: 'Dr. Sarah Johnson', relationship: 'Former Supervisor', phone: '(978) 555-0100' },
      { name: 'Lisa Chen', relationship: 'Colleague', phone: '(978) 555-0101' },
    ]),
    status: ApplicationStatus.PENDING,
    submittedAt: new Date('2026-02-14'),
    jobSlug: 'certified-nursing-assistant-lowell',
  },
  {
    // Application 2 - Under review
    firstName: 'James',
    lastName: 'Williams',
    email: 'jwilliams@email.com',
    phone: '(978) 555-0234',
    street: '123 Main Street',
    city: 'Dracut',
    state: 'MA',
    zip: '01826',
    yearsExperience: 2,
    certifications: ['HHA', 'CPR'],
    availableStart: new Date('2026-02-20'),
    shifts: [Shift.AFTERNOON, Shift.EVENING],
    hoursPerWeek: 25,
    resumeUrl: 'https://example.com/resumes/james-williams.pdf',
    coverLetterUrl: 'https://example.com/covers/james-williams.pdf',
    additionalInfo: 'Looking for part-time work to supplement my studies. Very patient and caring.',
    status: ApplicationStatus.REVIEWING,
    submittedAt: new Date('2026-02-10'),
    reviewedBy: 'admin-user-1',
    reviewedAt: new Date('2026-02-12'),
    internalNotes: 'Strong candidate. Schedule phone screen for next week.',
    jobSlug: 'home-health-aide-dracut',
  },
  {
    // Application 3 - Interview scheduled
    firstName: 'Anna',
    lastName: 'Petrova',
    email: 'anna.p@email.com',
    phone: '(978) 555-0345',
    street: '78 Oak Avenue',
    city: 'Chelmsford',
    state: 'MA',
    zip: '01824',
    yearsExperience: 8,
    certifications: ['CNA', 'HHA', 'CPR/First Aid', 'Hoyer Lift Certified', 'Dementia Care'],
    availableStart: new Date('2026-03-15'),
    shifts: [Shift.MORNING, Shift.AFTERNOON, Shift.EVENING, Shift.OVERNIGHT],
    hoursPerWeek: 40,
    resumeUrl: 'https://example.com/resumes/anna-petrova.pdf',
    additionalInfo: 'Experienced live-in caregiver with excellent references. Previously worked with hospice patients. Comfortable with pets.',
    references: JSON.stringify([
      { name: 'Margaret Thompson', relationship: 'Client Family', phone: '(978) 555-0200' },
      { name: 'Dr. Robert Kim', relationship: 'Physician', phone: '(978) 555-0201' },
    ]),
    status: ApplicationStatus.INTERVIEW,
    submittedAt: new Date('2026-02-05'),
    reviewedBy: 'admin-user-1',
    reviewedAt: new Date('2026-02-07'),
    internalNotes: 'Excellent candidate. Interview scheduled for Feb 18 at 2pm. Very experienced with live-in care.',
    jobSlug: 'live-in-caregiver-chelmsford',
  },
  {
    // Application 4 - Offered
    firstName: 'Michael',
    lastName: 'Thompson',
    email: 'mthompson@email.com',
    phone: '(978) 555-0456',
    city: 'Lowell',
    state: 'MA',
    zip: '01854',
    yearsExperience: 4,
    certifications: ['Bachelor in Healthcare Administration', 'CPR'],
    availableStart: new Date('2026-03-01'),
    shifts: [Shift.MORNING, Shift.AFTERNOON],
    hoursPerWeek: 40,
    resumeUrl: 'https://example.com/resumes/michael-thompson.pdf',
    coverLetterUrl: 'https://example.com/covers/michael-thompson.pdf',
    additionalInfo: 'Currently working as a care coordinator at a competitor. Looking for growth opportunities with a more compassionate organization.',
    status: ApplicationStatus.OFFERED,
    submittedAt: new Date('2026-01-28'),
    reviewedBy: 'admin-user-1',
    reviewedAt: new Date('2026-01-30'),
    internalNotes: 'Great interview. Offer extended $50,000. Waiting for response.',
    jobSlug: 'care-coordinator',
  },
  {
    // Application 5 - Hired
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@email.com',
    phone: '(978) 555-0567',
    street: '234 Elm Street',
    city: 'Tewksbury',
    state: 'MA',
    zip: '01876',
    yearsExperience: 1,
    certifications: ['CPR/First Aid'],
    availableStart: new Date('2026-02-01'),
    shifts: [Shift.MORNING, Shift.AFTERNOON],
    hoursPerWeek: 16,
    additionalInfo: 'Recent college graduate passionate about eldercare. Available Saturdays and Sundays.',
    status: ApplicationStatus.HIRED,
    submittedAt: new Date('2026-01-15'),
    reviewedBy: 'admin-user-1',
    reviewedAt: new Date('2026-01-17'),
    internalNotes: 'Hired on 1/25. Completed orientation 2/1. Assigned to Client #45.',
    jobSlug: 'weekend-caregiver-tewksbury',
  },
  {
    // Application 6 - Rejected
    firstName: 'David',
    lastName: 'Miller',
    email: 'dmiller@email.com',
    phone: '(978) 555-0678',
    city: 'Billerica',
    state: 'MA',
    zip: '01821',
    yearsExperience: 0,
    certifications: [],
    availableStart: new Date('2026-02-15'),
    shifts: [Shift.EVENING],
    hoursPerWeek: 10,
    additionalInfo: 'Looking for evening work only.',
    status: ApplicationStatus.REJECTED,
    submittedAt: new Date('2026-02-01'),
    reviewedBy: 'admin-user-1',
    reviewedAt: new Date('2026-02-03'),
    internalNotes: 'Does not meet minimum requirements. No certifications, limited availability, no experience.',
    jobSlug: 'certified-nursing-assistant-lowell',
  },
  {
    // Application 7 - Pending (recent)
    firstName: 'Emily',
    lastName: 'Garcia',
    email: 'emily.garcia@email.com',
    phone: '(978) 555-0789',
    street: '567 Maple Drive',
    city: 'Lowell',
    state: 'MA',
    zip: '01851',
    yearsExperience: 3,
    certifications: ['CNA', 'CPR/First Aid'],
    availableStart: new Date('2026-03-10'),
    shifts: [Shift.MORNING, Shift.AFTERNOON],
    hoursPerWeek: 35,
    resumeUrl: 'https://example.com/resumes/emily-garcia.pdf',
    additionalInfo: 'Bilingual English/Spanish. Experience with Alzheimer\'s patients.',
    status: ApplicationStatus.PENDING,
    submittedAt: new Date('2026-02-15'),
    jobSlug: 'certified-nursing-assistant-lowell',
  },
];

const contacts = [
  {
    name: 'Robert Anderson',
    email: 'randerson@email.com',
    phone: '(978) 555-1001',
    service: 'Personal Care',
    urgency: 'Urgent',
    preferredContact: 'phone',
    message: 'My mother was just discharged from the hospital and needs help at home immediately. She had hip replacement surgery and cannot manage daily activities on her own. Please call me as soon as possible.',
    source: 'services-page',
    submittedAt: new Date('2026-02-15T09:30:00'),
    isRead: false,
  },
  {
    name: 'Jennifer Walsh',
    email: 'jwalsh@email.com',
    phone: '(978) 555-1002',
    service: 'Companionship',
    urgency: 'Within a month',
    preferredContact: 'email',
    message: 'I\'m looking for companionship services for my elderly father. He lives alone and has become increasingly isolated since my mother passed. Would like someone to visit 2-3 times per week.',
    source: 'homepage',
    submittedAt: new Date('2026-02-14T14:45:00'),
    isRead: false,
  },
  {
    name: 'Patricia Chen',
    email: 'pchen@email.com',
    service: 'Live-In Care',
    urgency: 'Exploring options',
    preferredContact: 'email',
    message: 'We are starting to look into live-in care options for my grandmother who has early-stage dementia. Could you send me information about your services and pricing?',
    source: 'about-page',
    submittedAt: new Date('2026-02-13T11:20:00'),
    isRead: true,
  },
  {
    name: 'Mark Sullivan',
    email: 'msullivan@email.com',
    phone: '(978) 555-1004',
    service: 'Transportation',
    urgency: 'Within a week',
    preferredContact: 'phone',
    message: 'My father needs help getting to dialysis appointments 3x per week. He uses a wheelchair. Do you provide transportation assistance? What would the cost be?',
    source: 'services-page',
    submittedAt: new Date('2026-02-12T16:00:00'),
    isRead: true,
  },
  {
    name: 'Linda Morrison',
    email: 'lmorrison@email.com',
    phone: '(978) 555-1005',
    message: 'I\'d like to learn more about working at Angel Touch. I have 10 years of caregiving experience and am looking for a new opportunity. Is there someone I can speak with about job openings?',
    source: 'contact-page',
    submittedAt: new Date('2026-02-11T10:15:00'),
    isRead: true,
  },
];

const testimonials = [
  {
    name: 'Margaret Thompson',
    role: 'Family Member',
    content: 'Angel Touch Homecare has been a blessing for our family. After my mother\'s stroke, we didn\'t know how we would manage her care. The caregivers from Angel Touch are compassionate, professional, and have become like extended family. Mom actually looks forward to their visits now!',
    rating: 5,
    isPublished: true,
    createdAt: new Date('2026-01-15'),
  },
  {
    name: 'Robert Chen',
    role: 'Family Member',
    content: 'The care coordinators at Angel Touch went above and beyond to match my father with the perfect caregiver. They took the time to understand his needs, his personality, and his preferences. The attention to detail and genuine care they show is remarkable.',
    rating: 5,
    isPublished: true,
    createdAt: new Date('2026-01-20'),
  },
  {
    name: 'Elizabeth Warren',
    role: 'Client',
    content: 'At 85, I was stubborn about accepting help at home. But my caregiver from Angel Touch, Maria, has changed my perspective completely. She respects my independence while helping where I need it. I couldn\'t imagine my days without her now.',
    rating: 5,
    isPublished: true,
    createdAt: new Date('2026-01-25'),
  },
  {
    name: 'James Patterson',
    role: 'Family Member',
    content: 'Finding reliable care for someone with dementia is challenging. Angel Touch provided caregivers specially trained in memory care. They are patient, kind, and know how to redirect my wife when she becomes confused. Their support has allowed me to continue working while knowing she is safe.',
    rating: 5,
    isPublished: true,
    createdAt: new Date('2026-02-01'),
  },
  {
    name: 'Susan Martinez',
    role: 'Healthcare Partner',
    content: 'As a hospital discharge planner, I regularly refer patients to home care agencies. Angel Touch consistently exceeds expectations. They respond quickly, communicate clearly, and most importantly, provide excellent care. They are my first recommendation.',
    rating: 5,
    isPublished: true,
    createdAt: new Date('2026-02-05'),
  },
  {
    name: 'David O\'Brien',
    role: 'Family Member',
    content: 'We tried another agency before Angel Touch and the difference is night and day. The reliability, communication, and quality of caregivers is so much better. Highly recommend them to anyone looking for home care services.',
    rating: 4,
    isPublished: true,
    createdAt: new Date('2026-02-08'),
  },
  {
    name: 'Nancy Williams',
    role: 'Client',
    content: 'The companionship care I receive has transformed my life. Living alone was getting lonely and I was becoming depressed. Now I have someone to talk to, go for walks with, and help with errands. Thank you, Angel Touch!',
    rating: 5,
    isPublished: true,
    createdAt: new Date('2026-02-10'),
  },
  {
    // Unpublished testimonial - pending review
    name: 'Thomas Brown',
    role: 'Family Member',
    content: 'Good service overall. The caregiver is nice but sometimes arrives a few minutes late. Communication with the office could be better.',
    rating: 3,
    isPublished: false,
    createdAt: new Date('2026-02-12'),
  },
];

const serviceInquiries = [
  {
    name: 'Karen Mitchell',
    email: 'kmitchell@email.com',
    phone: '(978) 555-2001',
    serviceType: 'Personal Care',
    careRecipient: 'My mother',
    startDate: new Date('2026-03-01'),
    hoursNeeded: 20,
    message: 'My mother needs help with bathing and dressing in the mornings. She is 82 and has arthritis that limits her mobility. Looking for someone Monday through Friday, 8am-12pm.',
    status: InquiryStatus.NEW,
    submittedAt: new Date('2026-02-15T08:00:00'),
  },
  {
    name: 'Brian Kelly',
    email: 'bkelly@email.com',
    phone: '(978) 555-2002',
    serviceType: 'Live-In Care',
    careRecipient: 'My father',
    startDate: new Date('2026-04-01'),
    hoursNeeded: 168,
    message: 'Looking for 24/7 live-in care for my father who has Parkinson\'s disease. He needs assistance with all daily activities and occasional medical appointments. We have a spare bedroom for the caregiver.',
    status: InquiryStatus.CONTACTED,
    submittedAt: new Date('2026-02-13T15:30:00'),
  },
  {
    name: 'Amanda Foster',
    email: 'afoster@email.com',
    phone: '(978) 555-2003',
    serviceType: 'Respite Care',
    careRecipient: 'My husband',
    startDate: new Date('2026-03-15'),
    hoursNeeded: 40,
    message: 'I am the primary caregiver for my husband who has ALS. I need respite care for one week in March while I visit family out of state. He requires assistance with transfers and feeding.',
    status: InquiryStatus.CONSULTATION_SCHEDULED,
    submittedAt: new Date('2026-02-10T11:00:00'),
  },
  {
    name: 'Christopher Lee',
    email: 'clee@email.com',
    phone: '(978) 555-2004',
    serviceType: 'Companionship',
    careRecipient: 'Self',
    startDate: new Date('2026-02-20'),
    hoursNeeded: 15,
    message: 'I am a 78-year-old retired professor looking for companionship. I enjoy chess, reading, and discussing current events. Would like someone to visit a few times per week.',
    status: InquiryStatus.CONVERTED,
    submittedAt: new Date('2026-02-01T09:45:00'),
  },
  {
    name: 'Michelle Davis',
    email: 'mdavis@email.com',
    phone: '(978) 555-2005',
    serviceType: 'Post-Surgery Care',
    careRecipient: 'Myself',
    startDate: new Date('2026-03-20'),
    hoursNeeded: 30,
    message: 'I will be having knee replacement surgery on March 15th. I live alone and will need help for about 2 weeks after I come home from the hospital. Mainly help with meals and light housekeeping.',
    status: InquiryStatus.NEW,
    submittedAt: new Date('2026-02-14T14:20:00'),
  },
  {
    name: 'Edward Wilson',
    email: 'ewilson@email.com',
    phone: '(978) 555-2006',
    serviceType: 'Meal Preparation',
    careRecipient: 'My parents',
    hoursNeeded: 10,
    message: 'My elderly parents are having trouble preparing meals. They are both in their 80s. Looking for someone to come in and prepare meals a few times per week. They have dietary restrictions (low sodium, diabetic friendly).',
    status: InquiryStatus.CLOSED,
    submittedAt: new Date('2026-01-25T10:00:00'),
  },
];

// =============================================================================
// PORTAL DEMO DATA (Workers, Clients, Shifts)
// =============================================================================

const portalWorkers = [
  {
    clerkId: 'demo_worker_1',
    email: 'maria.santos@angeltouch.demo',
    phone: '(978) 555-3001',
    firstName: 'Maria',
    lastName: 'Santos',
    role: UserRole.CAREGIVER,
    status: UserStatus.ACTIVE,
    worker: {
      employeeId: 'EMP-10001',
      hireDate: new Date('2024-06-15'),
      payRate: 24.00,
      payType: PayType.HOURLY,
      skills: ['Personal Care', 'Dementia Care', 'Medication Reminders', 'Meal Prep'],
      languages: ['English', 'Portuguese', 'Spanish'],
      complianceStatus: ComplianceStatus.COMPLIANT,
      city: 'Lowell',
      state: 'MA',
      zip: '01852',
    },
  },
  {
    clerkId: 'demo_worker_2',
    email: 'james.wilson@angeltouch.demo',
    phone: '(978) 555-3002',
    firstName: 'James',
    lastName: 'Wilson',
    role: UserRole.CAREGIVER,
    status: UserStatus.ACTIVE,
    worker: {
      employeeId: 'EMP-10002',
      hireDate: new Date('2025-01-10'),
      payRate: 22.00,
      payType: PayType.HOURLY,
      skills: ['Personal Care', 'Companionship', 'Transportation'],
      languages: ['English'],
      complianceStatus: ComplianceStatus.COMPLIANT,
      city: 'Dracut',
      state: 'MA',
      zip: '01826',
    },
  },
  {
    clerkId: 'demo_worker_3',
    email: 'anna.petrova@angeltouch.demo',
    phone: '(978) 555-3003',
    firstName: 'Anna',
    lastName: 'Petrova',
    role: UserRole.CAREGIVER,
    status: UserStatus.ACTIVE,
    worker: {
      employeeId: 'EMP-10003',
      hireDate: new Date('2023-09-01'),
      payRate: 26.00,
      payType: PayType.HOURLY,
      skills: ['Personal Care', 'Dementia Care', 'Hoyer Lift', 'Live-In Care', 'Hospice'],
      languages: ['English', 'Russian'],
      complianceStatus: ComplianceStatus.COMPLIANT,
      city: 'Chelmsford',
      state: 'MA',
      zip: '01824',
    },
  },
  {
    clerkId: 'demo_worker_4',
    email: 'sarah.johnson@angeltouch.demo',
    phone: '(978) 555-3004',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: UserRole.CAREGIVER,
    status: UserStatus.ACTIVE,
    worker: {
      employeeId: 'EMP-10004',
      hireDate: new Date('2026-02-01'),
      payRate: 20.00,
      payType: PayType.HOURLY,
      skills: ['Companionship', 'Meal Prep', 'Light Housekeeping'],
      languages: ['English'],
      complianceStatus: ComplianceStatus.COMPLIANT,
      city: 'Tewksbury',
      state: 'MA',
      zip: '01876',
    },
  },
  {
    clerkId: 'demo_worker_5',
    email: 'carlos.rodriguez@angeltouch.demo',
    phone: '(978) 555-3005',
    firstName: 'Carlos',
    lastName: 'Rodriguez',
    role: UserRole.CAREGIVER,
    status: UserStatus.PENDING,
    worker: {
      payRate: 22.00,
      payType: PayType.HOURLY,
      skills: ['Personal Care', 'Transportation'],
      languages: ['English', 'Spanish'],
      complianceStatus: ComplianceStatus.INCOMPLETE,
      city: 'Lowell',
      state: 'MA',
      zip: '01851',
    },
  },
  {
    clerkId: 'demo_worker_6',
    email: 'emily.chen@angeltouch.demo',
    phone: '(978) 555-3006',
    firstName: 'Emily',
    lastName: 'Chen',
    role: UserRole.CAREGIVER,
    status: UserStatus.PENDING,
    worker: {
      payRate: 23.00,
      payType: PayType.HOURLY,
      skills: ['Personal Care', 'Dementia Care', 'Medication Reminders'],
      languages: ['English', 'Mandarin'],
      complianceStatus: ComplianceStatus.PENDING,
      city: 'Billerica',
      state: 'MA',
      zip: '01821',
    },
  },
];

// Compliance Documents demo data - indexed by worker position
const complianceDocsData: Array<{
  workerIndex: number;
  docs: Array<{
    type: DocType;
    name: string;
    fileName: string;
    issuedDate: Date;
    expiresAt?: Date;
    status: DocStatus;
  }>;
}> = [
  // Maria Santos (index 0) - COMPLIANT - all docs approved
  {
    workerIndex: 0,
    docs: [
      {
        type: DocType.DRIVERS_LICENSE,
        name: 'Massachusetts Driver\'s License',
        fileName: 'maria_santos_drivers_license.pdf',
        issuedDate: new Date('2024-01-15'),
        expiresAt: new Date('2029-01-15'),
        status: DocStatus.APPROVED,
      },
      {
        type: DocType.CPR_CERTIFICATION,
        name: 'CPR/First Aid Certification',
        fileName: 'maria_santos_cpr_cert.pdf',
        issuedDate: new Date('2025-06-01'),
        expiresAt: new Date('2027-06-01'),
        status: DocStatus.APPROVED,
      },
      {
        type: DocType.HHA_CERTIFICATION,
        name: 'Home Health Aide Certification',
        fileName: 'maria_santos_hha_cert.pdf',
        issuedDate: new Date('2023-09-15'),
        expiresAt: new Date('2028-09-15'),
        status: DocStatus.APPROVED,
      },
      {
        type: DocType.BACKGROUND_CHECK,
        name: 'CORI Background Check',
        fileName: 'maria_santos_cori.pdf',
        issuedDate: new Date('2024-06-01'),
        expiresAt: new Date('2025-06-01'),
        status: DocStatus.APPROVED,
      },
      {
        type: DocType.TB_TEST,
        name: 'TB Test Results',
        fileName: 'maria_santos_tb_test.pdf',
        issuedDate: new Date('2025-01-10'),
        expiresAt: new Date('2026-01-10'),
        status: DocStatus.APPROVED,
      },
      {
        type: DocType.PHYSICAL_EXAM,
        name: 'Annual Physical Exam',
        fileName: 'maria_santos_physical.pdf',
        issuedDate: new Date('2025-02-01'),
        expiresAt: new Date('2026-02-01'),
        status: DocStatus.APPROVED,
      },
    ],
  },
  // James Wilson (index 1) - COMPLIANT - all docs approved
  {
    workerIndex: 1,
    docs: [
      {
        type: DocType.DRIVERS_LICENSE,
        name: 'Massachusetts Driver\'s License',
        fileName: 'james_wilson_drivers_license.pdf',
        issuedDate: new Date('2022-08-20'),
        expiresAt: new Date('2027-08-20'),
        status: DocStatus.APPROVED,
      },
      {
        type: DocType.CPR_CERTIFICATION,
        name: 'CPR/First Aid Certification',
        fileName: 'james_wilson_cpr_cert.pdf',
        issuedDate: new Date('2025-01-15'),
        expiresAt: new Date('2027-01-15'),
        status: DocStatus.APPROVED,
      },
      {
        type: DocType.HHA_CERTIFICATION,
        name: 'Home Health Aide Certification',
        fileName: 'james_wilson_hha_cert.pdf',
        issuedDate: new Date('2024-12-01'),
        expiresAt: new Date('2029-12-01'),
        status: DocStatus.APPROVED,
      },
      {
        type: DocType.BACKGROUND_CHECK,
        name: 'CORI Background Check',
        fileName: 'james_wilson_cori.pdf',
        issuedDate: new Date('2025-01-05'),
        expiresAt: new Date('2026-01-05'),
        status: DocStatus.APPROVED,
      },
      {
        type: DocType.TB_TEST,
        name: 'TB Test Results',
        fileName: 'james_wilson_tb_test.pdf',
        issuedDate: new Date('2025-01-20'),
        expiresAt: new Date('2026-01-20'),
        status: DocStatus.APPROVED,
      },
    ],
  },
  // Anna Petrova (index 2) - COMPLIANT with some expiring soon
  {
    workerIndex: 2,
    docs: [
      {
        type: DocType.DRIVERS_LICENSE,
        name: 'Massachusetts Driver\'s License',
        fileName: 'anna_petrova_drivers_license.pdf',
        issuedDate: new Date('2021-03-10'),
        expiresAt: new Date('2026-03-10'),
        status: DocStatus.APPROVED,
      },
      {
        type: DocType.CPR_CERTIFICATION,
        name: 'CPR/First Aid Certification',
        fileName: 'anna_petrova_cpr_cert.pdf',
        issuedDate: new Date('2024-02-28'),
        // Expiring within 30 days!
        expiresAt: new Date('2026-03-01'),
        status: DocStatus.APPROVED,
      },
      {
        type: DocType.CNA_LICENSE,
        name: 'CNA License',
        fileName: 'anna_petrova_cna_license.pdf',
        issuedDate: new Date('2023-09-01'),
        expiresAt: new Date('2027-09-01'),
        status: DocStatus.APPROVED,
      },
      {
        type: DocType.BACKGROUND_CHECK,
        name: 'CORI Background Check',
        fileName: 'anna_petrova_cori.pdf',
        issuedDate: new Date('2023-09-01'),
        expiresAt: new Date('2024-09-01'),
        status: DocStatus.EXPIRED, // Expired!
      },
      {
        type: DocType.TB_TEST,
        name: 'TB Test Results',
        fileName: 'anna_petrova_tb_test.pdf',
        issuedDate: new Date('2025-02-01'),
        expiresAt: new Date('2026-02-01'),
        status: DocStatus.APPROVED,
      },
      {
        type: DocType.PHYSICAL_EXAM,
        name: 'Annual Physical Exam',
        fileName: 'anna_petrova_physical.pdf',
        issuedDate: new Date('2024-11-15'),
        expiresAt: new Date('2025-11-15'),
        status: DocStatus.APPROVED,
      },
    ],
  },
  // Sarah Johnson (index 3) - COMPLIANT, new hire
  {
    workerIndex: 3,
    docs: [
      {
        type: DocType.DRIVERS_LICENSE,
        name: 'Massachusetts Driver\'s License',
        fileName: 'sarah_johnson_drivers_license.pdf',
        issuedDate: new Date('2023-05-01'),
        expiresAt: new Date('2028-05-01'),
        status: DocStatus.APPROVED,
      },
      {
        type: DocType.CPR_CERTIFICATION,
        name: 'CPR/First Aid Certification',
        fileName: 'sarah_johnson_cpr_cert.pdf',
        issuedDate: new Date('2026-01-20'),
        expiresAt: new Date('2028-01-20'),
        status: DocStatus.APPROVED,
      },
      {
        type: DocType.BACKGROUND_CHECK,
        name: 'CORI Background Check',
        fileName: 'sarah_johnson_cori.pdf',
        issuedDate: new Date('2026-01-25'),
        expiresAt: new Date('2027-01-25'),
        status: DocStatus.APPROVED,
      },
      {
        type: DocType.TB_TEST,
        name: 'TB Test Results',
        fileName: 'sarah_johnson_tb_test.pdf',
        issuedDate: new Date('2026-01-28'),
        expiresAt: new Date('2027-01-28'),
        status: DocStatus.APPROVED,
      },
    ],
  },
  // Carlos Rodriguez (index 4) - INCOMPLETE (pending worker)
  {
    workerIndex: 4,
    docs: [
      {
        type: DocType.DRIVERS_LICENSE,
        name: 'Massachusetts Driver\'s License',
        fileName: 'carlos_rodriguez_drivers_license.pdf',
        issuedDate: new Date('2024-07-15'),
        expiresAt: new Date('2029-07-15'),
        status: DocStatus.PENDING_REVIEW,
      },
      {
        type: DocType.CPR_CERTIFICATION,
        name: 'CPR/First Aid Certification',
        fileName: 'carlos_rodriguez_cpr_cert.pdf',
        issuedDate: new Date('2026-02-10'),
        expiresAt: new Date('2028-02-10'),
        status: DocStatus.PENDING_REVIEW,
      },
    ],
  },
  // Emily Chen (index 5) - PENDING (some docs pending review)
  {
    workerIndex: 5,
    docs: [
      {
        type: DocType.DRIVERS_LICENSE,
        name: 'Massachusetts Driver\'s License',
        fileName: 'emily_chen_drivers_license.pdf',
        issuedDate: new Date('2023-11-20'),
        expiresAt: new Date('2028-11-20'),
        status: DocStatus.APPROVED,
      },
      {
        type: DocType.CPR_CERTIFICATION,
        name: 'CPR/First Aid Certification',
        fileName: 'emily_chen_cpr_cert.pdf',
        issuedDate: new Date('2026-02-01'),
        expiresAt: new Date('2028-02-01'),
        status: DocStatus.PENDING_REVIEW,
      },
      {
        type: DocType.HHA_CERTIFICATION,
        name: 'Home Health Aide Certification',
        fileName: 'emily_chen_hha_cert.pdf',
        issuedDate: new Date('2024-06-15'),
        expiresAt: new Date('2029-06-15'),
        status: DocStatus.APPROVED,
      },
      {
        type: DocType.BACKGROUND_CHECK,
        name: 'CORI Background Check',
        fileName: 'emily_chen_cori.pdf',
        issuedDate: new Date('2026-02-12'),
        expiresAt: new Date('2027-02-12'),
        status: DocStatus.PENDING_REVIEW,
      },
      {
        type: DocType.TB_TEST,
        name: 'TB Test Results',
        fileName: 'emily_chen_tb_test.pdf',
        issuedDate: new Date('2026-02-14'),
        expiresAt: new Date('2027-02-14'),
        status: DocStatus.REJECTED,
      },
    ],
  },
];

const portalClients = [
  {
    clerkId: 'demo_client_1',
    email: 'robert.anderson@email.demo',
    phone: '(978) 555-4001',
    firstName: 'Robert',
    lastName: 'Anderson',
    role: UserRole.CLIENT,
    status: UserStatus.ACTIVE,
    client: {
      type: ClientType.FAMILY,
      careRecipientName: 'Eleanor Anderson',
      careRecipientDOB: new Date('1938-05-15'),
      relationship: 'Mother',
      serviceLevel: ServiceLevel.PERSONAL,
      preferredTimes: ['MORNING', 'AFTERNOON'],
      specialNeeds: ['Hip Replacement Recovery', 'Mobility Assistance'],
      street: '45 Maple Street',
      city: 'Lowell',
      state: 'MA',
      zip: '01852',
      emergencyName: 'Robert Anderson',
      emergencyPhone: '(978) 555-4001',
      emergencyRelation: 'Son',
      billingRate: 32.00,
      billingEmail: 'robert.anderson@email.demo',
      careNotes: 'Mrs. Anderson had hip replacement surgery on Feb 10. Needs assistance with bathing, dressing, and mobility. Uses a walker.',
      accessNotes: 'Key under the mat. Ring doorbell twice.',
    },
  },
  {
    clerkId: 'demo_client_2',
    email: 'jennifer.walsh@email.demo',
    phone: '(978) 555-4002',
    firstName: 'Jennifer',
    lastName: 'Walsh',
    role: UserRole.CLIENT,
    status: UserStatus.ACTIVE,
    client: {
      type: ClientType.FAMILY,
      careRecipientName: 'Thomas Walsh Sr.',
      careRecipientDOB: new Date('1942-11-22'),
      relationship: 'Father',
      serviceLevel: ServiceLevel.COMPANION,
      preferredTimes: ['AFTERNOON'],
      specialNeeds: ['Loneliness', 'Mild Depression'],
      street: '123 Oak Avenue',
      city: 'Dracut',
      state: 'MA',
      zip: '01826',
      emergencyName: 'Jennifer Walsh',
      emergencyPhone: '(978) 555-4002',
      emergencyRelation: 'Daughter',
      billingRate: 28.00,
      billingEmail: 'jennifer.walsh@email.demo',
      careNotes: 'Mr. Walsh lost his wife 6 months ago and has become isolated. Enjoys talking about history and watching old movies. Has a small dog named Max.',
      accessNotes: 'Garage code: 1234',
    },
  },
  {
    clerkId: 'demo_client_3',
    email: 'margaret.thompson@email.demo',
    phone: '(978) 555-4003',
    firstName: 'Margaret',
    lastName: 'Thompson',
    role: UserRole.CLIENT,
    status: UserStatus.ACTIVE,
    client: {
      type: ClientType.FAMILY,
      careRecipientName: 'George Thompson',
      careRecipientDOB: new Date('1935-03-08'),
      relationship: 'Husband',
      serviceLevel: ServiceLevel.SKILLED,
      preferredTimes: ['MORNING', 'AFTERNOON', 'EVENING'],
      specialNeeds: ['Dementia', 'Wandering Risk', 'Diabetes'],
      street: '789 Elm Street',
      city: 'Chelmsford',
      state: 'MA',
      zip: '01824',
      emergencyName: 'Margaret Thompson',
      emergencyPhone: '(978) 555-4003',
      emergencyRelation: 'Wife',
      billingRate: 38.00,
      billingEmail: 'margaret.thompson@email.demo',
      careNotes: 'Mr. Thompson has moderate dementia. Requires supervision at all times. Insulin injection twice daily. Wanders if front door is unlocked.',
      accessNotes: 'Door code: 5678. Alarm code: 9999. Always lock front door.',
    },
  },
  {
    clerkId: 'demo_client_4',
    email: 'elizabeth.warren@email.demo',
    phone: '(978) 555-4004',
    firstName: 'Elizabeth',
    lastName: 'Warren',
    role: UserRole.CLIENT,
    status: UserStatus.ACTIVE,
    client: {
      type: ClientType.SELF,
      serviceLevel: ServiceLevel.COMPANION,
      preferredTimes: ['MORNING'],
      specialNeeds: ['Arthritis', 'Limited Mobility'],
      street: '456 Pine Road',
      city: 'Tewksbury',
      state: 'MA',
      zip: '01876',
      emergencyName: 'David Warren',
      emergencyPhone: '(978) 555-4044',
      emergencyRelation: 'Son',
      billingRate: 28.00,
      billingEmail: 'elizabeth.warren@email.demo',
      careNotes: 'Mrs. Warren is independent but appreciates company and help with light housekeeping. Very organized and particular about routines.',
    },
  },
];

// Generate shifts for the next 14 days
function generateDemoShifts() {
  const shifts: Array<{
    clientIndex: number;
    date: Date;
    startTime: string;
    endTime: string;
    duration: number;
    serviceType: ServiceLevel;
    skillsRequired: string[];
    status: ShiftStatus;
    clientRate: number;
    workerRate: number;
    notes?: string;
    workerIndex?: number; // For booked shifts
  }> = [];

  const today = new Date();
  
  // Eleanor Anderson - Personal Care, Mon-Fri mornings
  for (let i = 0; i < 14; i++) {
    const shiftDate = new Date(today);
    shiftDate.setDate(today.getDate() + i);
    const dayOfWeek = shiftDate.getDay();
    
    // Skip weekends for some clients
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    shifts.push({
      clientIndex: 0, // Eleanor Anderson
      date: shiftDate,
      startTime: '08:00',
      endTime: '12:00',
      duration: 4,
      serviceType: ServiceLevel.PERSONAL,
      skillsRequired: ['Personal Care', 'Mobility Assistance'],
      status: i < 3 ? ShiftStatus.COMPLETED : (i < 7 ? ShiftStatus.BOOKED : ShiftStatus.OPEN),
      clientRate: 32.00,
      workerRate: 24.00,
      notes: 'Help with morning routine - bathing, dressing, breakfast',
      workerIndex: i < 7 ? 0 : undefined, // Maria Santos
    });
  }

  // Thomas Walsh Sr. - Companionship, 3x per week afternoons
  for (let i = 0; i < 14; i++) {
    const shiftDate = new Date(today);
    shiftDate.setDate(today.getDate() + i);
    const dayOfWeek = shiftDate.getDay();
    
    // Mon, Wed, Fri only
    if (dayOfWeek !== 1 && dayOfWeek !== 3 && dayOfWeek !== 5) continue;
    
    shifts.push({
      clientIndex: 1, // Thomas Walsh
      date: shiftDate,
      startTime: '13:00',
      endTime: '17:00',
      duration: 4,
      serviceType: ServiceLevel.COMPANION,
      skillsRequired: ['Companionship'],
      status: i < 5 ? ShiftStatus.BOOKED : ShiftStatus.OPEN,
      clientRate: 28.00,
      workerRate: 22.00,
      notes: 'Companionship visit. Walks the dog, plays chess, watches movies.',
      workerIndex: i < 5 ? 1 : undefined, // James Wilson
    });
  }

  // George Thompson - 12-hour shifts, daily
  for (let i = 0; i < 14; i++) {
    const shiftDate = new Date(today);
    shiftDate.setDate(today.getDate() + i);
    
    shifts.push({
      clientIndex: 2, // George Thompson
      date: shiftDate,
      startTime: '07:00',
      endTime: '19:00',
      duration: 12,
      serviceType: ServiceLevel.SKILLED,
      skillsRequired: ['Dementia Care', 'Medication Reminders'],
      status: i < 2 ? ShiftStatus.COMPLETED : (i < 10 ? ShiftStatus.BOOKED : ShiftStatus.OPEN),
      clientRate: 38.00,
      workerRate: 26.00,
      notes: 'Full day care. Insulin at 8am and 6pm. Do not leave unattended.',
      workerIndex: i < 10 ? 2 : undefined, // Anna Petrova
    });
  }

  // Elizabeth Warren - Companionship, 2x per week mornings
  for (let i = 0; i < 14; i++) {
    const shiftDate = new Date(today);
    shiftDate.setDate(today.getDate() + i);
    const dayOfWeek = shiftDate.getDay();
    
    // Tue, Thu only
    if (dayOfWeek !== 2 && dayOfWeek !== 4) continue;
    
    shifts.push({
      clientIndex: 3, // Elizabeth Warren
      date: shiftDate,
      startTime: '09:00',
      endTime: '12:00',
      duration: 3,
      serviceType: ServiceLevel.COMPANION,
      skillsRequired: ['Companionship', 'Light Housekeeping'],
      status: i < 4 ? ShiftStatus.BOOKED : ShiftStatus.OPEN,
      clientRate: 28.00,
      workerRate: 20.00,
      notes: 'Light housekeeping, companionship, help with errands.',
      workerIndex: i < 4 ? 3 : undefined, // Sarah Johnson
    });
  }

  return shifts;
}

const demoShifts = generateDemoShifts();

// =============================================================================
// SEED FUNCTION
// =============================================================================

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data (in reverse order of dependencies)
  console.log('🗑️  Clearing existing data...');
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.contactSubmission.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.serviceInquiry.deleteMany();
  console.log('   ✓ Existing data cleared\n');

  // Seed Jobs
  console.log('📋 Seeding jobs...');
  for (const job of jobs) {
    await prisma.job.create({ data: job });
    console.log(`   ✓ Created job: ${job.title}`);
  }
  console.log(`   Total: ${jobs.length} jobs\n`);

  // Seed Applications
  console.log('📝 Seeding applications...');
  for (const app of applications) {
    const { jobSlug, ...applicationData } = app;
    const job = await prisma.job.findUnique({ where: { slug: jobSlug } });
    if (job) {
      await prisma.application.create({
        data: {
          ...applicationData,
          jobId: job.id,
        },
      });
      console.log(`   ✓ Created application: ${app.firstName} ${app.lastName} (${app.status})`);
    }
  }
  console.log(`   Total: ${applications.length} applications\n`);

  // Seed Contact Submissions
  console.log('💬 Seeding contact submissions...');
  for (const contact of contacts) {
    await prisma.contactSubmission.create({ data: contact });
    console.log(`   ✓ Created contact: ${contact.name}`);
  }
  console.log(`   Total: ${contacts.length} contacts\n`);

  // Seed Testimonials
  console.log('⭐ Seeding testimonials...');
  for (const testimonial of testimonials) {
    await prisma.testimonial.create({ data: testimonial });
    console.log(`   ✓ Created testimonial: ${testimonial.name} (${testimonial.isPublished ? 'published' : 'draft'})`);
  }
  console.log(`   Total: ${testimonials.length} testimonials\n`);

  // Seed Service Inquiries
  console.log('❓ Seeding service inquiries...');
  for (const inquiry of serviceInquiries) {
    await prisma.serviceInquiry.create({ data: inquiry });
    console.log(`   ✓ Created inquiry: ${inquiry.name} - ${inquiry.serviceType} (${inquiry.status})`);
  }
  console.log(`   Total: ${serviceInquiries.length} inquiries\n`);

  // ==========================================================================
  // PORTAL DATA (Demo MVP)
  // ==========================================================================
  
  console.log('👥 Seeding portal workers...');
  // Clear existing portal data
  await prisma.shiftBooking.deleteMany();
  await prisma.careShift.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.complianceDoc.deleteMany();
  await prisma.timesheetEntry.deleteMany();
  await prisma.timesheet.deleteMany();
  await prisma.invoiceLineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.worker.deleteMany();
  await prisma.client.deleteMany();
  await prisma.portalUser.deleteMany();
  console.log('   ✓ Cleared existing portal data');

  const createdWorkers: Array<{ id: string; userId: string }> = [];
  const createdClients: Array<{ id: string; userId: string }> = [];

  // Create workers
  for (const workerData of portalWorkers) {
    const { worker, ...userData } = workerData;
    const user = await prisma.portalUser.create({
      data: {
        ...userData,
        worker: {
          create: worker,
        },
      },
      include: { worker: true },
    });
    createdWorkers.push({ id: user.worker!.id, userId: user.id });
    console.log(`   ✓ Created worker: ${userData.firstName} ${userData.lastName} (${userData.status})`);
  }
  console.log(`   Total: ${portalWorkers.length} workers\n`);

  // Create compliance documents for workers
  console.log('📋 Seeding compliance documents...');
  let totalDocs = 0;
  let pendingDocs = 0;
  let expiringDocs = 0;

  for (const docSet of complianceDocsData) {
    const worker = createdWorkers[docSet.workerIndex];
    if (!worker) continue;

    for (const docData of docSet.docs) {
      await prisma.complianceDoc.create({
        data: {
          workerId: worker.id,
          type: docData.type,
          name: docData.name,
          fileUrl: `https://demo.angeltouchhome.care/docs/${docData.fileName}`,
          fileName: docData.fileName,
          issuedDate: docData.issuedDate,
          expiresAt: docData.expiresAt,
          status: docData.status,
          verifiedBy: docData.status === DocStatus.APPROVED || docData.status === DocStatus.REJECTED ? 'demo_admin' : null,
          verifiedAt: docData.status === DocStatus.APPROVED || docData.status === DocStatus.REJECTED ? new Date() : null,
          rejectionNote: docData.status === DocStatus.REJECTED ? 'Document image is blurry. Please resubmit a clearer copy.' : null,
        },
      });

      totalDocs++;
      if (docData.status === DocStatus.PENDING_REVIEW) pendingDocs++;
      if (
        docData.status === DocStatus.APPROVED &&
        docData.expiresAt &&
        docData.expiresAt <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ) {
        expiringDocs++;
      }
    }
    console.log(`   ✓ Created ${docSet.docs.length} docs for worker ${docSet.workerIndex + 1}`);
  }
  console.log(`   Total: ${totalDocs} compliance docs (${pendingDocs} pending, ${expiringDocs} expiring soon)\n`);

  // Create clients
  console.log('🏠 Seeding portal clients...');
  for (const clientData of portalClients) {
    const { client, ...userData } = clientData;
    const user = await prisma.portalUser.create({
      data: {
        ...userData,
        client: {
          create: client,
        },
      },
      include: { client: true },
    });
    createdClients.push({ id: user.client!.id, userId: user.id });
    console.log(`   ✓ Created client: ${client.careRecipientName || userData.firstName} (${client.serviceLevel})`);
  }
  console.log(`   Total: ${portalClients.length} clients\n`);

  // Create shifts
  console.log('📅 Seeding care shifts...');
  let completedShifts = 0;
  let bookedShifts = 0;
  let openShifts = 0;

  for (const shiftData of demoShifts) {
    const client = createdClients[shiftData.clientIndex];
    const worker = shiftData.workerIndex !== undefined ? createdWorkers[shiftData.workerIndex] : null;
    
    const shift = await prisma.careShift.create({
      data: {
        clientId: client.id,
        date: shiftData.date,
        startTime: shiftData.startTime,
        endTime: shiftData.endTime,
        duration: shiftData.duration,
        serviceType: shiftData.serviceType,
        skillsRequired: shiftData.skillsRequired,
        status: shiftData.status,
        clientRate: shiftData.clientRate,
        workerRate: shiftData.workerRate,
        notes: shiftData.notes,
        createdBy: 'demo_admin',
      },
    });

    // Create booking if shift is booked/completed
    if (worker && (shiftData.status === ShiftStatus.BOOKED || shiftData.status === ShiftStatus.COMPLETED)) {
      await prisma.shiftBooking.create({
        data: {
          shiftId: shift.id,
          workerId: worker.id,
          status: shiftData.status === ShiftStatus.COMPLETED ? 'COMPLETED' : 'CONFIRMED',
          confirmedAt: new Date(),
          checkedInAt: shiftData.status === ShiftStatus.COMPLETED ? shiftData.date : null,
          checkedOutAt: shiftData.status === ShiftStatus.COMPLETED ? shiftData.date : null,
        },
      });
    }

    if (shiftData.status === ShiftStatus.COMPLETED) completedShifts++;
    else if (shiftData.status === ShiftStatus.BOOKED) bookedShifts++;
    else openShifts++;
  }
  console.log(`   ✓ Created ${demoShifts.length} shifts (${completedShifts} completed, ${bookedShifts} booked, ${openShifts} open)\n`);

  // Create sample availability for workers
  console.log('🕐 Seeding worker availability...');
  const availabilityPatterns = [
    // Maria Santos - Mon-Fri mornings
    { workerIndex: 0, days: [1, 2, 3, 4, 5], startTime: '06:00', endTime: '14:00' },
    // James Wilson - Mon-Fri afternoons
    { workerIndex: 1, days: [1, 2, 3, 4, 5], startTime: '12:00', endTime: '20:00' },
    // Anna Petrova - Full availability
    { workerIndex: 2, days: [0, 1, 2, 3, 4, 5, 6], startTime: '06:00', endTime: '22:00' },
    // Sarah Johnson - Weekends + some weekdays
    { workerIndex: 3, days: [0, 2, 4, 6], startTime: '08:00', endTime: '16:00' },
  ];

  for (const pattern of availabilityPatterns) {
    const worker = createdWorkers[pattern.workerIndex];
    for (const day of pattern.days) {
      await prisma.availability.create({
        data: {
          workerId: worker.id,
          dayOfWeek: day,
          startTime: pattern.startTime,
          endTime: pattern.endTime,
          isAvailable: true,
        },
      });
    }
    console.log(`   ✓ Set availability for worker ${pattern.workerIndex + 1}`);
  }
  console.log(`   Total: ${availabilityPatterns.length} availability patterns\n`);

  // Summary
  console.log('═══════════════════════════════════════════');
  console.log('✅ Database seeded successfully!\n');
  console.log('Summary:');
  console.log(`   • ${jobs.length} jobs`);
  console.log(`   • ${applications.length} applications`);
  console.log(`   • ${contacts.length} contact submissions`);
  console.log(`   • ${testimonials.length} testimonials`);
  console.log(`   • ${serviceInquiries.length} service inquiries`);
  console.log(`   • ${portalWorkers.length} portal workers`);
  console.log(`   • ${complianceDocsData.reduce((acc, d) => acc + d.docs.length, 0)} compliance documents`);
  console.log(`   • ${portalClients.length} portal clients`);
  console.log(`   • ${demoShifts.length} care shifts`);
  console.log('═══════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
