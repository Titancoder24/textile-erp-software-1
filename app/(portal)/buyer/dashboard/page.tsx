import * as React from "react";
import {
  ShoppingBag,
  Truck,
  Clock,
  Star,
  CheckCircle2,
  Circle,
  AlertCircle,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ACTIVE_ORDERS = [
  {
    id: "SO-2026-0021",
    product: "Men's Classic T-Shirt",
    quantity: 12000,
    deliveryDate: "2026-03-15",
    status: "in_production",
    progress: 65,
    stages: [
      { key: "confirmed", label: "Confirmed", done: true },
      { key: "material", label: "Material", done: true },
      { key: "production", label: "Production", done: false, active: true },
      { key: "quality", label: "Quality", done: false },
      { key: "shipment", label: "Shipment", done: false },
    ],
  },
  {
    id: "SO-2026-0018",
    product: "Ladies Polo Shirt",
    quantity: 8500,
    deliveryDate: "2026-03-28",
    status: "material_sourcing",
    progress: 30,
    stages: [
      { key: "confirmed", label: "Confirmed", done: true },
      { key: "material", label: "Material", done: false, active: true },
      { key: "production", label: "Production", done: false },
      { key: "quality", label: "Quality", done: false },
      { key: "shipment", label: "Shipment", done: false },
    ],
  },
  {
    id: "SO-2026-0015",
    product: "Kids Cotton Trouser",
    quantity: 5000,
    deliveryDate: "2026-04-10",
    status: "confirmed",
    progress: 10,
    stages: [
      { key: "confirmed", label: "Confirmed", done: true, active: true },
      { key: "material", label: "Material", done: false },
      { key: "production", label: "Production", done: false },
      { key: "quality", label: "Quality", done: false },
      { key: "shipment", label: "Shipment", done: false },
    ],
  },
  {
    id: "SO-2026-0009",
    product: "Women's Denim Jacket",
    quantity: 3200,
    deliveryDate: "2026-02-28",
    status: "ready_to_ship",
    progress: 92,
    stages: [
      { key: "confirmed", label: "Confirmed", done: true },
      { key: "material", label: "Material", done: true },
      { key: "production", label: "Production", done: true },
      { key: "quality", label: "Quality", done: true },
      { key: "shipment", label: "Shipment", done: false, active: true },
    ],
  },
];

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  confirmed: {
    label: "Confirmed",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  material_sourcing: {
    label: "Material Sourcing",
    className: "border-yellow-200 bg-yellow-50 text-yellow-700",
  },
  in_production: {
    label: "In Production",
    className: "border-purple-200 bg-purple-50 text-purple-700",
  },
  quality_check: {
    label: "Quality Check",
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },
  ready_to_ship: {
    label: "Ready to Ship",
    className: "border-green-200 bg-green-50 text-green-700",
  },
  shipped: {
    label: "Shipped",
    className: "border-gray-200 bg-gray-50 text-gray-700",
  },
};

function OrderProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-gray-500">Overall Progress</span>
        <span className="text-xs font-semibold text-gray-700">{progress}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            progress >= 90
              ? "bg-green-500"
              : progress >= 60
              ? "bg-blue-500"
              : progress >= 30
              ? "bg-yellow-500"
              : "bg-gray-400"
          )}
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

function StageIndicator({
  stages,
}: {
  stages: Array<{ key: string; label: string; done: boolean; active?: boolean }>;
}) {
  return (
    <div className="flex items-center gap-1">
      {stages.map((stage, idx) => (
        <React.Fragment key={stage.key}>
          <div className="flex flex-col items-center gap-0.5">
            <div
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full",
                stage.done
                  ? "bg-green-500 text-white"
                  : stage.active
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-400"
              )}
              title={stage.label}
            >
              {stage.done ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : stage.active ? (
                <Circle className="h-3 w-3 fill-current" />
              ) : (
                <Circle className="h-3 w-3" />
              )}
            </div>
            <span className="text-[9px] text-gray-500 whitespace-nowrap">
              {stage.label}
            </span>
          </div>
          {idx < stages.length - 1 && (
            <div
              className={cn(
                "mb-3 h-0.5 flex-1",
                stage.done ? "bg-green-400" : "bg-gray-200"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function BuyerDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Buyer Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your orders are being tracked in real-time. Last updated: just now.
        </p>
      </div>

      {/* Real-time notice */}
      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
        <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-sm shadow-green-400 animate-pulse" />
        <p className="text-sm text-blue-800">
          Your orders are being tracked in real-time. Production updates sync automatically.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Active Orders"
          value="4"
          icon={<ShoppingBag className="h-5 w-5" />}
          color="blue"
          change={0}
          changeLabel="since last month"
        />
        <StatCard
          title="Shipments This Month"
          value="2"
          icon={<Truck className="h-5 w-5" />}
          color="green"
          change={33.3}
          changeLabel="vs last month"
        />
        <StatCard
          title="Pending Approvals"
          value="3"
          icon={<Clock className="h-5 w-5" />}
          color="orange"
        />
        <StatCard
          title="Quality Score"
          value="97.4%"
          icon={<Star className="h-5 w-5" />}
          color="purple"
          change={1.2}
          changeLabel="vs last quarter"
        />
      </div>

      {/* Active orders */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          Active Orders
        </h2>
        <div className="space-y-4">
          {ACTIVE_ORDERS.map((order) => {
            const statusCfg =
              STATUS_CONFIG[order.status] ?? STATUS_CONFIG["confirmed"];
            const daysLeft = Math.ceil(
              (new Date(order.deliveryDate).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={order.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {order.id}
                      </span>
                      <span
                        className={cn(
                          "rounded-md border px-2 py-0.5 text-xs font-semibold",
                          statusCfg.className
                        )}
                      >
                        {statusCfg.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-600">
                      {order.product}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Delivery</p>
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
                      {new Date(order.deliveryDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    {daysLeft < 0 ? (
                      <p className="text-xs text-red-600 flex items-center gap-0.5 justify-end">
                        <AlertCircle className="h-3 w-3" />
                        {Math.abs(daysLeft)}d overdue
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">{daysLeft}d remaining</p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <StageIndicator stages={order.stages} />
                </div>

                <OrderProgressBar progress={order.progress} />

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Qty:{" "}
                    <span className="font-medium text-gray-700">
                      {order.quantity.toLocaleString("en-IN")} pcs
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
