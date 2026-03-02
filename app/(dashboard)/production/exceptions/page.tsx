"use client";

import * as React from "react";
import {
  Zap,
  AlertOctagon,
  AlertTriangle,
  Activity,
  Wrench,
  ShieldX,
  Package,
  Scissors,
  Users,
  Clock,
  RefreshCw,
  Filter,
} from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import {
  getExceptionFeedData,
  type ProductionException,
} from "@/lib/actions/analytics";

/* ---------- Helpers ---------- */

const EXCEPTION_TYPE_ICONS: Record<
  ProductionException["type"],
  React.ElementType
> = {
  output_drop: Zap,
  machine_breakdown: Wrench,
  quality_fail: ShieldX,
  material_shortage: Package,
  cutting_waste: Scissors,
  attendance: Users,
  delay: Clock,
};

const EXCEPTION_TYPE_LABELS: Record<ProductionException["type"], string> = {
  output_drop: "Output Drop",
  machine_breakdown: "Machine Breakdown",
  quality_fail: "Quality Failure",
  material_shortage: "Material Shortage",
  cutting_waste: "Cutting Waste",
  attendance: "Attendance Issue",
  delay: "Delay",
};

const SEVERITY_CONFIG: Record<
  ProductionException["severity"],
  { border: string; bg: string; text: string; badgeCls: string; label: string }
> = {
  critical: {
    border: "border-l-red-600",
    bg: "bg-red-50/50",
    text: "text-red-700",
    badgeCls: "bg-red-100 text-red-700 hover:bg-red-100",
    label: "Critical",
  },
  high: {
    border: "border-l-orange-500",
    bg: "bg-orange-50/40",
    text: "text-orange-700",
    badgeCls: "bg-orange-100 text-orange-700 hover:bg-orange-100",
    label: "High",
  },
  medium: {
    border: "border-l-yellow-500",
    bg: "bg-yellow-50/40",
    text: "text-yellow-700",
    badgeCls: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
    label: "Medium",
  },
  low: {
    border: "border-l-gray-400",
    bg: "bg-gray-50/40",
    text: "text-gray-600",
    badgeCls: "bg-gray-100 text-gray-600 hover:bg-gray-100",
    label: "Low",
  },
};

const ALL_TYPES: ProductionException["type"][] = [
  "output_drop",
  "machine_breakdown",
  "quality_fail",
  "material_shortage",
  "cutting_waste",
  "attendance",
  "delay",
];

const ALL_SEVERITIES: ProductionException["severity"][] = [
  "critical",
  "high",
  "medium",
  "low",
];

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return formatDate(ts);
}

function minutesAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes === 1) return "1 min ago";
  return `${diffMinutes} min ago`;
}

/* ---------- Component ---------- */

