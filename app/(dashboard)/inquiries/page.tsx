"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  MessageSquare,
  TrendingUp,
  DollarSign,
  Clock,
  Plus,
  Eye,
  Pencil,
} from "lucide-react";

import { cn, formatDate } from "@/lib/utils";
import { CURRENCIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/data-table/data-table";
import { createActionsColumn } from "@/components/data-table/columns";
import { FormSheet } from "@/components/forms/form-sheet";
import { useCompany } from "@/contexts/company-context";
import { getInquiries, createInquiry } from "@/lib/actions/inquiries";
import { getBuyers } from "@/lib/actions/buyers";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type InquiryStatus = "new" | "costing_done" | "sample_sent" | "negotiation" | "won" | "lost";

interface Inquiry {
  id: string;
  inquiry_number: string;
  buyer_name: string;
  buyer_id: string;
  style: string;
  expected_quantity: number;
  target_price: number;
  currency: string;
  status: InquiryStatus;
  created_at: string;
  expected_delivery_date?: string;
}

interface Buyer {
  id: string;
  name: string;
  code: string;
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

const INQUIRY_STATUS_CONFIG: Record<
  InquiryStatus,
  { label: string; className: string }
> = {
  new: {
    label: "New",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  costing_done: {
    label: "Costing Done",
    className: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  },
  sample_sent: {
    label: "Sample Sent",
    className: "bg-purple-50 text-purple-700 border border-purple-200",
  },
  negotiation: {
    label: "Negotiation",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  won: {
    label: "Won",
    className: "bg-green-50 text-green-700 border border-green-200",
  },
  lost: {
    label: "Lost",
    className: "bg-red-50 text-red-600 border border-red-200",
  },
};

function InquiryStatusBadge({ status }: { status: string }) {
  const config = INQUIRY_STATUS_CONFIG[status as InquiryStatus];
  if (!config) return <span className="text-xs text-gray-400">{status}</span>;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Stats computation
// ---------------------------------------------------------------------------

function computeStats(inquiries: Inquiry[]) {
  const total = inquiries.length;
  const won = inquiries.filter((i) => i.status === "won").length;
  const conversionRate =
    total > 0 ? Math.round((won / total) * 100) : 0;

  const avgValue =
    inquiries.length > 0
      ? inquiries.reduce((sum, i) => sum + i.expected_quantity * i.target_price, 0) /
        inquiries.length
      : 0;

  // Average days from creation to now for won inquiries
  const wonInquiries = inquiries.filter((i) => i.status === "won");
  const avgDays =
    wonInquiries.length > 0
      ? Math.round(
          wonInquiries.reduce((sum, i) => {
            const created = new Date(i.created_at);
            const now = new Date();
            return sum + Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          }, 0) / wonInquiries.length
        )
      : 0;

  return { total, conversionRate, avgValue, avgDays };
}

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

function buildColumns(router: ReturnType<typeof useRouter>): ColumnDef<Inquiry>[] {
  return [
    {
      accessorKey: "inquiry_number",
      header: "Inquiry #",
      cell: ({ row }) => (
        <span className="font-mono text-sm font-semibold text-blue-600">
          {row.original.inquiry_number}
        </span>
      ),
    },
    {
      accessorKey: "buyer_name",
      header: "Buyer",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-900">
          {row.original.buyer_name}
        </span>
      ),
    },
    {
      accessorKey: "style",
      header: "Style",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 max-w-[180px] truncate block">
          {row.original.style}
        </span>
      ),
    },
    {
      accessorKey: "expected_quantity",
      header: "Quantity",
      cell: ({ row }) => (
        <span className="tabular-nums text-sm">
          {row.original.expected_quantity.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "target_price",
      header: "Target Price",
      cell: ({ row }) => (
        <span className="tabular-nums text-sm font-medium">
          {row.original.currency} {Number(row.original.target_price).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <InquiryStatusBadge status={row.original.status} />,
      filterFn: (row, _colId, filterValue) =>
        row.original.status === filterValue,
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
    {
      accessorKey: "expected_delivery_date",
      header: "Delivery Date",
      cell: ({ row }) =>
        row.original.expected_delivery_date ? (
          <span className="text-sm text-gray-600 whitespace-nowrap">
            {formatDate(row.original.expected_delivery_date)}
          </span>
        ) : (
          <span className="text-gray-400">--</span>
        ),
    },
    createActionsColumn<Inquiry>([
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

export default function InquiriesPage() {
  const router = useRouter();
  const { companyId, userId } = useCompany();
  const [inquiries, setInquiries] = React.useState<Inquiry[]>([]);
  const [buyers, setBuyers] = React.useState<Buyer[]>([]);
  const [loading, setLoading] = React.useState(true);

  const columns = React.useMemo(() => buildColumns(router), [router]);

  // Fetch inquiries from Supabase
  const fetchInquiries = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await getInquiries(companyId);
      if (error) {
        toast.error("Failed to load inquiries");
        return;
      }
      const mapped: Inquiry[] = (data ?? []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        inquiry_number: row.inquiry_number as string,
        buyer_name: (row.buyers as Record<string, unknown>)?.name as string ?? "Unknown",
        buyer_id: row.buyer_id as string,
        style: (row.product_name as string) ?? (row.products as Record<string, unknown>)?.name as string ?? "--",
        expected_quantity: (row.expected_quantity as number) ?? 0,
        target_price: (row.target_price as number) ?? 0,
        currency: (row.currency as string) ?? "USD",
        status: row.status as InquiryStatus,
        created_at: row.created_at as string,
        expected_delivery_date: row.expected_delivery_date as string | undefined,
      }));
      setInquiries(mapped);
    } catch {
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Fetch buyers for the form dropdown
  const fetchBuyers = React.useCallback(async () => {
    try {
      const { data, error } = await getBuyers(companyId);
      if (!error && data) {
        setBuyers(
          (data as Record<string, unknown>[]).map((b) => ({
            id: b.id as string,
            name: b.name as string,
            code: b.code as string,
          }))
        );
      }
    } catch {
      // Silently fail for buyers dropdown
    }
  }, [companyId]);

  React.useEffect(() => {
    fetchInquiries();
    fetchBuyers();
  }, [fetchInquiries, fetchBuyers]);

  const stats = computeStats(inquiries);

  // FormSheet state
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [formData, setFormData] = React.useState({
    buyer_id: "",
    product: "",
    expected_quantity: "",
    target_price: "",
    currency: "USD",
    expected_delivery_date: "",
    notes: "",
  });

  function handleFormChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSaveInquiry() {
    if (!formData.buyer_id) {
      toast.error("Please select a buyer");
      return;
    }
    if (!formData.product) {
      toast.error("Please enter a product/style name");
      return;
    }

    setSaving(true);
    try {
      const { error } = await createInquiry({
        company_id: companyId,
        buyer_id: formData.buyer_id,
        product_name: formData.product,
        expected_quantity: formData.expected_quantity ? parseInt(formData.expected_quantity, 10) : 0,
        target_price: formData.target_price ? parseFloat(formData.target_price) : undefined,
        currency: formData.currency,
        expected_delivery_date: formData.expected_delivery_date || undefined,
        notes: formData.notes || undefined,
        status: "new",
        created_by: userId,
      });

      if (error) {
        toast.error(error);
        return;
      }

      toast.success("Inquiry created successfully");
      setSheetOpen(false);
      setFormData({
        buyer_id: "",
        product: "",
        expected_quantity: "",
        target_price: "",
        currency: "USD",
        expected_delivery_date: "",
        notes: "",
      });
      fetchInquiries();
    } catch {
      toast.error("Failed to create inquiry");
    } finally {
      setSaving(false);
    }
  }

  const STAT_CARDS = [
    {
      title: "Total Inquiries",
      value: stats.total,
      icon: MessageSquare,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Conversion Rate",
      value: `${stats.conversionRate}%`,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Avg. Order Value",
      value: `$${(stats.avgValue / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Avg. Days to Convert",
      value: `${stats.avgDays}d`,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  // Build buyer filter options from actual data
  const buyerOptions = React.useMemo(() => {
    const unique = [...new Set(inquiries.map((i) => i.buyer_name))].sort();
    return unique.map((b) => ({ label: b, value: b }));
  }, [inquiries]);

  const FILTERS = [
    {
      key: "buyer_name",
      label: "Buyer",
      options: buyerOptions,
    },
    {
      key: "status",
      label: "Status",
      options: Object.entries(INQUIRY_STATUS_CONFIG).map(([value, { label }]) => ({
        label,
        value,
      })),
    },
  ];

  // Status flow pipeline bar
  const statusCounts = Object.keys(INQUIRY_STATUS_CONFIG).map((status) => ({
    status: status as InquiryStatus,
    label: INQUIRY_STATUS_CONFIG[status as InquiryStatus].label,
    count: inquiries.filter((i) => i.status === status).length,
    className: INQUIRY_STATUS_CONFIG[status as InquiryStatus].className,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and convert buyer inquiries to orders
          </p>
        </div>
        <Button onClick={() => setSheetOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Inquiry
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 leading-tight">{card.title}</p>
                  <p className="mt-1 text-2xl font-black tabular-nums text-gray-900">
                    {card.value}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    card.bg
                  )}
                >
                  <card.icon className={cn("h-5 w-5", card.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status pipeline */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Status Pipeline
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {statusCounts.map((s, idx) => (
              <React.Fragment key={s.status}>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold",
                      s.className
                    )}
                  >
                    {s.label}
                    <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[11px] font-bold">
                      {s.count}
                    </span>
                  </span>
                </div>
                {idx < statusCounts.length - 1 && (
                  <span className="text-gray-300 font-light text-sm">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={inquiries}
            loading={loading}
            searchKey="inquiry_number"
            searchPlaceholder="Search by inquiry number..."
            filters={FILTERS}
            onRowClick={(row) => {}}
            actions={
              <Button size="sm" onClick={() => setSheetOpen(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                New Inquiry
              </Button>
            }
          />
        </CardContent>
      </Card>

      {/* New Inquiry FormSheet */}
      <FormSheet
        title="New Inquiry"
        description="Create a new buyer inquiry to track from costing to conversion."
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSave={handleSaveInquiry}
        saveLabel="Create Inquiry"
        saving={saving}
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="inq-buyer">Buyer *</Label>
            <Select
              value={formData.buyer_id}
              onValueChange={(v) => handleFormChange("buyer_id", v)}
            >
              <SelectTrigger id="inq-buyer">
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
            <Label htmlFor="inq-product">Product / Style *</Label>
            <Input
              id="inq-product"
              value={formData.product}
              onChange={(e) => handleFormChange("product", e.target.value)}
              placeholder="e.g. Men's Polo Shirt"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="inq-qty">Expected Quantity</Label>
              <Input
                id="inq-qty"
                type="number"
                min="0"
                value={formData.expected_quantity}
                onChange={(e) => handleFormChange("expected_quantity", e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inq-price">Target Price</Label>
              <Input
                id="inq-price"
                type="number"
                step="0.01"
                min="0"
                value={formData.target_price}
                onChange={(e) => handleFormChange("target_price", e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inq-currency">Currency</Label>
            <Select
              value={formData.currency}
              onValueChange={(v) => handleFormChange("currency", v)}
            >
              <SelectTrigger id="inq-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inq-delivery">Expected Delivery Date</Label>
            <Input
              id="inq-delivery"
              type="date"
              value={formData.expected_delivery_date}
              onChange={(e) => handleFormChange("expected_delivery_date", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inq-notes">Notes</Label>
            <Textarea
              id="inq-notes"
              value={formData.notes}
              onChange={(e) => handleFormChange("notes", e.target.value)}
              rows={3}
              placeholder="Any additional notes or requirements..."
              className="resize-none"
            />
          </div>
        </div>
      </FormSheet>
    </div>
  );
}
