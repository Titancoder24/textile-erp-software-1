"use client";

import * as React from "react";
import {
  RotateCcw,
  Hash,
  IndianRupee,
  Percent,
  FileWarning,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  cn,
  formatCurrency,
  formatNumber,
  formatDate,
} from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import {
  getReworkCostData,
  type ReworkSummary,
} from "@/lib/actions/analytics";

/* ---------- Types ---------- */

interface ReworkEntry {
  id: string;
  orderNumber: string;
  line: string;
  defectType: string;
  severity: string;
  quantity: number;
  reworkMinutes: number;
  costPerMinute: number;
  threadCost: number;
  handlingCost: number;
  totalCost: number;
  operator: string;
  date: string;
}

/* ---------- Helpers ---------- */

function getSeverityBadge(severity: string) {
  const lower = severity.toLowerCase();
  if (lower === "critical") {
    return (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
        Critical
      </Badge>
    );
  }
  if (lower === "major") {
    return (
      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
        Major
      </Badge>
    );
  }
  if (lower === "minor") {
    return (
      <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
        Minor
      </Badge>
    );
  }
  return (
    <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">
      {severity}
    </Badge>
  );
}

/* ---------- Skeleton ---------- */

function TableSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-4 w-20 rounded bg-gray-200" />
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-4 w-16 rounded bg-gray-200" />
          <div className="h-4 w-28 rounded bg-gray-200" />
          <div className="h-4 w-14 rounded bg-gray-200" />
          <div className="h-4 flex-1 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

/* ---------- Page ---------- */

