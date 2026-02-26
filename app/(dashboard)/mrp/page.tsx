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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MaterialRequirement {
  materialId: string;
  materialName: string;
  materialType: "fabric" | "trim" | "chemical" | "accessory";
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
  status: "planned" | "material_ready" | "in_production" | "confirmed";
  materials: MaterialRequirement[];
}

// ---------------------------------------------------------------------------
// Mock data  —  designed to showcase the MRP value clearly
// ---------------------------------------------------------------------------

const MOCK_MRP_ORDERS: MRPOrder[] = [
  {
    id: "1",
    orderNumber: "ORD-2026-0041",
    buyer: "H&M",
    style: "Men's Polo Shirt (Navy)",
    qty: 15000,
    deliveryDate: "2026-03-15",
    status: "confirmed",
    materials: [
      { materialId: "m1", materialName: "Cotton Pique Fabric (200 GSM)", materialType: "fabric", uom: "meter", requiredQty: 8663, availableStock: 3200, shortage: -5463 },
      { materialId: "m2", materialName: "Polyester Rib (Collar)", materialType: "fabric", uom: "meter", requiredQty: 1236, availableStock: 1800, shortage: 564 },
      { materialId: "m3", materialName: "Polo Buttons (Horn Look)", materialType: "trim", uom: "piece", requiredQty: 45900, availableStock: 60000, shortage: 14100 },
      { materialId: "m4", materialName: "Woven Brand Label", materialType: "trim", uom: "piece", requiredQty: 15000, availableStock: 8200, shortage: -6800 },
      { materialId: "m5", materialName: "Reactive Dye (Navy Blue)", materialType: "chemical", uom: "kg", requiredQty: 248, availableStock: 80, shortage: -168 },
      { materialId: "m6", materialName: "Sewing Thread (Polyester)", materialType: "trim", uom: "cone", requiredQty: 394, availableStock: 500, shortage: 106 },
    ],
  },
  {
    id: "2",
    orderNumber: "ORD-2026-0042",
    buyer: "Primark",
    style: "Kids Basic T-Shirt (White/Grey Mix)",
    qty: 30000,
    deliveryDate: "2026-03-22",
    status: "planned",
    materials: [
      { materialId: "m7", materialName: "Cotton Jersey (160 GSM)", materialType: "fabric", uom: "meter", requiredQty: 14175, availableStock: 9500, shortage: -4675 },
      { materialId: "m8", materialName: "Polyester Rib Neck", materialType: "fabric", uom: "meter", requiredQty: 1575, availableStock: 2100, shortage: 525 },
      { materialId: "m9", materialName: "Brand Label", materialType: "trim", uom: "piece", requiredQty: 30000, availableStock: 15000, shortage: -15000 },
      { materialId: "m10", materialName: "Care Label", materialType: "trim", uom: "piece", requiredQty: 30000, availableStock: 30000, shortage: 0 },
      { materialId: "m11", materialName: "Reactive Dye (Optical White)", materialType: "chemical", uom: "kg", requiredQty: 360, availableStock: 400, shortage: 40 },
      { materialId: "m12", materialName: "Polybag (S/M/L Mix)", materialType: "accessory", uom: "piece", requiredQty: 30000, availableStock: 12000, shortage: -18000 },
    ],
  },
  {
    id: "3",
    orderNumber: "ORD-2026-0039",
    buyer: "Zara",
    style: "Women's Chiffon Blouse (Assorted Colors)",
    qty: 8500,
    deliveryDate: "2026-04-05",
    status: "confirmed",
    materials: [
      { materialId: "m13", materialName: "Poly Chiffon Fabric (60 GSM)", materialType: "fabric", uom: "meter", requiredQty: 12852, availableStock: 14000, shortage: 1148 },
      { materialId: "m14", materialName: "Lining Fabric (Polyester)", materialType: "fabric", uom: "meter", requiredQty: 5355, availableStock: 6000, shortage: 645 },
      { materialId: "m15", materialName: "Pearl Buttons", materialType: "trim", uom: "piece", requiredQty: 59500, availableStock: 20000, shortage: -39500 },
      { materialId: "m16", materialName: "Brand Label", materialType: "trim", uom: "piece", requiredQty: 8500, availableStock: 8200, shortage: -300 },
      { materialId: "m17", materialName: "Sewing Thread (White/Black)", materialType: "trim", uom: "cone", requiredQty: 255, availableStock: 300, shortage: 45 },
    ],
  },
  {
    id: "4",
    orderNumber: "ORD-2026-0043",
    buyer: "Marks & Spencer",
    style: "Men's Oxford Shirt (Blue Stripe)",
    qty: 6000,
    deliveryDate: "2026-04-20",
    status: "planned",
    materials: [
      { materialId: "m18", materialName: "Cotton Poplin (110 GSM)", materialType: "fabric", uom: "meter", requiredQty: 9240, availableStock: 9500, shortage: 260 },
      { materialId: "m19", materialName: "Interlining (Collar/Cuff)", materialType: "fabric", uom: "meter", requiredQty: 1260, availableStock: 1400, shortage: 140 },
      { materialId: "m20", materialName: "Shell Buttons (White)", materialType: "trim", uom: "piece", requiredQty: 54000, availableStock: 60000, shortage: 6000 },
      { materialId: "m21", materialName: "Brand Label", materialType: "trim", uom: "piece", requiredQty: 6000, availableStock: 6000, shortage: 0 },
      { materialId: "m22", materialName: "Sewing Thread (Blue)", materialType: "trim", uom: "cone", requiredQty: 180, availableStock: 200, shortage: 20 },
    ],
  },
  {
    id: "5",
    orderNumber: "ORD-2026-0044",
    buyer: "Next",
    style: "Kids Fleece Hoodie (Red/Navy)",
    qty: 10000,
    deliveryDate: "2026-05-10",
    status: "planned",
    materials: [
      { materialId: "m23", materialName: "Fleece Fabric (280 GSM)", materialType: "fabric", uom: "meter", requiredQty: 8480, availableStock: 4000, shortage: -4480 },
      { materialId: "m24", materialName: "Poly Rib Fabric (Cuffs/Hem)", materialType: "fabric", uom: "meter", requiredQty: 1590, availableStock: 2000, shortage: 410 },
      { materialId: "m25", materialName: "YKK Zipper (Full Length)", materialType: "trim", uom: "piece", requiredQty: 10000, availableStock: 2500, shortage: -7500 },
      { materialId: "m26", materialName: "Brand Label", materialType: "trim", uom: "piece", requiredQty: 10000, availableStock: 10000, shortage: 0 },
      { materialId: "m27", materialName: "Polybag + Hanger", materialType: "accessory", uom: "piece", requiredQty: 10000, availableStock: 3000, shortage: -7000 },
    ],
  },
];

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
  const [orders] = React.useState<MRPOrder[]>(MOCK_MRP_ORDERS);
  const [selectedOrder, setSelectedOrder] = React.useState<MRPOrder | null>(
    MOCK_MRP_ORDERS[0]
  );
  const [running, setRunning] = React.useState(false);
  const [indentsRaised, setIndentsRaised] = React.useState(0);
  const [generatingAll, setGeneratingAll] = React.useState(false);

  const globalShortages = React.useMemo(() => buildGlobalShortages(orders), [orders]);

  // Stats
  const totalOrders = orders.length;
  const totalMaterials = orders.reduce((s, o) => s + o.materials.length, 0);
  const criticalShortages = globalShortages.length;
  const fullyCovered = orders.filter((o) => getMaterialCoverageStatus(o) === "full").length;
  const partiallyCovered = orders.filter((o) => getMaterialCoverageStatus(o) === "partial").length;
  const criticalGaps = orders.filter((o) => getMaterialCoverageStatus(o) === "critical").length;

  function handleRunMRP() {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      toast.success("MRP Run Complete", {
        description: `Analysed ${totalOrders} orders. Found ${criticalShortages} shortages across ${totalMaterials} material requirements.`,
      });
    }, 1800);
  }

  function handleRaiseIndent(material: MaterialRequirement, orderNumber: string) {
    toast.success(`Purchase Indent Raised`, {
      description: `${Math.abs(material.shortage).toLocaleString()} ${material.uom} of ${material.materialName} for ${orderNumber}`,
    });
    setIndentsRaised((n) => n + 1);
  }

  function handleGenerateAllIndents() {
    setGeneratingAll(true);
    setTimeout(() => {
      setGeneratingAll(false);
      const count = globalShortages.length;
      setIndentsRaised((n) => n + count);
      toast.success("All Purchase Indents Generated", {
        description: `${count} material indents have been raised and sent to Purchase team.`,
      });
    }, 1200);
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
              style={{ width: `${(fullyCovered / totalOrders) * 100}%` }}
              title={`Fully Covered: ${fullyCovered} orders`}
            />
            <div
              className="bg-amber-400 transition-all"
              style={{ width: `${(partiallyCovered / totalOrders) * 100}%` }}
              title={`Partially Covered: ${partiallyCovered} orders`}
            />
            <div
              className="bg-red-500 transition-all"
              style={{ width: `${(criticalGaps / totalOrders) * 100}%` }}
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
