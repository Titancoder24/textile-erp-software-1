"use client";

import * as React from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  AlertTriangle,
  Award,
  BarChart3,
  Download,
} from "lucide-react";
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Mock Data - Indian textile suppliers
// ---------------------------------------------------------------------------

interface SupplierScore {
  id: string;
  name: string;
  code: string;
  category: "Fabric" | "Yarn" | "Trims" | "Chemicals" | "Accessories";
  deliveryAdherence: number; // % on-time
  qualityPassRate: number; // % accepted in GRN
  priceCompetitiveness: number; // 1-5
  responsiveness: number; // 1-5
  documentAccuracy: number; // 1-5
  overallScore: number; // 0-100
  trend: "up" | "down" | "stable";
  tier: "gold" | "silver" | "bronze" | "probation";
  ordersThisQuarter: number;
  avgLeadTimeDays: number;
  totalPurchaseValue: number; // INR
  lastSupplyDate: string;
  rejectionLastQuarter: number; // %
}

const MOCK_SUPPLIERS: SupplierScore[] = [
  {
    id: "1",
    name: "Vardhman Textiles",
    code: "SUP-VTL",
    category: "Fabric",
    deliveryAdherence: 94,
    qualityPassRate: 97,
    priceCompetitiveness: 5,
    responsiveness: 5,
    documentAccuracy: 5,
    overallScore: 92,
    trend: "up",
    tier: "gold",
    ordersThisQuarter: 18,
    avgLeadTimeDays: 12,
    totalPurchaseValue: 48500000,
    lastSupplyDate: "2026-02-22",
    rejectionLastQuarter: 1.2,
  },
  {
    id: "2",
    name: "Alok Industries",
    code: "SUP-ALK",
    category: "Fabric",
    deliveryAdherence: 82,
    qualityPassRate: 91,
    priceCompetitiveness: 4,
    responsiveness: 3,
    documentAccuracy: 4,
    overallScore: 78,
    trend: "stable",
    tier: "silver",
    ordersThisQuarter: 12,
    avgLeadTimeDays: 16,
    totalPurchaseValue: 31200000,
    lastSupplyDate: "2026-02-18",
    rejectionLastQuarter: 3.8,
  },
  {
    id: "3",
    name: "SRF Limited",
    code: "SUP-SRF",
    category: "Chemicals",
    deliveryAdherence: 88,
    qualityPassRate: 96,
    priceCompetitiveness: 3,
    responsiveness: 4,
    documentAccuracy: 5,
    overallScore: 85,
    trend: "up",
    tier: "gold",
    ordersThisQuarter: 9,
    avgLeadTimeDays: 8,
    totalPurchaseValue: 12800000,
    lastSupplyDate: "2026-02-24",
    rejectionLastQuarter: 0.8,
  },
  {
    id: "4",
    name: "YKK India",
    code: "SUP-YKK",
    category: "Trims",
    deliveryAdherence: 96,
    qualityPassRate: 99,
    priceCompetitiveness: 3,
    responsiveness: 5,
    documentAccuracy: 5,
    overallScore: 91,
    trend: "stable",
    tier: "gold",
    ordersThisQuarter: 24,
    avgLeadTimeDays: 7,
    totalPurchaseValue: 8900000,
    lastSupplyDate: "2026-02-25",
    rejectionLastQuarter: 0.3,
  },
  {
    id: "5",
    name: "Archroma India",
    code: "SUP-ARC",
    category: "Chemicals",
    deliveryAdherence: 78,
    qualityPassRate: 88,
    priceCompetitiveness: 2,
    responsiveness: 3,
    documentAccuracy: 3,
    overallScore: 68,
    trend: "down",
    tier: "bronze",
    ordersThisQuarter: 7,
    avgLeadTimeDays: 14,
    totalPurchaseValue: 9600000,
    lastSupplyDate: "2026-02-10",
    rejectionLastQuarter: 5.6,
  },
  {
    id: "6",
    name: "Grasim Industries",
    code: "SUP-GRS",
    category: "Yarn",
    deliveryAdherence: 86,
    qualityPassRate: 94,
    priceCompetitiveness: 4,
    responsiveness: 4,
    documentAccuracy: 4,
    overallScore: 83,
    trend: "up",
    tier: "silver",
    ordersThisQuarter: 15,
    avgLeadTimeDays: 11,
    totalPurchaseValue: 26400000,
    lastSupplyDate: "2026-02-21",
    rejectionLastQuarter: 2.4,
  },
  {
    id: "7",
    name: "Coats India",
    code: "SUP-COT",
    category: "Accessories",
    deliveryAdherence: 56,
    qualityPassRate: 82,
    priceCompetitiveness: 2,
    responsiveness: 2,
    documentAccuracy: 2,
    overallScore: 51,
    trend: "down",
    tier: "probation",
    ordersThisQuarter: 4,
    avgLeadTimeDays: 21,
    totalPurchaseValue: 4100000,
    lastSupplyDate: "2026-01-30",
    rejectionLastQuarter: 8.2,
  },
  {
    id: "8",
    name: "Huntsman India",
    code: "SUP-HNT",
    category: "Chemicals",
    deliveryAdherence: 72,
    qualityPassRate: 86,
    priceCompetitiveness: 2,
    responsiveness: 3,
    documentAccuracy: 3,
    overallScore: 62,
    trend: "stable",
    tier: "bronze",
    ordersThisQuarter: 6,
    avgLeadTimeDays: 18,
    totalPurchaseValue: 7200000,
    lastSupplyDate: "2026-02-14",
    rejectionLastQuarter: 6.1,
  },
];

