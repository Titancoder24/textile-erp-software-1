"use client";

import * as React from "react";
import {
  ArrowRightLeft,
  Clock,
  GitBranch,
  Activity,
  Timer,
  ArrowRight,
  Plus,
  ClipboardList,
  AlertTriangle,
  Scissors,
  Shirt,
  Paintbrush,
  BoxSelect,
  Truck,
  Warehouse,
} from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { cn, formatNumber } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import {
  getHandoffTrackerData,
  type HandoffEntry,
  type HandoffSummary,
} from "@/lib/actions/analytics";
import { toast } from "sonner";

/* ---------- constants ---------- */

const DEPARTMENTS = [
  "Store",
  "Cutting",
  "Sewing",
  "Finishing",
  "Packing",
  "Shipment",
] as const;

const DEPT_ICONS: Record<string, React.ReactNode> = {
  Store: <Warehouse className="h-4 w-4" />,
  Cutting: <Scissors className="h-4 w-4" />,
  Sewing: <Shirt className="h-4 w-4" />,
  Finishing: <Paintbrush className="h-4 w-4" />,
  Packing: <BoxSelect className="h-4 w-4" />,
  Shipment: <Truck className="h-4 w-4" />,
};

const STATUS_BADGE: Record<
  HandoffEntry["status"],
  { label: string; className: string }
