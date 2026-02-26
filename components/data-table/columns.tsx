"use client";

import * as React from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Eye, Trash2 } from "lucide-react";

import { formatDate, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/ui/status-badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RowAction<TData> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: TData) => void;
  variant?: "default" | "destructive";
  separator?: boolean; // renders a separator BEFORE this item
}

export interface StatusConfig {
  label: string;
  color: string;
}

// ---------------------------------------------------------------------------
// createDateColumn
// ---------------------------------------------------------------------------

export function createDateColumn<TData>(
  key: keyof TData & string,
  label: string
): ColumnDef<TData> {
  return {
    accessorKey: key,
    header: label,
    cell: ({ row }) => {
      const value = row.getValue<string | Date | null | undefined>(key);
      if (!value) return <span className="text-gray-400">—</span>;
      return <span className="whitespace-nowrap">{formatDate(value)}</span>;
    },
  };
}

// ---------------------------------------------------------------------------
// createStatusColumn
// ---------------------------------------------------------------------------

export function createStatusColumn<TData>(
  key: keyof TData & string,
  label: string,
  statusConfig: Record<string, StatusConfig>
): ColumnDef<TData> {
  return {
    accessorKey: key,
    header: label,
    cell: ({ row }) => {
      const value = row.getValue<string>(key);
      if (!value) return <span className="text-gray-400">—</span>;
      return <StatusBadge status={value} statusMap={statusConfig} />;
    },
    filterFn: (row, columnId, filterValue) => {
      return row.getValue<string>(columnId) === filterValue;
    },
  };
}

// ---------------------------------------------------------------------------
// createCurrencyColumn
// ---------------------------------------------------------------------------

export function createCurrencyColumn<TData>(
  key: keyof TData & string,
  label: string,
  currency = "INR"
): ColumnDef<TData> {
  return {
    accessorKey: key,
    header: () => <span className="block text-right">{label}</span>,
    cell: ({ row }) => {
      const value = row.getValue<number | null | undefined>(key);
      if (value == null) return <span className="block text-right text-gray-400">—</span>;
      return (
        <span className="block text-right font-medium tabular-nums">
          {formatCurrency(value, currency)}
        </span>
      );
    },
  };
}

// ---------------------------------------------------------------------------
// createActionsColumn
// ---------------------------------------------------------------------------

export function createActionsColumn<TData>(
  actions: RowAction<TData>[]
): ColumnDef<TData> {
  return {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }: { row: Row<TData> }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 data-[state=open]:bg-gray-100"
              aria-label="Open row actions"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {actions.map((action, index) => (
              <React.Fragment key={index}>
                {action.separator && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(row.original);
                  }}
                  className={
                    action.variant === "destructive"
                      ? "text-red-600 focus:text-red-600 focus:bg-red-50"
                      : undefined
                  }
                >
                  {action.icon && (
                    <span className="mr-2 h-4 w-4 shrink-0" aria-hidden="true">
                      {action.icon}
                    </span>
                  )}
                  {action.label}
                </DropdownMenuItem>
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  };
}

// ---------------------------------------------------------------------------
// Preset action creators (convenience)
// ---------------------------------------------------------------------------

export function editAction<TData>(onClick: (row: TData) => void): RowAction<TData> {
  return {
    label: "Edit",
    icon: <Pencil className="h-4 w-4" />,
    onClick,
  };
}

export function viewAction<TData>(onClick: (row: TData) => void): RowAction<TData> {
  return {
    label: "View",
    icon: <Eye className="h-4 w-4" />,
    onClick,
  };
}

export function deleteAction<TData>(onClick: (row: TData) => void): RowAction<TData> {
  return {
    label: "Delete",
    icon: <Trash2 className="h-4 w-4" />,
    onClick,
    variant: "destructive",
    separator: true,
  };
}
