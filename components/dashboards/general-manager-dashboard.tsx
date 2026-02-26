"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  DollarSign,
  ShoppingBag,
  Gauge,
  Truck,
  CheckCircle,
  AlertTriangle,
  TrendingDown,
  Clock,
  ArrowRight,
  BadgeAlert,
  Activity,
} from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* ---------- Demo Data ---------- */

const PRODUCTION_TREND = [
  { day: "Mon", output: 2100 },
  { day: "Tue", output: 2350 },
  { day: "Wed", output: 2180 },
  { day: "Thu", output: 2480 },
  { day: "Fri", output: 2250 },
  { day: "Sat", output: 1950 },
];

const ORDER_STATUS_PIE = [
  { label: "Confirmed", value: 8, color: "#3b82f6" },
  { label: "In Production", value: 10, color: "#f59e0b" },
  { label: "Ready to Ship", value: 3, color: "#8b5cf6" },
  { label: "Shipped", value: 5, color: "#06b6d4" },
  { label: "Completed", value: 12, color: "#22c55e" },
];

const FINANCIAL_OVERVIEW = [
  { month: "Oct 25", revenue: 4300000, expenses: 3500000 },
  { month: "Nov 25", revenue: 3900000, expenses: 3200000 },
  { month: "Dec 25", revenue: 4500000, expenses: 3600000 },
  { month: "Jan 26", revenue: 3780000, expenses: 3100000 },
  { month: "Feb 26", revenue: 4250000, expenses: 3400000 },
];

const DEPT_SCORECARD = [
  { dept: "Production", kpi: "Line Efficiency", target: "75%", actual: "68%", ok: false },
  { dept: "Quality", kpi: "Pass Rate", target: "95%", actual: "94.2%", ok: true },
  { dept: "Purchase", kpi: "PO On-Time Delivery", target: "90%", actual: "87%", ok: false },
  { dept: "Dyeing", kpi: "Process Loss", target: "5%", actual: "6.8%", ok: false },
  { dept: "HR", kpi: "Attendance Rate", target: "95%", actual: "92.5%", ok: true },
  { dept: "Shipment", kpi: "On-Time Shipment", target: "92%", actual: "89%", ok: false },
  { dept: "Store", kpi: "Inventory Accuracy", target: "98%", actual: "98.4%", ok: true },
  { dept: "Finance", kpi: "Overdue Receivables", target: "< 10%", actual: "8.2%", ok: true },
];

const ALERTS = [
  { id: "1", severity: "high", msg: "SO-2026-0045 delivery is 3 days behind TNA schedule" },
  { id: "2", severity: "high", msg: "Line 4 efficiency at 45% - critical action needed" },
  { id: "3", severity: "medium", msg: "5 purchase orders overdue from Supplier VEN-012" },
  { id: "4", severity: "medium", msg: "Dyeing batch B-117 process loss exceeded 8%" },
  { id: "5", severity: "low", msg: "3 inspection CAPAs approaching due date (within 2 days)" },
  { id: "6", severity: "low", msg: "Fabric stock for SO-2026-0052 below 20% buffer" },
];

const HOT_TOPICS = [
  { id: "1", topic: "Approve revised cost sheet CS-2026-0089 for H&M order", href: "/costing" },
  { id: "2", topic: "Review 12 pending purchase order approvals above \u20B91L", href: "/purchase" },
  { id: "3", topic: "Resolve fabric shortage for Fleece Hoodie ST-4398", href: "/inventory" },
  { id: "4", topic: "Sign off on lab dip approval for shade SH-Blush Pink", href: "/quality/lab-dips" },
  { id: "5", topic: "Monthly management review meeting preparation", href: "/reports" },
];

/* ---------- Helpers ---------- */

function formatINRFull(v: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);
}

/* ---------- Component ---------- */

interface GeneralManagerDashboardProps {
  data?: Record<string, unknown>;
}

