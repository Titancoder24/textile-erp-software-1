"use client";

import * as React from "react";
import {
  Zap,
  AlertOctagon,
  Bell,
  Activity,
  Wrench,
  ShieldAlert,
  TrendingDown,
  Scissors,
  CheckCircle,
  MessageSquarePlus,
  Send,
  RefreshCw,
  Package,
  Clock,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import {
  getExceptionFeedData,
  type ProductionException,
} from "@/lib/actions/analytics";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------
type ExceptionType =
  | "machine_breakdown"
  | "quality_fail"
  | "output_drop"
  | "cutting_waste"
  | "material_shortage"
  | "attendance"
  | "delay";

type FilterToggle = "all" | ExceptionType;

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  machine_breakdown: {
    label: "Machine Breakdown",
    icon: Wrench,
    color: "text-red-600 bg-red-100",
  },
  quality_fail: {
    label: "Quality Fail",
    icon: ShieldAlert,
    color: "text-purple-600 bg-purple-100",
  },
  output_drop: {
    label: "Output Drop",
    icon: TrendingDown,
    color: "text-orange-600 bg-orange-100",
  },
  cutting_waste: {
    label: "Cutting Waste",
    icon: Scissors,
    color: "text-amber-600 bg-amber-100",
  },
  material_shortage: {
    label: "Material Shortage",
    icon: Package,
    color: "text-blue-600 bg-blue-100",
  },
  attendance: {
    label: "Attendance",
    icon: Users,
    color: "text-gray-600 bg-gray-100",
  },
  delay: {
    label: "Delay",
    icon: Clock,
    color: "text-yellow-600 bg-yellow-100",
  },
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-600",
  high: "bg-orange-500",
  medium: "bg-amber-400",
  low: "bg-blue-400",
};

const SEVERITY_TEXT: Record<string, string> = {
  critical: "text-red-700 bg-red-100 border-red-200",
  high: "text-orange-700 bg-orange-100 border-orange-200",
  medium: "text-amber-700 bg-amber-100 border-amber-200",
  low: "text-blue-700 bg-blue-100 border-blue-200",
};

const FILTER_OPTIONS: { key: FilterToggle; label: string }[] = [
  { key: "all", label: "All" },
  { key: "machine_breakdown", label: "Breakdown" },
  { key: "quality_fail", label: "Quality" },
  { key: "output_drop", label: "Output" },
  { key: "cutting_waste", label: "Cutting" },
  { key: "material_shortage", label: "Material" },
];

// ---------------------------------------------------------------------------
// Time formatting
// ---------------------------------------------------------------------------
function timeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return then.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// ---------------------------------------------------------------------------
// Feed skeleton
// ---------------------------------------------------------------------------
function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 rounded-xl border border-gray-100 p-4 animate-pulse"
        >
          <div className="h-10 w-10 rounded-full bg-gray-100 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-gray-100 rounded" />
            <div className="h-3 w-full bg-gray-100 rounded" />
            <div className="h-3 w-1/2 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------
