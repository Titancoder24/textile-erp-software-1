"use client";

import * as React from "react";
import {
  Factory,
  Gauge,
  ShieldCheck,
  ClipboardList,
  Loader2,
  TrendingUp,
  TrendingDown,
  Printer,
  AlertTriangle,
  CheckCircle2,
  Package,
  Truck,
  ShoppingCart,
  AlertCircle,
  CircleDot,
} from "lucide-react";

import { cn, formatNumber, formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { useProfile } from "@/hooks/use-profile";
import {
  getWeeklyDigestData,
  type WeeklyDigest,
} from "@/lib/actions/analytics";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function TrendBadge({
  value,
  suffix = "%",
}: {
  value: number;
  suffix?: string;
}) {
  const isPositive = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums",
        isPositive ? "text-green-600" : "text-red-600"
      )}
    >
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {isPositive ? "+" : ""}
      {value}
      {suffix}
    </span>
  );
}

function SeverityBadge({
  severity,
}: {
  severity: "critical" | "high" | "medium";
}) {
  const colors = {
    critical: "bg-red-100 text-red-700 border-red-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        colors[severity]
      )}
    >
      {severity}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WeeklyDigestPage() {
  const { profile } = useProfile();
  const companyId = profile?.company_id;

  const [digest, setDigest] = React.useState<WeeklyDigest | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!companyId) return;

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const result = await getWeeklyDigestData(companyId!);
        if (!cancelled) {
          if (result.error) {
            setError(result.error);
          } else {
            setDigest(result.data as WeeklyDigest);
          }
        }
      } catch {
        if (!cancelled) setError("Failed to load weekly digest data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const handlePrint = React.useCallback(() => {
    window.print();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Weekly Factory Performance Digest"
          description="One-page weekly performance summary"
          breadcrumb={[
            { label: "Reports", href: "/reports" },
            { label: "Weekly Digest" },
          ]}
        />
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (!digest) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Weekly Factory Performance Digest"
          description="One-page weekly performance summary"
          breadcrumb={[
            { label: "Reports", href: "/reports" },
            { label: "Weekly Digest" },
          ]}
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Factory className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-600">
              No data available for this week
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Production entries and inspection data generate the weekly digest
              automatically.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const p = digest.production;
  const q = digest.quality;
  const o = digest.orders;
  const s = digest.shipments;
  const m = digest.materials;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Weekly Factory Performance Digest"
        description="One-page weekly performance summary"
        breadcrumb={[
          { label: "Reports", href: "/reports" },
          { label: "Weekly Digest" },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-1.5 h-3.5 w-3.5" />
            Print
          </Button>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          title="Production Achievement"
          value={`${p.achievementPct}%`}
          icon={<Factory className="h-5 w-5" />}
          color={p.achievementPct >= 90 ? "green" : "orange"}
        />
        <StatCard
          title="Avg Efficiency"
          value={`${p.avgEfficiency}%`}
          change={p.efficiencyTrend}
          changeLabel="vs last week"
          icon={<Gauge className="h-5 w-5" />}
          color={p.avgEfficiency >= 70 ? "blue" : "red"}
        />
        <StatCard
          title="QC Pass Rate"
          value={`${q.passRate}%`}
          change={q.passRateTrend}
          changeLabel="vs last week"
          icon={<ShieldCheck className="h-5 w-5" />}
          color={q.passRate >= 90 ? "green" : "orange"}
        />
        <StatCard
          title="Active Orders"
          value={o.totalActive}
          icon={<ClipboardList className="h-5 w-5" />}
          color="purple"
        />
      </div>

      {/* Digest Header */}
      <Card className="border-gray-300 bg-gray-50/40 print:border-none">
        <CardContent className="py-4 text-center">
          <h2 className="text-lg font-bold text-gray-900">
            Weekly Factory Performance Digest
          </h2>
          <p className="text-sm text-gray-600 mt-0.5">{digest.weekRange}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Generated: {formatDateTime(digest.generatedAt)}
          </p>
        </CardContent>
      </Card>

      {/* Main Digest Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Production Section */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100">
                <Factory className="h-4 w-4 text-blue-700" />
              </div>
              <CardTitle className="text-sm font-semibold text-gray-800">
                Production
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-gray-500">Produced vs Target</p>
                <p className="text-xl font-black tabular-nums text-gray-900">
                  {formatNumber(p.totalProduced)}
                  <span className="text-sm font-normal text-gray-400">
                    {" "}
                    / {formatNumber(p.totalTarget)}
                  </span>
                </p>
              </div>
              <div
                className={cn(
                  "text-right",
                  p.achievementPct >= 90
                    ? "text-green-700"
                    : p.achievementPct >= 75
                    ? "text-orange-600"
                    : "text-red-600"
                )}
              >
                <p className="text-2xl font-black tabular-nums">
                  {p.achievementPct}%
                </p>
                <p className="text-[10px] uppercase tracking-wider">
                  Achievement
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">Avg Efficiency:</p>
              <span className="text-sm font-bold tabular-nums text-gray-900">
                {p.avgEfficiency}%
              </span>
              <TrendBadge value={p.efficiencyTrend} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md bg-green-50 p-2">
                <p className="text-gray-500">Best Line</p>
                <p className="font-semibold text-green-800 truncate">
                  {p.bestLine}
                </p>
                <p className="text-green-700 font-bold tabular-nums">
                  {p.bestLineEfficiency}%
                </p>
              </div>
              <div className="rounded-md bg-red-50 p-2">
                <p className="text-gray-500">Worst Line</p>
                <p className="font-semibold text-red-800 truncate">
                  {p.worstLine}
                </p>
                <p className="text-red-700 font-bold tabular-nums">
                  {p.worstLineEfficiency}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quality Section */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-green-100">
                <ShieldCheck className="h-4 w-4 text-green-700" />
              </div>
              <CardTitle className="text-sm font-semibold text-gray-800">
                Quality
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Inspections</p>
                <p className="text-xl font-black tabular-nums text-gray-900">
                  {q.totalInspections}
                </p>
              </div>
              <div
                className={cn(
                  "text-right",
                  q.passRate >= 90
                    ? "text-green-700"
                    : q.passRate >= 75
                    ? "text-orange-600"
                    : "text-red-600"
                )}
              >
                <p className="text-2xl font-black tabular-nums">
                  {q.passRate}%
                </p>
                <p className="text-[10px] uppercase tracking-wider">
                  Pass Rate
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">Pass Rate Trend:</p>
              <TrendBadge value={q.passRateTrend} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md bg-gray-50 p-2">
                <p className="text-gray-500">Total Defects</p>
                <p className="text-lg font-bold text-red-700 tabular-nums">
                  {formatNumber(q.totalDefects)}
                </p>
              </div>
              <div className="rounded-md bg-gray-50 p-2">
                <p className="text-gray-500">Top Defect</p>
                <p className="font-semibold text-gray-800 leading-tight">
                  {q.topDefect}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Section */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-purple-100">
                <ClipboardList className="h-4 w-4 text-purple-700" />
              </div>
              <CardTitle className="text-sm font-semibold text-gray-800">
                Orders
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-green-50 p-3 text-center">
                <CheckCircle2 className="mx-auto h-5 w-5 text-green-600 mb-1" />
                <p className="text-lg font-black text-green-800 tabular-nums">
                  {o.completed}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-green-600">
                  Completed
                </p>
              </div>
              <div className="rounded-md bg-red-50 p-3 text-center">
                <AlertTriangle className="mx-auto h-5 w-5 text-red-600 mb-1" />
                <p className="text-lg font-black text-red-800 tabular-nums">
                  {o.atRisk}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-red-600">
                  At Risk
                </p>
              </div>
              <div className="rounded-md bg-blue-50 p-3 text-center">
                <Package className="mx-auto h-5 w-5 text-blue-600 mb-1" />
                <p className="text-lg font-black text-blue-800 tabular-nums">
                  {o.newOrders}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-blue-600">
                  New
                </p>
              </div>
              <div className="rounded-md bg-gray-50 p-3 text-center">
                <ClipboardList className="mx-auto h-5 w-5 text-gray-600 mb-1" />
                <p className="text-lg font-black text-gray-800 tabular-nums">
                  {o.totalActive}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-gray-600">
                  Total Active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipments Section */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-orange-100">
                <Truck className="h-4 w-4 text-orange-700" />
              </div>
              <CardTitle className="text-sm font-semibold text-gray-800">
                Shipments
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-green-50 p-3">
                <p className="text-lg font-black text-green-800 tabular-nums">
                  {s.dispatched}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-green-600">
                  Dispatched
                </p>
              </div>
              <div className="rounded-md bg-yellow-50 p-3">
                <p className="text-lg font-black text-yellow-800 tabular-nums">
                  {s.pending}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-yellow-600">
                  Pending
                </p>
              </div>
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-lg font-black text-red-800 tabular-nums">
                  {s.delayed}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-red-600">
                  Delayed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Materials Section */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-cyan-100">
                <ShoppingCart className="h-4 w-4 text-cyan-700" />
              </div>
              <CardTitle className="text-sm font-semibold text-gray-800">
                Materials
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-green-50 p-3">
                <p className="text-lg font-black text-green-800 tabular-nums">
                  {m.received}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-green-600">
                  Received
                </p>
              </div>
              <div className="rounded-md bg-yellow-50 p-3">
                <p className="text-lg font-black text-yellow-800 tabular-nums">
                  {m.pendingPOs}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-yellow-600">
                  Pending POs
                </p>
              </div>
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-lg font-black text-red-800 tabular-nums">
                  {m.lowStockItems}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-red-600">
                  Low Stock
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Issues Section */}
        <Card className={digest.topIssues.length > 0 ? "border-red-200" : ""}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-red-100">
                <AlertCircle className="h-4 w-4 text-red-700" />
              </div>
              <CardTitle className="text-sm font-semibold text-gray-800">
                Top Issues This Week
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {digest.topIssues.length > 0 ? (
              <div className="space-y-2">
                {digest.topIssues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 rounded-md bg-gray-50 p-2"
                  >
                    <AlertTriangle
                      className={cn(
                        "h-4 w-4 shrink-0 mt-0.5",
                        issue.severity === "critical"
                          ? "text-red-600"
                          : issue.severity === "high"
                          ? "text-orange-600"
                          : "text-yellow-600"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {issue.issue}
                      </p>
                    </div>
                    <SeverityBadge severity={issue.severity} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-6 text-sm text-gray-400">
                <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-500" />
                No critical issues this week
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Focus This Week */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100">
              <CircleDot className="h-4 w-4 text-blue-700" />
            </div>
            <CardTitle className="text-sm font-semibold text-blue-900">
              Focus This Week
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {digest.focusThisWeek.length > 0 ? (
            <div className="space-y-2">
              {digest.focusThisWeek.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-blue-300 bg-white">
                    <span className="text-[10px] font-bold text-blue-600">
                      {idx + 1}
                    </span>
                  </div>
                  <p className="text-sm text-blue-800">{item}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-blue-600">
              No specific focus items generated. Review production schedule and
              upcoming deliveries.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Daily Production Chart */}
      {digest.dailyProduction.length > 0 && (
        <BarChartCard
          title="Daily Production - Produced vs Target"
          data={digest.dailyProduction.map((d) => ({
            name: d.day,
            Produced: d.produced,
            Target: d.target,
          }))}
          dataKeys={["Produced", "Target"]}
          colors={["#3b82f6", "#e5e7eb"]}
          xAxisKey="name"
          height={280}
          formatTooltipValue={(value, name) =>
            `${formatNumber(value)} pcs (${name})`
          }
        />
      )}
    </div>
  );
}
