import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumb?: BreadcrumbItem[];
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1 pb-6", className)}>
      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-1">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
            {breadcrumb.map((item, index) => {
              const isLast = index === breadcrumb.length - 1;
              return (
                <li key={index} className="flex items-center gap-1">
                  {index > 0 && (
                    <ChevronRight
                      className="h-3.5 w-3.5 shrink-0 text-gray-400"
                      aria-hidden="true"
                    />
                  )}
                  {isLast || !item.href ? (
                    <span
                      className={cn(
                        isLast
                          ? "font-medium text-gray-700"
                          : "hover:text-gray-700"
                      )}
                      aria-current={isLast ? "page" : undefined}
                    >
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="hover:text-gray-700 transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* Title row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 truncate">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
