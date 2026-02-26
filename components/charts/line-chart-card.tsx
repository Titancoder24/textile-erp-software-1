"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Period = "7d" | "30d" | "90d" | "12m";

interface LineChartCardProps {
  title: string;
  data: Record<string, unknown>[];
  dataKeys: string[];
  colors?: string[];
  xAxisKey?: string;
  periods?: Period[];
  defaultPeriod?: Period;
  onPeriodChange?: (period: Period) => void;
  loading?: boolean;
  className?: string;
  formatTooltipValue?: (value: number, name: string) => string;
  formatYAxis?: (value: number) => string;
  height?: number;
}

const DEFAULT_COLORS = [
  "#2563eb", // blue-600
  "#16a34a", // green-600
  "#ea580c", // orange-600
  "#9333ea", // purple-600
  "#dc2626", // red-600
  "#0891b2", // cyan-600
];

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
  "12m": "12 months",
};

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      className="flex flex-col gap-2 px-1"
      style={{ height }}
      aria-busy="true"
      aria-label="Loading chart"
    >
      {/* y-axis labels */}
      <div className="flex gap-4 h-full">
        <div className="flex flex-col justify-between py-2 shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-8" />
          ))}
        </div>
        {/* bars area */}
        <div className="flex-1 flex flex-col justify-between pb-6 gap-2">
          <div className="flex-1 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-px w-full bg-gray-100"
              />
            ))}
          </div>
          {/* x-axis */}
          <div className="flex justify-between">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-8" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LineChartCard({
  title,
  data,
  dataKeys,
  colors = DEFAULT_COLORS,
  xAxisKey = "name",
  periods,
  defaultPeriod,
  onPeriodChange,
  loading = false,
  className,
  formatTooltipValue,
  formatYAxis,
  height = 280,
}: LineChartCardProps) {
  const [activePeriod, setActivePeriod] = React.useState<Period>(
    defaultPeriod ?? periods?.[0] ?? "30d"
  );

  const handlePeriodChange = (period: Period) => {
    setActivePeriod(period);
    onPeriodChange?.(period);
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-semibold text-gray-900">
            {title}
          </CardTitle>
          {periods && periods.length > 0 && (
            <div
              className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5"
              role="group"
              aria-label="Select time period"
            >
              {periods.map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => handlePeriodChange(period)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    activePeriod === period
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                  aria-pressed={activePeriod === period}
                  aria-label={`Show ${PERIOD_LABELS[period]}`}
                >
                  {period}
                </button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {loading ? (
          <ChartSkeleton height={height} />
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart
              data={data}
              margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey={xAxisKey}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                dy={8}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatYAxis}
                dx={-4}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                  padding: "8px 12px",
                }}
                formatter={
                  formatTooltipValue
                    ? (value: unknown, name: string) =>
                        formatTooltipValue(Number(value), name)
                    : undefined
                }
              />
              {dataKeys.length > 1 && (
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                />
              )}
              {dataKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
