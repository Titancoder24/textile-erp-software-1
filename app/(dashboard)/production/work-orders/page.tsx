"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Calendar } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
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
import { StatusBadge } from "@/components/ui/status-badge";

// ---------------------------------------------------------------------------
// Types & Data
// ---------------------------------------------------------------------------

type WorkOrder = {
  id: string;
  woNumber: string;
  orderNumber: string;
  product: string;
  totalQty: number;
  produced: number;
  defective: number;
  status: string;
  percentComplete: number;
  line: string;
  startDate: string;
  endDate: string;
};

const WO_STATUS_MAP: Record<string, { label: string; color: string }> = {
  not_started: { label: "Not Started", color: "gray" },
  in_progress: { label: "In Progress", color: "blue" },
  completed: { label: "Completed", color: "green" },
  on_hold: { label: "On Hold", color: "yellow" },
  cancelled: { label: "Cancelled", color: "red" },
};

const DEMO_WORK_ORDERS: WorkOrder[] = [
  { id: "1", woNumber: "WO-2026-0051", orderNumber: "ORD-2401", product: "Classic Polo Shirt", totalQty: 10000, produced: 6200, defective: 80, status: "in_progress", percentComplete: 62, line: "Line 1", startDate: "2026-02-15", endDate: "2026-03-15" },
  { id: "2", woNumber: "WO-2026-0052", orderNumber: "ORD-2398", product: "Linen Blouse", totalQty: 6000, produced: 3900, defective: 120, status: "in_progress", percentComplete: 65, line: "Line 2", startDate: "2026-02-18", endDate: "2026-03-18" },
  { id: "3", woNumber: "WO-2026-0053", orderNumber: "ORD-2395", product: "Kids T-Shirt Set", totalQty: 12000, produced: 9840, defective: 50, status: "in_progress", percentComplete: 82, line: "Line 3", startDate: "2026-02-10", endDate: "2026-03-10" },
  { id: "4", woNumber: "WO-2026-0054", orderNumber: "ORD-2402", product: "Slim Fit Jeans", totalQty: 4000, produced: 2200, defective: 180, status: "in_progress", percentComplete: 55, line: "Line 4", startDate: "2026-02-20", endDate: "2026-03-20" },
  { id: "5", woNumber: "WO-2026-0055", orderNumber: "ORD-2400", product: "Quilted Jacket", totalQty: 3000, produced: 2130, defective: 60, status: "in_progress", percentComplete: 71, line: "Line 5", startDate: "2026-02-12", endDate: "2026-03-12" },
  { id: "6", woNumber: "WO-2026-0056", orderNumber: "ORD-2403", product: "Crew Neck Sweater", totalQty: 5000, produced: 600, defective: 220, status: "on_hold", percentComplete: 12, line: "Line 6", startDate: "2026-02-22", endDate: "2026-03-22" },
  { id: "7", woNumber: "WO-2026-0057", orderNumber: "ORD-2399", product: "Chino Trousers", totalQty: 7000, produced: 6160, defective: 30, status: "in_progress", percentComplete: 88, line: "Line 7", startDate: "2026-02-08", endDate: "2026-03-08" },
  { id: "8", woNumber: "WO-2026-0058", orderNumber: "ORD-2404", product: "Dry-Fit T-Shirt", totalQty: 9000, produced: 2100, defective: 150, status: "in_progress", percentComplete: 23, line: "Line 8", startDate: "2026-02-25", endDate: "2026-03-25" },
];

const ORDERS_FOR_WO = [
  { id: "o1", orderNumber: "ORD-2410", product: "Basic Tee", qty: 5000 },
  { id: "o2", orderNumber: "ORD-2411", product: "Cargo Pants", qty: 3000 },
  { id: "o3", orderNumber: "ORD-2412", product: "Summer Dress", qty: 4000 },
];

