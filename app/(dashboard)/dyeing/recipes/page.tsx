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

interface Recipe {
  id: string;
  name: string;
  shade: string;
  pantone: string;
  version: string;
  costPerKg: number;
  status: "draft" | "approved" | "archived";
  buyer: string;
}

/* ---------- Mock data ---------- */

const MOCK: Recipe[] = [
  {
    id: "RCP-0042",
    name: "Navy Blue Standard",
    shade: "Navy Blue",
    pantone: "19-3832 TCX",
    version: "v3",
    costPerKg: 42.5,
    status: "approved",
    buyer: "Zara International",
  },
  {
    id: "RCP-0051",
    name: "Dusty Rose Delicate",
    shade: "Dusty Rose",
    pantone: "14-1511 TCX",
    version: "v2",
    costPerKg: 38.0,
    status: "approved",
    buyer: "H&M Group",
  },
  {
    id: "RCP-0038",
    name: "Sage Green Nature",
    shade: "Sage Green",
    pantone: "16-0213 TCX",
    version: "v1",
    costPerKg: 35.2,
    status: "approved",
    buyer: "Marks & Spencer",
  },
  {
    id: "RCP-0055",
    name: "Off White Premium",
    shade: "Off White",
    pantone: "11-0601 TCX",
    version: "v1",
    costPerKg: 28.0,
    status: "draft",
    buyer: "Gap Inc.",
  },
  {
    id: "RCP-0048",
    name: "Burgundy Deep",
    shade: "Burgundy",
    pantone: "19-1652 TCX",
    version: "v2",
    costPerKg: 45.8,
    status: "approved",
    buyer: "Zara International",
  },
  {
    id: "RCP-0033",
    name: "Sky Blue Light",
    shade: "Sky Blue",
    pantone: "14-4318 TCX",
    version: "v4",
    costPerKg: 33.6,
    status: "archived",
    buyer: "H&M Group",
  },
];

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  approved: "bg-green-100 text-green-700 border border-green-200",
  archived: "bg-gray-100 text-gray-500 border border-gray-200",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  approved: "Approved",
  archived: "Archived",
};

/* ---------- Columns ---------- */

function buildColumns(onView: (id: string) => void): ColumnDef<Recipe>[] {
  return [
    {
      accessorKey: "id",
      header: "Recipe #",
      cell: ({ row }) => (
        <button
          onClick={() => onView(row.original.id)}
          className="font-medium text-blue-600 hover:underline text-left"
        >
          {row.original.id}
        </button>
      ),
    },
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "shade",
      header: "Shade",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div
            className="h-4 w-4 rounded-full border border-gray-200 shrink-0"
            style={{
              backgroundColor:
                row.original.shade === "Navy Blue"
                  ? "#1a2e5e"
                  : row.original.shade === "Dusty Rose"
                  ? "#c9948a"
                  : row.original.shade === "Sage Green"
                  ? "#8fa68e"
                  : row.original.shade === "Off White"
                  ? "#f5f0e8"
                  : row.original.shade === "Burgundy"
                  ? "#800020"
                  : row.original.shade === "Sky Blue"
                  ? "#87ceeb"
                  : "#888",
            }}
          />
          <span className="text-sm text-gray-700">{row.original.shade}</span>
        </div>
      ),
    },
    { accessorKey: "pantone", header: "Pantone" },
    { accessorKey: "version", header: "Version" },
    {
      accessorKey: "costPerKg",
      header: "Cost/kg",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">
          ₹{row.original.costPerKg.toFixed(2)}
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
    { accessorKey: "buyer", header: "Buyer" },
  ];
}

/* ---------- New Recipe Form ---------- */

function NewRecipeForm() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label>Recipe Name</Label>
          <Input placeholder="e.g. Navy Blue Standard" />
        </div>
        <div className="col-span-1 space-y-1.5">
          <Label>Shade Name</Label>
          <Input placeholder="e.g. Navy Blue" />
        </div>
        <div className="col-span-1 space-y-1.5">
          <Label>Pantone Code</Label>
          <Input placeholder="e.g. 19-3832 TCX" />
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
        <div className="col-span-1 space-y-1.5">
          <Label>Fabric Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select fabric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cotton">100% Cotton</SelectItem>
              <SelectItem value="polycotton">Poly-Cotton</SelectItem>
              <SelectItem value="viscose">Viscose</SelectItem>
              <SelectItem value="polyester">Polyester</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-1 space-y-1.5">
          <Label>Dyeing Method</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reactive">Reactive Dyeing</SelectItem>
              <SelectItem value="disperse">Disperse Dyeing</SelectItem>
              <SelectItem value="vat">Vat Dyeing</SelectItem>
              <SelectItem value="acid">Acid Dyeing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-1 space-y-1.5">
          <Label>Process Temperature (°C)</Label>
          <Input type="number" placeholder="60" />
        </div>
        <div className="col-span-1 space-y-1.5">
          <Label>Process Time (min)</Label>
          <Input type="number" placeholder="90" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Notes</Label>
          <textarea
            rows={3}
            placeholder="Any special instructions..."
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

export default function RecipesPage() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const columns = buildColumns((id) => router.push(`/dyeing/recipes/${id}`));

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recipe Library"
        description="Manage dye recipes with version control and cost tracking."
        breadcrumb={[
          { label: "Dyeing", href: "/dyeing" },
          { label: "Recipes" },
        ]}
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Recipe
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={MOCK}
        searchKey="name"
        searchPlaceholder="Search by recipe name..."
        filters={[
          {
            key: "status",
            label: "Status",
            options: Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })),
          },
        ]}
        onRowClick={(row) => router.push(`/dyeing/recipes/${row.id}`)}
        emptyMessage="No recipes in the library yet."
        actions={
          <Button onClick={() => setOpen(true)} size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            New Recipe
          </Button>
        }
      />

      <FormSheet
        title="New Recipe"
        description="Create a new dye recipe."
        open={open}
        onOpenChange={setOpen}
        onSave={handleSave}
        saving={saving}
        saveLabel="Create Recipe"
        size="md"
      >
        <NewRecipeForm />
      </FormSheet>
    </div>
  );
}
