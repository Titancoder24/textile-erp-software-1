"use client";

import * as React from "react";
import {
  Warehouse,
  ShieldAlert,
  AlertTriangle,
  ClipboardList,
  ArrowUpDown,
} from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { StatCardSkeleton } from "@/components/ui/loading-skeleton";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_DATA = {
  metrics: {
    total_stock_value: 12_450_000,
    in_quarantine: 15,
    low_stock_count: 23,
    pending_grns: 7,
  },
  stock_by_category: [
    { name: "Fabric", value: 5_800_000 },
    { name: "Yarn", value: 2_100_000 },
    { name: "Trims", value: 1_350_000 },
    { name: "Chemicals", value: 980_000 },
    { name: "Accessories", value: 720_000 },
    { name: "Packing", value: 1_500_000 },
  ],
  recent_movements: [
    { id: "1", item: "Cotton Twill 200GSM", type: "IN", qty: "2,500 mtrs", reference: "GRN-0567" },
    { id: "2", item: "YKK Zippers #5", type: "OUT", qty: "5,000 pcs", reference: "MI-0234" },
    { id: "3", item: "Reactive Blue Dye", type: "IN", qty: "150 kg", reference: "GRN-0566" },
    { id: "4", item: "Poly Bags 12x18", type: "OUT", qty: "10,000 pcs", reference: "MI-0233" },
    { id: "5", item: "Sewing Thread White", type: "IN", qty: "200 cones", reference: "GRN-0565" },
    { id: "6", item: "Woven Labels", type: "OUT", qty: "8,000 pcs", reference: "MI-0232" },
  ],
  below_reorder: [
    { id: "1", item: "Cotton Twill 200GSM", category: "Fabric", current: 120, reorder: 500, uom: "mtrs" },
    { id: "2", item: "Elastic 2cm White", category: "Trims", current: 45, reorder: 200, uom: "mtrs" },
    { id: "3", item: "Hang Tags Style A", category: "Accessories", current: 200, reorder: 1000, uom: "pcs" },
    { id: "4", item: "Softener Chemical", category: "Chemicals", current: 8, reorder: 50, uom: "kg" },
    { id: "5", item: "Carton Box 60x40", category: "Packing", current: 30, reorder: 200, uom: "pcs" },
    { id: "6", item: "Care Labels", category: "Accessories", current: 150, reorder: 2000, uom: "pcs" },
  ],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface StoreManagerDashboardProps {
  companyId: string;
}

export function StoreManagerDashboard({ companyId }: StoreManagerDashboardProps) {
  const [data, setData] = React.useState(DEMO_DATA);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();

        const [inventoryResult, quarantineResult, lowStockResult, grnResult] = await Promise.all([
          supabase
            .from("inventory")
            .select("item_type, quantity, rate, status")
            .eq("company_id", companyId)
            .in("status", ["available", "approved"]),
          supabase
            .from("inventory")
            .select("id")
            .eq("company_id", companyId)
            .eq("status", "quarantine"),
          supabase
            .from("inventory")
            .select("id, item_name, item_type, quantity, reorder_level, uom")
            .eq("company_id", companyId)
            .not("reorder_level", "is", null)
            .in("status", ["available", "approved"]),
          supabase
            .from("grns")
            .select("id")
            .eq("company_id", companyId)
            .eq("status", "received"),
        ]);

        const stockItems = inventoryResult.data ?? [];
        if (stockItems.length === 0) {
          setLoading(false);
          return;
        }

        const stockValue = stockItems.reduce((s, i) => s + i.quantity * i.rate, 0);

        const categoryTotals: Record<string, number> = {};
        for (const item of stockItems) {
          categoryTotals[item.item_type] = (categoryTotals[item.item_type] ?? 0) + item.quantity * item.rate;
        }
        const stockByCategory = Object.entries(categoryTotals).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
        }));

        const lowStockItems = (lowStockResult.data ?? []).filter(
          (i) => i.reorder_level !== null && i.quantity <= i.reorder_level
        );

        setData((prev) => ({
          metrics: {
            total_stock_value: stockValue || prev.metrics.total_stock_value,
            in_quarantine: quarantineResult.data?.length ?? prev.metrics.in_quarantine,
            low_stock_count: lowStockItems.length || prev.metrics.low_stock_count,
            pending_grns: grnResult.data?.length ?? prev.metrics.pending_grns,
          },
          stock_by_category: stockByCategory.length > 0 ? stockByCategory : prev.stock_by_category,
          recent_movements: prev.recent_movements,
          below_reorder:
            lowStockItems.length > 0
              ? lowStockItems.slice(0, 10).map((i) => ({
                  id: i.id,
                  item: i.item_name,
                  category: i.item_type,
                  current: i.quantity,
                  reorder: i.reorder_level ?? 0,
                  uom: i.uom ?? "pcs",
                }))
              : prev.below_reorder,
        }));
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
          title="Total Stock Value"
          value={formatCurrency(data.metrics.total_stock_value)}
          icon={<Warehouse className="h-5 w-5" />}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="In Quarantine"
          value={data.metrics.in_quarantine}
          icon={<ShieldAlert className="h-5 w-5" />}
          color="orange"
          loading={loading}
        />
        <StatCard
          title="Low Stock Count"
          value={data.metrics.low_stock_count}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="red"
          loading={loading}
        />
        <StatCard
          title="Pending GRNs"
          value={data.metrics.pending_grns}
          icon={<ClipboardList className="h-5 w-5" />}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Row 2: Stock by Category + Recent Movements */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <BarChartCard
              title="Stock by Category"
              data={data.stock_by_category}
              dataKeys={["value"]}
              xAxisKey="name"
              colors={["#2563eb"]}
              formatTooltipValue={(v) => formatCurrency(v)}
              formatYAxis={(v) => `${(Number(v) / 100_000).toFixed(0)}L`}
              height={300}
            />
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                  <ArrowUpDown className="h-4 w-4 text-blue-500" />
                  Recent Stock Movements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="pb-2 text-left font-medium text-gray-500">Item</th>
                        <th className="pb-2 text-left font-medium text-gray-500">Type</th>
                        <th className="pb-2 text-right font-medium text-gray-500">Qty</th>
                        <th className="pb-2 text-right font-medium text-gray-500">Ref</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data.recent_movements.map((m) => (
                        <tr key={m.id} className="hover:bg-gray-50">
                          <td className="py-2.5 text-gray-900 font-medium max-w-[150px] truncate">
                            {m.item}
                          </td>
                          <td className="py-2.5">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                                m.type === "IN"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              )}
                            >
                              {m.type}
                            </span>
                          </td>
                          <td className="py-2.5 text-right text-gray-600 tabular-nums">{m.qty}</td>
                          <td className="py-2.5 text-right text-gray-500 text-xs">{m.reference}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Row 3: Items Below Reorder Level */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900">
            Items Below Reorder Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-2 text-left font-medium text-gray-500">Item</th>
                    <th className="pb-2 text-left font-medium text-gray-500">Category</th>
                    <th className="pb-2 text-right font-medium text-gray-500">Current</th>
                    <th className="pb-2 text-right font-medium text-gray-500">Reorder Level</th>
                    <th className="pb-2 text-right font-medium text-gray-500">Deficit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.below_reorder.map((item) => {
                    const deficit = item.reorder - item.current;
                    const pct = item.reorder > 0 ? Math.round((item.current / item.reorder) * 100) : 0;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-2.5 font-medium text-gray-900">{item.item}</td>
                        <td className="py-2.5 text-gray-600 capitalize">{item.category}</td>
                        <td className="py-2.5 text-right tabular-nums text-gray-600">
                          {formatNumber(item.current)} {item.uom}
                        </td>
                        <td className="py-2.5 text-right tabular-nums text-gray-600">
                          {formatNumber(item.reorder)} {item.uom}
                        </td>
                        <td className="py-2.5 text-right">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                              pct < 25
                                ? "bg-red-100 text-red-700"
                                : pct < 50
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-yellow-100 text-yellow-700"
                            )}
                          >
                            -{formatNumber(deficit)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
