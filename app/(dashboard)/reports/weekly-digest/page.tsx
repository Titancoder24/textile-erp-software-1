"use client";

import * as React from "react";
import {
  FileText,
  Printer,
  Calendar,
  Factory,
  Gauge,
  ShieldCheck,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  Plus,
  Check,
  Loader2,
  Truck,
  ShoppingCart,
  AlertCircle,
  Save,
  X,
} from "lucide-react";

import { cn, formatNumber, formatDate, formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { useProfile } from "@/hooks/use-profile";
import { toast } from "sonner";
import {
  getWeeklyDigestData,
  type WeeklyDigest,
} from "@/lib/actions/analytics";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function TrendBadge({ value, suffix = "%" }: { value: number; suffix?: string }) {
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

function SeverityBadge({ severity }: { severity: "critical" | "high" | "medium" }) {
  const colors = {
    critical: "bg-red-100 text-red-700 border-red-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0",
        colors[severity]
      )}
    >
      {severity}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Progress bar component
// ---------------------------------------------------------------------------

function ProgressBar({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const barColor =
    pct >= 90
      ? "bg-green-500"
      : pct >= 75
      ? "bg-blue-500"
      : pct >= 50
      ? "bg-amber-500"
      : "bg-red-500";

  return (
    <div className={cn("w-full", className)}>
      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function WeeklyDigestPage() {
  const { profile } = useProfile();
  const companyId = profile?.company_id;

  const [digest, setDigest] = React.useState<WeeklyDigest | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Week selector state
  const [selectedDate, setSelectedDate] = React.useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });

  // Focus items state (editable)
  const [focusItems, setFocusItems] = React.useState<Array<{ text: string; checked: boolean }>>([]);
  const [newFocusItem, setNewFocusItem] = React.useState("");

  // GM Notes
  const [gmNotes, setGmNotes] = React.useState("");
  const [notesSaved, setNotesSaved] = React.useState(false);

  // ---------------------------------------------------------------------------
  // Data fetch
  // ---------------------------------------------------------------------------

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
            const d = result.data as WeeklyDigest;
            setDigest(d);
            // Initialize focus items from data
            if (d?.focusThisWeek) {
              setFocusItems(d.focusThisWeek.map((text) => ({ text, checked: false })));
            }
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

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handlePrint = React.useCallback(() => {
    window.print();
  }, []);

  function handleAddFocusItem() {
    if (!newFocusItem.trim()) return;
    setFocusItems((prev) => [...prev, { text: newFocusItem.trim(), checked: false }]);
    setNewFocusItem("");
    toast.success("Focus item added");
  }

  function handleToggleFocusItem(idx: number) {
    setFocusItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, checked: !item.checked } : item))
    );
  }

  function handleSaveNotes() {
    setNotesSaved(true);
    toast.success("Notes saved to digest");
    setTimeout(() => setNotesSaved(false), 2000);
  }

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Error
  // ---------------------------------------------------------------------------

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Weekly Factory Performance Digest"
          description="Read in 2 minutes -- the week at a glance"
          breadcrumb={[{ label: "Reports", href: "/reports" }, { label: "Weekly Digest" }]}
        />
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Empty
  // ---------------------------------------------------------------------------

  if (!digest) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Weekly Factory Performance Digest"
          description="Read in 2 minutes -- the week at a glance"
          breadcrumb={[{ label: "Reports", href: "/reports" }, { label: "Weekly Digest" }]}
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Factory className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-600">No data available for this week</p>
            <p className="text-xs text-gray-400 mt-1">
              Production entries and inspection data generate the weekly digest automatically.
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

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6 print:space-y-4">
      <PageHeader
        title="Weekly Factory Performance Digest"
        description="Read in 2 minutes -- the week at a glance"
        breadcrumb={[{ label: "Reports", href: "/reports" }, { label: "Weekly Digest" }]}
        actions={
          <div className="flex items-center gap-2 print:hidden">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto h-8 text-xs"
            />
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-1.5 h-3.5 w-3.5" />
              Print Report
            </Button>
          </div>
        }
      />

      {/* Header Banner Card */}
      <Card className="border-gray-800 bg-gray-900 text-white print:bg-white print:text-gray-900 print:border-gray-300">
        <CardContent className="py-5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 print:text-gray-500 mb-1">
            Weekly Performance Digest
          </p>
          <h2 className="text-xl font-black tracking-tight">
            {digest.weekRange}
          </h2>
          <p className="text-xs text-gray-400 print:text-gray-500 mt-1">
            Generated: {formatDateTime(digest.generatedAt)}
            {profile?.full_name && <span> | {profile.full_name}</span>}
          </p>
        </CardContent>
      </Card>

      {/* 2-COLUMN NEWSPAPER LAYOUT */}
      <div className="grid gap-4 md:grid-cols-2 print:grid-cols-2">
        {/* ============= LEFT COLUMN ============= */}
        <div className="space-y-4">
          {/* Section A: Production Summary */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100 print:bg-blue-50">
                  <Factory className="h-4 w-4 text-blue-700" />
                </div>
                <CardTitle className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  A. Production Summary
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Produced vs Target with big progress */}
              <div>
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-500">Produced vs Target</p>
                    <p className="text-2xl font-black tabular-nums text-gray-900">
                      {formatNumber(p.totalProduced)}
                      <span className="text-sm font-normal text-gray-400 ml-1">
                        / {formatNumber(p.totalTarget)} pcs
                      </span>
                    </p>
                  </div>
                  <div
                    className={cn(
                      "text-right",
                      p.achievementPct >= 90 ? "text-green-700" : p.achievementPct >= 75 ? "text-amber-600" : "text-red-600"
                    )}
                  >
                    <p className="text-3xl font-black tabular-nums">{p.achievementPct}%</p>
                  </div>
                </div>
                <ProgressBar value={p.totalProduced} max={p.totalTarget} />
              </div>

              {/* Efficiency with trend */}
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 border border-gray-100">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Avg Efficiency</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tabular-nums text-gray-900">{p.avgEfficiency}%</span>
                  <TrendBadge value={p.efficiencyTrend} />
                  <span className="text-[10px] text-gray-400">vs last week</span>
                </div>
              </div>

              {/* Best / Worst line */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-green-50 border border-green-100 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-green-600">Best Line</p>
                  <p className="text-sm font-bold text-green-900 truncate mt-0.5">{p.bestLine}</p>
                  <p className="text-xl font-black text-green-700 tabular-nums">{p.bestLineEfficiency}%</p>
                </div>
                <div className="rounded-lg bg-red-50 border border-red-100 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-red-600">Worst Line</p>
                  <p className="text-sm font-bold text-red-900 truncate mt-0.5">{p.worstLine}</p>
                  <p className="text-xl font-black text-red-700 tabular-nums">{p.worstLineEfficiency}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section B: Quality Report */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-green-100">
                  <ShieldCheck className="h-4 w-4 text-green-700" />
                </div>
                <CardTitle className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  B. Quality Report
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Total Inspections</p>
                  <p className="text-2xl font-black tabular-nums text-gray-900">{q.totalInspections}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pass Rate</p>
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "text-2xl font-black tabular-nums",
                        q.passRate >= 90 ? "text-green-700" : q.passRate >= 75 ? "text-amber-600" : "text-red-600"
                      )}
                    >
                      {q.passRate}%
                    </p>
                    <TrendBadge value={q.passRateTrend} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-md bg-gray-50 border border-gray-100 p-3">
                  <p className="text-gray-500">Total Defects</p>
                  <p className="text-lg font-black text-red-700 tabular-nums">{formatNumber(q.totalDefects)}</p>
                </div>
                <div className="rounded-md bg-gray-50 border border-gray-100 p-3">
                  <p className="text-gray-500">Top Defect Type</p>
                  <p className="font-bold text-gray-800 text-sm mt-0.5">{q.topDefect}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section C: Top Issues */}
          <Card className={digest.topIssues.length > 0 ? "border-red-200" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-red-100">
                  <AlertCircle className="h-4 w-4 text-red-700" />
                </div>
                <CardTitle className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  C. Top Issues This Week
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {digest.topIssues.length > 0 ? (
                <div className="space-y-2">
                  {digest.topIssues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 rounded-md bg-gray-50 border border-gray-100 px-3 py-2.5"
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <AlertTriangle
                          className={cn(
                            "h-4 w-4 shrink-0 mt-0.5",
                            issue.severity === "critical" ? "text-red-600" : issue.severity === "high" ? "text-orange-600" : "text-yellow-600"
                          )}
                        />
                        <p className="text-sm text-gray-700">{issue.issue}</p>
                      </div>
                      <SeverityBadge severity={issue.severity} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-6 text-sm text-gray-400">
                  <Check className="h-4 w-4 mr-1.5 text-green-500" />
                  No critical issues this week
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ============= RIGHT COLUMN ============= */}
        <div className="space-y-4">
          {/* Section D: Orders & Shipments */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-purple-100">
                  <ClipboardList className="h-4 w-4 text-purple-700" />
                </div>
                <CardTitle className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  D. Orders & Shipments
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Orders grid */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Orders</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-center">
                    <p className="text-xs text-green-600">Completed</p>
                    <p className="text-2xl font-black text-green-800 tabular-nums">{o.completed}</p>
                  </div>
                  <div className={cn("rounded-lg border p-3 text-center", o.atRisk > 0 ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100")}>
                    <p className={cn("text-xs", o.atRisk > 0 ? "text-red-600" : "text-gray-500")}>At Risk</p>
                    <p className={cn("text-2xl font-black tabular-nums", o.atRisk > 0 ? "text-red-800" : "text-gray-800")}>{o.atRisk}</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-center">
                    <p className="text-xs text-blue-600">Active</p>
                    <p className="text-2xl font-black text-blue-800 tabular-nums">{o.totalActive}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-center">
                    <p className="text-xs text-gray-500">New</p>
                    <p className="text-2xl font-black text-gray-800 tabular-nums">{o.newOrders}</p>
                  </div>
                </div>
              </div>

              {/* Shipments grid */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Shipments</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-center">
                    <Truck className="mx-auto h-4 w-4 text-green-600 mb-1" />
                    <p className="text-lg font-black text-green-800 tabular-nums">{s.dispatched}</p>
                    <p className="text-[10px] text-green-600">Dispatched</p>
                  </div>
                  <div className="rounded-lg bg-yellow-50 border border-yellow-100 p-3 text-center">
                    <Package className="mx-auto h-4 w-4 text-yellow-600 mb-1" />
                    <p className="text-lg font-black text-yellow-800 tabular-nums">{s.pending}</p>
                    <p className="text-[10px] text-yellow-600">Pending</p>
                  </div>
                  <div className={cn("rounded-lg border p-3 text-center", s.delayed > 0 ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100")}>
                    <AlertTriangle className={cn("mx-auto h-4 w-4 mb-1", s.delayed > 0 ? "text-red-600" : "text-gray-400")} />
                    <p className={cn("text-lg font-black tabular-nums", s.delayed > 0 ? "text-red-800" : "text-gray-800")}>{s.delayed}</p>
                    <p className={cn("text-[10px]", s.delayed > 0 ? "text-red-600" : "text-gray-500")}>Delayed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section E: Materials & Supply Chain */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-cyan-100">
                  <ShoppingCart className="h-4 w-4 text-cyan-700" />
                </div>
                <CardTitle className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  E. Materials & Supply Chain
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-yellow-50 border border-yellow-100 p-3 text-center">
                  <p className="text-xs text-yellow-600">Pending POs</p>
                  <p className="text-2xl font-black text-yellow-800 tabular-nums">{m.pendingPOs}</p>
                </div>
                <div className={cn("rounded-lg border p-3 text-center", m.lowStockItems > 5 ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100")}>
                  <p className={cn("text-xs", m.lowStockItems > 5 ? "text-red-600" : "text-gray-500")}>Low Stock Items</p>
                  <p className={cn("text-2xl font-black tabular-nums", m.lowStockItems > 5 ? "text-red-800" : "text-gray-800")}>{m.lowStockItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section F: Focus This Week */}
          <Card className="border-blue-200 bg-blue-50/30 print:bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100">
                  <FileText className="h-4 w-4 text-blue-700" />
                </div>
                <CardTitle className="text-sm font-bold text-blue-900 uppercase tracking-wider">
                  F. Focus This Week
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {focusItems.length > 0 ? (
                <div className="space-y-2">
                  {focusItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-md bg-white border border-blue-100 px-3 py-2 print:border-gray-200"
                    >
                      <Checkbox
                        id={`focus-${idx}`}
                        checked={item.checked}
                        onCheckedChange={() => handleToggleFocusItem(idx)}
                        className="print:hidden"
                      />
                      <label
                        htmlFor={`focus-${idx}`}
                        className={cn(
                          "text-sm cursor-pointer flex-1",
                          item.checked ? "line-through text-gray-400" : "text-blue-800"
                        )}
                      >
                        {item.text}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-blue-600 py-2">
                  No focus items generated. Add items below.
                </p>
              )}

              {/* Add Focus Item (inline) */}
              <div className="flex items-center gap-2 print:hidden">
                <Input
                  value={newFocusItem}
                  onChange={(e) => setNewFocusItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddFocusItem();
                  }}
                  placeholder="Add a focus item for the week..."
                  className="text-sm h-8 bg-white border-blue-200 flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-blue-300 text-blue-700 hover:bg-blue-100 shrink-0"
                  onClick={handleAddFocusItem}
                  disabled={!newFocusItem.trim()}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FULL WIDTH: Daily Production Chart */}
      {digest.dailyProduction.length > 0 && (
        <div className="print:break-before-page">
          <BarChartCard
            title="Daily Production This Week"
            data={digest.dailyProduction.map((d) => ({
              name: d.day,
              Produced: d.produced,
              Target: d.target,
            }))}
            dataKeys={["Produced", "Target"]}
            colors={["#3b82f6", "#d1d5db"]}
            xAxisKey="name"
            height={300}
            formatTooltipValue={(value, name) => `${formatNumber(value)} pcs (${name})`}
          />
        </div>
      )}

      {/* GM Notes Section */}
      <Card className="print:break-before-avoid">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-100">
                <FileText className="h-4 w-4 text-gray-700" />
              </div>
              <CardTitle className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                GM Notes
              </CardTitle>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveNotes}
              disabled={!gmNotes.trim()}
              className="print:hidden h-7 text-xs"
            >
              {notesSaved ? (
                <>
                  <Check className="mr-1 h-3.5 w-3.5 text-green-600" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="mr-1 h-3.5 w-3.5" />
                  Save Notes
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={gmNotes}
            onChange={(e) => {
              setGmNotes(e.target.value);
              setNotesSaved(false);
            }}
            placeholder="Add any additional context, observations, or instructions for the week..."
            rows={5}
            className="text-sm print:border-none print:p-0 print:resize-none"
          />
          {gmNotes.trim() && (
            <p className="hidden print:block text-sm text-gray-700 whitespace-pre-wrap mt-2">{gmNotes}</p>
          )}
        </CardContent>
      </Card>

      {/* Print-specific footer */}
      <div className="hidden print:block text-center border-t border-gray-200 pt-4 mt-4">
        <p className="text-xs text-gray-400">
          TextileOS Weekly Digest | Generated {formatDateTime(digest.generatedAt)} | Confidential
        </p>
      </div>
    </div>
  );
}