export function GeneralManagerDashboard(_props: GeneralManagerDashboardProps) {
  const metrics = {
    revenue_mtd: 4250000,
    active_orders: 38,
    factory_efficiency: 68,
    on_time_delivery: 89,
    quality_pass_rate: 94.2,
    outstanding_amount: 12800000,
  };

  return (
    <div className="space-y-6">
      {/* KPI Tiles */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          title="Revenue MTD"
          value={`\u20B942.5L`}
          change={12.5}
          changeLabel="vs last month"
          icon={<DollarSign className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Active Orders"
          value={metrics.active_orders}
          icon={<ShoppingBag className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Factory Efficiency"
          value={`${metrics.factory_efficiency}%`}
          change={-2.1}
          changeLabel="vs last week"
          icon={<Gauge className="h-5 w-5" />}
          color="orange"
        />
        <StatCard
          title="On-Time Delivery"
          value={`${metrics.on_time_delivery}%`}
          change={-3.0}
          changeLabel="vs target 92%"
          icon={<Truck className="h-5 w-5" />}
          color="orange"
        />
        <StatCard
          title="Quality Pass Rate"
          value={`${metrics.quality_pass_rate}%`}
          change={-0.8}
          changeLabel="vs target 95%"
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Outstanding Amount"
          value={`\u20B91.28Cr`}
          change={8.2}
          changeLabel="vs last month"
          icon={<DollarSign className="h-5 w-5" />}
          color="purple"
        />
      </div>

      {/* Row 2: Production Trend + Order Status Donut + Financial Bar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Production Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-900">
              Production Output (This Week)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart
                data={PRODUCTION_TREND}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} dy={6} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: "11px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                  formatter={(v: number | undefined) => [`${(v ?? 0).toLocaleString("en-IN")} pcs`, "Output"]}
                />
                <Line
                  type="monotone"
                  dataKey="output"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#2563eb", strokeWidth: 0 }}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-900">
              Order Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="flex items-center gap-3">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie
                    data={ORDER_STATUS_PIE}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {ORDER_STATUS_PIE.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: "11px", borderRadius: "6px" }}
                    formatter={(v: number | undefined) => [v ?? 0]}
                  />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                    <tspan style={{ fontSize: 16, fontWeight: 700, fill: "#111827" }}>38</tspan>
                  </text>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {ORDER_STATUS_PIE.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-600">{item.label}</span>
                    </div>
                    <span className="font-medium text-gray-900 tabular-nums">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Overview Bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-900">
              Revenue vs Expenses (5 Months)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={FINANCIAL_OVERVIEW}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                barCategoryGap="25%"
                barGap={3}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} dy={6} />
                <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                <Tooltip
                  contentStyle={{ fontSize: "11px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                  formatter={(v: number | undefined) => [formatINRFull(v ?? 0)]}
                />
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: "10px" }} />
                <Bar dataKey="revenue" fill="#2563eb" radius={[3, 3, 0, 0]} maxBarSize={24} name="revenue" />
                <Bar dataKey="expenses" fill="#94a3b8" radius={[3, 3, 0, 0]} maxBarSize={24} name="expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Alerts + Department Scorecard */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Alerts */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <BadgeAlert className="h-4 w-4 text-red-500" />
              Exceptions Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ALERTS.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-start gap-2.5 rounded-lg px-3 py-2.5",
                    alert.severity === "high"
                      ? "bg-red-50 border border-red-100"
                      : alert.severity === "medium"
                      ? "bg-orange-50 border border-orange-100"
                      : "bg-yellow-50 border border-yellow-100"
                  )}
                >
                  <AlertTriangle
                    className={cn(
                      "mt-0.5 h-3.5 w-3.5 shrink-0",
                      alert.severity === "high"
                        ? "text-red-600"
                        : alert.severity === "medium"
                        ? "text-orange-600"
                        : "text-yellow-600"
                    )}
                  />
                  <p
                    className={cn(
                      "text-xs",
                      alert.severity === "high"
                        ? "text-red-800"
                        : alert.severity === "medium"
                        ? "text-orange-800"
                        : "text-yellow-800"
                    )}
                  >
                    {alert.msg}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Scorecard */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Activity className="h-4 w-4 text-blue-500" />
              Department Performance Scorecard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 text-left font-medium text-gray-500">Department</th>
                  <th className="pb-2 text-left font-medium text-gray-500">KPI</th>
                  <th className="pb-2 text-right font-medium text-gray-500">Target</th>
                  <th className="pb-2 text-right font-medium text-gray-500">Actual</th>
                  <th className="pb-2 text-center font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {DEPT_SCORECARD.map((row) => (
                  <tr key={row.dept} className="hover:bg-gray-50/50">
                    <td className="py-2 font-medium text-gray-800">{row.dept}</td>
                    <td className="py-2 text-gray-600">{row.kpi}</td>
                    <td className="py-2 text-right tabular-nums text-gray-500">{row.target}</td>
                    <td
                      className={cn(
                        "py-2 text-right tabular-nums font-semibold",
                        row.ok ? "text-green-700" : "text-red-700"
                      )}
                    >
                      {row.actual}
                    </td>
                    <td className="py-2 text-center">
                      {row.ok ? (
                        <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          On Track
                        </span>
                      ) : (
                        <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          Below Target
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Hot Topics */}
      <Card className="border-blue-100 bg-blue-50/40">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Clock className="h-4 w-4 text-blue-600" />
            Hot Topics - Action Required Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {HOT_TOPICS.map((item, i) => (
              <a
                key={item.id}
                href={item.href}
                className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <p className="min-w-0 flex-1 text-sm text-gray-700">{item.topic}</p>
                <ArrowRight className="h-4 w-4 shrink-0 text-gray-400" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default GeneralManagerDashboard;
