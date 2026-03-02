"use client";

import * as React from "react";
import {
  RotateCcw,
  Banknote,
  CircleDollarSign,
  Percent,
  ClipboardPlus,
  AlertCircle,
  Wrench,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import {
  getReworkCostData,
  type ReworkSummary,
  type ReworkEntry,
} from "@/lib/actions/analytics";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const DEFECT_TYPES = [
  "Broken Stitch",
  "Skip Stitch",
  "Oil Stain",
  "Fabric Defect",
  "Puckering",
  "Uneven Hem",
  "Open Seam",
  "Wrong Measurement",
  "Shade Variation",
  "Needle Damage",
  "Stain",
  "Other",
];

const PRODUCTION_LINES = [
  "Line 1",
  "Line 2",
  "Line 3",
  "Line 4",
  "Line 5",
  "Line 6",
  "Line 7",
  "Line 8",
];

const COST_PER_MINUTE = 3.5;
const THREAD_COST_PER_PIECE = 2.0;
const HANDLING_COST_PER_PIECE = 1.5;

// ---------------------------------------------------------------------------
// Severity badge
// ---------------------------------------------------------------------------
function SeverityBadge({ severity }: { severity: string }) {
  const config: Record<string, string> = {
    critical: "bg-red-100 text-red-700 border-red-200",
    major: "bg-orange-100 text-orange-700 border-orange-200",
    minor: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[11px] capitalize border font-medium",
        config[severity] || "bg-gray-100 text-gray-600 border-gray-200"
      )}
    >
      {severity}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------
function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-xl" />
        ))}
      </div>
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="h-80 bg-gray-100 rounded-xl" />
          <div className="h-80 bg-gray-100 rounded-xl" />
        </div>
        <div className="lg:col-span-2 h-[680px] bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------
