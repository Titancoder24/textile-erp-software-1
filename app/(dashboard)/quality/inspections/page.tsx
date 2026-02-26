"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, ClipboardList } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { FormSheet } from "@/components/forms/form-sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ---------- Types ---------- */

interface Inspection {
  id: string;
  type: string;
  order: string;
  line: string;
  date: string;
  inspector: string;
  lotSize: number;
  sampleSize: number;
  totalDefects: number;
  result: "pass" | "fail" | "pending";
}

/* ---------- AQL Sample size table (Level II, 2.5) ---------- */

function calcSampleSize(lotSize: number): number {
  if (lotSize <= 150) return 13;
  if (lotSize <= 500) return 50;
  if (lotSize <= 1200) return 80;
  if (lotSize <= 3200) return 125;
  if (lotSize <= 10000) return 200;
  return 315;
}

/* ---------- Mock data ---------- */

const MOCK: Inspection[] = [
  {
    id: "INS-0041",
    type: "final",
    order: "ORD-2401",
    line: "Line 3",
    date: "2026-02-26",
    inspector: "Amira Khan",
    lotSize: 1200,
    sampleSize: 80,
    totalDefects: 2,
    result: "pass",
  },
  {
    id: "INS-0040",
    type: "inline",
    order: "ORD-2398",
    line: "Line 1",
    date: "2026-02-25",
    inspector: "Rashid Ali",
    lotSize: 800,
    sampleSize: 80,
    totalDefects: 6,
    result: "fail",
  },
  {
    id: "INS-0039",
    type: "endline",
    order: "ORD-2401",
    line: "Line 2",
    date: "2026-02-25",
    inspector: "Priya Nair",
    lotSize: 500,
    sampleSize: 50,
    totalDefects: 1,
    result: "pass",
  },
  {
    id: "INS-0038",
    type: "pre_final",
    order: "ORD-2395",
    line: "Line 4",
    date: "2026-02-24",
    inspector: "Amira Khan",
    lotSize: 2000,
    sampleSize: 125,
    totalDefects: 0,
    result: "pending",
  },
  {
    id: "INS-0037",
    type: "final",
    order: "ORD-2390",
    line: "Line 1",
    date: "2026-02-24",
    inspector: "Rashid Ali",
    lotSize: 3200,
    sampleSize: 125,
    totalDefects: 3,
    result: "pass",
  },
];

const TYPE_LABELS: Record<string, string> = {
  incoming: "Incoming",
  inline: "Inline",
  endline: "End-Line",
  pre_final: "Pre-Final",
  final: "Final",
};

const TYPE_BADGE_COLOR: Record<string, string> = {
  incoming: "bg-gray-100 text-gray-700",
  inline: "bg-blue-100 text-blue-700",
  endline: "bg-indigo-100 text-indigo-700",
  pre_final: "bg-orange-100 text-orange-700",
  final: "bg-purple-100 text-purple-700",
};

const RESULT_BADGE: Record<string, string> = {
  pass: "bg-green-100 text-green-700 border border-green-200",
  fail: "bg-red-100 text-red-700 border border-red-200",
  pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
};

/* ---------- Columns ---------- */

function buildColumns(onView: (id: string) => void): ColumnDef<Inspection>[] {
  return [
    {
      accessorKey: "id",
      header: "Inspection #",
      cell: ({ row }) => (
        <button
          onClick={() => onView(row.original.id)}
          className="font-medium text-blue-600 hover:underline text-left"
        >
          {row.original.id}
        </button>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${TYPE_BADGE_COLOR[row.original.type] ?? "bg-gray-100 text-gray-700"}`}
        >
          {TYPE_LABELS[row.original.type] ?? row.original.type}
        </span>
      ),
    },
    { accessorKey: "order", header: "Order" },
    { accessorKey: "line", header: "Line" },
    { accessorKey: "date", header: "Date" },
    { accessorKey: "inspector", header: "Inspector" },
    {
      accessorKey: "lotSize",
      header: "Lot Size",
      cell: ({ row }) => row.original.lotSize.toLocaleString(),
    },
    {
      accessorKey: "sampleSize",
      header: "Sample Size",
      cell: ({ row }) => row.original.sampleSize.toLocaleString(),
    },
    {
      accessorKey: "totalDefects",
      header: "Total Defects",
      cell: ({ row }) => (
        <span className={row.original.totalDefects > 3 ? "font-semibold text-red-600" : ""}>
          {row.original.totalDefects}
        </span>
      ),
    },
    {
      accessorKey: "result",
      header: "Result",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold capitalize ${RESULT_BADGE[row.original.result]}`}
        >
          {row.original.result}
        </span>
      ),
    },
  ];
}

