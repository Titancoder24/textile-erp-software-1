"use client";

import * as React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DonutDataItem {
  label: string;
  value: number;
  color: string;
}

interface DonutChartCardProps {
  title: string;
  data: DonutDataItem[];
  loading?: boolean;
  className?: string;
  height?: number;
  formatTooltipValue?: (value: number, label: string) => string;
  showLegend?: boolean;
  centerLabel?: string;
  centerValue?: string | number;
  innerRadius?: number;
  outerRadius?: number;
}

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      className="flex flex-col items-center gap-4"
      style={{ height }}
      aria-busy="true"
      aria-label="Loading chart"
    >
      {/* Donut circle */}
      <div className="relative flex-1 flex items-center justify-center">
        <Skeleton className="h-40 w-40 rounded-full" />
        <Skeleton className="absolute h-20 w-20 rounded-full bg-white" />
      </div>
      {/* Legend rows */}
      <div className="w-full space-y-2 px-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full shrink-0" />
            <Skeleton className="h-3 flex-1" style={{ maxWidth: `${50 + i * 10}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: DonutDataItem }>;
  formatValue?: (value: number, label: string) => string;
}

function CustomTooltip({ active, payload, formatValue }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg text-sm">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: item.color }}
          aria-hidden="true"
        />
        <span className="font-medium text-gray-700">{item.label}</span>
      </div>
      <p className="mt-0.5 text-xs text-gray-500 pl-4">
        {formatValue ? formatValue(item.value, item.label) : item.value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

interface CustomLegendProps {
  data: DonutDataItem[];
  total: number;
  formatValue?: (value: number, label: string) => string;
}

function CustomLegend({ data, total, formatValue }: CustomLegendProps) {
  return (
    <div className="space-y-2 w-full">
      {data.map((item) => {
        const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";
        return (
          <div key={item.label} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <span className="text-xs text-gray-600 truncate">{item.label}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium text-gray-900 tabular-nums">
                {formatValue ? formatValue(item.value, item.label) : item.value.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-gray-400 tabular-nums w-12 text-right">
                {pct}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DonutChartCard({
  title,
  data,
  loading = false,
  className,
  height = 320,
  formatTooltipValue,
  showLegend = true,
  centerLabel,
  centerValue,
  innerRadius = 55,
  outerRadius = 85,
}: DonutChartCardProps) {
  const total = React.useMemo(
    () => data.reduce((sum, d) => sum + d.value, 0),
    [data]
  );

  const chartData = React.useMemo(
    () => data.map((d) => ({ ...d, name: d.label })),
    [data]
  );

  const showCenter = centerLabel || centerValue;

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-gray-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {loading ? (
          <ChartSkeleton height={height} />
        ) : data.length === 0 ? (
          <div
            className="flex items-center justify-center text-sm text-gray-400"
            style={{ height }}
          >
            No data available
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Chart */}
            <ResponsiveContainer width="100%" height={height - (showLegend ? 120 : 0)}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  aria-label={`${title} donut chart`}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip formatValue={formatTooltipValue} />} />
                {/* Center label using foreignObject approach via a custom label */}
                {showCenter && (
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {centerValue !== undefined && (
                      <tspan
                        x="50%"
                        dy={centerLabel ? "-8" : "0"}
                        className="fill-gray-900"
                        style={{ fontSize: 20, fontWeight: 700, fill: "#111827" }}
                      >
                        {centerValue}
                      </tspan>
                    )}
                    {centerLabel && (
                      <tspan
                        x="50%"
                        dy={centerValue !== undefined ? "20" : "0"}
                        style={{ fontSize: 11, fill: "#9ca3af" }}
                      >
                        {centerLabel}
                      </tspan>
                    )}
                  </text>
                )}
              </PieChart>
            </ResponsiveContainer>

            {/* Custom legend */}
            {showLegend && (
              <CustomLegend
                data={data}
                total={total}
                formatValue={formatTooltipValue}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
