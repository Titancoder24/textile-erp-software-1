"use client";

import * as React from "react";
import {
  Scale,
  Calculator,
  TrendingUp,
  AlertTriangle,
  Loader2,
  ArrowDown,
  ArrowUp,
  Minus,
} from "lucide-react";

import { cn, formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { useProfile } from "@/hooks/use-profile";
import {
  getProcessCostBenchmarkData,
  type ProcessBenchmark,
} from "@/lib/actions/analytics";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getVarianceColor(status: "below" | "at" | "above") {
  if (status === "below") return "text-green-700";
  if (status === "above") return "text-red-600";
  return "text-gray-600";
}

function getVarianceBg(status: "below" | "at" | "above") {
  if (status === "below") return "bg-green-50";
  if (status === "above") return "bg-red-50";
  return "bg-gray-50";
}

function getVarianceIcon(status: "below" | "at" | "above") {
  if (status === "below") return ArrowDown;
  if (status === "above") return ArrowUp;
  return Minus;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProcessCostBenchmarkPage() {
  const { profile } = useProfile();
  const companyId = profile?.company_id;

  const [benchmarks, setBenchmarks] = React.useState<ProcessBenchmark[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!companyId) return;

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const result = await getProcessCostBenchmarkData(companyId!);
        if (!cancelled) {
          if (result.error) {
            setError(result.error);
          } else {
            setBenchmarks(result.data ?? []);
          }
        }
      } catch {
        if (!cancelled) setError("Failed to load cost benchmark data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  // Derived stats
  const totalProcesses = benchmarks.length;
  const totalOrders = React.useMemo(() => {
    const orderSet = new Set<string>();
    benchmarks.forEach((b) =>
      b.orders.forEach((o) => orderSet.add(o.orderNumber))
    );
    return orderSet.size;
  }, [benchmarks]);

  const avgVariancePct = React.useMemo(() => {
    const allVariances: number[] = [];
    benchmarks.forEach((b) =>
      b.orders.forEach((o) => allVariances.push(Math.abs(o.variancePct)))
    );
    return allVariances.length > 0
      ? Math.round(
          (allVariances.reduce((s, v) => s + v, 0) / allVariances.length) * 10
        ) / 10
      : 0;
  }, [benchmarks]);

  const processesAboveBenchmark = React.useMemo(() => {
    return benchmarks.filter((b) =>
      b.orders.some((o) => o.status === "above")
    ).length;
  }, [benchmarks]);

  // Chart data: benchmark costs across all processes
  const summaryChartData = React.useMemo(() => {
    return benchmarks.map((b) => {
      const avgActual =
        b.orders.length > 0
          ? Math.round(
              (b.orders.reduce((s, o) => s + o.actualCost, 0) /
                b.orders.length) *
                100
            ) / 100
          : 0;
      return {
        name: b.process,
        Benchmark: b.benchmarkCost,
        "Avg Actual": avgActual,
      };
    });
  }, [benchmarks]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Process Cost Benchmark"
          description="Compare actual cost per piece at each process stage against factory benchmark"
          breadcrumb={[
            { label: "Finance", href: "/finance" },
            { label: "Cost Benchmark" },
          ]}
        />
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (benchmarks.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Process Cost Benchmark"
          description="Compare actual cost per piece at each process stage against factory benchmark"
          breadcrumb={[
            { label: "Finance", href: "/finance" },
            { label: "Cost Benchmark" },
          ]}
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Scale className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-600">
              No benchmark data available
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Create cost sheets for orders to generate process-wise benchmarks.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Process Cost Benchmark"
        description="Compare actual cost per piece at each process stage against factory benchmark"
        breadcrumb={[
          { label: "Finance", href: "/finance" },
          { label: "Cost Benchmark" },
        ]}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          title="Total Processes Tracked"
          value={totalProcesses}
          icon={<Scale className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Orders Analyzed"
          value={totalOrders}
          icon={<Calculator className="h-5 w-5" />}
          color="purple"
        />
        <StatCard
          title="Avg Variance %"
          value={`${avgVariancePct}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="orange"
        />
        <StatCard
          title="Processes Above Benchmark"
          value={processesAboveBenchmark}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="red"
        />
      </div>

      {/* Summary Bar Chart */}
      <BarChartCard
        title="Benchmark vs Average Actual Cost by Process"
        data={summaryChartData}
        dataKeys={["Benchmark", "Avg Actual"]}
        colors={["#e5e7eb", "#3b82f6"]}
        xAxisKey="name"
        height={280}
        formatTooltipValue={(value) => formatCurrency(value, "INR")}
      />

      {/* Process Tabs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900">
            Process-wise Cost Detail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={benchmarks[0]?.process || "Material"}>
            <TabsList className="flex-wrap h-auto gap-1">
              {benchmarks.map((b) => (
                <TabsTrigger
                  key={b.process}
                  value={b.process}
                  className="text-xs"
                >
                  {b.process}
                </TabsTrigger>
              ))}
            </TabsList>

            {benchmarks.map((benchmark) => (
              <TabsContent key={benchmark.process} value={benchmark.process}>
                <div className="mt-4 space-y-4">
                  {/* Benchmark header */}
                  <div className="flex items-center gap-4 rounded-lg border border-blue-200 bg-blue-50/60 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                      <Scale className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        {benchmark.process} Benchmark
                      </p>
                      <p className="text-2xl font-black text-blue-800 tabular-nums">
                        {formatCurrency(benchmark.benchmarkCost, "INR")}
                        <span className="text-sm font-normal text-blue-600 ml-1">
                          per piece
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Orders table */}
                  {benchmark.orders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              Order
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              Buyer
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                              Actual Cost
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                              Benchmark
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                              Variance
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                              Variance %
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {benchmark.orders.map((order, idx) => {
                            const StatusIcon = getVarianceIcon(order.status);
                            return (
                              <tr
                                key={`${order.orderNumber}-${idx}`}
                                className={cn(
                                  "hover:bg-gray-50/60 transition-colors",
                                  getVarianceBg(order.status)
                                )}
                              >
                                <td className="px-4 py-3">
                                  <span className="font-mono text-xs font-semibold text-blue-700">
                                    {order.orderNumber}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {order.buyer}
                                </td>
                                <td className="px-4 py-3 text-right tabular-nums font-semibold text-gray-900">
                                  {formatCurrency(order.actualCost, "INR")}
                                </td>
                                <td className="px-4 py-3 text-right tabular-nums text-gray-500">
                                  {formatCurrency(
                                    benchmark.benchmarkCost,
                                    "INR"
                                  )}
                                </td>
                                <td
                                  className={cn(
                                    "px-4 py-3 text-right tabular-nums font-semibold",
                                    getVarianceColor(order.status)
                                  )}
                                >
                                  {order.variance >= 0 ? "+" : ""}
                                  {formatCurrency(order.variance, "INR")}
                                </td>
                                <td
                                  className={cn(
                                    "px-4 py-3 text-right tabular-nums font-semibold",
                                    getVarianceColor(order.status)
                                  )}
                                >
                                  <span className="inline-flex items-center gap-1">
                                    <StatusIcon className="h-3 w-3" />
                                    {order.variancePct >= 0 ? "+" : ""}
                                    {order.variancePct.toFixed(1)}%
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span
                                    className={cn(
                                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                      order.status === "below" &&
                                        "bg-green-100 text-green-700",
                                      order.status === "at" &&
                                        "bg-gray-100 text-gray-600",
                                      order.status === "above" &&
                                        "bg-red-100 text-red-700"
                                    )}
                                  >
                                    {order.status === "below"
                                      ? "Below"
                                      : order.status === "above"
                                      ? "Above"
                                      : "At Benchmark"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-sm text-gray-400">
                      No order data for this process
                    </div>
                  )}

                  {/* Process Summary bar visualization */}
                  {benchmark.orders.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Cost Distribution
                      </p>
                      <div className="space-y-1.5">
                        {benchmark.orders
                          .slice(0, 10)
                          .map((order, idx) => {
                            const maxCost = Math.max(
                              benchmark.benchmarkCost * 2,
                              ...benchmark.orders.map((o) => o.actualCost)
                            );
                            const barWidthPct = Math.min(
                              100,
                              (order.actualCost / maxCost) * 100
                            );
                            const benchmarkPct = Math.min(
                              100,
                              (benchmark.benchmarkCost / maxCost) * 100
                            );
                            return (
                              <div
                                key={`${order.orderNumber}-bar-${idx}`}
                                className="flex items-center gap-3"
                              >
                                <span className="min-w-[80px] text-xs text-gray-600 font-mono truncate">
                                  {order.orderNumber}
                                </span>
                                <div className="relative flex-1 h-5 bg-gray-100 rounded-sm overflow-hidden">
                                  <div
                                    className={cn(
                                      "absolute inset-y-0 left-0 rounded-sm transition-all",
                                      order.status === "below"
                                        ? "bg-green-500"
                                        : order.status === "above"
                                        ? "bg-red-500"
                                        : "bg-gray-400"
                                    )}
                                    style={{ width: `${barWidthPct}%` }}
                                  />
                                  {/* Benchmark reference line */}
                                  <div
                                    className="absolute inset-y-0 w-0.5 bg-blue-600 z-10"
                                    style={{ left: `${benchmarkPct}%` }}
                                    title={`Benchmark: ${formatCurrency(benchmark.benchmarkCost, "INR")}`}
                                  />
                                </div>
                                <span className="min-w-[60px] text-right text-xs tabular-nums font-medium text-gray-700">
                                  {formatCurrency(order.actualCost, "INR")}
                                </span>
                              </div>
                            );
                          })}
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                          <span className="min-w-[80px]" />
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-green-500" />
                              Below Benchmark
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-gray-400" />
                              At Benchmark
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-red-500" />
                              Above Benchmark
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="h-0.5 w-3 bg-blue-600" />
                              Benchmark Line
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
