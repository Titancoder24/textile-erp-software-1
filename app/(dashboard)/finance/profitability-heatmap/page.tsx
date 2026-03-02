"use client";

import * as React from "react";
import {
  Grid3X3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Eye,
  Plus,
  X,
  Loader2,
  Filter,
  Search,
} from "lucide-react";

import { cn, formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DonutChartCard } from "@/components/charts/donut-chart-card";
import { useProfile } from "@/hooks/use-profile";
import { toast } from "sonner";
import {
  getOrderProfitabilityData,
  type OrderProfitability,
} from "@/lib/actions/analytics";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getMarginStyle(category: OrderProfitability["profitCategory"]) {
  switch (category) {
    case "profitable":
      return {
        tileBg: "bg-gradient-to-br from-green-50 to-emerald-50",
        border: "border-l-4 border-l-green-500",
        marginText: "text-green-700",
        marginBg: "bg-green-100/80",
        badgeVariant: "bg-green-100 text-green-800 border-green-200",
      };
    case "thin_margin":
      return {
        tileBg: "bg-gradient-to-br from-amber-50 to-yellow-50",
        border: "border-l-4 border-l-amber-500",
        marginText: "text-amber-700",
        marginBg: "bg-amber-100/80",
        badgeVariant: "bg-amber-100 text-amber-800 border-amber-200",
      };
    case "loss":
      return {
        tileBg: "bg-gradient-to-br from-red-50 to-rose-50",
        border: "border-l-4 border-l-red-500",
        marginText: "text-red-700",
        marginBg: "bg-red-100/80",
        badgeVariant: "bg-red-100 text-red-800 border-red-200",
      };
  }
}

// ---------------------------------------------------------------------------
// Cost Override Form (inside Dialog)
// ---------------------------------------------------------------------------

