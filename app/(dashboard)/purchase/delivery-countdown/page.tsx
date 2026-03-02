"use client";

import * as React from "react";
import {
  Timer,
  AlertTriangle,
  ShieldAlert,
  CircleCheck,
  Package,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { cn, formatNumber, formatDate } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import {
  getSupplierCountdownData,
  type SupplierCountdown,
} from "@/lib/actions/analytics";

/* ---------- Helpers ---------- */

function getRiskConfig(level: SupplierCountdown["riskLevel"]) {
  const map: Record<
    SupplierCountdown["riskLevel"],
    {
      bg: string;
      border: string;
      text: string;
      badge: string;
      label: string;
      countdownColor: string;
    }
  > = {
    overdue: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      badge: "bg-red-100 text-red-700 hover:bg-red-100",
      label: "Overdue",
      countdownColor: "text-red-600",
    },
    critical: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-800",
      badge: "bg-orange-100 text-orange-700 hover:bg-orange-100",
      label: "Critical",
      countdownColor: "text-orange-600",
    },
    at_risk: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      badge: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
      label: "At Risk",
      countdownColor: "text-yellow-600",
    },
    on_track: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      badge: "bg-green-100 text-green-700 hover:bg-green-100",
      label: "On Track",
      countdownColor: "text-green-600",
    },
  };
  return map[level];
}

function getProgressColor(riskLevel: SupplierCountdown["riskLevel"]): string {
  const map: Record<SupplierCountdown["riskLevel"], string> = {
    overdue: "bg-red-500",
    critical: "bg-orange-500",
    at_risk: "bg-yellow-500",
    on_track: "bg-green-500",
  };
  return map[riskLevel];
}

function getCountdownText(days: number): string {
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "1 day remaining";
  return `${days} days remaining`;
}

/* ---------- Skeleton ---------- */

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-3 w-48 rounded bg-gray-200" />
        </div>
        <div className="h-6 w-16 rounded bg-gray-200" />
      </div>
      <div className="h-10 w-40 rounded bg-gray-200 mb-4" />
      <div className="h-2 w-full rounded bg-gray-200 mb-4" />
      <div className="space-y-2">
        <div className="h-3 w-64 rounded bg-gray-200" />
        <div className="h-3 w-56 rounded bg-gray-200" />
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

