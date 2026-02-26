"use client";

import * as React from "react";
import {
  Package,
  Layers,
  TrendingUp,
  AlertTriangle,
  Gauge,
} from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChartCard } from "@/components/charts/line-chart-card";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { StatCardSkeleton } from "@/components/ui/loading-skeleton";
import { cn, formatNumber } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_LINE_STATS = [
  { line_name: "Line 1", order: "SO-2026-0045", efficiency: 78, produced: 420, target: 500 },
  { line_name: "Line 2", order: "SO-2026-0048", efficiency: 62, produced: 310, target: 500 },
  { line_name: "Line 3", order: "SO-2026-0050", efficiency: 85, produced: 510, target: 600 },
  { line_name: "Line 4", order: "SO-2026-0051", efficiency: 45, produced: 180, target: 400 },
  { line_name: "Line 5", order: "SO-2026-0052", efficiency: 71, produced: 355, target: 500 },
  { line_name: "Line 6", order: "SO-2026-0053", efficiency: 80, produced: 480, target: 600 },
  { line_name: "Line 7", order: "--", efficiency: 0, produced: 0, target: 0 },
  { line_name: "Line 8", order: "--", efficiency: 0, produced: 0, target: 0 },
];

const DEMO_HOURLY_OUTPUT = [
  { hour: "8AM", output: 320 },
  { hour: "9AM", output: 480 },
  { hour: "10AM", output: 510 },
  { hour: "11AM", output: 490 },
  { hour: "12PM", output: 380 },
  { hour: "1PM", output: 290 },
  { hour: "2PM", output: 520 },
  { hour: "3PM", output: 540 },
  { hour: "4PM", output: 500 },
  { hour: "5PM", output: 460 },
];

const DEMO_WEEKLY_EFFICIENCY = [
  { day: "Mon", efficiency: 68 },
  { day: "Tue", efficiency: 72 },
  { day: "Wed", efficiency: 65 },
  { day: "Thu", efficiency: 74 },
  { day: "Fri", efficiency: 70 },
  { day: "Sat", efficiency: 66 },
  { day: "Sun", efficiency: 58 },
];

const DEMO_ALERTS = [
  { id: "1", type: "warning", message: "Line 4 efficiency dropped below 50% -- currently 45%" },
  { id: "2", type: "danger", message: "Lines 7 and 8 are idle -- no work order assigned" },
  { id: "3", type: "warning", message: "WO-2026-0089 is 2 days behind schedule" },
  { id: "4", type: "info", message: "Line 2 efficiency declining since 11AM" },
  { id: "5", type: "danger", message: "Fabric shortage reported for SO-2026-0052" },
];