> = {
  on_time: {
    label: "On Time",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  delayed: {
    label: "Delayed",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  critical_delay: {
    label: "Critical Delay",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

function getWaitColor(minutes: number) {
  if (minutes <= 30) return "text-emerald-700";
  if (minutes <= 120) return "text-amber-700";
  return "text-red-700";
}

function getArrowColor(avgMinutes: number) {
  if (avgMinutes <= 30) return "bg-emerald-500";
  if (avgMinutes <= 120) return "bg-amber-500";
  return "bg-red-500";
}

function getArrowTextColor(avgMinutes: number) {
  if (avgMinutes <= 30) return "text-emerald-600";
  if (avgMinutes <= 120) return "text-amber-600";
  return "text-red-600";
}

function formatWaitTime(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDateTimeShort(dateStr: string) {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

/* ---------- Skeleton ---------- */

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3 animate-pulse">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-36 bg-gray-200 rounded" />
          <div className="h-4 w-28 bg-gray-200 rounded" />
          <div className="h-4 w-28 bg-gray-200 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

function FlowSkeleton() {
  return (
    <div className="flex items-center justify-center gap-2 py-8 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <React.Fragment key={i}>
          <div className="h-14 w-14 rounded-full bg-gray-200" />
          {i < 5 && <div className="h-1 w-12 bg-gray-200 rounded" />}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ---------- page ---------- */

export default function HandoffsPage() {
  const { profile } = useProfile();
  const companyId = profile?.company_id;

  const [handoffs, setHandoffs] = React.useState<HandoffEntry[]>([]);
  const [summary, setSummary] = React.useState<HandoffSummary>({
    avgWaitMinutes: 0,
    totalIdleHours: 0,
    worstHandoff: "N/A",
    handoffsByRoute: [],
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Log handoff sheet
  const [logOpen, setLogOpen] = React.useState(false);
  const [logOrderNumber, setLogOrderNumber] = React.useState("");
  const [logFromDept, setLogFromDept] = React.useState("");
  const [logToDept, setLogToDept] = React.useState("");
  const [logCompletedAt, setLogCompletedAt] = React.useState("");
  const [logReceivedAt, setLogReceivedAt] = React.useState("");
  const [logQuantity, setLogQuantity] = React.useState("");
  const [logNotes, setLogNotes] = React.useState("");

  /* fetch */
  React.useEffect(() => {
    if (!companyId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const result = await getHandoffTrackerData(companyId!);
      if (cancelled) return;
      if (result.error) {
        setError(result.error);
        toast.error("Failed to load handoff data");
      } else if (result.data) {
        setHandoffs(result.data.handoffs);
        setSummary(result.data.summary);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  /* computed wait time for log form */
  const computedWait = React.useMemo(() => {
    if (!logCompletedAt || !logReceivedAt) return null;
    const completed = new Date(logCompletedAt);
    const received = new Date(logReceivedAt);
    const diff = received.getTime() - completed.getTime();
    if (diff < 0) return null;
    return Math.round(diff / (1000 * 60));
  }, [logCompletedAt, logReceivedAt]);

  /* route avg map for flow diagram */
  const routeAvgMap = React.useMemo(() => {
    const map = new Map<string, number>();
    summary.handoffsByRoute.forEach((r) => {
      map.set(r.route, r.avgWait);
    });
    return map;
  }, [summary.handoffsByRoute]);

  /* bar chart data */
  const routeChartData = React.useMemo(() => {
    return [...summary.handoffsByRoute]
      .sort((a, b) => b.avgWait - a.avgWait)
      .map((r) => ({
        name: r.route,
        "Avg Wait (min)": r.avgWait,
      }));
  }, [summary.handoffsByRoute]);

  /* log handler */
  function handleLogHandoff() {
    if (!logOrderNumber || !logFromDept || !logToDept || !logCompletedAt || !logReceivedAt || !logQuantity) {
      toast.error("All fields are required");
      return;
    }
    if (logFromDept === logToDept) {
      toast.error("From and To departments must be different");
      return;
    }
    if (computedWait === null || computedWait < 0) {
      toast.error("Received time must be after completed time");
      return;
    }

    const qty = parseInt(logQuantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }

    const hours = Math.floor(computedWait / 60);
    const mins = computedWait % 60;
    const waitFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    let status: HandoffEntry["status"] = "on_time";
    if (computedWait > 240) status = "critical_delay";
    else if (computedWait > 60) status = "delayed";

    const newEntry: HandoffEntry = {
      id: crypto.randomUUID(),
      orderNumber: logOrderNumber,
      fromDept: logFromDept,
      toDept: logToDept,
      completedAt: logCompletedAt,
      receivedAt: logReceivedAt,
      waitTimeMinutes: computedWait,
      waitTimeFormatted: waitFormatted,
      quantity: qty,
      status,
      date: logCompletedAt.split("T")[0],
    };

    setHandoffs((prev) => [newEntry, ...prev]);

    // Recompute summary
    const allHandoffs = [newEntry, ...handoffs];
    const totalWait = allHandoffs.reduce((s, h) => s + h.waitTimeMinutes, 0);
    const avgWait = allHandoffs.length > 0 ? Math.round(totalWait / allHandoffs.length) : 0;

    const routeMap = new Map<string, { totalWait: number; count: number }>();
    allHandoffs.forEach((h) => {
      const route = `${h.fromDept} → ${h.toDept}`;
      const existing = routeMap.get(route) || { totalWait: 0, count: 0 };
      existing.totalWait += h.waitTimeMinutes;
      existing.count++;
      routeMap.set(route, existing);
    });

    const handoffsByRoute = Array.from(routeMap.entries()).map(([route, d]) => ({
      route,
      avgWait: Math.round(d.totalWait / d.count),
      count: d.count,
    }));

    const worstRoute = [...handoffsByRoute].sort((a, b) => b.avgWait - a.avgWait)[0];

    setSummary({
      avgWaitMinutes: avgWait,
      totalIdleHours: Math.round(totalWait / 60 * 10) / 10,
      worstHandoff: worstRoute ? `${worstRoute.route} (avg ${worstRoute.avgWait} min)` : "N/A",
      handoffsByRoute,
    });

    toast.success(`Handoff logged: ${computedWait} minutes wait time`);

    // Reset form
    setLogOpen(false);
    setLogOrderNumber("");
    setLogFromDept("");
    setLogToDept("");
    setLogCompletedAt("");
    setLogReceivedAt("");
    setLogQuantity("");
    setLogNotes("");
  }

  /* flow diagram route helper */
  function getFlowAvg(from: string, to: string): number | null {
    const route = `${from} → ${to}`;
    return routeAvgMap.get(route) ?? null;
  }

  /* ---------- render ---------- */

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inter-Department Handoff Tracker"
        description="Expose hidden delays between departments"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Production", href: "/production" },
          { label: "Handoffs" },
        ]}
        actions={
          <Button onClick={() => setLogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Log Handoff
          </Button>
        }
      />

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Avg Wait Time"
          value={loading ? "-" : `${summary.avgWaitMinutes} min`}
          icon={<Timer className="h-5 w-5" />}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Total Idle Hours"
          value={loading ? "-" : `${summary.totalIdleHours}h`}
          icon={<Clock className="h-5 w-5" />}
          color={summary.totalIdleHours > 10 ? "red" : "orange"}
          loading={loading}
        />
        <StatCard
          title="Worst Handoff Route"
          value={loading ? "-" : summary.worstHandoff.split(" (")[0]}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="red"
          loading={loading}
        />
        <StatCard
          title="Total Handoffs Tracked"
          value={loading ? "-" : formatNumber(handoffs.length)}
          icon={<ArrowRightLeft className="h-5 w-5" />}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">
            Failed to load data: {error}
          </CardContent>
        </Card>
      )}

      {/* Department Flow Visualization */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-blue-600" />
            Department Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <FlowSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <div className="flex items-center justify-center gap-0 py-6 min-w-[640px] px-4">
                {DEPARTMENTS.map((dept, idx) => {
                  const isLast = idx === DEPARTMENTS.length - 1;
                  const nextDept = isLast ? null : DEPARTMENTS[idx + 1];
                  const avgWait = nextDept ? getFlowAvg(dept, nextDept) : null;

                  return (
                    <React.Fragment key={dept}>
                      {/* Department circle */}
                      <div className="flex flex-col items-center gap-1.5 shrink-0">
                        <div
                          className={cn(
                            "h-14 w-14 rounded-full flex items-center justify-center border-2 transition-all",
                            "bg-white border-gray-300 text-gray-600",
                            "hover:border-blue-400 hover:shadow-md"
                          )}
                        >
                          {DEPT_ICONS[dept]}
                        </div>
                        <span className="text-xs font-semibold text-gray-700 text-center leading-tight">
                          {dept}
                        </span>
                      </div>

                      {/* Arrow connector between departments */}
                      {!isLast && (
                        <div className="flex flex-col items-center mx-1 shrink-0 min-w-[72px]">
                          {/* Avg time label */}
                          <span
                            className={cn(
                              "text-[10px] font-bold mb-1 tabular-nums",
                              avgWait !== null
                                ? getArrowTextColor(avgWait)
                                : "text-gray-400"
                            )}
                          >
                            {avgWait !== null
                              ? formatWaitTime(avgWait)
                              : "No data"}
                          </span>
                          {/* Arrow bar */}
                          <div className="relative flex items-center w-full">
                            <div
                              className={cn(
                                "h-1.5 flex-1 rounded-l",
                                avgWait !== null
                                  ? getArrowColor(avgWait)
                                  : "bg-gray-300"
                              )}
                            />
                            <div
                              className={cn(
                                "h-0 w-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px]",
                                avgWait !== null
                                  ? avgWait <= 30
                                    ? "border-l-emerald-500"
                                    : avgWait <= 120
                                      ? "border-l-amber-500"
                                      : "border-l-red-500"
                                  : "border-l-gray-300"
                              )}
                            />
                          </div>
                          {/* Count label */}
                          {avgWait !== null && (
                            <span className="text-[9px] text-gray-400 mt-0.5">
                              avg
                            </span>
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-4 rounded bg-emerald-500" />
                  <span>Under 30 min</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-4 rounded bg-amber-500" />
                  <span>30-120 min</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-4 rounded bg-red-500" />
                  <span>Over 120 min</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Route Analysis Chart */}
      {!loading && routeChartData.length > 0 && (
        <BarChartCard
          title="Route Analysis - Avg Wait Time per Route"
          data={routeChartData}
          dataKeys={["Avg Wait (min)"]}
          horizontal
          height={Math.max(200, routeChartData.length * 50)}
          colors={["#2563eb", "#ea580c", "#dc2626", "#16a34a", "#9333ea", "#0891b2"]}
          formatTooltipValue={(v) => `${v} min`}
        />
      )}

      {/* Handoff Log Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-violet-600" />
            Handoff Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton />
          ) : handoffs.length === 0 ? (
            <div className="text-center py-12">
              <ArrowRightLeft className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">
                No handoff data available. Create work orders and log production entries to see handoff tracking.
              </p>
              <Button
                onClick={() => setLogOpen(true)}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-1" />
                Log First Handoff
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Completed At
                    </th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Received At
                    </th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Wait Time
                    </th>
                    <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {handoffs.map((entry) => {
                    const badge = STATUS_BADGE[entry.status];
                    return (
                      <tr
                        key={entry.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-2.5 px-3">
                          <span className="font-medium text-gray-900 text-xs">
                            {entry.orderNumber}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-medium text-gray-700">
                              {entry.fromDept}
                            </span>
                            <ArrowRight
                              className={cn(
                                "h-3.5 w-3.5",
                                getWaitColor(entry.waitTimeMinutes)
                              )}
                            />
                            <span className="font-medium text-gray-700">
                              {entry.toDept}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-xs text-gray-500">
                          {formatDateTimeShort(entry.completedAt)}
                        </td>
                        <td className="py-2.5 px-3 text-xs text-gray-500">
                          {formatDateTimeShort(entry.receivedAt)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={cn(
                              "text-xs font-bold tabular-nums",
                              getWaitColor(entry.waitTimeMinutes)
                            )}
                          >
                            {entry.waitTimeFormatted}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-xs text-gray-700 tabular-nums">
                          {formatNumber(entry.quantity)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border",
                              badge.className
                            )}
                          >
                            {badge.label}
                          </span>
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

      {/* Insight Card */}
      {!loading && handoffs.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Activity className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-900 mb-1">
                  Handoff Insight
                </h4>
                <p className="text-sm text-amber-800 leading-relaxed">
                  This period, <strong>{summary.totalIdleHours} hours</strong> were lost in handoff gaps.
                  {summary.worstHandoff !== "N/A" && (
                    <>
                      {" "}The biggest bottleneck is{" "}
                      <strong>{summary.worstHandoff}</strong>.
                    </>
                  )}
                  {summary.avgWaitMinutes > 60 && (
                    <>
                      {" "}Average wait of <strong>{summary.avgWaitMinutes} minutes</strong> per handoff exceeds the recommended 60-minute target.
                    </>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Log Handoff Sheet */}
      <Sheet open={logOpen} onOpenChange={setLogOpen}>
        <SheetContent className="sm:max-w-md w-full overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Log Handoff</SheetTitle>
            <SheetDescription>
              Record a department-to-department handoff with timestamps
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4">
            <div>
              <Label>Order / Work Order Number</Label>
              <Input
                placeholder="e.g., SO-2026-0042 or WO-2026-0018"
                value={logOrderNumber}
                onChange={(e) => setLogOrderNumber(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>From Department</Label>
                <Select value={logFromDept} onValueChange={setLogFromDept}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>To Department</Label>
                <Select value={logToDept} onValueChange={setLogToDept}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.filter((d) => d !== logFromDept).map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Completed At (from departing dept)</Label>
              <Input
                type="datetime-local"
                value={logCompletedAt}
                onChange={(e) => setLogCompletedAt(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Received At (by receiving dept)</Label>
              <Input
                type="datetime-local"
                value={logReceivedAt}
                onChange={(e) => setLogReceivedAt(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Auto-calculated wait time */}
            {computedWait !== null && (
              <Card
                className={cn(
                  "border",
                  computedWait <= 30
                    ? "bg-emerald-50 border-emerald-200"
                    : computedWait <= 120
                      ? "bg-amber-50 border-amber-200"
                      : "bg-red-50 border-red-200"
                )}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <Timer
                    className={cn(
                      "h-5 w-5",
                      getWaitColor(computedWait)
                    )}
                  />
                  <div>
                    <span className="text-xs text-gray-500">Calculated Wait Time</span>
                    <p
                      className={cn(
                        "text-lg font-bold tabular-nums",
                        getWaitColor(computedWait)
                      )}
                    >
                      {formatWaitTime(computedWait)}
                    </p>
                  </div>
                  {computedWait > 120 && (
                    <Badge className="bg-red-100 text-red-700 border-red-200 ml-auto text-[10px]">
                      Critical Delay
                    </Badge>
                  )}
                  {computedWait > 60 && computedWait <= 120 && (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 ml-auto text-[10px]">
                      Delayed
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )}

            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                placeholder="Number of pieces handed off"
                value={logQuantity}
                onChange={(e) => setLogQuantity(e.target.value)}
                className="mt-1"
                min={1}
              />
            </div>

            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Any remarks about this handoff..."
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <Button
              onClick={handleLogHandoff}
              disabled={
                !logOrderNumber ||
                !logFromDept ||
                !logToDept ||
                !logCompletedAt ||
                !logReceivedAt ||
                !logQuantity
              }
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-1" />
              Log Handoff
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
