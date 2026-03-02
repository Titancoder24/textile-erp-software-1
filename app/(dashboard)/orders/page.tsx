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
  Loader2,
} from "lucide-react";

import { cn, formatDate, getDaysRemaining } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import { createActionsColumn } from "@/components/data-table/columns";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { useCompany } from "@/contexts/company-context";
import { getOrders } from "@/lib/actions/orders";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Order {
  id: string;
  order_number: string;
  buyer_name: string;
  product_name: string;
  total_quantity: number;
  fob_price: number;
  currency: string;
  delivery_date: string;
  status: string;
}

// ---------------------------------------------------------------------------
// Stats computation
// ---------------------------------------------------------------------------

function computeStats(orders: Order[]) {
  const active = orders.filter(
    (o) => !["shipped", "delivered", "cancelled"].includes(o.status)
  );
  const totalValue = active.reduce((sum, o) => sum + o.total_quantity * o.fob_price, 0);
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const shippingThisWeek = active.filter((o) => {
    const d = new Date(o.delivery_date);
    return d >= now && d <= nextWeek;
  }).length;
  const atRisk = active.filter((o) => getDaysRemaining(o.delivery_date) < 7).length;
  const onTime = active.filter((o) => getDaysRemaining(o.delivery_date) >= 0).length;
  const onTimePct = active.length > 0 ? Math.round((onTime / active.length) * 100) : 100;

  return { active: active.length, totalValue, shippingThisWeek, atRisk, onTimePct };
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

function buildColumns(router: ReturnType<typeof useRouter>): ColumnDef<Order>[] {
  return [
    {
      accessorKey: "order_number",
      header: "Order #",
      cell: ({ row }) => (
        <Link
          href={`/orders/${row.original.id}`}
          className="font-mono text-sm font-semibold text-blue-600 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {row.original.order_number}
        </Link>
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
      accessorKey: "product_name",
      header: "Style",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 max-w-[180px] truncate block">
          {row.original.product_name}
        </span>
      ),
    },
    {
      accessorKey: "total_quantity",
      header: "Qty",
      cell: ({ row }) => (
        <span className="tabular-nums text-sm font-medium">
          {row.original.total_quantity.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "fob_price",
      header: "FOB Price",
      cell: ({ row }) => (
        <span className="tabular-nums text-sm font-medium">
          {row.original.currency} {Number(row.original.fob_price).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "delivery_date",
      header: "Delivery Date",
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">
          {formatDate(row.original.delivery_date)}
        </span>
      ),
    },
    {
      id: "daysRemaining",
      header: "Days Left",
      cell: ({ row }) => {
        const days = getDaysRemaining(row.original.delivery_date);
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
  const { companyId } = useCompany();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchOrders = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await getOrders(companyId);
      if (error) {
        toast.error("Failed to load orders");
        return;
      }
      const mapped: Order[] = (data ?? []).map((o: Record<string, unknown>) => ({
        id: o.id as string,
        order_number: o.order_number as string,
        buyer_name: (o.buyers as Record<string, unknown>)?.name as string ?? "Unknown",
        product_name: o.product_name as string,
        total_quantity: o.total_quantity as number,
        fob_price: o.fob_price as number,
        currency: o.currency as string ?? "USD",
        delivery_date: o.delivery_date as string,
        status: o.status as string,
      }));
      setOrders(mapped);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const stats = computeStats(orders);
  const columns = React.useMemo(() => buildColumns(router), [router]);

  // Build buyer filter options from actual data
  const buyerOptions = React.useMemo(() => {
    const unique = [...new Set(orders.map((o) => o.buyer_name))].sort();
    return unique.map((b) => ({ label: b, value: b }));
  }, [orders]);

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
      key: "buyer_name",
      label: "Buyer",
      options: buyerOptions,
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
              data={orders}
              loading={loading}
              searchKey="order_number"
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
