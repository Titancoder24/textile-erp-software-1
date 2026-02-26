import * as React from "react";
import {
  ShoppingCart,
  IndianRupee,
  Truck,
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const RECENT_POS = [
  {
    id: "PO-2026-0041",
    description: "Cotton Jersey Fabric - 5000m",
    issuedDate: "2026-02-15",
    deliveryDate: "2026-03-05",
    value: 485000,
    status: "sent",
    itemCount: 3,
  },
  {
    id: "PO-2026-0038",
    description: "Elastic Band & Tapes - Bulk",
    issuedDate: "2026-02-18",
    deliveryDate: "2026-02-28",
    value: 52000,
    status: "partial_received",
    itemCount: 8,
  },
  {
    id: "PO-2026-0033",
    description: "Polyester Sewing Thread",
    issuedDate: "2026-02-10",
    deliveryDate: "2026-02-20",
    value: 38500,
    status: "fully_received",
    itemCount: 5,
  },
];

const PAYMENT_HISTORY = [
  {
    invoiceNo: "INV-2026-0018",
    amount: 320000,
    dueDate: "2026-03-10",
    status: "pending",
    poRef: "PO-2026-0028",
  },
  {
    invoiceNo: "INV-2026-0012",
    amount: 185000,
    dueDate: "2026-02-15",
    status: "paid",
    poRef: "PO-2026-0021",
  },
  {
    invoiceNo: "INV-2026-0009",
    amount: 95000,
    dueDate: "2026-01-31",
    status: "paid",
    poRef: "PO-2026-0015",
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

export default function VendorDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your purchase orders, deliveries, and payment status.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Active POs"
          value="5"
          icon={<ShoppingCart className="h-5 w-5" />}
          color="blue"
          change={25}
          changeLabel="vs last month"
        />
        <StatCard
          title="PO Value This Month"
          value={formatCurrency(575000)}
          icon={<IndianRupee className="h-5 w-5" />}
          color="green"
          change={12.4}
          changeLabel="vs last month"
        />
        <StatCard
          title="Pending Deliveries"
          value="2"
          icon={<Truck className="h-5 w-5" />}
          color="orange"
        />
        <StatCard
          title="Payment Due"
          value={formatCurrency(320000)}
          icon={<Wallet className="h-5 w-5" />}
          color="purple"
        />
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent POs */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent Purchase Orders</h2>
            <a
              href="/vendor/orders"
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              View all
            </a>
          </div>
          <div className="divide-y divide-gray-50">
            {RECENT_POS.map((po) => {
              const cfg = PO_STATUS_CONFIG[po.status] ?? PO_STATUS_CONFIG["sent"];
              const daysLeft = Math.ceil(
                (new Date(po.deliveryDate).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              );
              return (
                <div key={po.id} className="px-5 py-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {po.id}
                        </span>
                        <span
                          className={cn(
                            "rounded border px-1.5 py-0.5 text-xs font-semibold",
                            cfg.className
                          )}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <p className="truncate text-xs text-gray-500">
                        {po.description}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-gray-800">
                        {formatCurrency(po.value)}
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
                        {daysLeft < 0
                          ? `${Math.abs(daysLeft)}d overdue`
                          : daysLeft === 0
                          ? "Due today"
                          : `Due in ${daysLeft}d`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment status */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Payment Status</h2>
            <a
              href="/vendor/payments"
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              View all
            </a>
          </div>
          <div className="divide-y divide-gray-50">
            {PAYMENT_HISTORY.map((pay) => (
              <div key={pay.invoiceNo} className="px-5 py-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {pay.status === "paid" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                      ) : (
                        <Clock className="h-3.5 w-3.5 shrink-0 text-yellow-500" />
                      )}
                      <span className="text-sm font-semibold text-gray-900">
                        {pay.invoiceNo}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      PO: {pay.poRef} &middot; Due:{" "}
                      {new Date(pay.dueDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-gray-800">
                      {formatCurrency(pay.amount)}
                    </p>
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        pay.status === "paid"
                          ? "text-green-600"
                          : "text-yellow-600"
                      )}
                    >
                      {pay.status === "paid" ? "Paid" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
