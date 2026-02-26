"use client";

import * as React from "react";
import {
  FileText,
  ShoppingCart,
  Truck,
  CreditCard,
  Star,
} from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonutChartCard } from "@/components/charts/donut-chart-card";
import { StatCardSkeleton } from "@/components/ui/loading-skeleton";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_DATA = {
  metrics: {
    pending_indents: 12,
    open_pos_count: 34,
    open_pos_value: 8_750_000,
    deliveries_this_week: 8,
    payments_due: 3_200_000,
  },
  spend_by_category: [
    { label: "Fabric", value: 4_200_000, color: "#2563eb" },
    { label: "Trims", value: 1_350_000, color: "#16a34a" },
    { label: "Chemicals", value: 980_000, color: "#ea580c" },
    { label: "Packing", value: 720_000, color: "#9333ea" },
    { label: "Accessories", value: 450_000, color: "#06b6d4" },
    { label: "Yarn", value: 1_050_000, color: "#dc2626" },
  ],
  supplier_scores: [
    { name: "Arvind Mills", score: 92, type: "top" },
    { name: "Raymond Textiles", score: 88, type: "top" },
    { name: "Bombay Dyeing", score: 85, type: "top" },
    { name: "Welspun Group", score: 82, type: "top" },
    { name: "Vardhman Textiles", score: 79, type: "top" },
    { name: "Prakash Chemicals", score: 48, type: "bottom" },
    { name: "Sai Trims", score: 42, type: "bottom" },
    { name: "Naveen Packing", score: 38, type: "bottom" },
    { name: "Lucky Accessories", score: 35, type: "bottom" },
    { name: "Metro Dyes", score: 30, type: "bottom" },
  ],
  overdue_deliveries: [
    { id: "1", po_number: "PO-2026-0145", supplier: "Arvind Mills", material: "Cotton Twill 200GSM", expected: "2026-02-20", days_late: 6 },
    { id: "2", po_number: "PO-2026-0148", supplier: "Sai Trims", material: "YKK Zippers #5", expected: "2026-02-22", days_late: 4 },
    { id: "3", po_number: "PO-2026-0150", supplier: "Prakash Chemicals", material: "Reactive Dyes (Blue)", expected: "2026-02-23", days_late: 3 },
    { id: "4", po_number: "PO-2026-0152", supplier: "Naveen Packing", material: "Poly Bags 12x18", expected: "2026-02-24", days_late: 2 },
    { id: "5", po_number: "PO-2026-0155", supplier: "Metro Dyes", material: "Softener Chemical", expected: "2026-02-25", days_late: 1 },
  ],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface PurchaseManagerDashboardProps {
  companyId: string;
}

export function PurchaseManagerDashboard({ companyId }: PurchaseManagerDashboardProps) {
  const [data, setData] = React.useState(DEMO_DATA);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const today = new Date().toISOString().split("T")[0];
        const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        const [pendingPOsResult, openPOsResult, deliveriesResult] = await Promise.all([
          supabase
            .from("purchase_orders")
            .select("id")
            .eq("company_id", companyId)
            .eq("status", "pending_approval"),
          supabase
            .from("purchase_orders")
            .select("id, po_number, total_amount, status, expected_delivery_date, suppliers(name)")
            .eq("company_id", companyId)
            .in("status", ["approved", "ordered", "partial"]),
          supabase
            .from("purchase_orders")
            .select("id, po_number, expected_delivery_date, suppliers(name)")
            .eq("company_id", companyId)
            .in("status", ["approved", "ordered", "partial"])
            .lt("expected_delivery_date", today),
        ]);

        const openPOs = openPOsResult.data ?? [];

        if (openPOs.length === 0) {
          setLoading(false);
          return;
        }

        const totalValue = openPOs.reduce((s, po) => s + (po.total_amount ?? 0), 0);

        setData((prev) => ({
          ...prev,
          metrics: {
            pending_indents: pendingPOsResult.data?.length ?? prev.metrics.pending_indents,
            open_pos_count: openPOs.length,
            open_pos_value: totalValue || prev.metrics.open_pos_value,
            deliveries_this_week: prev.metrics.deliveries_this_week,
            payments_due: prev.metrics.payments_due,
          },
        }));
      } catch {
        // Keep demo data
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [companyId]);

  const topSuppliers = data.supplier_scores.filter((s) => s.type === "top");
  const bottomSuppliers = data.supplier_scores.filter((s) => s.type === "bottom");

  return (
    <div className="space-y-6">
      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Indents"
          value={data.metrics.pending_indents}
          icon={<FileText className="h-5 w-5" />}
          color="orange"
          loading={loading}
        />
        <StatCard
          title="Open POs"
          value={`${data.metrics.open_pos_count} (${formatCurrency(data.metrics.open_pos_value)})`}
          icon={<ShoppingCart className="h-5 w-5" />}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Deliveries This Week"
          value={data.metrics.deliveries_this_week}
          icon={<Truck className="h-5 w-5" />}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Payments Due"
          value={formatCurrency(data.metrics.payments_due)}
          icon={<CreditCard className="h-5 w-5" />}
          color="red"
          loading={loading}
        />
      </div>

      {/* Row 2: Spend by Category + Supplier Scores */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <DonutChartCard
              title="Spend by Category"
              data={data.spend_by_category}
              formatTooltipValue={(v) => formatCurrency(v)}
              centerValue={formatCurrency(data.spend_by_category.reduce((s, d) => s + d.value, 0))}
              centerLabel="Total Spend"
              height={340}
            />
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Supplier Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Top 5</h4>
                    <div className="space-y-2">
                      {topSuppliers.map((s, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{s.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 rounded-full bg-gray-100">
                              <div
                                className="h-1.5 rounded-full bg-green-500"
                                style={{ width: `${s.score}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-green-600 tabular-nums w-8 text-right">
                              {s.score}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Bottom 5</h4>
                    <div className="space-y-2">
                      {bottomSuppliers.map((s, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{s.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 rounded-full bg-gray-100">
                              <div
                                className="h-1.5 rounded-full bg-red-400"
                                style={{ width: `${s.score}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-red-600 tabular-nums w-8 text-right">
                              {s.score}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Row 3: Overdue Deliveries */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900">
            Overdue Deliveries
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
                    <th className="pb-2 text-left font-medium text-gray-500">PO #</th>
                    <th className="pb-2 text-left font-medium text-gray-500">Supplier</th>
                    <th className="pb-2 text-left font-medium text-gray-500">Material</th>
                    <th className="pb-2 text-left font-medium text-gray-500">Expected</th>
                    <th className="pb-2 text-right font-medium text-gray-500">Days Late</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.overdue_deliveries.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="py-2.5 font-medium text-gray-900">{d.po_number}</td>
                      <td className="py-2.5 text-gray-600">{d.supplier}</td>
                      <td className="py-2.5 text-gray-600">{d.material}</td>
                      <td className="py-2.5 text-gray-600 tabular-nums">{formatDate(d.expected)}</td>
                      <td className="py-2.5 text-right">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                            d.days_late >= 5
                              ? "bg-red-100 text-red-700"
                              : d.days_late >= 3
                                ? "bg-orange-100 text-orange-700"
                                : "bg-yellow-100 text-yellow-700"
                          )}
                        >
                          {d.days_late}d
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
  );
}
