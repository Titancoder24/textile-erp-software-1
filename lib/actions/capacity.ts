"use server";

import { createClient } from "@/lib/supabase/server";

export interface LineLoadingData {
  lineId: string;
  lineName: string;
  department: string;
  capacityPerDay: number;
  weeks: {
    week: string;
    allocated: number;
    available: number;
    utilizationPct: number;
  }[];
}

export interface CapacityForecastWeek {
  week: string;
  label: string;
  totalCapacity: number;
  totalAllocated: number;
  freeCapacity: number;
  utilizationPct: number;
}

export interface FeasibilityResult {
  feasible: boolean;
  recommendedLine: string | null;
  estimatedDays: number;
  earliestCompletionDate: string;
  message: string;
  availableLines: {
    lineName: string;
    freeCapacity: number;
    startDate: string;
    completionDate: string;
  }[];
}

export async function getCapacityData(companyId: string) {
  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const supabase = await createClient();

  const { data: lines, error } = await supabase
    .from("production_lines")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("name");

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: lines, error: null };
}

export async function checkDeliveryFeasibility(
  orderId: string,
  quantity: number,
  deliveryDate: string
) {
  if (!quantity || quantity <= 0) {
    return { data: null, error: "Valid quantity is required" };
  }
  if (!deliveryDate) {
    return { data: null, error: "Delivery date is required" };
  }

  const supabase = await createClient();

  const today = new Date();
  const delivery = new Date(deliveryDate);
  const daysAvailable = Math.floor(
    (delivery.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysAvailable <= 0) {
    return {
      data: {
        feasible: false,
        recommendedLine: null,
        estimatedDays: 0,
        earliestCompletionDate: "",
        message: "Delivery date is in the past",
        availableLines: [],
      } as FeasibilityResult,
      error: null,
    };
  }

  if (orderId) {
    const { error: orderError } = await supabase
      .from("sales_orders")
      .select("id")
      .eq("id", orderId)
      .single();
    if (orderError) {
      // Order may not exist, continue without order context
    }
  }

  return { data: null, error: "Feasibility check requires live production data" };
}

export async function getCapacityForecast(companyId: string, _weeks: number = 8) {
  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const supabase = await createClient();

  const { data: workOrders, error } = await supabase
    .from("work_orders")
    .select("*")
    .eq("company_id", companyId)
    .in("status", ["planned", "in_progress"])
    .order("planned_start_date");

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: workOrders, error: null };
}

// Helper to get the Monday of a given week
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekLabel(date: Date): string {
  const month = date.toLocaleString("en-US", { month: "short" });
  const weekOfMonth = Math.ceil(date.getDate() / 7);
  return `W${weekOfMonth} ${month}`;
}

export interface CapacityOverviewLine {
  lineId: string;
  lineName: string;
  department: string;
  capacityPerDay: number;
  totalOperators: number;
  weeklyData: {
    week: string;
    allocated: number;
    available: number;
    utilization: number;
  }[];
  currentUtilization: number;
  status: "available" | "moderate" | "overloaded";
}

export interface CapacityOverview {
  lines: CapacityOverviewLine[];
  weeks: string[];
}

export async function getCapacityOverview(companyId: string): Promise<{
  data: CapacityOverview | null;
  error: string | null;
}> {
  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const supabase = await createClient();

  // Fetch production lines
  const { data: rawLines, error: linesError } = await supabase
    .from("production_lines")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("name");

  if (linesError) {
    return { data: null, error: linesError.message };
  }

  // Fetch active work orders
  const { data: workOrders, error: woError } = await supabase
    .from("work_orders")
    .select("*")
    .eq("company_id", companyId)
    .in("status", ["planned", "in_progress"])
    .order("planned_start_date");

  if (woError) {
    return { data: null, error: woError.message };
  }

  // Generate 8 weeks starting from current week
  const today = new Date();
  const currentWeekStart = getWeekStart(today);
  const weeks: { start: Date; end: Date; label: string }[] = [];

  for (let i = 0; i < 8; i++) {
    const start = new Date(currentWeekStart);
    start.setDate(start.getDate() + i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    weeks.push({ start, end, label: getWeekLabel(start) });
  }

  const weekLabels = weeks.map((w) => w.label);

  const lines: CapacityOverviewLine[] = (rawLines ?? []).map((line) => {
    const capacityPerDay = (line.target_per_hour ?? 100) * 8; // 8 hours per day
    const weeklyCapacity = capacityPerDay * 7; // 7 days

    // Calculate allocation per week from work orders assigned to this line
    const weeklyData = weeks.map((week) => {
      let allocated = 0;

      for (const wo of workOrders ?? []) {
        // Match work orders to lines by production_line field (line name)
        if (wo.production_line !== line.name) continue;

        const woStart = wo.planned_start_date
          ? new Date(wo.planned_start_date)
          : null;
        const woEnd = wo.planned_end_date
          ? new Date(wo.planned_end_date)
          : null;

        if (!woStart || !woEnd) continue;

        // Check if work order overlaps with this week
        if (woStart > week.end || woEnd < week.start) continue;

        // Calculate how many days of this week the WO covers
        const overlapStart = woStart > week.start ? woStart : week.start;
        const overlapEnd = woEnd < week.end ? woEnd : week.end;
        const overlapDays = Math.max(
          1,
          Math.ceil(
            (overlapEnd.getTime() - overlapStart.getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1
        );

        // Total WO duration in days
        const totalWoDays = Math.max(
          1,
          Math.ceil(
            (woEnd.getTime() - woStart.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1
        );

        // Proportional allocation for this week
        const proportion = overlapDays / totalWoDays;
        allocated += Math.round(wo.total_quantity * proportion);
      }

      const utilization =
        weeklyCapacity > 0 ? Math.round((allocated / weeklyCapacity) * 100) : 0;

      return {
        week: week.label,
        allocated,
        available: weeklyCapacity,
        utilization,
      };
    });

    const currentUtilization = weeklyData[0]?.utilization ?? 0;
    const status: "available" | "moderate" | "overloaded" =
      currentUtilization > 90
        ? "overloaded"
        : currentUtilization > 60
        ? "moderate"
        : "available";

    return {
      lineId: line.id,
      lineName: line.name,
      department: line.department,
      capacityPerDay,
      totalOperators: line.total_operators ?? 30,
      weeklyData,
      currentUtilization,
      status,
    };
  });

  return {
    data: { lines, weeks: weekLabels },
    error: null,
  };
}
