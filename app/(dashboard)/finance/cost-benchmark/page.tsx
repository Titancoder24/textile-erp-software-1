"use client";

import * as React from "react";
import {
  Scale,
  Calculator,
  TrendingUp,
  AlertTriangle,
  Target,
  Edit,
  Check,
  X,
  Loader2,
  ArrowDown,
  ArrowUp,
  Minus,
  Save,
} from "lucide-react";

import { cn, formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
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
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { useProfile } from "@/hooks/use-profile";
import { toast } from "sonner";
import {
  getProcessCostBenchmarkData,
  type ProcessBenchmark,
} from "@/lib/actions/analytics";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getVarianceColor(status: "below" | "at" | "above") {
  if (status === "below") return "text-green-700";
  if (status === "above") return "text-red-600";
  return "text-gray-600";
}

function getVarianceIcon(status: "below" | "at" | "above") {
  if (status === "below") return ArrowDown;
  if (status === "above") return ArrowUp;
  return Minus;
}

function getStatusBadgeClass(status: "below" | "at" | "above") {
  if (status === "below") return "bg-green-100 text-green-700 border-green-200";
  if (status === "above") return "bg-red-100 text-red-700 border-red-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

// ---------------------------------------------------------------------------
// Inline Benchmark Editor
// ---------------------------------------------------------------------------

function BenchmarkEditor({
  process,
  currentValue,
  orderCount,
  onSave,
}: {
  process: string;
  currentValue: number;
  orderCount: number;
  onSave: (newValue: number) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(currentValue.toString());
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function handleSave() {
    const num = parseFloat(editValue);
    if (isNaN(num) || num < 0) {
      toast.error("Please enter a valid positive number");
      return;
    }
    onSave(num);
    setEditing(false);
    toast.success(`${process} benchmark updated to ${formatCurrency(num, "INR")}`);
  }

  function handleCancel() {
    setEditValue(currentValue.toString());
    setEditing(false);
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
        <Target className="h-6 w-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">
          {process} Benchmark
        </p>
        {editing ? (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-bold text-blue-800">INR</span>
            <Input
              ref={inputRef}
              type="number"
              step="0.01"
              min="0"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              className="h-9 w-32 text-lg font-black tabular-nums bg-white"
            />
            <span className="text-sm text-blue-600">per piece</span>
            <Button size="sm" variant="ghost" onClick={handleSave} className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50">
              <Check className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel} className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-3xl font-black text-blue-900 tabular-nums">
              {formatCurrency(currentValue, "INR")}
              <span className="text-sm font-normal text-blue-600 ml-1.5">per piece</span>
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditValue(currentValue.toString());
                setEditing(true);
              }}
              className="h-7 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
            >
              <Edit className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
          </div>
        )}
        <p className="text-[11px] text-blue-500 mt-1">
          Based on average of {orderCount} order{orderCount !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Order comparison row
// ---------------------------------------------------------------------------

function OrderComparisonRow({
  order,
  benchmarkCost,
  maxCost,
}: {
  order: ProcessBenchmark["orders"][0];
  benchmarkCost: number;
  maxCost: number;
}) {
  const StatusIcon = getVarianceIcon(order.status);
  const barWidthPct = maxCost > 0 ? Math.min(100, (order.actualCost / maxCost) * 100) : 0;
  const benchmarkPct = maxCost > 0 ? Math.min(100, (benchmarkCost / maxCost) * 100) : 0;

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <span className="font-mono text-sm font-bold text-blue-700">{order.orderNumber}</span>
          <span className="text-sm text-gray-500 ml-2">{order.buyer}</span>
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0",
            getStatusBadgeClass(order.status)
          )}
        >
          {order.status === "below" ? "Below" : order.status === "above" ? "Above" : "At Benchmark"}
        </span>
      </div>

      {/* Visual bar */}
      <div className="relative h-7 bg-gray-100 rounded-md overflow-hidden mb-2">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-md transition-all duration-500",
            order.status === "below"
              ? "bg-green-400/80"
              : order.status === "above"
              ? "bg-red-400/80"
              : "bg-gray-400/80"
          )}
          style={{ width: `${barWidthPct}%` }}
        />
        {/* Benchmark reference line */}
        <div
          className="absolute inset-y-0 w-0.5 bg-gray-600 z-10"
          style={{ left: `${benchmarkPct}%` }}
        >
          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-gray-600 rounded-full" />
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-gray-600 rounded-full" />
        </div>
        <span className="absolute inset-0 flex items-center px-3 text-[11px] font-bold text-gray-900 mix-blend-darken">
          {formatCurrency(order.actualCost, "INR")}
        </span>
      </div>

      {/* Detail text */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          Actual: <span className="font-semibold text-gray-700">{formatCurrency(order.actualCost, "INR")}</span>
          {" | "}
          Benchmark: <span className="font-medium">{formatCurrency(benchmarkCost, "INR")}</span>
        </span>
        <span className={cn("font-semibold tabular-nums inline-flex items-center gap-0.5", getVarianceColor(order.status))}>
          <StatusIcon className="h-3 w-3" />
          {order.variance >= 0 ? "+" : ""}{formatCurrency(Math.abs(order.variance), "INR")}
          {" ("}
          {order.variancePct >= 0 ? "+" : ""}{order.variancePct.toFixed(1)}%{")"}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ProcessCostBenchmarkPage() {
  const { profile } = useProfile();
  const companyId = profile?.company_id;

  const [benchmarks, setBenchmarks] = React.useState<ProcessBenchmark[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [customBenchmarks, setCustomBenchmarks] = React.useState<Map<string, number>>(new Map());

  // Sheet state for custom benchmark
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [sheetProcess, setSheetProcess] = React.useState("");
  const [sheetValue, setSheetValue] = React.useState("");
  const [sheetDate, setSheetDate] = React.useState("");
  const [sheetReason, setSheetReason] = React.useState("");

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
        const result = await getProcessCostBenchmarkData(companyId!);
        if (!cancelled) {
          if (result.error) {
            setError(result.error);
          } else {
            setBenchmarks(result.data ?? []);
          }
        }
      } catch {
        if (!cancelled) setError("Failed to load cost benchmark data");
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
  // Computed values
  // ---------------------------------------------------------------------------

  function getEffectiveBenchmark(process: string, original: number) {
    return customBenchmarks.get(process) ?? original;
  }

  const totalProcesses = benchmarks.length;
  const totalOrders = React.useMemo(() => {
    const orderSet = new Set<string>();
    benchmarks.forEach((b) => b.orders.forEach((o) => orderSet.add(o.orderNumber)));
    return orderSet.size;
  }, [benchmarks]);

  const avgVariancePct = React.useMemo(() => {
    const all: number[] = [];
    benchmarks.forEach((b) => b.orders.forEach((o) => all.push(Math.abs(o.variancePct))));
    return all.length > 0 ? Math.round((all.reduce((s, v) => s + v, 0) / all.length) * 10) / 10 : 0;
  }, [benchmarks]);

  const processesAboveBenchmark = React.useMemo(() => {
    return benchmarks.filter((b) => b.orders.some((o) => o.status === "above")).length;
  }, [benchmarks]);

  // Chart data
  const summaryChartData = React.useMemo(() => {
    return benchmarks.map((b) => {
      const avgActual =
        b.orders.length > 0
          ? Math.round((b.orders.reduce((s, o) => s + o.actualCost, 0) / b.orders.length) * 100) / 100
          : 0;
      return {
        name: b.process,
        Benchmark: getEffectiveBenchmark(b.process, b.benchmarkCost),
        "Avg Actual": avgActual,
      };
    });
  }, [benchmarks, customBenchmarks]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function handleInlineBenchmarkSave(process: string, newValue: number) {
    setCustomBenchmarks((prev) => {
      const next = new Map(prev);
      next.set(process, newValue);
      return next;
    });
  }

  function handleSheetSave() {
    if (!sheetProcess) {
      toast.error("Please select a process");
      return;
    }
    const num = parseFloat(sheetValue);
    if (isNaN(num) || num <= 0) {
      toast.error("Please enter a valid benchmark value");
      return;
    }
    setCustomBenchmarks((prev) => {
      const next = new Map(prev);
      next.set(sheetProcess, num);
      return next;
    });
    toast.success(`Custom benchmark saved for ${sheetProcess}`, {
      description: `New benchmark: ${formatCurrency(num, "INR")} per piece`,
    });
    setSheetOpen(false);
    setSheetProcess("");
    setSheetValue("");
    setSheetDate("");
    setSheetReason("");
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
          title="Process-Wise Cost Per Piece Benchmark"
          description="Compare actual process costs against factory benchmarks"
          breadcrumb={[{ label: "Finance", href: "/finance" }, { label: "Cost Benchmark" }]}
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

  if (benchmarks.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Process-Wise Cost Per Piece Benchmark"
          description="Compare actual process costs against factory benchmarks"
          breadcrumb={[{ label: "Finance", href: "/finance" }, { label: "Cost Benchmark" }]}
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Scale className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-600">No benchmark data available</p>
            <p className="text-xs text-gray-400 mt-1">
              Create cost sheets for orders to generate process-wise benchmarks.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      <PageHeader
        title="Process-Wise Cost Per Piece Benchmark"
        description="Compare actual process costs against factory benchmarks"
        breadcrumb={[{ label: "Finance", href: "/finance" }, { label: "Cost Benchmark" }]}
        actions={
          <Button size="sm" onClick={() => setSheetOpen(true)}>
            <Target className="mr-1.5 h-3.5 w-3.5" />
            Set Custom Benchmark
          </Button>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          title="Processes Tracked"
          value={totalProcesses}
          icon={<Scale className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Orders Analyzed"
          value={totalOrders}
          icon={<Calculator className="h-5 w-5" />}
          color="purple"
        />
        <StatCard
          title="Avg Variance"
          value={`${avgVariancePct}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="orange"
        />
        <StatCard
          title="Above Benchmark"
          value={processesAboveBenchmark}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="red"
        />
      </div>

      {/* Summary Bar Chart */}
      <BarChartCard
        title="Factory Benchmark vs Average Actual"
        data={summaryChartData}
        dataKeys={["Benchmark", "Avg Actual"]}
        colors={["#d1d5db", "#3b82f6"]}
        xAxisKey="name"
        height={300}
        formatTooltipValue={(value) => formatCurrency(value, "INR")}
      />

      {/* Process Tabs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900">
            Process Detail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={benchmarks[0]?.process || "Material"}>
            <TabsList className="flex-wrap h-auto gap-1 mb-4">
              {benchmarks.map((b) => (
                <TabsTrigger key={b.process} value={b.process} className="text-xs">
                  {b.process}
                </TabsTrigger>
              ))}
            </TabsList>

            {benchmarks.map((benchmark) => {
              const effectiveBenchmark = getEffectiveBenchmark(benchmark.process, benchmark.benchmarkCost);
              const maxCost = Math.max(
                effectiveBenchmark * 2,
                ...benchmark.orders.map((o) => o.actualCost)
              );
              const avgActual =
                benchmark.orders.length > 0
                  ? Math.round(
                      (benchmark.orders.reduce((s, o) => s + o.actualCost, 0) / benchmark.orders.length) * 100
                    ) / 100
                  : 0;

              return (
                <TabsContent key={benchmark.process} value={benchmark.process}>
                  <div className="space-y-5">
                    {/* Benchmark header with inline edit */}
                    <BenchmarkEditor
                      process={benchmark.process}
                      currentValue={effectiveBenchmark}
                      orderCount={benchmark.orders.length}
                      onSave={(val) => handleInlineBenchmarkSave(benchmark.process, val)}
                    />

                    {/* Process average summary */}
                    <div className="flex items-center gap-4 rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
                      <Calculator className="h-5 w-5 text-gray-400 shrink-0" />
                      <div className="flex-1">
                        <span className="text-xs text-gray-500">Average actual cost across all orders: </span>
                        <span className="text-sm font-bold text-gray-800 tabular-nums">
                          {formatCurrency(avgActual, "INR")}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "text-xs font-bold tabular-nums",
                          avgActual > effectiveBenchmark ? "text-red-600" : "text-green-600"
                        )}
                      >
                        {avgActual > effectiveBenchmark ? "+" : ""}
                        {((avgActual - effectiveBenchmark) / (effectiveBenchmark || 1) * 100).toFixed(1)}%
                        vs benchmark
                      </span>
                    </div>

                    {/* Order comparisons */}
                    {benchmark.orders.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Order Comparison ({benchmark.orders.length} orders)
                        </p>
                        {benchmark.orders.map((order, idx) => (
                          <OrderComparisonRow
                            key={`${order.orderNumber}-${idx}`}
                            order={order}
                            benchmarkCost={effectiveBenchmark}
                            maxCost={maxCost}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-10 text-sm text-gray-400">
                        No order data for this process
                      </div>
                    )}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* SET CUSTOM BENCHMARK SHEET                                        */}
      {/* ================================================================ */}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Set Custom Benchmark</SheetTitle>
            <SheetDescription>
              Override the automatically calculated benchmark for a specific process.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 py-6">
            {/* Process dropdown */}
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">
                Process <span className="text-red-500">*</span>
              </Label>
              <Select value={sheetProcess} onValueChange={setSheetProcess}>
                <SelectTrigger>
                  <SelectValue placeholder="Select process" />
                </SelectTrigger>
                <SelectContent>
                  {benchmarks.map((b) => (
                    <SelectItem key={b.process} value={b.process}>
                      {b.process} (current: {formatCurrency(getEffectiveBenchmark(b.process, b.benchmarkCost), "INR")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* New benchmark value */}
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">
                New Benchmark Value (INR per piece) <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">INR</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={sheetValue}
                  onChange={(e) => setSheetValue(e.target.value)}
                  placeholder="0.00"
                  className="pl-12 tabular-nums"
                />
              </div>
            </div>

            {/* Effective from date */}
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">Effective From</Label>
              <Input
                type="date"
                value={sheetDate}
                onChange={(e) => setSheetDate(e.target.value)}
              />
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">Reason for Change</Label>
              <Textarea
                value={sheetReason}
                onChange={(e) => setSheetReason(e.target.value)}
                placeholder="Why is this benchmark being changed?"
                rows={4}
                className="text-sm"
              />
            </div>
          </div>

          <SheetFooter className="gap-2 sm:gap-0">
            <SheetClose asChild>
              <Button variant="outline" size="sm">
                <X className="mr-1.5 h-3.5 w-3.5" />
                Cancel
              </Button>
            </SheetClose>
            <Button size="sm" onClick={handleSheetSave}>
              <Save className="mr-1.5 h-3.5 w-3.5" />
              Save Benchmark
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
