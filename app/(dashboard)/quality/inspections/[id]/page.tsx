"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  FileWarning,
  Download,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { useCompany } from "@/contexts/company-context";
import {
  getInspectionById,
  getInspectionByNumber,
  addDefect,
} from "@/lib/actions/quality";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ---------- Types ---------- */

interface Defect {
  id: string;
  defect_type: string;
  defect_location: string | null;
  severity: "critical" | "major" | "minor";
  quantity: number;
  notes: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InspectionData = Record<string, any>;

/* ---------- Helpers ---------- */

const SEVERITY_BADGE: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border border-red-200",
  major: "bg-orange-100 text-orange-700 border border-orange-200",
  minor: "bg-yellow-100 text-yellow-700 border border-yellow-200",
};

const RESULT_CONFIG: Record<
  string,
  { label: string; iconName: string; color: string; bg: string }
> = {
  pass: {
    label: "PASS",
    iconName: "check",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
  },
  fail: {
    label: "FAIL",
    iconName: "alert",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
  },
  pending: {
    label: "PENDING",
    iconName: "clock",
    color: "text-yellow-700",
    bg: "bg-yellow-50 border-yellow-200",
  },
};

function ResultIcon({ name }: { name: string }) {
  if (name === "check") return <CheckCircle className="h-5 w-5" />;
  if (name === "alert") return <AlertTriangle className="h-5 w-5" />;
  return <Clock className="h-5 w-5" />;
}

function aqlAcceptNumber(sampleSize: number): number {
  if (sampleSize <= 13) return 1;
  if (sampleSize <= 50) return 3;
  if (sampleSize <= 80) return 5;
  if (sampleSize <= 125) return 7;
  if (sampleSize <= 200) return 10;
  return 14;
}

/* ---------- Add Defect Form ---------- */

