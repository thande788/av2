'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { slugifyServiceTypeKey } from '@/lib/service-types';
import { slugifySkillKey } from '@/lib/skills';

const serviceTypeInputSchema = z.object({
  id: z.string().min(1).optional(),
  label: z.string().min(1, 'Label is required').max(80, 'Label is too long'),
  description: z.string().max(240, 'Description is too long').optional(),
  defaultWorkerRatePercent: z
    .number()
    .min(1, 'Default worker rate % must be at least 1')
    .max(100, 'Default worker rate % cannot exceed 100'),
  isActive: z.boolean(),
  skillIds: z.array(z.string()).default([]),
});

type ServiceTypeInput = z.infer<typeof serviceTypeInputSchema>;

const skillInputSchema = z.object({
  id: z.string().min(1).optional(),
  label: z.string().min(1, 'Skill label is required').max(80, 'Skill label is too long'),
  isActive: z.boolean(),
});

type SkillInput = z.infer<typeof skillInputSchema>;

const reorderServiceTypeSchema = z.object({
  id: z.string().min(1, 'Service type ID is required'),
  direction: z.enum(['up', 'down']),
});

function revalidateAdminPaths() {
  revalidatePath('/admin/service-types');
  revalidatePath('/admin/shifts/new');
  revalidatePath('/admin/shifts');
}

function normalizeForKey(label: string) {
  return slugifyServiceTypeKey(label);
}

function normalizeSkillKey(label: string) {
  return slugifySkillKey(label);
}

async function getUniqueKey(baseLabel: string, currentId?: string): Promise<string> {
  const base = normalizeForKey(baseLabel);
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await db.serviceTypeConfig.findUnique({
      where: { key: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === currentId) {
      return candidate;
    }

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

async function getUniqueSkillKey(baseLabel: string, currentId?: string): Promise<string> {
  const base = normalizeSkillKey(baseLabel);
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await db.skill.findUnique({
      where: { key: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === currentId) {
      return candidate;
    }

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function saveServiceTypeConfig(
  input: ServiceTypeInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = serviceTypeInputSchema.parse(input);

    if (validated.id) {
      const existing = await db.serviceTypeConfig.findUnique({
        where: { id: validated.id },
        select: { id: true },
      });

      if (!existing) {
        return { success: false, error: 'Service type not found.' };
      }

      const key = await getUniqueKey(validated.label, validated.id);

      await db.serviceTypeConfig.update({
        where: { id: validated.id },
        data: {
          key,
          label: validated.label,
          description: validated.description || null,
          defaultWorkerRatePercent: validated.defaultWorkerRatePercent,
          isActive: validated.isActive,
          skills: {
            set: validated.skillIds.map((id) => ({ id })),
          },
        },
      });
    } else {
      const maxSortOrder = await db.serviceTypeConfig.aggregate({
        _max: { sortOrder: true },
      });
      const key = await getUniqueKey(validated.label);

      await db.serviceTypeConfig.create({
        data: {
          key,
          label: validated.label,
          description: validated.description || null,
          defaultWorkerRatePercent: validated.defaultWorkerRatePercent,
          isActive: validated.isActive,
          sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
          skills: {
            connect: validated.skillIds.map((id) => ({ id })),
          },
        },
      });
    }

    revalidateAdminPaths();

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }

    console.error('Failed to save service type config:', error);
    return { success: false, error: 'Failed to save service type config.' };
  }
}

export async function saveSkillConfig(
  input: SkillInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = skillInputSchema.parse(input);

    if (validated.id) {
      const existing = await db.skill.findUnique({
        where: { id: validated.id },
        select: { id: true },
      });

      if (!existing) {
        return { success: false, error: 'Skill not found.' };
      }

      const key = await getUniqueSkillKey(validated.label, validated.id);

      await db.skill.update({
        where: { id: validated.id },
        data: {
          key,
          label: validated.label,
          isActive: validated.isActive,
        },
      });
    } else {
      const maxSortOrder = await db.skill.aggregate({
        _max: { sortOrder: true },
      });
      const key = await getUniqueSkillKey(validated.label);

      await db.skill.create({
        data: {
          key,
          label: validated.label,
          isActive: validated.isActive,
          sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
        },
      });
    }

    revalidateAdminPaths();
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }

    console.error('Failed to save skill config:', error);
    return { success: false, error: 'Failed to save skill config.' };
  }
}

export async function reorderSkillConfig(input: {
  id: string;
  direction: 'up' | 'down';
}): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = reorderServiceTypeSchema.parse(input);

    const rows = await db.skill.findMany({
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
      select: { id: true, sortOrder: true },
    });

    const index = rows.findIndex((row) => row.id === validated.id);
    if (index === -1) {
      return { success: false, error: 'Skill not found.' };
    }

    const swapIndex = validated.direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= rows.length) {
      return { success: true };
    }

    const current = rows[index];
    const target = rows[swapIndex];

    await db.$transaction([
      db.skill.update({
        where: { id: current.id },
        data: { sortOrder: target.sortOrder },
      }),
      db.skill.update({
        where: { id: target.id },
        data: { sortOrder: current.sortOrder },
      }),
    ]);

    revalidateAdminPaths();
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }

    console.error('Failed to reorder skill config:', error);
    return { success: false, error: 'Failed to reorder skills.' };
  }
}

export async function reorderServiceTypeConfig(input: {
  id: string;
  direction: 'up' | 'down';
}): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = reorderServiceTypeSchema.parse(input);

    const rows = await db.serviceTypeConfig.findMany({
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
      select: { id: true, sortOrder: true },
    });

    const index = rows.findIndex((row) => row.id === validated.id);
    if (index === -1) {
      return { success: false, error: 'Service type not found.' };
    }

    const swapIndex = validated.direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= rows.length) {
      return { success: true };
    }

    const current = rows[index];
    const target = rows[swapIndex];

    await db.$transaction([
      db.serviceTypeConfig.update({
        where: { id: current.id },
        data: { sortOrder: target.sortOrder },
      }),
      db.serviceTypeConfig.update({
        where: { id: target.id },
        data: { sortOrder: current.sortOrder },
      }),
    ]);

    revalidateAdminPaths();
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }

    console.error('Failed to reorder service type config:', error);
    return { success: false, error: 'Failed to reorder service types.' };
  }
}
