"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateEfficiency } from "@/lib/utils";
import type { Database } from "@/types/database";

type ProductionEntryInsert =
  Database["public"]["Tables"]["production_entries"]["Insert"];

interface ProductionEntryFilters {
  production_line?: string;
  order_id?: string;
  work_order_id?: string;
  shift?: string;
  from_date?: string;
  to_date?: string;
}

export async function getProductionLines(companyId: string) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const { data, error } = await supabase
    .from("production_lines")
    .select(
      `
      *,
      sales_orders ( id, order_number, product_name, delivery_date, status ),
      work_orders ( id, wo_number, total_quantity, good_output, status )
    `
    )
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getProductionEntries(
  companyId: string,
  filters?: ProductionEntryFilters
) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  let query = supabase
    .from("production_entries")
    .select(
      `
      *,
      work_orders ( id, wo_number, product_name ),
      sales_orders ( id, order_number ),
      operations ( id, name, smv )
    `
    )
    .eq("company_id", companyId)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters?.production_line) {
    query = query.eq("production_line", filters.production_line);
  }

  if (filters?.order_id) {
    query = query.eq("order_id", filters.order_id);
  }

  if (filters?.work_order_id) {
    query = query.eq("work_order_id", filters.work_order_id);
  }

  if (filters?.shift) {
    query = query.eq("shift", filters.shift);
  }

  if (filters?.from_date) {
    query = query.gte("entry_date", filters.from_date);
  }

  if (filters?.to_date) {
    query = query.lte("entry_date", filters.to_date);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function createProductionEntry(
  data: Omit<ProductionEntryInsert, "efficiency_percent">
) {
  const supabase = await createClient();

  if (!data.company_id) {
    return { data: null, error: "Company ID is required" };
  }
  if (!data.work_order_id) {
    return { data: null, error: "Work order ID is required" };
  }
  if (!data.production_line) {
    return { data: null, error: "Production line is required" };
  }

  let smv = 0;

  // Fetch SMV from operation if provided
  if (data.operation_id) {
    const { data: operation } = await supabase
      .from("operations")
      .select("smv")
      .eq("id", data.operation_id)
      .single();

    if (operation?.smv) {
      smv = operation.smv;
    }
  }

  // Fall back to default SMV from settings if SMV not found
  if (smv === 0) {
    const { data: workOrder } = await supabase
      .from("work_orders")
      .select("bom_id")
      .eq("id", data.work_order_id)
      .single();

    if (!workOrder?.bom_id) {
      smv = 10; // hard default
    } else {
      smv = 10; // could pull from settings table if available
    }
  }

  const efficiencyPercent = calculateEfficiency(
    data.produced_quantity,
    smv,
    data.working_minutes,
    data.operators_present
  );

  const { data: entry, error } = await supabase
    .from("production_entries")
    .insert({ ...data, efficiency_percent: efficiencyPercent })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  // Update work order good_output
  await supabase.rpc
    ? null
    : null; // placeholder — update via direct query

  const { data: existingWO } = await supabase
    .from("work_orders")
    .select("good_output, defective_output")
    .eq("id", data.work_order_id)
    .single();

  if (existingWO) {
    await supabase
      .from("work_orders")
      .update({
        good_output:
          (existingWO.good_output ?? 0) + data.produced_quantity,
        defective_output:
          (existingWO.defective_output ?? 0) +
          (data.defective_quantity ?? 0),
      })
      .eq("id", data.work_order_id);
  }

  return { data: entry, error: null };
}

export async function getFloorDashboardData(companyId: string) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const today = new Date().toISOString().split("T")[0];

  const { data: lines, error: linesError } = await supabase
    .from("production_lines")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true);

  if (linesError) {
    return { data: null, error: linesError.message };
  }

  const { data: todayEntries, error: entriesError } = await supabase
    .from("production_entries")
    .select("*")
    .eq("company_id", companyId)
    .eq("entry_date", today);

  if (entriesError) {
    return { data: null, error: entriesError.message };
  }

  const lineStats = (lines ?? []).map((line) => {
    const lineEntries = (todayEntries ?? []).filter(
      (e) => e.production_line === line.name
    );

    const totalProduced = lineEntries.reduce(
      (sum, e) => sum + e.produced_quantity,
      0
    );
    const totalTarget = lineEntries.reduce(
      (sum, e) => sum + e.target_quantity,
      0
    );
    const avgEfficiency =
      lineEntries.length > 0
        ? Math.round(
            lineEntries.reduce((sum, e) => sum + e.efficiency_percent, 0) /
              lineEntries.length
          )
        : 0;

    // Hourly breakdown
    const hourlyBreakdown = lineEntries.reduce(
      (acc: Record<string, { target: number; produced: number }>, entry) => {
        const slot = entry.hour_slot ?? "unset";
        if (!acc[slot]) {
          acc[slot] = { target: 0, produced: 0 };
        }
        acc[slot].target += entry.target_quantity;
        acc[slot].produced += entry.produced_quantity;
        return acc;
      },
      {}
    );

    return {
      line_id: line.id,
      line_name: line.name,
      department: line.department,
      target_per_hour: line.target_per_hour,
      today_target: totalTarget,
      today_produced: totalProduced,
      efficiency: avgEfficiency,
      current_order_id: line.current_order_id,
      hourly_breakdown: hourlyBreakdown,
    };
  });

  return { data: lineStats, error: null };
}

