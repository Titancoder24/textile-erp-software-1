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
