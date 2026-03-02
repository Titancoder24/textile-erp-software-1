"use client";

import * as React from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  AlertCircle,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

// Monthly P&L (last 12 months, Sep 2025 - Aug 2026)
const MONTHLY_PL = [
  { month: "Mar", revenue: 18200000, cogs: 13650000, grossProfit: 4550000 },
  { month: "Apr", revenue: 15800000, cogs: 11850000, grossProfit: 3950000 },
  { month: "May", revenue: 19600000, cogs: 14700000, grossProfit: 4900000 },
  { month: "Jun", revenue: 21400000, cogs: 16050000, grossProfit: 5350000 },
  { month: "Jul", revenue: 23800000, cogs: 17850000, grossProfit: 5950000 },
  { month: "Aug", revenue: 20100000, cogs: 15075000, grossProfit: 5025000 },
  { month: "Sep", revenue: 22400000, cogs: 16800000, grossProfit: 5600000 },
  { month: "Oct", revenue: 25600000, cogs: 19200000, grossProfit: 6400000 },
  { month: "Nov", revenue: 28900000, cogs: 21675000, grossProfit: 7225000 },
  { month: "Dec", revenue: 24200000, cogs: 18150000, grossProfit: 6050000 },
  { month: "Jan", revenue: 19800000, cogs: 14850000, grossProfit: 4950000 },
  { month: "Feb", revenue: 24000000, cogs: 18000000, grossProfit: 6000000 },
];

// Buyer-wise revenue breakdown
const BUYER_REVENUE = [
  { name: "H&M", value: 32, revenue: 7680000, color: "#3b82f6" },
  { name: "Zara", value: 24, revenue: 5760000, color: "#8b5cf6" },
  { name: "Next", value: 18, revenue: 4320000, color: "#10b981" },
  { name: "Primark", value: 15, revenue: 3600000, color: "#f59e0b" },
  { name: "Others", value: 11, revenue: 2640000, color: "#6b7280" },
];

// Outstanding payments
interface OutstandingRow {
  id: string;
  buyer: string;
  invoice: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  status: "current" | "overdue_30" | "overdue_60" | "overdue_90plus";
}

const OUTSTANDING_PAYMENTS: OutstandingRow[] = [
  {
    id: "1",
    buyer: "H&M",
    invoice: "INV-2026-0041",
    amount: 8420000,
    dueDate: "2026-02-10",
    daysOverdue: 16,
    status: "overdue_30",
  },
  {
    id: "2",
    buyer: "Zara",
    invoice: "INV-2026-0038",
    amount: 5180000,
    dueDate: "2026-01-28",
    daysOverdue: 29,
    status: "overdue_30",
  },
  {
    id: "3",
    buyer: "Next",
    invoice: "INV-2026-0035",
    amount: 3960000,
    dueDate: "2026-01-15",
    daysOverdue: 42,
    status: "overdue_60",
  },
  {
    id: "4",
    buyer: "Primark",
    invoice: "INV-2025-0091",
    amount: 6750000,
    dueDate: "2025-11-30",
    daysOverdue: 88,
    status: "overdue_90plus",
  },
  {
    id: "5",
    buyer: "H&M",
    invoice: "INV-2026-0044",
    amount: 4200000,
    dueDate: "2026-03-05",
    daysOverdue: 0,
    status: "current",
  },
  {
    id: "6",
    buyer: "ASOS",
    invoice: "INV-2026-0042",
    amount: 2840000,
    dueDate: "2026-02-20",
    daysOverdue: 6,
    status: "current",
  },
  {
    id: "7",
    buyer: "Lidl",
    invoice: "INV-2025-0088",
    amount: 5960000,
    dueDate: "2025-12-20",
    daysOverdue: 68,
    status: "overdue_60",
  },
];

// Top profitable orders
interface TopOrderRow {
  orderNumber: string;
  buyer: string;
  style: string;
  fobValue: number;
  cogs: number;
  profit: number;
  marginPct: number;
}

