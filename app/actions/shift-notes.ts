'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getCurrentPortalUser, isAdminOrManager } from '@/lib/auth';
import { z } from 'zod';
import { NoteCategory } from '@prisma/client';

const shiftNoteSchema = z.object({
  shiftId: z.string().min(1),
  content: z.string().min(1, 'Note content is required').max(2000),
  category: z.nativeEnum(NoteCategory).default('GENERAL'),
  isVisibleToClient: z.boolean().default(false),
  isPinned: z.boolean().default(false),
});

export type ShiftNoteData = z.infer<typeof shiftNoteSchema>;

/**
 * Add a note to a shift
 */
export async function addShiftNote(
  data: ShiftNoteData
): Promise<{ success: boolean; error?: string }> {
  try {
    const portalUser = await getCurrentPortalUser();
    if (!portalUser) return { success: false, error: 'Not authenticated' };

    const parsed = shiftNoteSchema.parse(data);

    // Verify shift exists
    const shift = await db.careShift.findUnique({ where: { id: parsed.shiftId } });
    if (!shift) return { success: false, error: 'Shift not found' };

    // Determine author role
    const isAdmin = await isAdminOrManager();
    const authorRole = isAdmin ? 'ADMIN' : 'CLIENT';

    await db.shiftNote.create({
      data: {
        shiftId: parsed.shiftId,
        authorId: portalUser.id,
        authorName: `${portalUser.firstName} ${portalUser.lastName}`,
        authorRole,
        content: parsed.content,
        category: parsed.category,
        isVisibleToClient: parsed.isVisibleToClient,
        isPinned: parsed.isPinned,
      },
    });

    revalidatePath(`/admin/shifts/${parsed.shiftId}`);
    revalidatePath(`/employee/shifts/${parsed.shiftId}`);
    revalidatePath(`/client/schedule`);

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error('Failed to add shift note:', error);
    return { success: false, error: 'Failed to add note' };
  }
}

/**
 * Get notes for a shift (with role-based filtering)
 */
export async function getShiftNotes(shiftId: string) {
  const portalUser = await getCurrentPortalUser();
  if (!portalUser) return [];

  const isAdmin = await isAdminOrManager();

  const notes = await db.shiftNote.findMany({
    where: {
      shiftId,
      // Clients can only see notes marked visible to them
      ...(portalUser.role === 'CLIENT' && !isAdmin ? { isVisibleToClient: true } : {}),
    },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
  });

  return notes;
}

/**
 * Get handoff notes for the next caregiver
 * Returns pinned notes from previous shifts for the same client
 */
export async function getHandoffNotes(shiftId: string) {
  const shift = await db.careShift.findUnique({
    where: { id: shiftId },
    select: { clientId: true, date: true },
  });

  if (!shift) return [];

  // Get pinned notes from recent shifts for the same client
  const notes = await db.shiftNote.findMany({
    where: {
      isPinned: true,
      shift: {
        clientId: shift.clientId,
        date: { lt: shift.date },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return notes;
}

/**
 * Toggle pin status of a note
 */
export async function toggleNotePin(
  noteId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const portalUser = await getCurrentPortalUser();
    if (!portalUser) return { success: false, error: 'Not authenticated' };

    const note = await db.shiftNote.findUnique({ where: { id: noteId } });
    if (!note) return { success: false, error: 'Note not found' };

    // Only author or admin can pin
    const isAdmin = await isAdminOrManager();
    if (note.authorId !== portalUser.id && !isAdmin) {
      return { success: false, error: 'Not authorized' };
    }

    await db.shiftNote.update({
      where: { id: noteId },
      data: { isPinned: !note.isPinned },
    });

    revalidatePath(`/admin/shifts/${note.shiftId}`);
    revalidatePath(`/employee/shifts/${note.shiftId}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to toggle pin:', error);
    return { success: false, error: 'Failed to update note' };
  }
}

/**
 * Search shift notes across all shifts
 */
export async function searchShiftNotes(query: string, limit = 20) {
  const portalUser = await getCurrentPortalUser();
  if (!portalUser) return [];

  const notes = await db.shiftNote.findMany({
    where: {
      content: { contains: query, mode: 'insensitive' },
    },
    include: {
      shift: {
        select: { id: true, date: true, startTime: true, endTime: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return notes;
}