export default function DeliveryCountdownPage() {
  const { profile } = useProfile();
  const companyId = profile?.company_id;

  const [items, setItems] = React.useState<SupplierCountdown[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!companyId) return;

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const result = await getSupplierCountdownData(companyId!);
        if (result.error) {
          if (!cancelled) setError(result.error);
          toast.error("Failed to load delivery countdown data");
        } else {
          if (!cancelled) setItems(result.data ?? []);
        }
      } catch {
        if (!cancelled) setError("An unexpected error occurred");
        toast.error("An unexpected error occurred");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  /* ---------- Derived Stats ---------- */

  const totalOpen = items.length;
  const atRiskCount = items.filter((i) => i.riskLevel === "at_risk").length;
  const criticalOverdueCount = items.filter(
    (i) => i.riskLevel === "critical" || i.riskLevel === "overdue"
  ).length;
  const onTrackCount = items.filter((i) => i.riskLevel === "on_track").length;

  /* Sort by urgency: overdue first, then critical, at_risk, on_track */
  const sorted = React.useMemo(() => {
    const priority: Record<SupplierCountdown["riskLevel"], number> = {
      overdue: 0,
      critical: 1,
      at_risk: 2,
      on_track: 3,
    };
    return [...items].sort(
      (a, b) => priority[a.riskLevel] - priority[b.riskLevel]
    );
  }, [items]);

  /* ---------- Loading State ---------- */

  if (!companyId || loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Supplier Delivery Countdown"
          description="Live countdown for every open PO with downstream impact analysis"
          breadcrumb={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Purchase", href: "/purchase" },
            { label: "Delivery Countdown" },
          ]}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCard key={i} title="" value="" loading />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  /* ---------- Error State ---------- */

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Supplier Delivery Countdown"
          description="Live countdown for every open PO with downstream impact analysis"
          breadcrumb={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Purchase", href: "/purchase" },
            { label: "Delivery Countdown" },
          ]}
        />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertTriangle className="mb-3 h-10 w-10 text-red-300" />
          <p className="text-sm font-medium text-gray-600">{error}</p>
          <p className="text-xs text-gray-400 mt-1">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  /* ---------- Empty State ---------- */

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Supplier Delivery Countdown"
          description="Live countdown for every open PO with downstream impact analysis"
          breadcrumb={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Purchase", href: "/purchase" },
            { label: "Delivery Countdown" },
          ]}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Open POs"
            value="0"
            icon={<Timer className="h-5 w-5" />}
            color="blue"
          />
          <StatCard
            title="At Risk"
            value="0"
            icon={<AlertTriangle className="h-5 w-5" />}
            color="orange"
          />
          <StatCard
            title="Critical / Overdue"
            value="0"
            icon={<ShieldAlert className="h-5 w-5" />}
            color="red"
          />
          <StatCard
            title="On Track"
            value="0"
            icon={<CircleCheck className="h-5 w-5" />}
            color="green"
          />
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">
            No open purchase orders
          </p>
          <p className="text-xs text-gray-400 mt-1">
            All purchase orders have been fully received or closed
          </p>
        </div>
      </div>
    );
  }

  /* ---------- Main Render ---------- */

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Supplier Delivery Countdown"
        description="Live countdown for every open PO with downstream impact analysis"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Purchase", href: "/purchase" },
          { label: "Delivery Countdown" },
        ]}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Open POs"
          value={formatNumber(totalOpen)}
          icon={<Timer className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="At Risk"
          value={formatNumber(atRiskCount)}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="orange"
        />
        <StatCard
          title="Critical / Overdue"
          value={formatNumber(criticalOverdueCount)}
          icon={<ShieldAlert className="h-5 w-5" />}
          color="red"
        />
        <StatCard
          title="On Track"
          value={formatNumber(onTrackCount)}
          icon={<CircleCheck className="h-5 w-5" />}
          color="green"
        />
      </div>

      {/* PO Countdown Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((item) => {
          const config = getRiskConfig(item.riskLevel);
          const progressPct =
            item.orderedQty > 0
              ? Math.min(
                  Math.round((item.receivedQty / item.orderedQty) * 100),
                  100
                )
              : 0;

          return (
            <div
              key={item.id}
              className={cn(
                "rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md",
                config.bg,
                config.border
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {item.poNumber}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {item.supplierName} -- {item.materialName}
                  </p>
                </div>
                <Badge className={cn("shrink-0", config.badge)}>
                  {config.label}
                </Badge>
              </div>

              {/* Countdown */}
              <div className="mb-4">
                <p
                  className={cn(
                    "text-2xl font-black tabular-nums",
                    config.countdownColor
                  )}
                >
                  {getCountdownText(item.daysRemaining)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Expected: {formatDate(item.expectedDate)}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>
                    Received: {formatNumber(item.receivedQty)} /{" "}
                    {formatNumber(item.orderedQty)} {item.uom}
                  </span>
                  <span className="tabular-nums font-medium">
                    {progressPct}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      getProgressColor(item.riskLevel)
                    )}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                {item.pendingQty > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Pending: {formatNumber(item.pendingQty)} {item.uom}
                  </p>
                )}
              </div>

              {/* Affected Orders */}
              {item.affectedOrders.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-700 mb-1">
                    Affected Orders
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {item.affectedOrders.map((order) => (
                      <span
                        key={order}
                        className="inline-block rounded-md bg-white/80 border border-gray-200 px-2 py-0.5 text-xs font-mono text-gray-700"
                      >
                        {order}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Downstream Impact */}
              {item.riskLevel !== "on_track" && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-700 mb-0.5">
                    Downstream Impact
                  </p>
                  <p className={cn("text-xs italic text-gray-500 leading-relaxed")}>
                    {item.downstreamImpact}
                  </p>
                </div>
              )}

              {/* Suggested Action */}
              {item.riskLevel !== "on_track" && (
                <div className="rounded-lg bg-white/60 border border-gray-200/60 px-3 py-2">
                  <p className="text-xs font-semibold text-gray-700 mb-0.5">
                    Suggested Action
                  </p>
                  <p className={cn("text-xs", config.text)}>
                    {item.suggestedAction}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Alert */}
      {criticalOverdueCount > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              Immediate Attention Required
            </p>
            <p className="text-xs text-red-700">
              {criticalOverdueCount} purchase order
              {criticalOverdueCount === 1 ? " is" : "s are"} in critical or
              overdue status. Delayed material deliveries may cascade into
              production schedule slippages and missed shipment dates. Escalate
              to supplier management immediately.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
