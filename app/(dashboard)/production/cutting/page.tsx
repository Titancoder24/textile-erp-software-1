"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Scissors } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/data-table/data-table";
import { FormSheet } from "@/components/forms/form-sheet";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types & Data
// ---------------------------------------------------------------------------

type CuttingEntry = {
  id: string;
  date: string;
  workOrder: string;
  cutQty: number;
  fabricConsumed: number;
  plannedConsumption: number;
  wastagePercent: number;
  bundles: number;
  enteredBy: string;
};

const DEMO_ENTRIES: CuttingEntry[] = [
  { id: "1", date: "2026-02-26", workOrder: "WO-2026-0051", cutQty: 450, fabricConsumed: 620, plannedConsumption: 600, wastagePercent: 3.3, bundles: 18, enteredBy: "Anand S." },
  { id: "2", date: "2026-02-26", workOrder: "WO-2026-0053", cutQty: 800, fabricConsumed: 920, plannedConsumption: 900, wastagePercent: 2.2, bundles: 32, enteredBy: "Ravi K." },
  { id: "3", date: "2026-02-25", workOrder: "WO-2026-0054", cutQty: 300, fabricConsumed: 480, plannedConsumption: 450, wastagePercent: 6.7, bundles: 12, enteredBy: "Anand S." },
  { id: "4", date: "2026-02-25", workOrder: "WO-2026-0052", cutQty: 500, fabricConsumed: 550, plannedConsumption: 540, wastagePercent: 1.9, bundles: 20, enteredBy: "Meena P." },
  { id: "5", date: "2026-02-24", workOrder: "WO-2026-0057", cutQty: 600, fabricConsumed: 700, plannedConsumption: 690, wastagePercent: 1.4, bundles: 24, enteredBy: "Ravi K." },
  { id: "6", date: "2026-02-24", workOrder: "WO-2026-0055", cutQty: 250, fabricConsumed: 410, plannedConsumption: 400, wastagePercent: 2.5, bundles: 10, enteredBy: "Anand S." },
  { id: "7", date: "2026-02-23", workOrder: "WO-2026-0051", cutQty: 500, fabricConsumed: 680, plannedConsumption: 660, wastagePercent: 3.0, bundles: 20, enteredBy: "Meena P." },
];

const WORK_ORDERS = [
  "WO-2026-0051",
  "WO-2026-0052",
  "WO-2026-0053",
  "WO-2026-0054",
  "WO-2026-0055",
  "WO-2026-0056",
  "WO-2026-0057",
  "WO-2026-0058",
];

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

