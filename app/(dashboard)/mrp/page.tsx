"use client";

import * as React from "react";
import {
  ClipboardList,
  AlertTriangle,
  ShoppingCart,
  PackageSearch,
  Play,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  TrendingDown,
  Circle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { cn, formatDate, formatNumber } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import type { StatusConfig } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCompany } from "@/contexts/company-context";
import { getMRPData, generatePurchaseIndents } from "@/lib/actions/mrp";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MaterialRequirement {
  materialId: string;
  materialName: string;
  materialType: string;
  uom: string;
  requiredQty: number;
  availableStock: number;
  shortage: number; // negative = shortfall
}

interface MRPOrder {
  id: string;
  orderNumber: string;
  buyer: string;
  style: string;
  qty: number;
  deliveryDate: string;
  status: string;
  materials: MaterialRequirement[];
}

// ---------------------------------------------------------------------------
// Status configs
// ---------------------------------------------------------------------------

const ORDER_STATUS_MAP: Record<string, StatusConfig> = {
  planned: { label: "Planned", color: "gray" },
  confirmed: { label: "Confirmed", color: "blue" },
  material_ready: { label: "Material Ready", color: "green" },
  in_production: { label: "In Production", color: "amber" },
};

const TYPE_COLORS: Record<string, string> = {
  fabric: "text-blue-700 bg-blue-50 border-blue-200",
  trim: "text-green-700 bg-green-50 border-green-200",
  chemical: "text-amber-700 bg-amber-50 border-amber-200",
  accessory: "text-purple-700 bg-purple-50 border-purple-200",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getMaterialCoverageStatus(order: MRPOrder): "full" | "partial" | "critical" {
  const shortages = order.materials.filter((m) => m.shortage < 0);
  if (shortages.length === 0) return "full";
  if (shortages.length <= order.materials.length / 2) return "partial";
  return "critical";
}

function getCoveragePercent(order: MRPOrder): number {
  const sufficient = order.materials.filter((m) => m.shortage >= 0).length;
  return order.materials.length > 0
    ? Math.round((sufficient / order.materials.length) * 100)
    : 100;
}

function getDaysUntilDelivery(date: string): number {
  const now = new Date();
  const target = new Date(date);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ---------------------------------------------------------------------------
// Aggregate all shortages across all orders
// ---------------------------------------------------------------------------

function buildGlobalShortages(orders: MRPOrder[]) {
  const map = new Map<
    string,
    { name: string; type: string; uom: string; totalShortage: number; orders: string[]; earliestDelivery: string }
  >();

  for (const order of orders) {
    for (const mat of order.materials) {
      if (mat.shortage < 0) {
        const existing = map.get(mat.materialId);
        if (existing) {
          existing.totalShortage += Math.abs(mat.shortage);
          existing.orders.push(order.orderNumber);
          if (order.deliveryDate < existing.earliestDelivery) {
            existing.earliestDelivery = order.deliveryDate;
          }
        } else {
          map.set(mat.materialId, {
            name: mat.materialName,
            type: mat.materialType,
            uom: mat.uom,
            totalShortage: Math.abs(mat.shortage),
            orders: [order.orderNumber],
            earliestDelivery: order.deliveryDate,
          });
        }
      }
    }
  }

  return Array.from(map.entries())
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => new Date(a.earliestDelivery).getTime() - new Date(b.earliestDelivery).getTime());
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function MRPPage() {
  const { companyId, userId } = useCompany();
  const [orders, setOrders] = React.useState<MRPOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = React.useState<MRPOrder | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [running, setRunning] = React.useState(false);
  const [indentsRaised, setIndentsRaised] = React.useState(0);
  const [generatingAll, setGeneratingAll] = React.useState(false);

  // Fetch MRP data
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await getMRPData(companyId);
      if (error) {
        toast.error("Failed to load MRP data", { description: error });
        return;
      }
      if (data) {
        const mapped: MRPOrder[] = data.orders.map((o) => ({
          id: o.orderId,
          orderNumber: o.orderNumber,
          buyer: o.buyer,
          style: o.styleName,
          qty: o.quantity,
          deliveryDate: o.deliveryDate,
          status: o.status,
          materials: o.materials.map((m) => ({
            materialId: m.materialId,
            materialName: m.materialName,
            materialType: m.materialType,
            uom: m.uom,
            requiredQty: m.requiredQty,
            availableStock: m.availableStock,
            shortage: m.shortage,
          })),
        }));
        setOrders(mapped);
        setIndentsRaised(data.summary.indentsRaised);
        if (mapped.length > 0 && !selectedOrder) {
          setSelectedOrder(mapped[0]);
        }
      }
    } catch {
      toast.error("Failed to load MRP data");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update selected order when orders change (keep the same order selected)
  React.useEffect(() => {
    if (selectedOrder && orders.length > 0) {
      const updated = orders.find((o) => o.id === selectedOrder.id);
      if (updated) {
        setSelectedOrder(updated);
      }
    }
  }, [orders]);

  const globalShortages = React.useMemo(() => buildGlobalShortages(orders), [orders]);

  // Stats
  const totalOrders = orders.length;
  const totalMaterials = orders.reduce((s, o) => s + o.materials.length, 0);
  const criticalShortages = globalShortages.length;
  const fullyCovered = orders.filter((o) => getMaterialCoverageStatus(o) === "full").length;
  const partiallyCovered = orders.filter((o) => getMaterialCoverageStatus(o) === "partial").length;
  const criticalGaps = orders.filter((o) => getMaterialCoverageStatus(o) === "critical").length;

  async function handleRunMRP() {
    setRunning(true);
    try {
      const { data, error } = await getMRPData(companyId);
      if (error) {
        toast.error("MRP Run Failed", { description: error });
        return;
      }
      if (data) {
        const mapped: MRPOrder[] = data.orders.map((o) => ({
          id: o.orderId,
          orderNumber: o.orderNumber,
          buyer: o.buyer,
          style: o.styleName,
          qty: o.quantity,
          deliveryDate: o.deliveryDate,
          status: o.status,
          materials: o.materials.map((m) => ({
            materialId: m.materialId,
            materialName: m.materialName,
            materialType: m.materialType,
            uom: m.uom,
            requiredQty: m.requiredQty,
            availableStock: m.availableStock,
            shortage: m.shortage,
          })),
        }));
        setOrders(mapped);
        if (mapped.length > 0) {
          setSelectedOrder(mapped[0]);
        }
        const newShortages = buildGlobalShortages(mapped);
        toast.success("MRP Run Complete", {
          description: `Analysed ${data.summary.totalOpenOrders} orders. Found ${newShortages.length} shortages across ${data.summary.totalMaterialsRequired} material requirements.`,
        });
      }
    } catch {
      toast.error("MRP Run Failed");
    } finally {
      setRunning(false);
    }
  }

  async function handleRaiseIndent(material: MaterialRequirement, orderNumber: string) {
    try {
      const { error } = await generatePurchaseIndents(companyId, userId, [
        {
          materialId: material.materialId,
          materialName: material.materialName,
          materialType: material.materialType,
          requiredQty: material.requiredQty,
          shortageQty: Math.abs(material.shortage),
          uom: material.uom,
          orderId: selectedOrder?.id,
        },
      ]);
      if (error) {
        toast.error("Failed to raise indent", { description: error });
        return;
      }
      toast.success(`Purchase Indent Raised`, {
        description: `${Math.abs(material.shortage).toLocaleString()} ${material.uom} of ${material.materialName} for ${orderNumber}`,
      });
      setIndentsRaised((n) => n + 1);
    } catch {
      toast.error("Failed to raise indent");
    }
  }

  async function handleGenerateAllIndents() {
    setGeneratingAll(true);
    try {
      const shortItems = orders.flatMap((order) =>
        order.materials
          .filter((m) => m.shortage < 0)
          .map((m) => ({
            materialId: m.materialId,
            materialName: m.materialName,
            materialType: m.materialType,
            requiredQty: m.requiredQty,
            shortageQty: Math.abs(m.shortage),
            uom: m.uom,
            orderId: order.id,
          }))
      );

      if (shortItems.length === 0) {
        toast.info("No shortages to generate indents for");
        return;
      }

      const { error } = await generatePurchaseIndents(companyId, userId, shortItems);
      if (error) {
        toast.error("Failed to generate indents", { description: error });
        return;
      }
      const count = globalShortages.length;
      setIndentsRaised((n) => n + count);
      toast.success("All Purchase Indents Generated", {
        description: `${count} material indents have been raised and sent to Purchase team.`,
      });
    } catch {
      toast.error("Failed to generate indents");
    } finally {
      setGeneratingAll(false);
    }
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
      {/* Page header */}
      <PageHeader
        title="Material Requirements Planning"
        description="Auto-calculate what to buy based on confirmed orders and BOM. Identify shortages before they delay production."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "MRP" },
        ]}
        actions={
          <Button onClick={handleRunMRP} disabled={running}>
            {running ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running MRP...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run MRP
              </>
            )}
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            title: "Open Orders Planned",
            value: totalOrders,
            icon: ClipboardList,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            title: "Materials Required",
            value: totalMaterials,
            icon: PackageSearch,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
          },
          {
            title: "Critical Shortages",
            value: criticalShortages,
            icon: AlertTriangle,
            color: "text-red-600",
            bg: "bg-red-50",
          },
          {
            title: "Purchase Indents Raised",
            value: indentsRaised,
            icon: ShoppingCart,
            color: "text-green-600",
            bg: "bg-green-50",
          },
        ].map((card) => (
          <Card key={card.title}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 leading-tight">
                    {card.title}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-2xl font-black tabular-nums",
                      card.title === "Critical Shortages" && criticalShortages > 0
                        ? "text-red-600"
                        : "text-gray-900"
                    )}
                  >
                    {card.value}
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

      {/* Material Coverage Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">
              Material Coverage Summary
            </h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Fully Covered ({fullyCovered})
              </span>
              <span className="flex items-center gap-1.5 text-amber-700">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Partially Covered ({partiallyCovered})
              </span>
              <span className="flex items-center gap-1.5 text-red-700">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Critical Gaps ({criticalGaps})
              </span>
            </div>
          </div>

          <div className="flex h-6 rounded-full overflow-hidden border border-gray-200">
            <div
              className="bg-green-500 transition-all"
              style={{ width: `${totalOrders > 0 ? (fullyCovered / totalOrders) * 100 : 0}%` }}
              title={`Fully Covered: ${fullyCovered} orders`}
            />
            <div
              className="bg-amber-400 transition-all"
              style={{ width: `${totalOrders > 0 ? (partiallyCovered / totalOrders) * 100 : 0}%` }}
              title={`Partially Covered: ${partiallyCovered} orders`}
            />
            <div
              className="bg-red-500 transition-all"
              style={{ width: `${totalOrders > 0 ? (criticalGaps / totalOrders) * 100 : 0}%` }}
              title={`Critical Gaps: ${criticalGaps} orders`}
            />
          </div>

          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
            <span>
              {fullyCovered} of {totalOrders} orders have all materials available
            </span>
            {criticalShortages > 0 && (
              <>
                <span className="text-gray-300">|</span>
                <span className="text-red-600 font-medium">
                  {criticalShortages} unique materials short — immediate procurement action needed
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Two-panel layout */}
      <div className="flex gap-5 items-start">
        {/* Left: Orders List */}
        <div className="w-80 shrink-0 space-y-2">
          <h3 className="text-sm font-semibold text-gray-700 px-1">
            Open Orders ({orders.length})
          </h3>
          {orders.map((order) => {
            const coverage = getMaterialCoverageStatus(order);
            const pct = getCoveragePercent(order);
            const daysLeft = getDaysUntilDelivery(order.deliveryDate);
            const isSelected = selectedOrder?.id === order.id;

            return (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={cn(
                  "w-full text-left rounded-xl border p-3.5 transition-all",
                  isSelected
                    ? "border-blue-300 bg-blue-50 shadow-sm ring-1 ring-blue-200"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono font-semibold text-blue-600">
                      {order.orderNumber}
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">
                      {order.style}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{order.buyer}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <StatusBadge
                      status={order.status}
                      statusMap={ORDER_STATUS_MAP}
                    />
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        daysLeft < 15 ? "text-red-600" : daysLeft < 30 ? "text-amber-600" : "text-gray-500"
                      )}
                    >
                      {daysLeft}d left
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <Progress
                    value={pct}
                    className={cn(
                      "h-1.5 flex-1",
                      coverage === "full"
                        ? "[&>div]:bg-green-500"
                        : coverage === "partial"
                        ? "[&>div]:bg-amber-500"
                        : "[&>div]:bg-red-500"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-semibold tabular-nums",
                      coverage === "full"
                        ? "text-green-600"
                        : coverage === "partial"
                        ? "text-amber-600"
                        : "text-red-600"
                    )}
                  >
                    {pct}%
                  </span>
                </div>

                <div className="mt-1.5 flex items-center justify-between text-xs text-gray-400">
                  <span>{formatNumber(order.qty)} pcs</span>
                  <span>Ship: {formatDate(order.deliveryDate)}</span>
                </div>

                {coverage !== "full" && (
                  <div
                    className={cn(
                      "mt-1.5 flex items-center gap-1 text-xs font-medium",
                      coverage === "critical" ? "text-red-600" : "text-amber-600"
                    )}
                  >
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    {order.materials.filter((m) => m.shortage < 0).length} material(s) short
                  </div>
                )}
              </button>
            );
          })}

          {orders.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <PackageSearch className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No open orders found</p>
              <p className="text-xs mt-1">Orders with BOM assigned will appear here</p>
            </div>
          )}
        </div>

        {/* Right: Material Requirements for selected order */}
        <div className="flex-1 min-w-0 space-y-4">
          {selectedOrder ? (
            <>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Material Requirements
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedOrder.orderNumber} &mdash; {selectedOrder.style} &mdash; {formatNumber(selectedOrder.qty)} pcs &mdash; Delivery: {formatDate(selectedOrder.deliveryDate)}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {selectedOrder.materials.filter((m) => m.shortage >= 0).length} OK
                  </span>
                  <span className="flex items-center gap-1 text-red-600 font-medium">
                    <XCircle className="h-3.5 w-3.5" />
                    {selectedOrder.materials.filter((m) => m.shortage < 0).length} Short
                  </span>
                </div>
              </div>

              {/* Material table */}
              <Card>
                <CardContent className="p-0">
                  {selectedOrder.materials.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold w-[260px]">Material</TableHead>
                          <TableHead className="text-xs font-semibold">Type</TableHead>
                          <TableHead className="text-xs font-semibold text-right">Required</TableHead>
                          <TableHead className="text-xs font-semibold text-right">In Stock</TableHead>
                          <TableHead className="text-xs font-semibold text-right">Shortage</TableHead>
                          <TableHead className="text-xs font-semibold text-right">UOM</TableHead>
                          <TableHead className="text-xs font-semibold text-center">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.materials.map((mat) => {
                          const isShort = mat.shortage < 0;
                          return (
                            <TableRow
                              key={mat.materialId}
                              className={cn(
                                "transition-colors",
                                isShort ? "bg-red-50/50 hover:bg-red-50" : "hover:bg-green-50/30"
                              )}
                            >
                              <TableCell className="text-sm font-medium text-gray-900">
                                {mat.materialName}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={cn(
                                    "inline-block rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
                                    TYPE_COLORS[mat.materialType] ?? "bg-gray-100 text-gray-600 border-gray-200"
                                  )}
                                >
                                  {mat.materialType}
                                </span>
                              </TableCell>
                              <TableCell className="text-right text-sm tabular-nums font-medium text-gray-800">
                                {formatNumber(mat.requiredQty)}
                              </TableCell>
                              <TableCell className="text-right text-sm tabular-nums text-gray-600">
                                {formatNumber(mat.availableStock)}
                              </TableCell>
                              <TableCell className="text-right">
                                {isShort ? (
                                  <span className="inline-flex items-center gap-1 text-sm font-bold text-red-600 tabular-nums">
                                    <TrendingDown className="h-3.5 w-3.5" />
                                    {formatNumber(Math.abs(mat.shortage))}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-600 tabular-nums">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    +{formatNumber(mat.shortage)}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right text-xs text-gray-400">
                                {mat.uom}
                              </TableCell>
                              <TableCell className="text-center">
                                {isShort ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                                    onClick={() =>
                                      handleRaiseIndent(mat, selectedOrder.orderNumber)
                                    }
                                  >
                                    Raise Indent
                                  </Button>
                                ) : (
                                  <span className="text-xs text-green-600 font-medium">
                                    Sufficient
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="py-10 text-center text-gray-400">
                      <p className="text-sm">No BOM assigned to this order</p>
                      <p className="text-xs mt-1">Assign a BOM to see material requirements</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
              <PackageSearch className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">Select an order from the left to view material requirements</p>
            </div>
          )}
        </div>
      </div>

      {/* Global Shortage Summary */}
      {globalShortages.length > 0 && (
        <Card>
          <CardContent className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Global Shortage Summary
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  All materials short across all open orders, sorted by urgency (earliest delivery first)
                </p>
              </div>
              <Button
                onClick={handleGenerateAllIndents}
                disabled={generatingAll}
                variant="destructive"
                size="sm"
              >
                {generatingAll ? (
                  <>
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                    Generate All Indents ({globalShortages.length})
                  </>
                )}
              </Button>
            </div>

            {/* Table */}
            <Table>
              <TableHeader>
                <TableRow className="bg-red-50/50">
                  <TableHead className="text-xs font-semibold">Material Name</TableHead>
                  <TableHead className="text-xs font-semibold">Type</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Total Shortage</TableHead>
                  <TableHead className="text-xs font-semibold">UOM</TableHead>
                  <TableHead className="text-xs font-semibold">Affected Orders</TableHead>
                  <TableHead className="text-xs font-semibold">Earliest Delivery</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Urgency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {globalShortages.map((item, idx) => {
                  const daysLeft = getDaysUntilDelivery(item.earliestDelivery);
                  const urgency =
                    daysLeft < 14 ? "critical" : daysLeft < 30 ? "high" : "medium";

                  return (
                    <TableRow key={item.id} className="hover:bg-red-50/30">
                      <TableCell className="text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <span className="text-red-400 text-xs font-mono">
                            #{String(idx + 1).padStart(2, "0")}
                          </span>
                          {item.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-block rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
                            TYPE_COLORS[item.type] ?? "bg-gray-100 text-gray-600 border-gray-200"
                          )}
                        >
                          {item.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-bold text-red-600 tabular-nums">
                          {formatNumber(Math.round(item.totalShortage))}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-gray-400">
                        {item.uom}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {item.orders.map((o) => (
                            <span
                              key={o}
                              className="inline-block bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded font-mono"
                            >
                              {o}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        <span
                          className={cn(
                            "font-medium",
                            daysLeft < 14 ? "text-red-600" : daysLeft < 30 ? "text-amber-600" : "text-gray-600"
                          )}
                        >
                          {formatDate(item.earliestDelivery)}
                          <span className="ml-1.5 text-xs text-gray-400">
                            ({daysLeft}d)
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border",
                            urgency === "critical"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : urgency === "high"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          )}
                        >
                          <Circle className="h-1.5 w-1.5 fill-current shrink-0" />
                          {urgency === "critical" ? "Critical" : urgency === "high" ? "High" : "Medium"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Footer note */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center gap-2 text-xs text-gray-500">
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              Click <span className="font-semibold text-gray-700">Generate All Indents</span> to automatically create purchase indents for all shortage items and notify the Purchase team.
            </div>
          </CardContent>
        </Card>
      )}

      {globalShortages.length === 0 && (
        <Card>
          <CardContent className="py-10 flex flex-col items-center text-center gap-3">
            <CheckCircle2 className="h-12 w-12 text-green-400" />
            <div>
              <p className="text-sm font-semibold text-gray-800">
                All Materials Covered
              </p>
              <p className="text-xs text-gray-500 mt-1">
                All open orders have sufficient material stock. No purchase indents required.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
