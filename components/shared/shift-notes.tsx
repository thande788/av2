'use client';

import { useState, useTransition } from 'react';
import { cn, formatDateUS } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageSquare,
  Pin,
  PinOff,
  Send,
  AlertCircle,
  Heart,
  Pill,
  ArrowRightLeft,
  FileText,
} from 'lucide-react';
import { addShiftNote, toggleNotePin } from '@/app/actions/shift-notes';
import { toast } from 'sonner';

type NoteCategory = 'GENERAL' | 'CARE_UPDATE' | 'MEDICATION' | 'INCIDENT' | 'HANDOFF';

interface ShiftNote {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  category: NoteCategory;
  isVisibleToClient: boolean;
  isPinned: boolean;
  createdAt: Date | string;
}

interface ShiftNotesProps {
  shiftId: string;
  notes: ShiftNote[];
  handoffNotes?: ShiftNote[];
  canAdd?: boolean;
}

const categoryConfig: Record<NoteCategory, { label: string; icon: typeof MessageSquare; color: string }> = {
  GENERAL: { label: 'General', icon: MessageSquare, color: 'text-blue-600 bg-blue-500/10' },
  CARE_UPDATE: { label: 'Care Update', icon: Heart, color: 'text-rose-600 bg-rose-500/10' },
  MEDICATION: { label: 'Medication', icon: Pill, color: 'text-purple-600 bg-purple-500/10' },
  INCIDENT: { label: 'Incident', icon: AlertCircle, color: 'text-red-600 bg-red-500/10' },
  HANDOFF: { label: 'Handoff', icon: ArrowRightLeft, color: 'text-emerald-600 bg-emerald-500/10' },
};

function NoteCard({ note, onTogglePin }: { note: ShiftNote; onTogglePin: (id: string) => void }) {
  const config = categoryConfig[note.category];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'relative rounded-lg border p-3 transition-colors',
        note.isPinned
          ? 'border-amber-500/40 bg-amber-500/5'
          : 'border-border/50 bg-card hover:bg-muted/30'
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={cn('rounded-md p-1', config.color)}>
            <Icon className="size-3" />
          </div>
          <span className="text-xs font-medium">{note.authorName}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {config.label}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {note.isVisibleToClient && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              Client visible
            </Badge>
          )}
          <button
            type="button"
            onClick={() => onTogglePin(note.id)}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
          >
            {note.isPinned ? <PinOff className="size-3" /> : <Pin className="size-3" />}
          </button>
        </div>
      </div>
      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
      <p className="mt-2 text-[10px] text-muted-foreground">
        {formatDateUS(note.createdAt, 'datetime')}
      </p>
    </div>
  );
}

export function ShiftNotes({ shiftId, notes, handoffNotes = [], canAdd = true }: ShiftNotesProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('GENERAL');
  const [visibleToClient, setVisibleToClient] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!content.trim()) return;

    startTransition(async () => {
      const result = await addShiftNote({
        shiftId,
        content: content.trim(),
        category,
        isVisibleToClient: visibleToClient,
        isPinned,
      });

      if (result.success) {
        toast.success('Note added');
        setContent('');
        setIsPinned(false);
      } else {
        toast.error(result.error || 'Failed to add note');
      }
    });
  };

  const handleTogglePin = (noteId: string) => {
    startTransition(async () => {
      const result = await toggleNotePin(noteId);
      if (!result.success) {
        toast.error(result.error || 'Failed to update');
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Handoff notes from previous shifts */}
      {handoffNotes.length > 0 && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
            <ArrowRightLeft className="size-4" />
            Handoff Notes from Previous Shifts
          </div>
          <div className="space-y-2">
            {handoffNotes.map((note) => (
              <NoteCard key={note.id} note={note} onTogglePin={handleTogglePin} />
            ))}
          </div>
        </div>
      )}

      {/* Current shift notes */}
      <div className="rounded-xl border border-border/50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <FileText className="size-4 text-muted-foreground" />
          <h3 className="font-semibold">Shift Notes</h3>
          <Badge variant="secondary" className="text-xs">{notes.length}</Badge>
        </div>

        {notes.length === 0 && (
          <p className="mb-4 text-sm text-muted-foreground">No notes yet for this shift.</p>
        )}

        <div className="space-y-2">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onTogglePin={handleTogglePin} />
          ))}
        </div>

        {/* Add note form */}
        {canAdd && (
          <div className="mt-4 space-y-3 border-t border-border/30 pt-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add a note..."
              rows={3}
              className="resize-none"
            />
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NoteCategory)}
                className="rounded-md border border-border bg-background px-2 py-1 text-xs"
              >
                {Object.entries(categoryConfig).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
              <label className="flex items-center gap-1.5 text-xs">
                <input
                  type="checkbox"
                  checked={visibleToClient}
                  onChange={(e) => setVisibleToClient(e.target.checked)}
                  className="rounded border-border"
                />
                Client visible
              </label>
              <label className="flex items-center gap-1.5 text-xs">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded border-border"
                />
                Pin for handoff
              </label>
              <Button
                size="sm"
                className="ml-auto"
                onClick={handleSubmit}
                disabled={isPending || !content.trim()}
              >
                <Send className="mr-1.5 size-3.5" />
                {isPending ? 'Saving…' : 'Add Note'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
