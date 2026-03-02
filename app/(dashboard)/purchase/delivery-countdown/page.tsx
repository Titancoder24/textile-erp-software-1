"use client";

import * as React from "react";
import {
  Timer,
  Truck,
  Package,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Phone,
  Send,
  Clock,
  CheckCircle2,
  Calendar,
  FileText,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { cn, formatDate, formatNumber } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import {
  getSupplierCountdownData,
  type SupplierCountdown,
} from "@/lib/actions/analytics";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type RiskFilter = "all" | "on_track" | "at_risk" | "critical" | "overdue";

// ---------------------------------------------------------------------------
// Countdown Ring - circular SVG indicator
// ---------------------------------------------------------------------------
function CountdownRing({
  daysRemaining,
  riskLevel,
  size = 84,
}: {
  daysRemaining: number;
  riskLevel: SupplierCountdown["riskLevel"];
  size?: number;
}) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const maxDays = 30;
  const normalised = Math.max(0, Math.min(1, daysRemaining / maxDays));
  const offset = circumference * (1 - normalised);

  const ringColors: Record<string, string> = {
    on_track: "#16a34a",
    at_risk: "#f59e0b",
    critical: "#ea580c",
    overdue: "#dc2626",
  };
  const color = ringColors[riskLevel] || "#9ca3af";
  const isOverdue = daysRemaining < 0;

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={isOverdue ? 0 : offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "text-xl font-bold tabular-nums leading-none",
            isOverdue
              ? "text-red-600"
              : riskLevel === "critical"
                ? "text-orange-600"
                : riskLevel === "at_risk"
                  ? "text-amber-600"
                  : "text-gray-900"
          )}
        >
          {isOverdue ? Math.abs(daysRemaining) : daysRemaining}
        </span>
        <span
          className={cn(
            "text-[10px] font-semibold mt-0.5 uppercase tracking-wide",
            isOverdue ? "text-red-500" : "text-gray-400"
          )}
        >
          {isOverdue ? "LATE" : daysRemaining === 1 ? "DAY" : "DAYS"}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Risk Badge