export default function ReworkCostPage() {
  const { profile } = useProfile();
  const companyId = profile?.company_id;

  const [entries, setEntries] = React.useState<ReworkEntry[]>([]);
  const [summary, setSummary] = React.useState<ReworkSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!companyId) return;

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const result = await getReworkCostData(companyId!);
        if (result.error) {
          if (!cancelled) setError(result.error);
          toast.error("Failed to load rework cost data");
        } else if (result.data) {
          if (!cancelled) {
            setEntries(result.data.entries);
            setSummary(result.data.summary);
          }
        }
      } catch {
        if (!cancelled) setError("An unexpected error occurred");
        toast.error("An unexpected error occurred");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  /* ---------- Chart Data ---------- */

  const defectChartData = React.useMemo(
    () =>
      (summary?.byDefectType ?? []).map((d) => ({
        name: d.defect,
        cost: d.cost,
      })),
    [summary]
  );

  const lineChartData = React.useMemo(
    () =>
      (summary?.byLine ?? []).map((l) => ({
        name: l.line,
        cost: l.cost,
      })),
    [summary]
  );

  /* ---------- Loading State ---------- */

  if (!companyId || loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Rework Cost Tracker"
          description="Track money burned on rework across defects, lines, and orders"
          breadcrumb={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Quality", href: "/quality" },
            { label: "Rework Cost" },
          ]}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCard key={i} title="" value="" loading />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-900">
                Rework Cost by Defect Type
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[280px] animate-pulse rounded bg-gray-100" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-900">
                Rework Cost by Production Line
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[280px] animate-pulse rounded bg-gray-100" />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900">
              Rework Detail Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---------- Error State ---------- */

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Rework Cost Tracker"
          description="Track money burned on rework across defects, lines, and orders"
          breadcrumb={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Quality", href: "/quality" },
            { label: "Rework Cost" },
          ]}
        />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileWarning className="mb-3 h-10 w-10 text-red-300" />
          <p className="text-sm font-medium text-gray-600">{error}</p>
          <p className="text-xs text-gray-400 mt-1">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  /* ---------- Empty State ---------- */

  if (!summary || entries.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Rework Cost Tracker"
          description="Track money burned on rework across defects, lines, and orders"
          breadcrumb={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Quality", href: "/quality" },
            { label: "Rework Cost" },
          ]}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Rework Cost"
            value={formatCurrency(0)}
            icon={<RotateCcw className="h-5 w-5" />}
            color="red"
          />
          <StatCard
            title="Total Rework Pieces"
            value="0"
            icon={<Hash className="h-5 w-5" />}
            color="orange"
          />
          <StatCard
            title="Avg Cost / Piece"
            value={formatCurrency(0)}
            icon={<IndianRupee className="h-5 w-5" />}
            color="blue"
          />
          <StatCard
            title="% of Revenue"
            value="0%"
            icon={<Percent className="h-5 w-5" />}
            color="purple"
          />
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <RotateCcw className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">
            No rework data found
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Rework entries will appear here once quality inspections record
            defects
          </p>
        </div>
      </div>
    );
  }

  /* ---------- Main Render ---------- */

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Rework Cost Tracker"
        description="Track money burned on rework across defects, lines, and orders"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Quality", href: "/quality" },
          { label: "Rework Cost" },
        ]}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Rework Cost"
          value={formatCurrency(summary.totalReworkCost)}
          icon={<RotateCcw className="h-5 w-5" />}
          color="red"
        />
        <StatCard
          title="Total Rework Pieces"
          value={formatNumber(summary.totalReworkPieces)}
          icon={<Hash className="h-5 w-5" />}
          color="orange"
        />
        <StatCard
          title="Avg Cost / Piece"
          value={formatCurrency(summary.avgCostPerPiece)}
          icon={<IndianRupee className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="% of Revenue"
          value={`${summary.revenuePercentage.toFixed(1)}%`}
          icon={<Percent className="h-5 w-5" />}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BarChartCard
          title="Rework Cost by Defect Type"
          data={defectChartData}
          dataKeys={["cost"]}
          xAxisKey="name"
          horizontal
          height={280}
          formatTooltipValue={(value) => formatCurrency(value)}
          formatYAxis={(v) =>
            String(v).length > 14
              ? String(v).slice(0, 14) + "..."
              : String(v)
          }
          colors={["#dc2626", "#f97316", "#eab308", "#3b82f6", "#8b5cf6", "#06b6d4"]}
        />
        <BarChartCard
          title="Rework Cost by Production Line"
          data={lineChartData}
          dataKeys={["cost"]}
          xAxisKey="name"
          height={280}
          formatTooltipValue={(value) => formatCurrency(value)}
          colors={["#2563eb", "#16a34a", "#ea580c", "#9333ea", "#dc2626", "#0891b2"]}
        />
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-900">
              Rework Detail Log
            </CardTitle>
            <span className="text-xs text-gray-400">
              {formatNumber(entries.length)} entries
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Line
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Defect Type
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rework Min
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Labor Cost
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thread Cost
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Total Cost
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {entries.map((entry) => {
                  const laborCost = Math.round(
                    entry.reworkMinutes * entry.costPerMinute
                  );
                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {entry.date ? formatDate(entry.date) : "--"}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 font-mono text-xs">
                        {entry.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {entry.line}
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-[180px] truncate">
                        {entry.defectType}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getSeverityBadge(entry.severity)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                        {formatNumber(entry.quantity)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                        {formatNumber(entry.reworkMinutes)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                        {formatCurrency(laborCost)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                        {formatCurrency(entry.threadCost)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold text-red-700 whitespace-nowrap">
                        {formatCurrency(entry.totalCost)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 bg-gray-50/60">
                  <td
                    className="px-4 py-3 font-semibold text-gray-900"
                    colSpan={5}
                  >
                    Total
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-gray-900">
                    {formatNumber(
                      entries.reduce((s, e) => s + e.quantity, 0)
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-gray-900">
                    {formatNumber(
                      entries.reduce((s, e) => s + e.reworkMinutes, 0)
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-gray-900">
                    {formatCurrency(
                      entries.reduce(
                        (s, e) =>
                          s + Math.round(e.reworkMinutes * e.costPerMinute),
                        0
                      )
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-gray-900">
                    {formatCurrency(
                      entries.reduce((s, e) => s + e.threadCost, 0)
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-bold text-red-700 whitespace-nowrap">
                    {formatCurrency(summary.totalReworkCost)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cost Alert */}
      {summary.revenuePercentage > 2 && (
        <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
          <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
          <div>
            <p className="text-sm font-semibold text-orange-800">
              Rework Cost Exceeds Threshold
            </p>
            <p className="text-xs text-orange-700">
              Rework cost is {summary.revenuePercentage.toFixed(1)}% of
              revenue, exceeding the 2% industry benchmark. Top defect
              contributors:{" "}
              {summary.byDefectType
                .slice(0, 3)
                .map((d) => d.defect)
                .join(", ")}
              . Focus corrective actions on these defect types to reduce
              rework spend.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