const columns: ColumnDef<CuttingEntry>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-sm text-gray-700">{row.original.date}</span>
    ),
  },
  {
    accessorKey: "workOrder",
    header: "Work Order",
    cell: ({ row }) => (
      <span className="font-medium text-blue-600">{row.original.workOrder}</span>
    ),
  },
  {
    accessorKey: "cutQty",
    header: "Cut Qty",
    cell: ({ row }) => (
      <span className="font-semibold tabular-nums">
        {row.original.cutQty.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "fabricConsumed",
    header: "Fabric (m)",
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.fabricConsumed}</span>
    ),
  },
  {
    accessorKey: "wastagePercent",
    header: "Wastage %",
    cell: ({ row }) => {
      const w = row.original.wastagePercent;
      return (
        <span
          className={cn(
            "tabular-nums font-medium",
            w > 5 ? "text-red-600" : w > 3 ? "text-yellow-600" : "text-green-600"
          )}
        >
          {w.toFixed(1)}%
        </span>
      );
    },
  },
  {
    accessorKey: "bundles",
    header: "Bundles",
    cell: ({ row }) => row.original.bundles,
  },
  {
    accessorKey: "enteredBy",
    header: "Entered By",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">{row.original.enteredBy}</span>
    ),
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CuttingPage() {
  const [entries, setEntries] = React.useState(DEMO_ENTRIES);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [form, setForm] = React.useState({
    workOrder: "",
    date: new Date().toISOString().split("T")[0],
    fabricConsumed: "",
    plannedConsumption: "",
    totalCutQty: "",
    bundles: "",
    sizeBreakdown: "",
  });

  const fabricConsumed = parseFloat(form.fabricConsumed) || 0;
  const plannedConsumption = parseFloat(form.plannedConsumption) || 0;
  const wastagePercent =
    plannedConsumption > 0
      ? Math.round(((fabricConsumed - plannedConsumption) / plannedConsumption) * 100 * 10) / 10
      : 0;

  const handleSave = async () => {
    if (!form.workOrder || !form.totalCutQty) {
      toast.error("Please fill work order and cut quantity.");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));

    const newEntry: CuttingEntry = {
      id: String(Date.now()),
      date: form.date,
      workOrder: form.workOrder,
      cutQty: parseInt(form.totalCutQty) || 0,
      fabricConsumed,
      plannedConsumption,
      wastagePercent: Math.max(0, wastagePercent),
      bundles: parseInt(form.bundles) || 0,
      enteredBy: "Current User",
    };

    setEntries((prev) => [newEntry, ...prev]);
    setSaving(false);
    setSheetOpen(false);
    setForm({
      workOrder: "",
      date: new Date().toISOString().split("T")[0],
      fabricConsumed: "",
      plannedConsumption: "",
      totalCutQty: "",
      bundles: "",
      sizeBreakdown: "",
    });
    toast.success("Cutting entry saved.");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Cutting"
        description="Cutting entries, fabric consumption tracking, and wastage analysis."
        breadcrumb={[
          { label: "Production", href: "/production" },
          { label: "Cutting" },
        ]}
      />

      <DataTable
        columns={columns}
        data={entries}
        searchKey="workOrder"
        searchPlaceholder="Search by work order..."
        actions={
          <Button onClick={() => setSheetOpen(true)} size="sm">
            <Plus className="h-4 w-4" />
            New Entry
          </Button>
        }
      />

      <FormSheet
        title="New Cutting Entry"
        description="Record cutting data with fabric consumption details."
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSave={handleSave}
        saving={saving}
        saveLabel="Save Entry"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>
              Work Order <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.workOrder}
              onValueChange={(v) =>
                setForm((prev) => ({ ...prev, workOrder: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select work order..." />
              </SelectTrigger>
              <SelectContent>
                {WORK_ORDERS.map((wo) => (
                  <SelectItem key={wo} value={wo}>
                    {wo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, date: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Fabric Consumed (m)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={form.fabricConsumed}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, fabricConsumed: e.target.value }))
                }
                placeholder="e.g. 620"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Planned Consumption (m)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={form.plannedConsumption}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    plannedConsumption: e.target.value,
                  }))
                }
                placeholder="e.g. 600"
              />
            </div>
          </div>

          {fabricConsumed > 0 && plannedConsumption > 0 && (
            <div
              className={cn(
                "rounded-lg border p-3 text-sm",
                wastagePercent > 5
                  ? "border-red-200 bg-red-50 text-red-700"
                  : wastagePercent > 3
                  ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                  : "border-green-200 bg-green-50 text-green-700"
              )}
            >
              <Scissors className="inline h-4 w-4 mr-1" />
              Wastage: <span className="font-bold">{wastagePercent.toFixed(1)}%</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Size Breakdown (optional)</Label>
            <Input
              value={form.sizeBreakdown}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, sizeBreakdown: e.target.value }))
              }
              placeholder='e.g. S:100, M:200, L:150'
            />
            <p className="text-xs text-gray-400">
              Comma-separated size:quantity pairs
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>
                Total Cut Qty <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min="0"
                value={form.totalCutQty}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, totalCutQty: e.target.value }))
                }
                placeholder="e.g. 450"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Bundles Created</Label>
              <Input
                type="number"
                min="0"
                value={form.bundles}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, bundles: e.target.value }))
                }
                placeholder="e.g. 18"
              />
            </div>
          </div>
        </div>
      </FormSheet>
    </div>
  );
}