const LINES = [
  "Line 1",
  "Line 2",
  "Line 3",
  "Line 4",
  "Line 5",
  "Line 6",
  "Line 7",
  "Line 8",
];

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const columns: ColumnDef<WorkOrder>[] = [
  {
    accessorKey: "woNumber",
    header: "WO #",
    cell: ({ row }) => (
      <span className="font-medium text-blue-600">{row.original.woNumber}</span>
    ),
  },
  {
    accessorKey: "orderNumber",
    header: "Order #",
  },
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }) => (
      <span className="truncate max-w-[160px] inline-block">{row.original.product}</span>
    ),
  },
  {
    accessorKey: "totalQty",
    header: "Qty",
    cell: ({ row }) => row.original.totalQty.toLocaleString(),
  },
  {
    accessorKey: "produced",
    header: "Produced",
    cell: ({ row }) => row.original.produced.toLocaleString(),
  },
  {
    accessorKey: "defective",
    header: "Defective",
    cell: ({ row }) => (
      <span className={row.original.defective > 100 ? "text-red-600 font-semibold" : ""}>
        {row.original.defective}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge status={row.original.status} statusMap={WO_STATUS_MAP} />
    ),
    filterFn: (row, id, value) => {
      if (!value) return true;
      return row.original.status === value;
    },
  },
  {
    accessorKey: "percentComplete",
    header: "% Complete",
    cell: ({ row }) => {
      const pct = row.original.percentComplete;
      return (
        <div className="flex items-center gap-2">
          <div className="h-2 w-16 rounded-full bg-gray-100 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full",
                pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-blue-500" : "bg-orange-500"
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs tabular-nums font-medium text-gray-700">
            {pct}%
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "line",
    header: "Line",
  },
  {
    accessorKey: "startDate",
    header: "Start",
    cell: ({ row }) => (
      <span className="text-xs text-gray-600">{row.original.startDate}</span>
    ),
  },
  {
    accessorKey: "endDate",
    header: "End",
    cell: ({ row }) => (
      <span className="text-xs text-gray-600">{row.original.endDate}</span>
    ),
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = React.useState(DEMO_WORK_ORDERS);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [form, setForm] = React.useState({
    orderId: "",
    product: "",
    qty: "",
    line: "",
    startDate: "",
    endDate: "",
  });

  const handleOrderSelect = (orderId: string) => {
    const order = ORDERS_FOR_WO.find((o) => o.id === orderId);
    if (order) {
      setForm((prev) => ({
        ...prev,
        orderId,
        product: order.product,
        qty: String(order.qty),
      }));
    }
  };

  const handleSave = async () => {
    if (!form.orderId || !form.line || !form.startDate) {
      toast.error("Please fill all required fields.");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    const newWO: WorkOrder = {
      id: String(Date.now()),
      woNumber: `WO-2026-${String(workOrders.length + 59).padStart(4, "0")}`,
      orderNumber: ORDERS_FOR_WO.find((o) => o.id === form.orderId)?.orderNumber ?? "",
      product: form.product,
      totalQty: parseInt(form.qty) || 0,
      produced: 0,
      defective: 0,
      status: "not_started",
      percentComplete: 0,
      line: form.line,
      startDate: form.startDate,
      endDate: form.endDate,
    };
    setWorkOrders((prev) => [newWO, ...prev]);
    setSaving(false);
    setSheetOpen(false);
    setForm({ orderId: "", product: "", qty: "", line: "", startDate: "", endDate: "" });
    toast.success(`Work Order ${newWO.woNumber} created.`);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Work Orders"
        description="Track work order progress, assign production lines, and monitor output."
        breadcrumb={[
          { label: "Production", href: "/production" },
          { label: "Work Orders" },
        ]}
      />

      <DataTable
        columns={columns}
        data={workOrders}
        searchKey="woNumber"
        searchPlaceholder="Search work orders..."
        filters={[
          {
            key: "status",
            label: "Status",
            options: Object.entries(WO_STATUS_MAP).map(([value, { label }]) => ({
              value,
              label,
            })),
          },
        ]}
        actions={
          <Button onClick={() => setSheetOpen(true)} size="sm">
            <Plus className="h-4 w-4" />
            New Work Order
          </Button>
        }
      />

      {/* New Work Order Sheet */}
      <FormSheet
        title="New Work Order"
        description="Select an order, assign a line, and set dates."
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSave={handleSave}
        saving={saving}
        saveLabel="Create Work Order"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>
              Order <span className="text-red-500">*</span>
            </Label>
            <Select value={form.orderId} onValueChange={handleOrderSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select order..." />
              </SelectTrigger>
              <SelectContent>
                {ORDERS_FOR_WO.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.orderNumber} - {o.product}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.orderId && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
              <p className="font-medium text-gray-900">{form.product}</p>
              <p className="text-gray-500">
                Quantity: {parseInt(form.qty).toLocaleString()} pcs
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>
              Production Line <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.line}
              onValueChange={(v) => setForm((prev) => ({ ...prev, line: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Assign line..." />
              </SelectTrigger>
              <SelectContent>
                {LINES.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, startDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>End Date</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>
          </div>
        </div>
      </FormSheet>
    </div>
  );
}