// Monthly rejection trends (last 6 months)
const REJECTION_TRENDS = [
  {
    month: "Sep",
    Vardhman: 1.8,
    Alok: 4.2,
    SRF: 0.6,
    YKK: 0.1,
    Archroma: 7.1,
    Grasim: 3.0,
  },
  {
    month: "Oct",
    Vardhman: 1.5,
    Alok: 3.9,
    SRF: 0.9,
    YKK: 0.2,
    Archroma: 6.8,
    Grasim: 2.7,
  },
  {
    month: "Nov",
    Vardhman: 1.2,
    Alok: 4.1,
    SRF: 0.7,
    YKK: 0.4,
    Archroma: 5.9,
    Grasim: 2.5,
  },
  {
    month: "Dec",
    Vardhman: 1.6,
    Alok: 3.8,
    SRF: 1.0,
    YKK: 0.3,
    Archroma: 6.2,
    Grasim: 2.8,
  },
  {
    month: "Jan",
    Vardhman: 1.3,
    Alok: 4.0,
    SRF: 0.8,
    YKK: 0.2,
    Archroma: 5.8,
    Grasim: 2.6,
  },
  {
    month: "Feb",
    Vardhman: 1.2,
    Alok: 3.8,
    SRF: 0.8,
    YKK: 0.3,
    Archroma: 5.6,
    Grasim: 2.4,
  },
];

// Delivery adherence bar data
const DELIVERY_BAR = MOCK_SUPPLIERS.map((s) => ({
  name: s.name.split(" ")[0],
  fullName: s.name,
  adherence: s.deliveryAdherence,
  target: 90,
}));

// Top 3 suppliers radar data
const TOP_SUPPLIERS = MOCK_SUPPLIERS.slice()
  .sort((a, b) => b.overallScore - a.overallScore)
  .slice(0, 3);

const RADAR_DATA = [
  {
    dimension: "Delivery",
    [TOP_SUPPLIERS[0].name.split(" ")[0]]: TOP_SUPPLIERS[0].deliveryAdherence,
    [TOP_SUPPLIERS[1].name.split(" ")[0]]: TOP_SUPPLIERS[1].deliveryAdherence,
    [TOP_SUPPLIERS[2].name.split(" ")[0]]: TOP_SUPPLIERS[2].deliveryAdherence,
  },
  {
    dimension: "Quality",
    [TOP_SUPPLIERS[0].name.split(" ")[0]]: TOP_SUPPLIERS[0].qualityPassRate,
    [TOP_SUPPLIERS[1].name.split(" ")[0]]: TOP_SUPPLIERS[1].qualityPassRate,
    [TOP_SUPPLIERS[2].name.split(" ")[0]]: TOP_SUPPLIERS[2].qualityPassRate,
  },
  {
    dimension: "Price",
    [TOP_SUPPLIERS[0].name.split(" ")[0]]: TOP_SUPPLIERS[0].priceCompetitiveness * 20,
    [TOP_SUPPLIERS[1].name.split(" ")[0]]: TOP_SUPPLIERS[1].priceCompetitiveness * 20,
    [TOP_SUPPLIERS[2].name.split(" ")[0]]: TOP_SUPPLIERS[2].priceCompetitiveness * 20,
  },
  {
    dimension: "Response",
    [TOP_SUPPLIERS[0].name.split(" ")[0]]: TOP_SUPPLIERS[0].responsiveness * 20,
    [TOP_SUPPLIERS[1].name.split(" ")[0]]: TOP_SUPPLIERS[1].responsiveness * 20,
    [TOP_SUPPLIERS[2].name.split(" ")[0]]: TOP_SUPPLIERS[2].responsiveness * 20,
  },
  {
    dimension: "Docs",
    [TOP_SUPPLIERS[0].name.split(" ")[0]]: TOP_SUPPLIERS[0].documentAccuracy * 20,
    [TOP_SUPPLIERS[1].name.split(" ")[0]]: TOP_SUPPLIERS[1].documentAccuracy * 20,
    [TOP_SUPPLIERS[2].name.split(" ")[0]]: TOP_SUPPLIERS[2].documentAccuracy * 20,
  },
];

