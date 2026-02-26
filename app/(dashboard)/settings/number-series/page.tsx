"use client";

import * as React from "react";
import { Save, RotateCcw, Info } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type NumberSeriesRow = {
  id: string;
  docType: string;
  docTypeFull: string;
  prefix: string;
  separator: string;
  includeYear: boolean;
  sequence: number;
  preview: string;
};

const INITIAL_SERIES: NumberSeriesRow[] = [
  { id: "so", docType: "SO", docTypeFull: "Sales Order", prefix: "SO", separator: "-", includeYear: true, sequence: 22, preview: "SO-2026-0022" },
  { id: "inq", docType: "INQ", docTypeFull: "Inquiry", prefix: "INQ", separator: "-", includeYear: true, sequence: 15, preview: "INQ-2026-0015" },
  { id: "smp", docType: "SMP", docTypeFull: "Sample Request", prefix: "SMP", separator: "-", includeYear: true, sequence: 48, preview: "SMP-2026-0048" },
  { id: "ld", docType: "LD", docTypeFull: "Lab Dip", prefix: "LD", separator: "-", includeYear: true, sequence: 31, preview: "LD-2026-0031" },
  { id: "cs", docType: "CS", docTypeFull: "Cost Sheet", prefix: "CS", separator: "-", includeYear: true, sequence: 19, preview: "CS-2026-0019" },
  { id: "wo", docType: "WO", docTypeFull: "Work Order", prefix: "WO", separator: "-", includeYear: true, sequence: 57, preview: "WO-2026-0057" },
  { id: "po", docType: "PO", docTypeFull: "Purchase Order", prefix: "PO", separator: "-", includeYear: true, sequence: 44, preview: "PO-2026-0044" },
  { id: "grn", docType: "GRN", docTypeFull: "Goods Receipt Note", prefix: "GRN", separator: "-", includeYear: true, sequence: 38, preview: "GRN-2026-0038" },
  { id: "tna", docType: "TNA", docTypeFull: "TNA Plan", prefix: "TNA", separator: "-", includeYear: true, sequence: 12, preview: "TNA-2026-0012" },
  { id: "bom", docType: "BOM", docTypeFull: "Bill of Materials", prefix: "BOM", separator: "-", includeYear: true, sequence: 25, preview: "BOM-2026-0025" },
  { id: "qc", docType: "QC", docTypeFull: "Quality Inspection", prefix: "QC", separator: "-", includeYear: true, sequence: 83, preview: "QC-2026-0083" },
  { id: "shp", docType: "SHP", docTypeFull: "Shipment", prefix: "SHP", separator: "-", includeYear: true, sequence: 9, preview: "SHP-2026-0009" },
  { id: "dye", docType: "DYE", docTypeFull: "Dyeing Batch", prefix: "DYE", separator: "-", includeYear: true, sequence: 33, preview: "DYE-2026-0033" },
  { id: "mrp", docType: "MRP", docTypeFull: "MRP Run", prefix: "MRP", separator: "-", includeYear: true, sequence: 7, preview: "MRP-2026-0007" },
];

function buildPreview(prefix: string, separator: string, includeYear: boolean, sequence: number): string {
  const year = new Date().getFullYear();
  const seq = String(sequence).padStart(4, "0");
  if (includeYear) {
    return `${prefix}${separator}${year}${separator}${seq}`;
  }
  return `${prefix}${separator}${seq}`;
}

export default function NumberSeriesPage() {
  const [series, setSeries] = React.useState<NumberSeriesRow[]>(INITIAL_SERIES);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);

  const updateRow = (id: string, field: keyof NumberSeriesRow, value: string | number | boolean) => {
    setSeries((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const updated = { ...row, [field]: value };
        updated.preview = buildPreview(
          updated.prefix,
          updated.separator,
          updated.includeYear,
          updated.sequence
        );
        return updated;
      })
    );
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    setDirty(false);
    toast.success("Number series saved successfully.");
  };

  const handleReset = () => {
    setSeries(INITIAL_SERIES);
    setDirty(false);
    setEditingId(null);
    toast.info("Number series reset to saved values.");
  };

  return (
    <div>
      <PageHeader
        title="Number Series"
        description="Configure document number prefixes and sequences. Changes take effect on the next generated document."
        breadcrumb={[
          { label: "Settings", href: "/settings" },
          { label: "Number Series" },
        ]}
        actions={
          <div className="flex gap-2">
            {dirty && (
              <Button variant="outline" onClick={handleReset} size="sm">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving || !dirty} size="sm">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        }
      />

      {/* Info banner */}
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
        <p className="text-sm text-blue-700">
          Click any row to edit its prefix or sequence. The preview shows the next generated number.
          Changing a sequence does not reset existing documents.
        </p>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Document Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Prefix
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Separator
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Include Year
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Next Sequence
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Preview
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {series.map((row) => {
                const isEditing = editingId === row.id;

                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "transition-colors",
                      isEditing
                        ? "bg-blue-50/50"
                        : "hover:bg-gray-50 cursor-pointer"
                    )}
                    onClick={() => !isEditing && setEditingId(row.id)}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-sm font-semibold text-gray-900">
                          {row.docType}
                        </span>
                        <p className="text-xs text-gray-500">{row.docTypeFull}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <Input
                          value={row.prefix}
                          onChange={(e) =>
                            updateRow(row.id, "prefix", e.target.value.toUpperCase())
                          }
                          className="h-8 w-24 text-xs font-mono"
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      ) : (
                        <span className="font-mono text-sm text-gray-700">
                          {row.prefix}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <Input
                          value={row.separator}
                          onChange={(e) =>
                            updateRow(row.id, "separator", e.target.value)
                          }
                          className="h-8 w-16 text-xs font-mono"
                          maxLength={2}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="font-mono text-sm text-gray-700">
                          {row.separator}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={row.includeYear}
                          onChange={(e) =>
                            updateRow(row.id, "includeYear", e.target.checked)
                          }
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 accent-blue-600"
                          disabled={!isEditing}
                        />
                        <span className="text-sm text-gray-600">
                          {row.includeYear ? "Yes" : "No"}
                        </span>
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={row.sequence}
                          onChange={(e) =>
                            updateRow(row.id, "sequence", parseInt(e.target.value) || 1)
                          }
                          className="h-8 w-24 text-xs tabular-nums"
                          min={1}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="tabular-nums text-sm text-gray-700">
                          {row.sequence}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-800">
                          {row.preview}
                        </code>
                        {isEditing && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(null);
                            }}
                            className="text-xs font-medium text-blue-600 hover:underline"
                          >
                            Done
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
