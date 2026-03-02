"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type SupplierInsert = Database["public"]["Tables"]["suppliers"]["Insert"];
type SupplierUpdate = Database["public"]["Tables"]["suppliers"]["Update"];

interface SupplierFilters {
  is_active?: boolean;
  material_type?: string;
  search?: string;
}

export async function getSuppliers(
  companyId: string,
  filters?: SupplierFilters
) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  let query = supabase
    .from("suppliers")
    .select("*")
    .eq("company_id", companyId)
    .order("name", { ascending: true });

  if (filters?.is_active !== undefined) {
    query = query.eq("is_active", filters.is_active);
  } else {
    query = query.eq("is_active", true);
  }

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,code.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%`
    );
  }

  if (filters?.material_type) {
    query = query.contains("material_types", [filters.material_type]);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getSupplier(id: string) {
  const supabase = await createClient();

  if (!id) {
    return { data: null, error: "Supplier ID is required" };
  }

  const { data: supplier, error: supplierError } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .single();

  if (supplierError) {
    return { data: null, error: supplierError.message };
  }

  // Fetch scorecard data: count of POs and GRNs
  const [posResult, grnsResult] = await Promise.all([
    supabase
      .from("purchase_orders")
      .select("id, status, total_amount", { count: "exact" })
      .eq("supplier_id", id),
    supabase
      .from("grns")
      .select("id, status", { count: "exact" })
      .eq("supplier_id", id),
  ]);

  const totalOrders = posResult.count ?? 0;
  const totalGRNs = grnsResult.count ?? 0;
  const totalSpend =
    posResult.data?.reduce((sum, po) => sum + (po.total_amount ?? 0), 0) ?? 0;

  return {
    data: {
      ...supplier,
      scorecard: {
        total_purchase_orders: totalOrders,
        total_grns: totalGRNs,
        total_spend: totalSpend,
        rating: supplier.rating,
      },
    },
    error: null,
  };
}

export async function createSupplier(data: SupplierInsert) {
  const supabase = await createClient();

  if (!data.company_id) {
    return { data: null, error: "Company ID is required" };
  }
  if (!data.name) {
    return { data: null, error: "Supplier name is required" };
  }

  const { data: supplier, error } = await supabase
    .from("suppliers")
    .insert(data)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: supplier, error: null };
}

export async function updateSupplier(id: string, data: SupplierUpdate) {
  const supabase = await createClient();

  if (!id) {
    return { data: null, error: "Supplier ID is required" };
  }

  const { data: supplier, error } = await supabase
    .from("suppliers")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: supplier, error: null };
}

export async function getSupplierScorecard(companyId: string) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  // Get all active suppliers
  const { data: suppliers, error: supError } = await supabase
    .from("suppliers")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (supError) {
    return { data: null, error: supError.message };
  }

  if (!suppliers || suppliers.length === 0) {
    return { data: [], error: null };
  }

  // For each supplier, gather PO and GRN data to compute scorecard metrics
  const supplierIds = suppliers.map((s) => s.id);

  // Get all POs for these suppliers
  const { data: allPOs } = await supabase
    .from("purchase_orders")
    .select("id, supplier_id, status, total_amount, expected_delivery_date, created_at")
    .eq("company_id", companyId)
    .in("supplier_id", supplierIds);

  // Get all GRNs for these suppliers
  const { data: allGRNs } = await supabase
    .from("grns")
    .select("id, supplier_id, status, received_date")
    .eq("company_id", companyId)
    .in("supplier_id", supplierIds);

  // Get GRN items for rejection data
  const grnIds = (allGRNs ?? []).map((g) => g.id);
  let allGRNItems: { grn_id: string; received_quantity: number; rejected_quantity: number }[] = [];
  if (grnIds.length > 0) {
    const { data: items } = await supabase
      .from("grn_items")
      .select("grn_id, received_quantity, rejected_quantity")
      .in("grn_id", grnIds);
    allGRNItems = (items ?? []) as { grn_id: string; received_quantity: number; rejected_quantity: number }[];
  }

  const scorecardData = suppliers.map((sup) => {
    const supplierPOs = (allPOs ?? []).filter((po) => po.supplier_id === sup.id);
    const supplierGRNs = (allGRNs ?? []).filter((g) => g.supplier_id === sup.id);
    const supplierGRNIds = supplierGRNs.map((g) => g.id);
    const supplierGRNItems = allGRNItems.filter((item) => supplierGRNIds.includes(item.grn_id));

    const totalOrders = supplierPOs.length;
    const totalPurchaseValue = supplierPOs.reduce(
      (sum, po) => sum + (Number(po.total_amount) || 0),
      0
    );

    // Delivery adherence: % of POs with status "delivered" or "received"
    const completedPOs = supplierPOs.filter(
      (po) => po.status === "delivered" || po.status === "received" || po.status === "completed"
    );
    const deliveryAdherence =
      totalOrders > 0
        ? Math.round((completedPOs.length / totalOrders) * 100)
        : 0;

    // Quality pass rate: accepted vs total received
    const totalReceived = supplierGRNItems.reduce(
      (sum, item) => sum + (Number(item.received_quantity) || 0),
      0
    );
    const totalRejected = supplierGRNItems.reduce(
      (sum, item) => sum + (Number(item.rejected_quantity) || 0),
      0
    );
    const qualityPassRate =
      totalReceived > 0
        ? Math.round(((totalReceived - totalRejected) / totalReceived) * 100)
        : 100;
    const rejectionRate =
      totalReceived > 0
        ? Math.round((totalRejected / totalReceived) * 100 * 10) / 10
        : 0;

    // Rating from supplier record (1-5)
    const rating = Number(sup.rating) || 3;

    // Overall score calculation (weighted)
    const overallScore = Math.round(
      deliveryAdherence * 0.3 +
        qualityPassRate * 0.3 +
        rating * 20 * 0.2 +
        (sup.avg_lead_time_days && sup.avg_lead_time_days <= 14 ? 80 : 60) * 0.2
    );

    // Tier based on overall score
    let tier: "gold" | "silver" | "bronze" | "probation" = "bronze";
    if (overallScore >= 85) tier = "gold";
    else if (overallScore >= 70) tier = "silver";
    else if (overallScore >= 55) tier = "bronze";
    else tier = "probation";

    // Determine trend (simplified: up if rating >= 4, down if < 3, else stable)
    let trend: "up" | "down" | "stable" = "stable";
    if (rating >= 4) trend = "up";
    else if (rating < 3) trend = "down";

    // Determine category from material_types
    const materialTypes = sup.material_types ?? [];
    let category = "Other";
    if (materialTypes.some((m: string) => m.toLowerCase().includes("fabric"))) category = "Fabric";
    else if (materialTypes.some((m: string) => m.toLowerCase().includes("yarn"))) category = "Yarn";
    else if (materialTypes.some((m: string) => m.toLowerCase().includes("trim"))) category = "Trims";
    else if (materialTypes.some((m: string) => m.toLowerCase().includes("chemical"))) category = "Chemicals";
    else if (materialTypes.some((m: string) => m.toLowerCase().includes("accessor"))) category = "Accessories";
    else if (materialTypes.length > 0) category = materialTypes[0];

    return {
      id: sup.id,
      name: sup.name,
      code: sup.code,
      category,
      deliveryAdherence,
      qualityPassRate,
      priceCompetitiveness: Math.min(5, Math.max(1, Math.round(rating))),
      responsiveness: Math.min(5, Math.max(1, Math.round(rating))),
      documentAccuracy: Math.min(5, Math.max(1, Math.round(rating))),
      overallScore,
      trend,
      tier,
      ordersThisQuarter: totalOrders,
      avgLeadTimeDays: sup.avg_lead_time_days ?? 14,
      totalPurchaseValue,
      lastSupplyDate: supplierGRNs.length > 0
        ? supplierGRNs.sort((a, b) => (b.received_date ?? "").localeCompare(a.received_date ?? ""))[0]?.received_date ?? ""
        : "",
      rejectionLastQuarter: rejectionRate,
    };
  });

  return { data: scorecardData, error: null };
}

export async function deleteSupplier(id: string) {
  const supabase = await createClient();

  if (!id) {
    return { data: null, error: "Supplier ID is required" };
  }

  const { data, error } = await supabase
    .from("suppliers")
    .update({ is_active: false })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
