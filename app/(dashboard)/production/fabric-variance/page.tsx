"use client";

import * as React from "react";
import {
  Scissors,
  IndianRupee,
  Gauge,
  AlertTriangle,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile } from "@/hooks/use-profile";
import {
  getFabricVarianceData,
  type FabricVariance,
} from "@/lib/actions/analytics";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStatusConfig(status: FabricVariance["status"]) {
  switch (status) {
    case "within_limit":
      return {
        label: "Within Limit",
        className: "bg-green-100 text-green-700 border-green-200",
      };
    case "warning":
      return {
        label: "Warning",
        className: "bg-amber-100 text-amber-700 border-amber-200",
      };
    case "critical":
      return {
        label: "Critical",
        className: "bg-red-100 text-red-700 border-red-200",
      };
  }
}

function getVarianceIcon(variancePct: number) {
  if (variancePct > 1) {
    return <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />;
  }
  if (variancePct < -1) {
    return <ArrowDownRight className="h-3.5 w-3.5 text-green-500" />;
  }
  return <Minus className="h-3.5 w-3.5 text-gray-400" />;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function FabricVariancePage() {
  const { profile } = useProfile();
  const companyId = profile?.company_id;

  const [data, setData] = React.useState<FabricVariance[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sortField, setSortField] = React.useState<
    "variancePct" | "varianceValue" | "markerEfficiency"
  >("variancePct");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = React.useState<
    "all" | "within_limit" | "warning" | "critical"
  >("all");

  React.useEffect(() => {
    if (!companyId) return;

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const result = await getFabricVarianceData(companyId!);
        if (!cancelled) {
          if (result.error) {
            setError(result.error);
          } else {
            setData(result.data ?? []);
          }
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load fabric variance data");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  // Computed stats
  const totalVarianceMeters = data.reduce(
    (sum, d) => sum + Math.max(0, d.varianceMeters),
    0
  );
  const totalVarianceValue = data.reduce(
    (sum, d) => sum + Math.max(0, d.varianceValue),
    0
  );
  const avgMarkerEfficiency =
    data.length > 0
      ? data.reduce((sum, d) => sum + d.markerEfficiency, 0) / data.length
      : 0;
  const ordersAbove5Pct = data.filter((d) => d.variancePct > 5).length;

  // Sorted and filtered data
  const filteredData = React.useMemo(() => {
    let result = [...data];

    if (filterStatus !== "all") {
      result = result.filter((d) => d.status === filterStatus);
    }

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });

    return result;
  }, [data, filterStatus, sortField, sortDir]);

  function handleSort(field: typeof sortField) {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  function SortIndicator({ field }: { field: typeof sortField }) {
    if (sortField !== field) return null;
    return (
      <span className="ml-1 text-blue-600">
        {sortDir === "desc" ? "v" : "^"}
      </span>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Fabric Consumption Variance"
          description="Track fabric usage versus BOM standards across orders"
          breadcrumb={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Production", href: "/production" },
            { label: "Fabric Variance" },
          ]}
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCard key={i} title="" value="" loading />
          ))}
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Fabric Consumption Variance"
          description="Track fabric usage versus BOM standards across orders"
          breadcrumb={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Production", href: "/production" },
            { label: "Fabric Variance" },
          ]}
        />
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-red-400 mb-3" />
            <p className="text-sm font-medium text-gray-900">
              Failed to load data
            </p>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fabric Consumption Variance"
        description="Track fabric usage versus BOM standards across orders"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Production", href: "/production" },
          { label: "Fabric Variance" },
        ]}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          title="Total Variance"
          value={`${totalVarianceMeters.toFixed(1)} m`}
          icon={<Scissors className="h-5 w-5" />}
          color={totalVarianceMeters <= 0 ? "green" : "orange"}
        />
        <StatCard
          title="Variance Value"
          value={formatCurrency(totalVarianceValue)}
          icon={<IndianRupee className="h-5 w-5" />}
          color={totalVarianceValue <= 0 ? "green" : "red"}
        />
        <StatCard
          title="Avg Marker Efficiency"
          value={`${avgMarkerEfficiency.toFixed(1)}%`}
          icon={<Gauge className="h-5 w-5" />}
          color={avgMarkerEfficiency >= 80 ? "green" : avgMarkerEfficiency >= 70 ? "orange" : "red"}
        />
        <StatCard
          title="Orders Above 5% Variance"
          value={formatNumber(ordersAbove5Pct)}
          icon={<AlertTriangle className="h-5 w-5" />}
          color={ordersAbove5Pct === 0 ? "green" : "red"}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(
          [
            { key: "all", label: "All Orders" },
            { key: "within_limit", label: "Within Limit" },
            { key: "warning", label: "Warning" },
            { key: "critical", label: "Critical" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              filterStatus === tab.key
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            {tab.label}
            {tab.key !== "all" && (
              <span className="ml-1.5 tabular-nums">
                ({data.filter((d) => d.status === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Variance Table */}
      {filteredData.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Scissors className="mx-auto h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-900">
              No variance data found
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {filterStatus === "all"
                ? "Create work orders and record cutting entries to track fabric variance."
                : "No orders match the selected filter."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Order-wise Fabric Variance ({filteredData.length} orders)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      BOM Std (m)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actual (m)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variance (m)
                    </th>
                    <th
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort("variancePct")}
                    >
                      Var %
                      <SortIndicator field="variancePct" />
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cut Waste
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Re-Cut
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dye Lot
                    </th>
                    <th
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort("markerEfficiency")}
                    >
                      Marker Eff
                      <SortIndicator field="markerEfficiency" />
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredData.map((row) => {
                    const statusConfig = getStatusConfig(row.status);
                    return (
                      <tr
                        key={row.id}
                        className={cn(
                          "hover:bg-gray-50/60 transition-colors",
                          row.status === "critical" && "bg-red-50/20"
                        )}
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-semibold text-blue-700">
                            {row.orderNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {row.buyer}
                        </td>
                        <td className="px-4 py-3 max-w-[140px]">
                          <span className="text-sm text-gray-800 block truncate">
                            {row.product}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                          {row.bomStandardMeters.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                          {row.actualConsumedMeters.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          <span
                            className={cn(
                              "inline-flex items-center gap-0.5 font-semibold",
                              row.varianceMeters > 0
                                ? "text-red-600"
                                : row.varianceMeters < 0
                                ? "text-green-600"
                                : "text-gray-500"
                            )}
                          >
                            {getVarianceIcon(row.variancePct)}
                            {row.varianceMeters > 0 ? "+" : ""}
                            {row.varianceMeters.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={cn(
                              "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums min-w-[48px]",
                              row.variancePct > 5
                                ? "bg-red-100 text-red-700"
                                : row.variancePct > 3
                                ? "bg-amber-100 text-amber-700"
                                : row.variancePct > 0
                                ? "bg-gray-100 text-gray-600"
                                : "bg-green-100 text-green-700"
                            )}
                          >
                            {row.variancePct > 0 ? "+" : ""}
                            {row.variancePct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-600 text-xs">
                          {row.cuttingWaste.toFixed(1)} m
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-600 text-xs">
                          {row.reCutting.toFixed(1)} m
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-600 text-xs">
                          {row.dyeLotMismatch.toFixed(1)} m
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={cn(
                              "text-xs font-bold tabular-nums",
                              row.markerEfficiency >= 80
                                ? "text-green-700"
                                : row.markerEfficiency >= 70
                                ? "text-amber-700"
                                : row.markerEfficiency > 0
                                ? "text-red-700"
                                : "text-gray-400"
                            )}
                          >
                            {row.markerEfficiency > 0
                              ? `${row.markerEfficiency.toFixed(1)}%`
                              : "--"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
                              statusConfig.className
                            )}
                          >
                            {statusConfig.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Summary Footer */}
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50">
                    <td
                      colSpan={3}
                      className="px-4 py-3 font-semibold text-gray-700 text-sm"
                    >
                      Total / Average ({filteredData.length} orders)
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 text-sm tabular-nums">
                      {filteredData
                        .reduce((s, d) => s + d.bomStandardMeters, 0)
                        .toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 text-sm tabular-nums">
                      {filteredData
                        .reduce((s, d) => s + d.actualConsumedMeters, 0)
                        .toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-red-700 text-sm tabular-nums">
                      {filteredData
                        .reduce((s, d) => s + Math.max(0, d.varianceMeters), 0)
                        .toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-sm tabular-nums">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 min-w-[48px]"
                        )}
                      >
                        {filteredData.length > 0
                          ? (
                              filteredData.reduce(
                                (s, d) => s + d.variancePct,
                                0
                              ) / filteredData.length
                            ).toFixed(1)
                          : "0.0"}
                        %
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-600 text-xs font-semibold">
                      {filteredData
                        .reduce((s, d) => s + d.cuttingWaste, 0)
                        .toFixed(1)}{" "}
                      m
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-600 text-xs font-semibold">
                      {filteredData
                        .reduce((s, d) => s + d.reCutting, 0)
                        .toFixed(1)}{" "}
                      m
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-600 text-xs font-semibold">
                      {filteredData
                        .reduce((s, d) => s + d.dyeLotMismatch, 0)
                        .toFixed(1)}{" "}
                      m
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-bold text-blue-700 tabular-nums">
                        {filteredData.length > 0
                          ? (
                              filteredData.reduce(
                                (s, d) => s + d.markerEfficiency,
                                0
                              ) / filteredData.length
                            ).toFixed(1)
                          : "0.0"}
                        %
                      </span>
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variance Insight Cards */}
      {data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-red-200 bg-red-50/40">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100">
                  <AlertTriangle className="h-4 w-4 text-red-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Critical Variance
                  </p>
                  <p className="text-xs text-red-700 mt-1 leading-relaxed">
                    {ordersAbove5Pct > 0
                      ? `${ordersAbove5Pct} order${ordersAbove5Pct === 1 ? "" : "s"} exceed${ordersAbove5Pct === 1 ? "s" : ""} the 5% variance threshold. Total value at risk: ${formatCurrency(
                          data
                            .filter((d) => d.variancePct > 5)
                            .reduce((s, d) => s + d.varianceValue, 0)
                        )}.`
                      : "No orders exceed the 5% variance threshold. Fabric consumption is under control."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/40">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                  <Gauge className="h-4 w-4 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Marker Efficiency
                  </p>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                    {avgMarkerEfficiency > 0
                      ? `Average marker efficiency is ${avgMarkerEfficiency.toFixed(1)}%. ${
                          avgMarkerEfficiency < 80
                            ? "Below the 80% target. Review marker layouts with CAD team."
                            : "On target. Continue monitoring for consistency."
                        }`
                      : "No marker efficiency data recorded yet. Record cutting entries to track efficiency."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/40">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <Scissors className="h-4 w-4 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    Variance Breakdown
                  </p>
                  <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                    {data.length > 0
                      ? `Cutting waste accounts for ${(
                          (data.reduce((s, d) => s + d.cuttingWaste, 0) /
                            Math.max(
                              1,
                              data.reduce(
                                (s, d) => s + Math.max(0, d.varianceMeters),
                                0
                              )
                            )) *
                          100
                        ).toFixed(0)}% of total variance. Re-cutting and dye lot mismatches contribute the rest.`
                      : "No variance breakdown data available. Start recording cutting data to see insights."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
