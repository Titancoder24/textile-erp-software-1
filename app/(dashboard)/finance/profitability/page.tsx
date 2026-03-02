"use client";

import * as React from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Minus,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
  ReferenceLine,
} from "recharts";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompany } from "@/contexts/company-context";
import { getStyleProfitability } from "@/lib/actions/finance";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ComputedStyle {
  id: string;
  styleCode: string;
  styleName: string;
  buyer: string;
  orderQty: number;
  fobPriceUsd: number;
  fobPriceInr: number;
  actualCogs: number;
  profitPerPiece: number;
  actualMarginPct: number;
  budgetedMarginPct: number;
  variancePct: number;
  status: "profitable" | "breakeven" | "loss";
  varianceReason: string;
  totalRevenue: number;
  totalProfit: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStatusBadge(status: ComputedStyle["status"]) {
  const map = {
    profitable: {
      cls: "bg-green-100 text-green-700 border-green-200",
      label: "Profitable",
      icon: CheckCircle2,
      iconColor: "text-green-600",
    },
    breakeven: {
      cls: "bg-amber-100 text-amber-700 border-amber-200",
      label: "Break-even",
      icon: Minus,
      iconColor: "text-amber-500",
    },
    loss: {
      cls: "bg-red-100 text-red-700 border-red-200",
      label: "Loss",
      icon: AlertTriangle,
      iconColor: "text-red-600",
    },
  };
  return map[status];
}

const DATE_RANGES = ["This Month", "Last 3 Months", "Last 6 Months", "YTD", "Last Year"];

const BUYER_COLORS: Record<string, string> = {
  "H&M": "#3b82f6",
  Zara: "#8b5cf6",
  Next: "#10b981",
  Primark: "#f59e0b",
  Lidl: "#6366f1",
  ASOS: "#ec4899",
  Tesco: "#14b8a6",
};

function getBuyerColor(buyer: string): string {
  return BUYER_COLORS[buyer] ?? "#6b7280";
}

// Custom scatter tooltip
function ScatterTooltip({ active, payload }: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: Array<{ payload: any }>;
}) {
  if (!active || !payload || !payload[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-md text-xs">
      <p className="font-bold text-gray-800 mb-1">{d.name}</p>
      <p className="text-gray-500">Buyer: <span className="font-medium text-gray-700">{d.buyer}</span></p>
      <p className="text-gray-500">Qty: <span className="font-medium text-gray-700">{d.qty.toLocaleString()} pcs</span></p>
      <p className="text-gray-500">Margin: <span className="font-medium text-green-700">{d.margin}%</span></p>
      <p className="text-gray-500">Revenue: <span className="font-medium text-gray-700">{d.revenue.toFixed(1)}L</span></p>
    </div>
  );
}

// Custom bar tooltip
function MarginTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm text-xs max-w-[200px]">
      <p className="font-semibold text-gray-700 mb-1.5 leading-tight">
        {label}
      </p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-3">
          <span>{p.name}:</span>
          <span className="font-bold">{p.value}%</span>
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function StyleProfitabilityPage() {
  const { companyId } = useCompany();
  const [styles, setStyles] = React.useState<ComputedStyle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeDateRange, setActiveDateRange] = React.useState("Last 6 Months");
  const [sortBy, setSortBy] = React.useState<"margin" | "qty" | "revenue">("margin");
  const [filterBuyer, setFilterBuyer] = React.useState("All");

  const fetchProfitability = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await getStyleProfitability(companyId);
      if (error) {
        toast.error("Failed to load profitability data");
        return;
      }
      if (!data || data.length === 0) {
        setStyles([]);
        return;
      }

      // Map cost_sheets with joined products and sales_orders to ComputedStyle
      const computed: ComputedStyle[] = data.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (cs: any) => {
          const product = cs.products;
          const order = cs.sales_orders;
          const styleCode = product?.style_code ?? cs.cs_number;
          const styleName = product?.name ?? "Unknown Product";
          const buyer = "Buyer"; // cost_sheets don't have buyer_id directly

          const exchangeRate = Number(cs.exchange_rate) || 83.5;
          const fobPriceUsd = Number(cs.fob_price_usd) || Number(cs.fob_price) || 0;
          const fobPriceInr = Math.round(fobPriceUsd * exchangeRate);
          const totalCost = Number(cs.total_cost) || 0;
          const orderQty = order?.total_quantity ?? 1;

          const profitPerPiece = fobPriceInr - totalCost;
          const actualMarginPct = fobPriceInr > 0 ? (profitPerPiece / fobPriceInr) * 100 : 0;
          const budgetedMarginPct = Number(cs.profit_percent) || 10;
          const variancePct = actualMarginPct - budgetedMarginPct;

          let status: ComputedStyle["status"];
          if (actualMarginPct >= 15) status = "profitable";
          else if (actualMarginPct >= 5) status = "breakeven";
          else status = "loss";

          return {
            id: cs.id,
            styleCode,
            styleName,
            buyer,
            orderQty,
            fobPriceUsd,
            fobPriceInr,
            actualCogs: totalCost,
            profitPerPiece,
            actualMarginPct,
            budgetedMarginPct,
            variancePct,
            status,
            varianceReason: "",
            totalRevenue: fobPriceInr * orderQty,
            totalProfit: profitPerPiece * orderQty,
          };
        }
      );

      setStyles(computed);
    } catch {
      toast.error("Failed to load profitability data");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  React.useEffect(() => {
    fetchProfitability();
  }, [fetchProfitability]);

  const buyers = React.useMemo(
    () => ["All", ...Array.from(new Set(styles.map((s) => s.buyer))).sort()],
    [styles]
  );

  const filtered = React.useMemo(() => {
    let data = [...styles];
    if (filterBuyer !== "All") {
      data = data.filter((s) => s.buyer === filterBuyer);
    }
    if (sortBy === "margin") data.sort((a, b) => b.actualMarginPct - a.actualMarginPct);
    else if (sortBy === "qty") data.sort((a, b) => b.orderQty - a.orderQty);
    else data.sort((a, b) => b.totalRevenue - a.totalRevenue);
    return data;
  }, [styles, sortBy, filterBuyer]);

  const profitableCount = styles.filter((s) => s.status === "profitable").length;
  const lossCount = styles.filter((s) => s.status === "loss").length;
  const avgMargin = styles.length > 0 ? styles.reduce((s, st) => s + st.actualMarginPct, 0) / styles.length : 0;
  const bestStyle = styles.length > 0 ? [...styles].sort((a, b) => b.actualMarginPct - a.actualMarginPct)[0] : null;

  // Top 10 styles for margin comparison bar chart
  const top10MarginChart = React.useMemo(() => {
    return [...styles]
      .sort((a, b) => b.actualMarginPct - a.actualMarginPct)
      .slice(0, 10)
      .map((s) => ({
        name: s.styleCode.length > 10 ? s.styleCode.slice(-6) : s.styleCode,
        fullName: s.styleName,
        budgeted: Number(s.budgetedMarginPct.toFixed(1)),
        actual: Number(s.actualMarginPct.toFixed(1)),
        variance: Number(s.variancePct.toFixed(1)),
      }));
  }, [styles]);

  // Scatter chart data
  const scatterData = React.useMemo(() => {
    return styles.map((s) => ({
      qty: s.orderQty,
      margin: Number(s.actualMarginPct.toFixed(1)),
      revenue: s.totalRevenue / 100000,
      name: s.styleCode,
      buyer: s.buyer,
    }));
  }, [styles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Style Profitability"
        description="Margin analysis and variance explanation across all styles"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Finance & P&L", href: "/finance" },
          { label: "Style Profitability" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {DATE_RANGES.map((range) => (
              <button
                key={range}
                onClick={() => setActiveDateRange(range)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  activeDateRange === range
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                )}
              >
                {range}
              </button>
            ))}
          </div>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            title: "Styles Analyzed",
            value: styles.length,
            sub: `${activeDateRange}`,
            icon: BarChart3,
            color: "text-blue-600",
            bg: "bg-blue-50",
            positive: true,
          },
          {
            title: "Best Margin Style",
            value: bestStyle?.styleCode ?? "--",
            sub: bestStyle ? `${bestStyle.actualMarginPct.toFixed(1)}% - ${bestStyle.buyer}` : "No data",
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-50",
            positive: true,
          },
          {
            title: "Avg Margin",
            value: `${avgMargin.toFixed(1)}%`,
            sub: "across all styles",
            icon: BarChart3,
            color: avgMargin >= 20 ? "text-green-600" : "text-amber-500",
            bg: avgMargin >= 20 ? "bg-green-50" : "bg-amber-50",
            positive: avgMargin >= 20,
          },
          {
            title: "Loss-Making Styles",
            value: lossCount,
            sub: `${profitableCount} profitable`,
            icon: lossCount > 0 ? AlertTriangle : CheckCircle2,
            color: lossCount > 0 ? "text-red-600" : "text-green-600",
            bg: lossCount > 0 ? "bg-red-50" : "bg-green-50",
            positive: lossCount === 0,
          },
        ].map((card) => (
          <Card key={card.title}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 leading-tight">{card.title}</p>
                  <p className="mt-1 text-xl font-black tabular-nums text-gray-900 truncate">
                    {card.value}
                  </p>
                  <p
                    className={cn(
                      "text-xs mt-0.5 flex items-center gap-0.5",
                      card.positive ? "text-green-600" : "text-red-500"
                    )}
                  >
                    {card.positive ? (
                      <TrendingUp className="h-3 w-3 shrink-0" />
                    ) : (
                      <TrendingDown className="h-3 w-3 shrink-0" />
                    )}
                    {card.sub}
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

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Budgeted vs Actual Margin Bar Chart */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Budgeted vs Actual Margin - Top 10 Styles</CardTitle>
          </CardHeader>
          <CardContent>
            {top10MarginChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={top10MarginChart} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `${v}%`}
                    tickLine={false}
                    domain={[0, 35]}
                  />
                  <Tooltip content={<MarginTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <ReferenceLine y={15} stroke="#22c55e" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: "Target 15%", fontSize: 10, fill: "#16a34a" }} />
                  <Bar
                    dataKey="budgeted"
                    fill="#e5e7eb"
                    radius={[4, 4, 0, 0]}
                    name="Budgeted"
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="actual"
                    radius={[4, 4, 0, 0]}
                    name="Actual"
                    maxBarSize={28}
                  >
                    {top10MarginChart.map((entry, index) => (
                      <rect
                        key={`rect-${index}`}
                        fill={
                          entry.actual >= entry.budgeted
                            ? "#22c55e"
                            : entry.actual >= 15
                            ? "#3b82f6"
                            : "#ef4444"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">
                No approved cost sheets found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scatter Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Qty vs Margin (bubble = revenue)</CardTitle>
          </CardHeader>
          <CardContent>
            {scatterData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    dataKey="qty"
                    name="Order Qty"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                    tickLine={false}
                    label={{ value: "Order Qty", position: "insideBottom", offset: -2, fontSize: 10, fill: "#9ca3af" }}
                  />
                  <YAxis
                    type="number"
                    dataKey="margin"
                    name="Margin"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => `${v}%`}
                    tickLine={false}
                    domain={[0, 35]}
                  />
                  <ZAxis
                    type="number"
                    dataKey="revenue"
                    range={[60, 400]}
                    name="Revenue (L)"
                  />
                  <Tooltip content={<ScatterTooltip />} />
                  <ReferenceLine y={15} stroke="#22c55e" strokeDasharray="4 4" strokeWidth={1.5} />
                  <ReferenceLine y={5} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} />
                  {/* Group by buyer */}
                  {Array.from(new Set(scatterData.map((d) => d.buyer))).map((buyer) => {
                    const data = scatterData.filter((d) => d.buyer === buyer);
                    if (!data.length) return null;
                    return (
                      <Scatter
                        key={buyer}
                        name={buyer}
                        data={data}
                        fill={getBuyerColor(buyer)}
                        fillOpacity={0.7}
                      />
                    );
                  })}
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profitability Ranking Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Style-wise Profitability Ranking</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Buyer filter */}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>Buyer:</span>
                {buyers.map((b) => (
                  <button
                    key={b}
                    onClick={() => setFilterBuyer(b)}
                    className={cn(
                      "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                      filterBuyer === b
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {b}
                  </button>
                ))}
              </div>
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="margin">Sort: Margin</option>
                <option value="qty">Sort: Quantity</option>
                <option value="revenue">Sort: Revenue</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Style Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Style Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Qty
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    FOB (INR)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual COGS
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit/pc
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Margin %
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    vs Budget
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((style, idx) => {
                  const badge = getStatusBadge(style.status);
                  const BadgeIcon = badge.icon;
                  return (
                    <tr
                      key={style.id}
                      className={cn(
                        "hover:bg-gray-50/60 transition-colors",
                        style.status === "loss" && "bg-red-50/20"
                      )}
                    >
                      <td className="px-4 py-3 text-gray-400 text-xs tabular-nums w-8">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-blue-700">
                          {style.styleCode}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-[160px]">
                        <span className="text-sm font-medium text-gray-800 block truncate">
                          {style.styleName}
                        </span>
                        {style.varianceReason && (
                          <span className="text-[11px] text-gray-400 block truncate leading-tight">
                            {style.varianceReason}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block rounded-md px-2 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: `${getBuyerColor(style.buyer)}15`,
                            color: getBuyerColor(style.buyer),
                          }}
                        >
                          {style.buyer}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-700 text-sm">
                        {style.orderQty.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-700 text-sm">
                        {style.fobPriceInr.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-600 text-sm">
                        {style.actualCogs.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold text-sm">
                        <span
                          className={
                            style.profitPerPiece > 0
                              ? "text-green-700"
                              : "text-red-600"
                          }
                        >
                          {Math.round(style.profitPerPiece).toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold min-w-[48px]",
                            style.actualMarginPct >= 20
                              ? "bg-green-100 text-green-700"
                              : style.actualMarginPct >= 10
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          )}
                        >
                          {style.actualMarginPct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-xs font-semibold tabular-nums",
                            style.variancePct >= 0 ? "text-green-600" : "text-red-500"
                          )}
                        >
                          {style.variancePct >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {style.variancePct >= 0 ? "+" : ""}
                          {style.variancePct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
                            badge.cls
                          )}
                        >
                          <BadgeIcon className={cn("h-3 w-3", badge.iconColor)} />
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Summary Footer */}
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td colSpan={4} className="px-4 py-3 font-semibold text-gray-700 text-sm">
                    Total / Average ({filtered.length} styles)
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900 text-sm tabular-nums">
                    {filtered.reduce((s, x) => s + x.orderQty, 0).toLocaleString()}
                  </td>
                  <td colSpan={2} />
                  <td className="px-4 py-3 text-right font-bold text-green-700 text-sm tabular-nums">
                    {filtered.length > 0
                      ? `${Math.round(
                          filtered.reduce((s, x) => s + x.profitPerPiece, 0) / filtered.length
                        ).toLocaleString("en-IN")} avg`
                      : "--"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700 min-w-[48px]">
                      {filtered.length > 0
                        ? (
                            filtered.reduce((s, x) => s + x.actualMarginPct, 0) / filtered.length
                          ).toFixed(1)
                        : "0.0"}%
                    </span>
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights Panel */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-green-200 bg-green-50/40">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100">
                <TrendingUp className="h-4 w-4 text-green-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-800">Top Performer</p>
                <p className="text-xs text-green-700 mt-1 leading-relaxed">
                  {bestStyle ? (
                    <>
                      <span className="font-medium">{bestStyle.styleCode}</span> for {bestStyle.buyer} achieved{" "}
                      {bestStyle.actualMarginPct.toFixed(1)}% margin vs {bestStyle.budgetedMarginPct}% budget.
                    </>
                  ) : (
                    "No data available yet. Approve cost sheets to see profitability insights."
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/40">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                <AlertTriangle className="h-4 w-4 text-amber-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800">Margin Erosion Alert</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  {styles.filter((s) => s.variancePct < -2).length} styles are underperforming
                  budget by over 2%. Review cost breakdowns for corrective action.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/40">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <BarChart3 className="h-4 w-4 text-blue-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-800">Revenue vs Margin</p>
                <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                  {styles.length > 0
                    ? `Analyzing ${styles.length} styles. Average margin: ${avgMargin.toFixed(1)}%. High-volume styles may show lower margins while premium styles drive margin efficiency.`
                    : "No data available. Create and approve cost sheets to generate profitability analysis."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
