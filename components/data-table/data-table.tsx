"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";

export interface FilterConfig {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  loading?: boolean;
  searchKey?: string;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  onRowClick?: (row: TData) => void;
  actions?: React.ReactNode;
  emptyMessage?: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const SKELETON_ROWS = 8;

function SkeletonRow({ columnCount }: { columnCount: number }) {
  return (
    <TableRow>
      {Array.from({ length: columnCount }).map((_, i) => (
        <TableCell key={i} className="py-3">
          <div className="h-4 rounded bg-gray-200 animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable<TData>({
  columns,
  data,
  loading = false,
  searchKey,
  searchPlaceholder = "Search...",
  filters = [],
  onRowClick,
  actions,
  emptyMessage = "No records found.",
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState<string>("");

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter: searchKey ? undefined : globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  const handleSearchChange = (value: string) => {
    if (searchKey) {
      table.getColumn(searchKey)?.setFilterValue(value);
    } else {
      setGlobalFilter(value);
    }
  };

  const searchValue = searchKey
    ? (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
    : globalFilter;

  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const totalRows = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search */}
          {(searchKey !== undefined || true) && (
            <div className="relative min-w-[200px] max-w-sm flex-1">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8"
                aria-label={searchPlaceholder}
              />
            </div>
          )}

          {/* Extra filter dropdowns */}
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={(table.getColumn(filter.key)?.getFilterValue() as string) ?? "all"}
              onValueChange={(val) =>
                table.getColumn(filter.key)?.setFilterValue(val === "all" ? undefined : val)
              }
            >
              <SelectTrigger className="h-9 w-[160px]" aria-label={filter.label}>
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {filter.label}</SelectItem>
                {filter.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>

        {/* Actions slot */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50 hover:bg-gray-50">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wide text-gray-500 select-none",
                        canSort && "cursor-pointer hover:text-gray-900"
                      )}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                          ? "descending"
                          : canSort
                          ? "none"
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span className="text-gray-400" aria-hidden="true">
                            {sorted === "asc" ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : sorted === "desc" ? (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <SkeletonRow key={i} columnCount={columns.length} />
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-64 text-center p-0">
                  <EmptyState
                    title="No records found"
                    description={emptyMessage}
                    className="border-0 shadow-none"
                  />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    "border-b border-gray-100 transition-colors",
                    onRowClick && "cursor-pointer hover:bg-blue-50/60"
                  )}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  role={onRowClick ? "button" : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onRowClick(row.original);
                          }
                        }
                      : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 text-sm text-gray-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Rows per page
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => table.setPageSize(Number(val))}
          >
            <SelectTrigger className="h-8 w-[70px]" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!loading && (
            <span className="text-sm text-gray-500">
              {totalRows === 0
                ? "0 results"
                : `${pageIndex * pageSize + 1}–${Math.min(
                    (pageIndex + 1) * pageSize,
                    totalRows
                  )} of ${totalRows}`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {/* Page number pills */}
          {Array.from({ length: Math.min(pageCount, 7) }, (_, i) => {
            let page: number;
            if (pageCount <= 7) {
              page = i;
            } else if (pageIndex < 4) {
              page = i < 5 ? i : i === 5 ? -1 : pageCount - 1;
            } else if (pageIndex >= pageCount - 4) {
              page = i === 0 ? 0 : i === 1 ? -1 : pageCount - 7 + i;
            } else {
              if (i === 0) page = 0;
              else if (i === 1) page = -1;
              else if (i === 5) page = -1;
              else if (i === 6) page = pageCount - 1;
              else page = pageIndex + i - 3;
            }

            if (page === -1) {
              return (
                <span key={i} className="px-1 text-gray-400 text-sm select-none">
                  ...
                </span>
              );
            }
            return (
              <Button
                key={i}
                variant={page === pageIndex ? "default" : "outline"}
                size="sm"
                onClick={() => table.setPageIndex(page)}
                className="h-8 w-8 p-0 text-xs"
                aria-label={`Page ${page + 1}`}
                aria-current={page === pageIndex ? "page" : undefined}
              >
                {page + 1}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
