"use client";

import * as React from "react";
import Link from "next/link";
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

// ---------------------------------------------------------------------------
// Types and mock data
// ---------------------------------------------------------------------------

type InquiryStatus = "new" | "costing_done" | "sample_sent" | "negotiation" | "won" | "lost";

interface Inquiry {
  id: string;
  inquiryNumber: string;
  buyer: string;
  style: string;
  quantity: number;
  targetPrice: number;
  currency: string;
  status: InquiryStatus;
  date: string;
  followUpDate?: string;
}

const MOCK_INQUIRIES: Inquiry[] = [
  {
    id: "1",
    inquiryNumber: "INQ-2026-0045",
    buyer: "H&M",
    style: "Men's Polo Shirt",
    quantity: 10000,
    targetPrice: 7.5,
    currency: "USD",
    status: "negotiation",
    date: "2026-02-10",
    followUpDate: "2026-02-28",
  },
  {
    id: "2",
    inquiryNumber: "INQ-2026-0046",
    buyer: "Zara",
    style: "Women's Floral Dress",
    quantity: 5000,
    targetPrice: 18.0,
    currency: "USD",
    status: "sample_sent",
    date: "2026-02-12",
    followUpDate: "2026-03-01",
  },
  {
    id: "3",
    inquiryNumber: "INQ-2026-0044",
    buyer: "Next",
    style: "Kids Pyjama Set",
    quantity: 20000,
    targetPrice: 5.25,
    currency: "USD",
    status: "won",
    date: "2026-01-28",
  },
  {
    id: "4",
    inquiryNumber: "INQ-2026-0043",
    buyer: "ASOS",
    style: "Graphic Tee",
    quantity: 8000,
    targetPrice: 6.0,
    currency: "USD",
    status: "costing_done",
    date: "2026-02-18",
    followUpDate: "2026-03-05",
  },
  {
    id: "5",
    inquiryNumber: "INQ-2026-0042",
    buyer: "Primark",
    style: "Leggings",
    quantity: 30000,
    targetPrice: 3.5,
    currency: "USD",
    status: "lost",
    date: "2026-01-20",
  },
  {
    id: "6",
    inquiryNumber: "INQ-2026-0047",
    buyer: "Marks & Spencer",
    style: "Formal Blazer",
    quantity: 2000,
    targetPrice: 45.0,
    currency: "USD",
    status: "new",
    date: "2026-02-24",
    followUpDate: "2026-03-03",
  },
  {
    id: "7",
    inquiryNumber: "INQ-2026-0041",
    buyer: "Lidl",
    style: "Workwear Trousers",
    quantity: 15000,
    targetPrice: 9.0,
    currency: "USD",
    status: "won",
    date: "2026-01-15",
  },
];

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
      ? inquiries.reduce((sum, i) => sum + i.quantity * i.targetPrice, 0) /
        inquiries.length
      : 0;

  // Rough avg days to convert (mock)
  const avgDays = 18;

  return { total, conversionRate, avgValue, avgDays };
}

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

function buildColumns(router: ReturnType<typeof useRouter>): ColumnDef<Inquiry>[] {
  return [
    {
      accessorKey: "inquiryNumber",
      header: "Inquiry #",
      cell: ({ row }) => (
        <span className="font-mono text-sm font-semibold text-blue-600">
          {row.original.inquiryNumber}
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
      accessorKey: "style",
      header: "Style",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 max-w-[180px] truncate block">
          {row.original.style}
        </span>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => (
        <span className="tabular-nums text-sm">
          {row.original.quantity.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "targetPrice",
      header: "Target Price",
      cell: ({ row }) => (
        <span className="tabular-nums text-sm font-medium">
          {row.original.currency} {row.original.targetPrice.toFixed(2)}
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
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {formatDate(row.original.date)}
        </span>
      ),
    },
    {
      accessorKey: "followUpDate",
      header: "Follow Up",
      cell: ({ row }) =>
        row.original.followUpDate ? (
          <span className="text-sm text-gray-600 whitespace-nowrap">
            {formatDate(row.original.followUpDate)}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
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

const BUYERS_LIST = ["H&M", "Zara", "Marks & Spencer", "Primark", "Next", "Lidl", "ASOS", "Tesco"];

export default function InquiriesPage() {
  const router = useRouter();
  const stats = computeStats(MOCK_INQUIRIES);
  const columns = React.useMemo(() => buildColumns(router), [router]);

  // FormSheet state
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [formData, setFormData] = React.useState({
    buyer: "",
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
    setSaving(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSheetOpen(false);
    setFormData({
      buyer: "",
      product: "",
      expected_quantity: "",
      target_price: "",
      currency: "USD",
      expected_delivery_date: "",
      notes: "",
    });
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

  const FILTERS = [
    {
      key: "buyer",
      label: "Buyer",
      options: [
        "H&M", "Zara", "Marks & Spencer", "Primark", "Next", "Lidl", "ASOS", "Tesco",
      ].map((b) => ({ label: b, value: b })),
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
    count: MOCK_INQUIRIES.filter((i) => i.status === status).length,
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
            data={MOCK_INQUIRIES}
            searchKey="inquiryNumber"
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
              value={formData.buyer}
              onValueChange={(v) => handleFormChange("buyer", v)}
            >
              <SelectTrigger id="inq-buyer">
                <SelectValue placeholder="Select buyer..." />
              </SelectTrigger>
              <SelectContent>
                {BUYERS_LIST.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
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
