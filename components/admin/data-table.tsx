'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  /** Hide this column on mobile card view */
  hideOnMobile?: boolean;
  /** Show this column prominently as the card title on mobile */
  mobileTitle?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchKeys?: string[];
  pageSize?: number;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  /** Custom mobile card renderer - if not provided, uses default card layout */
  mobileCard?: (item: T) => React.ReactNode;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchable = true,
  searchKeys = [],
  pageSize = 10,
  onRowClick,
  emptyMessage = 'No data found.',
  mobileCard,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Helper to get nested values like 'user.firstName'
  const getNestedValue = (obj: unknown, path: string): unknown => {
    return path.split('.').reduce((current, key) => {
      if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  };

  const filteredData = useMemo(() => {
    if (!search || searchKeys.length === 0) return data;

    const searchLower = search.toLowerCase();
    return data.filter((item) =>
      searchKeys.some((key) => {
        const value = getNestedValue(item, key);
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchLower);
        }
        return false;
      })
    );
  }, [data, search, searchKeys]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return sortDir === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDir]);

  const paginatedData = useMemo(() => {
    const start = page * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const getValue = (item: T, key: string): unknown => {
    if (key.includes('.')) {
      const keys = key.split('.');
      let value: unknown = item;
      for (const k of keys) {
        value = (value as Record<string, unknown>)?.[k];
      }
      return value;
    }
    return (item as Record<string, unknown>)[key];
  };

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-9"
          />
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border border-border/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr className="border-b border-border/50">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    'h-12 px-4 text-left font-medium text-muted-foreground',
                    col.sortable && 'cursor-pointer select-none hover:bg-muted/50 transition-colors',
                    col.className
                  )}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <span className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      <span className="text-xs">
                        {sortDir === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr
                  key={item.id}
                  className={cn(
                    'border-b border-border/50 transition-colors hover:bg-muted/30',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className={cn('p-4', col.className)}>
                      {col.render
                        ? col.render(item)
                        : String(getValue(item, String(col.key)) ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {paginatedData.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          paginatedData.map((item) => {
            // Use custom mobile card if provided
            if (mobileCard) {
              return (
                <div
                  key={item.id}
                  onClick={() => onRowClick?.(item)}
                  className={cn(onRowClick && 'cursor-pointer')}
                >
                  {mobileCard(item)}
                </div>
              );
            }

            // Default mobile card with portal styling
            const visibleColumns = columns.filter((col) => !col.hideOnMobile);
            const titleColumn = columns.find((col) => col.mobileTitle);

            return (
              <div
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  'relative overflow-hidden rounded-xl border p-4 transition-all',
                  'border-border/50 bg-card hover:border-primary/40 hover:shadow-md',
                  onRowClick && 'cursor-pointer'
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                <div className="relative space-y-3">
                  {/* Title row if defined */}
                  {titleColumn && (
                    <div className="font-medium text-foreground">
                      {titleColumn.render
                        ? titleColumn.render(item)
                        : String(getValue(item, String(titleColumn.key)) ?? '-')}
                    </div>
                  )}
                  {/* Other fields */}
                  {visibleColumns
                    .filter((col) => col !== titleColumn)
                    .map((col) => (
                      <div
                        key={String(col.key)}
                        className="flex items-center justify-between gap-4"
                      >
                        <span className="text-sm text-muted-foreground shrink-0">
                          {col.header}
                        </span>
                        <span className="text-sm text-right">
                          {col.render
                            ? col.render(item)
                            : String(getValue(item, String(col.key)) ?? '-')}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {page * pageSize + 1} to{' '}
            {Math.min((page + 1) * pageSize, sortedData.length)} of{' '}
            {sortedData.length} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
            >
              <ChevronLeft className="size-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Status badge helper
export function StatusBadge({
  status,
  variant = 'default',
}: {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'secondary';
}) {
  const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    default: 'default',
    success: 'default',
    warning: 'secondary',
    destructive: 'destructive',
    secondary: 'secondary',
  };

  const colorMap: Record<string, string> = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  return (
    <Badge
      variant={variantMap[variant]}
      className={colorMap[variant]}
    >
      {status}
    </Badge>
  );
}
