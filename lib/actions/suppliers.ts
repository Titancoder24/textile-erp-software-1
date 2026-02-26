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
