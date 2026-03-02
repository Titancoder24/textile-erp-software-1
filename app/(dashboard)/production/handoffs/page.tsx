"use client";

import * as React from "react";
import {
  ArrowRightLeft,
  Clock,
  AlertTriangle,
  GitBranch,
  ArrowRight,
} from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { cn, formatDate } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import {
  getHandoffTrackerData,
  type HandoffEntry,
  type HandoffSummary,
} from "@/lib/actions/analytics";

/* ---------- Helpers ---------- */

const STATUS_CONFIG: Record<
  HandoffEntry["status"],
  { border: string; bg: string; badgeCls: string; label: string }
> = {
  on_time: {
    border: "border-l-green-500",
    bg: "",
    badgeCls: "bg-green-100 text-green-700 hover:bg-green-100",
    label: "On Time",
  },
  delayed: {
    border: "border-l-yellow-500",
    bg: "bg-yellow-50/30",
    badgeCls: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
    label: "Delayed",
  },
  critical_delay: {
    border: "border-l-red-500",
    bg: "bg-red-50/30",
    badgeCls: "bg-red-100 text-red-700 hover:bg-red-100",
    label: "Critical Delay",
  },
};

function formatWaitTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function getWaitTimeColor(minutes: number): string {
  if (minutes > 240) return "text-red-700";
  if (minutes > 60) return "text-yellow-700";
  return "text-green-700";
}

/* ---------- Component ---------- */

export default function HandoffTrackerPage() {
  const { profile } = useProfile();
  const companyId = profile?.company_id;

  const [handoffs, setHandoffs] = React.useState<HandoffEntry[]>([]);
  const [summary, setSummary] = React.useState<HandoffSummary | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchData = React.useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const result = await getHandoffTrackerData(companyId);
      if (result.data) {
        setHandoffs(result.data.handoffs);
        setSummary(result.data.summary);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const barChartData = React.useMemo(() => {
    if (!summary) return [];
    return summary.handoffsByRoute.map((r) => ({
      name: r.route,
      avgWait: r.avgWait,
      count: r.count,
    }));
  }, [summary]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Inter-Department Handoff Tracker"
          description="Track wait time and idle hours between production departments"
          breadcrumb={[
            { label: "Production", href: "/production" },
            { label: "Handoff Tracker" },
          ]}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCard key={i} title="" value="" loading />
          ))}
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Inter-Department Handoff Tracker"
        description="Track wait time and idle hours between production departments"
        breadcrumb={[
          { label: "Production", href: "/production" },
          { label: "Handoff Tracker" },
        ]}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Avg Wait Time"
          value={
            summary
              ? formatWaitTime(summary.avgWaitMinutes)
              : "0m"
          }
          icon={<ArrowRightLeft className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Total Idle Hours"
          value={summary ? `${summary.totalIdleHours}h` : "0h"}
          icon={<Clock className="h-5 w-5" />}
          color="orange"
        />
        <StatCard
          title="Worst Handoff Route"
          value={summary?.worstHandoff || "N/A"}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="red"
        />
        <StatCard
          title="Total Handoffs Tracked"
          value={handoffs.length}
          icon={<GitBranch className="h-5 w-5" />}
          color="blue"
        />
      </div>

      {/* Section 1: Summary Cards + Bar Chart */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Route Summary Cards */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Handoff Route Summary
          </h3>
          {summary && summary.handoffsByRoute.length > 0 ? (
            summary.handoffsByRoute.map((route) => {
              const maxWait = Math.max(
                ...summary.handoffsByRoute.map((r) => r.avgWait),
                1
              );
              const pct = Math.round((route.avgWait / maxWait) * 100);

              return (
                <Card key={route.route}>
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-800">
                          {route.route}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "text-sm font-bold tabular-nums",
                          getWaitTimeColor(route.avgWait)
                        )}
                      >
                        {formatWaitTime(route.avgWait)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            route.avgWait > 240
                              ? "bg-red-500"
                              : route.avgWait > 60
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 tabular-nums shrink-0">
                        {route.count} handoffs
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <ArrowRightLeft className="mb-3 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-500">No route data available</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Bar Chart */}
        <div className="lg:col-span-3">
          <BarChartCard
            title="Average Wait Time by Route"
            data={barChartData}
            dataKeys={["avgWait"]}
            xAxisKey="name"
            horizontal
            colors={["#3b82f6", "#f59e0b", "#ef4444"]}
            height={280}
            formatTooltipValue={(value) => `${formatWaitTime(value)} avg wait`}
            formatXAxis={(v) => `${v} min`}
            loading={loading}
          />
        </div>
      </div>

      {/* Section 2: Individual Handoffs Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900">
            Individual Handoff Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {handoffs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <GitBranch className="mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">
                No handoff records found
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Handoffs are tracked when materials move between cutting, sewing,
                and finishing departments
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      From Dept
                    </th>
                    <th className="w-8 px-1 py-3" />
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      To Dept
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed At
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Received At
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wait Time
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {handoffs.map((handoff) => {
                    const statusCfg = STATUS_CONFIG[handoff.status];

                    return (
                      <tr
                        key={handoff.id}
                        className={cn(
                          "border-l-4 hover:bg-gray-50/50 transition-colors",
                          statusCfg.border,
                          statusCfg.bg
                        )}
                      >
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-gray-900">
                            {handoff.orderNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                            {handoff.fromDept}
                          </span>
                        </td>
                        <td className="w-8 px-1 py-3 text-center">
                          <ArrowRight className="inline h-3.5 w-3.5 text-gray-400" />
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                            {handoff.toDept}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-xs text-gray-600">
                              {formatDate(handoff.completedAt)}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {new Date(handoff.completedAt).toLocaleTimeString(
                                "en-IN",
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-xs text-gray-600">
                              {formatDate(handoff.receivedAt)}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {new Date(handoff.receivedAt).toLocaleTimeString(
                                "en-IN",
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={cn(
                              "text-sm font-bold tabular-nums",
                              getWaitTimeColor(handoff.waitTimeMinutes)
                            )}
                          >
                            {handoff.waitTimeFormatted}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm tabular-nums text-gray-700">
                            {handoff.quantity.toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={statusCfg.badgeCls}>
                            {statusCfg.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insight Banner */}
      {summary && summary.totalIdleHours > 5 && (
        <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
          <div>
            <p className="text-sm font-semibold text-orange-800">
              High Idle Time Detected
            </p>
            <p className="text-xs text-orange-700">
              Total of {summary.totalIdleHours} idle hours accumulated across
              department handoffs. The worst bottleneck is{" "}
              <strong>{summary.worstHandoff}</strong>. Consider implementing
              staged pull systems and buffer zone management to reduce wait
              times between departments.
            </p>
          </div>
        </div>
      )}

      {handoffs.length > 0 && summary && summary.totalIdleHours <= 5 && (
        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <ArrowRightLeft className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <div>
            <p className="text-sm font-semibold text-green-800">
              Handoffs Running Smoothly
            </p>
            <p className="text-xs text-green-700">
              Total idle time of {summary.totalIdleHours} hours is within
              acceptable limits. Inter-department coordination is operating
              efficiently.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