const DEMO_DATA = {
  metrics: {
    today_output: 2255,
    lines_running: 6,
    total_lines: 8,
    avg_efficiency: 70,
    wip_pieces: 3450,
  },
  line_stats: DEMO_LINE_STATS,
  hourly_output: DEMO_HOURLY_OUTPUT,
  weekly_efficiency: DEMO_WEEKLY_EFFICIENCY,
  alerts: DEMO_ALERTS,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ProductionManagerDashboardProps {
  companyId: string;
}

export function ProductionManagerDashboard({ companyId }: ProductionManagerDashboardProps) {
  const [data, setData] = React.useState(DEMO_DATA);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const today = new Date().toISOString().split("T")[0];

        const [linesResult, entriesResult] = await Promise.all([
          supabase
            .from("production_lines")
            .select("*")
            .eq("company_id", companyId)
            .eq("is_active", true),
          supabase
            .from("production_entries")
            .select("*")
            .eq("company_id", companyId)
            .eq("entry_date", today),
        ]);

        const lines = linesResult.data ?? [];
        const entries = entriesResult.data ?? [];

        if (lines.length === 0 && entries.length === 0) {
          setLoading(false);
          return;
        }

        const lineStats = lines.map((line) => {
          const lineEntries = entries.filter((e) => e.production_line === line.name);
          const produced = lineEntries.reduce((s, e) => s + e.produced_quantity, 0);
          const target = lineEntries.reduce((s, e) => s + e.target_quantity, 0);
          const eff = lineEntries.length > 0
            ? Math.round(lineEntries.reduce((s, e) => s + e.efficiency_percent, 0) / lineEntries.length)
            : 0;
          return {
            line_name: line.name,
            order: lineEntries[0]?.work_order_number ?? "--",
            efficiency: eff,
            produced,
            target,
          };
        });

        const totalProduced = entries.reduce((s, e) => s + e.produced_quantity, 0);
        const running = lineStats.filter((l) => l.efficiency > 0).length;
        const allEff = lineStats.filter((l) => l.efficiency > 0);
        const avgEff = allEff.length > 0
          ? Math.round(allEff.reduce((s, l) => s + l.efficiency, 0) / allEff.length)
          : 0;

        setData((prev) => ({
          ...prev,
          metrics: {
            today_output: totalProduced || prev.metrics.today_output,
            lines_running: running || prev.metrics.lines_running,
            total_lines: lines.length || prev.metrics.total_lines,
            avg_efficiency: avgEff || prev.metrics.avg_efficiency,
            wip_pieces: prev.metrics.wip_pieces,
          },
          line_stats: lineStats.length > 0 ? lineStats : prev.line_stats,
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
          title="Today's Output"
          value={`${formatNumber(data.metrics.today_output)} pcs`}
          icon={<Package className="h-5 w-5" />}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Lines Running"
          value={`${data.metrics.lines_running}/${data.metrics.total_lines}`}
          icon={<Layers className="h-5 w-5" />}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Avg Efficiency"
          value={`${data.metrics.avg_efficiency}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          color={data.metrics.avg_efficiency >= 65 ? "green" : data.metrics.avg_efficiency >= 50 ? "orange" : "red"}
          loading={loading}
        />
        <StatCard
          title="WIP Pieces"
          value={formatNumber(data.metrics.wip_pieces)}
          icon={<Gauge className="h-5 w-5" />}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Row 2: Line Status Grid */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Production Line Status</h3>
        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.line_stats.map((line) => {
              const isIdle = line.efficiency === 0;
              const effColor =
                line.efficiency >= 70
                  ? "text-green-600"
                  : line.efficiency >= 50
                    ? "text-orange-500"
                    : line.efficiency > 0
                      ? "text-red-600"
                      : "text-gray-400";
              const progressPct =
                line.target > 0 ? Math.min(100, Math.round((line.produced / line.target) * 100)) : 0;

              return (
                <Card
                  key={line.line_name}
                  className={cn("transition-shadow hover:shadow-md", isIdle && "opacity-60")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900">{line.line_name}</span>
                      <span className={cn("text-lg font-bold tabular-nums", effColor)}>
                        {isIdle ? "Idle" : `${line.efficiency}%`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{line.order}</p>
                    {!isIdle && (
                      <>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Produced</span>
                          <span className="tabular-nums">
                            {formatNumber(line.produced)}/{formatNumber(line.target)}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-100">
                          <div
                            className={cn(
                              "h-1.5 rounded-full transition-all",
                              progressPct >= 80
                                ? "bg-green-500"
                                : progressPct >= 50
                                  ? "bg-orange-400"
                                  : "bg-red-400"
                            )}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Row 3: Hourly Output + Weekly Efficiency */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <BarChartCard
              title="Today's Hourly Output"
              data={data.hourly_output}
              dataKeys={["output"]}
              xAxisKey="hour"
              colors={["#2563eb"]}
              height={280}
            />
            <LineChartCard
              title="Weekly Efficiency Trend"
              data={data.weekly_efficiency}
              dataKeys={["efficiency"]}
              xAxisKey="day"
              colors={["#16a34a"]}
              formatYAxis={(v) => `${v}%`}
              formatTooltipValue={(v) => `${v}%`}
              height={280}
            />
          </>
        )}
      </div>

      {/* Row 4: Alerts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 rounded bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {data.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg px-4 py-3 text-sm",
                    alert.type === "danger"
                      ? "bg-red-50 text-red-800"
                      : alert.type === "warning"
                        ? "bg-orange-50 text-orange-800"
                        : "bg-blue-50 text-blue-800"
                  )}
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{alert.message}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
