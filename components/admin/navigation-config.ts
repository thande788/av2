import type { FeatureKey } from '@/lib/feature-flags';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRightLeft,
  BarChart3,
  Briefcase,
  Calendar,
  CalendarClock,
  CircleHelp,
  ClipboardCheck,
  CreditCard,
  DollarSign,
  FileText,
  Heart,
  HelpCircle,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Settings,
  Shield,
  Star,
  UserCheck,
  UserRoundCheck,
  Users,
} from 'lucide-react';

export type AdminNavSectionId =
  | 'overview'
  | 'care-delivery'
  | 'recruiting'
  | 'communications'
  | 'content'
  | 'system';

export type AdminBadgeKey =
  | 'applicationsPending'
  | 'contactsUnread'
  | 'inquiriesNew'
  | 'swapRequestsPending'
  | 'complianceAttention';

export interface AdminNavSection {
  id: AdminNavSectionId;
  title: string;
  description: string;
  badgeLabel?: string;
}

export interface AdminNavItem {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  section: AdminNavSectionId;
  feature?: FeatureKey;
  badgeKey?: AdminBadgeKey;
  badgeVariant?: 'secondary' | 'destructive' | 'outline';
  shortcut?: string;
  keywords?: string[];
}

export interface AdminQuickAction {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  feature?: FeatureKey;
  keywords?: string[];
}

export type AdminBadgeCounts = Partial<Record<AdminBadgeKey, number>>;

export interface VisibleAdminNavSection extends AdminNavSection {
  items: AdminNavItem[];
}

export const adminNavSections: AdminNavSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    description: 'Daily pulse and starting point for admin work.',
  },
  {
    id: 'care-delivery',
    title: 'Care Delivery',
    description: 'Feature-gated care operations, staffing, and approvals.',
    badgeLabel: 'Feature Preview',
  },
  {
    id: 'recruiting',
    title: 'Recruiting',
    description: 'Hiring pipeline and candidate workflow.',
  },
  {
    id: 'communications',
    title: 'Communications',
    description: 'Incoming outreach and follow-up queues.',
  },
  {
    id: 'content',
    title: 'Content',
    description: 'Public-facing pages and trust signals.',
  },
  {
    id: 'system',
    title: 'System',
    description: 'Reporting, governance, and account management.',
  },
];

export const adminNavItems: AdminNavItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    section: 'overview',
    shortcut: 'G D',
    keywords: ['home', 'overview', 'summary'],
  },
  {
    id: 'workers',
    title: 'Workers',
    href: '/admin/workers',
    icon: Users,
    section: 'care-delivery',
    feature: 'workerManagement',
    keywords: ['caregivers', 'staff', 'employees'],
  },
  {
    id: 'clients',
    title: 'Clients',
    href: '/admin/clients',
    icon: UserCheck,
    section: 'care-delivery',
    feature: 'clientManagement',
    keywords: ['care recipients', 'families'],
  },
  {
    id: 'shifts',
    title: 'Shifts',
    href: '/admin/shifts',
    icon: Calendar,
    section: 'care-delivery',
    feature: 'shiftScheduling',
    keywords: ['schedule', 'calendar'],
  },
  {
    id: 'availability',
    title: 'Availability',
    href: '/admin/workers/availability',
    icon: CalendarClock,
    section: 'care-delivery',
    feature: 'availabilityCalendar',
    keywords: ['worker availability', 'weekly coverage', 'staff schedule'],
  },
  {
    id: 'service-types',
    title: 'Service Types',
    href: '/admin/service-types',
    icon: Layers,
    section: 'care-delivery',
    feature: 'shiftScheduling',
    keywords: ['shift service types', 'care level config', 'default rate %'],
  },
  {
    id: 'timesheets',
    title: 'Timesheets',
    href: '/admin/timesheets',
    icon: ClipboardCheck,
    section: 'care-delivery',
    feature: 'timesheets',
    keywords: ['hours', 'time entries'],
  },
  {
    id: 'payroll',
    title: 'Payroll',
    href: '/admin/payroll',
    icon: DollarSign,
    section: 'care-delivery',
    feature: 'payrollExport',
    keywords: ['payments', 'compensation'],
  },
  {
    id: 'compliance',
    title: 'Compliance',
    href: '/admin/compliance',
    icon: FileText,
    section: 'care-delivery',
    feature: 'complianceDocs',
    badgeKey: 'complianceAttention',
    badgeVariant: 'destructive',
    keywords: ['documents', 'licenses', 'expiring'],
  },
  {
    id: 'reviews',
    title: 'Reviews',
    href: '/admin/reviews',
    icon: Star,
    section: 'care-delivery',
    feature: 'reviews',
    keywords: ['ratings', 'moderation'],
  },
  {
    id: 'satisfaction',
    title: 'Satisfaction',
    href: '/admin/satisfaction',
    icon: Heart,
    section: 'care-delivery',
    feature: 'satisfactionTracking',
    keywords: ['surveys', 'feedback'],
  },
  {
    id: 'swaps',
    title: 'Shift Swaps',
    href: '/admin/swaps',
    icon: ArrowRightLeft,
    section: 'care-delivery',
    feature: 'shiftSwaps',
    badgeKey: 'swapRequestsPending',
    badgeVariant: 'destructive',
    keywords: ['swap requests', 'coverage'],
  },
  {
    id: 'caregivers',
    title: 'Caregivers',
    href: '/admin/caregivers',
    icon: UserRoundCheck,
    section: 'care-delivery',
    feature: 'workerManagement',
    keywords: ['profiles', 'marketing profiles'],
  },
  {
    id: 'jobs',
    title: 'Jobs',
    href: '/admin/jobs',
    icon: Briefcase,
    section: 'recruiting',
    shortcut: 'G J',
    keywords: ['positions', 'openings'],
  },
  {
    id: 'applications',
    title: 'Applications',
    href: '/admin/applications',
    icon: FileText,
    section: 'recruiting',
    badgeKey: 'applicationsPending',
    badgeVariant: 'secondary',
    shortcut: 'G A',
    keywords: ['candidates', 'applicants'],
  },
  {
    id: 'contacts',
    title: 'Contacts',
    href: '/admin/contacts',
    icon: MessageSquare,
    section: 'communications',
    badgeKey: 'contactsUnread',
    badgeVariant: 'secondary',
    shortcut: 'G C',
    keywords: ['messages', 'contact form'],
  },
  {
    id: 'inquiries',
    title: 'Inquiries',
    href: '/admin/inquiries',
    icon: HelpCircle,
    section: 'communications',
    badgeKey: 'inquiriesNew',
    badgeVariant: 'secondary',
    shortcut: 'G I',
    keywords: ['service requests', 'consultations'],
  },
  {
    id: 'testimonials',
    title: 'Testimonials',
    href: '/admin/testimonials',
    icon: Star,
    section: 'content',
    shortcut: 'G T',
    keywords: ['social proof', 'reviews'],
  },
  {
    id: 'faqs',
    title: 'FAQs',
    href: '/admin/faqs',
    icon: CircleHelp,
    section: 'content',
    keywords: ['help', 'knowledge base'],
  },
  {
    id: 'services',
    title: 'Services',
    href: '/admin/services',
    icon: Layers,
    section: 'content',
    keywords: ['service categories', 'offerings'],
  },
  {
    id: 'pricing',
    title: 'Pricing',
    href: '/admin/pricing',
    icon: CreditCard,
    section: 'content',
    keywords: ['pricing tiers', 'rates', 'packages'],
  },
  {
    id: 'analytics',
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    section: 'system',
    shortcut: 'G N',
    keywords: ['metrics', 'reporting'],
  },
  {
    id: 'audit-log',
    title: 'Activity Log',
    href: '/admin/audit-log',
    icon: Shield,
    section: 'system',
    shortcut: 'G L',
    keywords: ['audit', 'history', 'security'],
  },
  {
    id: 'users',
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
    section: 'system',
    shortcut: 'G U',
    keywords: ['accounts', 'roles'],
  },
  {
    id: 'settings',
    title: 'Site Settings',
    href: '/admin/settings',
    icon: Settings,
    section: 'system',
    shortcut: 'G S',
    keywords: ['configuration', 'banners', 'branding'],
  },
];

