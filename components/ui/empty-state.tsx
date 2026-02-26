import * as React from "react";
import { InboxIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "No records found",
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400"
        aria-hidden="true"
      >
        {icon ?? <InboxIcon className="h-6 w-6" />}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        {description && (
          <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
