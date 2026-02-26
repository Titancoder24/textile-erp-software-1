import * as React from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";

import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: "blue" | "green" | "orange" | "red" | "purple";
  loading?: boolean;
  href?: string;
}

const colorMap: Record<
  "blue" | "green" | "orange" | "red" | "purple",
  { bg: string; icon: string; ring: string }
> = {
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-600 text-white",
    ring: "ring-blue-100",
  },
  green: {
    bg: "bg-green-50",
    icon: "bg-green-600 text-white",
    ring: "ring-green-100",
  },
  orange: {
    bg: "bg-orange-50",
    icon: "bg-orange-500 text-white",
    ring: "ring-orange-100",
  },
  red: {
    bg: "bg-red-50",
    icon: "bg-red-600 text-white",
    ring: "ring-red-100",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "bg-purple-600 text-white",
    ring: "ring-purple-100",
  },
};

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-3 flex-1">
          <div className="h-3.5 w-24 rounded bg-gray-200 animate-pulse" />
          <div className="h-7 w-32 rounded bg-gray-200 animate-pulse" />
          <div className="h-3 w-28 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}

function StatCardContent({
  title,
  value,
  change,
  changeLabel = "vs last period",
  icon,
  color = "blue",
}: Omit<StatCardProps, "loading" | "href">) {
  const colors = colorMap[color];
  const isPositive = change !== undefined && change >= 0;
  const isNeutral = change === undefined;

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
        {!isNeutral && (
          <p
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              isPositive ? "text-green-600" : "text-red-600"
            )}
            aria-label={`${isPositive ? "Up" : "Down"} ${Math.abs(change!)}% ${changeLabel}`}
          >
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            )}
            <span>
              {isPositive ? "+" : ""}
              {change!.toFixed(1)}%
            </span>
            <span className="font-normal text-gray-400">{changeLabel}</span>
          </p>
        )}
      </div>
      {icon && (
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            colors.icon
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
    </div>
  );
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  color = "blue",
  loading = false,
  href,
}: StatCardProps) {
  if (loading) {
    return <StatCardSkeleton />;
  }

  const cardClass = cn(
    "rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow",
    href && "hover:shadow-md cursor-pointer"
  );

  const inner = (
    <StatCardContent
      title={title}
      value={value}
      change={change}
      changeLabel={changeLabel}
      icon={icon}
      color={color}
    />
  );

  if (href) {
    return (
      <Link href={href} className={cardClass} aria-label={`${title}: ${value}`}>
        {inner}
      </Link>
    );
  }

  return (
    <div className={cardClass} role="region" aria-label={title}>
      {inner}
    </div>
  );
}
