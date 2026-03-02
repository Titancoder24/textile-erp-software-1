"use client";

import * as React from "react";
import {
  Grid3X3,
  TrendingUp,
  CircleDollarSign,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { useProfile } from "@/hooks/use-profile";
import {
  getOrderProfitabilityData,
  type OrderProfitability,
} from "@/lib/actions/analytics";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getMarginColor(category: OrderProfitability["profitCategory"]) {
  switch (category) {
    case "profitable":
      return {
        bg: "bg-green-50 border-green-200 hover:bg-green-100/80",
        text: "text-green-700",
        badge: "bg-green-100 text-green-800",
        ring: "ring-green-300",
      };
    case "thin_margin":
      return {
        bg: "bg-amber-50 border-amber-200 hover:bg-amber-100/80",
        text: "text-amber-700",
        badge: "bg-amber-100 text-amber-800",
        ring: "ring-amber-300",
      };
    case "loss":
      return {
        bg: "bg-red-50 border-red-200 hover:bg-red-100/80",
        text: "text-red-700",
        badge: "bg-red-100 text-red-800",
        ring: "ring-red-300",
      };
  }
}

function getCategoryLabel(category: OrderProfitability["profitCategory"]) {
  switch (category) {
    case "profitable":
      return "Profitable";
    case "thin_margin":
      return "Thin Margin";
    case "loss":
      return "Loss";
  }
}

// ---------------------------------------------------------------------------
// Cost Breakdown Detail Panel
// ---------------------------------------------------------------------------

interface CostDetailProps {
  order: OrderProfitability;
  onClose: () => void;
}

function CostDetailPanel({ order, onClose }: CostDetailProps) {
  const breakdown = order.costBreakdown;
  const totalLeakage =
    breakdown.fabricOverConsumption +
    breakdown.excessOvertime +
    breakdown.reDyeingCost +
    breakdown.airShipmentPenalty +
    breakdown.reworkCost +
    breakdown.otherLeakage;

  const leakageItems = [
    {
      label: "Fabric Over-Consumption",
      value: breakdown.fabricOverConsumption,
      color: "bg-orange-500",
    },
    {
      label: "Excess Overtime",
      value: breakdown.excessOvertime,
      color: "bg-blue-500",
    },
    {
      label: "Re-Dyeing Cost",
      value: breakdown.reDyeingCost,
      color: "bg-purple-500",
    },
    {
      label: "Air Shipment Penalty",
      value: breakdown.airShipmentPenalty,
      color: "bg-red-500",
    },
    {
      label: "Rework Cost",
      value: breakdown.reworkCost,
      color: "bg-pink-500",
    },
    {
      label: "Other Leakage",
      value: breakdown.otherLeakage,
      color: "bg-gray-500",
    },
  ];

  return (
    <Card className="border-t-0 rounded-t-none">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-gray-900">
            Cost Breakdown - {order.orderNumber}
          </h4>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close detail panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Cost Summary Row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-5">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">FOB Value</p>
            <p className="text-sm font-bold text-gray-900 tabular-nums">
              {formatCurrency(order.fobValue)}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Total Cost</p>
            <p className="text-sm font-bold text-gray-900 tabular-nums">
              {formatCurrency(order.totalCost)}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Profit</p>
            <p
              className={cn(
                "text-sm font-bold tabular-nums",
                order.profit >= 0 ? "text-green-700" : "text-red-700"
              )}
            >
              {formatCurrency(order.profit)}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Margin</p>
            <p
              className={cn(
                "text-sm font-bold tabular-nums",
                order.marginPct >= 8
                  ? "text-green-700"
                  : order.marginPct >= 0
                  ? "text-amber-700"
                  : "text-red-700"
              )}
            >
              {order.marginPct.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Cost Split */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-5">
          <div>
            <p className="text-xs text-gray-500">Material Cost</p>
            <p className="text-sm font-semibold text-gray-800 tabular-nums">
              {formatCurrency(order.materialCost)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Production Cost</p>
            <p className="text-sm font-semibold text-gray-800 tabular-nums">
              {formatCurrency(order.productionCost)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Dyeing Cost</p>
            <p className="text-sm font-semibold text-gray-800 tabular-nums">
              {formatCurrency(order.dyeingCost)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Overhead Cost</p>
            <p className="text-sm font-semibold text-gray-800 tabular-nums">
              {formatCurrency(order.overheadCost)}
            </p>
          </div>
        </div>

        {/* Leakage Breakdown */}
        {totalLeakage > 0 ? (
          <div>
            <h5 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">
              Where Money Leaked
            </h5>
            <div className="space-y-2.5">
              {leakageItems
                .filter((item) => item.value > 0)
                .map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-2.5 w-2.5 shrink-0 rounded-full",
                        item.color
                      )}
                    />
                    <span className="text-sm text-gray-600 flex-1">
                      {item.label}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 tabular-nums">
                      {formatCurrency(item.value)}
                    </span>
                    <span className="text-xs text-gray-400 tabular-nums w-12 text-right">
                      {totalLeakage > 0
                        ? ((item.value / totalLeakage) * 100).toFixed(0)
                        : 0}
                      %
                    </span>
                  </div>
                ))}
              <div className="flex items-center gap-3 border-t border-gray-200 pt-2">
                <div className="h-2.5 w-2.5 shrink-0" />
                <span className="text-sm font-semibold text-gray-800 flex-1">
                  Total Leakage
                </span>
                <span className="text-sm font-bold text-red-700 tabular-nums">
                  {formatCurrency(totalLeakage)}
                </span>
                <span className="text-xs font-semibold text-red-600 tabular-nums w-12 text-right">
                  100%
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-green-50 p-4 text-center">
            <p className="text-sm text-green-700">
              No significant cost leakage detected for this order.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OrderProfitabilityHeatmapPage() {
  const { profile } = useProfile();
  const companyId = profile?.company_id;

  const [orders, setOrders] = React.useState<OrderProfitability[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [filterCategory, setFilterCategory] = React.useState<
    "all" | "profitable" | "thin_margin" | "loss"
  >("all");

  React.useEffect(() => {
    if (!companyId) return;

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const result = await getOrderProfitabilityData(companyId!);
        if (!cancelled) {
          if (result.error) {
            setError(result.error);
          } else {
            setOrders(result.data ?? []);
          }
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load profitability data");
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
  const totalOrders = orders.length;
  const avgMargin =
    totalOrders > 0
      ? orders.reduce((sum, o) => sum + o.marginPct, 0) / totalOrders
      : 0;
  const profitableCount = orders.filter(
    (o) => o.profitCategory === "profitable"
  ).length;
  const lossCount = orders.filter((o) => o.profitCategory === "loss").length;

  // Filtered orders
  const filteredOrders = React.useMemo(() => {
    if (filterCategory === "all") return orders;
    return orders.filter((o) => o.profitCategory === filterCategory);
  }, [orders, filterCategory]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Order Profitability Heatmap"
          description="Visual overview of order-level margins and cost leakages"
          breadcrumb={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Finance & P&L", href: "/finance" },
            { label: "Profitability Heatmap" },
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
          title="Order Profitability Heatmap"
          description="Visual overview of order-level margins and cost leakages"
          breadcrumb={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Finance & P&L", href: "/finance" },
            { label: "Profitability Heatmap" },
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
        title="Order Profitability Heatmap"
        description="Visual overview of order-level margins and cost leakages"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Finance & P&L", href: "/finance" },
          { label: "Profitability Heatmap" },
        ]}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={formatNumber(totalOrders)}
          icon={<Grid3X3 className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Avg Margin"
          value={`${avgMargin.toFixed(1)}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          color={avgMargin >= 8 ? "green" : "orange"}
        />
        <StatCard
          title="Profitable Orders"
          value={formatNumber(profitableCount)}
          icon={<CircleDollarSign className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Loss-Making Orders"
          value={formatNumber(lossCount)}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="red"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(
          [
            { key: "all", label: "All Orders" },
            { key: "profitable", label: "Profitable (> 8%)" },
            { key: "thin_margin", label: "Thin Margin (0-8%)" },
            { key: "loss", label: "Loss (< 0%)" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterCategory(tab.key)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              filterCategory === tab.key
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            {tab.label}
            {tab.key !== "all" && (
              <span className="ml-1.5 tabular-nums">
                (
                {tab.key === "profitable"
                  ? profitableCount
                  : tab.key === "thin_margin"
                  ? orders.filter((o) => o.profitCategory === "thin_margin")
                      .length
                  : lossCount}
                )
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Heatmap Grid */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Grid3X3 className="mx-auto h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-900">
              No orders found
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {filterCategory === "all"
                ? "Create sales orders to see the profitability heatmap."
                : "No orders match the selected filter."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredOrders.map((order) => {
            const colors = getMarginColor(order.profitCategory);
            const isExpanded = expandedId === order.id;

            return (
              <div key={order.id} className="flex flex-col">
                {/* Tile Card */}
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : order.id)
                  }
                  className={cn(
                    "rounded-xl border p-4 text-left transition-all w-full",
                    colors.bg,
                    isExpanded && `ring-2 ${colors.ring} rounded-b-none`
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-gray-800">
                      {order.orderNumber}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
                        colors.badge
                      )}
                    >
                      {order.marginPct.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {order.buyer}
                  </p>
                  <p className="text-xs text-gray-600 truncate mt-0.5">
                    {order.product}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200/60">
                    <span className="text-xs text-gray-500">
                      {formatNumber(order.totalQty)} pcs
                    </span>
                    <span className="text-xs text-gray-500">
                      {getCategoryLabel(order.profitCategory)}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <CostDetailPanel
                    order={order}
                    onClose={() => setExpandedId(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-gray-500">
        <span className="font-medium text-gray-700">Legend:</span>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-green-200 border border-green-300" />
          <span>Profitable (&gt; 8%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-amber-200 border border-amber-300" />
          <span>Thin Margin (0-8%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-red-200 border border-red-300" />
          <span>Loss (&lt; 0%)</span>
        </div>
      </div>
    </div>
  );
}
