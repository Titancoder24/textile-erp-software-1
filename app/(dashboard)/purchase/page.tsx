"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { FormSheet } from "@/components/forms/form-sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ---------- Types ---------- */

interface PurchaseOrder {
  id: string;
  supplier: string;
  order: string;
  totalAmount: number;
  deliveryDate: string;
  status: "draft" | "pending_approval" | "approved" | "sent" | "partial_received" | "fully_received" | "closed" | "cancelled";
}

interface GRN {
  id: string;
  poId: string;
  supplier: string;
  date: string;
  status: "draft" | "pending_qc" | "approved" | "rejected";
}

interface MaterialRequest {
  id: string;
  department: string;
  requestDate: string;
  requiredBy: string;
  items: number;
  status: "pending" | "approved" | "po_raised" | "fulfilled";
}

/* ---------- Mock data ---------- */

const PO_DATA: PurchaseOrder[] = [
  {
    id: "PO-0128",
    supplier: "Arvind Textiles",
    order: "ORD-2401",
    totalAmount: 204000,
    deliveryDate: "2026-03-05",
    status: "approved",
  },
  {
    id: "PO-0127",
    supplier: "Vardhman Fabrics",
    order: "ORD-2398",
    totalAmount: 129600,
    deliveryDate: "2026-03-02",
    status: "sent",
  },
  {
    id: "PO-0126",
    supplier: "Chemdyes Ltd",
    order: "ORD-2401",
    totalAmount: 28900,
    deliveryDate: "2026-02-28",
    status: "partial_received",
  },
  {
    id: "PO-0125",
    supplier: "Trimco Accessories",
    order: "ORD-2395",
    totalAmount: 12400,
    deliveryDate: "2026-02-25",
    status: "fully_received",
  },
  {
    id: "PO-0124",
    supplier: "Indo Count",
    order: "ORD-2388",
    totalAmount: 87500,
    deliveryDate: "2026-02-20",
    status: "closed",
  },
  {
    id: "PO-0123",
    supplier: "Arvind Textiles",
    order: "ORD-2385",
    totalAmount: 55000,
    deliveryDate: "2026-02-18",
    status: "pending_approval",
  },
];

const GRN_DATA: GRN[] = [
  {
    id: "GRN-0088",
    poId: "PO-0125",
    supplier: "Trimco Accessories",
    date: "2026-02-25",
    status: "approved",
  },
  {
    id: "GRN-0087",
    poId: "PO-0126",
    supplier: "Chemdyes Ltd",
    date: "2026-02-23",
    status: "pending_qc",
  },
  {
    id: "GRN-0086",
    poId: "PO-0124",
    supplier: "Indo Count",
    date: "2026-02-19",
    status: "approved",
  },
];

const MR_DATA: MaterialRequest[] = [
  {
    id: "MR-0055",
    department: "Dyeing",
    requestDate: "2026-02-24",
    requiredBy: "2026-03-01",
    items: 4,
    status: "po_raised",
  },
  {
    id: "MR-0054",
    department: "Sewing",
    requestDate: "2026-02-22",
    requiredBy: "2026-02-28",
    items: 2,
    status: "approved",
  },
  {
    id: "MR-0053",
    department: "Packing",
    requestDate: "2026-02-20",
    requiredBy: "2026-02-26",
    items: 6,
    status: "fulfilled",
  },
];

/* ---------- Status configs ---------- */

const PO_STATUS_BADGE: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  pending_approval: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  sent: "bg-indigo-100 text-indigo-700",
  partial_received: "bg-orange-100 text-orange-700",
  fully_received: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-500",
  cancelled: "bg-red-100 text-red-700",
};

const PO_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  approved: "Approved",
  sent: "Sent",
  partial_received: "Partial Received",
  fully_received: "Fully Received",
  closed: "Closed",
  cancelled: "Cancelled",
};

const GRN_STATUS_BADGE: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  pending_qc: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const GRN_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_qc: "Pending QC",
  approved: "Approved",
  rejected: "Rejected",
};

const MR_STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  po_raised: "bg-indigo-100 text-indigo-700",
  fulfilled: "bg-green-100 text-green-700",
};

const MR_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  po_raised: "PO Raised",
  fulfilled: "Fulfilled",
};

/* ---------- Columns ---------- */

function buildPOColumns(onView: (id: string) => void): ColumnDef<PurchaseOrder>[] {
  return [
    {
      accessorKey: "id",
      header: "PO #",
      cell: ({ row }) => (
        <button
          onClick={() => onView(row.original.id)}
          className="font-medium text-blue-600 hover:underline text-left"
        >
          {row.original.id}
        </button>
      ),
    },
    { accessorKey: "supplier", header: "Supplier" },
    { accessorKey: "order", header: "Order" },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ row }) =>
        `₹${row.original.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    },
    { accessorKey: "deliveryDate", header: "Delivery Date" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${PO_STATUS_BADGE[row.original.status]}`}
        >
          {PO_STATUS_LABELS[row.original.status]}
        </span>
      ),
    },
  ];
}

