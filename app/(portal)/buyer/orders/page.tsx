"use client";

import * as React from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const ORDERS = [
  {
    id: "SO-2026-0021",
    product: "Men's Classic T-Shirt",
    styleNo: "MTS-001",
    colors: ["White", "Navy", "Black"],
    sizes: ["S", "M", "L", "XL"],
    quantity: 12000,
    shipDate: "2026-03-15",
    exFactoryDate: "2026-03-10",
    status: "in_production",
    buyerPO: "HM-PO-4521",
    currentStage: "sewing",
    progress: 65,
    stages: [
      { key: "confirmed", label: "Order Confirmed", done: true, date: "2026-01-10" },
      { key: "material", label: "Material Sourcing", done: true, date: "2026-01-25" },
      { key: "cutting", label: "Cutting", done: true, date: "2026-02-08" },
      { key: "sewing", label: "Sewing", done: false, active: true, pct: 65 },
      { key: "finishing", label: "Finishing", done: false },
      { key: "quality", label: "Quality Check", done: false },
      { key: "shipment", label: "Shipment", done: false },
    ],
  },
  {
    id: "SO-2026-0018",
    product: "Ladies Polo Shirt",
    styleNo: "LPS-007",
    colors: ["Red", "White", "Blue"],
    sizes: ["XS", "S", "M", "L"],
    quantity: 8500,
    shipDate: "2026-03-28",
    exFactoryDate: "2026-03-22",
    status: "material_sourcing",
    buyerPO: "ZR-PO-8834",
    currentStage: "material",
    progress: 30,
    stages: [
      { key: "confirmed", label: "Order Confirmed", done: true, date: "2026-01-18" },
      { key: "material", label: "Material Sourcing", done: false, active: true, pct: 70 },
      { key: "cutting", label: "Cutting", done: false },
      { key: "sewing", label: "Sewing", done: false },
      { key: "finishing", label: "Finishing", done: false },
      { key: "quality", label: "Quality Check", done: false },
      { key: "shipment", label: "Shipment", done: false },
    ],
  },
  {
    id: "SO-2026-0015",
    product: "Kids Cotton Trouser",
    styleNo: "KCT-012",
    colors: ["Khaki", "Navy"],
    sizes: ["2Y", "4Y", "6Y", "8Y", "10Y"],
    quantity: 5000,
    shipDate: "2026-04-10",
    exFactoryDate: "2026-04-04",
    status: "confirmed",
    buyerPO: "TG-PO-2201",
    currentStage: "confirmed",
    progress: 10,
    stages: [
      { key: "confirmed", label: "Order Confirmed", done: true, active: true, date: "2026-02-05" },
      { key: "material", label: "Material Sourcing", done: false },
      { key: "cutting", label: "Cutting", done: false },
      { key: "sewing", label: "Sewing", done: false },
      { key: "finishing", label: "Finishing", done: false },
      { key: "quality", label: "Quality Check", done: false },
      { key: "shipment", label: "Shipment", done: false },
    ],
  },
  {
    id: "SO-2026-0009",
    product: "Women's Denim Jacket",
    styleNo: "WDJ-003",
    colors: ["Light Wash", "Dark Wash"],
    sizes: ["XS", "S", "M", "L", "XL"],
    quantity: 3200,
    shipDate: "2026-02-28",
    exFactoryDate: "2026-02-22",
    status: "ready_to_ship",
    buyerPO: "NK-PO-9910",
    currentStage: "shipment",
    progress: 92,
    stages: [
      { key: "confirmed", label: "Order Confirmed", done: true, date: "2025-12-15" },
      { key: "material", label: "Material Sourcing", done: true, date: "2025-12-28" },
      { key: "cutting", label: "Cutting", done: true, date: "2026-01-08" },
      { key: "sewing", label: "Sewing", done: true, date: "2026-02-05" },
      { key: "finishing", label: "Finishing", done: true, date: "2026-02-14" },
      { key: "quality", label: "Quality Check", done: true, date: "2026-02-20" },
      { key: "shipment", label: "Shipment", done: false, active: true, pct: 92 },
    ],
  },
];

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  confirmed: { label: "Confirmed", className: "border-blue-200 bg-blue-50 text-blue-700" },
  material_sourcing: { label: "Material Sourcing", className: "border-yellow-200 bg-yellow-50 text-yellow-700" },
  in_production: { label: "In Production", className: "border-purple-200 bg-purple-50 text-purple-700" },
  ready_to_ship: { label: "Ready to Ship", className: "border-green-200 bg-green-50 text-green-700" },
  shipped: { label: "Shipped", className: "border-gray-200 bg-gray-50 text-gray-600" },
};

