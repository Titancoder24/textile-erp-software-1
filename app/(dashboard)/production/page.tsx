"use client";

import * as React from "react";
import Link from "next/link";
import {
  Factory,
  TrendingUp,
  ClipboardList,
  LayoutGrid,
  ArrowRight,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const WEEKLY_OUTPUT = [
  { day: "Mon", output: 4820, target: 5000 },
  { day: "Tue", output: 5200, target: 5000 },
  { day: "Wed", output: 4950, target: 5000 },
  { day: "Thu", output: 5380, target: 5000 },
  { day: "Fri", output: 5100, target: 5000 },
  { day: "Sat", output: 3200, target: 3000 },
];

const LINE_EFFICIENCY = [
  { line: "Line 1", efficiency: 78 },
  { line: "Line 2", efficiency: 65 },
  { line: "Line 3", efficiency: 82 },
  { line: "Line 4", efficiency: 55 },
  { line: "Line 5", efficiency: 71 },
  { line: "Line 6", efficiency: 46 },
  { line: "Line 7", efficiency: 88 },
  { line: "Line 8", efficiency: 60 },
];

const PRODUCTION_TREND = [
  { week: "W1", output: 24000, efficiency: 68 },
  { week: "W2", output: 26500, efficiency: 72 },
  { week: "W3", output: 25800, efficiency: 70 },
  { week: "W4", output: 28200, efficiency: 75 },
  { week: "W5", output: 27600, efficiency: 74 },
  { week: "W6", output: 29100, efficiency: 77 },
];

const QUICK_LINKS = [
  {
    title: "Live Floor Dashboard",
    description: "Real-time production line monitoring",
    href: "/production/floor",
    icon: Activity,
    color: "text-green-600",
    bg: "bg-green-50",
    badge: "Live",
  },
  {
    title: "Production Entry",
    description: "Enter hourly production data",
    href: "/production/entry",
    icon: ClipboardList,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Planning Board",
    description: "Kanban, calendar, and capacity view",
    href: "/production/planning",
    icon: LayoutGrid,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    title: "Work Orders",
    description: "Manage work order assignments",
    href: "/production/work-orders",
    icon: Target,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    title: "Cutting",
    description: "Cutting entries and fabric consumption",
    href: "/production/cutting",
    icon: Factory,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
];

function getEfficiencyBarColor(efficiency: number) {
  if (efficiency >= 65) return "#22c55e";
  if (efficiency >= 50) return "#eab308";
  return "#ef4444";
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProductionPage() {
  const totalOutput = WEEKLY_OUTPUT.reduce((s, d) => s + d.output, 0);
  const avgEfficiency = Math.round(
    LINE_EFFICIENCY.reduce((s, l) => s + l.efficiency, 0) / LINE_EFFICIENCY.length
  );
  const linesAboveTarget = LINE_EFFICIENCY.filter((l) => l.efficiency >= 65).length;
  const linesBelowTarget = LINE_EFFICIENCY.filter((l) => l.efficiency < 50).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production</h1>
          <p className="text-sm text-gray-500 mt-1">
            Factory floor overview and production management
          </p>
        </div>
        <Button asChild>
          <Link href="/production/floor">
            <Activity className="mr-2 h-4 w-4" />
            Live Floor
          </Link>
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Week Output",
            value: totalOutput.toLocaleString(),
            sub: "pieces",
            icon: Factory,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Avg Efficiency",
            value: `${avgEfficiency}%`,
            sub: "factory average",
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "Lines On Target",
            value: `${linesAboveTarget}/${LINE_EFFICIENCY.length}`,
            sub: "≥65% efficiency",
            icon: CheckCircle2,
            color: "text-teal-600",
            bg: "bg-teal-50",
          },
          {
            label: "Needs Attention",
            value: linesBelowTarget,
            sub: "lines <50% efficiency",
            icon: AlertTriangle,
            color: "text-red-600",
            bg: "bg-red-50",
          },
        ].map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">{card.label}</p>
                  <p className="mt-1 text-2xl font-black tabular-nums text-gray-900">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-400">{card.sub}</p>
                </div>
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    card.bg
                  )}
                >
                  <card.icon className={cn("h-5 w-5", card.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick navigation */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm"
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  link.bg
                )}
              >
                <link.icon className={cn("h-5 w-5", link.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 truncate">
                    {link.title}
                  </p>
                  {link.badge && (
                    <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
                      {link.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{link.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-400 shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Charts */}
      <Tabs defaultValue="floor" className="space-y-4">
        <TabsList>
          <TabsTrigger value="floor">Floor Dashboard</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="floor" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Weekly output chart */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Weekly Output vs Target</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={WEEKLY_OUTPUT} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                    />
                    <Bar dataKey="target" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Target" />
                    <Bar dataKey="output" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Output" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Line efficiency chart */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Line Efficiency Today</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={LINE_EFFICIENCY} layout="vertical" barSize={16}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="line" tick={{ fontSize: 11 }} width={48} />
                    <Tooltip
                      formatter={(val: number) => [`${val}%`, "Efficiency"]}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                    />
                    <Bar
                      dataKey="efficiency"
                      radius={[0, 4, 4, 0]}
                      fill="#22c55e"
                      label={{ position: "right", fontSize: 10, formatter: (v: number) => `${v}%` }}
                    >
                      {LINE_EFFICIENCY.map((entry, index) => (
                        <rect
                          key={`bar-${index}`}
                          fill={getEfficiencyBarColor(entry.efficiency)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="planning">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">6-Week Production Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={PRODUCTION_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `${v}%`}
                    domain={[50, 100]}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="output"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Output (pcs)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Efficiency (%)"
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
