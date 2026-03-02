"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Eye, Pencil, FlaskConical } from "lucide-react";
import { toast } from "sonner";

import { cn, formatDate } from "@/lib/utils";
import { SAMPLE_TYPES, SAMPLE_TYPE_LABELS } from "@/lib/constants";
import { useCompany } from "@/contexts/company-context";
import { getSamples, createSample } from "@/lib/actions/samples";
import { getBuyers } from "@/lib/actions/buyers";
import { getProducts } from "@/lib/actions/masters";
import { getOrders } from "@/lib/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/data-table/data-table";
import { createActionsColumn } from "@/components/data-table/columns";
import { StatusBadge, type StatusConfig } from "@/components/ui/status-badge";
import { FormSheet } from "@/components/forms/form-sheet";
import { PageHeader } from "@/components/ui/page-header";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SampleStatus =
  | "requested"
  | "in_development"
  | "submitted"
  | "approved"
  | "rejected"
  | "revised";

interface Sample {
  id: string;
  sampleNumber: string;
  buyer: string;
  buyerId: string;
  product: string;
  productId: string;
  sampleType: string;
  colors: string[];
  status: SampleStatus;
  requiredDate: string;
  submittedDate?: string;
}

interface BuyerOption {
  id: string;
  name: string;
}

interface ProductOption {
  id: string;
  name: string;
  style_code: string;
}

interface OrderOption {
  id: string;
  order_number: string;
}

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const SAMPLE_STATUS_MAP: Record<string, StatusConfig> = {
  requested: { label: "Requested", color: "blue" },
  in_development: { label: "In Development", color: "yellow" },
  submitted: { label: "Submitted", color: "purple" },
  approved: { label: "Approved", color: "green" },
  rejected: { label: "Rejected", color: "red" },
  revised: { label: "Revised", color: "orange" },
};

const SAMPLE_TYPE_BADGE_COLORS: Record<string, string> = {
  lab_dip: "bg-purple-50 text-purple-700 border border-purple-200",
  strike_off: "bg-orange-50 text-orange-700 border border-orange-200",
  fit_sample: "bg-blue-50 text-blue-700 border border-blue-200",
  size_set: "bg-teal-50 text-teal-700 border border-teal-200",
  pre_production: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  production: "bg-green-50 text-green-700 border border-green-200",
  shipment: "bg-gray-100 text-gray-600 border border-gray-200",
  photo: "bg-pink-50 text-pink-700 border border-pink-200",
};

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

