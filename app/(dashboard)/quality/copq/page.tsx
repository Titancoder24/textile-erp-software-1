"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import {
  Download,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  RotateCcw,
  PackageX,
  ShoppingCart,
  Percent,
} from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* ---------- Types ---------- */

interface StageRow {
  stage: string;
  rejectedPieces: number;
  avgCostPerPiece: number;
  totalCost: number;
  pctOfTotal: number;
}

interface BuyerCOPQ {
  buyer: string;
  copq: number;
}

interface StyleCOPQ {
  style: string;
  copq: number;
}

interface RootCause {
  defectType: string;
  occurrences: number;
  costImpact: number;
  capaStatus: "Open" | "In Progress" | "Closed";
}

/* ---------- Mock data ---------- */

const COPQ_TREND = [
  { month: "Mar 25", copq: 320000, target: 250000 },
  { month: "Apr 25", copq: 410000, target: 250000 },
  { month: "May 25", copq: 380000, target: 250000 },
  { month: "Jun 25", copq: 460000, target: 250000 },
  { month: "Jul 25", copq: 510000, target: 250000 },
  { month: "Aug 25", copq: 390000, target: 250000 },
  { month: "Sep 25", copq: 350000, target: 250000 },
  { month: "Oct 25", copq: 480000, target: 250000 },
  { month: "Nov 25", copq: 420000, target: 250000 },
  { month: "Dec 25", copq: 440000, target: 250000 },
  { month: "Jan 26", copq: 395000, target: 250000 },
  { month: "Feb 26", copq: 420000, target: 250000 },
];

const COPQ_BREAKDOWN = [
  { label: "Internal Failure", value: 48, color: "#dc2626" },
  { label: "External Failure", value: 22, color: "#f97316" },
  { label: "Appraisal", value: 18, color: "#eab308" },
  { label: "Prevention", value: 12, color: "#22c55e" },
];

const STAGE_ROWS: StageRow[] = [
  { stage: "Cutting", rejectedPieces: 210, avgCostPerPiece: 45, totalCost: 9450, pctOfTotal: 2.25 },
  { stage: "Inline (Sewing)", rejectedPieces: 1480, avgCostPerPiece: 120, totalCost: 177600, pctOfTotal: 42.3 },
  { stage: "Endline", rejectedPieces: 620, avgCostPerPiece: 145, totalCost: 89900, pctOfTotal: 21.4 },
  { stage: "Final Inspection", rejectedPieces: 340, avgCostPerPiece: 188, totalCost: 63920, pctOfTotal: 15.2 },
  { stage: "Buyer Return", rejectedPieces: 98, avgCostPerPiece: 810, totalCost: 79380, pctOfTotal: 18.9 },
];

const BUYER_COPQ: BuyerCOPQ[] = [
  { buyer: "H&M Group", copq: 118000 },
  { buyer: "Zara / Inditex", copq: 94000 },
  { buyer: "Next PLC", copq: 72000 },
  { buyer: "Primark", copq: 65000 },
  { buyer: "C&A Europe", copq: 48000 },
  { buyer: "Marks & Spencer", copq: 23000 },
];

const STYLE_COPQ: StyleCOPQ[] = [
  { style: "ST-4421 Polo Collar T-shirt", copq: 87000 },
  { style: "ST-4398 Fleece Hoodie", copq: 74000 },
  { style: "ST-4412 Woven Trouser", copq: 61000 },
  { style: "ST-4405 Jersey Dress", copq: 52000 },
  { style: "ST-4380 Cargo Shorts", copq: 45000 },
  { style: "ST-4367 Denim Jacket", copq: 38000 },
  { style: "ST-4355 Knit Sweatshirt", copq: 31000 },
  { style: "ST-4340 Oxford Shirt", copq: 27000 },
  { style: "ST-4322 Leggings", copq: 22000 },
  { style: "ST-4310 Tank Top", copq: 18000 },
];

const ROOT_CAUSES: RootCause[] = [
  { defectType: "Broken stitch / skip stitch", occurrences: 412, costImpact: 98400, capaStatus: "In Progress" },
  { defectType: "Shade variation", occurrences: 298, costImpact: 71200, capaStatus: "Open" },
  { defectType: "Puckering / uneven seam", occurrences: 251, costImpact: 50200, capaStatus: "Closed" },
  { defectType: "Needle hole / damage", occurrences: 189, costImpact: 37800, capaStatus: "In Progress" },
  { defectType: "Wrong measurement", occurrences: 164, costImpact: 49200, capaStatus: "Open" },
  { defectType: "Stain / soiling", occurrences: 112, costImpact: 22400, capaStatus: "Closed" },
  { defectType: "Missing / wrong trim", occurrences: 97, costImpact: 19400, capaStatus: "In Progress" },
  { defectType: "Open seam", occurrences: 84, costImpact: 16800, capaStatus: "Closed" },
];

/* ---------- Helpers ---------- */