export async function getDailyProductionSummary(
  companyId: string,
  date: string
) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }
  if (!date) {
    return { data: null, error: "Date is required" };
  }

  const { data: entries, error: entriesError } = await supabase
    .from("production_entries")
    .select("*")
    .eq("company_id", companyId)
    .eq("entry_date", date);

  if (entriesError) {
    return { data: null, error: entriesError.message };
  }

  const totalProduced = entries?.reduce(
    (sum, e) => sum + e.produced_quantity,
    0
  ) ?? 0;
  const totalTarget = entries?.reduce(
    (sum, e) => sum + e.target_quantity,
    0
  ) ?? 0;
  const totalDefects = entries?.reduce(
    (sum, e) => sum + (e.defective_quantity ?? 0),
    0
  ) ?? 0;
  const avgEfficiency =
    (entries?.length ?? 0) > 0
      ? Math.round(
          (entries?.reduce((sum, e) => sum + e.efficiency_percent, 0) ?? 0) /
            (entries?.length ?? 1)
        )
      : 0;

  // Group by line
  const byLine = (entries ?? []).reduce(
    (acc: Record<string, { produced: number; target: number; efficiency: number; count: number }>, entry) => {
      const line = entry.production_line;
      if (!acc[line]) {
        acc[line] = { produced: 0, target: 0, efficiency: 0, count: 0 };
      }
      acc[line].produced += entry.produced_quantity;
      acc[line].target += entry.target_quantity;
      acc[line].efficiency += entry.efficiency_percent;
      acc[line].count += 1;
      return acc;
    },
    {}
  );

  const linesSummary = Object.entries(byLine).map(([name, stats]) => ({
    line_name: name,
    produced: stats.produced,
    target: stats.target,
    efficiency: Math.round(stats.efficiency / stats.count),
  }));

  return {
    data: {
      date,
      total_produced: totalProduced,
      total_target: totalTarget,
      total_defects: totalDefects,
      defect_rate:
        totalProduced > 0
          ? Math.round((totalDefects / totalProduced) * 100 * 10) / 10
          : 0,
      avg_efficiency: avgEfficiency,
      lines_summary: linesSummary,
    },
    error: null,
  };
}

export async function getOrderProductionHistory(orderId: string) {
  const supabase = await createClient();

  if (!orderId) {
    return { data: null, error: "Order ID is required" };
  }

  const { data: entries, error } = await supabase
    .from("production_entries")
    .select("entry_date, produced_quantity, target_quantity, defective_quantity, efficiency_percent")
    .eq("order_id", orderId)
    .order("entry_date", { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }

  // Group by date for chart data
  const byDate = (entries ?? []).reduce(
    (
      acc: Record<
        string,
        { produced: number; target: number; defects: number; efficiency: number; count: number }
      >,
      entry
    ) => {
      const date = entry.entry_date;
      if (!acc[date]) {
        acc[date] = { produced: 0, target: 0, defects: 0, efficiency: 0, count: 0 };
      }
      acc[date].produced += entry.produced_quantity;
      acc[date].target += entry.target_quantity;
      acc[date].defects += entry.defective_quantity ?? 0;
      acc[date].efficiency += entry.efficiency_percent;
      acc[date].count += 1;
      return acc;
    },
    {}
  );

  const chartData = Object.entries(byDate).map(([date, stats]) => ({
    date,
    produced: stats.produced,
    target: stats.target,
    defects: stats.defects,
    efficiency: Math.round(stats.efficiency / stats.count),
  }));

  const cumulativeProduced = chartData.reduce(
    (
      acc: { date: string; cumulative: number }[],
      item,
      index
    ) => {
      const prev = index > 0 ? acc[index - 1].cumulative : 0;
      acc.push({ date: item.date, cumulative: prev + item.produced });
      return acc;
    },
    []
  );

  return {
    data: {
      daily: chartData,
      cumulative: cumulativeProduced,
    },
    error: null,
  };
}
