"use client";

import * as React from "react";
import { Search, ChevronDown, ChevronUp, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type POItem = {
  name: string;
  uom: string;
  qty: number;
  rate: number;
  amount: number;
};

type PurchaseOrder = {
  id: string;
  issuedDate: string;
  deliveryDate: string;
  status: string;
  totalValue: number;
  currency: string;
  terms: string;
  deliveryAddress: string;
  items: POItem[];
};

const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "PO-2026-0041",
    issuedDate: "2026-02-15",
    deliveryDate: "2026-03-05",
    status: "sent",
    totalValue: 485000,
    currency: "INR",
    terms: "Net 30",
    deliveryAddress: "TextileOS Demo Factory, Tirupur, Tamil Nadu",
    items: [
      { name: "Cotton Jersey 160 GSM - White", uom: "Meter", qty: 2000, rate: 95, amount: 190000 },
      { name: "Cotton Jersey 160 GSM - Navy", uom: "Meter", qty: 1800, rate: 97, amount: 174600 },
      { name: "Cotton Jersey 160 GSM - Black", uom: "Meter", qty: 1200, rate: 100, amount: 120000 },
    ],
  },
  {
    id: "PO-2026-0038",
    issuedDate: "2026-02-18",
    deliveryDate: "2026-02-28",
    status: "partial_received",
    totalValue: 52000,
    currency: "INR",
    terms: "Advance",
    deliveryAddress: "TextileOS Demo Factory, Tirupur, Tamil Nadu",
    items: [
      { name: "Elastic Band 2.5cm", uom: "Meter", qty: 5000, rate: 3.5, amount: 17500 },
      { name: "Elastic Band 1.5cm", uom: "Meter", qty: 5000, rate: 2.5, amount: 12500 },
      { name: "Velcro Tape 2cm (Hook)", uom: "Meter", qty: 2000, rate: 5, amount: 10000 },
      { name: "Velcro Tape 2cm (Loop)", uom: "Meter", qty: 2000, rate: 4, amount: 8000 },
      { name: "Drawstring Cord 6mm", uom: "Meter", qty: 3000, rate: 1.33, amount: 4000 },
    ],
  },
  {
    id: "PO-2026-0033",
    issuedDate: "2026-02-10",
    deliveryDate: "2026-02-20",
    status: "fully_received",
    totalValue: 38500,
    currency: "INR",
    terms: "Net 30",
    deliveryAddress: "TextileOS Demo Factory, Tirupur, Tamil Nadu",
    items: [
      { name: "Polyester Thread - White 40/2", uom: "Cone", qty: 200, rate: 85, amount: 17000 },
      { name: "Polyester Thread - Navy 40/2", uom: "Cone", qty: 150, rate: 88, amount: 13200 },
      { name: "Polyester Thread - Black 40/2", uom: "Cone", qty: 100, rate: 83, amount: 8300 },
    ],
  },
];

const PO_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "border-gray-200 bg-gray-50 text-gray-600" },
  pending_approval: { label: "Pending Approval", className: "border-yellow-200 bg-yellow-50 text-yellow-700" },
  approved: { label: "Approved", className: "border-blue-200 bg-blue-50 text-blue-700" },
  sent: { label: "Sent", className: "border-purple-200 bg-purple-50 text-purple-700" },
  partial_received: { label: "Partial", className: "border-orange-200 bg-orange-50 text-orange-700" },
  fully_received: { label: "Received", className: "border-green-200 bg-green-50 text-green-700" },
  closed: { label: "Closed", className: "border-gray-200 bg-gray-50 text-gray-500" },
};

function POCard({ po }: { po: PurchaseOrder }) {
  const [expanded, setExpanded] = React.useState(false);
  const cfg = PO_STATUS_CONFIG[po.status] ?? PO_STATUS_CONFIG["sent"];
  const daysLeft = Math.ceil(
    (new Date(po.deliveryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-gray-900">{po.id}</span>
              <span
                className={cn(
                  "rounded-md border px-2 py-0.5 text-xs font-semibold",
                  cfg.className
                )}
              >
                {cfg.label}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
              <span>
                Issued:{" "}
                <span className="font-medium text-gray-700">
                  {new Date(po.issuedDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </span>
              <span>
                Terms: <span className="font-medium text-gray-700">{po.terms}</span>
              </span>
              <span>
                Items:{" "}
                <span className="font-medium text-gray-700">{po.items.length}</span>
              </span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-base font-bold text-gray-900">
              {formatCurrency(po.totalValue)}
            </p>
            <p
              className={cn(
                "text-xs",
                daysLeft < 0
                  ? "text-red-500"
                  : daysLeft < 3
                  ? "text-orange-500"
                  : "text-gray-400"
              )}
            >
              Delivery:{" "}
              {new Date(po.deliveryDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              })}
              {daysLeft < 0
                ? ` (${Math.abs(daysLeft)}d overdue)`
                : ` (${daysLeft}d)`}
            </p>
          </div>
        </div>

        <p className="mt-2 text-xs text-gray-500">
          <span className="font-medium text-gray-600">Deliver to: </span>
          {po.deliveryAddress}
        </p>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-center gap-1 border-t border-gray-100 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
      >
        {expanded ? (
          <>
            <ChevronUp className="h-3.5 w-3.5" />
            Hide Items
          </>
        ) : (
          <>
            <ChevronDown className="h-3.5 w-3.5" />
            View Items ({po.items.length})
          </>
        )}
      </button>

      {/* Items table */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Item
                  </th>
                  <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    UOM
                  </th>
                  <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Qty
                  </th>
                  <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Rate
                  </th>
                  <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {po.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 text-gray-700">{item.name}</td>
                    <td className="py-2 text-right text-gray-500">{item.uom}</td>
                    <td className="py-2 text-right text-gray-700 tabular-nums">
                      {item.qty.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2 text-right text-gray-700 tabular-nums">
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="py-2 text-right font-semibold text-gray-900 tabular-nums">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200">
                  <td
                    colSpan={4}
                    className="pt-2 text-right text-sm font-semibold text-gray-700"
                  >
                    Total
                  </td>
                  <td className="pt-2 text-right text-sm font-bold text-gray-900 tabular-nums">
                    {formatCurrency(po.totalValue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VendorOrdersPage() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const filtered = PURCHASE_ORDERS.filter((po) => {
    const matchesSearch =
      search === "" ||
      po.id.toLowerCase().includes(search.toLowerCase()) ||
      po.items.some((i) =>
        i.name.toLowerCase().includes(search.toLowerCase())
      );
    const matchesStatus = statusFilter === "all" || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
        <p className="mt-1 text-sm text-gray-500">
          All purchase orders assigned to your account with item details.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by PO# or item name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", "sent", "partial_received", "fully_received"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === s
                  ? "border-orange-300 bg-orange-50 text-orange-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {s === "all"
                ? "All"
                : PO_STATUS_CONFIG[s]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-500">
        Showing{" "}
        <span className="font-medium text-gray-700">{filtered.length}</span>{" "}
        order{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* PO cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white py-12 text-center">
            <Package className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">
              No purchase orders match your filters.
            </p>
          </div>
        ) : (
          filtered.map((po) => <POCard key={po.id} po={po} />)
        )}
      </div>
    </div>
  );
}