export default function ProductionExceptionFeedPage() {
  const { profile } = useProfile();
  const companyId = profile?.company_id;

  // Data
  const [exceptions, setExceptions] = React.useState<ProductionException[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filter & auto-refresh
  const [typeFilter, setTypeFilter] = React.useState<FilterToggle>("all");
  const [autoRefresh, setAutoRefresh] = React.useState(false);

  // Acknowledged set
  const [acknowledged, setAcknowledged] = React.useState<Set<string>>(
    new Set()
  );

  // Resolution inline state
  const [resolvingId, setResolvingId] = React.useState<string | null>(null);
  const [resolutionText, setResolutionText] = React.useState("");
  const [resolutionStatus, setResolutionStatus] =
    React.useState("investigating");

  // Report Issue Sheet
  const [reportOpen, setReportOpen] = React.useState(false);
  const [rType, setRType] = React.useState("");
  const [rSeverity, setRSeverity] = React.useState("high");
  const [rTitle, setRTitle] = React.useState("");
  const [rDesc, setRDesc] = React.useState("");
  const [rAffected, setRAffected] = React.useState("");

  // ---- Fetch data -------------------------------------------------------
  const fetchData = React.useCallback(async () => {
    if (!companyId) return;
    try {
      const res = await getExceptionFeedData(companyId);
      if (res.error) setError(res.error);
      else setExceptions(res.data ?? []);
    } catch {
      setError("Failed to fetch exceptions");
    }
  }, [companyId]);

  React.useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, [companyId, fetchData]);

  // Auto-refresh
  React.useEffect(() => {
    if (!autoRefresh || !companyId) return;
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, companyId, fetchData]);

  // ---- Derived data -----------------------------------------------------
  const counts = React.useMemo(() => {
    const c = { critical: 0, high: 0, medium: 0, low: 0 };
    exceptions.forEach((e) => {
      if (e.severity in c) c[e.severity as keyof typeof c]++;
    });
    return c;
  }, [exceptions]);

  const filtered = React.useMemo(() => {
    if (typeFilter === "all") return exceptions;
    return exceptions.filter((e) => e.type === typeFilter);
  }, [exceptions, typeFilter]);

  const todayCount = exceptions.length;
  const weekCount = exceptions.length; // same endpoint scope

  // ---- Handlers ---------------------------------------------------------
  const handleAcknowledge = (id: string) => {
    setAcknowledged((prev) => new Set(prev).add(id));
    toast.success("Exception acknowledged");
  };

  const handleSaveResolution = (id: string) => {
    if (!resolutionText.trim()) {
      toast.error("Enter resolution details");
      return;
    }
    toast.success("Resolution logged", {
      description: `Status: ${resolutionStatus}`,
    });
    setResolvingId(null);
    setResolutionText("");
    setResolutionStatus("investigating");
    setAcknowledged((prev) => new Set(prev).add(id));
  };

  const handleReportIssue = () => {
    if (!rType || !rTitle) {
      toast.error("Fill in Type and Title at minimum");
      return;
    }
    toast.success("Exception reported", {
      description: `${rTitle} -- Severity: ${rSeverity}`,
    });
    setReportOpen(false);
    setRType("");
    setRSeverity("high");
    setRTitle("");
    setRDesc("");
    setRAffected("");
  };

  const handleManualRefresh = () => {
    fetchData();
    toast.info("Feed refreshed");
  };

  // ======================================================================
  // RENDER
  // ======================================================================
  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Floor Exception Feed"
        description="Only problems -- no dashboards to sift through"
        breadcrumb={[
          { label: "Production", href: "/production" },
          { label: "Exceptions" },
        ]}
      />

      {/* ---- Top Bar ----------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Count badges */}
        <div className="flex flex-wrap items-center gap-2">
          {counts.critical > 0 && (
            <Badge
              variant="outline"
              className="border-red-200 bg-red-50 text-red-700 text-xs font-semibold px-2.5"
            >
              {counts.critical} Critical
            </Badge>
          )}
          {counts.high > 0 && (
            <Badge
              variant="outline"
              className="border-orange-200 bg-orange-50 text-orange-700 text-xs font-semibold px-2.5"
            >
              {counts.high} High
            </Badge>
          )}
          {counts.medium > 0 && (
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5"
            >
              {counts.medium} Medium
            </Badge>
          )}
          {counts.low > 0 && (
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5"
            >
              {counts.low} Low
            </Badge>
          )}
          {exceptions.length === 0 && !loading && (
            <Badge
              variant="outline"
              className="border-green-200 bg-green-50 text-green-700 text-xs"
            >
              All clear
            </Badge>
          )}
        </div>

        {/* Auto-refresh + manual refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              id="auto-refresh"
            />
            <Label htmlFor="auto-refresh" className="text-xs text-gray-500">
              Auto-refresh 30s
            </Label>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={handleManualRefresh}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* ---- Filter Toggles ---------------------------------------------- */}
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f.key}
            onClick={() => setTypeFilter(f.key)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium border transition-all",
              typeFilter === f.key
                ? "bg-gray-800 text-white border-gray-800"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ---- Error ------------------------------------------------------- */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700 flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 shrink-0" />
            {error}
          </CardContent>
        </Card>
      )}

      {/* ---- Loading ----------------------------------------------------- */}
      {loading && <FeedSkeleton />}

      {/* ---- Empty state ------------------------------------------------- */}
      {!loading && filtered.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Activity className="h-12 w-12 text-green-300 mb-3" />
            <p className="font-medium text-gray-500">
              No exceptions right now
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {typeFilter !== "all"
                ? "No exceptions of this type. Try another filter."
                : "Production floor is running smoothly"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ---- Exception Feed ---------------------------------------------- */}
      {!loading && filtered.length > 0 && (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[27px] top-0 bottom-0 w-px bg-gray-200 hidden sm:block" />

          <div className="space-y-3">
            {filtered.map((ex) => {
              const isAck = acknowledged.has(ex.id);
              const isResolving = resolvingId === ex.id;
              const config = TYPE_CONFIG[ex.type] || TYPE_CONFIG.delay;
              const TypeIcon = config.icon;

              return (
                <div key={ex.id} className="relative flex gap-4 sm:gap-5">
                  {/* Icon circle */}
                  <div className="relative z-10 shrink-0 hidden sm:block">
                    <div
                      className={cn(
                        "flex h-[54px] w-[54px] items-center justify-center rounded-full border-2 border-white shadow-sm",
                        isAck ? "bg-gray-100" : config.color
                      )}
                    >
                      <TypeIcon
                        className={cn(
                          "h-5 w-5",
                          isAck ? "text-gray-400" : ""
                        )}
                      />
                    </div>
                  </div>

                  {/* Card */}
                  <Card
                    className={cn(
                      "flex-1 overflow-hidden transition-all",
                      isAck && "opacity-60"
                    )}
                  >
                    {/* Severity bar (left edge) */}
                    <div
                      className={cn(
                        "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl",
                        isAck
                          ? "bg-gray-300"
                          : SEVERITY_COLORS[ex.severity] || "bg-gray-300"
                      )}
                    />

                    <CardContent className="p-4 pl-5">
                      {/* Top row: mobile icon + title + time */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          {/* Mobile icon */}
                          <div
                            className={cn(
                              "sm:hidden flex h-9 w-9 items-center justify-center rounded-full shrink-0",
                              isAck ? "bg-gray-100" : config.color
                            )}
                          >
                            <TypeIcon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <h4
                              className={cn(
                                "font-semibold text-sm",
                                isAck
                                  ? "text-gray-500 line-through"
                                  : "text-gray-900"
                              )}
                            >
                              {ex.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                              {ex.description}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-[11px] text-gray-400 whitespace-nowrap">
                            {formatTime(ex.timestamp)}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {timeAgo(ex.timestamp)}
                          </p>
                        </div>
                      </div>

                      {/* Metric threshold/actual */}
                      {ex.metric && ex.threshold && ex.actual && (
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-1.5 text-xs rounded-md px-2 py-1 bg-red-50 border border-red-100">
                            <span className="text-gray-500">
                              {ex.metric}:
                            </span>
                            <span className="text-gray-500">
                              Threshold {ex.threshold}
                            </span>
                            <span className="text-red-600 font-semibold">
                              Actual {ex.actual}
                            </span>
                          </span>
                        </div>
                      )}

                      {/* Entity badge + severity badge */}
                      <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-gray-50"
                        >
                          {ex.affectedEntity}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] capitalize border font-medium",
                            SEVERITY_TEXT[ex.severity] ||
                              "bg-gray-100 text-gray-600"
                          )}
                        >
                          {ex.severity}
                        </Badge>
                        {isAck && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-green-50 text-green-700 border-green-200"
                          >
                            <CheckCircle className="h-3 w-3 mr-0.5" />
                            Acknowledged
                          </Badge>
                        )}
                      </div>

                      {/* Inline resolution form */}
                      {isResolving && (
                        <div className="mt-3 space-y-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
                          <Textarea
                            placeholder="Describe the resolution..."
                            value={resolutionText}
                            onChange={(e) => setResolutionText(e.target.value)}
                            rows={2}
                            className="text-sm"
                          />
                          <div className="flex items-center gap-2">
                            <Select
                              value={resolutionStatus}
                              onValueChange={setResolutionStatus}
                            >
                              <SelectTrigger className="h-8 text-xs w-[160px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="investigating">
                                  Investigating
                                </SelectItem>
                                <SelectItem value="resolved">
                                  Resolved
                                </SelectItem>
                                <SelectItem value="escalated">
                                  Escalated
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => handleSaveResolution(ex.id)}
                            >
                              <Send className="h-3.5 w-3.5 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs"
                              onClick={() => {
                                setResolvingId(null);
                                setResolutionText("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      {!isAck && !isResolving && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] px-2.5"
                            onClick={() => handleAcknowledge(ex.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Acknowledge
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] px-2.5"
                            onClick={() => setResolvingId(ex.id)}
                          >
                            <MessageSquarePlus className="h-3 w-3 mr-1" />
                            Add Resolution
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---- Bottom Summary ---------------------------------------------- */}
      {!loading && (
        <div className="text-center text-xs text-gray-400 py-2">
          Today: {todayCount} exception{todayCount !== 1 ? "s" : ""} | This
          week: {weekCount}
        </div>
      )}

      {/* ================================================================ */}
      {/* REPORT ISSUE SHEET                                               */}
      {/* ================================================================ */}
      <Sheet open={reportOpen} onOpenChange={setReportOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Report Issue
            </SheetTitle>
            <SheetDescription>
              Log a new production floor exception
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="space-y-1.5">
              <Label className="text-sm">Type *</Label>
              <Select value={rType} onValueChange={setRType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exception type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Severity *</Label>
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    { key: "critical", label: "Critical", cls: "bg-red-600" },
                    { key: "high", label: "High", cls: "bg-orange-500" },
                    { key: "medium", label: "Medium", cls: "bg-amber-400" },
                    { key: "low", label: "Low", cls: "bg-blue-400" },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setRSeverity(s.key)}
                    className={cn(
                      "rounded-md border px-2 py-2 text-xs font-medium transition-all text-center",
                      rSeverity === s.key
                        ? cn(s.cls, "text-white border-transparent")
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Title *</Label>
              <Input
                placeholder="e.g. Line 3 sewing machine jammed"
                value={rTitle}
                onChange={(e) => setRTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Description</Label>
              <Textarea
                placeholder="Detailed description of the issue..."
                value={rDesc}
                onChange={(e) => setRDesc(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Affected Line / Department</Label>
              <Select value={rAffected} onValueChange={setRAffected}>
                <SelectTrigger>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Line 1",
                    "Line 2",
                    "Line 3",
                    "Line 4",
                    "Line 5",
                    "Line 6",
                    "Line 7",
                    "Line 8",
                    "Cutting",
                    "Finishing",
                    "Packing",
                    "Dyeing",
                    "Quality",
                    "Maintenance",
                    "Store",
                  ].map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleReportIssue} className="w-full mt-2">
              <Bell className="h-4 w-4 mr-1.5" />
              Report Exception
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ---- Floating Action Button -------------------------------------- */}
      <button
        onClick={() => setReportOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-medium text-white shadow-lg hover:bg-red-700 transition-all hover:shadow-xl active:scale-95"
        aria-label="Report Issue"
      >
        <Zap className="h-4 w-4" />
        Report Issue
      </button>
    </div>
  );
}
