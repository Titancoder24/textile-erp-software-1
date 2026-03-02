"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type InspectionInsert =
  Database["public"]["Tables"]["inspections"]["Insert"];
type InspectionDefectInsert =
  Database["public"]["Tables"]["inspection_defects"]["Insert"];
type CAPAInsert = Database["public"]["Tables"]["capas"]["Insert"];
type CAPAUpdate = Database["public"]["Tables"]["capas"]["Update"];

interface InspectionFilters {
  inspection_type?: string;
  order_id?: string;
  result?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
}

interface CAPAFilters {
  status?: string;
  assigned_to?: string;
  search?: string;
}

interface DateRange {
  from: string;
  to: string;
}

// AQL tables - simplified single-sampling normal inspection
// AQL 1.0 = max 0 defects per sample; 2.5 = varies; 4.0 = varies
const AQL_SAMPLE_SIZES: Record<string, Record<string, number>> = {
  "1.0": { "2-8": 2, "9-15": 3, "16-25": 5, "26-50": 8, "51-90": 13, "91-150": 20, "151-280": 32, "281-500": 50, "501-1200": 80, "1201-3200": 125 },
  "2.5": { "2-8": 2, "9-15": 3, "16-25": 5, "26-50": 8, "51-90": 13, "91-150": 20, "151-280": 32, "281-500": 50, "501-1200": 80, "1201-3200": 125 },
  "4.0": { "2-8": 2, "9-15": 3, "16-25": 5, "26-50": 8, "51-90": 13, "91-150": 20, "151-280": 32, "281-500": 50, "501-1200": 80, "1201-3200": 125 },
};

const AQL_ACCEPT_NUMBERS: Record<string, Record<string, number>> = {
  "1.0": { "2": 0, "3": 0, "5": 0, "8": 0, "13": 0, "20": 0, "32": 1, "50": 1, "80": 2, "125": 3 },
  "2.5": { "2": 0, "3": 0, "5": 0, "8": 0, "13": 0, "20": 1, "32": 2, "50": 3, "80": 5, "125": 7 },
  "4.0": { "2": 0, "3": 0, "5": 0, "8": 1, "13": 1, "20": 2, "32": 3, "50": 5, "80": 7, "125": 10 },
};

function getLotSizeKey(lotSize: number): string {
  if (lotSize <= 8) return "2-8";
  if (lotSize <= 15) return "9-15";
  if (lotSize <= 25) return "16-25";
  if (lotSize <= 50) return "26-50";
  if (lotSize <= 90) return "51-90";
  if (lotSize <= 150) return "91-150";
  if (lotSize <= 280) return "151-280";
  if (lotSize <= 500) return "281-500";
  if (lotSize <= 1200) return "501-1200";
  return "1201-3200";
}