const TOP_ORDERS: TopOrderRow[] = [
  {
    orderNumber: "ORD-2026-0013",
    buyer: "Zara",
    style: "Women's Knitwear",
    fobValue: 8500000,
    cogs: 5950000,
    profit: 2550000,
    marginPct: 30.0,
  },
  {
    orderNumber: "ORD-2026-0016",
    buyer: "ASOS",
    style: "Casual Hoodie",
    fobValue: 5824000,
    cogs: 4124000,
    profit: 1700000,
    marginPct: 29.2,
  },
  {
    orderNumber: "ORD-2026-0011",
    buyer: "Primark",
    style: "Denim Jeans",
    fobValue: 7500000,
    cogs: 5400000,
    profit: 2100000,
    marginPct: 28.0,
  },
  {
    orderNumber: "ORD-2026-0015",
    buyer: "Next",
    style: "Ladies Blouse",
    fobValue: 3464000,
    cogs: 2510000,
    profit: 954000,
    marginPct: 27.5,
  },
  {
    orderNumber: "ORD-2026-0012",
    buyer: "H&M",
    style: "Men's Woven Shirt",
    fobValue: 8500000,
    cogs: 6375000,
    profit: 2125000,
    marginPct: 25.0,
  },
];

// Cost breakdown for donut
const COST_BREAKDOWN = [
  { name: "Material", value: 62, color: "#3b82f6" },
  { name: "Labor", value: 18, color: "#10b981" },
  { name: "Overhead", value: 10, color: "#f59e0b" },
  { name: "Rejection", value: 4, color: "#ef4444" },
  { name: "Profit", value: 6, color: "#8b5cf6" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatInr(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `${(amount / 100000).toFixed(0)} L`;
    }
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getOverdueClass(status: OutstandingRow["status"]): string {
  const map: Record<OutstandingRow["status"], string> = {
    current: "bg-green-50 text-green-700 border-green-200",
    overdue_30: "bg-amber-50 text-amber-700 border-amber-200",
    overdue_60: "bg-orange-50 text-orange-700 border-orange-200",
    overdue_90plus: "bg-red-50 text-red-700 border-red-200",
  };
  return map[status];
}

function getOverdueLabel(status: OutstandingRow["status"]): string {
  const map: Record<OutstandingRow["status"], string> = {
    current: "Current",
    overdue_30: "1-30 days",
    overdue_60: "31-60 days",
    overdue_90plus: "90+ days",
  };
  return map[status];
}

const TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: 8,
  border: "1px solid #e5e7eb",
};

// ---------------------------------------------------------------------------
// Custom Recharts Tooltip for INR
// ---------------------------------------------------------------------------

function InrTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {formatInr(p.value, true)}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function FinancePage() {
  const currentMonth = MONTHLY_PL[MONTHLY_PL.length - 1];
  const prevMonth = MONTHLY_PL[MONTHLY_PL.length - 2];
  const revenueChange = ((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100;
  const cogsChange = ((currentMonth.cogs - prevMonth.cogs) / prevMonth.cogs) * 100;
  const grossMarginPct = (currentMonth.grossProfit / currentMonth.revenue) * 100;
  const totalOutstanding = OUTSTANDING_PAYMENTS.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance & P&L"
        description="Revenue, cost, and margin analysis across all orders"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Finance & P&L" },
        ]}
        actions={
          <Link
            href="/finance/profitability"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            Style Profitability
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[
          {
            title: "Revenue This Month",
            value: `${formatInr(currentMonth.revenue, true)}`,
            sub: revenueChange >= 0 ? `+${revenueChange.toFixed(1)}% vs Jan` : `${revenueChange.toFixed(1)}% vs Jan`,
            positive: revenueChange >= 0,
            icon: IndianRupee,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            title: "COGS",
            value: `${formatInr(currentMonth.cogs, true)}`,
            sub: `${((currentMonth.cogs / currentMonth.revenue) * 100).toFixed(1)}% of revenue`,
            positive: cogsChange <= 0,
            icon: TrendingDown,
            color: "text-orange-500",
            bg: "bg-orange-50",
          },
          {
            title: "Gross Profit",
            value: `${formatInr(currentMonth.grossProfit, true)}`,
            sub: `${grossMarginPct.toFixed(1)}% margin`,
            positive: true,
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            title: "Gross Margin",
            value: `${grossMarginPct.toFixed(1)}%`,
            sub: "industry avg 22-28%",
            positive: grossMarginPct >= 24,
            icon: BarChart3,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
          {
            title: "Outstanding",
            value: `${formatInr(totalOutstanding, true)}`,
            sub: `${OUTSTANDING_PAYMENTS.filter(p => p.daysOverdue > 30).length} overdue >30d`,
            positive: false,
            icon: AlertCircle,
            color: "text-red-600",
            bg: "bg-red-50",
          },
        ].map((card) => (
          <Card key={card.title}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 leading-tight">{card.title}</p>
                  <p className="mt-1 text-xl font-black tabular-nums text-gray-900">
                    {card.value}
                  </p>
                  <p
                    className={cn(
                      "text-xs mt-0.5 flex items-center gap-0.5",
                      card.positive ? "text-green-600" : "text-red-500"
                    )}
                  >
                    {card.positive ? (
                      <TrendingUp className="h-3 w-3 shrink-0" />
                    ) : (
                      <TrendingDown className="h-3 w-3 shrink-0" />
                    )}
                    {card.sub}
                  </p>
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

      {/* Monthly P&L Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Monthly P&L - Last 12 Months</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={MONTHLY_PL}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => formatInr(v, true)}
                tickLine={false}
                width={64}
              />
              <Tooltip content={<InrTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#3b82f6" }}
                name="Revenue"
              />
              <Line
                type="monotone"
                dataKey="cogs"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3, fill: "#f59e0b" }}
                name="COGS"
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="grossProfit"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#10b981" }}
                name="Gross Profit"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Row: Buyer Donut + Cost Breakdown Donut */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Buyer-wise Revenue */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Buyer-wise Revenue (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={BUYER_REVENUE}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {BUYER_REVENUE.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Share"]}
                    contentStyle={TOOLTIP_STYLE}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {BUYER_REVENUE.map((b) => (
                  <div key={b.name} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: b.color }}
                    />
                    <span className="text-sm text-gray-700 flex-1 font-medium">
                      {b.name}
                    </span>
                    <span className="text-xs text-gray-500 tabular-nums">
                      {formatInr(b.revenue, true)}
                    </span>
                    <span
                      className="text-xs font-bold tabular-nums w-10 text-right"
                      style={{ color: b.color }}
                    >
                      {b.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cost Breakdown (% of FOB)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={COST_BREAKDOWN}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {COST_BREAKDOWN.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Share"]}
                    contentStyle={TOOLTIP_STYLE}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {COST_BREAKDOWN.map((c) => (
                  <div key={c.name} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="text-sm text-gray-700 flex-1 font-medium">
                      {c.name}
                    </span>
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${c.value * 1.6}%`,
                          backgroundColor: c.color,
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-bold tabular-nums w-8 text-right"
                      style={{ color: c.color }}
                    >
                      {c.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Outstanding Payments Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Outstanding Payments
            </CardTitle>
            <span className="text-sm font-semibold text-gray-700">
              Total: {formatInr(totalOutstanding)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (INR)
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Overdue
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {OUTSTANDING_PAYMENTS.sort((a, b) => b.daysOverdue - a.daysOverdue).map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "hover:bg-gray-50/60 transition-colors",
                      row.daysOverdue > 60 && "bg-red-50/20"
                    )}
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {row.buyer}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600">
                      {row.invoice}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-gray-800">
                      {formatInr(row.amount)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 text-xs whitespace-nowrap">
                      {new Date(row.dueDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.daysOverdue > 0 ? (
                        <span
                          className={cn(
                            "font-bold tabular-nums text-sm",
                            row.daysOverdue > 60
                              ? "text-red-600"
                              : row.daysOverdue > 30
                              ? "text-orange-500"
                              : "text-amber-500"
                          )}
                        >
                          {row.daysOverdue}d
                        </span>
                      ) : (
                        <span className="text-green-600 font-medium text-xs">On time</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          "inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
                          getOverdueClass(row.status)
                        )}
                      >
                        {getOverdueLabel(row.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 bg-gray-50">
                  <td colSpan={2} className="px-4 py-3 font-semibold text-gray-700 text-sm">
                    Total Outstanding
                  </td>
                  <td className="px-4 py-3 text-right font-black text-gray-900 text-sm tabular-nums">
                    {formatInr(totalOutstanding)}
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top Profitable Orders */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Top 5 Most Profitable Orders</CardTitle>
            <Link
              href="/finance/profitability"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View all styles
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Style
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    FOB Value
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    COGS
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Margin %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {TOP_ORDERS.map((row, idx) => (
                  <tr key={row.orderNumber} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                            idx === 0
                              ? "bg-yellow-100 text-yellow-700"
                              : idx === 1
                              ? "bg-gray-100 text-gray-600"
                              : idx === 2
                              ? "bg-orange-100 text-orange-600"
                              : "bg-gray-50 text-gray-400"
                          )}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-mono text-xs text-blue-600 font-semibold">
                          {row.orderNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.buyer}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[160px] truncate">
                      {row.style}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                      {formatInr(row.fobValue, true)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-500">
                      {formatInr(row.cogs, true)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-green-700">
                      {formatInr(row.profit, true)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700 min-w-[48px]">
                        {row.marginPct.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
