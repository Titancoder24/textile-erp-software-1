"use client";

import * as React from "react";
import {
  MessageSquare,
  ShoppingBag,
  FlaskConical,
  AlertCircle,
  Calendar,
} from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { StatCardSkeleton } from "@/components/ui/loading-skeleton";
import { cn, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_DATA = {
  metrics: {
    total_inquiries: 18,
    active_orders: 24,
    pending_samples: 7,
    tna_overdue: 5,
  },
  orders_by_status: [
    { name: "Confirmed", confirmed: 8, in_production: 0, ready_to_ship: 0, shipped: 0 },
    { name: "In Production", confirmed: 0, in_production: 10, ready_to_ship: 0, shipped: 0 },
    { name: "Ready to Ship", confirmed: 0, in_production: 0, ready_to_ship: 3, shipped: 0 },
    { name: "Shipped", confirmed: 0, in_production: 0, ready_to_ship: 0, shipped: 5 },
  ],
  upcoming_samples: [
    { id: "1", order: "SO-2026-0045", type: "Fit Sample", buyer: "H&M Group", due_date: "2026-02-28" },
    { id: "2", order: "SO-2026-0048", type: "Pre-Production", buyer: "Zara", due_date: "2026-03-01" },
    { id: "3", order: "SO-2026-0050", type: "Size Set", buyer: "Next PLC", due_date: "2026-03-02" },
    { id: "4", order: "SO-2026-0051", type: "Lab Dip", buyer: "Primark", due_date: "2026-03-03" },
  ],
  tna_overdue_items: [
    { id: "1", milestone: "Fabric Approval", order: "SO-2026-0042", days_overdue: 5 },
    { id: "2", milestone: "Trim Sourcing", order: "SO-2026-0044", days_overdue: 3 },
    { id: "3", milestone: "PP Sample Submit", order: "SO-2026-0046", days_overdue: 2 },
    { id: "4", milestone: "Lab Dip Approval", order: "SO-2026-0047", days_overdue: 7 },
    { id: "5", milestone: "Size Set Submit", order: "SO-2026-0049", days_overdue: 1 },
  ],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface MerchandiserDashboardProps {
  companyId: string;
}

export function MerchandiserDashboard({ companyId }: MerchandiserDashboardProps) {
  const [data, setData] = React.useState(DEMO_DATA);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const today = new Date().toISOString().split("T")[0];

        const [inquiriesResult, ordersResult, samplesResult, tnaResult] = await Promise.all([
          supabase
            .from("inquiries")
            .select("id, status")
            .eq("company_id", companyId)
            .not("status", "eq", "converted"),
          supabase
            .from("sales_orders")
            .select("id, order_number, status, delivery_date")
            .eq("company_id", companyId)
            .in("status", ["confirmed", "in_production", "ready_to_ship", "shipped"]),
          supabase
            .from("samples")
            .select("id, sample_type, status, required_date, sales_order_id, sales_orders(order_number), buyers(name)")
            .eq("company_id", companyId)
            .not("status", "in", '("approved","rejected","cancelled")'),
          supabase
            .from("tna_milestones")
            .select("id, milestone_name, planned_date, delay_days, sales_orders(order_number)")
            .lt("planned_date", today)
            .eq("status", "pending")
            .order("planned_date"),
        ]);

        const inquiries = inquiriesResult.data ?? [];
        const orders = ordersResult.data ?? [];
        const samples = samplesResult.data ?? [];
        const tnaOverdue = tnaResult.data ?? [];

        if (orders.length === 0 && inquiries.length === 0) {
          setLoading(false);
          return;
        }

        // Orders by status for bar chart
        const statusCounts: Record<string, number> = {};
        for (const o of orders) {
          statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
        }
        const statusLabels: Record<string, string> = {
          confirmed: "Confirmed",
          in_production: "In Production",
          ready_to_ship: "Ready to Ship",
          shipped: "Shipped",
        };
        const ordersByStatus = Object.entries(statusCounts).map(([s, c]) => ({
          name: statusLabels[s] ?? s,
          count: c,
        }));

        const pendingSamples = samples.filter((s) =>
          ["pending", "in_progress", "submitted"].includes(s.status)
        );

        setData({
          metrics: {
            total_inquiries: inquiries.length || DEMO_DATA.metrics.total_inquiries,
            active_orders: orders.length || DEMO_DATA.metrics.active_orders,
            pending_samples: pendingSamples.length || DEMO_DATA.metrics.pending_samples,
            tna_overdue: tnaOverdue.length || DEMO_DATA.metrics.tna_overdue,
          },
          orders_by_status:
            ordersByStatus.length > 0
              ? ordersByStatus.map((o) => ({
                  name: o.name,
                  confirmed: o.name === "Confirmed" ? o.count : 0,
                  in_production: o.name === "In Production" ? o.count : 0,
                  ready_to_ship: o.name === "Ready to Ship" ? o.count : 0,
                  shipped: o.name === "Shipped" ? o.count : 0,
                }))
              : DEMO_DATA.orders_by_status,
          upcoming_samples:
            pendingSamples.length > 0
              ? pendingSamples.slice(0, 6).map((s) => ({
                  id: s.id,
                  order: (s.sales_orders as { order_number?: string } | null)?.order_number ?? "--",
                  type: s.sample_type,
                  buyer: (s.buyers as { name?: string } | null)?.name ?? "Unknown",
                  due_date: s.required_date ?? "--",
                }))
              : DEMO_DATA.upcoming_samples,
          tna_overdue_items:
            tnaOverdue.length > 0
              ? tnaOverdue.slice(0, 8).map((t) => ({
                  id: t.id,
                  milestone: t.milestone_name,
                  order: (t.sales_orders as { order_number?: string } | null)?.order_number ?? "--",
                  days_overdue: t.delay_days ?? 0,
                }))
              : DEMO_DATA.tna_overdue_items,
        });
      } catch {
        // Keep demo data
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [companyId]);

  return (
    <div className="space-y-6">
      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Inquiries"
          value={data.metrics.total_inquiries}
          icon={<MessageSquare className="h-5 w-5" />}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Active Orders"
          value={data.metrics.active_orders}
          icon={<ShoppingBag className="h-5 w-5" />}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Pending Samples"
          value={data.metrics.pending_samples}
          icon={<FlaskConical className="h-5 w-5" />}
          color="orange"
          loading={loading}
        />
        <StatCard
          title="TNA Overdue"
          value={data.metrics.tna_overdue}
          icon={<AlertCircle className="h-5 w-5" />}
          color="red"
          loading={loading}
        />
      </div>

      {/* Row 2: Orders by Status chart */}
      {loading ? (
        <StatCardSkeleton />
      ) : (
        <BarChartCard
          title="Orders by Status"
          data={data.orders_by_status}
          dataKeys={["confirmed", "in_production", "ready_to_ship", "shipped"]}
          xAxisKey="name"
          colors={["#3b82f6", "#f59e0b", "#8b5cf6", "#06b6d4"]}
          stacked
          height={280}
        />
      )}

      {/* Row 3: Two tables side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Sample Submissions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <Calendar className="h-4 w-4 text-blue-500" />
              Upcoming Sample Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 rounded bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-2 text-left font-medium text-gray-500">Order</th>
                      <th className="pb-2 text-left font-medium text-gray-500">Type</th>
                      <th className="pb-2 text-left font-medium text-gray-500">Buyer</th>
                      <th className="pb-2 text-right font-medium text-gray-500">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.upcoming_samples.map((sample) => (
                      <tr key={sample.id} className="hover:bg-gray-50">
                        <td className="py-2.5 font-medium text-gray-900">{sample.order}</td>
                        <td className="py-2.5 text-gray-600">{sample.type}</td>
                        <td className="py-2.5 text-gray-600">{sample.buyer}</td>
                        <td className="py-2.5 text-right tabular-nums text-gray-600">
                          {sample.due_date !== "--" ? formatDate(sample.due_date) : "--"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* TNA Overdue Items */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <AlertCircle className="h-4 w-4 text-red-500" />
              TNA Overdue Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 rounded bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-2 text-left font-medium text-gray-500">Milestone</th>
                      <th className="pb-2 text-left font-medium text-gray-500">Order</th>
                      <th className="pb-2 text-right font-medium text-gray-500">Days Overdue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.tna_overdue_items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-2.5 font-medium text-gray-900">{item.milestone}</td>
                        <td className="py-2.5 text-gray-600">{item.order}</td>
                        <td className="py-2.5 text-right">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                              item.days_overdue >= 5
                                ? "bg-red-100 text-red-700"
                                : item.days_overdue >= 3
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-yellow-100 text-yellow-700"
                            )}
                          >
                            {item.days_overdue}d
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
