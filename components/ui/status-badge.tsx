import * as React from "react";
import { cn } from "@/lib/utils";

export interface StatusConfig {
  label: string;
  /**
   * Pass a Tailwind color token name (e.g. "green", "red", "yellow", "blue",
   * "gray", "purple", "orange", "cyan", "pink", "indigo", "teal", "amber")
   * OR pass full Tailwind class strings for complete control
   * (e.g. "bg-green-50 text-green-700 border border-green-200").
   */
  color: string;
}

interface StatusBadgeProps {
  status: string;
  statusMap: Record<string, StatusConfig>;
  className?: string;
}

/**
 * Predefined token -> Tailwind class mapping.
 * When `color` matches a key here the named classes are applied automatically.
 * Otherwise `color` is used verbatim as a className (raw Tailwind classes).
 */
const TOKEN_CLASSES: Record<string, string> = {
  green: "bg-green-50 text-green-700 border-green-200",
  yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  red: "bg-red-50 text-red-700 border-red-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  gray: "bg-gray-100 text-gray-600 border-gray-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
  cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
  pink: "bg-pink-50 text-pink-700 border-pink-200",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  teal: "bg-teal-50 text-teal-700 border-teal-200",
};

const DOT_CLASSES: Record<string, string> = {
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  blue: "bg-blue-500",
  gray: "bg-gray-400",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
  cyan: "bg-cyan-500",
  pink: "bg-pink-500",
  indigo: "bg-indigo-500",
  teal: "bg-teal-500",
};

export function StatusBadge({ status, statusMap, className }: StatusBadgeProps) {
  const config = statusMap[status];

  if (!config) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600",
          className
        )}
      >
        {status}
      </span>
    );
  }

  const colorClasses = TOKEN_CLASSES[config.color] ?? config.color;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
        colorClasses,
        className
      )}
      role="status"
      aria-label={config.label}
    >
      {config.label}
    </span>
  );
}

/**
 * Dot + label variant — useful inline or in table cells.
 */
export function StatusDot({
  status,
  statusMap,
  className,
}: StatusBadgeProps) {
  const config = statusMap[status];
  const dotClass = DOT_CLASSES[config?.color ?? "gray"] ?? "bg-gray-400";

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-sm text-gray-700", className)}
      role="status"
      aria-label={config?.label ?? status}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotClass)}
        aria-hidden="true"
      />
      {config?.label ?? status}
    </span>
  );
}
