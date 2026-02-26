"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type OrderStatus =
  | "draft"
  | "confirmed"
  | "in_production"
  | "quality_check"
  | "ready_to_ship"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "on_hold";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-600 border border-gray-200",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  in_production: {
    label: "In Production",
    className: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  },
  quality_check: {
    label: "QC",
    className: "bg-purple-50 text-purple-700 border border-purple-200",
  },
  ready_to_ship: {
    label: "Ready to Ship",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  shipped: {
    label: "Shipped",
    className: "bg-teal-50 text-teal-700 border border-teal-200",
  },
  delivered: {
    label: "Delivered",
    className: "bg-green-50 text-green-700 border border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border border-red-200",
  },
  on_hold: {
    label: "On Hold",
    className: "bg-orange-50 text-orange-700 border border-orange-200",
  },
};

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status as OrderStatus];
  if (!config) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200",
          className
        )}
      >
        {status}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export { STATUS_CONFIG };
