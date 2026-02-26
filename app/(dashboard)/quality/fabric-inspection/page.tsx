"use client";

import * as React from "react";
import { Plus } from "lucide-react";
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

interface FabricRoll {
  id: string;
  rollNo: string;
  fabric: string;
  supplier: string;
  date: string;
  totalPoints: number;
  pointsPer100Sqyd: number;
  result: "pass" | "fail" | "pending";
}

interface FabricDefect {
  type: string;
  lengthInches: number;
  points: number;
}

/* ---------- 4-point scoring system ---------- */

function calcPoints(lengthInches: number): number {
  if (lengthInches <= 3) return 1;
  if (lengthInches <= 6) return 2;
  if (lengthInches <= 9) return 3;
  return 4;
}

/* ---------- Mock data ---------- */

const MOCK: FabricRoll[] = [
  {
    id: "FI-0023",
    rollNo: "R-2241",
    fabric: "100% Cotton Poplin 40s",
    supplier: "Arvind Textiles",
    date: "2026-02-26",
    totalPoints: 18,
    pointsPer100Sqyd: 22.4,
    result: "fail",
  },
  {
    id: "FI-0022",
    rollNo: "R-2240",
    fabric: "100% Cotton Poplin 40s",
    supplier: "Arvind Textiles",
    date: "2026-02-25",
    totalPoints: 12,
    pointsPer100Sqyd: 14.8,
    result: "pass",
  },
  {
    id: "FI-0021",
    rollNo: "R-2195",
    fabric: "Poly-Cotton 65/35 Twill",
    supplier: "Vardhman Fabrics",
    date: "2026-02-24",
    totalPoints: 8,
    pointsPer100Sqyd: 9.6,
    result: "pass",
  },
  {
    id: "FI-0020",
    rollNo: "R-2194",
    fabric: "Poly-Cotton 65/35 Twill",
    supplier: "Vardhman Fabrics",
    date: "2026-02-24",
    totalPoints: 24,
    pointsPer100Sqyd: 28.1,
    result: "fail",
  },
  {
    id: "FI-0019",
    rollNo: "R-2180",
    fabric: "Viscose Crepe",
    supplier: "Indo Count",
    date: "2026-02-23",
    totalPoints: 6,
    pointsPer100Sqyd: 7.2,
    result: "pass",
  },
  {
    id: "FI-0018",
    rollNo: "R-2179",
    fabric: "Viscose Crepe",
    supplier: "Indo Count",
    date: "2026-02-22",
    totalPoints: 0,
    pointsPer100Sqyd: 0,
    result: "pending",
  },
];

const RESULT_BADGE: Record<string, string> = {
  pass: "bg-green-100 text-green-700 border border-green-200",
  fail: "bg-red-100 text-red-700 border border-red-200",
  pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
};

/* ---------- Columns ---------- */

