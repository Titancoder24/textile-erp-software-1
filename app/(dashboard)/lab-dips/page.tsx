"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

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
import { useCompany } from "@/contexts/company-context";
import { getLabDips, createLabDip } from "@/lib/actions/dyeing";
import { getBuyers } from "@/lib/actions/buyers";

/* ---------- Types ---------- */

interface LabDip {
  id: string;
  labDipNumber: string;
  order: string;
  buyer: string;
  color: string;
  recipe: string;
  submissionDate: string;
  status: "pending" | "submitted" | "approved" | "rejected";
  approvalDate: string | null;
}

interface BuyerOption {
  id: string;
  name: string;
}

/* ---------- Status config ---------- */

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
      accessorKey: "labDipNumber",
      header: "LD #",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">{row.original.labDipNumber}</span>
      ),
    },
    { accessorKey: "order", header: "Order" },
    { accessorKey: "buyer", header: "Buyer" },
    { accessorKey: "color", header: "Color" },
    {
      accessorKey: "recipe",
      header: "Recipe",
      cell: ({ row }) =>
        row.original.recipe ? (
          <span className="text-blue-600 text-sm">{row.original.recipe}</span>
        ) : (
          "—"
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

function NewLabDipForm({
  buyers,
  formData,
  setFormData,
}: {
  buyers: BuyerOption[];
  formData: {
    buyerId: string;
    colorName: string;
    submissionDate: string;
    notes: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      buyerId: string;
      colorName: string;
      submissionDate: string;
      notes: string;
    }>
  >;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label>Buyer</Label>
          <Select
            value={formData.buyerId}
            onValueChange={(v) => setFormData((prev) => ({ ...prev, buyerId: v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select buyer" />
            </SelectTrigger>
            <SelectContent>
              {buyers.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Color / Shade</Label>
          <Input
            placeholder="e.g. Navy Blue 19-3832"
            value={formData.colorName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, colorName: e.target.value }))
            }
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Target Submission Date</Label>
          <Input
            type="date"
            value={formData.submissionDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, submissionDate: e.target.value }))
            }
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Notes</Label>
          <textarea
            rows={3}
            placeholder="Special notes or requirements..."
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

export default function LabDipsPage() {
  const { companyId, userId } = useCompany();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [labDips, setLabDips] = React.useState<LabDip[]>([]);
  const [buyers, setBuyers] = React.useState<BuyerOption[]>([]);
  const [formData, setFormData] = React.useState({
    buyerId: "",
    colorName: "",
    submissionDate: "",
    notes: "",
  });

  const columns = buildColumns();

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [labDipRes, buyerRes] = await Promise.all([
        getLabDips(companyId),
        getBuyers(companyId),
      ]);

      if (labDipRes.error) {
        toast.error("Failed to load lab dips: " + labDipRes.error);
      } else {
        const mapped: LabDip[] = (labDipRes.data ?? []).map((ld: Record<string, unknown>) => {
          const buyerObj = ld.buyers as Record<string, unknown> | null;
          const recipeObj = ld.recipes as Record<string, unknown> | null;
          const orderObj = ld.sales_orders as Record<string, unknown> | null;

          return {
            id: ld.id as string,
            labDipNumber: ld.lab_dip_number as string,
            order: (orderObj?.order_number as string) || "—",
            buyer: (buyerObj?.name as string) || "—",
            color: (ld.color_name as string) || "—",
            recipe: (recipeObj?.recipe_number as string) || "",
            submissionDate: (ld.submission_date as string) || "",
            status: (ld.status as LabDip["status"]) || "pending",
            approvalDate: (ld.approval_date as string) || null,
          };
        });
        setLabDips(mapped);
      }

      if (buyerRes.error) {
        toast.error("Failed to load buyers: " + buyerRes.error);
      } else {
        setBuyers(
          (buyerRes.data ?? []).map((b: Record<string, unknown>) => ({
            id: b.id as string,
            name: b.name as string,
          }))
        );
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!formData.buyerId) {
      toast.error("Please select a buyer");
      return;
    }
    if (!formData.colorName) {
      toast.error("Please enter a color name");
      return;
    }

    setSaving(true);
    try {
      const result = await createLabDip({
        company_id: companyId,
        buyer_id: formData.buyerId,
        color_name: formData.colorName,
        submission_date: formData.submissionDate || undefined,
        created_by: userId,
      });

      if (result.error) {
        toast.error("Failed to create lab dip: " + result.error);
      } else {
        toast.success("Lab dip created successfully");
        setOpen(false);
        setFormData({ buyerId: "", colorName: "", submissionDate: "", notes: "" });
        fetchData();
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
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
        data={labDips}
        searchKey="color"
        searchPlaceholder="Search by color..."
        loading={loading}
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
        <NewLabDipForm
          buyers={buyers}
          formData={formData}
          setFormData={setFormData}
        />
      </FormSheet>
    </div>
  );
}