function CostOverrideForm({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [notes, setNotes] = React.useState("");

  function handleSave() {
    if (!category || !amount) {
      toast.error("Please fill in category and amount");
      return;
    }
    toast.success("Cost override saved");
    onClose();
  }

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="override-category">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="override-category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fabric">Fabric</SelectItem>
            <SelectItem value="labor">Labor</SelectItem>
            <SelectItem value="dyeing">Dyeing</SelectItem>
            <SelectItem value="shipping">Shipping</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="override-amount">Amount (INR)</Label>
        <Input
          id="override-amount"
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="override-notes">Notes</Label>
        <Textarea
          id="override-notes"
          placeholder="Describe the reason for this cost override..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave}>
          Save Override
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Horizontal Cost Bar
// ---------------------------------------------------------------------------

function CostBar({
  label,
  value,
  maxValue,
  color,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}) {
  const pct = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900 tabular-nums">
          {formatCurrency(value)}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sheet Detail Panel for selected order
// ---------------------------------------------------------------------------

function OrderDetailSheet({
  order,
  open,
  onOpenChange,
}: {
  order: OrderProfitability | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [overrideOpen, setOverrideOpen] = React.useState(false);
  const [fabricNotes, setFabricNotes] = React.useState("");
  const [reworkNotes, setReworkNotes] = React.useState("");

  if (!order) return null;

  const breakdown = order.costBreakdown;
  const totalLeakage =
    breakdown.fabricOverConsumption +
    breakdown.excessOvertime +
    breakdown.reDyeingCost +
    breakdown.airShipmentPenalty +
    breakdown.reworkCost +
    breakdown.otherLeakage;

  const maxCost = Math.max(
    order.materialCost,
    order.productionCost,
    order.dyeingCost,
    order.overheadCost,
    1
  );

  const style = getMarginStyle(order.profitCategory);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-3">
            <span className="font-mono text-lg">{order.orderNumber}</span>
            <Badge
              variant="outline"
              className={cn("text-xs", style.badgeVariant)}
            >
              {order.marginPct.toFixed(1)}% margin
            </Badge>
          </SheetTitle>
        </SheetHeader>

        {/* Order Details */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Buyer</p>
              <p className="text-sm font-semibold text-gray-900">{order.buyer}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Product</p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {order.product}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Quantity</p>
              <p className="text-sm font-semibold text-gray-900 tabular-nums">
                {formatNumber(order.totalQty)} pcs
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Delivery</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(order.deliveryDate)}
              </p>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-gray-200 p-3 text-center">
              <p className="text-xs text-gray-500">FOB Value</p>
              <p className="text-sm font-bold text-gray-900 tabular-nums mt-1">
                {formatCurrency(order.fobValue)}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3 text-center">
              <p className="text-xs text-gray-500">Total Cost</p>
              <p className="text-sm font-bold text-gray-900 tabular-nums mt-1">
                {formatCurrency(order.totalCost)}
              </p>
            </div>
            <div
              className={cn(
                "rounded-lg border p-3 text-center",
                order.profit >= 0
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              )}
            >
              <p className="text-xs text-gray-500">Profit</p>
              <p
                className={cn(
                  "text-sm font-bold tabular-nums mt-1",
                  order.profit >= 0 ? "text-green-700" : "text-red-700"
                )}
              >
                {formatCurrency(order.profit)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Cost Breakdown with Horizontal Bars */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Cost Breakdown
            </h4>
            <div className="space-y-3">
              <CostBar
                label="Material Cost"
                value={order.materialCost}
                maxValue={maxCost}
                color="bg-blue-500"
              />
              <CostBar
                label="Production Cost"
                value={order.productionCost}
                maxValue={maxCost}
                color="bg-emerald-500"
              />
              <CostBar
                label="Dyeing Cost"
                value={order.dyeingCost}
                maxValue={maxCost}
                color="bg-purple-500"
              />
              <CostBar
                label="Overhead Cost"
                value={order.overheadCost}
                maxValue={maxCost}
                color="bg-orange-500"
              />
            </div>
          </div>

          <Separator />

          {/* Where Money Leaked */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Where Money Leaked
            </h4>
            {totalLeakage > 0 ? (
              <div className="space-y-3">
                {breakdown.fabricOverConsumption > 0 && (
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-orange-800">
                        Fabric Over-Consumption
                      </span>
                      <span className="text-sm font-bold text-orange-900 tabular-nums">
                        {formatCurrency(breakdown.fabricOverConsumption)}
                      </span>
                    </div>
                    <Input
                      placeholder="Add notes about this leakage..."
                      value={fabricNotes}
                      onChange={(e) => setFabricNotes(e.target.value)}
                      className="text-xs h-8 bg-white"
                    />
                  </div>
                )}
                {breakdown.reworkCost > 0 && (
                  <div className="rounded-lg border border-pink-200 bg-pink-50 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-pink-800">
                        Rework Cost
                      </span>
                      <span className="text-sm font-bold text-pink-900 tabular-nums">
                        {formatCurrency(breakdown.reworkCost)}
                      </span>
                    </div>
                    <Input
                      placeholder="Add notes about rework cost..."
                      value={reworkNotes}
                      onChange={(e) => setReworkNotes(e.target.value)}
                      className="text-xs h-8 bg-white"
                    />
                  </div>
                )}
                {breakdown.excessOvertime > 0 && (
                  <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <span className="text-xs font-medium text-blue-800">
                      Excess Overtime
                    </span>
                    <span className="text-sm font-bold text-blue-900 tabular-nums">
                      {formatCurrency(breakdown.excessOvertime)}
                    </span>
                  </div>
                )}
                {breakdown.reDyeingCost > 0 && (
                  <div className="flex items-center justify-between rounded-lg border border-purple-200 bg-purple-50 p-3">
                    <span className="text-xs font-medium text-purple-800">
                      Re-Dyeing Cost
                    </span>
                    <span className="text-sm font-bold text-purple-900 tabular-nums">
                      {formatCurrency(breakdown.reDyeingCost)}
                    </span>
                  </div>
                )}
                {breakdown.airShipmentPenalty > 0 && (
                  <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3">
                    <span className="text-xs font-medium text-red-800">
                      Air Shipment Penalty
                    </span>
                    <span className="text-sm font-bold text-red-900 tabular-nums">
                      {formatCurrency(breakdown.airShipmentPenalty)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between rounded-lg bg-gray-100 p-3 border border-gray-200">
                  <span className="text-xs font-semibold text-gray-800">
                    Total Leakage
                  </span>
                  <span className="text-sm font-bold text-red-700 tabular-nums">
                    {formatCurrency(totalLeakage)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
                <p className="text-sm text-green-700">
                  No significant cost leakage detected for this order.
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Add Cost Override */}
          <Dialog open={overrideOpen} onOpenChange={setOverrideOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Cost Override
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Cost Override - {order.orderNumber}</DialogTitle>
              </DialogHeader>
              <CostOverrideForm onClose={() => setOverrideOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </SheetContent>
    </Sheet>
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

  // Filters
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [buyerFilter, setBuyerFilter] = React.useState("all");
  const [marginThreshold, setMarginThreshold] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Sheet state
  const [selectedOrder, setSelectedOrder] =
    React.useState<OrderProfitability | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

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

  // Unique buyers for filter
  const uniqueBuyers = React.useMemo(() => {
    const buyers = new Set(orders.map((o) => o.buyer));
    return Array.from(buyers).sort();
  }, [orders]);

  // Computed stats
  const totalOrders = orders.length;
  const profitableOrders = orders.filter(
    (o) => o.profitCategory === "profitable"
  );
  const lossOrders = orders.filter((o) => o.profitCategory === "loss");

  // Filtered orders
  const filteredOrders = React.useMemo(() => {
    let result = [...orders];

    if (statusFilter !== "all") {
      result = result.filter((o) => {
        if (statusFilter === "active")
          return o.status === "confirmed" || o.status === "in_progress";
        if (statusFilter === "completed") return o.status === "completed";
        return true;
      });
    }

    if (buyerFilter !== "all") {
      result = result.filter((o) => o.buyer === buyerFilter);
    }

    if (marginThreshold > 0) {
      result = result.filter(
        (o) => Math.abs(o.marginPct) >= marginThreshold
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.buyer.toLowerCase().includes(q) ||
          o.product.toLowerCase().includes(q)
      );
    }

    return result;
  }, [orders, statusFilter, buyerFilter, marginThreshold, searchQuery]);

  // Donut data for profit distribution
  const donutData = React.useMemo(() => {
    const profitable = orders.filter(
      (o) => o.profitCategory === "profitable"
    ).length;
    const thinMargin = orders.filter(
      (o) => o.profitCategory === "thin_margin"
    ).length;
    const loss = orders.filter((o) => o.profitCategory === "loss").length;
    return [
      { label: "Profitable (>8%)", value: profitable, color: "#16a34a" },
      { label: "Thin Margin (0-8%)", value: thinMargin, color: "#f59e0b" },
      { label: "Loss Making (<0%)", value: loss, color: "#dc2626" },
    ].filter((d) => d.value > 0);
  }, [orders]);

  function handleTileClick(order: OrderProfitability) {
    setSelectedOrder(order);
    setSheetOpen(true);
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Order Profitability Heatmap"
          description="Visual margin analysis across all orders with drill-down cost breakdowns"
          breadcrumb={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Finance & P&L", href: "/finance" },
            { label: "Profitability Heatmap" },
          ]}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
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
          description="Visual margin analysis across all orders with drill-down cost breakdowns"
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
        description="Visual margin analysis across all orders with drill-down cost breakdowns"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Finance & P&L", href: "/finance" },
          { label: "Profitability Heatmap" },
        ]}
      />

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Orders Analyzed"
          value={formatNumber(totalOrders)}
          icon={<Grid3X3 className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Profitable Orders"
          value={formatNumber(profitableOrders.length)}
          icon={<TrendingUp className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Loss-Making Orders"
          value={formatNumber(lossOrders.length)}
          icon={<TrendingDown className="h-5 w-5" />}
          color="red"
        />
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters</span>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Buyer</Label>
              <Select value={buyerFilter} onValueChange={setBuyerFilter}>
                <SelectTrigger className="h-8 w-[150px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Buyers</SelectItem>
                  {uniqueBuyers.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-500">
                Margin Threshold: {marginThreshold}%
              </Label>
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={marginThreshold}
                onChange={(e) => setMarginThreshold(Number(e.target.value))}
                className="w-32 h-1.5 rounded-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="flex-1 min-w-[180px]">
              <Label className="text-xs text-gray-500">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  placeholder="Order, buyer, product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Heatmap Grid */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Grid3X3 className="mx-auto h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-900">
              No orders found
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {totalOrders === 0
                ? "Create sales orders and cost sheets to see the profitability heatmap."
                : "No orders match the current filters. Try adjusting your criteria."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredOrders.map((order) => {
            const style = getMarginStyle(order.profitCategory);

            return (
              <button
                key={order.id}
                onClick={() => handleTileClick(order)}
                className={cn(
                  "rounded-xl border border-gray-200 p-4 text-left transition-all hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
                  style.tileBg,
                  style.border
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-gray-800">
                    {order.orderNumber}
                  </span>
                  <Eye className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                </div>

                {/* Buyer / Product */}
                <p className="text-sm font-medium text-gray-900 truncate">
                  {order.buyer}
                </p>
                <p className="text-xs text-gray-600 truncate mt-0.5">
                  {order.product}
                </p>

                {/* Margin - Large Centered */}
                <div className="my-3 text-center">
                  <div
                    className={cn(
                      "inline-flex items-center justify-center rounded-xl px-4 py-2",
                      style.marginBg
                    )}
                  >
                    <span
                      className={cn(
                        "text-2xl font-bold tabular-nums",
                        style.marginText
                      )}
                    >
                      {order.marginPct > 0 ? "+" : ""}
                      {order.marginPct.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Total Value */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                  <span className="text-xs text-gray-500 tabular-nums">
                    {formatNumber(order.totalQty)} pcs
                  </span>
                  <span className="text-xs font-semibold text-gray-700 tabular-nums">
                    {formatCurrency(order.fobValue)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-gray-500">
        <span className="font-medium text-gray-700">Legend:</span>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-8 rounded bg-gradient-to-r from-green-200 to-emerald-200 border border-green-300" />
          <span>Profitable (&gt; 8%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-8 rounded bg-gradient-to-r from-amber-200 to-yellow-200 border border-amber-300" />
          <span>Thin Margin (0-8%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-8 rounded bg-gradient-to-r from-red-200 to-rose-200 border border-red-300" />
          <span>Loss (&lt; 0%)</span>
        </div>
      </div>

      {/* Donut Chart for Profit Distribution */}
      {orders.length > 0 && (
        <DonutChartCard
          title="Profit Distribution"
          data={donutData}
          centerLabel="orders"
          centerValue={totalOrders}
          formatTooltipValue={(value, label) =>
            `${value} order${value !== 1 ? "s" : ""}`
          }
        />
      )}

      {/* Drill-Down Sheet */}
      <OrderDetailSheet
        order={selectedOrder}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
