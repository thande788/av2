'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, formatDateUS } from '@/lib/utils';
import { updateApplicationStatus } from '@/app/admin/applications/[id]/actions';
import { toast } from 'sonner';
import { GripVertical, User, Briefcase, Clock } from 'lucide-react';
import type { Application, Job, ApplicationStatus } from '@prisma/client';

type ApplicationWithJob = Application & {
  job: Pick<Job, 'title' | 'department'>;
};

const KANBAN_COLUMNS: { status: ApplicationStatus; label: string; color: string; bgColor: string }[] = [
  { status: 'PENDING', label: 'Pending', color: 'text-yellow-700 dark:text-yellow-300', bgColor: 'bg-yellow-500/10 border-yellow-500/30' },
  { status: 'REVIEWING', label: 'Reviewing', color: 'text-blue-700 dark:text-blue-300', bgColor: 'bg-blue-500/10 border-blue-500/30' },
  { status: 'INTERVIEW', label: 'Interview', color: 'text-purple-700 dark:text-purple-300', bgColor: 'bg-purple-500/10 border-purple-500/30' },
  { status: 'OFFERED', label: 'Offered', color: 'text-green-700 dark:text-green-300', bgColor: 'bg-green-500/10 border-green-500/30' },
  { status: 'HIRED', label: 'Hired', color: 'text-emerald-700 dark:text-emerald-300', bgColor: 'bg-emerald-500/10 border-emerald-500/30' },
];

const statusColors: Record<ApplicationStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  REVIEWING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  INTERVIEW: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  OFFERED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  HIRED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  WITHDRAWN: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export function ApplicationsKanban({
  applications,
}: {
  applications: ApplicationWithJob[];
}) {
  const router = useRouter();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<ApplicationStatus | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, appId: string) => {
    setDraggedId(appId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', appId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, status: ApplicationStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(status);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, newStatus: ApplicationStatus) => {
      e.preventDefault();
      setDropTarget(null);

      const appId = e.dataTransfer.getData('text/plain');
      const app = applications.find((a) => a.id === appId);
      if (!app || app.status === newStatus) {
        setDraggedId(null);
        return;
      }

      setUpdating(appId);
      try {
        await updateApplicationStatus(appId, newStatus, '');
        toast.success(
          `${app.firstName} ${app.lastName} moved to ${newStatus}`
        );
        router.refresh();
      } catch {
        toast.error('Failed to update status');
      } finally {
        setUpdating(null);
        setDraggedId(null);
      }
    },
    [applications, router]
  );

  // Group applications by status
  const grouped = KANBAN_COLUMNS.reduce(
    (acc, col) => {
      acc[col.status] = applications.filter((a) => a.status === col.status);
      return acc;
    },
    {} as Record<ApplicationStatus, ApplicationWithJob[]>
  );

  // Applications in terminal states shown separately
  const rejected = applications.filter((a) => a.status === 'REJECTED');
  const withdrawn = applications.filter((a) => a.status === 'WITHDRAWN');

  return (
    <div className="space-y-4">
      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => (
          <div
            key={col.status}
            className={cn(
              'flex min-w-[280px] flex-1 flex-col rounded-xl border transition-colors',
              dropTarget === col.status
                ? 'border-primary/60 bg-primary/5'
                : 'border-border/50 bg-muted/20'
            )}
            onDragOver={(e) => handleDragOver(e, col.status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.status)}
          >
            {/* Column Header */}
            <div className={cn('flex items-center justify-between rounded-t-xl border-b px-4 py-3', col.bgColor)}>
              <div className="flex items-center gap-2">
                <span className={cn('text-sm font-semibold', col.color)}>{col.label}</span>
                <Badge variant="secondary" className="text-xs">
                  {grouped[col.status]?.length || 0}
                </Badge>
              </div>
            </div>

            {/* Cards */}
            <div className="flex flex-1 flex-col gap-2 p-3 min-h-[200px]">
              {grouped[col.status]?.map((app) => (
                <div
                  key={app.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, app.id)}
                  onClick={() => router.push(`/admin/applications/${app.id}`)}
                  className={cn(
                    'group relative cursor-pointer rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md hover:border-primary/40',
                    draggedId === app.id && 'opacity-50',
                    updating === app.id && 'animate-pulse'
                  )}
                >
                  {/* Drag Handle */}
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity">
                    <GripVertical className="size-4 text-muted-foreground" />
                  </div>

                  <div className="pl-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <User className="size-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium leading-tight">
                          {app.firstName} {app.lastName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Briefcase className="size-3" />
                      <span className="truncate">{app.job.title}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        <span>{formatDateUS(app.submittedAt)}</span>
                      </div>
                      {app.yearsExperience > 0 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {app.yearsExperience}yr exp
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {(!grouped[col.status] || grouped[col.status].length === 0) && (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/50 p-4">
                  <p className="text-xs text-muted-foreground">No applications</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Rejected / Withdrawn footer */}
      {(rejected.length > 0 || withdrawn.length > 0) && (
        <div className="flex flex-wrap gap-4 rounded-xl border border-border/50 bg-muted/10 p-4">
          {rejected.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Rejected ({rejected.length})
              </span>
              <div className="flex flex-wrap gap-1">
                {rejected.map((app) => (
                  <Button
                    key={app.id}
                    variant="ghost"
                    size="sm"
                    className="h-auto px-2 py-1 text-xs"
                    onClick={() => router.push(`/admin/applications/${app.id}`)}
                  >
                    <Badge className={statusColors.REJECTED} variant="secondary">
                      {app.firstName} {app.lastName}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          )}
          {withdrawn.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Withdrawn ({withdrawn.length})
              </span>
              <div className="flex flex-wrap gap-1">
                {withdrawn.map((app) => (
                  <Button
                    key={app.id}
                    variant="ghost"
                    size="sm"
                    className="h-auto px-2 py-1 text-xs"
                    onClick={() => router.push(`/admin/applications/${app.id}`)}
                  >
                    <Badge className={statusColors.WITHDRAWN} variant="secondary">
                      {app.firstName} {app.lastName}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
