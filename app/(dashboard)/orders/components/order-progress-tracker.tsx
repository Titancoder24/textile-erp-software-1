"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Package,
  Scissors,
  Shirt,
  Sparkles,
  Box,
  Truck,
  Check,
  Loader2,
} from "lucide-react";

export type StageStatus = "done" | "in_progress" | "not_started";

export interface ProductionStage {
  key: string;
  label: string;
  completionPct?: number;
  status: StageStatus;
}

const STAGE_ICONS: Record<string, React.ElementType> = {
  material_sourcing: Package,
  cutting: Scissors,
  sewing: Shirt,
  finishing: Sparkles,
  packing: Box,
  shipped: Truck,
};

interface OrderProgressTrackerProps {
  stages: ProductionStage[];
  className?: string;
}

export function OrderProgressTracker({
  stages,
  className,
}: OrderProgressTrackerProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="relative flex items-start justify-between gap-2">
        {/* Connecting line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-blue-500 z-0 transition-all duration-500"
          style={{
            width: (() => {
              const doneCount = stages.filter((s) => s.status === "done").length;
              const inProgressCount = stages.filter(
                (s) => s.status === "in_progress"
              ).length;
              if (stages.length <= 1) return "0%";
              const totalSegments = stages.length - 1;
              const completedSegments =
                doneCount + (inProgressCount > 0 ? 0.5 : 0);
              return `${(completedSegments / totalSegments) * 100}%`;
            })(),
          }}
        />

        {stages.map((stage) => {
          const Icon = STAGE_ICONS[stage.key] ?? Package;
          const isDone = stage.status === "done";
          const isInProgress = stage.status === "in_progress";

          return (
            <div
              key={stage.key}
              className="relative z-10 flex flex-1 flex-col items-center gap-2 min-w-0"
            >
              {/* Icon circle */}
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 shrink-0",
                  isDone
                    ? "border-green-500 bg-green-500 text-white"
                    : isInProgress
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-gray-200 bg-white text-gray-400"
                )}
              >
                {isDone ? (
                  <Check className="h-5 w-5" aria-hidden="true" />
                ) : isInProgress ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                ) : (
                  <Icon className="h-5 w-5" aria-hidden="true" />
                )}
              </div>

              {/* Label and percentage */}
              <div className="flex flex-col items-center gap-0.5 text-center">
                <span
                  className={cn(
                    "text-xs font-semibold leading-tight",
                    isDone
                      ? "text-green-700"
                      : isInProgress
                      ? "text-blue-700"
                      : "text-gray-400"
                  )}
                >
                  {stage.label}
                </span>
                {stage.completionPct !== undefined && (
                  <span
                    className={cn(
                      "text-xs",
                      isDone
                        ? "text-green-600"
                        : isInProgress
                        ? "text-blue-500"
                        : "text-gray-400"
                    )}
                  >
                    {isDone ? "100%" : `${stage.completionPct}%`}
                  </span>
                )}
                {isInProgress && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                    Active
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Default stages factory
export function buildDefaultStages(currentStage: string): ProductionStage[] {
  const stageOrder = [
    { key: "material_sourcing", label: "Material Sourcing" },
    { key: "cutting", label: "Cutting" },
    { key: "sewing", label: "Sewing" },
    { key: "finishing", label: "Finishing" },
    { key: "packing", label: "Packing" },
    { key: "shipped", label: "Shipped" },
  ];

  const currentIndex = stageOrder.findIndex((s) => s.key === currentStage);

  return stageOrder.map((stage, idx) => ({
    key: stage.key,
    label: stage.label,
    status:
      idx < currentIndex
        ? "done"
        : idx === currentIndex
        ? "in_progress"
        : "not_started",
    completionPct: idx === currentIndex ? 45 : undefined,
  }));
}