function formatINR(amount: number): string {
  if (amount >= 100000) return `\u20B9${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `\u20B9${(amount / 1000).toFixed(0)}K`;
  return `\u20B9${amount.toLocaleString("en-IN")}`;
}

function formatINRFull(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function stageBgColor(pct: number): string {
  if (pct >= 35) return "bg-red-100 text-red-800";
  if (pct >= 20) return "bg-orange-100 text-orange-800";
  if (pct >= 10) return "bg-yellow-100 text-yellow-800";
  return "bg-gray-100 text-gray-600";
}

function capaStatusBadge(status: RootCause["capaStatus"]) {
  if (status === "Open") return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Open</Badge>;
  if (status === "In Progress") return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">In Progress</Badge>;
  return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Closed</Badge>;
}

/* ---------- Component ---------- */

export default function COPQPage() {
  const [dateFrom, setDateFrom] = React.useState("2026-01-01");
  const [dateTo, setDateTo] = React.useState("2026-02-26");

  const totalCOPQ = 420000;
  const reworkCost = 180000;
  const rejectionCost = 140000;
  const buyerReturns = 78000;
  const copqPctRevenue = 2.3;

  const totalStageCost = STAGE_ROWS.reduce((s, r) => s + r.totalCost, 0);
  const pieTotal = COPQ_BREAKDOWN.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Cost of Poor Quality (COPQ)"
        description="Financial impact of quality failures across all production stages"
        breadcrumb={[
          { label: "Quality" },
          { label: "COPQ Analysis" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-gray-500">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-gray-500">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total COPQ This Month"
          value={`\u20B94.2L`}
          change={-8.5}
          changeLabel="vs last month"
          icon={<DollarSign className="h-5 w-5" />}
          color="red"
        />
        <StatCard
          title="Rework Cost"
          value={`\u20B91.8L`}
          change={-12.0}
          changeLabel="vs last month"
          icon={<RotateCcw className="h-5 w-5" />}
          color="orange"
        />
        <StatCard
          title="Rejection Cost"
          value={`\u20B91.4L`}
          change={-5.2}
          changeLabel="vs last month"
          icon={<PackageX className="h-5 w-5" />}
          color="orange"
        />
        <StatCard
          title="Buyer Returns"
          value={`\u20B978K`}
          change={3.1}
          changeLabel="vs last month"
          icon={<ShoppingCart className="h-5 w-5" />}
          color="red"
        />
        <StatCard
          title="COPQ as % of Revenue"
          value="2.3%"
          change={-0.4}
          changeLabel="vs last month"
          icon={<Percent className="h-5 w-5" />}
          color="purple"
        />
      </div>

      {/* Row 2: COPQ Trend + Breakdown Donut */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* COPQ Trend Line Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">
              COPQ Monthly Trend (Last 12 Months)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={COPQ_TREND}
                margin={{ top: 8, right: 16, left: -8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 100000).toFixed(1)}L`}
                  dx={-4}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                    padding: "8px 12px",
                  }}
                  formatter={(value: number, name: string) => [
                    formatINRFull(value),
                    name === "copq" ? "COPQ" : "Target",
                  ]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                  formatter={(value) => (value === "copq" ? "Actual COPQ" : "Target")}
                />
                <ReferenceLine
                  y={250000}
                  stroke="#16a34a"
                  strokeDasharray="6 3"
                  label={{ value: "Target", fill: "#16a34a", fontSize: 10, position: "insideTopRight" }}
                />
                <Line
                  type="monotone"
                  dataKey="copq"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#dc2626", strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  name="copq"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#16a34a"
                  strokeWidth={1.5}
                  strokeDasharray="6 3"
                  dot={false}
                  name="target"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* COPQ Breakdown Donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">
              COPQ Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={COPQ_BREAKDOWN}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="label"
                >
                  {COPQ_BREAKDOWN.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
                  formatter={(v: number) => [`${v}%`, ""]}
                />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                  <tspan x="50%" dy="-6" style={{ fontSize: 18, fontWeight: 700, fill: "#111827" }}>
                    {formatINR(totalCOPQ)}
                  </tspan>
                  <tspan x="50%" dy="18" style={{ fontSize: 11, fill: "#9ca3af" }}>
                    Total COPQ
                  </tspan>
                </text>
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-2">
              {COPQ_BREAKDOWN.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-600">{item.label}</span>
                  </div>
                  <span className="font-medium text-gray-900 tabular-nums">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Rejection Cost by Stage */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900">
            Rejection Cost by Production Stage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-left font-medium text-gray-500">Stage</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Rejected Pieces</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Avg Cost / Piece</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Total Cost</th>
                  <th className="pb-3 text-right font-medium text-gray-500">% of Total COPQ</th>
                  <th className="pb-3 text-left pl-4 font-medium text-gray-500">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {STAGE_ROWS.map((row) => (
                  <tr key={row.stage} className="hover:bg-gray-50/50">
                    <td className="py-3 font-medium text-gray-900">{row.stage}</td>
                    <td className="py-3 text-right tabular-nums text-gray-700">
                      {row.rejectedPieces.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 text-right tabular-nums text-gray-700">
                      {formatINRFull(row.avgCostPerPiece)}
                    </td>
                    <td className="py-3 text-right tabular-nums font-semibold text-gray-900">
                      {formatINRFull(row.totalCost)}
                    </td>
                    <td className="py-3 text-right tabular-nums text-gray-700">
                      {row.pctOfTotal.toFixed(1)}%
                    </td>
                    <td className="py-3 pl-4">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
                          stageBgColor(row.pctOfTotal)
                        )}
                      >
                        {row.pctOfTotal >= 35
                          ? "Critical"
                          : row.pctOfTotal >= 20
                          ? "High"
                          : row.pctOfTotal >= 10
                          ? "Medium"
                          : "Low"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 bg-gray-50/60">
                  <td className="py-3 font-semibold text-gray-900">Total</td>
                  <td className="py-3 text-right tabular-nums font-semibold text-gray-900">
                    {STAGE_ROWS.reduce((s, r) => s + r.rejectedPieces, 0).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3" />
                  <td className="py-3 text-right tabular-nums font-bold text-red-700">
                    {formatINRFull(totalStageCost)}
                  </td>
                  <td className="py-3 text-right tabular-nums font-semibold text-gray-900">100%</td>
                  <td className="py-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Row 4: COPQ by Buyer + COPQ by Style */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* COPQ by Buyer */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">
              COPQ by Buyer
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={BUYER_COPQ}
                margin={{ top: 4, right: 8, left: -8, bottom: 0 }}
                barCategoryGap="30%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="buyer"
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                  dx={-4}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                    padding: "8px 12px",
                  }}
                  formatter={(v: number) => [formatINRFull(v), "COPQ"]}
                />
                <Bar dataKey="copq" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {BUYER_COPQ.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === 0 ? "#dc2626" : i === 1 ? "#f97316" : i === 2 ? "#eab308" : "#94a3b8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* COPQ by Style - horizontal bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">
              Top 10 Styles by Rejection Cost
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={STYLE_COPQ}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                barCategoryGap="25%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                />
                <YAxis
                  type="category"
                  dataKey="style"
                  tick={{ fontSize: 9, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  width={140}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                    padding: "8px 12px",
                  }}
                  formatter={(v: number) => [formatINRFull(v), "COPQ"]}
                />
                <Bar dataKey="copq" radius={[0, 4, 4, 0]} maxBarSize={18}>
                  {STYLE_COPQ.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        i < 3
                          ? "#dc2626"
                          : i < 6
                          ? "#f97316"
                          : "#94a3b8"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 5: Root Cause Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900">
            Root Cause Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-left font-medium text-gray-500">Defect Type</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Occurrences</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Cost Impact</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Cost / Occurrence</th>
                  <th className="pb-3 text-center font-medium text-gray-500">CAPA Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ROOT_CAUSES.map((row) => (
                  <tr key={row.defectType} className="hover:bg-gray-50/50">
                    <td className="py-3 font-medium text-gray-900">{row.defectType}</td>
                    <td className="py-3 text-right tabular-nums text-gray-700">
                      {row.occurrences.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 text-right tabular-nums font-semibold text-red-700">
                      {formatINRFull(row.costImpact)}
                    </td>
                    <td className="py-3 text-right tabular-nums text-gray-500 text-xs">
                      {formatINRFull(Math.round(row.costImpact / row.occurrences))}
                    </td>
                    <td className="py-3 text-center">{capaStatusBadge(row.capaStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Financial Impact Summary Box */}
      <Card className="border-blue-200 bg-blue-50/60">
        <CardContent className="flex items-start gap-4 pt-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-blue-900">Financial Impact Simulation</p>
            <p className="text-sm text-blue-800">
              Current defect rate is{" "}
              <span className="font-bold">3.2%</span>. Reducing it by{" "}
              <span className="font-bold">1%</span> would eliminate approximately{" "}
              <span className="font-bold">2,100 defective pieces per month</span> and save an
              estimated{" "}
              <span className="font-bold text-green-700">\u20B91,31,250 per month</span>{" "}
              (\u20B915.75L annually) based on current average cost-per-defect of \u20B9625.
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Calculation: 2,100 pieces x \u20B9625 avg cost = \u20B913.1L/month reduction. Includes rework
              labour, material waste, and re-inspection cost.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Alert Banner if COPQ above target */}
      <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
        <div>
          <p className="text-sm font-semibold text-orange-800">COPQ Exceeds Target</p>
          <p className="text-xs text-orange-700">
            Current COPQ of \u20B94.2L is <strong>68% above</strong> the monthly target of \u20B92.5L. Inline
            sewing and Final Inspection stages account for 57.5% of total failure cost. Immediate
            corrective action on broken stitch and shade variation defects recommended.
          </p>
        </div>
      </div>
    </div>
  );
}
