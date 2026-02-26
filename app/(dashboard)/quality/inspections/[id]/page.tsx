import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  FileWarning,
  Download,
} from "lucide-react";

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
  type: string;
  location: string;
  severity: "critical" | "major" | "minor";
  quantity: number;
  notes: string;
}

interface InspectionDetail {
  id: string;
  type: string;
  order: string;
  buyer: string;
  line: string;
  date: string;
  inspector: string;
  lotSize: number;
  sampleSize: number;
  piecesChecked: number;
  result: "pass" | "fail" | "pending";
  template: string;
  defects: Defect[];
}

/* ---------- Mock data ---------- */

const MOCK_INSPECTIONS: Record<string, InspectionDetail> = {
  "INS-0041": {
    id: "INS-0041",
    type: "Final",
    order: "ORD-2401",
    buyer: "Zara International",
    line: "Line 3",
    date: "2026-02-26",
    inspector: "Amira Khan",
    lotSize: 1200,
    sampleSize: 80,
    piecesChecked: 80,
    result: "pass",
    template: "Standard Garment",
    defects: [
      {
        id: "D-001",
        type: "Needle hole",
        location: "Side seam",
        severity: "minor",
        quantity: 1,
        notes: "Small hole near side seam at hip level",
      },
      {
        id: "D-002",
        type: "Broken stitch",
        location: "Collar",
        severity: "major",
        quantity: 1,
        notes: "3 broken stitches on collar band",
      },
    ],
  },
  "INS-0040": {
    id: "INS-0040",
    type: "Inline",
    order: "ORD-2398",
    buyer: "H&M Group",
    line: "Line 1",
    date: "2026-02-25",
    inspector: "Rashid Ali",
    lotSize: 800,
    sampleSize: 80,
    piecesChecked: 80,
    result: "fail",
    template: "Knitwear",
    defects: [
      {
        id: "D-003",
        type: "Shade variation",
        location: "Body panels",
        severity: "major",
        quantity: 4,
        notes: "Visible shade difference between panels",
      },
      {
        id: "D-004",
        type: "Dropped stitch",
        location: "Sleeve",
        severity: "critical",
        quantity: 2,
        notes: "Visible run on sleeve panel",
      },
      {
        id: "D-005",
        type: "Skip stitch",
        location: "Hem",
        severity: "minor",
        quantity: 3,
        notes: "",
      },
    ],
  },
};

/* ---------- Helpers ---------- */

const SEVERITY_BADGE: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border border-red-200",
  major: "bg-orange-100 text-orange-700 border border-orange-200",
  minor: "bg-yellow-100 text-yellow-700 border border-yellow-200",
};

const RESULT_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  pass: {
    label: "PASS",
    icon: <CheckCircle className="h-5 w-5" />,
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
  },
  fail: {
    label: "FAIL",
    icon: <AlertTriangle className="h-5 w-5" />,
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
  },
  pending: {
    label: "PENDING",
    icon: <Clock className="h-5 w-5" />,
    color: "text-yellow-700",
    bg: "bg-yellow-50 border-yellow-200",
  },
};

function aqlAcceptNumber(sampleSize: number): number {
  if (sampleSize <= 13) return 1;
  if (sampleSize <= 50) return 3;
  if (sampleSize <= 80) return 5;
  if (sampleSize <= 125) return 7;
  if (sampleSize <= 200) return 10;
  return 14;
}

/* ---------- Add Defect Form ---------- */

function AddDefectModal({ onClose }: { onClose: () => void }) {
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
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Location</label>
            <input
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Side seam"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Severity</label>
              <select className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
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
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              rows={2}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional notes..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Defect
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InspectionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const inspection = MOCK_INSPECTIONS[id] ?? MOCK_INSPECTIONS["INS-0041"];
  const resultCfg = RESULT_CONFIG[inspection.result];
  const acceptNumber = aqlAcceptNumber(inspection.sampleSize);
  const totalMajorCritical = inspection.defects
    .filter((d) => d.severity === "major" || d.severity === "critical")
    .reduce((sum, d) => sum + d.quantity, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Inspection ${inspection.id}`}
        breadcrumb={[
          { label: "Quality", href: "/quality" },
          { label: "Inspections", href: "/quality/inspections" },
          { label: inspection.id },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {inspection.result === "fail" && (
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
                { label: "Type", value: inspection.type },
                { label: "Order", value: inspection.order },
                { label: "Buyer", value: inspection.buyer },
                { label: "Line", value: inspection.line },
                { label: "Date", value: inspection.date },
                { label: "Inspector", value: inspection.inspector },
                { label: "Template", value: inspection.template },
                { label: "Lot Size", value: `${inspection.lotSize.toLocaleString()} pcs` },
                {
                  label: "Sample Size (AQL 2.5)",
                  value: `${inspection.sampleSize} pcs`,
                },
                {
                  label: "Pieces Checked",
                  value: `${inspection.piecesChecked} pcs`,
                },
                {
                  label: "Total Defects",
                  value: inspection.defects.reduce((s, d) => s + d.quantity, 0),
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
              {resultCfg.icon}
              {resultCfg.label}
            </div>

            <div className="w-full space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Sample Size</span>
                <span className="font-semibold">{inspection.sampleSize}</span>
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
              {inspection.defects.length} defect type(s) recorded
            </p>
          </div>
          <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Defect
          </Button>
        </div>
        <CardContent className="p-0">
          {inspection.defects.length === 0 ? (
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
                {inspection.defects.map((defect) => (
                  <TableRow key={defect.id} className="border-b border-gray-100">
                    <TableCell className="py-3 text-sm font-medium text-gray-900">
                      {defect.type}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-gray-600">{defect.location}</TableCell>
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
    </div>
  );
}
