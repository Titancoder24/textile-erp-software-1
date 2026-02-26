"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface BarChartCardProps {
  title: string;
  data: Record<string, unknown>[];
  dataKeys: string[];
  colors?: string[];
  xAxisKey?: string;
  horizontal?: boolean;
  loading?: boolean;
  className?: string;
  formatTooltipValue?: (value: number, name: string) => string;
  formatXAxis?: (value: unknown) => string;
  formatYAxis?: (value: unknown) => string;
  height?: number;
  stacked?: boolean;
}

const DEFAULT_COLORS = [
  "#2563eb", // blue-600
  "#16a34a", // green-600
  "#ea580c", // orange-600
  "#9333ea", // purple-600
  "#dc2626", // red-600
  "#0891b2", // cyan-600
];

function ChartSkeleton({
  height,
  horizontal,
}: {
  height: number;
  horizontal: boolean;
}) {
  return (
    <div
      style={{ height }}
      aria-busy="true"
      aria-label="Loading chart"
    >
      {horizontal ? (
        <div className="flex h-full gap-4 items-center">
          <div className="flex flex-col justify-around h-full shrink-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-20" />
            ))}
          </div>
          <div className="flex-1 flex flex-col gap-3 justify-around h-full py-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-5 rounded-sm"
                style={{ width: `${30 + (i % 4) * 15}%` }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex gap-4 h-full">
          <div className="flex flex-col justify-between py-2 shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-8" />
            ))}
          </div>
          <div className="flex-1 flex items-end gap-2 pb-7">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton
                key={i}
                className="flex-1 rounded-t-sm"
                style={{ height: `${20 + (i % 5) * 12}%` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function BarChartCard({
  title,
  data,
  dataKeys,
  colors = DEFAULT_COLORS,
  xAxisKey = "name",
  horizontal = false,
  loading = false,
  className,
  formatTooltipValue,
  formatXAxis,
  formatYAxis,
  height = 280,
  stacked = false,
}: BarChartCardProps) {
  // For single dataKey with horizontal, color bars individually
  const useCellColors = horizontal && dataKeys.length === 1;

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-gray-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {loading ? (
          <ChartSkeleton height={height} horizontal={horizontal} />
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={data}
              layout={horizontal ? "vertical" : "horizontal"}
              margin={
                horizontal
                  ? { top: 0, right: 16, left: 0, bottom: 0 }
                  : { top: 4, right: 4, left: -16, bottom: 0 }
              }
              barCategoryGap="30%"
              barGap={4}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                horizontal={!horizontal}
                vertical={horizontal}
              />
              {horizontal ? (
                <>
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatXAxis as ((v: number) => string) | undefined}
                  />
                  <YAxis
                    type="category"
                    dataKey={xAxisKey}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                    tickFormatter={formatYAxis as ((v: unknown) => string) | undefined}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey={xAxisKey}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                    tickFormatter={formatXAxis as ((v: unknown) => string) | undefined}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatYAxis as ((v: unknown) => string) | undefined}
                    dx={-4}
                  />
                </>
              )}
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                  padding: "8px 12px",
                }}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
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
                <Bar
                  key={key}
                  dataKey={key}
                  fill={useCellColors ? undefined : colors[index % colors.length]}
                  radius={horizontal ? [0, 3, 3, 0] : [3, 3, 0, 0]}
                  stackId={stacked ? "stack" : undefined}
                  maxBarSize={48}
                >
                  {useCellColors
                    ? data.map((_, cellIndex) => (
                        <Cell
                          key={cellIndex}
                          fill={colors[cellIndex % colors.length]}
                        />
                      ))
                    : null}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
