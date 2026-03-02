"use client";

import * as React from "react";
import {
  Users,
  Package,
  ShieldCheck,
  IndianRupee,
  Calendar,
  Clock,
  Layers,
  CreditCard,
  BarChart3,
} from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import {
  getBuyerInsightsData,
  type BuyerInsight,
} from "@/lib/actions/analytics";

/* ---------- Helpers ---------- */

const PAYMENT_RELIABILITY_CONFIG: Record<
  BuyerInsight["paymentReliability"],
  { cls: string; label: string }
> = {
  excellent: {
    cls: "bg-green-100 text-green-700 border-green-200",
    label: "Excellent",
  },
  good: {
    cls: "bg-blue-100 text-blue-700 border-blue-200",
    label: "Good",
  },
  fair: {
    cls: "bg-yellow-100 text-yellow-700 border-yellow-200",
    label: "Fair",
  },
  poor: {
    cls: "bg-red-100 text-red-700 border-red-200",
    label: "Poor",
  },
};

function formatINR(amount: number): string {
  if (amount >= 10000000) return `${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return amount.toLocaleString("en-IN");
}

function getQcColor(rate: number): string {
  if (rate >= 90) return "text-green-700";
  if (rate >= 75) return "text-amber-600";
  return "text-red-600";
}

function getQcBg(rate: number): string {
  if (rate >= 90) return "bg-green-100";
  if (rate >= 75) return "bg-amber-100";
  return "bg-red-100";
}

/* ---------- Component ---------- */

export default function BuyerInsightsPage() {
  const { profile } = useProfile();
  const companyId = profile?.company_id;

  const [insights, setInsights] = React.useState<BuyerInsight[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchData = React.useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const result = await getBuyerInsightsData(companyId);
      if (result.data) {
        setInsights(result.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalActiveBuyers = insights.length;
  const avgOrderSize =
    insights.length > 0
      ? Math.round(
          insights.reduce((s, b) => s + b.avgOrderSize, 0) / insights.length
        )
      : 0;
  const avgQcPassRate =
    insights.length > 0
      ? Math.round(
          (insights.reduce((s, b) => s + b.qcPassRate, 0) / insights.length) *
            10
        ) / 10
      : 0;
  const totalRevenue = insights.reduce((s, b) => s + b.totalRevenue, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Buyer Behavior & Pattern Insights"
          description="Intelligence dashboard about buyer ordering patterns and preferences"
          breadcrumb={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Buyer Insights" },
          ]}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCard key={i} title="" value="" loading />
          ))}
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Buyer Behavior & Pattern Insights"
        description="Intelligence dashboard about buyer ordering patterns and preferences"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Buyer Insights" },
        ]}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Active Buyers"
          value={totalActiveBuyers}
          icon={<Users className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Avg Order Size"
          value={formatNumber(avgOrderSize) + " pcs"}
          icon={<Package className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Avg QC Pass Rate"
          value={`${avgQcPassRate}%`}
          icon={<ShieldCheck className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<IndianRupee className="h-5 w-5" />}
          color="blue"
        />
      </div>

      {/* Buyer Insight Cards Grid */}
      {insights.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">
              No buyer data found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Add buyers and create orders to see behavior insights
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {insights.map((buyer) => {
            const paymentConfig =
              PAYMENT_RELIABILITY_CONFIG[buyer.paymentReliability];
            return (
              <Card key={buyer.id} className="overflow-hidden">
                {/* Card Header - Buyer Name & Code */}
                <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold text-gray-900">
                        {buyer.name}
                      </CardTitle>
                      <p className="text-xs font-mono text-gray-400 mt-0.5">
                        {buyer.code}
                      </p>
                    </div>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                      <BarChart3 className="h-4.5 w-4.5 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  {/* Row 1: Avg Order Size | Total Orders | Total Revenue */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-blue-50/60 p-2.5 text-center">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-blue-500">
                        Avg Order Size
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-blue-900 tabular-nums">
                        {formatNumber(buyer.avgOrderSize)}
                      </p>
                      <p className="text-[10px] text-blue-400">pcs</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-2.5 text-center">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                        Total Orders
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-gray-900 tabular-nums">
                        {buyer.totalOrders}
                      </p>
                      <p className="text-[10px] text-gray-400">orders</p>
                    </div>
                    <div className="rounded-lg bg-green-50/60 p-2.5 text-center">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-green-500">
                        Total Revenue
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-green-900 tabular-nums">
                        {formatINR(buyer.totalRevenue)}
                      </p>
                      <p className="text-[10px] text-green-400">
                        {buyer.totalRevenue > 0 ? "INR" : "--"}
                      </p>
                    </div>
                  </div>

                  {/* Row 2: Lead Time | Sample Rounds | Payment Terms */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <div>
                        <p className="text-[10px] text-gray-400">Lead Time</p>
                        <p className="text-xs font-semibold text-gray-700">
                          {buyer.avgLeadTimeDays > 0
                            ? `${buyer.avgLeadTimeDays} days`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <div>
                        <p className="text-[10px] text-gray-400">
                          Sample Rounds
                        </p>
                        <p className="text-xs font-semibold text-gray-700">
                          {buyer.avgSampleRounds > 0
                            ? buyer.avgSampleRounds
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <div>
                        <p className="text-[10px] text-gray-400">
                          Payment Terms
                        </p>
                        <p className="text-xs font-semibold text-gray-700">
                          {buyer.avgPaymentDays} days
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: QC Pass Rate | Rejection Rate | Payment Reliability */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                          getQcBg(buyer.qcPassRate)
                        )}
                      >
                        <span
                          className={cn(
                            "text-xs font-bold tabular-nums",
                            getQcColor(buyer.qcPassRate)
                          )}
                        >
                          {buyer.qcPassRate}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">
                          QC Pass Rate
                        </p>
                        <p
                          className={cn(
                            "text-xs font-semibold",
                            getQcColor(buyer.qcPassRate)
                          )}
                        >
                          {buyer.qcPassRate}%
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">
                        Rejection Rate
                      </p>
                      <p
                        className={cn(
                          "text-xs font-semibold",
                          buyer.rejectionRate > 10
                            ? "text-red-600"
                            : buyer.rejectionRate > 5
                            ? "text-amber-600"
                            : "text-green-700"
                        )}
                      >
                        {buyer.rejectionRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 mb-0.5">
                        Payment
                      </p>
                      <Badge
                        className={cn(
                          "text-[10px] border",
                          paymentConfig.cls
                        )}
                      >
                        {paymentConfig.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Row 4: Preferred Styles as tags */}
                  {buyer.preferredStyles.length > 0 && (
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400 mb-1.5">
                        Preferred Styles
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {buyer.preferredStyles.map((style) => (
                          <span
                            key={style}
                            className="inline-block rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700 border border-purple-100"
                          >
                            {style}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Row 5: Seasonal Pattern + Last Order */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{buyer.seasonalPattern}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {buyer.lastOrderDate
                        ? `Last order: ${formatDate(buyer.lastOrderDate)}`
                        : "No orders yet"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
