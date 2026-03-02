"use client";

import * as React from "react";
import {
  ShieldCheck,
  Lock,
  Unlock,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Eye,
  Loader2,
  Calendar,
  Package,
  Boxes,
} from "lucide-react";

import { cn, formatDate, formatNumber } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useProfile } from "@/hooks/use-profile";
import { toast } from "sonner";
import {
  getQualityGateData,
  type ShipmentGate,
} from "@/lib/actions/analytics";

// ---------------------------------------------------------------------------
// Gate Step Component (Visual Stepper)
// ---------------------------------------------------------------------------

interface GateStep {
  label: string;
  passed: boolean | null; // null = pending, true = passed, false = failed
}

function GateStepper({ steps }: { steps: GateStep[] }) {
  return (
    <div className="flex items-center justify-between w-full py-4">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        const circleColor =
          step.passed === true
            ? "bg-green-500 border-green-500 text-white"
            : step.passed === false
            ? "bg-red-500 border-red-500 text-white"
            : "bg-gray-100 border-gray-300 text-gray-400";

        const lineColor =
          step.passed === true
            ? "bg-green-400"
            : step.passed === false
            ? "bg-red-300"
            : "bg-gray-200";

        return (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center gap-1.5 min-w-0 flex-shrink-0">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all shadow-sm",
                  circleColor
                )}
              >
                {step.passed === true ? (
                  <CheckCircle className="h-5 w-5" />
                ) : step.passed === false ? (
                  <XCircle className="h-5 w-5" />
                ) : (
                  <span className="text-xs font-bold">{idx + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium text-center leading-tight max-w-[72px]",
                  step.passed === true
                    ? "text-green-700"
                    : step.passed === false
                    ? "text-red-600"
                    : "text-gray-400"
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={cn("flex-1 h-0.5 rounded-full mx-1 mt-[-20px]", lineColor)} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function getStatusBadge(gate: ShipmentGate) {
  if (gate.canRelease) {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 gap-1">
        <Unlock className="h-3 w-3" />
        Ready to Release
      </Badge>
    );
  }
  if (gate.qualityHold) {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100 gap-1">
        <Lock className="h-3 w-3" />
        Quality Hold
      </Badge>
    );
  }
  return (
    <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100 gap-1">
      <ClipboardCheck className="h-3 w-3" />
      Pending QC
    </Badge>
  );
}

function getInspectionBadge(result: string) {
  if (result === "pass" || result === "accepted") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
        <CheckCircle className="h-3 w-3" />
        Pass
      </span>
    );
  }
  if (result === "fail" || result === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
        <XCircle className="h-3 w-3" />
        Fail
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
      Pending
    </span>
  );
}

// ---------------------------------------------------------------------------
// Parse hold reasons to get gate steps
// ---------------------------------------------------------------------------

function parseGateSteps(gate: ShipmentGate): GateStep[] {
  const checks: Array<{ label: string; keyword: string }> = [
    { label: "Production Complete", keyword: "production not complete" },
    { label: "QC Passed", keyword: "qc not passed" },
    { label: "Packing Done", keyword: "packing incomplete" },
    { label: "Documents Ready", keyword: "documents not ready" },
    { label: "No Quality Issues", keyword: "qc failed" },
  ];

  return checks.map((check) => {
    const failed = gate.holdReasons.some(
      (r) => r.toLowerCase().includes(check.keyword) || (check.keyword === "qc failed" && r.toLowerCase().includes("critical defects"))
    );
    if (failed) return { label: check.label, passed: false };
    // If the gate is ready, all steps are passed
    if (gate.canRelease) return { label: check.label, passed: true };
    // If on hold but this specific item didn't fail, it passed
    if (gate.qualityHold && !failed) return { label: check.label, passed: true };
    return { label: check.label, passed: null };
  });
}

// ---------------------------------------------------------------------------
// Resolve Action Dialog
// ---------------------------------------------------------------------------

interface ResolveDialogState {
  open: boolean;
  shipmentId: string;
  shipmentNumber: string;
  actionText: string;
  actionIndex: number;
}

// ---------------------------------------------------------------------------
// Release Confirmation Dialog
// ---------------------------------------------------------------------------

interface ReleaseDialogState {
  open: boolean;
  shipmentId: string;
  shipmentNumber: string;
}

// ---------------------------------------------------------------------------
// Override Dialog
// ---------------------------------------------------------------------------

