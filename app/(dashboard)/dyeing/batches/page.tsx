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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ---------- Types ---------- */

interface Batch {
  id: string;
  order: string;
  color: string;
  recipe: string;
  inputKg: number;
  outputKg: number;
  processLossPct: number;
  shadeResult: "matched" | "not_matched" | "pending" | "approved";
  status: "planned" | "scouring" | "bleaching" | "dyeing" | "finishing" | "completed" | "rejected";
}

/* ---------- Mock data ---------- */

const MOCK: Batch[] = [
  {
    id: "BAT-0085",
    order: "ORD-2401",
    color: "Navy Blue",
    recipe: "RCP-0042",
    inputKg: 120,
    outputKg: 0,
    processLossPct: 0,
    shadeResult: "pending",
    status: "dyeing",
  },
  {
    id: "BAT-0084",
    order: "ORD-2398",
    color: "Sage Green",
    recipe: "RCP-0038",
    inputKg: 85,
    outputKg: 0,
    processLossPct: 0,
    shadeResult: "matched",
    status: "finishing",
  },
  {
    id: "BAT-0083",
    order: "ORD-2395",
    color: "Dusty Rose",
    recipe: "RCP-0051",
    inputKg: 200,
    outputKg: 0,
    processLossPct: 0,
    shadeResult: "pending",
    status: "scouring",
  },
  {
    id: "BAT-0082",
    order: "ORD-2401",
    color: "Navy Blue",
    recipe: "RCP-0042",
    inputKg: 120,
    outputKg: 0,
    processLossPct: 0,
    shadeResult: "pending",
    status: "bleaching",
  },
  {
    id: "BAT-0081",
    order: "ORD-2388",
    color: "Burgundy",
    recipe: "RCP-0048",
    inputKg: 150,
    outputKg: 143.2,
    processLossPct: 4.5,
    shadeResult: "approved",
    status: "completed",
  },
  {
    id: "BAT-0080",
    order: "ORD-2380",
    color: "Sky Blue",
    recipe: "RCP-0033",
    inputKg: 90,
    outputKg: 85.1,
    processLossPct: 5.4,
    shadeResult: "not_matched",
    status: "rejected",
  },
];

const STATUS_BADGE: Record<string, string> = {
  planned: "bg-gray-100 text-gray-600",
  scouring: "bg-yellow-100 text-yellow-700",
  bleaching: "bg-orange-100 text-orange-700",
  dyeing: "bg-blue-100 text-blue-700",
  finishing: "bg-indigo-100 text-indigo-700",
  completed: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  planned: "Planned",
  scouring: "Scouring",
  bleaching: "Bleaching",
  dyeing: "Dyeing",
  finishing: "Finishing",
  completed: "Completed",
  rejected: "Rejected",
};

const SHADE_BADGE: Record<string, string> = {
  matched: "bg-green-100 text-green-700",
  approved: "bg-blue-100 text-blue-700",
  not_matched: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
};

const SHADE_LABELS: Record<string, string> = {
  matched: "Matched",
  approved: "Approved",
  not_matched: "Not Matched",
  pending: "Pending",
};

/* ---------- Columns ---------- */

function buildColumns(onView: (id: string) => void): ColumnDef<Batch>[] {
  return [
    {
      accessorKey: "id",
      header: "Batch #",
      cell: ({ row }) => (
        <button
          onClick={() => onView(row.original.id)}
          className="font-medium text-blue-600 hover:underline text-left"
        >
          {row.original.id}
        </button>
      ),
    },
    { accessorKey: "order", header: "Order" },
    { accessorKey: "color", header: "Color" },
    {
      accessorKey: "recipe",
      header: "Recipe",
      cell: ({ row }) => (
        <a href={`/dyeing/recipes/${row.original.recipe}`} className="text-blue-600 hover:underline text-sm">
          {row.original.recipe}
        </a>
      ),
    },
    {
      accessorKey: "inputKg",
      header: "Input (kg)",
      cell: ({ row }) => row.original.inputKg.toFixed(1),
    },
    {
      accessorKey: "outputKg",
      header: "Output (kg)",
      cell: ({ row }) =>
        row.original.outputKg > 0 ? row.original.outputKg.toFixed(1) : "—",
    },
    {
      accessorKey: "processLossPct",
      header: "Process Loss %",
      cell: ({ row }) => {
        const v = row.original.processLossPct;
        if (v === 0) return "—";
        return (
          <span className={v > 6 ? "font-semibold text-red-600" : "text-gray-700"}>
            {v.toFixed(1)}%
          </span>
        );
      },
    },
    {
      accessorKey: "shadeResult",
      header: "Shade Result",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${SHADE_BADGE[row.original.shadeResult]}`}
        >
          {SHADE_LABELS[row.original.shadeResult]}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[row.original.status]}`}
        >
          {STATUS_LABELS[row.original.status]}
        </span>
      ),
    },
  ];
}

/* ---------- New Batch Form ---------- */

function NewBatchForm() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label>Order #</Label>
          <Input placeholder="ORD-XXXX" />
        </div>
        <div className="col-span-1 space-y-1.5">
          <Label>Color</Label>
          <Input placeholder="e.g. Navy Blue" />
        </div>
        <div className="col-span-1 space-y-1.5">
          <Label>Recipe</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select recipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RCP-0042">RCP-0042 — Navy Blue Standard</SelectItem>
              <SelectItem value="RCP-0051">RCP-0051 — Dusty Rose Delicate</SelectItem>
              <SelectItem value="RCP-0038">RCP-0038 — Sage Green Nature</SelectItem>
              <SelectItem value="RCP-0048">RCP-0048 — Burgundy Deep</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-1 space-y-1.5">
          <Label>Input Weight (kg)</Label>
          <Input type="number" placeholder="0" />
        </div>
        <div className="col-span-1 space-y-1.5">
          <Label>Planned Date</Label>
          <Input type="date" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Machine</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select dyeing machine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jm1">JFO Machine 1 — 200kg</SelectItem>
              <SelectItem value="jm2">JFO Machine 2 — 150kg</SelectItem>
              <SelectItem value="hw1">HT HW 1 — 100kg</SelectItem>
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

/* ---------- Page ---------- */

export default function BatchesPage() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const columns = buildColumns((id) => router.push(`/dyeing/batches/${id}`));

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dyeing Batches"
        description="Track dyeing batches through each processing stage."
        breadcrumb={[
          { label: "Dyeing", href: "/dyeing" },
          { label: "Batches" },
        ]}
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Batch
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
            key: "status",
            label: "Status",
            options: Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })),
          },
        ]}
        onRowClick={(row) => router.push(`/dyeing/batches/${row.id}`)}
        emptyMessage="No dyeing batches recorded."
        actions={
          <Button onClick={() => setOpen(true)} size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            New Batch
          </Button>
        }
      />

      <FormSheet
        title="New Dyeing Batch"
        description="Create a new dyeing batch record."
        open={open}
        onOpenChange={setOpen}
        onSave={handleSave}
        saving={saving}
        saveLabel="Create Batch"
        size="md"
      >
        <NewBatchForm />
      </FormSheet>
    </div>
  );
}
