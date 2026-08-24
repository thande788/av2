import { db } from '@/lib/db';

export interface ServiceTypeOption {
  id: string;
  key: string;
  label: string;
  description: string;
  defaultWorkerRatePercent: number;
  isActive: boolean;
  sortOrder: number;
}

export const DEFAULT_SERVICE_TYPES: Omit<ServiceTypeOption, 'id'>[] = [
  {
    key: 'companion-care',
    label: 'Companion Care',
    description: 'Basic companionship and social support.',
    defaultWorkerRatePercent: 65,
    isActive: true,
    sortOrder: 0,
  },
  {
    key: 'personal-care',
    label: 'Personal Care',
    description: 'Hands-on support with activities of daily living.',
    defaultWorkerRatePercent: 65,
    isActive: true,
    sortOrder: 1,
  },
  {
    key: 'skilled-nursing',
    label: 'Skilled Nursing',
    description: 'Higher-acuity support requiring advanced skills.',
    defaultWorkerRatePercent: 70,
    isActive: true,
    sortOrder: 2,
  },
  {
    key: 'live-in-care',
    label: 'Live-In Care',
    description: 'Extended and overnight care coverage.',
    defaultWorkerRatePercent: 68,
    isActive: true,
    sortOrder: 3,
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
        data: DEFAULT_SERVICE_TYPES,
        skipDuplicates: true,
      });
    }

    const rows = await db.serviceTypeConfig.findMany({
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
