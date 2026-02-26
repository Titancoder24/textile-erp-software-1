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

interface LabDip {
  id: string;
  order: string;
  buyer: string;
  color: string;
  recipe: string;
  submissionDate: string;
  status: "pending" | "submitted" | "approved" | "rejected";
  approvalDate: string | null;
}

/* ---------- Mock data ---------- */

const MOCK: LabDip[] = [
  {
    id: "LD-0041",
    order: "ORD-2401",
    buyer: "Zara International",
    color: "Navy Blue 19-3832",
    recipe: "RCP-0042",
    submissionDate: "2026-02-20",
    status: "approved",
    approvalDate: "2026-02-22",
  },
  {
    id: "LD-0042",
    order: "ORD-2401",
    buyer: "Zara International",
    color: "Dusty Rose 14-1511",
    recipe: "RCP-0051",
    submissionDate: "2026-02-20",
    status: "rejected",
    approvalDate: "2026-02-23",
  },
  {
    id: "LD-0043",
    order: "ORD-2401",
    buyer: "Zara International",
    color: "Dusty Rose 14-1511 (Rev2)",
    recipe: "RCP-0052",
    submissionDate: "2026-02-24",
    status: "submitted",
    approvalDate: null,
  },
  {
    id: "LD-0044",
    order: "ORD-2398",
    buyer: "H&M Group",
    color: "Sage Green 16-0213",
    recipe: "RCP-0038",
    submissionDate: "2026-02-18",
    status: "approved",
    approvalDate: "2026-02-21",
  },
  {
    id: "LD-0045",
    order: "ORD-2405",
    buyer: "Marks & Spencer",
    color: "Sky Blue 14-4318",
    recipe: "RCP-0033",
    submissionDate: "2026-02-25",
    status: "submitted",
    approvalDate: null,
  },
  {
    id: "LD-0046",
    order: "ORD-2407",
    buyer: "Gap Inc.",
    color: "Off White 11-0601",
    recipe: "RCP-0055",
    submissionDate: null as unknown as string,
    status: "pending",
    approvalDate: null,
  },
];

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600 border border-gray-200",
  submitted: "bg-blue-100 text-blue-700 border border-blue-200",
  approved: "bg-green-100 text-green-700 border border-green-200",
  rejected: "bg-red-100 text-red-700 border border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
};

/* ---------- Columns ---------- */

function buildColumns(): ColumnDef<LabDip>[] {
  return [
    {
      accessorKey: "id",
      header: "LD #",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">{row.original.id}</span>
      ),
    },
    { accessorKey: "order", header: "Order" },
    { accessorKey: "buyer", header: "Buyer" },
    { accessorKey: "color", header: "Color" },
    {
      accessorKey: "recipe",
      header: "Recipe",
      cell: ({ row }) => (
        <a
          href={`/dyeing/recipes/${row.original.recipe}`}
          className="text-blue-600 hover:underline text-sm"
        >
          {row.original.recipe}
        </a>
      ),
    },
    {
      accessorKey: "submissionDate",
      header: "Submission Date",
      cell: ({ row }) => row.original.submissionDate || "—",
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
    {
      accessorKey: "approvalDate",
      header: "Approval Date",
      cell: ({ row }) => row.original.approvalDate || "—",
    },
  ];
}

/* ---------- New Lab Dip Form ---------- */

function NewLabDipForm() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label>Order #</Label>
          <Input placeholder="ORD-XXXX" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Buyer</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select buyer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zara">Zara International</SelectItem>
              <SelectItem value="hm">H&M Group</SelectItem>
              <SelectItem value="ms">Marks & Spencer</SelectItem>
              <SelectItem value="gap">Gap Inc.</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Color / Shade</Label>
          <Input placeholder="e.g. Navy Blue 19-3832" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Reference Recipe</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select recipe (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RCP-0042">RCP-0042 — Navy Blue Standard</SelectItem>
              <SelectItem value="RCP-0051">RCP-0051 — Dusty Rose Delicate</SelectItem>
              <SelectItem value="RCP-0038">RCP-0038 — Sage Green Nature</SelectItem>
              <SelectItem value="RCP-0055">RCP-0055 — Off White Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Target Submission Date</Label>
          <Input type="date" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Fabric Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select fabric type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cotton">100% Cotton</SelectItem>
              <SelectItem value="polycotton">Poly-Cotton</SelectItem>
              <SelectItem value="viscose">Viscose</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Pantone Reference</Label>
          <Input placeholder="e.g. 19-3832 TCX" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Notes</Label>
          <textarea
            rows={3}
            placeholder="Special notes or requirements..."
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

export default function LabDipsPage() {
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
        title="Lab Dips"
        description="Lab dip submission tracking and buyer shade approval management."
        breadcrumb={[{ label: "Lab Dips" }]}
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Lab Dip
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={MOCK}
        searchKey="color"
        searchPlaceholder="Search by color..."
        filters={[
          {
            key: "status",
            label: "Status",
            options: Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })),
          },
        ]}
        emptyMessage="No lab dips recorded."
        actions={
          <Button onClick={() => setOpen(true)} size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            New Lab Dip
          </Button>
        }
      />

      <FormSheet
        title="New Lab Dip"
        description="Record a new lab dip submission."
        open={open}
        onOpenChange={setOpen}
        onSave={handleSave}
        saving={saving}
        saveLabel="Create Lab Dip"
        size="md"
      >
        <NewLabDipForm />
      </FormSheet>
    </div>
  );
}
