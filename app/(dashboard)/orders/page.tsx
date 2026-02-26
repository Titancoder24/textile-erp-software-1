"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  ShoppingBag,
  DollarSign,
  Truck,
  AlertTriangle,
  TrendingUp,
  Plus,
  Eye,
  Pencil,
} from "lucide-react";

import { cn, formatDate, getDaysRemaining } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import { createActionsColumn } from "@/components/data-table/columns";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface Order {
  id: string;
  orderNumber: string;
  buyer: string;
  style: string;
  qty: number;
  fobPrice: number;
  currency: string;
  deliveryDate: string;
  status: string;
}

const MOCK_ORDERS: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2026-0012",
    buyer: "H&M",
    style: "Men's Woven Shirt",
    qty: 12000,
    fobPrice: 8.5,
    currency: "USD",
    deliveryDate: "2026-03-05",
    status: "in_production",
  },
  {
    id: "2",
    orderNumber: "ORD-2026-0013",
    buyer: "Zara",
    style: "Women's Knitwear",
    qty: 8500,
    fobPrice: 12.0,
    currency: "USD",
    deliveryDate: "2026-03-15",
    status: "confirmed",
  },
  {
    id: "3",
    orderNumber: "ORD-2026-0014",
    buyer: "Marks & Spencer",
    style: "Kids T-Shirt",
    qty: 25000,
    fobPrice: 4.75,
    currency: "USD",
    deliveryDate: "2026-03-22",
    status: "in_production",
  },
  {
    id: "4",
    orderNumber: "ORD-2026-0011",
    buyer: "Primark",
    style: "Denim Jeans",
    qty: 6000,
    fobPrice: 15.0,
    currency: "USD",
    deliveryDate: "2026-03-02",
    status: "quality_check",
  },
  {
    id: "5",
    orderNumber: "ORD-2026-0015",
    buyer: "Next",
    style: "Ladies Blouse",
    qty: 4500,
    fobPrice: 9.25,
    currency: "USD",
    deliveryDate: "2026-04-10",
    status: "confirmed",
  },
  {
    id: "6",
    orderNumber: "ORD-2026-0010",
    buyer: "Lidl",
    style: "Sports Polo",
    qty: 18000,
    fobPrice: 5.5,
    currency: "USD",
    deliveryDate: "2026-02-28",
    status: "ready_to_ship",
  },
  {
    id: "7",
    orderNumber: "ORD-2026-0016",
    buyer: "ASOS",
    style: "Casual Hoodie",
    qty: 3200,
    fobPrice: 22.0,
    currency: "USD",
    deliveryDate: "2026-04-25",
    status: "draft",
  },
  {
    id: "8",
    orderNumber: "ORD-2026-0009",
    buyer: "Tesco",
    style: "Basic Tee",
    qty: 30000,
    fobPrice: 3.25,
    currency: "USD",
    deliveryDate: "2026-02-20",
    status: "shipped",
  },
];

// ---------------------------------------------------------------------------
// Stats computation
// ---------------------------------------------------------------------------

function computeStats(orders: Order[]) {
  const active = orders.filter(
    (o) => !["shipped", "delivered", "cancelled"].includes(o.status)
  );
  const totalValue = active.reduce((sum, o) => sum + o.qty * o.fobPrice, 0);
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const shippingThisWeek = active.filter((o) => {
    const d = new Date(o.deliveryDate);
    return d >= now && d <= nextWeek;
  }).length;
  const atRisk = active.filter((o) => getDaysRemaining(o.deliveryDate) < 7).length;
  const onTime = active.filter((o) => getDaysRemaining(o.deliveryDate) >= 0).length;
  const onTimePct = active.length > 0 ? Math.round((onTime / active.length) * 100) : 100;

  return { active: active.length, totalValue, shippingThisWeek, atRisk, onTimePct };
}

// ---------------------------------------------------------------------------
// Row urgency colour helper
// ---------------------------------------------------------------------------

