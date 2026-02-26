"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
} from "lucide-react";

export interface LineData {
  id: string;
  name: string;
  status: "running" | "idle" | "breakdown" | "setup";
  currentOrder?: string;
  buyerName?: string;
  style?: string;
  todayTarget: number;
  todayProduced: number;
  efficiency: number;
  operatorsPresent: number;
  operatorsTotal: number;
  defectsToday: number;
  hoursRemaining: number;
  hourlyOutput: number[];
  smv?: number;
}

const STATUS_CONFIG = {
  running: { label: "Running", dot: "bg-green-500", text: "text-green-700" },
  idle: { label: "Idle", dot: "bg-red-500", text: "text-red-700" },
  breakdown: { label: "Breakdown", dot: "bg-red-600 animate-pulse", text: "text-red-700" },
  setup: { label: "Setup", dot: "bg-yellow-500", text: "text-yellow-700" },
};

function getEfficiencyClass(efficiency: number): string {
  if (efficiency >= 65) return "text-green-600";
  if (efficiency >= 50) return "text-yellow-600";
  return "text-red-600";
}

function getProgressColor(efficiency: number): string {
  if (efficiency >= 65) return "bg-green-500";
  if (efficiency >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

interface LineCardProps {
  line: LineData;
  onClick?: (line: LineData) => void;
  className?: string;
}

export function LineCard({ line, onClick, className }: LineCardProps) {
  const statusConf = STATUS_CONFIG[line.status];
  const progressPct =
    line.todayTarget > 0
      ? Math.min(100, Math.round((line.todayProduced / line.todayTarget) * 100))
      : 0;
  const efficiencyClass = getEfficiencyClass(line.efficiency);
  const progressColor = getProgressColor(line.efficiency);
  const maxHourly = Math.max(...line.hourlyOutput, 1);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-300 group",
        line.status === "breakdown" && "border-red-300 bg-red-50/30",
        className
      )}
      onClick={() => onClick?.(line)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(line);
        }
      }}
      aria-label={`Production line ${line.name}`}
    >
      <CardContent className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full shrink-0",
                  statusConf.dot
                )}
                aria-hidden="true"
              />
              <h3 className="text-sm font-bold text-gray-900 truncate">
                {line.name}
              </h3>
            </div>
            {line.currentOrder && (
              <p className="mt-0.5 text-xs text-gray-500 truncate pl-4">
                {line.currentOrder}
                {line.buyerName && ` · ${line.buyerName}`}
              </p>
            )}
            {line.style && (
              <p className="text-xs text-gray-400 truncate pl-4">{line.style}</p>
            )}
          </div>
          {/* Efficiency badge */}
          <div className="text-right shrink-0">
            <span className={cn("text-2xl font-black tabular-nums leading-none", efficiencyClass)}>
              {line.efficiency}%
            </span>
            <p className="text-[10px] text-gray-400 mt-0.5">Efficiency</p>
          </div>
        </div>

        {/* Target vs Produced */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">
              <span className="font-semibold text-gray-900 tabular-nums">
                {line.todayProduced.toLocaleString()}
              </span>{" "}
              / {line.todayTarget.toLocaleString()} pcs
            </span>
            <span className="text-xs font-semibold text-gray-700">
              {progressPct}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                progressColor
              )}
              style={{ width: `${progressPct}%` }}
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-gray-400 shrink-0" aria-hidden="true" />
            <div>
              <span className="text-xs font-semibold text-gray-900">
                {line.operatorsPresent}
              </span>
              <span className="text-[10px] text-gray-400">
                /{line.operatorsTotal}
              </span>
              <p className="text-[10px] text-gray-400 leading-none">Ops</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertTriangle
              className={cn(
                "h-3.5 w-3.5 shrink-0",
                line.defectsToday > 0 ? "text-red-400" : "text-gray-400"
              )}
              aria-hidden="true"
            />
            <div>
              <span
                className={cn(
                  "text-xs font-semibold",
                  line.defectsToday > 0 ? "text-red-600" : "text-gray-900"
                )}
              >
                {line.defectsToday}
              </span>
              <p className="text-[10px] text-gray-400 leading-none">Defects</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" aria-hidden="true" />
            <div>
              <span className="text-xs font-semibold text-gray-900">
                {line.hoursRemaining}h
              </span>
              <p className="text-[10px] text-gray-400 leading-none">Left</p>
            </div>
          </div>
        </div>

        {/* Hourly output mini chart */}
        {line.hourlyOutput.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                Hourly Output
              </span>
              <TrendingUp className="h-3 w-3 text-gray-300" aria-hidden="true" />
            </div>
            <div className="flex items-end gap-0.5 h-8">
              {line.hourlyOutput.map((val, idx) => (
                <div
                  key={idx}
                  className="flex-1 rounded-sm transition-all duration-300"
                  style={{
                    height: `${Math.round((val / maxHourly) * 100)}%`,
                    minHeight: val > 0 ? "4px" : "2px",
                    backgroundColor:
                      val / maxHourly >= 0.65
                        ? "#22c55e"
                        : val / maxHourly >= 0.5
                        ? "#eab308"
                        : "#ef4444",
                    opacity: idx === line.hourlyOutput.length - 1 ? 1 : 0.7,
                  }}
                  aria-label={`Hour ${idx + 1}: ${val} pcs`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-0.5">
              <span className="text-[9px] text-gray-300">8am</span>
              <span className="text-[9px] text-gray-300">Now</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
