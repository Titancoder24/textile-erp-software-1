"use client";

import * as React from "react";
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
  Legend,
} from "recharts";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

/* ---------- Mock data ---------- */

const PARETO_DATA = [
  { defect: "Broken stitch", count: 142, pct: 100 },
  { defect: "Needle hole", count: 98, pct: 69 },
  { defect: "Shade variation", count: 76, pct: 54 },
  { defect: "Skip stitch", count: 61, pct: 43 },
  { defect: "Dropped stitch", count: 54, pct: 38 },
  { defect: "Open seam", count: 43, pct: 30 },
  { defect: "Puckering", count: 31, pct: 22 },
  { defect: "Missing button", count: 24, pct: 17 },
  { defect: "Uneven collar", count: 18, pct: 13 },
  { defect: "Stain", count: 12, pct: 8 },
];

const TREND_DATA = [
  { date: "Feb 17", rate: 3.8 },
  { date: "Feb 18", rate: 4.1 },
  { date: "Feb 19", rate: 3.6 },
  { date: "Feb 20", rate: 3.2 },
  { date: "Feb 21", rate: 2.9 },
  { date: "Feb 22", rate: 3.5 },
  { date: "Feb 23", rate: 2.8 },
  { date: "Feb 24", rate: 3.0 },
  { date: "Feb 25", rate: 2.7 },
  { date: "Feb 26", rate: 3.2 },
];

const BY_OPERATION = [
  { operation: "Collar attach", count: 95 },
  { operation: "Side seam", count: 82 },
  { operation: "Sleeve set", count: 71 },
  { operation: "Button attach", count: 58 },
  { operation: "Hem", count: 43 },
  { operation: "Back stitch", count: 37 },
];

const BY_LINE = [
  { line: "Line 1", defects: 187, inspections: 42 },
  { line: "Line 2", defects: 143, inspections: 38 },
  { line: "Line 3", defects: 112, inspections: 35 },
  { line: "Line 4", defects: 217, inspections: 44 },
  { line: "Line 5", defects: 98, inspections: 29 },
];

/* ---------- Custom Tooltip ---------- */

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-md text-xs">
      <p className="mb-1.5 font-semibold text-gray-700">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-bold text-gray-900">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Page ---------- */

export default function QualityAnalyticsPage() {
  const [loading, setLoading] = React.useState(true);
  const [fromDate, setFromDate] = React.useState("2026-02-17");
  const [toDate, setToDate] = React.useState("2026-02-26");
  const [order, setOrder] = React.useState("all");
  const [line, setLine] = React.useState("all");

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Defect Analytics"
        description="Pareto analysis, trend monitoring and defect distribution by operation and line."
        breadcrumb={[
          { label: "Quality", href: "/quality" },
          { label: "Analytics" },
        ]}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label htmlFor="from-date">From Date</Label>
          <Input
            id="from-date"
            type="date"
            className="w-40"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="to-date">To Date</Label>
          <Input
            id="to-date"
            type="date"
            className="w-40"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <div className="space-y-1.5 min-w-[160px]">
          <Label>Order</Label>
          <Select value={order} onValueChange={setOrder}>
            <SelectTrigger>
              <SelectValue placeholder="All orders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="ORD-2401">ORD-2401</SelectItem>
              <SelectItem value="ORD-2398">ORD-2398</SelectItem>
              <SelectItem value="ORD-2395">ORD-2395</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 min-w-[140px]">
          <Label>Production Line</Label>
          <Select value={line} onValueChange={setLine}>
            <SelectTrigger>
              <SelectValue placeholder="All lines" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Lines</SelectItem>
              <SelectItem value="line1">Line 1</SelectItem>
              <SelectItem value="line2">Line 2</SelectItem>
              <SelectItem value="line3">Line 3</SelectItem>
              <SelectItem value="line4">Line 4</SelectItem>
              <SelectItem value="line5">Line 5</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 1: Pareto + Trend */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pareto Chart */}
        <Card>
          <div className="border-b border-gray-100 px-6 py-4">
            <p className="text-sm font-semibold text-gray-900">Top 10 Defects by Frequency</p>
            <p className="text-xs text-gray-500">Pareto analysis — most frequent defect types</p>
          </div>
          <CardContent className="p-6">
            {loading ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={PARETO_DATA}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 12, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis
                    type="category"
                    dataKey="defect"
                    width={110}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Defect Rate Trend */}
        <Card>
          <div className="border-b border-gray-100 px-6 py-4">
            <p className="text-sm font-semibold text-gray-900">Defect Rate Trend</p>
            <p className="text-xs text-gray-500">Daily defect rate (%) over selected period</p>
          </div>
          <CardContent className="p-6">
            {loading ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={TREND_DATA}
                  margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickFormatter={(v) => `${v}%`}
                    domain={[0, 6]}
                  />
                  <Tooltip
                    formatter={(v: number | undefined) => [`${v ?? 0}%`, "Defect Rate"]}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    name="Defect Rate"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#ef4444" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: By Operation + By Line */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Defect by Operation */}
        <Card>
          <div className="border-b border-gray-100 px-6 py-4">
            <p className="text-sm font-semibold text-gray-900">Defects by Operation</p>
            <p className="text-xs text-gray-500">Which sewing operations generate most defects</p>
          </div>
          <CardContent className="p-6">
            {loading ? (
              <Skeleton className="h-56 w-full rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={BY_OPERATION}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis
                    type="category"
                    dataKey="operation"
                    width={110}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Defects" fill="#f97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Defect by Line */}
        <Card>
          <div className="border-b border-gray-100 px-6 py-4">
            <p className="text-sm font-semibold text-gray-900">Defects by Production Line</p>
            <p className="text-xs text-gray-500">Total defects vs inspections per line</p>
          </div>
          <CardContent className="p-6">
            {loading ? (
              <Skeleton className="h-56 w-full rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={BY_LINE}
                  margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="line" tick={{ fontSize: 12, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12 }}
                  />
                  <Bar dataKey="defects" name="Defects" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="inspections" name="Inspections" fill="#d1d5db" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
