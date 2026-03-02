"use client";

import * as React from "react";
import {
  Factory,
  TrendingUp,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Search,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompany } from "@/contexts/company-context";
import { getCapacityOverview } from "@/lib/actions/capacity";
import type { CapacityOverviewLine } from "@/lib/actions/capacity";

// ---------------------------------------------------------------------------
// Product types for feasibility checker
// ---------------------------------------------------------------------------

const PRODUCT_TYPES = [
  { label: "Basic T-Shirt (SMV 8)", value: "basic_tee", smv: 8 },
  { label: "Woven Shirt (SMV 18)", value: "woven_shirt", smv: 18 },
  { label: "Denim Jeans (SMV 28)", value: "denim_jeans", smv: 28 },
  { label: "Hoodie (SMV 35)", value: "hoodie", smv: 35 },
  { label: "Kids T-Shirt (SMV 6)", value: "kids_tee", smv: 6 },
  { label: "Ladies Blouse (SMV 22)", value: "ladies_blouse", smv: 22 },
];

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

function getUtilizationColor(pct: number): string {
  if (pct > 90) return "#ef4444";
  if (pct > 75) return "#f59e0b";
  return "#22c55e";
}

function getStatusBadge(status: "available" | "moderate" | "overloaded") {
  const map = {
    available: "bg-green-100 text-green-700 border-green-200",
    moderate: "bg-amber-100 text-amber-700 border-amber-200",
    overloaded: "bg-red-100 text-red-700 border-red-200",
  };
  const labels = {
    available: "Available",
    moderate: "Moderate",
    overloaded: "Overloaded",
  };
  return { className: map[status], label: labels[status] };
}