export default function ProductionExceptionsPage() {
  const { profile } = useProfile();
  const companyId = profile?.company_id;

  const [exceptions, setExceptions] = React.useState<ProductionException[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [lastRefresh, setLastRefresh] = React.useState<Date>(new Date());
  const [refreshing, setRefreshing] = React.useState(false);
  const [filterType, setFilterType] = React.useState<
    ProductionException["type"] | "all"
  >("all");
  const [filterSeverity, setFilterSeverity] = React.useState<
    ProductionException["severity"] | "all"
  >("all");

  const fetchData = React.useCallback(async () => {
    if (!companyId) return;
    try {
      const result = await getExceptionFeedData(companyId);
      if (result.data) {
        setExceptions(result.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
      setRefreshing(false);
    }
  }, [companyId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filtered = React.useMemo(() => {
    let data = [...exceptions];
    if (filterType !== "all") {
      data = data.filter((e) => e.type === filterType);
    }
    if (filterSeverity !== "all") {
      data = data.filter((e) => e.severity === filterSeverity);
    }
    return data;
  }, [exceptions, filterType, filterSeverity]);

  const criticalCount = exceptions.filter(
    (e) => e.severity === "critical"
  ).length;
  const highCount = exceptions.filter((e) => e.severity === "high").length;
  const mediumCount = exceptions.filter((e) => e.severity === "medium").length;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Production Exception Feed"
          description="Real-time feed of production floor problems and alerts"
          breadcrumb={[
            { label: "Production", href: "/production" },
            { label: "Exception Feed" },
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
        title="Production Exception Feed"
        description="Real-time feed of production floor problems and alerts"
        breadcrumb={[
          { label: "Production", href: "/production" },
          { label: "Exception Feed" },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              Last updated: {minutesAgo(lastRefresh)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={cn(
                  "mr-1.5 h-3.5 w-3.5",
                  refreshing && "animate-spin"
                )}
              />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Critical Issues"
          value={criticalCount}
          icon={<Zap className="h-5 w-5" />}
          color="red"
        />
        <StatCard
          title="High Priority"
          value={highCount}
          icon={<AlertOctagon className="h-5 w-5" />}
          color="orange"
        />
        <StatCard
          title="Medium Priority"
          value={mediumCount}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="orange"
        />
        <StatCard
          title="Total Exceptions Today"
          value={exceptions.length}
          icon={<Activity className="h-5 w-5" />}
          color="blue"
        />
      </div>

      {/* Filter Row */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 py-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Filter className="h-3.5 w-3.5" />
            <span className="font-medium">Type:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setFilterType("all")}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                filterType === "all"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              All
            </button>
            {ALL_TYPES.map((type) => {
              const Icon = EXCEPTION_TYPE_ICONS[type];
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    filterType === type
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {EXCEPTION_TYPE_LABELS[type]}
                </button>
              );
            })}
          </div>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="font-medium">Severity:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setFilterSeverity("all")}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                filterSeverity === "all"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              All
            </button>
            {ALL_SEVERITIES.map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                  filterSeverity === sev
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {sev}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exception Feed Timeline */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Activity className="mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">
              No exceptions found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {exceptions.length > 0
                ? "Try adjusting your filters"
                : "No production floor issues detected today"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((exception) => {
            const severity = SEVERITY_CONFIG[exception.severity];
            const TypeIcon = EXCEPTION_TYPE_ICONS[exception.type];

            return (
              <Card
                key={exception.id}
                className={cn(
                  "border-l-4 transition-colors hover:shadow-sm",
                  severity.border,
                  severity.bg
                )}
              >
                <CardContent className="py-4">
                  <div className="flex gap-4">
                    {/* Timestamp (left side) */}
                    <div className="hidden sm:flex w-24 shrink-0 flex-col items-end pt-0.5">
                      <span className="text-xs font-medium text-gray-500 tabular-nums">
                        {formatTimestamp(exception.timestamp)}
                      </span>
                      <span className="mt-0.5 text-[10px] text-gray-400">
                        {new Date(exception.timestamp).toLocaleTimeString(
                          "en-IN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>

                    {/* Icon */}
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        exception.severity === "critical"
                          ? "bg-red-100"
                          : exception.severity === "high"
                          ? "bg-orange-100"
                          : exception.severity === "medium"
                          ? "bg-yellow-100"
                          : "bg-gray-100"
                      )}
                    >
                      <TypeIcon
                        className={cn("h-4.5 w-4.5", severity.text)}
                      />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                              {exception.title}
                            </h3>
                            <Badge className={severity.badgeCls}>
                              {severity.label}
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                            {exception.description}
                          </p>
                          {/* Mobile timestamp */}
                          <p className="mt-1 text-[10px] text-gray-400 sm:hidden">
                            {formatTimestamp(exception.timestamp)}
                          </p>
                        </div>
                      </div>

                      {/* Metric / Threshold / Actual grid */}
                      {(exception.metric ||
                        exception.threshold ||
                        exception.actual) && (
                        <div className="mt-3 flex flex-wrap gap-4">
                          {exception.metric && (
                            <div>
                              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                                Metric
                              </p>
                              <p className="text-xs font-semibold text-gray-700">
                                {exception.metric}
                              </p>
                            </div>
                          )}
                          {exception.threshold && (
                            <div>
                              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                                Threshold
                              </p>
                              <p className="text-xs font-semibold text-green-700">
                                {exception.threshold}
                              </p>
                            </div>
                          )}
                          {exception.actual && (
                            <div>
                              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                                Actual
                              </p>
                              <p
                                className={cn(
                                  "text-xs font-semibold",
                                  severity.text
                                )}
                              >
                                {exception.actual}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                              Area
                            </p>
                            <p className="text-xs font-semibold text-gray-700">
                              {exception.affectedEntity}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary Banner */}
      {criticalCount > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertOctagon className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              Immediate Attention Required
            </p>
            <p className="text-xs text-red-700">
              There are {criticalCount} critical exception(s) on the production
              floor that require immediate intervention. Machine breakdowns and
              quality failures should be addressed within the current shift to
              prevent cascade delays.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