export async function getInspections(
  companyId: string,
  filters?: InspectionFilters
) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  let query = supabase
    .from("inspections")
    .select(
      `
      *,
      sales_orders ( id, order_number, product_name ),
      work_orders ( id, wo_number ),
      inspection_defects ( id, defect_type, severity, quantity )
    `
    )
    .eq("company_id", companyId)
    .order("inspection_date", { ascending: false });

  if (filters?.inspection_type) {
    query = query.eq("inspection_type", filters.inspection_type);
  }

  if (filters?.order_id) {
    query = query.eq("order_id", filters.order_id);
  }

  if (filters?.result) {
    query = query.eq("result", filters.result);
  }

  if (filters?.from_date) {
    query = query.gte("inspection_date", filters.from_date);
  }

  if (filters?.to_date) {
    query = query.lte("inspection_date", filters.to_date);
  }

  if (filters?.search) {
    query = query.ilike("inspection_number", `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getInspectionById(inspectionId: string) {
  const supabase = await createClient();

  if (!inspectionId) {
    return { data: null, error: "Inspection ID is required" };
  }

  const { data, error } = await supabase
    .from("inspections")
    .select(
      `
      *,
      sales_orders ( id, order_number, product_name, buyer_id, buyers ( id, name ) ),
      work_orders ( id, wo_number ),
      inspection_defects ( id, defect_type, defect_location, severity, quantity, notes ),
      inspector:profiles!inspector_id ( id, full_name ),
      inspection_templates ( id, name )
    `
    )
    .eq("id", inspectionId)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getInspectionByNumber(inspectionNumber: string) {
  const supabase = await createClient();

  if (!inspectionNumber) {
    return { data: null, error: "Inspection number is required" };
  }

  const { data, error } = await supabase
    .from("inspections")
    .select(
      `
      *,
      sales_orders ( id, order_number, product_name, buyer_id, buyers ( id, name ) ),
      work_orders ( id, wo_number ),
      inspection_defects ( id, defect_type, defect_location, severity, quantity, notes ),
      inspector:profiles!inspector_id ( id, full_name ),
      inspection_templates ( id, name )
    `
    )
    .eq("inspection_number", inspectionNumber)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function createInspection(
  data: Omit<InspectionInsert, "inspection_number">
) {
  const supabase = await createClient();

  if (!data.company_id) {
    return { data: null, error: "Company ID is required" };
  }

  const { data: inspectionNumber, error: numberError } = await supabase.rpc(
    "get_next_number",
    {
      p_company_id: data.company_id,
      p_document_type: "inspection",
    }
  );

  if (numberError) {
    return { data: null, error: numberError.message };
  }

  const { data: inspection, error } = await supabase
    .from("inspections")
    .insert({ ...data, inspection_number: inspectionNumber })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: inspection, error: null };
}

export async function addDefect(
  inspectionId: string,
  defectData: Omit<InspectionDefectInsert, "inspection_id">
) {
  const supabase = await createClient();

  if (!inspectionId) {
    return { data: null, error: "Inspection ID is required" };
  }
  if (!defectData.defect_type) {
    return { data: null, error: "Defect type is required" };
  }
  if (!defectData.severity) {
    return { data: null, error: "Severity is required" };
  }

  const { data: defect, error: defectError } = await supabase
    .from("inspection_defects")
    .insert({ ...defectData, inspection_id: inspectionId })
    .select()
    .single();

  if (defectError) {
    return { data: null, error: defectError.message };
  }

  // Recalculate inspection defect totals
  const { data: allDefects } = await supabase
    .from("inspection_defects")
    .select("severity, quantity")
    .eq("inspection_id", inspectionId);

  const totals = (allDefects ?? []).reduce(
    (acc, d) => {
      acc.total += d.quantity;
      if (d.severity === "critical") acc.critical += d.quantity;
      if (d.severity === "major") acc.major += d.quantity;
      if (d.severity === "minor") acc.minor += d.quantity;
      return acc;
    },
    { total: 0, critical: 0, major: 0, minor: 0 }
  );

  await supabase
    .from("inspections")
    .update({
      total_defects: totals.total,
      critical_defects: totals.critical,
      major_defects: totals.major,
      minor_defects: totals.minor,
    })
    .eq("id", inspectionId);

  return { data: defect, error: null };
}

export async function calculateAQLResult(inspectionId: string) {
  const supabase = await createClient();

  if (!inspectionId) {
    return { data: null, error: "Inspection ID is required" };
  }

  const { data: inspection, error: fetchError } = await supabase
    .from("inspections")
    .select("*")
    .eq("id", inspectionId)
    .single();

  if (fetchError) {
    return { data: null, error: fetchError.message };
  }

  const aqlLevel = inspection.aql_level ?? "2.5";
  const lotSizeKey = getLotSizeKey(inspection.lot_size);
  const sampleSizeForLot = AQL_SAMPLE_SIZES[aqlLevel]?.[lotSizeKey];
  const sampleSizeKey = String(sampleSizeForLot);
  const acceptNumber = AQL_ACCEPT_NUMBERS[aqlLevel]?.[sampleSizeKey] ?? 0;

  // Only major + critical defects count against AQL
  const defectsAgainstAQL =
    (inspection.critical_defects ?? 0) + (inspection.major_defects ?? 0);

  const result = defectsAgainstAQL <= acceptNumber ? "pass" : "fail";

  const { data: updated, error: updateError } = await supabase
    .from("inspections")
    .update({ result })
    .eq("id", inspectionId)
    .select()
    .single();

  if (updateError) {
    return { data: null, error: updateError.message };
  }

  return {
    data: {
      inspection_id: inspectionId,
      lot_size: inspection.lot_size,
      sample_size: sampleSizeForLot ?? inspection.sample_size,
      aql_level: aqlLevel,
      accept_number: acceptNumber,
      defects_against_aql: defectsAgainstAQL,
      result,
    },
    error: null,
  };
}

export async function getDefectAnalytics(
  companyId: string,
  dateRange: DateRange
) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }
  if (!dateRange.from || !dateRange.to) {
    return { data: null, error: "Date range is required" };
  }

  const { data: inspections, error: inspError } = await supabase
    .from("inspections")
    .select("id, inspection_date, result, total_defects, critical_defects, major_defects, minor_defects")
    .eq("company_id", companyId)
    .gte("inspection_date", dateRange.from)
    .lte("inspection_date", dateRange.to);

  if (inspError) {
    return { data: null, error: inspError.message };
  }

  const inspectionIds = (inspections ?? []).map((i) => i.id);

  if (inspectionIds.length === 0) {
    return {
      data: {
        pareto: [],
        trends: [],
        pass_rate: 0,
        total_inspections: 0,
        total_defects: 0,
      },
      error: null,
    };
  }

  const { data: defects, error: defectsError } = await supabase
    .from("inspection_defects")
    .select("defect_type, severity, quantity")
    .in("inspection_id", inspectionIds);

  if (defectsError) {
    return { data: null, error: defectsError.message };
  }

  // Pareto data
  const defectCounts = (defects ?? []).reduce(
    (acc: Record<string, { count: number; severity: string }>, d) => {
      if (!acc[d.defect_type]) {
        acc[d.defect_type] = { count: 0, severity: d.severity };
      }
      acc[d.defect_type].count += d.quantity;
      return acc;
    },
    {}
  );

  const totalDefects = Object.values(defectCounts).reduce(
    (sum, d) => sum + d.count,
    0
  );

  const pareto = Object.entries(defectCounts)
    .map(([type, data]) => ({
      defect_type: type,
      count: data.count,
      severity: data.severity,
      percentage:
        totalDefects > 0
          ? Math.round((data.count / totalDefects) * 100 * 10) / 10
          : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Cumulative percentage for Pareto chart
  let cumulative = 0;
  const paretoWithCumulative = pareto.map((item) => {
    cumulative += item.percentage;
    return { ...item, cumulative_percentage: Math.round(cumulative * 10) / 10 };
  });

  // Trend data by date
  const trendByDate = (inspections ?? []).reduce(
    (acc: Record<string, { date: string; pass: number; fail: number; defects: number }>, insp) => {
      const date = insp.inspection_date;
      if (!acc[date]) {
        acc[date] = { date, pass: 0, fail: 0, defects: 0 };
      }
      if (insp.result === "pass") acc[date].pass += 1;
      else acc[date].fail += 1;
      acc[date].defects += insp.total_defects ?? 0;
      return acc;
    },
    {}
  );

  const trends = Object.values(trendByDate).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const passedInspections = (inspections ?? []).filter(
    (i) => i.result === "pass"
  ).length;
  const passRate =
    (inspections?.length ?? 0) > 0
      ? Math.round((passedInspections / (inspections?.length ?? 1)) * 100)
      : 0;

  return {
    data: {
      pareto: paretoWithCumulative,
      trends,
      pass_rate: passRate,
      total_inspections: inspections?.length ?? 0,
      total_defects: totalDefects,
    },
    error: null,
  };
}

export async function getCapas(companyId: string, filters?: CAPAFilters) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  let query = supabase
    .from("capas")
    .select(
      `
      *,
      inspections ( id, inspection_number, inspection_type )
    `
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.assigned_to) {
    query = query.eq("assigned_to", filters.assigned_to);
  }

  if (filters?.search) {
    query = query.or(
      `capa_number.ilike.%${filters.search}%,defect_description.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function createCAPA(
  data: Omit<CAPAInsert, "capa_number">
) {
  const supabase = await createClient();

  if (!data.company_id) {
    return { data: null, error: "Company ID is required" };
  }
  if (!data.defect_description) {
    return { data: null, error: "Defect description is required" };
  }

  const { data: capaNumber, error: numberError } = await supabase.rpc(
    "get_next_number",
    {
      p_company_id: data.company_id,
      p_document_type: "capa",
    }
  );

  if (numberError) {
    return { data: null, error: numberError.message };
  }

  const { data: capa, error } = await supabase
    .from("capas")
    .insert({ ...data, capa_number: capaNumber, status: data.status ?? "open" })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: capa, error: null };
}

export async function updateCAPAStatus(
  id: string,
  status: string,
  userId: string
) {
  const supabase = await createClient();

  if (!id) {
    return { data: null, error: "CAPA ID is required" };
  }
  if (!status) {
    return { data: null, error: "Status is required" };
  }
  if (!userId) {
    return { data: null, error: "User ID is required" };
  }

  const validStatuses = ["open", "in_progress", "verified", "closed"];
  if (!validStatuses.includes(status)) {
    return {
      data: null,
      error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    };
  }

  const updateData: CAPAUpdate = { status };

  if (status === "verified" || status === "closed") {
    updateData.verified_by = userId;
    updateData.verified_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("capas")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
