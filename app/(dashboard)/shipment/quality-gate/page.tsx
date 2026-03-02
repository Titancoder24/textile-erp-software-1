"use client";

import * as React from "react";
import {
  ShieldCheck,
  Lock,
  Unlock,
  ClipboardCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
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
import { useProfile } from "@/hooks/use-profile";
import {
  getQualityGateData,
  type ShipmentGate,
} from "@/lib/actions/analytics";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function CheckItem({
  label,
  passed,
}: {
  label: string;
  passed: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {passed ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
      ) : (
        <XCircle className="h-4 w-4 shrink-0 text-red-500" />
      )}
      <span
        className={cn(
          "text-sm",
          passed ? "text-gray-700" : "text-gray-500"
        )}
      >
        {label}
      </span>
    </div>
  );
}

function getStatusBadge(gate: ShipmentGate) {
  if (gate.canRelease) {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
        Ready to Release
      </Badge>
    );
  }
  if (gate.qualityHold) {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
        Quality Hold
      </Badge>
    );
  }
  return (
    <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">
      Pending QC
    </Badge>
  );
}

function getInspectionResultBadge(result: string) {
  if (result === "pass" || result === "accepted") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
        <CheckCircle2 className="h-3 w-3" />
        Pass
      </span>
    );
  }
  if (result === "fail" || result === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
        <XCircle className="h-3 w-3" />
        Fail
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
      Pending
    </span>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function QualityGatePage() {
  const { profile } = useProfile();
  const companyId = profile?.company_id;

  const [shipments, setShipments] = React.useState<ShipmentGate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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

  // Derived stats
  const totalShipments = shipments.length;
  const onHoldCount = shipments.filter((s) => s.qualityHold).length;
  const readyCount = shipments.filter((s) => s.canRelease).length;
  const pendingQCCount = shipments.filter(
    (s) => !s.canRelease && !s.qualityHold
  ).length;

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Quality Hold & Release Gate"
          description="Gate that prevents shipping until quality is cleared"
          breadcrumb={[
            { label: "Shipment", href: "/shipment" },
            { label: "Quality Gate" },
          ]}
        />
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (shipments.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Quality Hold & Release Gate"
          description="Gate that prevents shipping until quality is cleared"
          breadcrumb={[
            { label: "Shipment", href: "/shipment" },
            { label: "Quality Gate" },
          ]}
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ShieldCheck className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-600">
              No pending shipments
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Shipments in packing or ready status will appear here for quality
              gate review.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quality Hold & Release Gate"
        description="Gate that prevents shipping until quality is cleared"
        breadcrumb={[
          { label: "Shipment", href: "/shipment" },
          { label: "Quality Gate" },
        ]}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          title="Total Shipments"
          value={totalShipments}
          icon={<ShieldCheck className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="On Hold"
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

      {/* Shipment Cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {shipments.map((gate) => {
          const isOnHold = gate.qualityHold;
          const isReady = gate.canRelease;

          // Determine which conditions are met from the shipment data
          const productionComplete = !gate.holdReasons.some((r) =>
            r.toLowerCase().includes("production not complete")
          );
          const qcPassed = !gate.holdReasons.some((r) =>
            r.toLowerCase().includes("qc not passed")
          );
          const packingDone = !gate.holdReasons.some((r) =>
            r.toLowerCase().includes("packing incomplete")
          );
          const documentsReady = !gate.holdReasons.some((r) =>
            r.toLowerCase().includes("documents not ready")
          );
          const noQualityIssues = !gate.holdReasons.some(
            (r) =>
              r.toLowerCase().includes("qc failed") ||
              r.toLowerCase().includes("critical defects")
          );

          return (
            <Card
              key={gate.id}
              className={cn(
                "transition-shadow hover:shadow-md",
                isOnHold && "border-red-300",
                isReady && "border-green-300",
                !isOnHold && !isReady && "border-orange-300"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-bold text-gray-900">
                        {gate.shipmentNumber}
                      </CardTitle>
                      {getStatusBadge(gate)}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {gate.buyer}
                    </p>
                  </div>
                  {isOnHold ? (
                    <Lock className="h-5 w-5 shrink-0 text-red-500" />
                  ) : isReady ? (
                    <Unlock className="h-5 w-5 shrink-0 text-green-600" />
                  ) : (
                    <ClipboardCheck className="h-5 w-5 shrink-0 text-orange-500" />
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Order numbers */}
                {gate.orderNumbers.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Orders
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {gate.orderNumbers.map((on) => (
                        <span
                          key={on}
                          className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-xs font-mono font-medium text-blue-700"
                        >
                          {on}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shipment details */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-gray-50 p-2">
                    <Calendar className="mx-auto h-4 w-4 text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500">Planned Date</p>
                    <p className="text-xs font-semibold text-gray-800">
                      {gate.plannedDate
                        ? formatDate(gate.plannedDate)
                        : "TBD"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-2">
                    <Boxes className="mx-auto h-4 w-4 text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500">Cartons</p>
                    <p className="text-xs font-semibold text-gray-800">
                      {formatNumber(gate.totalCartons)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-2">
                    <Package className="mx-auto h-4 w-4 text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500">Pieces</p>
                    <p className="text-xs font-semibold text-gray-800">
                      {formatNumber(gate.totalPieces)}
                    </p>
                  </div>
                </div>

                {/* Checklist */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Release Checklist
                  </p>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    <CheckItem
                      label="Production Complete"
                      passed={productionComplete}
                    />
                    <CheckItem label="QC Passed" passed={qcPassed} />
                    <CheckItem label="Packing Done" passed={packingDone} />
                    <CheckItem
                      label="Documents Ready"
                      passed={documentsReady}
                    />
                    <CheckItem
                      label="No Quality Issues"
                      passed={noQualityIssues}
                    />
                  </div>
                </div>

                {/* Quality Hold Banner */}
                {isOnHold && gate.holdReasons.length > 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4 text-red-600" />
                      <span className="text-xs font-bold uppercase tracking-wider text-red-700">
                        Quality Hold
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {gate.holdReasons.map((reason, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-1.5 text-xs text-red-700"
                        >
                          <XCircle className="h-3 w-3 shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Pending Actions */}
                {isOnHold && gate.pendingActions.length > 0 && (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-yellow-800 mb-2">
                      Pending Actions
                    </p>
                    <ul className="space-y-1">
                      {gate.pendingActions.map((action, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-1.5 text-xs text-yellow-700"
                        >
                          <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Last Inspection */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      Last Inspection:
                    </span>
                    {getInspectionResultBadge(gate.lastInspectionResult)}
                    {gate.lastInspectionDate && (
                      <span className="text-xs text-gray-400">
                        ({formatDate(gate.lastInspectionDate)})
                      </span>
                    )}
                  </div>
                </div>

                {/* Release Button */}
                <div>
                  {isReady ? (
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <Unlock className="mr-2 h-4 w-4" />
                      Release for Shipment
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Cannot Release - Conditions Not Met
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
