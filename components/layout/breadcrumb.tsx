"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Maps path segments to human-readable labels.
 * Handles known route names and falls back to title-casing the segment.
 */
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  orders: "Orders",
  inquiries: "Inquiries",
  samples: "Samples",
  "lab-dips": "Lab Dips",
  costing: "Costing",
  tna: "TNA",
  bom: "BOM",
  mrp: "MRP",
  purchase: "Purchase",
  inventory: "Inventory",
  production: "Production",
  quality: "Quality",
  dyeing: "Dyeing",
  shipment: "Shipment",
  masters: "Masters",
  reports: "Reports",
  users: "Users",
  settings: "Settings",
  profile: "My Profile",
  notifications: "Notifications",
  new: "New",
  edit: "Edit",
};

function toLabel(segment: string): string {
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment];
  // Title-case fallback: handle slugs and UUIDs
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      segment
    )
  ) {
    return "Detail";
  }
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface BreadcrumbItem {
  label: string;
  href: string;
  isLast: boolean;
}

export function Breadcrumb() {
  const pathname = usePathname();

  const breadcrumbs = React.useMemo<BreadcrumbItem[]>(() => {
    // Remove leading slash and split
    const segments = pathname.replace(/^\//, "").split("/").filter(Boolean);

    if (segments.length === 0) {
      return [{ label: "Dashboard", href: "/dashboard", isLast: true }];
    }

    const items: BreadcrumbItem[] = segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const isLast = index === segments.length - 1;
      return {
        label: toLabel(segment),
        href,
        isLast,
      };
    });

    return items;
  }, [pathname]);

  if (breadcrumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center">
      <ol className="flex items-center gap-1 text-sm">
        {/* Home icon */}
        <li>
          <Link
            href="/dashboard"
            className="flex items-center text-gray-400 transition-colors hover:text-gray-700"
            aria-label="Home"
          >
            <Home className="h-3.5 w-3.5" />
          </Link>
        </li>

        {breadcrumbs.map((item) => (
          <React.Fragment key={item.href}>
            {/* Separator */}
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
            </li>

            {/* Breadcrumb item */}
            <li>
              {item.isLast ? (
                <span
                  className="font-medium text-gray-800"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-gray-500 transition-colors hover:text-gray-700"
                >
                  {item.label}
                </Link>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