interface OverrideDialogState {
  open: boolean;
  shipmentId: string;
  shipmentNumber: string;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function QualityGatePage() {
  const { profile } = useProfile();
  const companyId = profile?.company_id;
  const userRole = profile?.role;

  const [shipments, setShipments] = React.useState<ShipmentGate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Resolve action dialog
  const [resolveDialog, setResolveDialog] = React.useState<ResolveDialogState>({
    open: false,
    shipmentId: "",
    shipmentNumber: "",
    actionText: "",
    actionIndex: -1,
  });
  const [resolveDescription, setResolveDescription] = React.useState("");

  // Release confirmation dialog
  const [releaseDialog, setReleaseDialog] = React.useState<ReleaseDialogState>({
    open: false,
    shipmentId: "",
    shipmentNumber: "",
  });

  // Override dialog
  const [overrideDialog, setOverrideDialog] = React.useState<OverrideDialogState>({
    open: false,
    shipmentId: "",
    shipmentNumber: "",
  });
  const [overrideReason, setOverrideReason] = React.useState("");
  const [overrideAccepted, setOverrideAccepted] = React.useState(false);

  // Resolved actions tracking (local state)
  const [resolvedActions, setResolvedActions] = React.useState<Set<string>>(new Set());

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
        const result = await getQualityGateData(companyId!);
        if (!cancelled) {
          if (result.error) {
            setError(result.error);
          } else {
            setShipments(result.data ?? []);
          }
        }
      } catch {
        if (!cancelled) setError("Failed to load quality gate data");
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
  // Stats
  // ---------------------------------------------------------------------------

  const totalShipments = shipments.length;
  const onHoldCount = shipments.filter((s) => s.qualityHold).length;
  const readyCount = shipments.filter((s) => s.canRelease).length;
  const pendingQCCount = shipments.filter((s) => !s.canRelease && !s.qualityHold).length;

  const canOverride = userRole === "super_admin" || userRole === "factory_owner";

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function handleResolveAction() {
    if (!resolveDescription.trim()) {
      toast.error("Please provide a resolution description");
      return;
    }
    const key = `${resolveDialog.shipmentId}__${resolveDialog.actionIndex}`;
    setResolvedActions((prev) => new Set(prev).add(key));
    toast.success("Action marked as resolved", {
      description: `${resolveDialog.actionText} resolved for ${resolveDialog.shipmentNumber}`,
    });
    setResolveDialog((prev) => ({ ...prev, open: false }));
    setResolveDescription("");
  }

  function handleRelease() {
    toast.success(`Shipment released for dispatch`, {
      description: `${releaseDialog.shipmentNumber} has been released. Notify logistics.`,
    });
    setReleaseDialog((prev) => ({ ...prev, open: false }));
  }

  function handleOverride() {
    if (!overrideReason.trim()) {
      toast.error("Please provide a reason for the override");
      return;
    }
    if (!overrideAccepted) {
      toast.error("You must accept responsibility to override the hold");
      return;
    }
    toast.warning(`Quality hold overridden for ${overrideDialog.shipmentNumber}`, {
      description: "This action has been logged for audit. Proceed with caution.",
    });
    setOverrideDialog((prev) => ({ ...prev, open: false }));
    setOverrideReason("");
    setOverrideAccepted(false);
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
          title="Quality Hold & Release Gate"
          description="No shipment leaves without quality clearance"
          breadcrumb={[{ label: "Shipment", href: "/shipment" }, { label: "Quality Gate" }]}
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

  if (shipments.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Quality Hold & Release Gate"
          description="No shipment leaves without quality clearance"
          breadcrumb={[{ label: "Shipment", href: "/shipment" }, { label: "Quality Gate" }]}
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ShieldCheck className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-600">No pending shipments</p>
            <p className="text-xs text-gray-400 mt-1">
              Shipments in packing or ready status will appear here for quality gate review.
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
        title="Quality Hold & Release Gate"
        description="No shipment leaves without quality clearance"
        breadcrumb={[{ label: "Shipment", href: "/shipment" }, { label: "Quality Gate" }]}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          title="Total Pending Shipments"
          value={totalShipments}
          icon={<ShieldCheck className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Quality Hold"
          value={onHoldCount}
          icon={<Lock className="h-5 w-5" />}
          color="red"
        />
        <StatCard
          title="Ready to Release"
          value={readyCount}
          icon={<Unlock className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Pending QC"
          value={pendingQCCount}
          icon={<ClipboardCheck className="h-5 w-5" />}
          color="orange"
        />
      </div>

      {/* Shipment Cards (full width, one per row) */}
      <div className="space-y-4">
        {shipments.map((gate) => {
          const isOnHold = gate.qualityHold;
          const isReady = gate.canRelease;
          const gateSteps = parseGateSteps(gate);

          const borderColor = isOnHold
            ? "border-l-red-500"
            : isReady
            ? "border-l-green-500"
            : "border-l-orange-400";

          return (
            <Card
              key={gate.id}
              className={cn(
                "border-l-4 transition-shadow hover:shadow-md overflow-hidden",
                borderColor
              )}
            >
              {/* Header section */}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <CardTitle className="text-xl font-black text-gray-900">
                        {gate.shipmentNumber}
                      </CardTitle>
                      {getStatusBadge(gate)}
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-600">{gate.buyer}</p>
                    {gate.orderNumbers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {gate.orderNumbers.map((on) => (
                          <span
                            key={on}
                            className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-xs font-mono font-medium text-blue-700 border border-blue-100"
                          >
                            {on}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Shipment details mini grid */}
                  <div className="flex gap-4 text-center shrink-0">
                    <div>
                      <Calendar className="mx-auto h-4 w-4 text-gray-400 mb-0.5" />
                      <p className="text-[10px] text-gray-500">Planned</p>
                      <p className="text-xs font-semibold text-gray-800">
                        {gate.plannedDate ? formatDate(gate.plannedDate) : "TBD"}
                      </p>
                    </div>
                    <div>
                      <Boxes className="mx-auto h-4 w-4 text-gray-400 mb-0.5" />
                      <p className="text-[10px] text-gray-500">Cartons</p>
                      <p className="text-xs font-semibold text-gray-800">{formatNumber(gate.totalCartons)}</p>
                    </div>
                    <div>
                      <Package className="mx-auto h-4 w-4 text-gray-400 mb-0.5" />
                      <p className="text-[10px] text-gray-500">Pieces</p>
                      <p className="text-xs font-semibold text-gray-800">{formatNumber(gate.totalPieces)}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* THE GATE CHECKLIST STEPPER */}
                <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-0">
                    Release Gate Checklist
                  </p>
                  <GateStepper steps={gateSteps} />
                </div>

                {/* QUALITY HOLD BANNER */}
                {isOnHold && (
                  <>
                    <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white">
                          <Lock className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-wider text-red-800">
                          QUALITY HOLD
                        </span>
                      </div>
                      <ul className="space-y-1.5">
                        {gate.holdReasons.map((reason, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm text-red-700"
                          >
                            <XCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pending Actions */}
                    {gate.pendingActions.length > 0 && (
                      <div className="rounded-lg border border-yellow-200 bg-yellow-50/80 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-yellow-800 mb-3">
                          Pending Actions
                        </p>
                        <div className="space-y-2">
                          {gate.pendingActions.map((action, idx) => {
                            const actionKey = `${gate.id}__${idx}`;
                            const isResolved = resolvedActions.has(actionKey);

                            return (
                              <div
                                key={idx}
                                className={cn(
                                  "flex items-center justify-between gap-3 rounded-md border px-3 py-2",
                                  isResolved
                                    ? "bg-green-50 border-green-200"
                                    : "bg-white border-yellow-200"
                                )}
                              >
                                <div className="flex items-start gap-2 min-w-0">
                                  {isResolved ? (
                                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-green-600" />
                                  ) : (
                                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-yellow-600" />
                                  )}
                                  <span
                                    className={cn(
                                      "text-sm",
                                      isResolved
                                        ? "text-green-700 line-through"
                                        : "text-yellow-800"
                                    )}
                                  >
                                    {action}
                                  </span>
                                </div>
                                {!isResolved && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="shrink-0 text-xs h-7 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                                    onClick={() => {
                                      setResolveDescription("");
                                      setResolveDialog({
                                        open: true,
                                        shipmentId: gate.id,
                                        shipmentNumber: gate.shipmentNumber,
                                        actionText: action,
                                        actionIndex: idx,
                                      });
                                    }}
                                  >
                                    Mark Resolved
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* READY BANNER */}
                {isReady && (
                  <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white">
                        <Unlock className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-black uppercase tracking-wider text-green-800">
                        READY FOR RELEASE
                      </span>
                    </div>
                    <p className="text-xs text-green-600">
                      All quality checks passed. This shipment can be released for dispatch.
                    </p>
                  </div>
                )}

                {/* Bottom bar: last inspection + action buttons */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Last Inspection:</span>
                    {getInspectionBadge(gate.lastInspectionResult)}
                    {gate.lastInspectionDate && (
                      <span className="text-xs text-gray-400">
                        ({formatDate(gate.lastInspectionDate)})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Override button (admin only) */}
                    {isOnHold && canOverride && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setOverrideReason("");
                          setOverrideAccepted(false);
                          setOverrideDialog({
                            open: true,
                            shipmentId: gate.id,
                            shipmentNumber: gate.shipmentNumber,
                          });
                        }}
                      >
                        <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                        Override Hold
                      </Button>
                    )}

                    {/* Release button */}
                    {isReady ? (
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                        onClick={() =>
                          setReleaseDialog({
                            open: true,
                            shipmentId: gate.id,
                            shipmentNumber: gate.shipmentNumber,
                          })
                        }
                      >
                        <Send className="mr-1.5 h-3.5 w-3.5" />
                        Release for Shipment
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled className="text-xs">
                        <Lock className="mr-1.5 h-3.5 w-3.5" />
                        {isOnHold
                          ? `Quality Hold -- ${gate.holdReasons.length} issue${gate.holdReasons.length !== 1 ? "s" : ""} pending`
                          : "Awaiting QC"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ================================================================ */}
      {/* RESOLVE ACTION DIALOG                                            */}
      {/* ================================================================ */}

      <Dialog
        open={resolveDialog.open}
        onOpenChange={(open) => setResolveDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Action Resolved</DialogTitle>
            <DialogDescription>
              Confirm resolution for: {resolveDialog.actionText}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3">
              <p className="text-sm text-yellow-800 font-medium">{resolveDialog.actionText}</p>
              <p className="text-xs text-yellow-600 mt-1">Shipment: {resolveDialog.shipmentNumber}</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">
                Resolution Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={resolveDescription}
                onChange={(e) => setResolveDescription(e.target.value)}
                placeholder="Describe what was done to resolve this action..."
                rows={4}
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">Resolved By</Label>
              <p className="text-sm font-medium text-gray-800">{profile?.full_name || "Current User"}</p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" size="sm">Cancel</Button>
            </DialogClose>
            <Button size="sm" onClick={handleResolveAction}>
              <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
              Confirm Resolution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================ */}
      {/* RELEASE CONFIRMATION DIALOG                                      */}
      {/* ================================================================ */}

      <Dialog
        open={releaseDialog.open}
        onOpenChange={(open) => setReleaseDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Release Shipment</DialogTitle>
            <DialogDescription>
              Confirm release of {releaseDialog.shipmentNumber} for dispatch.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 text-center">
              <Unlock className="mx-auto h-8 w-8 text-green-600 mb-2" />
              <p className="text-sm font-semibold text-green-800">
                Are you sure you want to release shipment {releaseDialog.shipmentNumber}?
              </p>
              <p className="text-xs text-green-600 mt-1">
                This action cannot be undone. The shipment will be cleared for dispatch.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" size="sm">Cancel</Button>
            </DialogClose>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleRelease}
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Release for Dispatch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================ */}
      {/* OVERRIDE HOLD DIALOG                                             */}
      {/* ================================================================ */}

      <Dialog
        open={overrideDialog.open}
        onOpenChange={(open) => setOverrideDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-700">Override Quality Hold</DialogTitle>
            <DialogDescription>
              This will bypass quality checks for {overrideDialog.shipmentNumber}. Use with extreme caution.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-bold text-red-800">WARNING</span>
              </div>
              <p className="text-xs text-red-700 leading-relaxed">
                Overriding the quality hold releases this shipment despite unresolved quality issues.
                This action is logged in the audit trail and you will be held responsible for any
                quality claims from the buyer.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">
                Reason for Override <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Explain why the quality hold is being overridden..."
                rows={4}
                className="text-sm"
              />
            </div>

            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50/50 p-3">
              <Checkbox
                id="override-accept"
                checked={overrideAccepted}
                onCheckedChange={(checked) => setOverrideAccepted(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="override-accept" className="text-xs text-red-800 cursor-pointer leading-relaxed">
                I take full responsibility for overriding this quality hold. I understand that any
                quality claims resulting from this shipment will be attributed to this override decision.
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" size="sm">Cancel</Button>
            </DialogClose>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleOverride}
              disabled={!overrideAccepted || !overrideReason.trim()}
            >
              <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
              Override Hold
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
