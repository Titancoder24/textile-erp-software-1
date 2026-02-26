"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type BuyerInsert = Database["public"]["Tables"]["buyers"]["Insert"];
type BuyerUpdate = Database["public"]["Tables"]["buyers"]["Update"];

export async function getBuyers(companyId: string) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const { data, error } = await supabase
    .from("buyers")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getBuyer(id: string) {
  const supabase = await createClient();

  if (!id) {
    return { data: null, error: "Buyer ID is required" };
  }

  const { data: buyer, error: buyerError } = await supabase
    .from("buyers")
    .select("*")
    .eq("id", id)
    .single();

  if (buyerError) {
    return { data: null, error: buyerError.message };
  }

  const { count: ordersCount, error: ordersError } = await supabase
    .from("sales_orders")
    .select("*", { count: "exact", head: true })
    .eq("buyer_id", id);

  if (ordersError) {
    return { data: null, error: ordersError.message };
  }

  return {
    data: { ...buyer, orders_count: ordersCount ?? 0 },
    error: null,
  };
}

export async function createBuyer(
  data: Omit<BuyerInsert, "code"> & { code?: string }
) {
  const supabase = await createClient();

  if (!data.company_id) {
    return { data: null, error: "Company ID is required" };
  }
  if (!data.name) {
    return { data: null, error: "Buyer name is required" };
  }

  let code = data.code;

  if (!code) {
    const { count } = await supabase
      .from("buyers")
      .select("*", { count: "exact", head: true })
      .eq("company_id", data.company_id);

    const seq = String((count ?? 0) + 1).padStart(4, "0");
    code = `BYR-${seq}`;
  }

  const { data: buyer, error } = await supabase
    .from("buyers")
    .insert({ ...data, code })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: buyer, error: null };
}

export async function updateBuyer(id: string, data: BuyerUpdate) {
  const supabase = await createClient();

  if (!id) {
    return { data: null, error: "Buyer ID is required" };
  }

  const { data: buyer, error } = await supabase
    .from("buyers")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: buyer, error: null };
}

export async function deleteBuyer(id: string) {
  const supabase = await createClient();

  if (!id) {
    return { data: null, error: "Buyer ID is required" };
  }

  const { data, error } = await supabase
    .from("buyers")
    .update({ is_active: false })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
