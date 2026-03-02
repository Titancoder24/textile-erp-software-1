"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
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
import { useCompany } from "@/contexts/company-context";
import {
  getWorkOrders,
  createWorkOrder,
  getOrdersForWorkOrder,
  getProductionLines,
} from "@/lib/actions/production";

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

type OrderOption = {
  id: string;
  order_number: string;
  product_name: string;
  total_quantity: number;
};

const WO_STATUS_MAP: Record<string, { label: string; color: string }> = {
  planned: { label: "Planned", color: "gray" },
  not_started: { label: "Not Started", color: "gray" },
  in_progress: { label: "In Progress", color: "blue" },
  completed: { label: "Completed", color: "green" },
  on_hold: { label: "On Hold", color: "yellow" },
  cancelled: { label: "Cancelled", color: "red" },
};

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
  const { companyId, userId } = useCompany();
  const [workOrders, setWorkOrders] = React.useState<WorkOrder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Dropdown data
  const [ordersForWO, setOrdersForWO] = React.useState<OrderOption[]>([]);
  const [lineNames, setLineNames] = React.useState<string[]>([]);

  const [form, setForm] = React.useState({
    orderId: "",
    product: "",
    qty: "",
    line: "",
    startDate: "",
    endDate: "",
  });

  const fetchWorkOrders = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await getWorkOrders(companyId);
    if (error) {
      toast.error("Failed to load work orders: " + error);
    } else if (data) {
      const mapped: WorkOrder[] = data.map((wo: Record<string, unknown>) => {
        const totalQty = (wo.total_quantity as number) || 0;
        const produced = (wo.good_output as number) || 0;
        const defective = (wo.defective_output as number) || 0;
        const pct = totalQty > 0 ? Math.round((produced / totalQty) * 100) : 0;
        const order = wo.sales_orders as Record<string, unknown> | null;
        return {
          id: wo.id as string,
          woNumber: wo.wo_number as string,
          orderNumber: order?.order_number as string ?? "-",
          product: wo.product_name as string,
          totalQty,
          produced,
          defective,
          status: wo.status as string,
          percentComplete: pct,
          line: (wo.production_line as string) || "-",
          startDate: (wo.planned_start_date as string) || "-",
          endDate: (wo.planned_end_date as string) || "-",
        };
      });
      setWorkOrders(mapped);
    }
    setLoading(false);
  }, [companyId]);

  const fetchDropdownData = React.useCallback(async () => {
    const [ordersRes, linesRes] = await Promise.all([
      getOrdersForWorkOrder(companyId),
      getProductionLines(companyId),
    ]);
    if (ordersRes.data) {
      setOrdersForWO(ordersRes.data as OrderOption[]);
    }
    if (linesRes.data) {
      const names = (linesRes.data as Array<{ name: string }>).map((l) => l.name);
      setLineNames(names);
    }
  }, [companyId]);

  React.useEffect(() => {
    fetchWorkOrders();
    fetchDropdownData();
  }, [fetchWorkOrders, fetchDropdownData]);

  const handleOrderSelect = (orderId: string) => {
    const order = ordersForWO.find((o) => o.id === orderId);
    if (order) {
      setForm((prev) => ({
        ...prev,
        orderId,
        product: order.product_name,
        qty: String(order.total_quantity),
      }));
    }
  };

  const handleSave = async () => {
    if (!form.orderId || !form.line || !form.startDate) {
      toast.error("Please fill all required fields.");
      return;
    }
    setSaving(true);

    const { data, error } = await createWorkOrder({
      company_id: companyId,
      order_id: form.orderId,
      product_id: null,
      product_name: form.product,
      bom_id: null,
      total_quantity: parseInt(form.qty) || 0,
      production_line: form.line,
      planned_start_date: form.startDate,
      planned_end_date: form.endDate || null,
      status: "planned",
      notes: null,
      created_by: userId,
    });

    if (error) {
      toast.error("Failed to create work order: " + error);
    } else if (data) {
      toast.success(`Work Order ${data.wo_number} created.`);
      setSheetOpen(false);
      setForm({ orderId: "", product: "", qty: "", line: "", startDate: "", endDate: "" });
      fetchWorkOrders();
    }
    setSaving(false);
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
        loading={loading}
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
                {ordersForWO.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.order_number} - {o.product_name}
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
                {lineNames.map((l) => (
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