// ---------------------------------------------------------------------------
function RiskBadge({ level }: { level: SupplierCountdown["riskLevel"] }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    on_track: {
      label: "On Track",
      cls: "bg-green-50 text-green-700 border-green-200",
    },
    at_risk: {
      label: "At Risk",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    critical: {
      label: "Critical",
      cls: "bg-orange-50 text-orange-700 border-orange-200",
    },
    overdue: {
      label: "Overdue",
      cls: "bg-red-50 text-red-700 border-red-200 animate-pulse",
    },
  };
  const c = cfg[level];
  return (
    <Badge
      variant="outline"
      className={cn("text-[11px] px-2 py-0.5 border font-semibold", c.cls)}
    >
      {c.label}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Skeleton card
// ---------------------------------------------------------------------------
function CardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-5">
        <div className="flex items-start gap-5">
          <div className="h-[84px] w-[84px] rounded-full bg-gray-100 shrink-0 hidden sm:block" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-48 bg-gray-100 rounded" />
            <div className="h-3 w-64 bg-gray-100 rounded" />
            <div className="h-2 w-full bg-gray-100 rounded-full" />
            <div className="h-3 w-36 bg-gray-100 rounded" />
          </div>
          <div className="h-6 w-20 bg-gray-100 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------
export default function SupplierDeliveryCountdownPage() {
  const { profile } = useProfile();
  const companyId = profile?.company_id;

  // Data
  const [items, setItems] = React.useState<SupplierCountdown[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filters
  const [activeFilter, setActiveFilter] = React.useState<RiskFilter>("all");
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  // Update Status Dialog
  const [updateOpen, setUpdateOpen] = React.useState(false);
  const [activePO, setActivePO] = React.useState<SupplierCountdown | null>(
    null
  );
  const [dispatchConfirmed, setDispatchConfirmed] = React.useState(false);
  const [revisedDate, setRevisedDate] = React.useState("");
  const [updateNotes, setUpdateNotes] = React.useState("");

  // Escalate Dialog
  const [escalateOpen, setEscalateOpen] = React.useState(false);
  const [escalateReason, setEscalateReason] = React.useState("");

  // Dispatch Sheet
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [dPO, setDPO] = React.useState("");
  const [dDate, setDDate] = React.useState("");
  const [dVehicle, setDVehicle] = React.useState("");
  const [dQty, setDQty] = React.useState("");
  const [dNotes, setDNotes] = React.useState("");

  // ---- Fetch data --------------------------------------------------------
  React.useEffect(() => {
    if (!companyId) return;
    let cancelled = false;
    setLoading(true);
    getSupplierCountdownData(companyId).then((res) => {
      if (cancelled) return;
      if (res.error) setError(res.error);
      else setItems(res.data ?? []);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  // ---- Derived data ------------------------------------------------------
  const counts = React.useMemo(() => {
    const c = { total: 0, on_track: 0, at_risk: 0, critical: 0, overdue: 0 };
    items.forEach((i) => {
      c.total++;
      c[i.riskLevel]++;
    });
    return c;
  }, [items]);

  const displayed = React.useMemo(() => {
    const filtered =
      activeFilter === "all"
        ? items
        : items.filter((i) => i.riskLevel === activeFilter);
    const order: Record<string, number> = {
      overdue: 0,
      critical: 1,
      at_risk: 2,
      on_track: 3,
    };
    return [...filtered].sort(
      (a, b) => (order[a.riskLevel] ?? 9) - (order[b.riskLevel] ?? 9)
    );
  }, [items, activeFilter]);

  // ---- Toggle expand -----------------------------------------------------
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // ---- Handlers ----------------------------------------------------------
  const handleSaveUpdate = () => {
    if (!activePO) return;
    toast.success(`Status updated for ${activePO.poNumber}`, {
      description: dispatchConfirmed
        ? "Dispatch confirmed. Tracking updated."
        : `Expected date revised to ${revisedDate || "unchanged"}.`,
    });
    setUpdateOpen(false);
    setDispatchConfirmed(false);
    setRevisedDate("");
    setUpdateNotes("");
    setActivePO(null);
  };

  const handleEscalate = () => {
    if (!activePO) return;
    toast.warning(`Escalation created for ${activePO.poNumber}`, {
      description: `Reason: ${escalateReason || "Urgent follow-up required"}`,
    });
    setEscalateOpen(false);
    setEscalateReason("");
    setActivePO(null);
  };

  const handleLogDispatch = () => {
    if (!dPO) {
      toast.error("Select a purchase order first");
      return;
    }
    toast.success("Dispatch update logged", {
      description: `${dPO} -- ${dQty || "N/A"} qty dispatched. Vehicle: ${dVehicle || "N/A"}`,
    });
    setSheetOpen(false);
    setDPO("");
    setDDate("");
    setDVehicle("");
    setDQty("");
    setDNotes("");
  };

  // ---- Filter button config ----------------------------------------------
  const filters: { key: RiskFilter; label: string; active: string }[] = [
    {
      key: "all",
      label: "All",
      active: "bg-gray-800 text-white",
    },
    {
      key: "on_track",
      label: "On Track",
      active: "bg-green-600 text-white",
    },
    {
      key: "at_risk",
      label: "At Risk",
      active: "bg-amber-500 text-white",
    },
    {
      key: "critical",
      label: "Critical",
      active: "bg-orange-600 text-white",
    },
    {
      key: "overdue",
      label: "Overdue",
      active: "bg-red-600 text-white",
    },
  ];

  // ======================================================================
  // RENDER
  // ======================================================================
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Supplier Delivery Countdown & Risk Alert"
        description="Live tracking of all open purchase orders with downstream impact analysis"
        breadcrumb={[
          { label: "Purchase", href: "/purchase" },
          { label: "Delivery Countdown" },
        ]}
      />

      {/* ---- Stat Cards -------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Open POs"
          value={formatNumber(counts.total)}
          icon={<Package className="h-4 w-4" />}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="On Track"
          value={formatNumber(counts.on_track)}
          icon={<CheckCircle2 className="h-4 w-4" />}
          color="green"
          loading={loading}
        />
        <StatCard
          title="At Risk"
          value={formatNumber(counts.at_risk + counts.critical)}
          icon={<AlertTriangle className="h-4 w-4" />}
          color="orange"
          loading={loading}
        />
        <StatCard
          title="Overdue"
          value={formatNumber(counts.overdue)}
          icon={<Timer className="h-4 w-4" />}
          color="red"
          loading={loading}
        />
      </div>

      {/* ---- Filter Toggles ---------------------------------------------- */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all border",
                isActive
                  ? cn(f.active, "border-transparent shadow-sm")
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              {f.label}
              {f.key !== "all" && (
                <span
                  className={cn(
                    "tabular-nums",
                    isActive ? "opacity-80" : "text-gray-400"
                  )}
                >
                  {counts[f.key as keyof typeof counts]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ---- Error state ------------------------------------------------- */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Failed to load data: {error}
          </CardContent>
        </Card>
      )}

      {/* ---- Loading ----------------------------------------------------- */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* ---- Empty state ------------------------------------------------- */}
      {!loading && !error && displayed.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-gray-300 mb-3" />
            <p className="font-medium text-gray-500">
              No open purchase orders found
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {activeFilter !== "all"
                ? "Try changing the filter"
                : "All supplier deliveries are complete"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ---- PO Cards ---------------------------------------------------- */}
      {!loading && displayed.length > 0 && (
        <div className="space-y-3">
          {displayed.map((item) => {
            const isExpanded = expanded.has(item.id);
            const pct =
              item.orderedQty > 0
                ? Math.round((item.receivedQty / item.orderedQty) * 100)
                : 0;

            return (
              <Card
                key={item.id}
                className={cn(
                  "transition-shadow hover:shadow-md",
                  item.riskLevel === "overdue" &&
                    "border-red-300 bg-red-50/30",
                  item.riskLevel === "critical" &&
                    "border-orange-300 bg-orange-50/20",
                  item.riskLevel === "at_risk" && "border-amber-200"
                )}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-5">
                    {/* Ring (hidden on mobile) */}
                    <div className="hidden sm:block">
                      <CountdownRing
                        daysRemaining={item.daysRemaining}
                        riskLevel={item.riskLevel}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-900 text-sm">
                              {item.poNumber}
                            </h3>
                            <span className="text-gray-300">|</span>
                            <span className="text-sm text-gray-600 truncate">
                              {item.supplierName}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                            <Package className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                            {item.materialName}
                          </p>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          {/* mobile-only text countdown */}
                          <span
                            className={cn(
                              "sm:hidden text-xs font-bold",
                              item.daysRemaining < 0
                                ? "text-red-600"
                                : "text-gray-700"
                            )}
                          >
                            {item.daysRemaining < 0
                              ? `${Math.abs(item.daysRemaining)}d overdue`
                              : `${item.daysRemaining}d`}
                          </span>
                          <RiskBadge level={item.riskLevel} />
                        </div>
                      </div>

                      {/* Quantity progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-gray-500 tabular-nums">
                          <span>
                            Ordered:{" "}
                            <strong className="text-gray-700">
                              {formatNumber(item.orderedQty)}
                            </strong>{" "}
                            {item.uom}
                          </span>
                          <span>
                            Received:{" "}
                            <strong className="text-gray-700">
                              {formatNumber(item.receivedQty)}
                            </strong>
                          </span>
                          <span>
                            Pending:{" "}
                            <strong className="text-orange-600">
                              {formatNumber(item.pendingQty)}
                            </strong>
                          </span>
                        </div>
                        <div className="relative">
                          <Progress value={pct} className="h-2" />
                        </div>
                      </div>

                      {/* Expected date */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        Expected:{" "}
                        <span className="font-medium text-gray-700">
                          {formatDate(item.expectedDate)}
                        </span>
                      </div>

                      {/* Toggle */}
                      <button
                        onClick={() => toggle(item.id)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3.5 w-3.5" /> Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3.5 w-3.5" /> View Impact
                            & Actions
                          </>
                        )}
                      </button>

                      {/* Expanded section */}
                      {isExpanded && (
                        <div className="space-y-3 pt-1">
                          <Separator />

                          {/* Downstream Impact */}
                          {item.riskLevel !== "on_track" && (
                            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                              <p className="text-xs font-semibold text-amber-800 mb-1 flex items-center gap-1.5">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Downstream Impact
                              </p>
                              <p className="text-xs text-amber-700 leading-relaxed">
                                {item.downstreamImpact
                                  .split(". ")
                                  .filter(Boolean)
                                  .map((segment, idx) => (
                                    <React.Fragment key={idx}>
                                      {idx > 0 && (
                                        <ArrowRight className="h-3 w-3 inline mx-1 text-amber-500" />
                                      )}
                                      <span>{segment.replace(/\.$/, "")}</span>
                                    </React.Fragment>
                                  ))}
                              </p>
                            </div>
                          )}

                          {/* Suggested Action */}
                          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                            <p className="text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5" />
                              Suggested Action
                            </p>
                            <p className="text-xs text-blue-700">
                              {item.suggestedAction}
                            </p>
                          </div>

                          {/* Affected Orders */}
                          {item.affectedOrders.filter(Boolean).length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1.5">
                                Affected Orders
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {item.affectedOrders
                                  .filter(Boolean)
                                  .map((o) => (
                                    <Badge
                                      key={o}
                                      variant="outline"
                                      className="text-xs cursor-pointer hover:bg-blue-50 hover:border-blue-300"
                                    >
                                      {o}
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="flex flex-wrap gap-2 pt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8"
                              onClick={() => {
                                setActivePO(item);
                                setUpdateOpen(true);
                              }}
                            >
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              Update Status
                            </Button>
                            {(item.riskLevel === "critical" ||
                              item.riskLevel === "overdue") && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-8 border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  setActivePO(item);
                                  setEscalateOpen(true);
                                }}
                              >
                                <Phone className="h-3.5 w-3.5 mr-1" />
                                Escalate
                              </Button>
                            )}
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

      {/* ================================================================ */}
      {/* UPDATE STATUS DIALOG                                             */}
      {/* ================================================================ */}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Delivery Status</DialogTitle>
            <DialogDescription>
              {activePO
                ? `${activePO.poNumber} -- ${activePO.supplierName} -- ${activePO.materialName}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="dispatch-confirmed"
                checked={dispatchConfirmed}
                onChange={(e) => setDispatchConfirmed(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="dispatch-confirmed" className="text-sm">
                Dispatch confirmed by supplier
              </Label>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="revised-date" className="text-sm">
                Revised Expected Date
              </Label>
              <Input
                id="revised-date"
                type="date"
                value={revisedDate}
                onChange={(e) => setRevisedDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="update-notes" className="text-sm">
                Notes
              </Label>
              <Textarea
                id="update-notes"
                placeholder="Additional information about this delivery..."
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUpdate}>
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Save Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================ */}
      {/* ESCALATION DIALOG                                                */}
      {/* ================================================================ */}
      <Dialog open={escalateOpen} onOpenChange={setEscalateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Escalate Delivery Issue
            </DialogTitle>
            <DialogDescription>
              {activePO
                ? `${activePO.poNumber} is ${
                    activePO.riskLevel === "overdue"
                      ? `${Math.abs(activePO.daysRemaining)} days overdue`
                      : "at critical risk"
                  }`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm">Escalation Reason</Label>
              <Textarea
                placeholder="Describe why this needs escalation..."
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs text-gray-600 space-y-1">
              <p className="font-medium">Auto-generated actions:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Email notification sent to Purchase Manager</li>
                <li>Supplier flagged for follow-up</li>
                <li>Note added to PO audit trail</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEscalateOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleEscalate}
            >
              <Send className="h-4 w-4 mr-1.5" />
              Escalate Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================ */}
      {/* LOG DISPATCH SHEET                                               */}
      {/* ================================================================ */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Log Dispatch Update</SheetTitle>
            <SheetDescription>
              Record a new dispatch from a supplier
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="space-y-1.5">
              <Label className="text-sm">Purchase Order</Label>
              <Select value={dPO} onValueChange={setDPO}>
                <SelectTrigger>
                  <SelectValue placeholder="Select PO" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((i) => (
                    <SelectItem key={i.id} value={i.poNumber}>
                      {i.poNumber} - {i.supplierName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Dispatch Date</Label>
              <Input
                type="date"
                value={dDate}
                onChange={(e) => setDDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Vehicle / Tracking Number</Label>
              <Input
                placeholder="e.g. TN-38-AB-1234 or AWB12345"
                value={dVehicle}
                onChange={(e) => setDVehicle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Quantity Dispatched</Label>
              <Input
                type="number"
                placeholder="Enter quantity"
                value={dQty}
                onChange={(e) => setDQty(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Notes</Label>
              <Textarea
                placeholder="Additional dispatch details..."
                value={dNotes}
                onChange={(e) => setDNotes(e.target.value)}
                rows={3}
              />
            </div>
            <Button onClick={handleLogDispatch} className="w-full mt-2">
              <Truck className="h-4 w-4 mr-1.5" />
              Log Dispatch
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ---- Floating Action Button -------------------------------------- */}
      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-lg hover:bg-blue-700 transition-all hover:shadow-xl active:scale-95"
        aria-label="Log Dispatch Update"
      >
        <Truck className="h-4 w-4" />
        Log Dispatch Update
      </button>
    </div>
  );
}
