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
import { useCompany } from "@/contexts/company-context";
import {
  getCuttingEntries,
  createCuttingEntry,
  getWorkOrdersForDropdown,
} from "@/lib/actions/production";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CuttingEntry = {
  id: string;
  date: string;
  workOrder: string;
  workOrderId: string;
  cutQty: number;
  fabricConsumed: number;
  plannedConsumption: number;
  wastagePercent: number;
  bundles: number;
  enteredBy: string;
};

type WOOption = {
  id: string;
  wo_number: string;
  product_name: string;
  total_quantity: number;
};

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
  const { companyId, userId } = useCompany();
  const [entries, setEntries] = React.useState<CuttingEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Dropdown data
  const [workOrderOptions, setWorkOrderOptions] = React.useState<WOOption[]>([]);

  const [form, setForm] = React.useState({
    workOrderId: "",
    workOrderLabel: "",
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

  const fetchEntries = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await getCuttingEntries(companyId);
    if (error) {
      toast.error("Failed to load cutting entries: " + error);
    } else if (data) {
      const mapped: CuttingEntry[] = data.map((entry: Record<string, unknown>) => {
        const wo = entry.work_orders as Record<string, unknown> | null;
        const profile = entry.profiles as Record<string, unknown> | null;
        return {
          id: entry.id as string,
          date: entry.entry_date as string,
          workOrder: wo?.wo_number as string ?? "-",
          workOrderId: entry.work_order_id as string,
          cutQty: (entry.total_cut_qty as number) || 0,
          fabricConsumed: Number(entry.fabric_consumed) || 0,
          plannedConsumption: Number(entry.planned_consumption) || 0,
          wastagePercent: Number(entry.wastage_percent) || 0,
          bundles: (entry.bundles_created as number) || 0,
          enteredBy: (profile?.full_name as string) || "-",
        };
      });
      setEntries(mapped);
    }
    setLoading(false);
  }, [companyId]);

  const fetchDropdownData = React.useCallback(async () => {
    const { data } = await getWorkOrdersForDropdown(companyId);
    if (data) {
      setWorkOrderOptions(data as WOOption[]);
    }
  }, [companyId]);

  React.useEffect(() => {
    fetchEntries();
    fetchDropdownData();
  }, [fetchEntries, fetchDropdownData]);

  const handleSave = async () => {
    if (!form.workOrderId || !form.totalCutQty) {
      toast.error("Please fill work order and cut quantity.");
      return;
    }
    setSaving(true);

    // Parse size breakdown if provided
    let sizeBreakdown = {};
    if (form.sizeBreakdown.trim()) {
      try {
        const pairs = form.sizeBreakdown.split(",").map((p) => p.trim());
        sizeBreakdown = Object.fromEntries(
          pairs.map((p) => {
            const [size, qty] = p.split(":").map((s) => s.trim());
            return [size, parseInt(qty) || 0];
          })
        );
      } catch {
        // Ignore parse errors, use empty object
      }
    }

    const { error } = await createCuttingEntry({
      company_id: companyId,
      work_order_id: form.workOrderId,
      entry_date: form.date,
      marker_length: null,
      marker_efficiency: null,
      layers: null,
      fabric_rolls_used: null,
      fabric_consumed: fabricConsumed,
      planned_consumption: plannedConsumption > 0 ? plannedConsumption : null,
      total_cut_qty: parseInt(form.totalCutQty) || 0,
      bundles_created: parseInt(form.bundles) || 0,
      size_breakdown: sizeBreakdown,
      entered_by: userId,
    });

    if (error) {
      toast.error("Failed to save cutting entry: " + error);
    } else {
      toast.success("Cutting entry saved.");
      setSheetOpen(false);
      setForm({
        workOrderId: "",
        workOrderLabel: "",
        date: new Date().toISOString().split("T")[0],
        fabricConsumed: "",
        plannedConsumption: "",
        totalCutQty: "",
        bundles: "",
        sizeBreakdown: "",
      });
      fetchEntries();
    }
    setSaving(false);
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
        loading={loading}
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
              value={form.workOrderId}
              onValueChange={(v) => {
                const wo = workOrderOptions.find((w) => w.id === v);
                setForm((prev) => ({
                  ...prev,
                  workOrderId: v,
                  workOrderLabel: wo?.wo_number || "",
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select work order..." />
              </SelectTrigger>
              <SelectContent>
                {workOrderOptions.map((wo) => (
                  <SelectItem key={wo.id} value={wo.id}>
                    {wo.wo_number} - {wo.product_name}
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
