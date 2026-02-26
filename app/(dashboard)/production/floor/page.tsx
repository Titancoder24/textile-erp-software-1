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

// ---------------------------------------------------------------------------
// Demo data -- in production this comes from getFloorDashboardData()
// ---------------------------------------------------------------------------

const MOCK_LINES: LineData[] = [
  {
    id: "line-1",
    name: "Line 1 - Main Sewing",
    status: "running",
    currentOrder: "ORD-2401",
    buyerName: "H&M",
    style: "Classic Polo Shirt",
    todayTarget: 800,
    todayProduced: 620,
    efficiency: 78,
    operatorsPresent: 32,
    operatorsTotal: 35,
    defectsToday: 8,
    hoursRemaining: 3,
    hourlyOutput: [72, 78, 65, 80, 76, 82, 75, 70],
  },
  {
    id: "line-2",
    name: "Line 2 - Ladies Tops",
    status: "running",
    currentOrder: "ORD-2398",
    buyerName: "Zara",
    style: "Linen Blouse",
    todayTarget: 600,
    todayProduced: 390,
    efficiency: 65,
    operatorsPresent: 28,
    operatorsTotal: 30,
    defectsToday: 12,
    hoursRemaining: 3,
    hourlyOutput: [55, 60, 48, 52, 58, 62, 55],
  },
  {
    id: "line-3",
    name: "Line 3 - Kids Wear",
    status: "running",
    currentOrder: "ORD-2395",
    buyerName: "Next",
    style: "Kids T-Shirt Set",
    todayTarget: 1000,
    todayProduced: 820,
    efficiency: 82,
    operatorsPresent: 30,
    operatorsTotal: 30,
    defectsToday: 5,
    hoursRemaining: 2,
    hourlyOutput: [100, 105, 95, 110, 108, 102, 100, 100],
  },
  {
    id: "line-4",
    name: "Line 4 - Denim",
    status: "running",
    currentOrder: "ORD-2402",
    buyerName: "Primark",
    style: "Slim Fit Jeans",
    todayTarget: 500,
    todayProduced: 275,
    efficiency: 55,
    operatorsPresent: 25,
    operatorsTotal: 28,
    defectsToday: 18,
    hoursRemaining: 4,
    hourlyOutput: [35, 40, 38, 42, 40, 38, 42],
  },
  {
    id: "line-5",
    name: "Line 5 - Outerwear",
    status: "running",
    currentOrder: "ORD-2400",
    buyerName: "M&S",
    style: "Quilted Jacket",
    todayTarget: 400,
    todayProduced: 285,
    efficiency: 71,
    operatorsPresent: 22,
    operatorsTotal: 25,
    defectsToday: 6,
    hoursRemaining: 3,
    hourlyOutput: [38, 40, 35, 42, 38, 45, 47],
  },
  {
    id: "line-6",
    name: "Line 6 - Knits",
    status: "idle",
    currentOrder: "ORD-2403",
    buyerName: "C&A",
    style: "Crew Neck Sweater",
    todayTarget: 600,
    todayProduced: 120,
    efficiency: 42,
    operatorsPresent: 15,
    operatorsTotal: 30,
    defectsToday: 22,
    hoursRemaining: 6,
    hourlyOutput: [35, 40, 25, 20],
  },
  {
    id: "line-7",
    name: "Line 7 - Finishing",
    status: "running",
    currentOrder: "ORD-2399",
    buyerName: "Gap",
    style: "Chino Trousers",
    todayTarget: 700,
    todayProduced: 616,
    efficiency: 88,
    operatorsPresent: 20,
    operatorsTotal: 20,
    defectsToday: 3,
    hoursRemaining: 2,
    hourlyOutput: [80, 78, 75, 82, 80, 78, 76, 67],
  },
  {
    id: "line-8",
    name: "Line 8 - Sportswear",
    status: "breakdown",
    currentOrder: "ORD-2404",
    buyerName: "Decathlon",
    style: "Dry-Fit T-Shirt",
    todayTarget: 900,
    todayProduced: 210,
    efficiency: 35,
    operatorsPresent: 10,
    operatorsTotal: 35,
    defectsToday: 15,
    hoursRemaining: 5,
    hourlyOutput: [60, 65, 45, 40],
  },
];

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
  const [lines] = React.useState<LineData[]>(MOCK_LINES);
  const [selectedLine, setSelectedLine] = React.useState<LineData | null>(null);
  const [lastRefresh, setLastRefresh] = React.useState(new Date());
  const [refreshing, setRefreshing] = React.useState(false);

  // Auto-refresh every 60s
  React.useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 600));
    setLastRefresh(new Date());
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
                      {Math.round(
                        (selectedLine.operatorsPresent /
                          selectedLine.operatorsTotal) *
                          100
                      )}
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