function buildColumns(): ColumnDef<FabricRoll>[] {
  return [
    {
      accessorKey: "id",
      header: "Inspection #",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">{row.original.id}</span>
      ),
    },
    { accessorKey: "rollNo", header: "Roll #" },
    { accessorKey: "fabric", header: "Fabric" },
    { accessorKey: "supplier", header: "Supplier" },
    { accessorKey: "date", header: "Date" },
    {
      accessorKey: "totalPoints",
      header: "Total Points",
      cell: ({ row }) => (
        <span
          className={
            row.original.totalPoints > 20 ? "font-semibold text-red-600" : "text-gray-700"
          }
        >
          {row.original.totalPoints}
        </span>
      ),
    },
    {
      accessorKey: "pointsPer100Sqyd",
      header: "Points / 100 sq yd",
      cell: ({ row }) => {
        const v = row.original.pointsPer100Sqyd;
        return (
          <span className={v > 28 ? "font-semibold text-red-600" : "text-gray-700"}>
            {v > 0 ? v.toFixed(1) : "—"}
          </span>
        );
      },
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

/* ---------- Defect row in form ---------- */

function DefectRow({
  index,
  defect,
  onChange,
  onRemove,
}: {
  index: number;
  defect: FabricDefect;
  onChange: (d: FabricDefect) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-12 gap-2 items-end">
      <div className="col-span-5 space-y-1">
        {index === 0 && <Label className="text-xs text-gray-500">Defect Type</Label>}
        <Input
          placeholder="e.g. Warp break"
          value={defect.type}
          onChange={(e) => onChange({ ...defect, type: e.target.value })}
        />
      </div>
      <div className="col-span-3 space-y-1">
        {index === 0 && <Label className="text-xs text-gray-500">Length (in)</Label>}
        <Input
          type="number"
          placeholder="0"
          value={defect.lengthInches || ""}
          onChange={(e) => {
            const len = Number(e.target.value);
            onChange({ ...defect, lengthInches: len, points: calcPoints(len) });
          }}
        />
      </div>
      <div className="col-span-2 space-y-1">
        {index === 0 && <Label className="text-xs text-gray-500">Points</Label>}
        <div className="flex h-9 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700">
          {defect.lengthInches > 0 ? defect.points : "—"}
        </div>
      </div>
      <div className="col-span-2 flex items-end">
        <button
          onClick={onRemove}
          className="h-9 w-full rounded-md border border-gray-200 text-xs text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

/* ---------- New Fabric Inspection Form ---------- */

function NewFabricInspectionForm() {
  const [defects, setDefects] = React.useState<FabricDefect[]>([
    { type: "", lengthInches: 0, points: 0 },
  ]);
  const [rollLength, setRollLength] = React.useState<number>(0);
  const [rollWidth, setRollWidth] = React.useState<number>(0);

  const totalPoints = defects.reduce((s, d) => s + d.points, 0);
  const sqYards = rollLength > 0 && rollWidth > 0 ? (rollLength * rollWidth) / 36 : 0;
  const pointsPer100Sqyd = sqYards > 0 ? (totalPoints / sqYards) * 100 : 0;

  const addDefect = () => setDefects((prev) => [...prev, { type: "", lengthInches: 0, points: 0 }]);
  const removeDefect = (i: number) => setDefects((prev) => prev.filter((_, idx) => idx !== i));
  const updateDefect = (i: number, d: FabricDefect) =>
    setDefects((prev) => prev.map((x, idx) => (idx === i ? d : x)));

  const result =
    pointsPer100Sqyd === 0 ? "—" : pointsPer100Sqyd <= 28 ? "Pass" : "Fail";
  const resultColor =
    result === "Pass" ? "text-green-700" : result === "Fail" ? "text-red-700" : "text-gray-500";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label>Roll #</Label>
          <Input placeholder="R-XXXX" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Fabric</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select fabric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="poplin">100% Cotton Poplin 40s</SelectItem>
              <SelectItem value="twill">Poly-Cotton 65/35 Twill</SelectItem>
              <SelectItem value="viscose">Viscose Crepe</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Supplier</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="arvind">Arvind Textiles</SelectItem>
              <SelectItem value="vardhman">Vardhman Fabrics</SelectItem>
              <SelectItem value="indo">Indo Count</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Roll Length (yards)</Label>
          <Input
            type="number"
            placeholder="0"
            value={rollLength || ""}
            onChange={(e) => setRollLength(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Roll Width (inches)</Label>
          <Input
            type="number"
            placeholder="0"
            value={rollWidth || ""}
            onChange={(e) => setRollWidth(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Inspector</Label>
          <Input placeholder="Inspector name" />
        </div>
        <div className="space-y-1.5">
          <Label>Date</Label>
          <Input type="date" />
        </div>
      </div>

      {/* Defect log */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Defect Log (4-Point System)</Label>
          <button
            onClick={addDefect}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
          >
            <Plus className="h-3 w-3" /> Add Defect
          </button>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
          {defects.map((defect, i) => (
            <DefectRow
              key={i}
              index={i}
              defect={defect}
              onChange={(d) => updateDefect(i, d)}
              onRemove={() => removeDefect(i)}
            />
          ))}
        </div>
        <div className="text-xs text-gray-500">
          Scoring: &le;3&quot; = 1pt &nbsp;|&nbsp; &le;6&quot; = 2pts &nbsp;|&nbsp; &le;9&quot; = 3pts &nbsp;|&nbsp; &gt;9&quot; = 4pts &nbsp;(max 4pts per defect)
        </div>
      </div>

      {/* Calculated results */}
      {(totalPoints > 0 || sqYards > 0) && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2 text-sm">
          <p className="font-semibold text-gray-800">Calculated Results</p>
          <div className="flex justify-between text-gray-600">
            <span>Total Points</span>
            <span className="font-semibold text-gray-900">{totalPoints}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Roll Area (sq yd)</span>
            <span className="font-semibold text-gray-900">{sqYards.toFixed(1)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-2 text-gray-600">
            <span>Points / 100 sq yd</span>
            <span className="font-semibold text-gray-900">{pointsPer100Sqyd.toFixed(1)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-2">
            <span className="font-semibold text-gray-600">Result (threshold: 28)</span>
            <span className={`font-bold ${resultColor}`}>{result}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Page ---------- */

export default function FabricInspectionPage() {
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const columns = buildColumns();

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fabric Inspection"
        description="4-point system fabric inspection log for incoming rolls."
        breadcrumb={[
          { label: "Quality", href: "/quality" },
          { label: "Fabric Inspection" },
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
        searchKey="rollNo"
        searchPlaceholder="Search by roll number..."
        filters={[
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
        emptyMessage="No fabric inspections recorded yet."
        actions={
          <Button onClick={() => setOpen(true)} size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            New Inspection
          </Button>
        }
      />

      <FormSheet
        title="New Fabric Inspection"
        description="Log a 4-point system fabric roll inspection."
        open={open}
        onOpenChange={setOpen}
        onSave={handleSave}
        saving={saving}
        saveLabel="Save Inspection"
        size="md"
      >
        <NewFabricInspectionForm />
      </FormSheet>
    </div>
  );
}
