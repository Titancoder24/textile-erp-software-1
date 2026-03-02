"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Package,
  User,
  Hash,
  Clock,
  Pencil,
  Loader2,
} from "lucide-react";

import { cn, formatDate, formatDateTime, getDaysRemaining, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import {
  OrderProgressTracker,
  buildDefaultStages,
} from "@/app/(dashboard)/orders/components/order-progress-tracker";
import { useCompany } from "@/contexts/company-context";
import { getOrder, createOrderComment } from "@/lib/actions/orders";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// TNA status badge
// ---------------------------------------------------------------------------

const TNA_STATUS_MAP = {
  done: "bg-green-50 text-green-700 border border-green-200",
  completed: "bg-green-50 text-green-700 border border-green-200",
  in_progress: "bg-blue-50 text-blue-700 border border-blue-200",
  pending: "bg-gray-100 text-gray-600 border border-gray-200",
  delayed: "bg-red-50 text-red-700 border border-red-200",
};

const TNA_STATUS_LABELS = {
  done: "Done",
  completed: "Done",
  in_progress: "In Progress",
  pending: "Pending",
  delayed: "Delayed",
};

function TNAStatusBadge({ status }: { status: string }) {
  const cls = TNA_STATUS_MAP[status as keyof typeof TNA_STATUS_MAP] ?? TNA_STATUS_MAP.pending;
  const label = TNA_STATUS_LABELS[status as keyof typeof TNA_STATUS_LABELS] ?? status;
  return (
    <span className={cn("inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold", cls)}>
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Helpers to derive current production stage from order status / work orders
// ---------------------------------------------------------------------------

function deriveCurrentStage(
  orderStatus: string,
  workOrders: { status: string }[],
  productionStats: { cut_qty: number; sewed_qty: number; finished_qty: number; packed_qty: number }
): string {
  if (orderStatus === "shipped" || orderStatus === "delivered") return "shipped";
  if (orderStatus === "ready_to_ship") return "packing";

  // Derive from production stats
  if (productionStats.packed_qty > 0) return "packing";
  if (productionStats.finished_qty > 0) return "finishing";
  if (productionStats.sewed_qty > 0) return "sewing";
  if (productionStats.cut_qty > 0) return "cutting";

  // Check work order statuses
  const hasActiveWO = workOrders.some(
    (wo) => wo.status === "in_progress" || wo.status === "started"
  );
  if (hasActiveWO) return "cutting";

  if (orderStatus === "in_production") return "material_sourcing";
  if (orderStatus === "confirmed") return "material_sourcing";

  return "material_sourcing";
}

// ---------------------------------------------------------------------------
// Parse color/size matrix from DB JSON
// ---------------------------------------------------------------------------

interface ColorSizeEntry {
  color: string;
  sizes: Record<string, number>;
}

function parseColorSizeMatrix(
  matrix: unknown
): { colors: string[]; sizes: string[]; data: Record<string, Record<string, number>> } {
  const result: Record<string, Record<string, number>> = {};
  const allSizes = new Set<string>();
  const colorOrder: string[] = [];

  if (!matrix || !Array.isArray(matrix)) {
    return { colors: [], sizes: [], data: {} };
  }

  for (const entry of matrix as ColorSizeEntry[]) {
    if (!entry.color) continue;
    colorOrder.push(entry.color);
    result[entry.color] = {};
    if (entry.sizes && typeof entry.sizes === "object") {
      for (const [size, qty] of Object.entries(entry.sizes)) {
        allSizes.add(size);
        result[entry.color][size] = Number(qty) || 0;
      }
    }
  }

  return {
    colors: colorOrder,
    sizes: Array.from(allSizes),
    data: result,
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
type OrderData = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { companyId, userId, profile } = useCompany();

  const [order, setOrder] = React.useState<OrderData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [commentText, setCommentText] = React.useState("");
  const [postingComment, setPostingComment] = React.useState(false);

  const fetchOrder = React.useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    const { data, error } = await getOrder(orderId);
    if (error) {
      toast.error("Failed to load order", { description: error });
    } else {
      setOrder(data);
    }
    setLoading(false);
  }, [orderId]);

  React.useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handlePostComment = React.useCallback(async () => {
    if (!commentText.trim() || !orderId) return;
    setPostingComment(true);
    const { data, error } = await createOrderComment(
      companyId,
      orderId,
      commentText,
      userId
    );
    if (error) {
      toast.error("Failed to post comment", { description: error });
    } else if (data) {
      setOrder((prev: OrderData) =>
        prev ? { ...prev, comments: [...(prev.comments ?? []), data] } : prev
      );
      setCommentText("");
      toast.success("Comment posted");
    }
    setPostingComment(false);
  }, [commentText, orderId, companyId, userId]);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not found state
  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="gap-1.5">
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4" />
              Orders
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="flex h-40 items-center justify-center p-6">
            <p className="text-sm text-gray-400">Order not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Map DB fields
  const orderNumber = order.order_number ?? "";
  const buyerName = order.buyers?.name ?? "Unknown Buyer";
  const styleName = order.product_name ?? order.products?.name ?? "Unknown Style";
  const totalQty = order.total_quantity ?? 0;
  const fobPrice = Number(order.fob_price) || 0;
  const currency = order.currency ?? "USD";
  const orderDate = order.order_date ?? "";
  const deliveryDate = order.delivery_date ?? "";
  const status = order.status ?? "confirmed";
  const specialInstructions = order.special_instructions ?? "";

  const daysLeft = deliveryDate ? getDaysRemaining(deliveryDate) : 0;

  // Color-size matrix
  const csMatrix = parseColorSizeMatrix(order.color_size_matrix);
  const colors = csMatrix.colors;
  const sizes = csMatrix.sizes;
  const colorSizeData = csMatrix.data;

  // Production stats
  const productionStats = order.production_stats ?? {
    cut_qty: 0,
    sewed_qty: 0,
    finished_qty: 0,
    packed_qty: 0,
  };

  // Derive current production stage
  const currentStage = deriveCurrentStage(status, order.work_orders ?? [], productionStats);
  const stages = buildDefaultStages(currentStage);

  // TNA milestones
  const tnaItems = (order.tna_milestones ?? []).map((m: any) => ({
    milestone: m.milestone_name ?? "",
    planned: m.planned_date ?? "",
    actual: m.actual_date ?? null,
    status: m.status ?? "pending",
  }));

  // Amendments
  const amendments = (order.amendments ?? []).map((a: any, idx: number) => ({
    id: `A${idx + 1}`,
    date: a.created_at ?? "",
    field: a.field_name ?? "",
    oldValue: a.old_value ?? "",
    newValue: a.new_value ?? "",
    reason: a.reason ?? "",
    by: a.profiles?.full_name ?? "Unknown",
  }));

  // Comments
  const comments = (order.comments ?? []).map((c: any) => ({
    id: c.id,
    author: c.profiles?.full_name ?? "Unknown",
    role: c.profiles?.role ?? "",
    timestamp: c.created_at ? formatDateTime(c.created_at) : "",
    text: c.content ?? "",
  }));

  // Matrix totals
  const sizeTotal = (size: string) =>
    colors.reduce((sum, color) => sum + (colorSizeData[color]?.[size] ?? 0), 0);
  const colorTotal = (color: string) => {
    const row = colorSizeData[color];
    if (!row) return 0;
    return Object.values(row).reduce((sum, v) => sum + v, 0);
  };
  const grandTotal = colors.reduce((sum, c) => sum + colorTotal(c), 0);

  return (
    <div className="space-y-6">
      {/* Back + actions */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="gap-1.5">
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4" />
            Orders
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex-1" />
        <Button variant="outline" size="sm">
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Edit Order
        </Button>
      </div>

      {/* Header card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-black text-gray-900 font-mono">
                  {orderNumber}
                </h1>
                <OrderStatusBadge status={status} />
                {daysLeft < 0 ? (
                  <Badge className="bg-red-100 text-red-700 border border-red-200">
                    {Math.abs(daysLeft)}d Overdue
                  </Badge>
                ) : daysLeft < 7 ? (
                  <Badge className="bg-red-50 text-red-600 border border-red-200">
                    {daysLeft}d left - Critical
                  </Badge>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-4 text-sm">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <User className="h-3.5 w-3.5 text-gray-400" />
                  <span className="font-medium">{buyerName}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Package className="h-3.5 w-3.5 text-gray-400" />
                  <span>{styleName}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Hash className="h-3.5 w-3.5 text-gray-400" />
                  <span className="font-semibold tabular-nums">
                    {totalQty.toLocaleString()} pcs
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <span className="text-gray-400 font-mono text-xs">$</span>
                  <span className="font-semibold tabular-nums">
                    {currency} {fobPrice.toFixed(2)} FOB
                  </span>
                </div>
                {orderDate && (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span>Order: {formatDate(orderDate)}</span>
                  </div>
                )}
                {deliveryDate && (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span>Delivery: {formatDate(deliveryDate)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  <span
                    className={cn(
                      "font-bold",
                      daysLeft < 0
                        ? "text-red-600"
                        : daysLeft < 7
                        ? "text-red-500"
                        : daysLeft <= 15
                        ? "text-yellow-600"
                        : "text-green-600"
                    )}
                  >
                    {daysLeft < 0
                      ? `${Math.abs(daysLeft)} days overdue`
                      : `${daysLeft} days remaining`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <span className="text-gray-400 text-xs">Total:</span>
                  <span className="font-bold text-gray-900 tabular-nums">
                    {currency}{" "}
                    {(totalQty * fobPrice).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap gap-1 bg-gray-100 p-1">
          {[
            "overview",
            "production",
            "materials",
            "quality",
            "samples",
            "shipment",
            "tna",
            "amendments",
            "communication",
          ].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="capitalize text-xs sm:text-sm"
            >
              {tab === "tna" ? "TNA" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Total Quantity
                  </p>
                  <p className="mt-1 text-2xl font-black tabular-nums text-gray-900">
                    {totalQty.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">pieces</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    FOB Value
                  </p>
                  <p className="mt-1 text-2xl font-black tabular-nums text-gray-900">
                    ${(totalQty * fobPrice / 1000).toFixed(1)}K
                  </p>
                  <p className="text-xs text-gray-400">{currency}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Colors
                  </p>
                  <p className="mt-1 text-2xl font-black tabular-nums text-gray-900">
                    {colors.length}
                  </p>
                  <p className="text-xs text-gray-400">
                    {colors.length > 0 ? colors.join(", ") : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Sizes
                  </p>
                  <p className="mt-1 text-2xl font-black tabular-nums text-gray-900">
                    {sizes.length}
                  </p>
                  <p className="text-xs text-gray-400">
                    {sizes.length > 0 ? sizes.join(", ") : "N/A"}
                  </p>
                </div>
              </div>

              {/* Special instructions */}
              {specialInstructions && (
                <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-1">
                    Special Instructions
                  </p>
                  <p className="text-sm text-amber-900">{specialInstructions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Color-Size Matrix */}
          {colors.length > 0 && sizes.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Color / Size Matrix</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-2 pl-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Color
                      </th>
                      {sizes.map((size) => (
                        <th
                          key={size}
                          className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500"
                        >
                          {size}
                        </th>
                      ))}
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-900">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {colors.map((color, rowIdx) => (
                      <tr
                        key={color}
                        className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                      >
                        <td className="py-2.5 pl-3 pr-4 font-medium text-gray-900">
                          {color}
                        </td>
                        {sizes.map((size) => (
                          <td
                            key={size}
                            className="px-3 py-2.5 text-center tabular-nums text-gray-700"
                          >
                            {(colorSizeData[color]?.[size] ?? 0).toLocaleString()}
                          </td>
                        ))}
                        <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-gray-900">
                          {colorTotal(color).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {/* Total row */}
                    <tr className="border-t border-gray-200 bg-gray-50 font-semibold">
                      <td className="py-2.5 pl-3 pr-4 text-gray-900">Total</td>
                      {sizes.map((size) => (
                        <td
                          key={size}
                          className="px-3 py-2.5 text-center tabular-nums text-gray-900"
                        >
                          {sizeTotal(size).toLocaleString()}
                        </td>
                      ))}
                      <td className="px-3 py-2.5 text-right font-black tabular-nums text-gray-900">
                        {grandTotal.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Production Tab */}
        <TabsContent value="production" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Production Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <OrderProgressTracker stages={stages} />

              <Separator />

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  {
                    label: "Cut",
                    value: productionStats.cut_qty,
                    color: "text-blue-600",
                  },
                  {
                    label: "Sewn",
                    value: productionStats.sewed_qty,
                    color: "text-indigo-600",
                  },
                  {
                    label: "Finished",
                    value: productionStats.finished_qty,
                    color: "text-purple-600",
                  },
                  {
                    label: "Packed",
                    value: productionStats.packed_qty,
                    color: "text-teal-600",
                  },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-3xl font-black tabular-nums",
                        stat.color
                      )}
                    >
                      {stat.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {totalQty > 0
                        ? `${Math.round((stat.value / totalQty) * 100)}%`
                        : "0%"}{" "}
                      of order
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Materials, Quality, Samples, Shipment - placeholder tabs */}
        {["materials", "quality", "samples", "shipment"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardContent className="flex h-40 items-center justify-center p-6">
                <p className="text-sm text-gray-400">
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} information will
                  appear here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        {/* TNA Tab */}
        <TabsContent value="tna">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Time and Action Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              {tnaItems.length === 0 ? (
                <div className="flex h-32 items-center justify-center">
                  <p className="text-sm text-gray-400">
                    No TNA milestones defined for this order.
                  </p>
                </div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Milestone
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Planned
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Actual
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Variance
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tnaItems.map((item: { milestone: string; planned: string; actual: string | null; status: string }, idx: number) => {
                      const variance =
                        item.actual
                          ? Math.ceil(
                              (new Date(item.actual).getTime() -
                                new Date(item.planned).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )
                          : null;
                      return (
                        <tr
                          key={idx}
                          className={cn(
                            "border-t border-gray-100",
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                          )}
                        >
                          <td className="py-3 pl-4 pr-3 font-medium text-gray-900">
                            {item.milestone}
                          </td>
                          <td className="px-3 py-3 text-gray-600">
                            {item.planned ? formatDate(item.planned) : (
                              <span className="text-gray-400">--</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-gray-600">
                            {item.actual ? formatDate(item.actual) : (
                              <span className="text-gray-400">--</span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            {variance !== null ? (
                              <span
                                className={cn(
                                  "font-semibold tabular-nums",
                                  variance > 0
                                    ? "text-red-600"
                                    : variance < 0
                                    ? "text-green-600"
                                    : "text-gray-500"
                                )}
                              >
                                {variance > 0 ? `+${variance}d` : variance < 0 ? `${variance}d` : "On time"}
                              </span>
                            ) : (
                              <span className="text-gray-400">--</span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <TNAStatusBadge status={item.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Amendments Tab */}
        <TabsContent value="amendments">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Amendments</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              {amendments.length === 0 ? (
                <div className="flex h-32 items-center justify-center">
                  <p className="text-sm text-gray-400">No amendments yet.</p>
                </div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      {["#", "Date", "Field", "Old Value", "New Value", "Reason", "By"].map(
                        (h) => (
                          <th
                            key={h}
                            className="py-3 px-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 first:pl-4"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {amendments.map((amend: { id: string; date: string; field: string; oldValue: string; newValue: string; reason: string; by: string }, idx: number) => (
                      <tr
                        key={amend.id}
                        className={cn(
                          "border-t border-gray-100",
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        )}
                      >
                        <td className="py-3 pl-4 pr-3 font-mono text-xs text-gray-500">
                          {amend.id}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-gray-600">
                          {amend.date ? formatDate(amend.date) : "--"}
                        </td>
                        <td className="px-3 py-3 font-medium text-gray-900">
                          {amend.field}
                        </td>
                        <td className="px-3 py-3 text-gray-500 line-through">
                          {amend.oldValue}
                        </td>
                        <td className="px-3 py-3 font-semibold text-blue-700">
                          {amend.newValue}
                        </td>
                        <td className="px-3 py-3 text-gray-600 max-w-[200px] truncate">
                          {amend.reason}
                        </td>
                        <td className="px-3 py-3 text-gray-600">{amend.by}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Communication Thread</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No comments yet. Start the conversation below.
                </p>
              ) : (
                comments.map((comment: { id: string; author: string; role: string; timestamp: string; text: string }) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      {getInitials(comment.author)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {comment.author}
                        </span>
                        <span className="text-xs text-gray-400">
                          {comment.role}
                        </span>
                        <span className="text-xs text-gray-400">
                          {comment.timestamp}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}

              <Separator />

              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                  {getInitials(profile.full_name)}
                </div>
                <div className="flex-1">
                  <textarea
                    className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                    rows={3}
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={postingComment}
                  />
                  <div className="mt-2 flex justify-end">
                    <Button
                      size="sm"
                      onClick={handlePostComment}
                      disabled={postingComment || !commentText.trim()}
                    >
                      {postingComment ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        "Post Comment"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
