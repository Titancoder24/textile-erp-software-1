import * as React from "react";
import Link from "next/link";
import {
  Building2,
  Hash,
  Users,
  GitBranch,
  CheckSquare,
  Factory,
  ChevronRight,
  Shield,
  History,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

const SETTINGS_SECTIONS = [
  {
    title: "General",
    description: "Company name, logo, address, GST, and financial year settings.",
    href: "/settings/general",
    icon: Building2,
    color: "blue",
  },
  {
    title: "Number Series",
    description: "Configure document numbering prefixes and sequences for SO, PO, GRN, WO, and more.",
    href: "/settings/number-series",
    icon: Hash,
    color: "purple",
  },
  {
    title: "Users",
    description: "Manage user accounts, roles, departments, and access permissions.",
    href: "/users",
    icon: Users,
    color: "green",
  },
  {
    title: "Approval Rules",
    description: "Define approval workflows and thresholds for orders, POs, and cost sheets.",
    href: "/settings/approval-rules",
    icon: GitBranch,
    color: "orange",
  },
  {
    title: "Quality Settings",
    description: "Default AQL levels, inspection tolerances, and defect classification.",
    href: "/settings/quality",
    icon: CheckSquare,
    color: "teal",
  },
  {
    title: "Production Settings",
    description: "Cost per minute, working hours per shift, overtime rates, and efficiency benchmarks.",
    href: "/settings/production",
    icon: Factory,
    color: "red",
  },
  {
    title: "Audit Log",
    description: "View all data changes, user actions, and system events with before/after diffs.",
    href: "/settings/audit-log",
    icon: History,
    color: "gray",
  },
  {
    title: "Security",
    description: "Password policies, two-factor authentication, and session management.",
    href: "/settings/security",
    icon: Shield,
    color: "slate",
  },
] as const;

const COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-purple-50 text-purple-600",
  green: "bg-green-50 text-green-600",
  orange: "bg-orange-50 text-orange-600",
  teal: "bg-teal-50 text-teal-600",
  red: "bg-red-50 text-red-600",
  gray: "bg-gray-100 text-gray-600",
  slate: "bg-slate-100 text-slate-600",
};

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure your factory, users, numbering, and system preferences."
        breadcrumb={[{ label: "Settings" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SETTINGS_SECTIONS.map((section) => {
          const Icon = section.icon;
          const iconClass = COLOR_MAP[section.color] ?? COLOR_MAP["gray"];

          return (
            <Link
              key={section.href}
              href={section.href}
              className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">
                    {section.title}
                  </h3>
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  {section.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