const GRN_COLUMNS: ColumnDef<GRN>[] = [
  {
    accessorKey: "id",
    header: "GRN #",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900">{row.original.id}</span>
    ),
  },
  {
    accessorKey: "poId",
    header: "PO #",
    cell: ({ row }) => (
      <a href={`/purchase/orders/${row.original.poId}`} className="text-blue-600 hover:underline text-sm">
        {row.original.poId}
      </a>
    ),
  },
  { accessorKey: "supplier", header: "Supplier" },
  { accessorKey: "date", header: "Date" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${GRN_STATUS_BADGE[row.original.status]}`}
      >
        {GRN_STATUS_LABELS[row.original.status]}
      </span>
    ),
  },
];

const MR_COLUMNS: ColumnDef<MaterialRequest>[] = [
  {
    accessorKey: "id",
    header: "Request #",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900">{row.original.id}</span>
    ),
  },
  { accessorKey: "department", header: "Department" },
  { accessorKey: "requestDate", header: "Request Date" },
  { accessorKey: "requiredBy", header: "Required By" },
  {
    accessorKey: "items",
    header: "Items",
    cell: ({ row }) => `${row.original.items} items`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${MR_STATUS_BADGE[row.original.status]}`}
      >
        {MR_STATUS_LABELS[row.original.status]}
      </span>
    ),
  },
];

/* ---------- New PO Form ---------- */

function NewPOForm() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label>Supplier</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="arvind">Arvind Textiles</SelectItem>
              <SelectItem value="vardhman">Vardhman Fabrics</SelectItem>
              <SelectItem value="chemdyes">Chemdyes Ltd</SelectItem>
              <SelectItem value="trimco">Trimco Accessories</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Linked Order</Label>
          <Input placeholder="ORD-XXXX" />
        </div>
        <div className="col-span-1 space-y-1.5">
          <Label>Order Date</Label>
          <Input type="date" />
        </div>
        <div className="col-span-1 space-y-1.5">
          <Label>Delivery Date</Label>
          <Input type="date" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Currency</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="INR" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INR">INR — Indian Rupee</SelectItem>
              <SelectItem value="USD">USD — US Dollar</SelectItem>
              <SelectItem value="EUR">EUR — Euro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Payment Terms</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="advance">100% Advance</SelectItem>
              <SelectItem value="30d">Net 30 days</SelectItem>
              <SelectItem value="60d">Net 60 days</SelectItem>
              <SelectItem value="30_70">30% Advance / 70% on delivery</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Notes</Label>
          <textarea
            rows={2}
            placeholder="Special instructions..."
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- New GRN Form ---------- */

function NewGRNForm() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label>Purchase Order</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select PO" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PO-0128">PO-0128 — Arvind Textiles</SelectItem>
              <SelectItem value="PO-0127">PO-0127 — Vardhman Fabrics</SelectItem>
              <SelectItem value="PO-0126">PO-0126 — Chemdyes Ltd</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-1 space-y-1.5">
          <Label>Received Date</Label>
          <Input type="date" />
        </div>
        <div className="col-span-1 space-y-1.5">
          <Label>Vehicle / LR No.</Label>
          <Input placeholder="LR-XXXX" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Warehouse</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select warehouse" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wh01">WH-01 Main Store</SelectItem>
              <SelectItem value="wh02">WH-02 Chemical Store</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Notes</Label>
          <textarea
            rows={2}
            placeholder="Receiving remarks..."
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

export default function PurchasePage() {
  const router = useRouter();
  const [poOpen, setPOOpen] = React.useState(false);
  const [grnOpen, setGRNOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const poColumns = buildPOColumns((id) => router.push(`/purchase/orders/${id}`));

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setPOOpen(false);
    setGRNOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase"
        description="Purchase orders, goods receipt, and material request management."
        breadcrumb={[{ label: "Purchase" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setGRNOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New GRN
            </Button>
            <Button onClick={() => setPOOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New PO
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="po">
        <TabsList>
          <TabsTrigger value="po">Purchase Orders</TabsTrigger>
          <TabsTrigger value="grn">GRN</TabsTrigger>
          <TabsTrigger value="mr">Material Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="po" className="mt-4">
          <DataTable
            columns={poColumns}
            data={PO_DATA}
            searchKey="supplier"
            searchPlaceholder="Search by supplier..."
            filters={[
              {
                key: "status",
                label: "Status",
                options: Object.entries(PO_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })),
              },
            ]}
            onRowClick={(row) => router.push(`/purchase/orders/${row.id}`)}
            emptyMessage="No purchase orders found."
            actions={
              <Button onClick={() => setPOOpen(true)} size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                New PO
              </Button>
            }
          />
        </TabsContent>

        <TabsContent value="grn" className="mt-4">
          <DataTable
            columns={GRN_COLUMNS}
            data={GRN_DATA}
            searchKey="supplier"
            searchPlaceholder="Search by supplier..."
            filters={[
              {
                key: "status",
                label: "Status",
                options: Object.entries(GRN_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })),
              },
            ]}
            emptyMessage="No GRNs recorded."
            actions={
              <Button onClick={() => setGRNOpen(true)} size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                New GRN
              </Button>
            }
          />
        </TabsContent>

        <TabsContent value="mr" className="mt-4">
          <DataTable
            columns={MR_COLUMNS}
            data={MR_DATA}
            searchKey="department"
            searchPlaceholder="Search by department..."
            emptyMessage="No material requests found."
          />
        </TabsContent>
      </Tabs>

      {/* New PO Sheet */}
      <FormSheet
        title="New Purchase Order"
        description="Create a new purchase order."
        open={poOpen}
        onOpenChange={setPOOpen}
        onSave={handleSave}
        saving={saving}
        saveLabel="Create PO"
        size="md"
      >
        <NewPOForm />
      </FormSheet>

      {/* New GRN Sheet */}
      <FormSheet
        title="New GRN"
        description="Record goods received against a purchase order."
        open={grnOpen}
        onOpenChange={setGRNOpen}
        onSave={handleSave}
        saving={saving}
        saveLabel="Create GRN"
        size="md"
      >
        <NewGRNForm />
      </FormSheet>
    </div>
  );
}
