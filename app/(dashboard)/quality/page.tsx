import * as React from "react";
import Link from "next/link";
import {
  CheckSquare,
  AlertTriangle,
  TrendingDown,
  Layers,
  ClipboardList,
  BarChart2,
  FileWarning,
  Ruler,
} from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATS = [
  {
    title: "Inspections Today",
    value: "14",
    changeLabel: "Pass Rate: 78.6%",
    icon: <CheckSquare className="h-5 w-5" />,
    color: "blue" as const,
    href: "/quality/inspections",
  },
  {
    title: "Open CAPAs",
    value: "7",
    changeLabel: "3 overdue",
    icon: <AlertTriangle className="h-5 w-5" />,
    color: "red" as const,
    href: "/quality/capa",
  },
  {
    title: "Defect Rate This Week",
    value: "3.2%",
    change: -0.8,
    changeLabel: "vs last week",
    icon: <TrendingDown className="h-5 w-5" />,
    color: "orange" as const,
    href: "/quality/analytics",
  },
  {
    title: "Pending Fabric Inspections",
    value: "5",
    changeLabel: "2 rolls overdue",
    icon: <Layers className="h-5 w-5" />,
    color: "purple" as const,
    href: "/quality/fabric-inspection",
  },
];

const QUICK_LINKS = [
  {
    title: "Inspections",
    description: "Record and manage garment inspections",
    href: "/quality/inspections",
    icon: ClipboardList,
    badge: "14 today",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    title: "Defect Analytics",
    description: "Pareto charts and defect trend analysis",
    href: "/quality/analytics",
    icon: BarChart2,
    badge: "View reports",
    badgeColor: "bg-gray-100 text-gray-600",
  },
  {
    title: "CAPA",
    description: "Corrective and preventive action tracking",
    href: "/quality/capa",
    icon: FileWarning,
    badge: "7 open",
    badgeColor: "bg-red-100 text-red-700",
  },
  {
    title: "Fabric Inspection",
    description: "4-point fabric inspection system",
    href: "/quality/fabric-inspection",
    icon: Ruler,
    badge: "5 pending",
    badgeColor: "bg-purple-100 text-purple-700",
  },
];

const RECENT_INSPECTIONS = [
  {
    id: "INS-0041",
    type: "Final",
    order: "ORD-2401",
    line: "Line 3",
    inspector: "Amira Khan",
    result: "pass",
  },
  {
    id: "INS-0040",
    type: "Inline",
    order: "ORD-2398",
    line: "Line 1",
    inspector: "Rashid Ali",
    result: "fail",
  },
  {
    id: "INS-0039",
    type: "End-Line",
    order: "ORD-2401",
    line: "Line 2",
    inspector: "Priya Nair",
    result: "pass",
  },
  {
    id: "INS-0038",
    type: "Pre-Final",
    order: "ORD-2395",
    line: "Line 4",
    inspector: "Amira Khan",
    result: "pending",
  },
  {
    id: "INS-0037",
    type: "Final",
    order: "ORD-2390",
    line: "Line 1",
    inspector: "Rashid Ali",
    result: "pass",
  },
];

const RESULT_BADGE: Record<string, string> = {
  pass: "bg-green-100 text-green-700 border border-green-200",
  fail: "bg-red-100 text-red-700 border border-red-200",
  pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
};

export default function QualityPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quality Control"
        description="Inspection management, defect analytics, and CAPA tracking."
        breadcrumb={[{ label: "Quality" }]}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeLabel={stat.changeLabel}
            icon={stat.icon}
            color={stat.color}
            href={stat.href}
          />
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_LINKS.map(({ title, description, href, icon: Icon, badge, badgeColor }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-blue-50 transition-colors">
                <Icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeColor}`}>
                {badge}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
              {title}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">{description}</p>
          </Link>
        ))}
      </div>

      {/* Recent Inspections */}
      <Card>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Recent Inspections</p>
            <p className="text-xs text-gray-500">Last 5 inspections across all lines</p>
          </div>
          <Link
            href="/quality/inspections"
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Inspection #
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Type
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Order
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Line
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Inspector
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Result
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RECENT_INSPECTIONS.map((row) => (
                <TableRow key={row.id} className="border-b border-gray-100">
                  <TableCell className="py-3 text-sm">
                    <Link
                      href={`/quality/inspections/${row.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {row.id}
                    </Link>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-gray-700">{row.type}</TableCell>
                  <TableCell className="py-3 text-sm text-gray-700">{row.order}</TableCell>
                  <TableCell className="py-3 text-sm text-gray-700">{row.line}</TableCell>
                  <TableCell className="py-3 text-sm text-gray-700">{row.inspector}</TableCell>
                  <TableCell className="py-3">
                    <span
                      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold capitalize ${RESULT_BADGE[row.result]}`}
                    >
                      {row.result}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