function buildColumns(
  router: ReturnType<typeof useRouter>
): ColumnDef<Sample>[] {
  return [
    {
      accessorKey: "sampleNumber",
      header: "Sample #",
      cell: ({ row }) => (
        <span className="font-mono text-sm font-bold text-gray-900">
          {row.original.sampleNumber}
        </span>
      ),
    },
    {
      accessorKey: "buyer",
      header: "Buyer",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-900">
          {row.original.buyer}
        </span>
      ),
    },
    {
      accessorKey: "product",
      header: "Style",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 max-w-[160px] truncate block">
          {row.original.product}
        </span>
      ),
    },
    {
      accessorKey: "sampleType",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.sampleType;
        const badgeClass =
          SAMPLE_TYPE_BADGE_COLORS[type] ??
          "bg-gray-100 text-gray-600 border border-gray-200";
        return (
          <span
            className={cn(
              "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold",
              badgeClass
            )}
          >
            {SAMPLE_TYPE_LABELS[type] ?? type}
          </span>
        );
      },
      filterFn: (row, _colId, filterValue) =>
        row.original.sampleType === filterValue,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.status}
          statusMap={SAMPLE_STATUS_MAP}
        />
      ),
      filterFn: (row, _colId, filterValue) =>
        row.original.status === filterValue,
    },
    {
      accessorKey: "requiredDate",
      header: "Required Date",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {formatDate(row.original.requiredDate)}
        </span>
      ),
    },
    {
      accessorKey: "submittedDate",
      header: "Submitted Date",
      cell: ({ row }) =>
        row.original.submittedDate ? (
          <span className="text-sm text-gray-600 whitespace-nowrap">
            {formatDate(row.original.submittedDate)}
          </span>
        ) : (
          <span className="text-gray-400">--</span>
        ),
    },
    createActionsColumn<Sample>([
      {
        label: "View",
        icon: <Eye className="h-4 w-4" />,
        onClick: () => {},
      },
      {
        label: "Edit",
        icon: <Pencil className="h-4 w-4" />,
        onClick: () => {},
      },
    ]),
  ];
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SamplesPage() {
  const router = useRouter();
  const { companyId, userId } = useCompany();
  const [samples, setSamples] = React.useState<Sample[]>([]);
  const [loading, setLoading] = React.useState(true);
  const columns = React.useMemo(() => buildColumns(router), [router]);

  // Lookup data for the form
  const [buyers, setBuyers] = React.useState<BuyerOption[]>([]);
  const [products, setProducts] = React.useState<ProductOption[]>([]);
  const [orders, setOrders] = React.useState<OrderOption[]>([]);

  // FormSheet state
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [formData, setFormData] = React.useState({
    buyer: "",
    product: "",
    order: "",
    sample_type: "",
    quantity: "",
    required_date: "",
    special_instructions: "",
  });

  // Fetch samples from Supabase
  const fetchSamples = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await getSamples(companyId);
      if (error) {
        toast.error("Failed to load samples");
        return;
      }
      const mapped: Sample[] = (data ?? []).map((s: Record<string, unknown>) => ({
        id: s.id as string,
        sampleNumber: s.sample_number as string,
        buyer:
          (s.buyers as Record<string, unknown>)?.name as string ?? "Unknown",
        buyerId: s.buyer_id as string,
        product:
          (s.products as Record<string, unknown>)?.name as string ??
          (s.products as Record<string, unknown>)?.style_code as string ??
          "N/A",
        productId: (s.product_id as string) ?? "",
        sampleType: s.sample_type as string,
        colors: (s.colors as string[]) ?? [],
        status: s.status as SampleStatus,
        requiredDate: (s.required_date as string) ?? "",
        submittedDate: (s.submitted_date as string) ?? undefined,
      }));
      setSamples(mapped);
    } catch {
      toast.error("Failed to load samples");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Fetch lookup data for the form (buyers, products, orders)
  const fetchLookups = React.useCallback(async () => {
    try {
      const [buyersRes, productsRes, ordersRes] = await Promise.all([
        getBuyers(companyId),
        getProducts(companyId),
        getOrders(companyId),
      ]);

      if (buyersRes.data) {
        setBuyers(
          buyersRes.data.map((b: Record<string, unknown>) => ({
            id: b.id as string,
            name: b.name as string,
          }))
        );
      }

      if (productsRes.data) {
        setProducts(
          productsRes.data.map((p: Record<string, unknown>) => ({
            id: p.id as string,
            name: p.name as string,
            style_code: p.style_code as string,
          }))
        );
      }

      if (ordersRes.data) {
        setOrders(
          ordersRes.data.map((o: Record<string, unknown>) => ({
            id: o.id as string,
            order_number: o.order_number as string,
          }))
        );
      }
    } catch {
      // Silently fail for lookups - form will just have empty dropdowns
    }
  }, [companyId]);

  React.useEffect(() => {
    fetchSamples();
    fetchLookups();
  }, [fetchSamples, fetchLookups]);

  function handleFormChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!formData.buyer || !formData.sample_type || !formData.required_date) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      const { error } = await createSample({
        company_id: companyId,
        buyer_id: formData.buyer,
        product_id: formData.product || null,
        order_id: formData.order || null,
        sample_type: formData.sample_type,
        quantity: formData.quantity ? parseInt(formData.quantity, 10) : 1,
        required_date: formData.required_date,
        special_instructions: formData.special_instructions || null,
        created_by: userId,
      });

      if (error) {
        toast.error(error);
        return;
      }

      toast.success("Sample request created successfully");
      setSheetOpen(false);
      setFormData({
        buyer: "",
        product: "",
        order: "",
        sample_type: "",
        quantity: "",
        required_date: "",
        special_instructions: "",
      });
      fetchSamples();
    } catch {
      toast.error("Failed to create sample request");
    } finally {
      setSaving(false);
    }
  }

  const FILTERS = [
    {
      key: "sampleType",
      label: "Type",
      options: SAMPLE_TYPES.map((t) => ({
        label: SAMPLE_TYPE_LABELS[t] ?? t,
        value: t,
      })),
    },
    {
      key: "status",
      label: "Status",
      options: Object.entries(SAMPLE_STATUS_MAP).map(([value, { label }]) => ({
        label,
        value,
      })),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Samples"
        description="Track sample development, submissions, and approvals"
        actions={
          <Button onClick={() => setSheetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Sample
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={samples}
        loading={loading}
        searchKey="sampleNumber"
        searchPlaceholder="Search by sample number..."
        filters={FILTERS}
        actions={
          <Button size="sm" onClick={() => setSheetOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Sample
          </Button>
        }
      />

      {/* New Sample FormSheet */}
      <FormSheet
        title="New Sample"
        description="Submit a new sample request for development."
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSave={handleSave}
        saveLabel="Create Sample"
        saving={saving}
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="smp-buyer">Buyer *</Label>
            <Select
              value={formData.buyer}
              onValueChange={(v) => handleFormChange("buyer", v)}
            >
              <SelectTrigger id="smp-buyer">
                <SelectValue placeholder="Select buyer..." />
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

          <div className="space-y-1.5">
            <Label htmlFor="smp-product">Product / Style *</Label>
            <Select
              value={formData.product}
              onValueChange={(v) => handleFormChange("product", v)}
            >
              <SelectTrigger id="smp-product">
                <SelectValue placeholder="Select product..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.style_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="smp-order">Order (optional)</Label>
            <Select
              value={formData.order}
              onValueChange={(v) => handleFormChange("order", v)}
            >
              <SelectTrigger id="smp-order">
                <SelectValue placeholder="Select order..." />
              </SelectTrigger>
              <SelectContent>
                {orders.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.order_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="smp-type">Sample Type *</Label>
            <Select
              value={formData.sample_type}
              onValueChange={(v) => handleFormChange("sample_type", v)}
            >
              <SelectTrigger id="smp-type">
                <SelectValue placeholder="Select sample type..." />
              </SelectTrigger>
              <SelectContent>
                {SAMPLE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {SAMPLE_TYPE_LABELS[t] ?? t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="smp-qty">Quantity</Label>
              <Input
                id="smp-qty"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleFormChange("quantity", e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="smp-date">Required Date *</Label>
              <Input
                id="smp-date"
                type="date"
                value={formData.required_date}
                onChange={(e) =>
                  handleFormChange("required_date", e.target.value)
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="smp-instructions">Special Instructions</Label>
            <Textarea
              id="smp-instructions"
              value={formData.special_instructions}
              onChange={(e) =>
                handleFormChange("special_instructions", e.target.value)
              }
              rows={3}
              placeholder="Any special requirements for this sample..."
              className="resize-none"
            />
          </div>
        </div>
      </FormSheet>
    </div>
  );
}
