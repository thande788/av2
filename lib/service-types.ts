import { db } from '@/lib/db';

export interface ServiceTypeOption {
  id: string;
  key: string;
  label: string;
  description: string;
  defaultWorkerRatePercent: number;
  isActive: boolean;
  sortOrder: number;
  skills: string[];
  skillIds: string[];
}

export const DEFAULT_SERVICE_TYPES: Omit<ServiceTypeOption, 'id'>[] = [
  {
    key: 'companion-care',
    label: 'Companion Care',
    description: 'Basic companionship and social support.',
    defaultWorkerRatePercent: 65,
    isActive: true,
    sortOrder: 0,
    skills: ['Companionship', 'Light Housekeeping'],
    skillIds: [],
  },
  {
    key: 'personal-care',
    label: 'Personal Care',
    description: 'Hands-on support with activities of daily living.',
    defaultWorkerRatePercent: 65,
    isActive: true,
    sortOrder: 1,
    skills: ['Personal Care', 'Medication Reminders', 'Meal Prep'],
    skillIds: [],
  },
  {
    key: 'skilled-nursing',
    label: 'Skilled Nursing',
    description: 'Higher-acuity support requiring advanced skills.',
    defaultWorkerRatePercent: 70,
    isActive: true,
    sortOrder: 2,
    skills: ['Dementia Care', 'Medication Reminders'],
    skillIds: [],
  },
  {
    key: 'live-in-care',
    label: 'Live-In Care',
    description: 'Extended and overnight care coverage.',
    defaultWorkerRatePercent: 68,
    isActive: true,
    sortOrder: 3,
    skills: ['Personal Care', 'Meal Prep', 'Companionship'],
    skillIds: [],
  },
];

export function slugifyServiceTypeKey(label: string): string {
  const normalized = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return normalized || `service-type-${Date.now()}`;
}

export async function getServiceTypeOptions(
  options?: { includeInactive?: boolean }
): Promise<ServiceTypeOption[]> {
  try {
    const existingCount = await db.serviceTypeConfig.count();

    if (existingCount === 0) {
      await db.serviceTypeConfig.createMany({
        data: DEFAULT_SERVICE_TYPES.map((item) => ({
          key: item.key,
          label: item.label,
          description: item.description,
          defaultWorkerRatePercent: item.defaultWorkerRatePercent,
          isActive: item.isActive,
          sortOrder: item.sortOrder,
        })),
        skipDuplicates: true,
      });
    }

    const rows = await db.serviceTypeConfig.findMany({
      include: {
        skills: {
          select: { id: true, label: true },
          orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
    });

    const mapped = rows.map((row) => ({
      id: row.id,
      key: row.key,
      label: row.label,
      description: row.description || '',
      defaultWorkerRatePercent: Number(row.defaultWorkerRatePercent),
      isActive: row.isActive,
      sortOrder: row.sortOrder,
      skills: row.skills.map((skill) => skill.label),
      skillIds: row.skills.map((skill) => skill.id),
    }));

    if (options?.includeInactive) {
      return mapped;
    }

    const activeOnly = mapped.filter((item) => item.isActive);
    return activeOnly.length > 0 ? activeOnly : mapped;
  } catch {
    return DEFAULT_SERVICE_TYPES.map((item, index) => ({
      id: `fallback-${index}`,
      ...item,
    }));
  }
}

export function getDefaultPercentByServiceType(
  serviceTypeLabel: string,
  options: ServiceTypeOption[]
): number {
  return options.find((option) => option.label === serviceTypeLabel)?.defaultWorkerRatePercent ?? 65;
}