function AddDefectModal({
  inspectionId,
  onClose,
  onAdded,
}: {
  inspectionId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [defectType, setDefectType] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [severity, setSeverity] = React.useState<"minor" | "major" | "critical">("minor");
  const [quantity, setQuantity] = React.useState(1);
  const [notes, setNotes] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const handleSubmit = async () => {
    if (!defectType.trim()) {
      toast.error("Defect type is required");
      return;
    }
    setSaving(true);
    const { error } = await addDefect(inspectionId, {
      defect_type: defectType,
      defect_location: location || null,
      severity,
      quantity,
      notes: notes || null,
    });
    setSaving(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Defect added successfully");
    onAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="border-b border-gray-100 px-6 py-4">
          <p className="text-base font-semibold text-gray-900">Add Defect</p>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Defect Type</label>
            <input
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Needle hole"
              value={defectType}
              onChange={(e) => setDefectType(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Location</label>
            <input
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Side seam"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Severity</label>
              <select
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as "minor" | "major" | "critical")}
              >
                <option value="minor">Minor</option>
                <option value="major">Major</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                min={1}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              rows={2}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "Adding..." : "Add Defect"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

export default function InspectionDetailPage() {
  const params = useParams();
  const rawId = params.id as string;
  const { companyId } = useCompany();

  const [inspection, setInspection] = React.useState<InspectionData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [showAddDefect, setShowAddDefect] = React.useState(false);

  const fetchInspection = React.useCallback(async () => {
    setLoading(true);

    // Determine if the param is a UUID or an inspection number
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId);

    let result;
    if (isUuid) {
      result = await getInspectionById(rawId);
    } else {
      result = await getInspectionByNumber(rawId);
    }

    if (result.error) {
      toast.error(result.error);
    } else {
      setInspection(result.data);
    }
    setLoading(false);
  }, [rawId]);

  React.useEffect(() => {
    if (companyId) {
      fetchInspection();
    }
  }, [companyId, fetchInspection]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <AlertTriangle className="mb-3 h-8 w-8" />
        <p className="text-sm font-medium text-gray-600">Inspection not found</p>
        <p className="text-xs text-gray-400">The inspection record could not be loaded.</p>
      </div>
    );
  }

  // Map DB fields
  const inspectionNumber = inspection.inspection_number ?? rawId;
  const inspectionType = inspection.inspection_type ?? "—";
  const orderNumber = inspection.sales_orders?.order_number ?? "—";
  const buyerName = inspection.sales_orders?.buyers?.name ?? "—";
  const productionLine = inspection.production_line ?? "—";
  const inspectionDate = inspection.inspection_date ?? "—";
  const inspectorName = inspection.inspector?.full_name ?? "—";
  const templateName = inspection.inspection_templates?.name ?? "—";
  const lotSize = inspection.lot_size ?? 0;
  const sampleSize = inspection.sample_size ?? 0;
  const piecesChecked = inspection.pieces_checked ?? 0;
  const result = inspection.result ?? "pending";
  const defects: Defect[] = (inspection.inspection_defects ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (d: any) => ({
      id: d.id,
      defect_type: d.defect_type,
      defect_location: d.defect_location,
      severity: d.severity,
      quantity: d.quantity ?? 1,
      notes: d.notes,
    })
  );

  const resultCfg = RESULT_CONFIG[result] ?? RESULT_CONFIG.pending;
  const acceptNumber = aqlAcceptNumber(sampleSize);
  const totalMajorCritical = defects
    .filter((d) => d.severity === "major" || d.severity === "critical")
    .reduce((sum, d) => sum + d.quantity, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Inspection ${inspectionNumber}`}
        breadcrumb={[
          { label: "Quality", href: "/quality" },
          { label: "Inspections", href: "/quality/inspections" },
          { label: inspectionNumber },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {result === "fail" && (
              <Link href={`/quality/capa?inspection=${inspection.id}`}>
                <Button variant="outline" size="sm">
                  <FileWarning className="mr-2 h-4 w-4" />
                  Generate CAPA
                </Button>
              </Link>
            )}
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        }
      />

      {/* Header info grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Main info */}
        <Card className="lg:col-span-2">
          <div className="border-b border-gray-100 px-6 py-4">
            <p className="text-sm font-semibold text-gray-900">Inspection Details</p>
          </div>
          <CardContent className="p-6">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              {[
                { label: "Type", value: inspectionType },
                { label: "Order", value: orderNumber },
                { label: "Buyer", value: buyerName },
                { label: "Line", value: productionLine },
                { label: "Date", value: inspectionDate },
                { label: "Inspector", value: inspectorName },
                { label: "Template", value: templateName },
                { label: "Lot Size", value: `${lotSize.toLocaleString()} pcs` },
                {
                  label: "Sample Size (AQL 2.5)",
                  value: `${sampleSize} pcs`,
                },
                {
                  label: "Pieces Checked",
                  value: `${piecesChecked} pcs`,
                },
                {
                  label: "Total Defects",
                  value: defects.reduce((s, d) => s + d.quantity, 0),
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs font-medium text-gray-500">{label}</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        {/* AQL result */}
        <Card>
          <div className="border-b border-gray-100 px-6 py-4">
            <p className="text-sm font-semibold text-gray-900">AQL Result</p>
          </div>
          <CardContent className="flex flex-col items-center justify-center gap-4 p-6">
            <div
              className={`flex items-center gap-2 rounded-xl border px-5 py-3 font-bold text-lg ${resultCfg.color} ${resultCfg.bg}`}
            >
              <ResultIcon name={resultCfg.iconName} />
              {resultCfg.label}
            </div>

            <div className="w-full space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Sample Size</span>
                <span className="font-semibold">{sampleSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Accept Number (Maj+Crit)</span>
                <span className="font-semibold">{acceptNumber}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3">
                <span className="text-gray-500">Found (Maj+Crit)</span>
                <span
                  className={`font-bold ${
                    totalMajorCritical > acceptNumber ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {totalMajorCritical}
                </span>
              </div>
            </div>

            {/* Visual progress bar */}
            <div className="w-full">
              <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                <span>0</span>
                <span>Accept: {acceptNumber}</span>
                <span>{acceptNumber * 2}</span>
              </div>
              <div className="relative h-3 rounded-full bg-gray-200">
                <div
                  className={`h-3 rounded-full transition-all ${
                    totalMajorCritical > acceptNumber ? "bg-red-500" : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (totalMajorCritical / (acceptNumber * 2)) * 100,
                      100
                    )}%`,
                  }}
                />
                {/* Accept line */}
                <div
                  className="absolute top-0 h-3 w-0.5 bg-gray-600"
                  style={{ left: "50%" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Defect log */}
      <Card>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Defect Log</p>
            <p className="text-xs text-gray-500">
              {defects.length} defect type(s) recorded
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowAddDefect(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Defect
          </Button>
        </div>
        <CardContent className="p-0">
          {defects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <CheckCircle className="mb-3 h-8 w-8 text-green-400" />
              <p className="text-sm font-medium text-gray-600">No defects recorded</p>
              <p className="text-xs text-gray-400">All pieces passed inspection</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  {["Defect Type", "Location", "Severity", "Quantity", "Notes"].map((h) => (
                    <TableHead
                      key={h}
                      className="text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {defects.map((defect) => (
                  <TableRow key={defect.id} className="border-b border-gray-100">
                    <TableCell className="py-3 text-sm font-medium text-gray-900">
                      {defect.defect_type}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-gray-600">
                      {defect.defect_location || "—"}
                    </TableCell>
                    <TableCell className="py-3">
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold capitalize ${SEVERITY_BADGE[defect.severity]}`}
                      >
                        {defect.severity}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-sm font-semibold text-gray-900">
                      {defect.quantity}
                    </TableCell>
                    <TableCell className="py-3 max-w-xs text-sm text-gray-500">
                      {defect.notes || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Defect Modal */}
      {showAddDefect && (
        <AddDefectModal
          inspectionId={inspection.id}
          onClose={() => setShowAddDefect(false)}
          onAdded={fetchInspection}
        />
      )}
    </div>
  );
}