function computeFeasibilityResult(
  lines: CapacityOverviewLine[],
  quantity: number,
  smv: number,
  deliveryDateStr: string
): {
  feasible: boolean;
  message: string;
  availableLines: { lineName: string; completionDate: string; freeCapacity: number }[];
  earliestDate: string;
  recommendedLine: string;
} {
  const today = new Date();
  const deliveryDate = new Date(deliveryDateStr);

  const sewingLines = lines.filter(
    (l) => l.department !== "Cutting" && l.department !== "Finishing"
  );

  const availableLines = sewingLines.map((line) => {
    const operatorsPerLine = line.totalOperators;
    const minutesPerDay = 480;
    const capacity = Math.floor((operatorsPerLine * minutesPerDay) / smv);
    const freeCapacityPct = Math.max(0, 100 - line.currentUtilization);
    const freeCapacity = Math.floor((capacity * freeCapacityPct) / 100);
    const daysNeeded = freeCapacity > 0 ? Math.ceil(quantity / freeCapacity) : 999;
    const completionDate = new Date(today);
    completionDate.setDate(today.getDate() + daysNeeded + 3); // +3 for finishing/packing

    return {
      lineName: line.lineName,
      completionDate: completionDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      completionTimestamp: completionDate.getTime(),
      freeCapacity,
      daysNeeded,
    };
  });

  const sorted = [...availableLines].sort(
    (a, b) => a.completionTimestamp - b.completionTimestamp
  );
  const best = sorted[0];
  const feasible = best && best.completionTimestamp <= deliveryDate.getTime();
  const earliestDate = best
    ? best.completionDate
    : "No capacity available";

  return {
    feasible,
    message: feasible
      ? `FEASIBLE - Can be delivered by ${best.completionDate} on ${best.lineName}`
      : `INFEASIBLE - Earliest possible: ${earliestDate}`,
    availableLines: sorted.slice(0, 4).map((l) => ({
      lineName: l.lineName,
      completionDate: l.completionDate,
      freeCapacity: l.freeCapacity,
    })),
    earliestDate,
    recommendedLine: best?.lineName ?? "",
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CapacityBar({ value }: { value: number }) {
  const color = getUtilizationColor(value);
  const clampedValue = Math.min(value, 100);
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${clampedValue}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="text-xs font-bold tabular-nums w-10"
        style={{ color }}
      >
        {value}%
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CapacityPlanningPage() {
  const { companyId } = useCompany();
  const [lines, setLines] = React.useState<CapacityOverviewLine[]>([]);
  const [weeks, setWeeks] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [selectedProduct, setSelectedProduct] = React.useState(PRODUCT_TYPES[0]);
  const [orderQty, setOrderQty] = React.useState(15000);
  const [deliveryDate, setDeliveryDate] = React.useState("2026-03-28");
  const [feasibilityResult, setFeasibilityResult] = React.useState<ReturnType<
    typeof computeFeasibilityResult
  > | null>(null);
  const [showFeasibility, setShowFeasibility] = React.useState(false);

  // Fetch capacity data
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await getCapacityOverview(companyId);
      if (error) {
        toast.error("Failed to load capacity data", { description: error });
        return;
      }
      if (data) {
        setLines(data.lines);
        setWeeks(data.weeks);
      }
    } catch {
      toast.error("Failed to load capacity data");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Build chart data from lines
  const ganttData = React.useMemo(() => {
    if (weeks.length === 0 || lines.length === 0) return [];
    return weeks.map((week, wi) => {
      const entry: Record<string, string | number> = { week };
      lines.forEach((line) => {
        entry[line.lineName] = line.weeklyData[wi]?.utilization ?? 0;
      });
      return entry;
    });
  }, [lines, weeks]);

  // Build summary table data
  const lineSummary = React.useMemo(() => {
    return lines.map((l) => ({
      lineName: l.lineName,
      department: l.department,
      capacityPerDay: l.capacityPerDay,
      thisWeek: l.weeklyData[0]?.allocated ?? 0,
      nextWeek: l.weeklyData[1]?.allocated ?? 0,
      week3: l.weeklyData[2]?.allocated ?? 0,
      week4: l.weeklyData[3]?.allocated ?? 0,
      currentPct: l.weeklyData[0]?.utilization ?? 0,
      status: l.status,
    }));
  }, [lines]);

  // Summary stats
  const totalCapacityPieces = lines.reduce(
    (sum, l) => sum + l.capacityPerDay * 7,
    0
  );
  const avgUtilization = lines.length > 0
    ? Math.round(
        lines.reduce((sum, l) => sum + l.currentUtilization, 0) /
          lines.length
      )
    : 0;
  const overloadedLines = lines.filter(
    (l) => l.status === "overloaded"
  ).length;
  const totalFree = lines.filter((l) => l.status === "available").reduce(
    (sum, l) =>
      sum + Math.floor((l.capacityPerDay * 7 * (100 - l.currentUtilization)) / 100),
    0
  );

  function handleCheckFeasibility() {
    const result = computeFeasibilityResult(
      lines,
      orderQty,
      selectedProduct.smv,
      deliveryDate
    );
    setFeasibilityResult(result);
    setShowFeasibility(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Capacity Planning"
        description="Visualize line loading, check delivery feasibility, and prevent overcommitment"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Capacity Planning" },
        ]}
        actions={
          <Button
            onClick={() => setShowFeasibility((v) => !v)}
            variant="outline"
          >
            <Search className="mr-2 h-4 w-4" />
            Check Feasibility
          </Button>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            title: "Factory Capacity",
            value: `${(totalCapacityPieces / 1000).toFixed(0)}K pcs/wk`,
            sub: `across ${lines.length} lines`,
            icon: Factory,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            title: "Allocated Capacity",
            value: `${avgUtilization}%`,
            sub: "this week average",
            icon: TrendingUp,
            color: avgUtilization > 90 ? "text-red-600" : "text-amber-600",
            bg: avgUtilization > 90 ? "bg-red-50" : "bg-amber-50",
          },
          {
            title: "Free Capacity",
            value: `${(totalFree / 1000).toFixed(1)}K pcs`,
            sub: "available lines",
            icon: CheckCircle2,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            title: "Lines Overloaded",
            value: overloadedLines,
            sub: "require attention",
            icon: AlertTriangle,
            color: overloadedLines > 0 ? "text-red-600" : "text-gray-400",
            bg: overloadedLines > 0 ? "bg-red-50" : "bg-gray-50",
          },
        ].map((card) => (
          <Card key={card.title}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 leading-tight">{card.title}</p>
                  <p className="mt-1 text-2xl font-black tabular-nums text-gray-900">
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

      {/* Feasibility Checker Panel */}
      {showFeasibility && (
        <Card className="border-blue-200 bg-blue-50/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="h-4 w-4 text-blue-600" />
                Order Feasibility Checker
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFeasibility(false)}
                className="h-7 text-xs text-gray-500"
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  Order Quantity (pcs)
                </label>
                <input
                  type="number"
                  value={orderQty}
                  onChange={(e) => setOrderQty(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={100}
                  step={500}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  Product Type (SMV)
                </label>
                <select
                  value={selectedProduct.value}
                  onChange={(e) => {
                    const p = PRODUCT_TYPES.find((x) => x.value === e.target.value);
                    if (p) setSelectedProduct(p);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {PRODUCT_TYPES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  Required Delivery Date
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleCheckFeasibility} className="w-full">
                  Check Now
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>

            {feasibilityResult && (
              <div className="mt-4 space-y-3">
                <div
                  className={cn(
                    "rounded-xl border px-4 py-3 flex items-start gap-3",
                    feasibilityResult.feasible
                      ? "border-green-300 bg-green-50"
                      : "border-red-300 bg-red-50"
                  )}
                >
                  {feasibilityResult.feasible ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p
                      className={cn(
                        "font-semibold text-sm",
                        feasibilityResult.feasible
                          ? "text-green-800"
                          : "text-red-800"
                      )}
                    >
                      {feasibilityResult.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Checking {orderQty.toLocaleString()} pcs of {selectedProduct.label} for
                      delivery by {new Date(deliveryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>

                {feasibilityResult.availableLines.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {feasibilityResult.availableLines.map((line) => (
                      <div
                        key={line.lineName}
                        className={cn(
                          "rounded-lg border bg-white p-3",
                          line.lineName === feasibilityResult.recommendedLine
                            ? "border-blue-300 ring-1 ring-blue-200"
                            : "border-gray-200"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-800">
                            {line.lineName}
                          </span>
                          {line.lineName === feasibilityResult.recommendedLine && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                              Best
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Free:{" "}
                          <span className="font-medium text-gray-700">
                            {line.freeCapacity.toLocaleString()} pcs/day
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Ready by:{" "}
                          <span className="font-medium text-gray-700">
                            {line.completionDate}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Line Loading Gantt-style Chart */}
      {lines.length > 0 && ganttData.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                Line Loading - 8 Week View
              </CardTitle>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-500" />
                  Under 75%
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-400" />
                  75-90%
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-500" />
                  Over 90%
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={ganttData}
                    barSize={12}
                    barCategoryGap="25%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${v}%`}
                      domain={[0, 120]}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Utilization"]}
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {lines.map((line) => (
                      <Bar
                        key={line.lineName}
                        dataKey={line.lineName}
                        stackId="a"
                        radius={[0, 0, 0, 0]}
                      >
                        {ganttData.map((entry, index) => {
                          const val = (entry[line.lineName] as number) ?? 0;
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={getUtilizationColor(val)}
                              fillOpacity={0.75}
                            />
                          );
                        })}
                      </Bar>
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Stacked utilization across all {lines.length} lines per week. Red bars indicate overloading.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Capacity Utilization Summary Table */}
      {lineSummary.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Capacity Utilization Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Line
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dept
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cap/Day
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      W1
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      W2
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      W3
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      W4
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Now
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {lineSummary.map((row) => {
                    const badge = getStatusBadge(row.status);
                    return (
                      <tr
                        key={row.lineName}
                        className={cn(
                          "hover:bg-gray-50/60 transition-colors",
                          row.status === "overloaded" && "bg-red-50/30"
                        )}
                      >
                        <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                          {row.lineName}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {row.department}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-600 text-xs">
                          {row.capacityPerDay.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-xs">
                          {(row.thisWeek / 1000).toFixed(1)}K
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-xs">
                          {(row.nextWeek / 1000).toFixed(1)}K
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-xs">
                          {(row.week3 / 1000).toFixed(1)}K
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-xs">
                          {(row.week4 / 1000).toFixed(1)}K
                        </td>
                        <td className="px-4 py-3">
                          <CapacityBar value={row.currentPct} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={cn(
                              "inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
                              badge.className
                            )}
                          >
                            {badge.label}
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
      )}

      {lines.length === 0 && !loading && (
        <Card>
          <CardContent className="py-10 flex flex-col items-center text-center gap-3">
            <Factory className="h-12 w-12 text-gray-300" />
            <div>
              <p className="text-sm font-semibold text-gray-800">
                No Production Lines Found
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Add production lines in the Masters section to see capacity planning data.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