function OrderCard({ order }: { order: (typeof ORDERS)[0] }) {
  const [expanded, setExpanded] = React.useState(false);
  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["confirmed"];
  const daysLeft = Math.ceil(
    (new Date(order.shipDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-gray-900">{order.id}</span>
              <span
                className={cn(
                  "rounded-md border px-2 py-0.5 text-xs font-semibold",
                  statusCfg.className
                )}
              >
                {statusCfg.label}
              </span>
            </div>
            <p className="mt-0.5 text-base font-semibold text-gray-800">
              {order.product}
            </p>
            <p className="text-xs text-gray-500">
              Style: {order.styleNo} &middot; Buyer PO: {order.buyerPO}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <p
              className={cn(
                "text-sm font-semibold",
                daysLeft < 0
                  ? "text-red-600"
                  : daysLeft < 7
                  ? "text-orange-600"
                  : "text-gray-900"
              )}
            >
              {new Date(order.shipDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
            {daysLeft < 0 ? (
              <div className="flex items-center gap-0.5 text-xs text-red-600">
                <AlertCircle className="h-3 w-3" />
                <span>{Math.abs(daysLeft)}d overdue</span>
              </div>
            ) : (
              <span className="text-xs text-gray-400">{daysLeft}d to ship</span>
            )}
          </div>
        </div>

        {/* Metadata row */}
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
          <span>
            Qty:{" "}
            <span className="font-medium text-gray-700">
              {order.quantity.toLocaleString("en-IN")} pcs
            </span>
          </span>
          <span>
            Colors:{" "}
            <span className="font-medium text-gray-700">
              {order.colors.join(", ")}
            </span>
          </span>
          <span>
            Sizes:{" "}
            <span className="font-medium text-gray-700">
              {order.sizes.join(", ")}
            </span>
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-gray-500">Production Progress</span>
            <span className="text-xs font-semibold text-gray-700">
              {order.progress}%
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                order.progress >= 90
                  ? "bg-green-500"
                  : order.progress >= 60
                  ? "bg-blue-500"
                  : order.progress >= 30
                  ? "bg-yellow-500"
                  : "bg-gray-400"
              )}
              style={{ width: `${order.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-center gap-1 border-t border-gray-100 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
      >
        {expanded ? (
          <>
            <ChevronUp className="h-3.5 w-3.5" />
            Hide Timeline
          </>
        ) : (
          <>
            <ChevronDown className="h-3.5 w-3.5" />
            View Production Timeline
          </>
        )}
      </button>

      {/* Expanded timeline */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Production Timeline
          </h4>
          <div className="space-y-2">
            {order.stages.map((stage) => (
              <div key={stage.key} className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {stage.done ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : stage.active ? (
                    <Clock className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        stage.done
                          ? "text-green-700"
                          : stage.active
                          ? "text-blue-700"
                          : "text-gray-400"
                      )}
                    >
                      {stage.label}
                    </span>
                    {stage.date && (
                      <span className="text-xs text-gray-400">{stage.date}</span>
                    )}
                    {stage.active && stage.pct !== undefined && (
                      <span className="text-xs font-semibold text-blue-600">
                        {stage.pct}%
                      </span>
                    )}
                  </div>
                  {stage.active && stage.pct !== undefined && (
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-blue-100">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${stage.pct}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BuyerOrdersPage() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const filtered = ORDERS.filter((o) => {
    const matchesSearch =
      search === "" ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase()) ||
      o.buyerPO.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track all your active and recent orders with production progress.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by order#, product, or PO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {["all", "confirmed", "material_sourcing", "in_production", "ready_to_ship"].map(
            (s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                  statusFilter === s
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                {s === "all"
                  ? "All"
                  : s
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            )
          )}
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-700">{filtered.length}</span>{" "}
        order{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Order cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white py-12 text-center">
            <p className="text-sm text-gray-500">No orders match your filters.</p>
          </div>
        ) : (
          filtered.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  );
}
