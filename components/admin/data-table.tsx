'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  CheckSquare,
  Filter,
} from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
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

export interface FilterOption {
  label: string;
  value: string;
}

export interface TableFilter {
  key: string;
  label: string;
  options: FilterOption[];
}

export interface BulkAction<T> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'destructive';
  action: (selectedIds: string[], selectedItems: T[]) => void | Promise<void>;
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
  /** Filter definitions for the table */
  filters?: TableFilter[];
  /** Enable row selection for bulk actions */
  selectable?: boolean;
  /** Bulk actions available when items are selected */
  bulkActions?: BulkAction<T>[];
  /** Enable CSV export */
  exportable?: boolean;
  /** Filename for exported CSV (without extension) */
  exportFilename?: string;
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
  filters = [],
  selectable = false,
  bulkActions = [],
  exportable = false,
  exportFilename = 'export',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

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
    let result = data;

    // Apply search filter
    if (search && searchKeys.length > 0) {
      const searchLower = search.toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const value = getNestedValue(item, key);
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchLower);
          }
          return false;
        })
      );
    }

    // Apply column filters
    for (const [filterKey, filterValue] of Object.entries(activeFilters)) {
      if (filterValue && filterValue !== '__all__') {
        result = result.filter((item) => {
          const value = getNestedValue(item, filterKey);
          return String(value) === filterValue;
        });
      }
    }

    return result;
  }, [data, search, searchKeys, activeFilters]);

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

  // Selection helpers
  const allPageSelected = paginatedData.length > 0 && paginatedData.every((item) => selectedIds.has(item.id));
  const somePageSelected = paginatedData.some((item) => selectedIds.has(item.id));

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        paginatedData.forEach((item) => next.delete(item.id));
      } else {
        paginatedData.forEach((item) => next.add(item.id));
      }
      return next;
    });
  }, [allPageSelected, paginatedData]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectedItems = useMemo(
    () => data.filter((item) => selectedIds.has(item.id)),
    [data, selectedIds]
  );

  // Filter helpers
  const activeFilterCount = Object.values(activeFilters).filter((v) => v && v !== '__all__').length;

  const clearFilters = useCallback(() => {
    setActiveFilters({});
    setPage(0);
  }, []);

  const getValue = useCallback((item: T, key: string): unknown => {
    if (key.includes('.')) {
      const keys = key.split('.');
      let value: unknown = item;
      for (const k of keys) {
        value = (value as Record<string, unknown>)?.[k];
      }
      return value;
    }
    return (item as Record<string, unknown>)[key];
  }, []);

  // CSV Export
  const handleExport = useCallback(() => {
    const exportData = selectedIds.size > 0 ? selectedItems : sortedData;
    const headers = columns.map((col) => col.header);
    const rows = exportData.map((item) =>
      columns.map((col) => {
        const val = getValue(item, String(col.key));
        const str = String(val ?? '');
        // Escape CSV values
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      })
    );

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportFilename}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedIds, selectedItems, sortedData, columns, exportFilename, getValue]);

  return (
    <div className="space-y-4">
      {/* Search + Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-1">
          {searchable && (
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                data-slot="table-search"
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
          {filters.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(activeFilterCount > 0 && 'border-primary/50 text-primary')}
            >
              <Filter className="size-4 mr-1" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {exportable && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="size-4 mr-1" />
              Export{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
            </Button>
          )}
        </div>
      </div>

      {/* Filter Row */}
      {showFilters && filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-3">
          {filters.map((filter) => (
            <div key={filter.key} className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">{filter.label}:</span>
              <Select
                value={activeFilters[filter.key] || '__all__'}
                onValueChange={(val) => {
                  setActiveFilters((prev) => ({ ...prev, [filter.key]: val }));
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  {filter.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">
              <X className="size-3 mr-1" />
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectable && selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/40 bg-primary/5 px-4 py-2.5">
          <CheckSquare className="size-4 text-primary" />
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-2 ml-auto">
            {bulkActions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => action.action(Array.from(selectedIds), selectedItems)}
              >
                {action.icon && <action.icon className="size-4 mr-1" />}
                {action.label}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border border-border/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr className="border-b border-border/50">
              {selectable && (
                <th className="w-12 px-4">
                  <Checkbox
                    checked={allPageSelected ? true : somePageSelected ? 'indeterminate' : false}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </th>
              )}
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
                  colSpan={columns.length + (selectable ? 1 : 0)}
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
                    onRowClick && 'cursor-pointer',
                    selectedIds.has(item.id) && 'bg-primary/5'
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {selectable && (
                    <td className="w-12 px-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={() => toggleSelect(item.id)}
                        aria-label={`Select row`}
                      />
                    </td>
                  )}
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
                  className={cn('flex items-start gap-3', onRowClick && 'cursor-pointer')}
                >
                  {selectable && (
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                      className="mt-1"
                      aria-label={`Select row`}
                    />
                  )}
                  <div className="flex-1" onClick={() => onRowClick?.(item)}>
                    {mobileCard(item)}
                  </div>
                </div>
              );
            }

            // Default mobile card with portal styling
            const visibleColumns = columns.filter((col) => !col.hideOnMobile);
            const titleColumn = columns.find((col) => col.mobileTitle);

            return (
              <div
                key={item.id}
                className={cn('flex items-start gap-3')}
              >
                {selectable && (
                  <Checkbox
                    checked={selectedIds.has(item.id)}
                    onCheckedChange={() => toggleSelect(item.id)}
                    className="mt-1"
                    aria-label={`Select row`}
                  />
                )}
                <div
                  className={cn(
                    'flex-1 relative overflow-hidden rounded-xl border p-4 transition-all',
                    'border-border/50 bg-card hover:border-primary/40 hover:shadow-md',
                    selectedIds.has(item.id) && 'border-primary/40 bg-primary/5',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(item)}
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
            {sortedData.length !== data.length && (
              <span className="ml-1">(filtered from {data.length})</span>
            )}
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
