import * as React from "react";
import Link from "next/link";
import {
  FlaskConical,
  Layers,
  Percent,
  Droplets,
  BookOpen,
  GitBranch,
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
    title: "Active Batches",
    value: "8",
    changeLabel: "3 in dyeing stage",
    icon: <FlaskConical className="h-5 w-5" />,
    color: "blue" as const,
    href: "/dyeing/batches",
  },
  {
    title: "Pending Shade Approval",
    value: "4",
    changeLabel: "2 awaiting buyer approval",
    icon: <Layers className="h-5 w-5" />,
    color: "orange" as const,
    href: "/dyeing/batches",
  },
  {
    title: "Avg Process Loss %",
    value: "4.7%",
    change: -0.3,
    changeLabel: "vs last week",
    icon: <Percent className="h-5 w-5" />,
    color: "green" as const,
  },
  {
    title: "Pending Lab Dips",
    value: "6",
    changeLabel: "2 overdue",
    icon: <Droplets className="h-5 w-5" />,
    color: "purple" as const,
    href: "/lab-dips",
  },
];

const QUICK_LINKS = [
  {
    title: "Batches",
    description: "Manage dyeing batch records and process logs",
    href: "/dyeing/batches",
    icon: FlaskConical,
    badge: "8 active",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    title: "Recipes",
    description: "Dye recipe library with version control",
    href: "/dyeing/recipes",
    icon: BookOpen,
    badge: "View library",
    badgeColor: "bg-gray-100 text-gray-600",
  },
  {
    title: "Lab Dips",
    description: "Lab dip submissions and shade approvals",
    href: "/lab-dips",
    icon: GitBranch,
    badge: "6 pending",
    badgeColor: "bg-purple-100 text-purple-700",
  },
];

const ACTIVE_BATCHES = [
  {
    id: "BAT-0085",
    order: "ORD-2401",
    color: "Navy Blue",
    recipe: "RCP-0042",
    inputKg: 120,
    stage: "Dyeing",
    stageColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "BAT-0084",
    order: "ORD-2398",
    color: "Sage Green",
    recipe: "RCP-0038",
    inputKg: 85,
    stage: "Finishing",
    stageColor: "bg-green-100 text-green-700",
  },
  {
    id: "BAT-0083",
    order: "ORD-2395",
    color: "Dusty Rose",
    recipe: "RCP-0051",
    inputKg: 200,
    stage: "Scouring",
    stageColor: "bg-orange-100 text-orange-700",
  },
  {
    id: "BAT-0082",
    order: "ORD-2401",
    color: "Navy Blue",
    recipe: "RCP-0042",
    inputKg: 120,
    stage: "Bleaching",
    stageColor: "bg-yellow-100 text-yellow-700",
  },
];

export default function DyeingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dyeing"
        description="Batch management, recipe library, and lab dip tracking."
        breadcrumb={[{ label: "Dyeing" }]}
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

      {/* Active Batches */}
      <Card>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Active Batches</p>
            <p className="text-xs text-gray-500">Currently in process</p>
          </div>
          <Link href="/dyeing/batches" className="text-xs font-medium text-blue-600 hover:underline">
            View all
          </Link>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                {["Batch #", "Order", "Color", "Recipe", "Input (kg)", "Stage"].map((h) => (
                  <TableHead
                    key={h}
                    className="text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ACTIVE_BATCHES.map((batch) => (
                <TableRow key={batch.id} className="border-b border-gray-100">
                  <TableCell className="py-3">
                    <Link
                      href={`/dyeing/batches/${batch.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {batch.id}
                    </Link>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-gray-700">{batch.order}</TableCell>
                  <TableCell className="py-3 text-sm text-gray-700">{batch.color}</TableCell>
                  <TableCell className="py-3 text-sm text-gray-700">{batch.recipe}</TableCell>
                  <TableCell className="py-3 text-sm text-gray-700">{batch.inputKg}</TableCell>
                  <TableCell className="py-3">
                    <span
                      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${batch.stageColor}`}
                    >
                      {batch.stage}
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