export default function ReworkCostTrackerPage() {
  const { profile } = useProfile();
  const companyId = profile?.company_id;

  // Data
  const [summary, setSummary] = React.useState<ReworkSummary | null>(null);
  const [entries, setEntries] = React.useState<ReworkEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Quick-log form state
  const [fOrder, setFOrder] = React.useState("");
  const [fLine, setFLine] = React.useState("");
  const [fDefect, setFDefect] = React.useState("");
  const [fSeverity, setFSeverity] = React.useState("major");
  const [fQty, setFQty] = React.useState("");
  const [fMinutes, setFMinutes] = React.useState("");
  const [fOperator, setFOperator] = React.useState("");
  const [fNotes, setFNotes] = React.useState("");
  const [recentLocal, setRecentLocal] = React.useState<
    Array<{
      id: string;
      order: string;
      line: string;
      defect: string;
      qty: number;
      cost: number;
      time: string;
    }>
  >([]);

  // Table sort
  const [sortField, setSortField] = React.useState<keyof ReworkEntry>("date");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [tableFilter, setTableFilter] = React.useState("");

  // ---- Fetch data -------------------------------------------------------
  React.useEffect(() => {
    if (!companyId) return;
    let cancelled = false;
    setLoading(true);
    getReworkCostData(companyId).then((res) => {
      if (cancelled) return;
      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setSummary(res.data.summary);
        setEntries(res.data.entries);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  // ---- Auto-calculate cost ----------------------------------------------
  const calculatedCost = React.useMemo(() => {
    const qty = Number(fQty) || 0;
    const mins = Number(fMinutes) || 0;
    const labor = mins * COST_PER_MINUTE;
    const thread = qty * THREAD_COST_PER_PIECE;
    const handling = qty * HANDLING_COST_PER_PIECE;
    return { labor, thread, handling, total: labor + thread + handling };
  }, [fQty, fMinutes]);

  // ---- Submit rework entry ----------------------------------------------
  const handleLogRework = () => {
    if (!fLine || !fDefect || !fQty) {
      toast.error("Fill in at least Line, Defect Type, and Quantity");
      return;
    }
    const newEntry = {
      id: `local-${Date.now()}`,
      order: fOrder || "N/A",
      line: fLine,
      defect: fDefect,
      qty: Number(fQty),
      cost: Math.round(calculatedCost.total),
      time: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setRecentLocal((prev) => [newEntry, ...prev].slice(0, 5));
    toast.success(
      `Rework logged: ${formatCurrency(calculatedCost.total)} cost recorded`,
      { description: `${fDefect} on ${fLine} -- ${fQty} pcs` }
    );
    // Reset form
    setFOrder("");
    setFLine("");
    setFDefect("");
    setFSeverity("major");
    setFQty("");
    setFMinutes("");
    setFOperator("");
    setFNotes("");
  };

  // ---- Chart data prep --------------------------------------------------
  const defectChartData = React.useMemo(
    () =>
      (summary?.byDefectType ?? []).slice(0, 10).map((d) => ({
        name: d.defect.length > 18 ? d.defect.slice(0, 16) + "..." : d.defect,
        cost: d.cost,
      })),
    [summary]
  );

  const lineChartData = React.useMemo(
    () =>
      (summary?.byLine ?? []).map((l) => ({
        name: l.line,
        cost: l.cost,
      })),
    [summary]
  );

  // ---- Table sort/filter ------------------------------------------------
  const sortedEntries = React.useMemo(() => {
    let filtered = entries;
    if (tableFilter) {
      const lc = tableFilter.toLowerCase();
      filtered = entries.filter(
        (e) =>
          e.orderNumber.toLowerCase().includes(lc) ||
          e.line.toLowerCase().includes(lc) ||
          e.defectType.toLowerCase().includes(lc) ||
          e.operator.toLowerCase().includes(lc)
      );
    }
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal ?? "");
      const bStr = String(bVal ?? "");
      return sortDir === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [entries, sortField, sortDir, tableFilter]);

  const toggleSort = (field: keyof ReworkEntry) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  // ---- Unique order numbers for dropdown --------------------------------
  const orderNumbers = React.useMemo(() => {
    const s = new Set(entries.map((e) => e.orderNumber).filter(Boolean));
    return Array.from(s).sort();
  }, [entries]);

  // ======================================================================
  // RENDER
  // ======================================================================
  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Rework Cost Tracker"
          description="Track, log, and analyse rework costs across production"
          breadcrumb={[
            { label: "Quality", href: "/quality" },
            { label: "Rework Cost" },
          ]}
        />
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rework Cost Tracker"
        description="Track, log, and analyse rework costs across production"
        breadcrumb={[
          { label: "Quality", href: "/quality" },
          { label: "Rework Cost" },
        ]}
      />

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </CardContent>
        </Card>
      )}

      {/* ---- Stat Cards -------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Rework Cost (Month)"
          value={formatCurrency(summary?.totalReworkCost ?? 0)}
          icon={<Banknote className="h-4 w-4" />}
          color="red"
        />
        <StatCard
          title="Total Rework Pieces"
          value={formatNumber(summary?.totalReworkPieces ?? 0)}
          icon={<RotateCcw className="h-4 w-4" />}
          color="orange"
        />
        <StatCard
          title="Avg Cost / Rework Piece"
          value={formatCurrency(summary?.avgCostPerPiece ?? 0)}
          icon={<CircleDollarSign className="h-4 w-4" />}
          color="blue"
        />
        <StatCard
          title="% Revenue Lost to Rework"
          value={`${(summary?.revenuePercentage ?? 0).toFixed(1)}%`}
          icon={<Percent className="h-4 w-4" />}
          color="red"
        />
      </div>

      {/* ---- Two-column layout: Charts + Quick Log ----------------------- */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* LEFT: Charts */}
        <div className="lg:col-span-3 space-y-6">
          <BarChartCard
            title="Rework Cost by Defect Type"
            data={defectChartData}
            dataKeys={["cost"]}
            colors={["#dc2626"]}
            xAxisKey="name"
            horizontal
            height={320}
            formatTooltipValue={(v) => formatCurrency(v)}
          />
          <BarChartCard
            title="Rework Cost by Production Line"
            data={lineChartData}
            dataKeys={["cost"]}
            colors={["#ea580c"]}
            xAxisKey="name"
            horizontal
            height={280}
            formatTooltipValue={(v) => formatCurrency(v)}
          />
        </div>

        {/* RIGHT: Quick Log Form */}
        <div className="lg:col-span-2">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ClipboardPlus className="h-4 w-4 text-blue-600" />
                Quick Log Rework
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Order */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Order</Label>
                <Select value={fOrder} onValueChange={setFOrder}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select order (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderNumbers.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Line */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">
                  Production Line *
                </Label>
                <Select value={fLine} onValueChange={setFLine}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select line" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCTION_LINES.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Defect Type */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Defect Type *</Label>
                <Select value={fDefect} onValueChange={setFDefect}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select defect" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFECT_TYPES.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Severity */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Severity</Label>
                <div className="flex gap-2">
                  {(["critical", "major", "minor"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setFSeverity(s)}
                      className={cn(
                        "flex-1 rounded-md border px-2 py-1.5 text-xs font-medium capitalize transition-all",
                        fSeverity === s
                          ? s === "critical"
                            ? "bg-red-600 text-white border-red-600"
                            : s === "major"
                              ? "bg-orange-500 text-white border-orange-500"
                              : "bg-yellow-500 text-white border-yellow-500"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Qty + Minutes side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Quantity *</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    className="h-8 text-sm"
                    value={fQty}
                    onChange={(e) => setFQty(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">
                    Rework Time (min)
                  </Label>
                  <Input
                    type="number"
                    placeholder="0"
                    className="h-8 text-sm"
                    value={fMinutes}
                    onChange={(e) => setFMinutes(e.target.value)}
                  />
                </div>
              </div>

              {/* Operator */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Operator Name</Label>
                <Input
                  placeholder="e.g. Rajan"
                  className="h-8 text-sm"
                  value={fOperator}
                  onChange={(e) => setFOperator(e.target.value)}
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Notes</Label>
                <Textarea
                  placeholder="Additional details..."
                  value={fNotes}
                  onChange={(e) => setFNotes(e.target.value)}
                  rows={2}
                  className="text-sm"
                />
              </div>

              {/* Cost breakdown */}
              {(Number(fQty) > 0 || Number(fMinutes) > 0) && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-blue-800">
                    Estimated Cost Breakdown
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-blue-700">
                    <span>
                      Labor ({Number(fMinutes) || 0} min x {formatCurrency(COST_PER_MINUTE)})
                    </span>
                    <span className="text-right tabular-nums">
                      {formatCurrency(calculatedCost.labor)}
                    </span>
                    <span>
                      Thread ({Number(fQty) || 0} pcs x {formatCurrency(THREAD_COST_PER_PIECE)})
                    </span>
                    <span className="text-right tabular-nums">
                      {formatCurrency(calculatedCost.thread)}
                    </span>
                    <span>
                      Handling ({Number(fQty) || 0} pcs x {formatCurrency(HANDLING_COST_PER_PIECE)})
                    </span>
                    <span className="text-right tabular-nums">
                      {formatCurrency(calculatedCost.handling)}
                    </span>
                  </div>
                  <Separator className="my-1" />
                  <div className="flex justify-between text-sm font-bold text-blue-900">
                    <span>Total</span>
                    <span className="tabular-nums">
                      {formatCurrency(calculatedCost.total)}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit */}
              <Button onClick={handleLogRework} className="w-full">
                <RotateCcw className="h-4 w-4 mr-1.5" />
                Log Rework
              </Button>

              {/* Recent local entries */}
              {recentLocal.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    Recent Entries
                  </p>
                  <div className="space-y-1.5">
                    {recentLocal.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between rounded-md bg-gray-50 border border-gray-100 px-3 py-2 text-xs"
                      >
                        <div className="min-w-0">
                          <span className="font-medium text-gray-700">
                            {r.defect}
                          </span>
                          <span className="text-gray-400 mx-1">|</span>
                          <span className="text-gray-500">{r.line}</span>
                          <span className="text-gray-400 mx-1">|</span>
                          <span className="text-gray-500">{r.qty} pcs</span>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <span className="font-semibold text-red-600 tabular-nums">
                            {formatCurrency(r.cost)}
                          </span>
                          <span className="text-gray-400">{r.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ---- Full Data Table --------------------------------------------- */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold">
              All Rework Entries
            </CardTitle>
            <Input
              placeholder="Search order, line, defect, operator..."
              className="max-w-xs h-8 text-sm"
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {sortedEntries.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Wrench className="h-10 w-10 text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">No rework entries found</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    {(
                      [
                        { key: "date", label: "Date" },
                        { key: "orderNumber", label: "Order" },
                        { key: "line", label: "Line" },
                        { key: "defectType", label: "Defect" },
                        { key: "severity", label: "Severity" },
                        { key: "quantity", label: "Qty" },
                        { key: "totalCost", label: "Cost" },
                        { key: "operator", label: "Operator" },
                      ] as { key: keyof ReworkEntry; label: string }[]
                    ).map((col) => (
                      <th
                        key={col.key}
                        className="px-4 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap cursor-pointer hover:text-gray-900 select-none"
                        onClick={() => toggleSort(col.key)}
                      >
                        <span className="inline-flex items-center gap-1">
                          {col.label}
                          <ArrowUpDown
                            className={cn(
                              "h-3 w-3",
                              sortField === col.key
                                ? "text-blue-600"
                                : "text-gray-300"
                            )}
                          />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedEntries.slice(0, 50).map((e, idx) => (
                    <tr
                      key={e.id + idx}
                      className={cn(
                        "border-b border-gray-100 hover:bg-gray-50/50 transition-colors",
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/20"
                      )}
                    >
                      <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">
                        {e.date ? formatDate(e.date) : "--"}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-gray-900 whitespace-nowrap">
                        {e.orderNumber}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">
                        {e.line}
                      </td>
                      <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">
                        {e.defectType}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <SeverityBadge severity={e.severity} />
                      </td>
                      <td className="px-4 py-2.5 text-gray-700 tabular-nums whitespace-nowrap">
                        {formatNumber(e.quantity)}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-red-600 tabular-nums whitespace-nowrap">
                        {formatCurrency(e.totalCost)}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">
                        {e.operator || "--"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sortedEntries.length > 50 && (
                <p className="text-xs text-gray-400 text-center py-3">
                  Showing 50 of {sortedEntries.length} entries
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