export const adminQuickActions: AdminQuickAction[] = [
  {
    id: 'new-job',
    title: 'Create Job',
    href: '/admin/jobs/new',
    icon: Plus,
    keywords: ['new job', 'add role', 'position'],
  },
  {
    id: 'new-shift',
    title: 'Create Shift',
    href: '/admin/shifts/new',
    icon: Plus,
    feature: 'shiftScheduling',
    keywords: ['new shift', 'schedule'],
  },
  {
    id: 'new-faq',
    title: 'Create FAQ',
    href: '/admin/faqs/new',
    icon: Plus,
    keywords: ['new faq', 'question'],
  },
  {
    id: 'new-testimonial',
    title: 'Add Testimonial',
    href: '/admin/testimonials/new',
    icon: Plus,
    keywords: ['new testimonial', 'review'],
  },
  {
    id: 'new-service-category',
    title: 'Add Service Category',
    href: '/admin/services/new',
    icon: Plus,
    keywords: ['new service', 'category'],
  },
  {
    id: 'new-pricing-tier',
    title: 'Add Pricing Tier',
    href: '/admin/pricing/new',
    icon: Plus,
    keywords: ['new pricing', 'rate', 'tier'],
  },
];

export function isAdminNavItemActive(item: AdminNavItem, pathname: string): boolean {
  if (pathname === item.href) {
    return true;
  }

  if (item.href === '/admin') {
    return false;
  }

  return pathname.startsWith(`${item.href}/`);
}

export function getVisibleAdminNavSections(
  isFeatureAvailable: (feature: FeatureKey) => boolean
): VisibleAdminNavSection[] {
  return adminNavSections
    .map((section) => ({
      ...section,
      items: adminNavItems.filter(
        (item) =>
          item.section === section.id &&
          (!item.feature || isFeatureAvailable(item.feature))
      ),
    }))
    .filter((section) => section.items.length > 0);
}

export function getVisibleAdminQuickActions(
  isFeatureAvailable: (feature: FeatureKey) => boolean
): AdminQuickAction[] {
  return adminQuickActions.filter(
    (action) => !action.feature || isFeatureAvailable(action.feature)
  );
}

export function getActiveAdminNavItem(
  pathname: string,
  sections: VisibleAdminNavSection[]
): AdminNavItem | null {
  for (const section of sections) {
    const activeItem = section.items.find((item) =>
      isAdminNavItemActive(item, pathname)
    );
    if (activeItem) {
      return activeItem;
    }
  }

  return null;
}
