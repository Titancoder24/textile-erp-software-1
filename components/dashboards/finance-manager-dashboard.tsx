"use client";

import * as React from "react";
import {
  DollarSign,
  CreditCard,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { LineChartCard } from "@/components/charts/line-chart-card";
import { StatCardSkeleton } from "@/components/ui/loading-skeleton";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_DATA = {
  metrics: {
    receivables_total: 8_250_000,
    payables_total: 5_600_000,
    overdue_payments: 2_100_000,
    monthly_revenue: 4_250_000,
  },
  receivables_aging: [
    { name: "0-30 days", amount: 3_500_000 },
    { name: "31-60 days", amount: 2_800_000 },
    { name: "61-90 days", amount: 1_200_000 },
    { name: "90+ days", amount: 750_000 },
  ],
  monthly_revenue: [
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
  pending_invoices: [
    { id: "1", invoice: "INV-2026-0145", buyer: "H&M Group", amount: 1_250_000, due_date: "2026-02-28", status: "pending" },
    { id: "2", invoice: "INV-2026-0148", buyer: "Zara / Inditex", amount: 980_000, due_date: "2026-03-05", status: "pending" },
    { id: "3", invoice: "INV-2026-0150", buyer: "Next PLC", amount: 650_000, due_date: "2026-02-20", status: "overdue" },
    { id: "4", invoice: "INV-2026-0152", buyer: "Primark", amount: 420_000, due_date: "2026-02-15", status: "overdue" },
    { id: "5", invoice: "INV-2026-0155", buyer: "C&A Europe", amount: 380_000, due_date: "2026-03-10", status: "pending" },
    { id: "6", invoice: "INV-2026-0158", buyer: "H&M Group", amount: 520_000, due_date: "2026-03-15", status: "pending" },
  ],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface FinanceManagerDashboardProps {
  companyId: string;
}

export function FinanceManagerDashboard({ companyId }: FinanceManagerDashboardProps) {
  const [data, setData] = React.useState(DEMO_DATA);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();

        const [invoicesResult] = await Promise.all([
          supabase
            .from("invoices")
            .select("id, invoice_number, total_amount, due_date, status, buyers(name)")
            .eq("company_id", companyId)
            .in("status", ["pending", "overdue", "partial"]),
        ]);

        const invoices = invoicesResult.data ?? [];
        if (invoices.length === 0) {
          setLoading(false);
          return;
        }

        const pendingInvoices = invoices.map((inv) => ({
          id: inv.id,
          invoice: inv.invoice_number ?? "--",
          buyer: (inv.buyers as { name?: string } | null)?.name ?? "Unknown",
          amount: inv.total_amount ?? 0,
          due_date: inv.due_date ?? "--",
          status: inv.status,
        }));

        const receivables = invoices.reduce((s, i) => s + (i.total_amount ?? 0), 0);
        const overdue = invoices
          .filter((i) => i.status === "overdue")
          .reduce((s, i) => s + (i.total_amount ?? 0), 0);

        setData((prev) => ({
          ...prev,
          metrics: {
            ...prev.metrics,
            receivables_total: receivables || prev.metrics.receivables_total,
            overdue_payments: overdue || prev.metrics.overdue_payments,
          },
          pending_invoices: pendingInvoices.length > 0 ? pendingInvoices.slice(0, 10) : prev.pending_invoices,
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
          title="Receivables Total"
          value={formatCurrency(data.metrics.receivables_total)}
          icon={<DollarSign className="h-5 w-5" />}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Payables Total"
          value={formatCurrency(data.metrics.payables_total)}
          icon={<CreditCard className="h-5 w-5" />}
          color="orange"
          loading={loading}
        />
        <StatCard
          title="Overdue Payments"
          value={formatCurrency(data.metrics.overdue_payments)}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="red"
          loading={loading}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(data.metrics.monthly_revenue)}
          icon={<TrendingUp className="h-5 w-5" />}
          color="green"
          loading={loading}
        />
      </div>

      {/* Row 2: Receivables Aging + Revenue Trend */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <BarChartCard
              title="Receivables Aging"
              data={data.receivables_aging}
              dataKeys={["amount"]}
              xAxisKey="name"
              colors={["#ea580c"]}
              formatTooltipValue={(v) => formatCurrency(v)}
              formatYAxis={(v) => `${(Number(v) / 100_000).toFixed(0)}L`}
              height={300}
            />
            <LineChartCard
              title="Monthly Revenue (12 Months)"
              data={data.monthly_revenue}
              dataKeys={["revenue"]}
              xAxisKey="month"
              colors={["#2563eb"]}
              formatYAxis={(v) => `${(v / 100_000).toFixed(0)}L`}
              formatTooltipValue={(v) => formatCurrency(v)}
              height={300}
            />
          </>
        )}
      </div>

      {/* Row 3: Pending Invoices */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900">
            Pending Invoices
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
                    <th className="pb-2 text-left font-medium text-gray-500">Invoice #</th>
                    <th className="pb-2 text-left font-medium text-gray-500">Buyer</th>
                    <th className="pb-2 text-right font-medium text-gray-500">Amount</th>
                    <th className="pb-2 text-left font-medium text-gray-500">Due Date</th>
                    <th className="pb-2 text-right font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.pending_invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="py-2.5 font-medium text-gray-900">{inv.invoice}</td>
                      <td className="py-2.5 text-gray-600">{inv.buyer}</td>
                      <td className="py-2.5 text-right font-medium tabular-nums text-gray-900">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="py-2.5 text-gray-600 tabular-nums">
                        {inv.due_date !== "--" ? formatDate(inv.due_date) : "--"}
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                            inv.status === "overdue"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          )}
                        >
                          {inv.status === "overdue" ? "Overdue" : "Pending"}
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
