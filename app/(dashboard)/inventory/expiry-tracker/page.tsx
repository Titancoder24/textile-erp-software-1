"use client";

import * as React from "react";
import {
  CalendarClock,
  FlaskConical,
  AlertTriangle,
  PackageX,
  Trash2,
  ArrowRightLeft,
  RefreshCw,
  Clock,
  Plus,
  Search,
  CheckCircle2,
  Archive,
  Warehouse,
  DollarSign,
  Ban,
  ShieldAlert,
  ChevronDown,
  X,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DonutChartCard } from "@/components/charts/donut-chart-card";
import { cn, formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import {
  getMaterialExpiryData,
  type MaterialExpiry,
} from "@/lib/actions/analytics";
import { toast } from "sonner";

/* ---------- types ---------- */

type StatusFilter = "all" | "expired" | "critical" | "warning" | "safe";
type TypeFilter = "all" | "chemical" | "trim" | "accessory";
type ActionType = "mark_used" | "mark_disposed" | "update_expiry" | "transfer";

const STATUS_CONFIG: Record<
  MaterialExpiry["status"],
  { label: string; bandClass: string; borderClass: string; countdownClass: string; bandTitle: string }
> = {
  expired: {
    label: "Expired",
    bandClass: "bg-red-600 text-white",
    borderClass: "border-l-4 border-l-red-500",
    countdownClass: "text-red-600 bg-red-50",
    bandTitle: "EXPIRED - Remove Immediately",
  },
  critical: {
    label: "Critical",
    bandClass: "bg-orange-500 text-white",
    borderClass: "border-l-4 border-l-orange-500",
    countdownClass: "text-orange-600 bg-orange-50",
    bandTitle: "CRITICAL - Use Within 15 Days",
  },
  warning: {
    label: "Warning",
    bandClass: "bg-amber-500 text-white",
    borderClass: "border-l-4 border-l-amber-400",
    countdownClass: "text-amber-600 bg-amber-50",
    bandTitle: "WARNING - Use Within 45 Days",
  },
  safe: {
    label: "Safe",
    bandClass: "bg-emerald-600 text-white",
    borderClass: "border-l-4 border-l-emerald-400",
    countdownClass: "text-emerald-600 bg-emerald-50",
    bandTitle: "SAFE - No Immediate Action",
  },
};

const STATUS_FILTER_CONFIG: Record<StatusFilter, { label: string; className: string }> = {
  all: { label: "All", className: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
  expired: { label: "Expired", className: "bg-red-100 text-red-700 hover:bg-red-200" },
  critical: { label: "Critical (<15d)", className: "bg-orange-100 text-orange-700 hover:bg-orange-200" },
  warning: { label: "Warning (<45d)", className: "bg-amber-100 text-amber-700 hover:bg-amber-200" },
  safe: { label: "Safe", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" },
};

/* ---------- Skeleton ---------- */

function ItemSkeleton() {
  return (
    <Card className="animate-pulse border-l-4 border-l-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-20 rounded bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 bg-gray-200 rounded" />
            <div className="h-3 w-64 bg-gray-200 rounded" />
            <div className="h-3 w-32 bg-gray-200 rounded" />
          </div>
          <div className="flex gap-2 shrink-0">
            <div className="h-8 w-20 bg-gray-200 rounded" />
            <div className="h-8 w-20 bg-gray-200 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------- page ---------- */

export default function ExpiryTrackerPage() {
  const { profile } = useProfile();
  const companyId = profile?.company_id;

  const [data, setData] = React.useState<MaterialExpiry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("all");

  // Action dialogs
  const [actionType, setActionType] = React.useState<ActionType | null>(null);
  const [actionItem, setActionItem] = React.useState<MaterialExpiry | null>(null);
  const [actionQty, setActionQty] = React.useState("");
  const [actionNote, setActionNote] = React.useState("");
  const [actionDate, setActionDate] = React.useState("");
  const [actionReason, setActionReason] = React.useState("");
  const [actionWarehouse, setActionWarehouse] = React.useState("");

  // Dispose confirmation
  const [disposeConfirmOpen, setDisposeConfirmOpen] = React.useState(false);
  const [disposeItem, setDisposeItem] = React.useState<MaterialExpiry | null>(null);

  // Add expiry sheet
  const [addExpiryOpen, setAddExpiryOpen] = React.useState(false);
  const [newExpiryItem, setNewExpiryItem] = React.useState("");
  const [newExpiryDate, setNewExpiryDate] = React.useState("");
  const [newExpiryBatch, setNewExpiryBatch] = React.useState("");
  const [newExpiryNotes, setNewExpiryNotes] = React.useState("");

  /* fetch */
  React.useEffect(() => {
    if (!companyId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const result = await getMaterialExpiryData(companyId!);
      if (cancelled) return;
      if (result.error) {
        setError(result.error);
        toast.error("Failed to load expiry data");
      } else {
        setData(result.data ?? []);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  /* derived */
  const filtered = React.useMemo(() => {
    let list = [...data];
    if (statusFilter !== "all") {
      list = list.filter((item) => item.status === statusFilter);
    }
    if (typeFilter !== "all") {
      list = list.filter((item) => item.itemType === typeFilter);
    }
    return list;
  }, [data, statusFilter, typeFilter]);

  const expiredItems = data.filter((d) => d.status === "expired");
  const criticalItems = data.filter((d) => d.status === "critical");
  const warningItems = data.filter((d) => d.status === "warning");
  const safeItems = data.filter((d) => d.status === "safe");

  const totalTracked = data.length;
  const expiredCount = expiredItems.length;
  const criticalCount = criticalItems.length;
  const valueAtRisk = [...expiredItems, ...criticalItems].reduce(
    (s, d) => s + d.value,
    0
  );

  // Group by status for banded display
  const groupedItems = React.useMemo(() => {
    const groups: Record<MaterialExpiry["status"], MaterialExpiry[]> = {
      expired: [],
      critical: [],
      warning: [],
      safe: [],
    };
    filtered.forEach((item) => {
      groups[item.status].push(item);
    });
    return groups;
  }, [filtered]);

  // Donut chart
  const donutData = React.useMemo(() => {
    const expired = data.filter((d) => d.status === "expired").length;
    const critical = data.filter((d) => d.status === "critical").length;
    const warning = data.filter((d) => d.status === "warning").length;
    const safe = data.filter((d) => d.status === "safe").length;
    return [
      { label: "Expired", value: expired, color: "#dc2626" },
      { label: "Critical", value: critical, color: "#ea580c" },
      { label: "Warning", value: warning, color: "#d97706" },
      { label: "Safe", value: safe, color: "#16a34a" },
    ];
  }, [data]);

  /* action handlers */
  function openAction(type: ActionType, item: MaterialExpiry) {
    setActionType(type);
    setActionItem(item);
    setActionQty("");
    setActionNote("");
    setActionDate("");
    setActionReason("");
    setActionWarehouse("");
  }

  function closeAction() {
    setActionType(null);
    setActionItem(null);
  }

  function handleMarkUsed() {
    if (!actionItem || !actionQty) return;
    const qty = parseFloat(actionQty);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    if (qty > actionItem.quantity) {
      toast.error("Quantity exceeds available stock");
      return;
    }
    setData((prev) =>
      prev.map((item) =>
        item.id === actionItem.id
          ? { ...item, quantity: Math.round((item.quantity - qty) * 100) / 100 }
          : item
      ).filter((item) => item.quantity > 0)
    );
    toast.success(
      `Marked ${qty} ${actionItem.uom} of ${actionItem.itemName} as used`
    );
    closeAction();
  }

  function handleDispose() {
    if (!disposeItem) return;
    setData((prev) => prev.filter((item) => item.id !== disposeItem.id));
    toast.success(`${disposeItem.itemName} marked as disposed`);
    setDisposeConfirmOpen(false);
    setDisposeItem(null);
  }

  function handleUpdateExpiry() {
    if (!actionItem || !actionDate) return;
    const newDate = new Date(actionDate);
    const now = new Date();
    const daysToExpiry = Math.ceil(
      (newDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    let newStatus: MaterialExpiry["status"] = "safe";
    if (daysToExpiry <= 0) newStatus = "expired";
    else if (daysToExpiry <= 15) newStatus = "critical";
    else if (daysToExpiry <= 45) newStatus = "warning";

    setData((prev) =>
      prev.map((item) =>
        item.id === actionItem.id
          ? {
              ...item,
              expiryDate: actionDate,
              daysToExpiry,
              status: newStatus,
              suggestedAction:
                newStatus === "safe"
                  ? "No action needed"
                  : item.suggestedAction,
            }
          : item
      )
    );
    toast.success(`Expiry date updated for ${actionItem.itemName}`);
    closeAction();
  }

  function handleTransfer() {
    if (!actionItem || !actionWarehouse || !actionQty) return;
    const qty = parseFloat(actionQty);
    if (isNaN(qty) || qty <= 0 || qty > actionItem.quantity) {
      toast.error("Enter a valid transfer quantity");
      return;
    }
    setData((prev) =>
      prev.map((item) =>
        item.id === actionItem.id
          ? { ...item, quantity: Math.round((item.quantity - qty) * 100) / 100 }
          : item
      ).filter((item) => item.quantity > 0)
    );
    toast.success(
      `Transferred ${qty} ${actionItem.uom} to ${actionWarehouse}`
    );
    closeAction();
  }

  function handleAddExpiry() {
    if (!newExpiryItem || !newExpiryDate) {
      toast.error("Item and expiry date are required");
      return;
    }
    toast.success("Expiry date added successfully");
    setAddExpiryOpen(false);
    setNewExpiryItem("");
    setNewExpiryDate("");
    setNewExpiryBatch("");
    setNewExpiryNotes("");
  }

  /* ---------- render ---------- */

  const statusOrders: MaterialExpiry["status"][] = [
    "expired",
    "critical",
    "warning",
    "safe",
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Material Expiry & Shelf Life Tracker"
        description="Prevent waste from expired chemicals and dead stock"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Inventory", href: "/inventory" },
          { label: "Expiry Tracker" },
        ]}
        actions={
          <Button onClick={() => setAddExpiryOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Expiry Date
          </Button>
        }
      />

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tracked Items"
          value={loading ? "-" : formatNumber(totalTracked)}
          icon={<FlaskConical className="h-5 w-5" />}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Expired Items"
          value={loading ? "-" : formatNumber(expiredCount)}
          icon={<PackageX className="h-5 w-5" />}
          color="red"
          loading={loading}
        />
        <StatCard
          title="Expiring in 15 Days"
          value={loading ? "-" : formatNumber(criticalCount)}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="orange"
          loading={loading}
        />
        <StatCard
          title="Value at Risk"
          value={loading ? "-" : formatCurrency(valueAtRisk)}
          icon={<DollarSign className="h-5 w-5" />}
          color="red"
          loading={loading}
        />
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Status toggle buttons */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STATUS_FILTER_CONFIG) as StatusFilter[]).map((key) => {
            const cfg = STATUS_FILTER_CONFIG[key];
            const isActive = statusFilter === key;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
                  isActive
                    ? cn(cfg.className, "ring-2 ring-offset-1 ring-gray-300")
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                )}
              >
                {cfg.label}
                {key !== "all" && (
                  <span className="ml-1 opacity-60">
                    ({key === "expired"
                      ? expiredCount
                      : key === "critical"
                        ? criticalCount
                        : key === "warning"
                          ? warningItems.length
                          : safeItems.length})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Type filter */}
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as TypeFilter)}
        >
          <SelectTrigger className="w-44 h-8 text-xs">
            <SelectValue placeholder="Material type..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="chemical">Chemical</SelectItem>
            <SelectItem value="trim">Trim</SelectItem>
            <SelectItem value="accessory">Accessory</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">
            Failed to load data: {error}
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <ItemSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <CalendarClock className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">
              {data.length === 0
                ? "No inventory items with shelf life tracking. Add chemicals or trims to your inventory."
                : "No items match your current filters."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main banded content */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-6">
          {statusOrders.map((status) => {
            const items = groupedItems[status];
            if (items.length === 0) return null;
            const cfg = STATUS_CONFIG[status];

            return (
              <div key={status}>
                {/* Status band header */}
                <div
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-t-lg font-semibold text-sm",
                    cfg.bandClass
                  )}
                >
                  {status === "expired" && <Ban className="h-4 w-4" />}
                  {status === "critical" && <ShieldAlert className="h-4 w-4" />}
                  {status === "warning" && <AlertTriangle className="h-4 w-4" />}
                  {status === "safe" && <CheckCircle2 className="h-4 w-4" />}
                  {cfg.bandTitle}
                  <span className="ml-auto text-xs opacity-80">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Items in this band */}
                <div className="space-y-0 border border-t-0 rounded-b-lg overflow-hidden">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-white",
                        cfg.borderClass,
                        idx < items.length - 1 && "border-b border-gray-100"
                      )}
                    >
                      {/* Countdown */}
                      <div
                        className={cn(
                          "flex flex-col items-center justify-center rounded-lg px-3 py-2 min-w-[80px] shrink-0",
                          cfg.countdownClass
                        )}
                      >
                        {item.status === "expired" ? (
                          <>
                            <span className="text-lg font-black leading-tight">
                              EXPIRED
                            </span>
                            <span className="text-[10px] font-medium opacity-70 mt-0.5">
                              {Math.abs(item.daysToExpiry)}d ago
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-2xl font-black leading-tight tabular-nums">
                              {item.daysToExpiry}
                            </span>
                            <span className="text-[10px] font-medium opacity-70 uppercase tracking-wider">
                              Days
                            </span>
                          </>
                        )}
                      </div>

                      {/* Center info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-semibold text-gray-900">
                            {item.itemName}
                          </h4>
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 capitalize"
                          >
                            {item.itemType}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Batch: <span className="font-medium text-gray-700">{item.batchNumber}</span>
                          {" | "}
                          Qty: <span className="font-medium text-gray-700">{item.quantity} {item.uom}</span>
                          {" | "}
                          Warehouse: <span className="font-medium text-gray-700">{item.warehouse}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Expiry: <span className="font-medium text-gray-700">{formatDate(item.expiryDate)}</span>
                          {" | "}
                          Value: <span className="font-medium text-gray-700">{formatCurrency(item.value)}</span>
                        </p>
                        {/* Suggested action */}
                        {item.status !== "safe" && (
                          <p className="text-xs italic text-blue-600 mt-1.5 leading-relaxed">
                            {item.suggestedAction}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-1.5 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() => openAction("mark_used", item)}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Mark Used
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => {
                            setDisposeItem(item);
                            setDisposeConfirmOpen(true);
                          }}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Dispose
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() => openAction("update_expiry", item)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Update Expiry
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() => openAction("transfer", item)}
                        >
                          <ArrowRightLeft className="h-3 w-3 mr-1" />
                          Transfer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Donut chart */}
      {!loading && data.length > 0 && (
        <DonutChartCard
          title="Items by Status"
          data={donutData}
          centerValue={formatNumber(totalTracked)}
          centerLabel="Total"
        />
      )}

      {/* Mark Used Dialog */}
      <Dialog
        open={actionType === "mark_used"}
        onOpenChange={(open) => !open && closeAction()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Used</DialogTitle>
            <DialogDescription>
              Record usage of {actionItem?.itemName} (Available: {actionItem?.quantity} {actionItem?.uom})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Quantity Used ({actionItem?.uom})</Label>
              <Input
                type="number"
                placeholder={`Max ${actionItem?.quantity}`}
                value={actionQty}
                onChange={(e) => setActionQty(e.target.value)}
                className="mt-1"
                min={0}
                max={actionItem?.quantity}
                step="0.01"
              />
            </div>
            <div>
              <Label>Batch Note (optional)</Label>
              <Textarea
                placeholder="Production batch or usage note..."
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAction}>
              Cancel
            </Button>
            <Button onClick={handleMarkUsed} disabled={!actionQty}>
              Confirm Usage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispose Confirm Dialog */}
      <Dialog open={disposeConfirmOpen} onOpenChange={setDisposeConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Disposal</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark{" "}
              <strong>{disposeItem?.itemName}</strong> (Batch: {disposeItem?.batchNumber}) as disposed?
              This action removes it from the tracker.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDisposeConfirmOpen(false);
                setDisposeItem(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDispose}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Confirm Disposal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Expiry Dialog */}
      <Dialog
        open={actionType === "update_expiry"}
        onOpenChange={(open) => !open && closeAction()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Expiry Date</DialogTitle>
            <DialogDescription>
              Set a new expiry date for {actionItem?.itemName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>New Expiry Date</Label>
              <Input
                type="date"
                value={actionDate}
                onChange={(e) => setActionDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Reason for Change</Label>
              <Textarea
                placeholder="e.g., Supplier confirmed extended shelf life..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAction}>
              Cancel
            </Button>
            <Button onClick={handleUpdateExpiry} disabled={!actionDate}>
              Update Expiry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog
        open={actionType === "transfer"}
        onOpenChange={(open) => !open && closeAction()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Stock</DialogTitle>
            <DialogDescription>
              Transfer {actionItem?.itemName} to another warehouse (Available: {actionItem?.quantity} {actionItem?.uom})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Destination Warehouse</Label>
              <Select
                value={actionWarehouse}
                onValueChange={setActionWarehouse}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select warehouse..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Main Store">Main Store</SelectItem>
                  <SelectItem value="Chemical Store">Chemical Store</SelectItem>
                  <SelectItem value="Dyeing Store">Dyeing Store</SelectItem>
                  <SelectItem value="Trim Store">Trim Store</SelectItem>
                  <SelectItem value="Finishing Store">Finishing Store</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Transfer Quantity ({actionItem?.uom})</Label>
              <Input
                type="number"
                placeholder={`Max ${actionItem?.quantity}`}
                value={actionQty}
                onChange={(e) => setActionQty(e.target.value)}
                className="mt-1"
                min={0}
                max={actionItem?.quantity}
                step="0.01"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAction}>
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={!actionWarehouse || !actionQty}
            >
              <ArrowRightLeft className="h-4 w-4 mr-1" />
              Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expiry Sheet */}
      <Sheet open={addExpiryOpen} onOpenChange={setAddExpiryOpen}>
        <SheetContent className="sm:max-w-md w-full">
          <SheetHeader className="mb-4">
            <SheetTitle>Add Expiry Date</SheetTitle>
            <SheetDescription>
              Track shelf life for an inventory item
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div>
              <Label>Inventory Item</Label>
              <Input
                placeholder="Search or type item name..."
                value={newExpiryItem}
                onChange={(e) => setNewExpiryItem(e.target.value)}
                className="mt-1"
              />
              <p className="text-[10px] text-gray-400 mt-0.5">
                Type the name of a chemical, trim, or accessory in your inventory
              </p>
            </div>
            <div>
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={newExpiryDate}
                onChange={(e) => setNewExpiryDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Batch Number</Label>
              <Input
                placeholder="e.g., BATCH-2026-001"
                value={newExpiryBatch}
                onChange={(e) => setNewExpiryBatch(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Additional details about this item..."
                value={newExpiryNotes}
                onChange={(e) => setNewExpiryNotes(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            <Button
              onClick={handleAddExpiry}
              disabled={!newExpiryItem || !newExpiryDate}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-1" />
              Save Expiry Date
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
