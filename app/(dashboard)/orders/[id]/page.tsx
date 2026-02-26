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
} from "lucide-react";

import { cn, formatDate, getDaysRemaining } from "@/lib/utils";
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

// ---------------------------------------------------------------------------
// Mock detail data
// ---------------------------------------------------------------------------

const MOCK_ORDER = {
  id: "1",
  orderNumber: "ORD-2026-0012",
  buyer: "H&M",
  style: "Men's Woven Shirt",
  totalQty: 12000,
  fobPrice: 8.5,
  currency: "USD",
  orderDate: "2026-01-15",
  deliveryDate: "2026-03-05",
  status: "in_production",
  currentStage: "sewing",
  colors: ["Navy", "White", "Grey"],
  sizes: ["S", "M", "L", "XL", "XXL"],
  colorSizeMatrix: {
    Navy: { S: 800, M: 1200, L: 1000, XL: 600, XXL: 200 },
    White: { S: 900, M: 1400, L: 1100, XL: 700, XXL: 300 },
    Grey: { S: 700, M: 1100, L: 1000, XL: 550, XXL: 250 },
  },
  tnaItems: [
    {
      milestone: "Order Confirmation",
      planned: "2026-01-15",
      actual: "2026-01-15",
      status: "done",
    },
    {
      milestone: "Fabric Booking",
      planned: "2026-01-20",
      actual: "2026-01-19",
      status: "done",
    },
    {
      milestone: "Trim Booking",
      planned: "2026-01-22",
      actual: "2026-01-22",
      status: "done",
    },
    {
      milestone: "Fabric In-House",
      planned: "2026-02-05",
      actual: "2026-02-06",
      status: "done",
    },
    {
      milestone: "Cutting Start",
      planned: "2026-02-10",
      actual: "2026-02-11",
      status: "done",
    },
    {
      milestone: "Sewing Start",
      planned: "2026-02-15",
      actual: "2026-02-16",
      status: "in_progress",
    },
    {
      milestone: "Finishing Start",
      planned: "2026-02-25",
      actual: null,
      status: "pending",
    },
    {
      milestone: "Ex-Factory",
      planned: "2026-03-01",
      actual: null,
      status: "pending",
    },
    {
      milestone: "Vessel Departure",
      planned: "2026-03-05",
      actual: null,
      status: "pending",
    },
  ],
  amendments: [
    {
      id: "A1",
      date: "2026-01-28",
      field: "Quantity",
      oldValue: "10,000 pcs",
      newValue: "12,000 pcs",
      reason: "Buyer increased order",
      by: "Sarah Chen",
    },
    {
      id: "A2",
      date: "2026-02-02",
      field: "Delivery Date",
      oldValue: "28 Feb 2026",
      newValue: "05 Mar 2026",
      reason: "Extra 2000 pcs added",
      by: "Sarah Chen",
    },
  ],
  comments: [
    {
      id: "c1",
      author: "Sarah Chen",
      role: "Merchandiser",
      timestamp: "2026-02-10 09:15",
      text: "Fabric inspection passed. Cutting can proceed.",
    },
    {
      id: "c2",
      author: "David Kim",
      role: "Production Manager",
      timestamp: "2026-02-16 14:30",
      text: "Sewing started on Line 3 and Line 5. Efficiency at 72%.",
    },
    {
      id: "c3",
      author: "John Patel",
      role: "QC",
      timestamp: "2026-02-20 11:00",
      text: "Random inline inspection done. DHU at 1.8%, within tolerance.",
    },
  ],
  productionStats: {
    cutQty: 12200,
    sewedQty: 6800,
    finishedQty: 0,
    packedQty: 0,
  },
};

// ---------------------------------------------------------------------------
// TNA status badge
// ---------------------------------------------------------------------------

const TNA_STATUS_MAP = {
  done: "bg-green-50 text-green-700 border border-green-200",
  in_progress: "bg-blue-50 text-blue-700 border border-blue-200",
  pending: "bg-gray-100 text-gray-600 border border-gray-200",
  delayed: "bg-red-50 text-red-700 border border-red-200",
};

