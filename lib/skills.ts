import { db } from '@/lib/db';

export interface SkillOption {
  id: string;
  key: string;
  label: string;
  isActive: boolean;
  sortOrder: number;
}

export const DEFAULT_SKILLS: Omit<SkillOption, 'id'>[] = [
  { key: 'personal-care', label: 'Personal Care', isActive: true, sortOrder: 0 },
  { key: 'dementia-care', label: 'Dementia Care', isActive: true, sortOrder: 1 },
  { key: 'hoyer-lift', label: 'Hoyer Lift', isActive: true, sortOrder: 2 },
  { key: 'meal-prep', label: 'Meal Prep', isActive: true, sortOrder: 3 },
  { key: 'companionship', label: 'Companionship', isActive: true, sortOrder: 4 },
  { key: 'medication-reminders', label: 'Medication Reminders', isActive: true, sortOrder: 5 },
  { key: 'light-housekeeping', label: 'Light Housekeeping', isActive: true, sortOrder: 6 },
  { key: 'transportation', label: 'Transportation', isActive: true, sortOrder: 7 },
];

export function slugifySkillKey(label: string): string {
  const normalized = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return normalized || `skill-${Date.now()}`;
}

export async function getSkillOptions(
  options?: { includeInactive?: boolean }
): Promise<SkillOption[]> {
  try {
    const existingCount = await db.skill.count();

    if (existingCount === 0) {
      await db.skill.createMany({ data: DEFAULT_SKILLS, skipDuplicates: true });
    }

    const rows = await db.skill.findMany({
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
    });

    const mapped = rows.map((row) => ({
      id: row.id,
      key: row.key,
      label: row.label,
      isActive: row.isActive,
      sortOrder: row.sortOrder,
    }));

    if (options?.includeInactive) {
      return mapped;
    }

    const activeOnly = mapped.filter((item) => item.isActive);
    return activeOnly.length > 0 ? activeOnly : mapped;
  } catch {
    return DEFAULT_SKILLS.map((skill, index) => ({ id: `fallback-${index}`, ...skill }));
  }
}
