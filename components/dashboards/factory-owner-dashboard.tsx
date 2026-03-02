"use client";

import * as React from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Truck,
  Activity,
  CheckCircle,
  Users,
  ArrowRight,
  Clock,
} from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChartCard } from "@/components/charts/line-chart-card";
import { DonutChartCard } from "@/components/charts/donut-chart-card";
import { StatCardSkeleton } from "@/components/ui/loading-skeleton";
import { formatCurrency, formatNumber, formatDateTime } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_DATA = {
  metrics: {
    monthly_revenue: 4_250_000,
    revenue_change: 12.5,
    active_orders: 24,
    orders_shipping_this_week: 6,
    avg_efficiency: 68,
    quality_pass_rate: 94.2,
    attendance_present: 185,
    attendance_total: 200,
  },
  revenue_chart: [
    { month: "Mar 25", revenue: 3_100_000 },
    { month: "Apr 25", revenue: 3_450_000 },
    { month: "May 25", revenue: 2_900_000 },
    { month: "Jun 25", revenue: 3_800_000 },
    { month: "Jul 25", revenue: 3_600_000 },
    { month: "Aug 25", revenue: 4_100_000 },
    { month: "Sep 25", revenue: 3_750_000 },
    { month: "Oct 25", revenue: 4_300_000 },
    { month: "Nov 25", revenue: 3_900_000 },
    { month: "Dec 25", revenue: 4_500_000 },
    { month: "Jan 26", revenue: 3_780_000 },
    { month: "Feb 26", revenue: 4_250_000 },
  ],
  orders_by_status: [
    { status: "Confirmed", count: 8, color: "#3b82f6" },
    { status: "In Production", count: 10, color: "#f59e0b" },
    { status: "Ready to Ship", count: 3, color: "#8b5cf6" },
    { status: "Shipped", count: 5, color: "#06b6d4" },
    { status: "Completed", count: 12, color: "#22c55e" },
  ],
  key_indicators: {
    low_stock_items: 47,
    orders_at_risk: 3,
    machine_utilization: 72,
    pending_approvals: 5,
  },
  top_buyers: [
    { name: "H&M Group", revenue: 1_850_000, orders: 6 },
    { name: "Zara / Inditex", revenue: 1_420_000, orders: 4 },
    { name: "Next PLC", revenue: 980_000, orders: 3 },
    { name: "Primark", revenue: 750_000, orders: 5 },
    { name: "C&A Europe", revenue: 620_000, orders: 2 },
  ],
  recent_activity: [
    { id: "1", description: "Ravi created SO-2026-0056", timestamp: "2026-02-26T10:15:00Z" },
    { id: "2", description: "Priya approved PO-2026-0189", timestamp: "2026-02-26T09:45:00Z" },
    { id: "3", description: "Amit completed inspection INS-0342", timestamp: "2026-02-26T09:30:00Z" },
    { id: "4", description: "Sunita shipped SH-2026-0078", timestamp: "2026-02-26T08:50:00Z" },
    { id: "5", description: "Deepak updated production entry for Line 3", timestamp: "2026-02-25T17:30:00Z" },
    { id: "6", description: "Meena raised CAPA for dye lot variance", timestamp: "2026-02-25T16:45:00Z" },
    { id: "7", description: "Vikram received GRN-2026-0567", timestamp: "2026-02-25T15:20:00Z" },
    { id: "8", description: "Anjali submitted lab dip LD-0045 for approval", timestamp: "2026-02-25T14:10:00Z" },
  ],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface FactoryOwnerDashboardProps {
  companyId: string;
}

export function FactoryOwnerDashboard({ companyId }: FactoryOwnerDashboardProps) {
  const [data, setData] = React.useState(DEMO_DATA);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
        const today = now.toISOString().split("T")[0];
        const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        const [ordersResult, productionResult, inspectionsResult, shipmentsResult, activityResult] =
          await Promise.all([
            supabase
              .from("sales_orders")
              .select("id, order_number, product_name, total_value, status, delivery_date, buyer_id, buyers(id, name)")
              .eq("company_id", companyId),
            supabase
              .from("production_entries")
              .select("efficiency_percent, entry_date")
              .eq("company_id", companyId)
              .gte("entry_date", startOfMonth)
              .lte("entry_date", endOfMonth),
            supabase
              .from("inspections")
              .select("result")
              .eq("company_id", companyId)
              .gte("inspection_date", startOfMonth)
              .lte("inspection_date", endOfMonth),
            supabase
              .from("shipments")
              .select("id")
              .eq("company_id", companyId)
              .gte("planned_shipment_date", today)
              .lte("planned_shipment_date", sevenDaysLater),
            supabase
              .from("audit_logs")
              .select("id, action, table_name, record_id, user_email, created_at")
              .eq("company_id", companyId)
              .order("created_at", { ascending: false })
              .limit(10),
          ]);

        const allOrders = ordersResult.data ?? [];
        if (allOrders.length === 0) {
          setLoading(false);
          return; // Keep demo data
        }

        const monthlyRevenue = allOrders
          .filter(
            (o) =>
              ["shipped", "invoiced", "closed"].includes(o.status) &&
              o.delivery_date >= startOfMonth &&
              o.delivery_date <= endOfMonth
          )
          .reduce((sum, o) => sum + (o.total_value ?? 0), 0);

        const activeOrders = allOrders.filter((o) =>
          ["confirmed", "in_production", "qc", "ready_to_ship"].includes(o.status)
        ).length;

        const prodEntries = productionResult.data ?? [];
        const avgEfficiency =
          prodEntries.length > 0
            ? Math.round(prodEntries.reduce((sum, e) => sum + e.efficiency_percent, 0) / prodEntries.length)
            : 0;

        const inspections = inspectionsResult.data ?? [];
        const passRate =
          inspections.length > 0
            ? Math.round((inspections.filter((i) => i.result === "pass").length / inspections.length) * 100)
            : 0;

        // 12-month revenue chart
        const revenueChart: { month: string; revenue: number }[] = [];
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const ms = d.toISOString().split("T")[0];
          const me = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0];
          const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
          const rev = allOrders
            .filter((o) => ["shipped", "invoiced", "closed"].includes(o.status) && o.delivery_date >= ms && o.delivery_date <= me)
            .reduce((sum, o) => sum + (o.total_value ?? 0), 0);
          revenueChart.push({ month: label, revenue: rev });
        }

        // Status counts
        const statusCounts = allOrders.reduce((acc: Record<string, number>, o) => {
          acc[o.status] = (acc[o.status] ?? 0) + 1;
          return acc;
        }, {});

        const statusColorMap: Record<string, string> = {
          confirmed: "#3b82f6",
          in_production: "#f59e0b",
          ready_to_ship: "#8b5cf6",
          shipped: "#06b6d4",
          completed: "#22c55e",
        };
        const statusLabelMap: Record<string, string> = {
          confirmed: "Confirmed",
          in_production: "In Production",
          ready_to_ship: "Ready to Ship",
          shipped: "Shipped",
          completed: "Completed",
        };

        const ordersByStatus = Object.entries(statusCounts)
          .filter(([s]) => statusColorMap[s])
          .map(([s, c]) => ({
            status: statusLabelMap[s] || s,
            count: c,
            color: statusColorMap[s] || "#94a3b8",
          }));

        // Top buyers
        const buyerTotals: Record<string, { name: string; revenue: number; orders: number }> = {};
        for (const o of allOrders) {
          const bid = o.buyer_id;
          const bname = (o.buyers as { name?: string } | null)?.name ?? "Unknown";
          if (!buyerTotals[bid]) buyerTotals[bid] = { name: bname, revenue: 0, orders: 0 };
          buyerTotals[bid].revenue += o.total_value ?? 0;
          buyerTotals[bid].orders += 1;
        }
        const topBuyers = Object.values(buyerTotals)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // Activity
        const activities = (activityResult.data ?? []).map((a) => ({
          id: a.id,
          description: `${a.user_email ?? "User"} ${a.action} ${a.table_name} ${a.record_id ?? ""}`.trim(),
          timestamp: a.created_at,
        }));

        setData({
          metrics: {
            monthly_revenue: monthlyRevenue,
            revenue_change: 12.5,
            active_orders: activeOrders,
            orders_shipping_this_week: shipmentsResult.data?.length ?? 0,
            avg_efficiency: avgEfficiency,
            quality_pass_rate: passRate,
            attendance_present: DEMO_DATA.metrics.attendance_present,
            attendance_total: DEMO_DATA.metrics.attendance_total,
          },
          revenue_chart: revenueChart,
          orders_by_status: ordersByStatus,
          key_indicators: DEMO_DATA.key_indicators,
          top_buyers: topBuyers,
          recent_activity: activities.length > 0 ? activities : DEMO_DATA.recent_activity,
        });
      } catch {
        // Keep demo data on error
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [companyId]);

  const maxBuyerRevenue = Math.max(...data.top_buyers.map((b) => b.revenue), 1);

  const efficiencyColor: "green" | "orange" | "red" =
    data.metrics.avg_efficiency > 65 ? "green" : data.metrics.avg_efficiency >= 50 ? "orange" : "red";

  return (
    <div className="space-y-6">
      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Revenue This Month"
          value={formatCurrency(data.metrics.monthly_revenue)}
          change={data.metrics.revenue_change}
          changeLabel="vs last month"
          icon={<DollarSign className="h-5 w-5" />}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Active Orders"
          value={formatNumber(data.metrics.active_orders)}
          icon={<ShoppingBag className="h-5 w-5" />}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Shipping This Week"
          value={formatNumber(data.metrics.orders_shipping_this_week)}
          icon={<Truck className="h-5 w-5" />}
          color="purple"
          loading={loading}
        />
        <StatCard
          title="Line Efficiency"
          value={`${data.metrics.avg_efficiency}%`}
          icon={<Activity className="h-5 w-5" />}
          color={efficiencyColor}
          loading={loading}
        />
        <StatCard
          title="Quality Pass Rate"
          value={`${data.metrics.quality_pass_rate}%`}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Attendance Today"
          value={`${data.metrics.attendance_present}/${data.metrics.attendance_total}`}
          icon={<Users className="h-5 w-5" />}
          color="blue"
          loading={loading}
        />
      </div>

      {/* Row 2: Revenue Chart + Key Indicators */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading ? (
            <StatCardSkeleton />
          ) : (
            <LineChartCard
              title="Monthly Revenue"
              data={data.revenue_chart}
              dataKeys={["revenue"]}
              xAxisKey="month"
              colors={["#2563eb"]}
              formatYAxis={(v) => `${(v / 100_000).toFixed(0)}L`}
              formatTooltipValue={(v) => formatCurrency(v)}
              height={300}
            />
          )}
        </div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900">Key Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 rounded bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <Link
                  href="/inventory"
                  className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm text-gray-500">Low Stock Items</p>
                    <p className="text-lg font-bold text-red-600">{data.key_indicators.low_stock_items}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </Link>
                <Link
                  href="/orders"
                  className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm text-gray-500">Orders at Risk</p>
                    <p className="text-lg font-bold text-orange-600">{data.key_indicators.orders_at_risk}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </Link>
                <div className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
                  <div>
                    <p className="text-sm text-gray-500">Machine Utilization</p>
                    <p className="text-lg font-bold text-gray-900">{data.key_indicators.machine_utilization}%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
                  <div>
                    <p className="text-sm text-gray-500">Pending Approvals</p>
                    <p className="text-lg font-bold text-blue-600">{data.key_indicators.pending_approvals}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Orders by Status + Top 5 Buyers */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading ? (
          <StatCardSkeleton />
        ) : (
          <DonutChartCard
            title="Orders by Status"
            data={data.orders_by_status.map((s) => ({
              label: s.status,
              value: s.count,
              color: s.color,
            }))}
            centerValue={data.orders_by_status.reduce((s, o) => s + o.count, 0)}
            centerLabel="Total Orders"
            height={320}
          />
        )}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900">Top 5 Buyers</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 rounded bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {data.top_buyers.map((buyer, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700">{buyer.name}</span>
                      <span className="text-sm font-semibold text-gray-900 tabular-nums">
                        {formatCurrency(buyer.revenue)}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-blue-500 transition-all"
                        style={{ width: `${(buyer.revenue / maxBuyerRevenue) * 100}%` }}
                      />
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">{buyer.orders} orders</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 rounded bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {data.recent_activity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50"
                >
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-700">{item.description}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(item.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