function getRowClassName(deliveryDate: string): string {
  const days = getDaysRemaining(deliveryDate);
  if (days < 0) return "bg-red-50/60 hover:bg-red-50";
  if (days < 7) return "bg-red-50/40 hover:bg-red-50/80";
  if (days <= 15) return "bg-yellow-50/40 hover:bg-yellow-50/80";
  return "hover:bg-blue-50/40";
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

function buildColumns(router: ReturnType<typeof useRouter>): ColumnDef<Order>[] {
  return [
    {
      accessorKey: "orderNumber",
      header: "Order #",
      cell: ({ row }) => (
        <Link
          href={`/orders/${row.original.id}`}
          className="font-mono text-sm font-semibold text-blue-600 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {row.original.orderNumber}
        </Link>
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
      accessorKey: "qty",
      header: "Qty",
      cell: ({ row }) => (
        <span className="tabular-nums text-sm font-medium">
          {row.original.qty.toLocaleString()}
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
      accessorKey: "deliveryDate",
      header: "Delivery Date",
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">
          {formatDate(row.original.deliveryDate)}
        </span>
      ),
    },
    {
      id: "daysRemaining",
      header: "Days Left",
      cell: ({ row }) => {
        const days = getDaysRemaining(row.original.deliveryDate);
        return (
          <span
            className={cn(
              "tabular-nums text-sm font-bold",
              days < 0
                ? "text-red-600"
                : days < 7
                ? "text-red-500"
                : days <= 15
                ? "text-yellow-600"
                : "text-green-600"
            )}
          >
            {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
      filterFn: (row, _colId, filterValue) =>
        row.original.status === filterValue,
    },
    createActionsColumn<Order>([
      {
        label: "View",
        icon: <Eye className="h-4 w-4" />,
        onClick: (row) => router.push(`/orders/${row.id}`),
      },
      {
        label: "Edit",
        icon: <Pencil className="h-4 w-4" />,
        onClick: (row) => router.push(`/orders/${row.id}?edit=true`),
      },
    ]),
  ];
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OrdersPage() {
  const router = useRouter();
  const stats = computeStats(MOCK_ORDERS);
  const columns = React.useMemo(() => buildColumns(router), [router]);

  const STAT_CARDS = [
    {
      title: "Total Active Orders",
      value: stats.active,
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Value",
      value: `$${(stats.totalValue / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Shipping This Week",
      value: stats.shippingThisWeek,
      icon: Truck,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "At Risk (Delayed)",
      value: stats.atRisk,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "On-Time %",
      value: `${stats.onTimePct}%`,
      icon: TrendingUp,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
  ];

  const FILTERS = [
    {
      key: "buyer",
      label: "Buyer",
      options: [
        { label: "H&M", value: "H&M" },
        { label: "Zara", value: "Zara" },
        { label: "Marks & Spencer", value: "Marks & Spencer" },
        { label: "Primark", value: "Primark" },
        { label: "Next", value: "Next" },
        { label: "Lidl", value: "Lidl" },
        { label: "ASOS", value: "ASOS" },
        { label: "Tesco", value: "Tesco" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Confirmed", value: "confirmed" },
        { label: "In Production", value: "in_production" },
        { label: "QC", value: "quality_check" },
        { label: "Ready to Ship", value: "ready_to_ship" },
        { label: "Shipped", value: "shipped" },
        { label: "Delivered", value: "delivered" },
        { label: "Cancelled", value: "cancelled" },
        { label: "On Hold", value: "on_hold" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track all customer orders
          </p>
        </div>
        <Button asChild>
          <Link href="/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {STAT_CARDS.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 leading-tight">
                    {card.title}
                  </p>
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

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100">
            <DataTable
              columns={columns}
              data={MOCK_ORDERS}
              searchKey="orderNumber"
              searchPlaceholder="Search by order number..."
              filters={FILTERS}
              onRowClick={(row) => router.push(`/orders/${row.id}`)}
              actions={
                <Button variant="outline" size="sm" asChild>
                  <Link href="/orders/new">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    New Order
                  </Link>
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <span className="font-medium text-gray-600">Row colours:</span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-6 rounded bg-green-100 border border-green-200" />
          Safe (&gt;15 days)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-6 rounded bg-yellow-100 border border-yellow-200" />
          Warning (7-15 days)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-6 rounded bg-red-100 border border-red-200" />
          Critical (&lt;7 days / overdue)
        </span>
      </div>
    </div>
  );
}