/* ---------- New Inspection Form ---------- */

function NewInspectionForm({ onClose }: { onClose: () => void }) {
  const [lotSize, setLotSize] = React.useState<number>(0);
  const sampleSize = calcSampleSize(lotSize);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="insp-type">Inspection Type</Label>
          <Select>
            <SelectTrigger id="insp-type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="incoming">Incoming</SelectItem>
              <SelectItem value="inline">Inline</SelectItem>
              <SelectItem value="endline">End-Line</SelectItem>
              <SelectItem value="pre_final">Pre-Final</SelectItem>
              <SelectItem value="final">Final</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="insp-order">Order #</Label>
          <Input id="insp-order" placeholder="ORD-2401" />
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="insp-template">Inspection Template</Label>
          <Select>
            <SelectTrigger id="insp-template">
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard_garment">Standard Garment</SelectItem>
              <SelectItem value="knit">Knitwear</SelectItem>
              <SelectItem value="woven">Woven Tops</SelectItem>
              <SelectItem value="bottoms">Bottoms / Trousers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="insp-inspector">Inspector</Label>
          <Input id="insp-inspector" placeholder="Inspector name" />
        </div>

        <div className="col-span-1 space-y-1.5">
          <Label htmlFor="insp-line">Production Line</Label>
          <Select>
            <SelectTrigger id="insp-line">
              <SelectValue placeholder="Select line" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line1">Line 1</SelectItem>
              <SelectItem value="line2">Line 2</SelectItem>
              <SelectItem value="line3">Line 3</SelectItem>
              <SelectItem value="line4">Line 4</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-1 space-y-1.5">
          <Label htmlFor="insp-date">Date</Label>
          <Input id="insp-date" type="date" />
        </div>

        <div className="col-span-1 space-y-1.5">
          <Label htmlFor="insp-lot">Lot Size (pcs)</Label>
          <Input
            id="insp-lot"
            type="number"
            placeholder="1200"
            value={lotSize || ""}
            onChange={(e) => setLotSize(Number(e.target.value))}
          />
        </div>

        <div className="col-span-1 space-y-1.5">
          <Label htmlFor="insp-sample">Sample Size (AQL 2.5)</Label>
          <div className="flex h-9 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700">
            {lotSize > 0 ? sampleSize : "—"}
          </div>
          {lotSize > 0 && (
            <p className="text-xs text-gray-500">Auto-calculated from AQL Level II table</p>
          )}
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="insp-pieces">Pieces Checked</Label>
          <Input id="insp-pieces" type="number" placeholder="0" />
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="insp-notes">Notes</Label>
          <textarea
            id="insp-notes"
            rows={3}
            placeholder="Any additional notes..."
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

export default function InspectionsPage() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const columns = buildColumns((id) => router.push(`/quality/inspections/${id}`));

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inspections"
        description="Manage garment quality inspections across all production lines."
        breadcrumb={[
          { label: "Quality", href: "/quality" },
          { label: "Inspections" },
        ]}
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Inspection
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={MOCK}
        searchKey="order"
        searchPlaceholder="Search by order..."
        filters={[
          {
            key: "type",
            label: "Type",
            options: Object.entries(TYPE_LABELS).map(([v, l]) => ({ value: v, label: l })),
          },
          {
            key: "result",
            label: "Result",
            options: [
              { value: "pass", label: "Pass" },
              { value: "fail", label: "Fail" },
              { value: "pending", label: "Pending" },
            ],
          },
        ]}
        onRowClick={(row) => router.push(`/quality/inspections/${row.id}`)}
        emptyMessage="No inspections recorded yet."
        actions={
          <Button onClick={() => setOpen(true)} size="sm" variant="outline">
            <ClipboardList className="mr-2 h-4 w-4" />
            New Inspection
          </Button>
        }
      />

      <FormSheet
        title="New Inspection"
        description="Record a new garment quality inspection."
        open={open}
        onOpenChange={setOpen}
        onSave={handleSave}
        saving={saving}
        saveLabel="Create Inspection"
        size="md"
      >
        <NewInspectionForm onClose={() => setOpen(false)} />
      </FormSheet>
    </div>
  );
}
