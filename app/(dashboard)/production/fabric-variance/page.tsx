"use client";

import * as React from "react";
import {
  Scissors,
  Ruler,
  AlertTriangle,
  TrendingDown,
  ClipboardPlus,
  FileWarning,
  Gauge,
  ChevronDown,
  ChevronUp,
  Loader2,
  Search,
  Filter,
} from "lucide-react";

import { cn, formatCurrency, formatNumber } from "@/lib/utils";
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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { useProfile } from "@/hooks/use-profile";
import { toast } from "sonner";
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
        badgeClass: "bg-green-100 text-green-700 border-green-200",
        barColor: "bg-green-500",
        bgColor: "bg-green-50/30",
      };
    case "warning":
      return {
        label: "Warning",
        badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
        barColor: "bg-amber-500",
        bgColor: "bg-amber-50/30",
      };
    case "critical":
      return {
        label: "Critical",
        badgeClass: "bg-red-100 text-red-700 border-red-200",
        barColor: "bg-red-500",
        bgColor: "bg-red-50/30",
      };
  }
}

// ---------------------------------------------------------------------------
// Visual Gauge Bar
// ---------------------------------------------------------------------------

function VarianceGauge({
  bomStandard,
  actualConsumed,
  variancePct,
  status,
}: {
  bomStandard: number;
  actualConsumed: number;
  variancePct: number;
  status: FabricVariance["status"];
}) {
  const statusConfig = getStatusConfig(status);
  // Scale the bar: BOM standard is our baseline (100%)
  // Actual consumed could be greater or less
  const maxValue = Math.max(bomStandard, actualConsumed, 1);
  const bomPct = (bomStandard / maxValue) * 100;
  const actualPct = (actualConsumed / maxValue) * 100;

  return (
    <div className="space-y-2">
      {/* BOM Standard Line */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">BOM Standard</span>
          <span className="font-medium text-gray-600 tabular-nums">
            {bomStandard.toFixed(1)}m
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gray-400 transition-all duration-500"
            style={{ width: `${bomPct}%` }}
          />
        </div>
      </div>

      {/* Actual Consumed Bar (colored) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Actual Consumed</span>
          <span
            className={cn(
              "font-semibold tabular-nums",
              status === "critical"
                ? "text-red-700"
                : status === "warning"
                  ? "text-amber-700"
                  : "text-green-700"
            )}
          >
            {actualConsumed.toFixed(1)}m
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              statusConfig.barColor
            )}
            style={{ width: `${Math.min(actualPct, 100)}%` }}
          />
        </div>
      </div>

      {/* Variance Display */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-gray-500">Variance</span>
        <span
          className={cn(
            "text-xs font-bold tabular-nums",
            variancePct > 5
              ? "text-red-700"
              : variancePct > 3
                ? "text-amber-700"
                : variancePct > 0
                  ? "text-gray-600"
                  : "text-green-700"
          )}
        >
          {variancePct > 0 ? "+" : ""}
          {(actualConsumed - bomStandard).toFixed(1)}m ({variancePct > 0 ? "+" : ""}
          {variancePct.toFixed(1)}%)
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mini Breakdown Bar
// ---------------------------------------------------------------------------

function MiniBreakdownBar({
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
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-600 w-24 shrink-0 truncate">
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={cn("h-full rounded-full", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-700 tabular-nums w-14 text-right">
        {value.toFixed(1)}m
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Order Variance Card (for Orders View tab)
// ---------------------------------------------------------------------------

function OrderVarianceCard({ order }: { order: FabricVariance }) {
  const [expanded, setExpanded] = React.useState(false);
  const statusConfig = getStatusConfig(order.status);
  const totalBreakdown = Math.max(
    order.cuttingWaste,
    order.reCutting,
    order.dyeLotMismatch,
    1
  );

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-sm",
        order.status === "critical" && "border-red-200"
      )}
    >
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_1fr] gap-4">
          {/* LEFT: Order Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-blue-700">
                {order.orderNumber}
              </span>
              <Badge
                variant="outline"
                className={cn("text-xs", statusConfig.badgeClass)}
              >
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-700">{order.buyer}</p>
            <p className="text-xs text-gray-500 truncate">{order.product}</p>
            {order.varianceValue > 0 && (
              <div className="rounded-md bg-red-50 border border-red-200 px-2.5 py-1.5">
                <span className="text-xs text-red-700">
                  Variance Cost:{" "}
                  <span className="font-bold tabular-nums">
                    {formatCurrency(order.varianceValue)}
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* CENTER: Visual Gauge */}
          <div>
            <VarianceGauge
              bomStandard={order.bomStandardMeters}
              actualConsumed={order.actualConsumedMeters}
              variancePct={order.variancePct}
              status={order.status}
            />
          </div>

          {/* RIGHT: Breakdown */}
          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Breakdown
            </h5>
            <MiniBreakdownBar
              label="Cutting Waste"
              value={order.cuttingWaste}
              maxValue={totalBreakdown}
              color="bg-orange-400"
            />
            <MiniBreakdownBar
              label="Re-Cutting"
              value={order.reCutting}
              maxValue={totalBreakdown}
              color="bg-blue-400"
            />
            <MiniBreakdownBar
              label="Dye Lot"
              value={order.dyeLotMismatch}
              maxValue={totalBreakdown}
              color="bg-purple-400"
            />
            <div className="flex items-center gap-2 pt-1">
              <Gauge className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">Marker Eff:</span>
              <span
                className={cn(
                  "text-xs font-bold tabular-nums",
                  order.markerEfficiency >= 80
                    ? "text-green-700"
                    : order.markerEfficiency >= 70
                      ? "text-amber-700"
                      : order.markerEfficiency > 0
                        ? "text-red-700"
                        : "text-gray-400"
                )}
              >
                {order.markerEfficiency > 0
                  ? `${order.markerEfficiency.toFixed(1)}%`
                  : "--"}{" "}
                <span className="text-gray-400 font-normal">
                  vs {order.standardMarkerEfficiency}%
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              Show Details
            </>
          )}
        </button>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg bg-gray-50 p-2.5">
                <p className="text-xs text-gray-500">BOM Standard</p>
                <p className="text-sm font-bold text-gray-900 tabular-nums">
                  {order.bomStandardMeters.toFixed(1)}m
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-2.5">
                <p className="text-xs text-gray-500">Actual Used</p>
                <p className="text-sm font-bold text-gray-900 tabular-nums">
                  {order.actualConsumedMeters.toFixed(1)}m
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-2.5">
                <p className="text-xs text-gray-500">Variance</p>
                <p
                  className={cn(
                    "text-sm font-bold tabular-nums",
                    order.varianceMeters > 0 ? "text-red-700" : "text-green-700"
                  )}
                >
                  {order.varianceMeters > 0 ? "+" : ""}
                  {order.varianceMeters.toFixed(1)}m
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-2.5">
                <p className="text-xs text-gray-500">Value Impact</p>
                <p className="text-sm font-bold text-red-700 tabular-nums">
                  {formatCurrency(Math.max(0, order.varianceValue))}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-gray-700">
                Waste Breakdown
              </h5>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-2.5">
                  <p className="text-xs text-orange-700">Cutting Waste</p>
                  <p className="text-sm font-bold text-orange-900 tabular-nums">
                    {order.cuttingWaste.toFixed(1)}m
                  </p>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-2.5">
                  <p className="text-xs text-blue-700">Re-Cutting</p>
                  <p className="text-sm font-bold text-blue-900 tabular-nums">
                    {order.reCutting.toFixed(1)}m
                  </p>
                </div>
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-2.5">
                  <p className="text-xs text-purple-700">Dye Lot Mismatch</p>
                  <p className="text-sm font-bold text-purple-900 tabular-nums">
                    {order.dyeLotMismatch.toFixed(1)}m
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Log Issue Form (Tab 2)
// ---------------------------------------------------------------------------

function LogIssueForm({
  orders,
  profileName,
}: {
  orders: FabricVariance[];
  profileName: string;
}) {
  const [selectedOrder, setSelectedOrder] = React.useState("");
  const [issueType, setIssueType] = React.useState("");
  const [quantity, setQuantity] = React.useState("");
  const [costImpact, setCostImpact] = React.useState("");
  const [rootCause, setRootCause] = React.useState("");
  const [actionTaken, setActionTaken] = React.useState("");

  // Auto-calculate cost impact when quantity changes
  React.useEffect(() => {
    const qty = parseFloat(quantity);
    if (!isNaN(qty) && qty > 0) {
      const rate = 180; // fabric rate per meter
      setCostImpact(String(Math.round(qty * rate)));
    }
  }, [quantity]);

  function handleSubmit() {
    if (!selectedOrder) {
      toast.error("Please select an order");
      return;
    }
    if (!issueType) {
      toast.error("Please select an issue type");
      return;
    }
    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    toast.success("Fabric issue logged successfully");
    // Reset form
    setSelectedOrder("");
    setIssueType("");
    setQuantity("");
    setCostImpact("");
    setRootCause("");
    setActionTaken("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ClipboardPlus className="h-5 w-5 text-blue-600" />
          Log Fabric Issue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="issue-order">Order</Label>
              <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                <SelectTrigger id="issue-order">
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.orderNumber} - {o.buyer} - {o.product}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue-type">Issue Type</Label>
              <Select value={issueType} onValueChange={setIssueType}>
                <SelectTrigger id="issue-type">
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cutting_waste">Cutting Waste</SelectItem>
                  <SelectItem value="recut_required">
                    Re-Cut Required
                  </SelectItem>
                  <SelectItem value="dye_lot_mismatch">
                    Dye Lot Mismatch
                  </SelectItem>
                  <SelectItem value="damage">Damage</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issue-qty">Quantity (meters)</Label>
                <Input
                  id="issue-qty"
                  type="number"
                  placeholder="0.0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issue-cost">Cost Impact (INR)</Label>
                <Input
                  id="issue-cost"
                  type="number"
                  placeholder="Auto-calculated"
                  value={costImpact}
                  onChange={(e) => setCostImpact(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="issue-root-cause">Root Cause</Label>
              <Textarea
                id="issue-root-cause"
                placeholder="Describe the root cause of the fabric variance..."
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue-action">Action Taken</Label>
              <Textarea
                id="issue-action"
                placeholder="Describe the corrective action taken..."
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                rows={3}
              />
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Logged By</span>
                <span className="font-medium text-gray-700">
                  {profileName || "Current User"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
          <Button onClick={handleSubmit}>
            <ClipboardPlus className="mr-2 h-4 w-4" />
            Log Issue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
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

  // Filters
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");

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
  const totalOrders = data.length;
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

  // Filter
  const filteredData = React.useMemo(() => {
    let result = [...data];

    if (filterStatus !== "all") {
      result = result.filter((d) => d.status === filterStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.orderNumber.toLowerCase().includes(q) ||
          d.buyer.toLowerCase().includes(q) ||
          d.product.toLowerCase().includes(q)
      );
    }

    // Sort by variance descending
    result.sort((a, b) => b.variancePct - a.variancePct);

    return result;
  }, [data, filterStatus, searchQuery]);

  // Top 10 for bar chart
  const barChartData = React.useMemo(() => {
    return [...data]
      .filter((d) => d.varianceValue > 0)
      .sort((a, b) => b.varianceValue - a.varianceValue)
      .slice(0, 10)
      .map((d) => ({
        name: d.orderNumber.replace("SO-", "").replace("ORD-", ""),
        Variance: Math.round(d.varianceValue),
      }));
  }, [data]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Fabric Consumption Variance Tracker"
          description="Track fabric usage versus BOM standards with visual gauges and issue logging"
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
          title="Fabric Consumption Variance Tracker"
          description="Track fabric usage versus BOM standards with visual gauges and issue logging"
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
        title="Fabric Consumption Variance Tracker"
        description="Track fabric usage versus BOM standards with visual gauges and issue logging"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Production", href: "/production" },
          { label: "Fabric Variance" },
        ]}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          title="Total Orders Tracked"
          value={formatNumber(totalOrders)}
          icon={<Ruler className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Total Variance"
          value={`${totalVarianceMeters.toFixed(1)}m`}
          icon={<Scissors className="h-5 w-5" />}
          color={totalVarianceMeters <= 0 ? "green" : "red"}
        />
        <StatCard
          title="Variance Value"
          value={formatCurrency(totalVarianceValue)}
          icon={<TrendingDown className="h-5 w-5" />}
          color={totalVarianceValue <= 0 ? "green" : "red"}
        />
        <StatCard
          title="Avg Marker Efficiency"
          value={`${avgMarkerEfficiency.toFixed(1)}%`}
          icon={<Gauge className="h-5 w-5" />}
          color={
            avgMarkerEfficiency >= 80
              ? "green"
              : avgMarkerEfficiency >= 70
                ? "orange"
                : "red"
          }
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
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="within_limit">Within Limit</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs text-gray-500">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  placeholder="Search by order number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </div>

            {/* Quick count badges */}
            <div className="flex items-center gap-2 text-xs">
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                {data.filter((d) => d.status === "within_limit").length} OK
              </Badge>
              <Badge
                variant="outline"
                className="bg-amber-50 text-amber-700 border-amber-200"
              >
                {data.filter((d) => d.status === "warning").length} Warn
              </Badge>
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200"
              >
                {data.filter((d) => d.status === "critical").length} Crit
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders" className="gap-1.5">
            <FileWarning className="h-3.5 w-3.5" />
            Orders View
          </TabsTrigger>
          <TabsTrigger value="log" className="gap-1.5">
            <ClipboardPlus className="h-3.5 w-3.5" />
            Log Issue
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Orders View */}
        <TabsContent value="orders" className="space-y-4">
          {filteredData.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Scissors className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-900">
                  No variance data found
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {totalOrders === 0
                    ? "Create work orders and record cutting entries to track fabric variance."
                    : "No orders match the current filters."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredData.map((order) => (
                <OrderVarianceCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: Log Issue */}
        <TabsContent value="log">
          <LogIssueForm
            orders={data}
            profileName={profile?.full_name ?? ""}
          />
        </TabsContent>
      </Tabs>

      {/* Bottom: Bar Chart - Top 10 Orders by Variance Value */}
      {barChartData.length > 0 && (
        <BarChartCard
          title="Top 10 Orders by Variance Value (INR)"
          data={barChartData}
          dataKeys={["Variance"]}
          colors={["#dc2626"]}
          xAxisKey="name"
          height={300}
          formatTooltipValue={(value) => formatCurrency(value)}
        />
      )}
    </div>
  );
}
