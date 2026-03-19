'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApplicationsTable } from './applications-table';
import { ApplicationsKanban } from '@/components/admin/applications-kanban';
import type { Application, Job } from '@prisma/client';

type ApplicationWithJob = Application & {
  job: Pick<Job, 'title' | 'department'>;
};

export function ApplicationsView({
  applications,
}: {
  applications: ApplicationWithJob[];
}) {
  const [view, setView] = useState<'table' | 'kanban'>('table');

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-lg border border-border/50 p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('table')}
            className={cn(
              'h-8 gap-1.5 px-3 text-sm',
              view === 'table' && 'bg-primary/10 text-primary'
            )}
          >
            <List className="size-4" />
            Table
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('kanban')}
            className={cn(
              'h-8 gap-1.5 px-3 text-sm',
              view === 'kanban' && 'bg-primary/10 text-primary'
            )}
          >
            <LayoutGrid className="size-4" />
            Kanban
          </Button>
        </div>
      </div>

      {/* View Content */}
      {view === 'table' ? (
        <ApplicationsTable applications={applications} />
      ) : (
        <ApplicationsKanban applications={applications} />
      )}
    </div>
  );
}
