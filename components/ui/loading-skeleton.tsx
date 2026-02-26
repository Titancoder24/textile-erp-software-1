import * as React from "react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// ---------------------------------------------------------------------------
// TableSkeleton
// ---------------------------------------------------------------------------

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({
  rows = 8,
  columns = 5,
  className,
}: TableSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white overflow-hidden",
        className
      )}
      aria-busy="true"
      aria-label="Loading table data"
    >
      {/* Header */}
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-3.5 rounded"
              style={{ width: `${50 + (i % 3) * 15}px` }}
            />
          ))}
        </div>
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-4 border-b border-gray-50 px-4 py-3.5 last:border-b-0"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className="h-4 rounded"
              style={{
                width: `${40 + ((rowIndex + colIndex) % 4) * 20}px`,
                maxWidth: "160px",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CardSkeleton
// ---------------------------------------------------------------------------

interface CardSkeletonProps {
  lines?: number;
  showHeader?: boolean;
  className?: string;
}

export function CardSkeleton({
  lines = 3,
  showHeader = true,
  className,
}: CardSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-5 shadow-sm",
        className
      )}
      aria-busy="true"
      aria-label="Loading"
    >
      {showHeader && (
        <div className="mb-4 flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      )}
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-3.5 rounded"
            style={{ width: i === lines - 1 ? "60%" : "100%" }}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatCardSkeleton
// ---------------------------------------------------------------------------

interface StatCardSkeletonProps {
  className?: string;
}

export function StatCardSkeleton({ className }: StatCardSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-5 shadow-sm",
        className
      )}
      aria-busy="true"
      aria-label="Loading stat"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2.5 flex-1">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FormSkeleton
// ---------------------------------------------------------------------------

interface FormSkeletonProps {
  fields?: number;
  className?: string;
}

export function FormSkeleton({ fields = 4, className }: FormSkeletonProps) {
  return (
    <div
      className={cn("space-y-5", className)}
      aria-busy="true"
      aria-label="Loading form"
    >
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ListSkeleton
// ---------------------------------------------------------------------------

interface ListSkeletonProps {
  rows?: number;
  className?: string;
}

export function ListSkeleton({ rows = 5, className }: ListSkeletonProps) {
  return (
    <div
      className={cn("divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white", className)}
      aria-busy="true"
      aria-label="Loading list"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