const TNA_STATUS_LABELS = {
  done: "Done",
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
// Page component
// ---------------------------------------------------------------------------

export default function OrderDetailPage() {
  useParams();
  const order = MOCK_ORDER;
  const daysLeft = getDaysRemaining(order.deliveryDate);
  const stages = buildDefaultStages(order.currentStage);

  // Calculate color-size matrix totals
  const sizeTotal = (size: string) =>
    order.colors.reduce(
      (sum, color) =>
        sum + (order.colorSizeMatrix[color as keyof typeof order.colorSizeMatrix]?.[size] ?? 0),
      0
    );
  const colorTotal = (color: string) => {
    const row = order.colorSizeMatrix[color as keyof typeof order.colorSizeMatrix];
    if (!row) return 0;
    return Object.values(row).reduce((sum, v) => sum + v, 0);
  };
  const grandTotal = order.colors.reduce((sum, c) => sum + colorTotal(c), 0);

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
                  {order.orderNumber}
                </h1>
                <OrderStatusBadge status={order.status} />
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
                  <span className="font-medium">{order.buyer}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Package className="h-3.5 w-3.5 text-gray-400" />
                  <span>{order.style}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Hash className="h-3.5 w-3.5 text-gray-400" />
                  <span className="font-semibold tabular-nums">
                    {order.totalQty.toLocaleString()} pcs
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <span className="text-gray-400 font-mono text-xs">$</span>
                  <span className="font-semibold tabular-nums">
                    {order.currency} {order.fobPrice.toFixed(2)} FOB
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <span>Order: {formatDate(order.orderDate)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <span>Delivery: {formatDate(order.deliveryDate)}</span>
                </div>
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
                    {order.currency}{" "}
                    {(order.totalQty * order.fobPrice).toLocaleString()}
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
                    {order.totalQty.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">pieces</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    FOB Value
                  </p>
                  <p className="mt-1 text-2xl font-black tabular-nums text-gray-900">
                    ${(order.totalQty * order.fobPrice / 1000).toFixed(1)}K
                  </p>
                  <p className="text-xs text-gray-400">{order.currency}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Colors
                  </p>
                  <p className="mt-1 text-2xl font-black tabular-nums text-gray-900">
                    {order.colors.length}
                  </p>
                  <p className="text-xs text-gray-400">
                    {order.colors.join(", ")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Sizes
                  </p>
                  <p className="mt-1 text-2xl font-black tabular-nums text-gray-900">
                    {order.sizes.length}
                  </p>
                  <p className="text-xs text-gray-400">
                    {order.sizes.join(", ")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color-Size Matrix */}
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
                    {order.sizes.map((size) => (
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
                  {order.colors.map((color, rowIdx) => (
                    <tr
                      key={color}
                      className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                    >
                      <td className="py-2.5 pl-3 pr-4 font-medium text-gray-900">
                        {color}
                      </td>
                      {order.sizes.map((size) => (
                        <td
                          key={size}
                          className="px-3 py-2.5 text-center tabular-nums text-gray-700"
                        >
                          {(
                            order.colorSizeMatrix[
                              color as keyof typeof order.colorSizeMatrix
                            ]?.[size] ?? 0
                          ).toLocaleString()}
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
                    {order.sizes.map((size) => (
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
                    value: order.productionStats.cutQty,
                    color: "text-blue-600",
                  },
                  {
                    label: "Sewn",
                    value: order.productionStats.sewedQty,
                    color: "text-indigo-600",
                  },
                  {
                    label: "Finished",
                    value: order.productionStats.finishedQty,
                    color: "text-purple-600",
                  },
                  {
                    label: "Packed",
                    value: order.productionStats.packedQty,
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
                      {order.totalQty > 0
                        ? `${Math.round((stat.value / order.totalQty) * 100)}%`
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
                  {order.tnaItems.map((item, idx) => {
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
                          {formatDate(item.planned)}
                        </td>
                        <td className="px-3 py-3 text-gray-600">
                          {item.actual ? formatDate(item.actual) : (
                            <span className="text-gray-400">—</span>
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
                            <span className="text-gray-400">—</span>
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
              {order.amendments.length === 0 ? (
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
                    {order.amendments.map((amend, idx) => (
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
                          {formatDate(amend.date)}
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
              {order.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {comment.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
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
              ))}

              <Separator />

              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                  ME
                </div>
                <div className="flex-1">
                  <textarea
                    className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                    rows={3}
                    placeholder="Add a comment..."
                  />
                  <div className="mt-2 flex justify-end">
                    <Button size="sm">Post Comment</Button>
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
