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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
} from "recharts";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompany } from "@/contexts/company-context";
import { getSupplierScorecard } from "@/lib/actions/suppliers";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SupplierScore {
  id: string;
  name: string;
  code: string;
  category: string;
  deliveryAdherence: number;
  qualityPassRate: number;
  priceCompetitiveness: number;
  responsiveness: number;
  documentAccuracy: number;
  overallScore: number;
  trend: "up" | "down" | "stable";
  tier: "gold" | "silver" | "bronze" | "probation";
  ordersThisQuarter: number;
  avgLeadTimeDays: number;
  totalPurchaseValue: number;
  lastSupplyDate: string;
  rejectionLastQuarter: number;
}

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
const RADAR_COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------

function DeliveryTooltip({ active, payload, label }: {
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
  const { companyId } = useCompany();
  const [activePeriod, setActivePeriod] = React.useState("This Quarter");
  const [filterCategory, setFilterCategory] = React.useState("All");
  const [sortByScore, setSortByScore] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [suppliers, setSuppliers] = React.useState<SupplierScore[]>([]);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSupplierScorecard(companyId);
      if (result.error) {
        toast.error("Failed to load scorecard: " + result.error);
      } else {
        setSuppliers((result.data ?? []) as SupplierScore[]);
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const categories = React.useMemo(() => {
    return [
      "All",
      ...Array.from(new Set(suppliers.map((s) => s.category))).sort(),
    ];
  }, [suppliers]);

  const filtered = React.useMemo(() => {
    let data = [...suppliers];
    if (filterCategory !== "All") {
      data = data.filter((s) => s.category === filterCategory);
    }
    if (sortByScore) {
      data.sort((a, b) => b.overallScore - a.overallScore);
    } else {
      data.sort((a, b) => a.name.localeCompare(b.name));
    }
    return data;
  }, [suppliers, filterCategory, sortByScore]);

  const topPerformer = React.useMemo(
    () => [...suppliers].sort((a, b) => b.overallScore - a.overallScore)[0],
    [suppliers]
  );
  const avgDelivery = React.useMemo(
    () =>
      suppliers.length > 0
        ? Math.round(
            suppliers.reduce((s, sup) => s + sup.deliveryAdherence, 0) / suppliers.length
          )
        : 0,
    [suppliers]
  );
  const atRisk = React.useMemo(
    () => suppliers.filter((s) => s.overallScore < 60).length,
    [suppliers]
  );
  const evaluated = suppliers.length;

  // Delivery bar data
  const deliveryBar = React.useMemo(
    () =>
      suppliers.map((s) => ({
        name: s.name.length > 12 ? s.name.slice(0, 12) + "..." : s.name,
        fullName: s.name,
        adherence: s.deliveryAdherence,
        target: 90,
      })),
    [suppliers]
  );

  // Top 3 for radar
  const top3 = React.useMemo(
    () =>
      [...suppliers]
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, 3),
    [suppliers]
  );

  const radarData = React.useMemo(() => {
    if (top3.length === 0) return [];
    const dimensions = [
      { key: "deliveryAdherence", label: "Delivery" },
      { key: "qualityPassRate", label: "Quality" },
      { key: "priceCompetitiveness", label: "Price", scale: 20 },
      { key: "responsiveness", label: "Response", scale: 20 },
      { key: "documentAccuracy", label: "Docs", scale: 20 },
    ];
    return dimensions.map((dim) => {
      const row: Record<string, string | number> = { dimension: dim.label };
      top3.forEach((sup) => {
        const shortName = sup.name.split(" ")[0];
        const val = sup[dim.key as keyof SupplierScore] as number;
        row[shortName] = dim.scale ? val * dim.scale : val;
      });
      return row;
    });
  }, [top3]);

  if (loading) {
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
        />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      </div>
    );
  }

  if (suppliers.length === 0) {
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
        />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BarChart3 className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No suppliers found</p>
          <p className="text-xs text-gray-400">Add suppliers to see their performance scorecard</p>
        </div>
      </div>
    );
  }

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
            value: topPerformer?.name.split(" ")[0] ?? "—",
            sub: topPerformer ? `Score: ${topPerformer.overallScore}/100` : "—",
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
            {top3.length >= 3 && radarData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
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
                    {top3.map((sup, idx) => (
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
                        top3.find(
                          (s) => s.name.split(" ")[0] === value
                        )?.name ?? value
                      }
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {top3.map((sup, idx) => (
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
              </>
            ) : (
              <p className="text-sm text-gray-400 py-10 text-center">
                Need at least 3 suppliers for radar chart
              </p>
            )}
          </CardContent>
        </Card>

        {/* Delivery Adherence Bar Chart */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Delivery Adherence by Supplier</CardTitle>
          </CardHeader>
          <CardContent>
            {deliveryBar.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={deliveryBar}
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
                    width={100}
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
                      formatter: (v) => `${v}%`,
                      fill: "#6b7280",
                    }}
                  >
                    {deliveryBar.map((entry, index) => (
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
            ) : (
              <p className="text-sm text-gray-400 py-10 text-center">No delivery data available</p>
            )}
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

      {/* Tier Legend + Action Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            {
              tier: "gold" as const,
              count: suppliers.filter((s) => s.tier === "gold").length,
              desc: "Score >= 85. Preferred supplier. Priority allocation.",
              action: "Increase share of business",
            },
            {
              tier: "silver" as const,
              count: suppliers.filter((s) => s.tier === "silver").length,
              desc: "Score 70-84. Reliable supplier with improvement areas.",
              action: "Development plan in place",
            },
            {
              tier: "bronze" as const,
              count: suppliers.filter((s) => s.tier === "bronze").length,
              desc: "Score 55-69. Needs monitoring and targeted improvement.",
              action: "Corrective action required",
            },
            {
              tier: "probation" as const,
              count: suppliers.filter((s) => s.tier === "probation").length,
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
