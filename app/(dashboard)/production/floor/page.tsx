"use client";

import * as React from "react";
import {
  Factory,
  Activity,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Users,
  Clock,
  Target,
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
} from "recharts";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LineCard, type LineData } from "@/components/production/line-card";
import { useCompany } from "@/contexts/company-context";
import { getFloorDashboardData } from "@/lib/actions/production";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildHourlyChartData(line: LineData) {
  return line.hourlyOutput.map((val, idx) => ({
    hour: `${8 + idx}:00`,
    output: val,
  }));
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function FloorDashboardPage() {
  const { companyId } = useCompany();
  const [lines, setLines] = React.useState<LineData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedLine, setSelectedLine] = React.useState<LineData | null>(null);
  const [lastRefresh, setLastRefresh] = React.useState(new Date());
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    const { data, error } = await getFloorDashboardData(companyId);
    if (error) {
      toast.error("Failed to load floor data: " + error);
    } else if (data) {
      const mapped: LineData[] = data.map(
        (line: Record<string, unknown>) => {
          const status: LineData["status"] =
            (line.efficiency as number) > 0
              ? "running"
              : line.current_order_id
              ? "idle"
              : "idle";

          return {
            id: line.line_id as string,
            name: line.line_name as string,
            status,
            currentOrder: (line.current_order_number as string) || undefined,
            buyerName: (line.buyer_name as string) || undefined,
            style: (line.product_name as string) || undefined,
            todayTarget: (line.today_target as number) || 0,
            todayProduced: (line.today_produced as number) || 0,
            efficiency: (line.efficiency as number) || 0,
            operatorsPresent: (line.operators_present as number) || 0,
            operatorsTotal: (line.total_operators as number) || 30,
            defectsToday: (line.today_defects as number) || 0,
            hoursRemaining: (line.hours_remaining as number) || 0,
            hourlyOutput: (line.hourly_output as number[]) || [],
          };
        }
      );
      setLines(mapped);
    }
    setLastRefresh(new Date());
    setLoading(false);
  }, [companyId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 60s
  React.useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 60_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Summary calculations
  const totalOutput = lines.reduce((s, l) => s + l.todayProduced, 0);
  const linesRunning = lines.filter((l) => l.status === "running").length;
  const avgEfficiency =
    lines.length > 0
      ? Math.round(lines.reduce((s, l) => s + l.efficiency, 0) / lines.length)
      : 0;
  const totalDefects = lines.reduce((s, l) => s + l.defectsToday, 0);
  const totalProduced = lines.reduce((s, l) => s + l.todayProduced, 0);
  const defectRate =
    totalProduced > 0
      ? Math.round((totalDefects / totalProduced) * 100 * 10) / 10
      : 0;

  if (loading) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Live Floor Dashboard"
          description="Real-time production line monitoring. Auto-refreshes every 60 seconds."
          breadcrumb={[
            { label: "Production", href: "/production" },
            { label: "Floor Dashboard" },
          ]}
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Live Floor Dashboard"
        description="Real-time production line monitoring. Auto-refreshes every 60 seconds."
        breadcrumb={[
          { label: "Production", href: "/production" },
          { label: "Floor Dashboard" },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={cn("h-4 w-4", refreshing && "animate-spin")}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        }
      />

      {/* Factory Summary Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Factory className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-black tabular-nums text-gray-900">
                  {totalOutput.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Total Output Today</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-600 text-white">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-black tabular-nums text-gray-900">
                  {linesRunning}/{lines.length}
                </p>
                <p className="text-xs text-gray-500">Lines Running</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white",
                  avgEfficiency >= 65
                    ? "bg-green-600"
                    : avgEfficiency >= 50
                    ? "bg-yellow-500"
                    : "bg-red-600"
                )}
              >
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-black tabular-nums text-gray-900">
                  {avgEfficiency}%
                </p>
                <p className="text-xs text-gray-500">Avg Efficiency</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white",
                  defectRate <= 2
                    ? "bg-green-600"
                    : defectRate <= 5
                    ? "bg-orange-500"
                    : "bg-red-600"
                )}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-black tabular-nums text-gray-900">
                  {defectRate}%
                </p>
                <p className="text-xs text-gray-500">Defect Rate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {lines.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Factory className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">
              No production lines configured. Add production lines to see floor
              data.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Line Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {lines.map((line) => (
          <LineCard
            key={line.id}
            line={line}
            onClick={(l) => setSelectedLine(l)}
          />
        ))}
      </div>

      {/* Detail Sheet */}
      <Sheet
        open={!!selectedLine}
        onOpenChange={(open) => {
          if (!open) setSelectedLine(null);
        }}
      >
        <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
          {selectedLine && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full shrink-0",
                      selectedLine.status === "running"
                        ? "bg-green-500"
                        : selectedLine.status === "idle"
                        ? "bg-red-500"
                        : "bg-red-600 animate-pulse"
                    )}
                  />
                  {selectedLine.name}
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Order info */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Current Order</p>
                      <p className="font-medium text-gray-900">
                        {selectedLine.currentOrder || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Buyer</p>
                      <p className="font-medium text-gray-900">
                        {selectedLine.buyerName || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Style</p>
                      <p className="font-medium text-gray-900">
                        {selectedLine.style || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="font-medium capitalize text-gray-900">
                        {selectedLine.status}
                      </p>
                    </div>
                  </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Target className="h-4 w-4" />
                      <span className="text-xs">Today Target</span>
                    </div>
                    <p className="mt-1 text-xl font-bold tabular-nums text-gray-900">
                      {selectedLine.todayTarget.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Factory className="h-4 w-4" />
                      <span className="text-xs">Produced</span>
                    </div>
                    <p className="mt-1 text-xl font-bold tabular-nums text-gray-900">
                      {selectedLine.todayProduced.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="flex items-center gap-2 text-gray-500">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-xs">Efficiency</span>
                    </div>
                    <p
                      className={cn(
                        "mt-1 text-xl font-bold tabular-nums",
                        selectedLine.efficiency >= 65
                          ? "text-green-600"
                          : selectedLine.efficiency >= 50
                          ? "text-yellow-600"
                          : "text-red-600"
                      )}
                    >
                      {selectedLine.efficiency}%
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Users className="h-4 w-4" />
                      <span className="text-xs">Operators</span>
                    </div>
                    <p className="mt-1 text-xl font-bold tabular-nums text-gray-900">
                      {selectedLine.operatorsPresent}/{selectedLine.operatorsTotal}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="flex items-center gap-2 text-gray-500">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs">Defects</span>
                    </div>
                    <p
                      className={cn(
                        "mt-1 text-xl font-bold tabular-nums",
                        selectedLine.defectsToday > 10
                          ? "text-red-600"
                          : "text-gray-900"
                      )}
                    >
                      {selectedLine.defectsToday}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs">Hours Left</span>
                    </div>
                    <p className="mt-1 text-xl font-bold tabular-nums text-gray-900">
                      {selectedLine.hoursRemaining}h
                    </p>
                  </div>
                </div>

                {/* Hourly Output Bar Chart */}
                {selectedLine.hourlyOutput.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-gray-900">
                      Hourly Output
                    </h3>
                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                          data={buildHourlyChartData(selectedLine)}
                          barCategoryGap="20%"
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                          />
                          <XAxis
                            dataKey="hour"
                            tick={{ fontSize: 11, fill: "#9ca3af" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: "#9ca3af" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              fontSize: 12,
                              borderRadius: 8,
                              border: "1px solid #e5e7eb",
                            }}
                          />
                          <Bar
                            dataKey="output"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                            name="Output"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Operator Stats */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    Operator Stats
                  </h3>
                  <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                    <p className="text-sm text-gray-500">
                      {selectedLine.operatorsPresent} of{" "}
                      {selectedLine.operatorsTotal} operators present.
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Attendance:{" "}
                      {selectedLine.operatorsTotal > 0
                        ? Math.round(
                            (selectedLine.operatorsPresent /
                              selectedLine.operatorsTotal) *
                              100
                          )
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