const RADAR_COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTierConfig(tier: SupplierScore["tier"]) {
  const map: Record<
    SupplierScore["tier"],
    { cls: string; label: string; dotColor: string }
  > = {
    gold: {
      cls: "bg-yellow-100 text-yellow-800 border-yellow-300",
      label: "Gold",
      dotColor: "#eab308",
    },
    silver: {
      cls: "bg-gray-100 text-gray-700 border-gray-300",
      label: "Silver",
      dotColor: "#9ca3af",
    },
    bronze: {
      cls: "bg-orange-100 text-orange-700 border-orange-300",
      label: "Bronze",
      dotColor: "#f97316",
    },
    probation: {
      cls: "bg-red-100 text-red-700 border-red-300",
      label: "Probation",
      dotColor: "#ef4444",
    },
  };
  return map[tier];
}

function getScoreColor(score: number): string {
  if (score >= 85) return "#22c55e";
  if (score >= 70) return "#3b82f6";
  if (score >= 55) return "#f59e0b";
  return "#ef4444";
}

function getDeliveryAdherenceColor(pct: number): string {
  if (pct >= 90) return "text-green-700";
  if (pct >= 75) return "text-amber-600";
  return "text-red-600";
}

function formatInr(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
  return `₹${(amount / 1000).toFixed(0)}K`;
}

function RatingStars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            i < value
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-100 text-gray-200"
          )}
        />
      ))}
    </div>
  );
}

function TrendIcon({ trend }: { trend: SupplierScore["trend"] }) {
  if (trend === "up")
    return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (trend === "down")
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-gray-400" />;
}

function ScoreCircle({ score }: { score: number }) {
  const color = getScoreColor(score);
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-black text-sm tabular-nums text-white shadow-sm"
      style={{ backgroundColor: color }}
    >
      {score}
    </div>
  );
}

const PERIODS = ["This Month", "This Quarter", "Last Quarter", "YTD"];
const REJECTION_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#6366f1",
];

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------

function DeliveryTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;
  const sup = DELIVERY_BAR.find((d) => d.name === label);
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm text-xs">
      <p className="font-semibold text-gray-700 mb-1">{sup?.fullName ?? label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}%
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SupplierScorecardPage() {
  const [activePeriod, setActivePeriod] = React.useState("This Quarter");
  const [filterCategory, setFilterCategory] = React.useState("All");
  const [sortByScore, setSortByScore] = React.useState(true);

  const categories = [
    "All",
    ...Array.from(new Set(MOCK_SUPPLIERS.map((s) => s.category))).sort(),
  ];

  const filtered = React.useMemo(() => {
    let data = [...MOCK_SUPPLIERS];
    if (filterCategory !== "All") {
      data = data.filter((s) => s.category === filterCategory);
    }
    if (sortByScore) {
      data.sort((a, b) => b.overallScore - a.overallScore);
    } else {
      data.sort((a, b) => a.name.localeCompare(b.name));
    }
    return data;
  }, [filterCategory, sortByScore]);

  const topPerformer = [...MOCK_SUPPLIERS].sort((a, b) => b.overallScore - a.overallScore)[0];
  const avgDelivery = Math.round(
    MOCK_SUPPLIERS.reduce((s, sup) => s + sup.deliveryAdherence, 0) / MOCK_SUPPLIERS.length
  );
  const atRisk = MOCK_SUPPLIERS.filter((s) => s.overallScore < 60).length;
  const evaluated = MOCK_SUPPLIERS.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier Scorecard"
        description="Performance evaluation for vendor selection, negotiation, and risk management"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Purchase", href: "/purchase" },
          { label: "Supplier Scorecard" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePeriod(p)}
                  className={cn(
                    "px-3 py-2 text-xs font-medium transition-colors border-r border-gray-200 last:border-r-0",
                    activePeriod === p
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export Report
            </Button>
          </div>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            title: "Suppliers Evaluated",
            value: evaluated,
            sub: `${activePeriod}`,
            icon: BarChart3,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            title: "Top Performer",
            value: topPerformer.name.split(" ")[0],
            sub: `Score: ${topPerformer.overallScore}/100`,
            icon: Award,
            color: "text-yellow-600",
            bg: "bg-yellow-50",
          },
          {
            title: "Avg Delivery Score",
            value: `${avgDelivery}%`,
            sub: "on-time delivery rate",
            icon: TrendingUp,
            color: avgDelivery >= 85 ? "text-green-600" : "text-amber-500",
            bg: avgDelivery >= 85 ? "bg-green-50" : "bg-amber-50",
          },
          {
            title: "Suppliers at Risk",
            value: atRisk,
            sub: "score below 60",
            icon: AlertTriangle,
            color: atRisk > 0 ? "text-red-600" : "text-gray-400",
            bg: atRisk > 0 ? "bg-red-50" : "bg-gray-50",
          },
        ].map((card) => (
          <Card key={card.title}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 leading-tight">{card.title}</p>
                  <p className="mt-1 text-2xl font-black tabular-nums text-gray-900 truncate">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
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

      {/* Charts Row: Radar + Delivery Bar */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Radar Chart - Top 3 Suppliers */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top 3 Suppliers - Radar Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fontSize: 9, fill: "#9ca3af" }}
                  tickCount={4}
                />
                {TOP_SUPPLIERS.map((sup, idx) => (
                  <Radar
                    key={sup.id}
                    name={sup.name.split(" ")[0]}
                    dataKey={sup.name.split(" ")[0]}
                    stroke={RADAR_COLORS[idx]}
                    fill={RADAR_COLORS[idx]}
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                ))}
                <Tooltip
                  contentStyle={{
                    fontSize: 11,
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value) =>
                    TOP_SUPPLIERS.find(
                      (s) => s.name.split(" ")[0] === value
                    )?.name ?? value
                  }
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {TOP_SUPPLIERS.map((sup, idx) => (
                <div
                  key={sup.id}
                  className="rounded-lg p-2 text-center"
                  style={{ backgroundColor: `${RADAR_COLORS[idx]}10`, border: `1px solid ${RADAR_COLORS[idx]}30` }}
                >
                  <p className="text-xs font-semibold text-gray-700 truncate">
                    {sup.name.split(" ")[0]}
                  </p>
                  <p
                    className="text-base font-black tabular-nums"
                    style={{ color: RADAR_COLORS[idx] }}
                  >
                    {sup.overallScore}
                  </p>
                  <p className="text-[10px] text-gray-400">score</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Adherence Bar Chart */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Delivery Adherence by Supplier</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={DELIVERY_BAR}
                layout="vertical"
                margin={{ left: 8, right: 30, top: 4, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `${v}%`}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  width={72}
                  tickLine={false}
                />
                <Tooltip content={<DeliveryTooltip />} />
                <Bar
                  dataKey="target"
                  fill="#e5e7eb"
                  barSize={12}
                  name="Target (90%)"
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="adherence"
                  barSize={12}
                  name="Actual"
                  radius={[0, 4, 4, 0]}
                  label={{
                    position: "right",
                    fontSize: 10,
                    formatter: (v: number) => `${v}%`,
                    fill: "#6b7280",
                  }}
                >
                  {DELIVERY_BAR.map((entry, index) => (
                    <rect
                      key={`bar-${index}`}
                      fill={
                        entry.adherence >= 90
                          ? "#22c55e"
                          : entry.adherence >= 75
                          ? "#f59e0b"
                          : "#ef4444"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Main Scorecard Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Supplier Scorecard Details</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>Category:</span>
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFilterCategory(c)}
                    className={cn(
                      "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                      filterCategory === c
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setSortByScore((v) => !v)}
                className="text-xs text-blue-600 hover:underline"
              >
                {sortByScore ? "Sort: A-Z" : "Sort: Score"}
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quality
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rejection
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchase Value
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((sup) => {
                  const tier = getTierConfig(sup.tier);
                  return (
                    <tr
                      key={sup.id}
                      className={cn(
                        "hover:bg-gray-50/60 transition-colors",
                        sup.tier === "probation" && "bg-red-50/20"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {sup.name}
                          </p>
                          <p className="text-[11px] text-gray-400 font-mono">
                            {sup.code}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {sup.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            "font-bold tabular-nums text-sm",
                            getDeliveryAdherenceColor(sup.deliveryAdherence)
                          )}
                        >
                          {sup.deliveryAdherence}%
                        </span>
                        <div className="mt-1 w-16 mx-auto h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${sup.deliveryAdherence}%`,
                              backgroundColor:
                                sup.deliveryAdherence >= 90
                                  ? "#22c55e"
                                  : sup.deliveryAdherence >= 75
                                  ? "#f59e0b"
                                  : "#ef4444",
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            "font-bold tabular-nums text-sm",
                            sup.qualityPassRate >= 95
                              ? "text-green-700"
                              : sup.qualityPassRate >= 88
                              ? "text-amber-600"
                              : "text-red-600"
                          )}
                        >
                          {sup.qualityPassRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <RatingStars value={sup.priceCompetitiveness} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <RatingStars value={sup.responsiveness} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={cn(
                            "tabular-nums font-semibold text-sm",
                            sup.rejectionLastQuarter < 2
                              ? "text-green-700"
                              : sup.rejectionLastQuarter < 5
                              ? "text-amber-600"
                              : "text-red-600"
                          )}
                        >
                          {sup.rejectionLastQuarter.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-700 text-xs font-medium">
                        {formatInr(sup.totalPurchaseValue)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <ScoreCircle score={sup.overallScore} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <TrendIcon trend={sup.trend} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
                            tier.cls
                          )}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: tier.dotColor }}
                          />
                          {tier.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Rejection Trend Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Rejection Trend - Last 6 Months (% of received quantity)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={REJECTION_TRENDS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}%`}
                tickLine={false}
                domain={[0, 10]}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}%`, "Rejection Rate"]}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {["Vardhman", "Alok", "SRF", "YKK", "Archroma", "Grasim"].map(
                (name, idx) => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={REJECTION_COLORS[idx]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                )
              )}
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5">
            <p className="text-xs font-medium text-amber-800">
              Archroma India shows consistently high rejection rates (5-7%). Recommend audit
              visit and quality improvement plan before next contract renewal.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tier Legend + Action Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            {
              tier: "gold" as const,
              count: MOCK_SUPPLIERS.filter((s) => s.tier === "gold").length,
              desc: "Score >= 85. Preferred supplier. Priority allocation.",
              action: "Increase share of business",
            },
            {
              tier: "silver" as const,
              count: MOCK_SUPPLIERS.filter((s) => s.tier === "silver").length,
              desc: "Score 70-84. Reliable supplier with improvement areas.",
              action: "Development plan in place",
            },
            {
              tier: "bronze" as const,
              count: MOCK_SUPPLIERS.filter((s) => s.tier === "bronze").length,
              desc: "Score 55-69. Needs monitoring and targeted improvement.",
              action: "Corrective action required",
            },
            {
              tier: "probation" as const,
              count: MOCK_SUPPLIERS.filter((s) => s.tier === "probation").length,
              desc: "Score < 55. At risk of delisting. Urgent intervention needed.",
              action: "Escalate to management",
            },
          ] as const
        ).map((item) => {
          const cfg = getTierConfig(item.tier);
          return (
            <Card
              key={item.tier}
              className={cn(
                "border",
                item.tier === "gold"
                  ? "border-yellow-200"
                  : item.tier === "silver"
                  ? "border-gray-200"
                  : item.tier === "bronze"
                  ? "border-orange-200"
                  : "border-red-200"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                      cfg.cls
                    )}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: cfg.dotColor }}
                    />
                    {cfg.label}
                  </span>
                  <span
                    className="text-xl font-black tabular-nums"
                    style={{ color: cfg.dotColor }}
                  >
                    {item.count}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                <p className="mt-2 text-xs font-semibold text-gray-700">{item.action}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
