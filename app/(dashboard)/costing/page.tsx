"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  Eye,
  Pencil,
  Copy,
  DollarSign,
  FileText,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

import { cn, formatDate, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import { createActionsColumn } from "@/components/data-table/columns";
import { StatusBadge, type StatusConfig } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CostSheetStatus = "draft" | "approved" | "actual";

interface CostSheet {
  id: string;
  costSheetNumber: string;
  product: string;
  orderNumber: string | null;
  version: number;
  status: CostSheetStatus;
  fobPrice: number;
  costPerPiece: number;
  marginPercent: number;
  currency: string;
  date: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_COST_SHEETS: CostSheet[] = [
  {
    id: "1",
    costSheetNumber: "CS-2026-0018",
    product: "Men's Woven Shirt",
    orderNumber: "ORD-2026-0012",
    version: 2,
    status: "approved",
    fobPrice: 8.5,
    costPerPiece: 6.38,
    marginPercent: 24.9,
    currency: "USD",
    date: "2026-01-18",
  },
  {
    id: "2",
    costSheetNumber: "CS-2026-0019",
    product: "Women's Knitwear",
    orderNumber: "ORD-2026-0013",
    version: 1,
    status: "draft",
    fobPrice: 12.0,
    costPerPiece: 8.9,
    marginPercent: 25.8,
    currency: "USD",
    date: "2026-02-01",
  },
  {
    id: "3",
    costSheetNumber: "CS-2026-0020",
    product: "Kids T-Shirt",
    orderNumber: "ORD-2026-0014",
    version: 1,
    status: "approved",
    fobPrice: 4.75,
    costPerPiece: 3.56,
    marginPercent: 25.1,
    currency: "USD",
    date: "2026-02-05",
  },
  {
    id: "4",
    costSheetNumber: "CS-2026-0021",
    product: "Denim Jeans",
    orderNumber: null,
    version: 3,
    status: "actual",
    fobPrice: 15.0,
    costPerPiece: 11.85,
    marginPercent: 21.0,
    currency: "USD",
    date: "2026-01-10",
  },
  {
    id: "5",
    costSheetNumber: "CS-2026-0022",
    product: "Sports Polo",
    orderNumber: "ORD-2026-0010",
    version: 1,
    status: "approved",
    fobPrice: 5.5,
    costPerPiece: 4.13,
    marginPercent: 24.9,
    currency: "USD",
    date: "2026-02-12",
  },
  {
    id: "6",
    costSheetNumber: "CS-2026-0023",
    product: "Casual Hoodie",
    orderNumber: "ORD-2026-0016",
    version: 1,
    status: "draft",
    fobPrice: 22.0,
    costPerPiece: 16.28,
    marginPercent: 26.0,
    currency: "USD",
    date: "2026-02-20",
  },
];

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const COST_STATUS_MAP: Record<string, StatusConfig> = {
  draft: { label: "Draft", color: "yellow" },
  approved: { label: "Approved", color: "green" },
  actual: { label: "Actual", color: "blue" },
};

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

function computeStats(sheets: CostSheet[]) {
  const total = sheets.length;
  const drafts = sheets.filter((s) => s.status === "draft").length;
  const approved = sheets.filter((s) => s.status === "approved").length;
  const avgMargin =
    sheets.length > 0
      ? sheets.reduce((sum, s) => sum + s.marginPercent, 0) / sheets.length
      : 0;
  return { total, drafts, approved, avgMargin };
}

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

function buildColumns(
  router: ReturnType<typeof useRouter>
): ColumnDef<CostSheet>[] {
  return [
    {
      accessorKey: "costSheetNumber",
      header: "CS #",
      cell: ({ row }) => (
        <Link
          href={`/costing/${row.original.id}`}
          className="font-mono text-sm font-semibold text-blue-600 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {row.original.costSheetNumber}
        </Link>
      ),
    },
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-900">
          {row.original.product}
        </span>
      ),
    },
    {
      accessorKey: "orderNumber",
      header: "Order #",
      cell: ({ row }) =>
        row.original.orderNumber ? (
          <span className="font-mono text-sm text-gray-600">
            {row.original.orderNumber}
          </span>
        ) : (
          <span className="text-gray-400">--</span>
        ),
    },
    {
      accessorKey: "version",
      header: "Version",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">v{row.original.version}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.status}
          statusMap={COST_STATUS_MAP}
        />
      ),
      filterFn: (row, _colId, filterValue) =>
        row.original.status === filterValue,
    },
    {
      accessorKey: "costPerPiece",
      header: "Total Cost",
      cell: ({ row }) => (
        <span className="tabular-nums text-sm font-medium">
          {row.original.currency} {row.original.costPerPiece.toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "fobPrice",
      header: "FOB Price",
      cell: ({ row }) => (
        <span className="tabular-nums text-sm font-medium">
          {row.original.currency} {row.original.fobPrice.toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "marginPercent",
      header: "Margin %",
      cell: ({ row }) => (
        <span
          className={cn(
            "tabular-nums text-sm font-semibold",
            row.original.marginPercent >= 25
              ? "text-green-600"
              : row.original.marginPercent >= 15
              ? "text-yellow-600"
              : "text-red-600"
          )}
        >
          {row.original.marginPercent.toFixed(1)}%
        </span>
      ),
    },
    createActionsColumn<CostSheet>([
      {
        label: "View",
        icon: <Eye className="h-4 w-4" />,
        onClick: (row) => router.push(`/costing/${row.id}`),
      },
      {
        label: "Edit",
        icon: <Pencil className="h-4 w-4" />,
        onClick: (row) => router.push(`/costing/${row.id}?edit=true`),
      },
      {
        label: "Duplicate",
        icon: <Copy className="h-4 w-4" />,
        onClick: () => {},
      },
    ]),
  ];
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CostingPage() {
  const router = useRouter();
  const columns = React.useMemo(() => buildColumns(router), [router]);
  const stats = computeStats(MOCK_COST_SHEETS);

  const FILTERS = [
    {
      key: "status",
      label: "Status",
      options: Object.entries(COST_STATUS_MAP).map(([value, { label }]) => ({
        label,
        value,
      })),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Costing"
        description="Manage product cost sheets and pricing analysis"
        actions={
          <Button asChild>
            <Link href="/costing/new">
              <Plus className="mr-2 h-4 w-4" />
              New Cost Sheet
            </Link>
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Cost Sheets"
          value={stats.total}
          icon={<FileText className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Drafts"
          value={stats.drafts}
          icon={<DollarSign className="h-5 w-5" />}
          color="orange"
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Avg. Margin"
          value={`${stats.avgMargin.toFixed(1)}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="purple"
        />
      </div>

      <DataTable
        columns={columns}
        data={MOCK_COST_SHEETS}
        searchKey="costSheetNumber"
        searchPlaceholder="Search by cost sheet number..."
        filters={FILTERS}
        onRowClick={(row) => router.push(`/costing/${row.id}`)}
        actions={
          <Button size="sm" asChild>
            <Link href="/costing/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Cost Sheet
            </Link>
          </Button>
        }
      />
    </div>
  );
}
