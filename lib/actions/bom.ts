"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type BOMInsert = Database["public"]["Tables"]["boms"]["Insert"];
type BOMUpdate = Database["public"]["Tables"]["boms"]["Update"];
type BOMItemInsert = Database["public"]["Tables"]["bom_items"]["Insert"];

interface BOMFilters {
  product_id?: string;
  status?: string;
  search?: string;
}

interface CreateBOMData {
  bom: Omit<BOMInsert, "total_cost">;
  items: Omit<BOMItemInsert, "bom_id" | "amount">[];
}

interface UpdateBOMData {
  bom: BOMUpdate;
  items: (Omit<BOMItemInsert, "bom_id" | "amount"> & { id?: string })[];
}

export async function getBOMs(companyId: string, filters?: BOMFilters) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  let query = supabase
    .from("boms")
    .select(
      `
      *,
      products ( id, name, style_code, category )
    `
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (filters?.product_id) {
    query = query.eq("product_id", filters.product_id);
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getBOM(id: string) {
  const supabase = await createClient();

  if (!id) {
    return { data: null, error: "BOM ID is required" };
  }

  const { data: bom, error: bomError } = await supabase
    .from("boms")
    .select(
      `
      *,
      products ( id, name, style_code, category ),
      bom_items ( * )
    `
    )
    .eq("id", id)
    .single();

  if (bomError) {
    return { data: null, error: bomError.message };
  }

  return { data: bom, error: null };
}

export async function createBOM(bomData: CreateBOMData) {
  const supabase = await createClient();

  const { bom, items } = bomData;

  if (!bom.company_id) {
    return { data: null, error: "Company ID is required" };
  }
  if (!bom.product_id) {
    return { data: null, error: "Product ID is required" };
  }
  if (!bom.name) {
    return { data: null, error: "BOM name is required" };
  }

  // Calculate item amounts and total cost
  const itemsWithAmounts = items.map((item) => {
    const effectiveQty =
      item.quantity_per_piece * (1 + (item.wastage_percent ?? 0) / 100);
    const amount = effectiveQty * item.rate;
    return { ...item, amount };
  });

  const totalCost = itemsWithAmounts.reduce((sum, item) => sum + item.amount, 0);

  const { data: newBOM, error: bomError } = await supabase
    .from("boms")
    .insert({ ...bom, total_cost: totalCost, status: bom.status ?? "draft" })
    .select()
    .single();

  if (bomError) {
    return { data: null, error: bomError.message };
  }

  const bomItems = itemsWithAmounts.map((item) => ({
    ...item,
    bom_id: newBOM.id,
  }));

  const { data: createdItems, error: itemsError } = await supabase
    .from("bom_items")
    .insert(bomItems)
    .select();

  if (itemsError) {
    return { data: null, error: itemsError.message };
  }

  return { data: { bom: newBOM, items: createdItems }, error: null };
}

export async function updateBOM(
  id: string,
  updateData: UpdateBOMData
) {
  const supabase = await createClient();

  const { bom, items } = updateData;

  if (!id) {
    return { data: null, error: "BOM ID is required" };
  }

  // Recalculate cost
  const itemsWithAmounts = items.map((item) => {
    const effectiveQty =
      item.quantity_per_piece * (1 + (item.wastage_percent ?? 0) / 100);
    const amount = effectiveQty * item.rate;
    return { ...item, amount };
  });

  const totalCost = itemsWithAmounts.reduce((sum, item) => sum + item.amount, 0);

  const { data: updatedBOM, error: bomError } = await supabase
    .from("boms")
    .update({ ...bom, total_cost: totalCost })
    .eq("id", id)
    .select()
    .single();

  if (bomError) {
    return { data: null, error: bomError.message };
  }

  // Delete existing items and re-insert
  const { error: deleteError } = await supabase
    .from("bom_items")
    .delete()
    .eq("bom_id", id);

  if (deleteError) {
    return { data: null, error: deleteError.message };
  }

  const bomItems = itemsWithAmounts.map(({ id: _itemId, ...item }) => ({
    ...item,
    bom_id: id,
  }));

  const { data: createdItems, error: itemsError } = await supabase
    .from("bom_items")
    .insert(bomItems)
    .select();

  if (itemsError) {
    return { data: null, error: itemsError.message };
  }

  return { data: { bom: updatedBOM, items: createdItems }, error: null };
}

export async function cloneBOM(id: string, newName: string) {
  const supabase = await createClient();

  if (!id) {
    return { data: null, error: "BOM ID is required" };
  }
  if (!newName) {
    return { data: null, error: "New BOM name is required" };
  }

  const { data: sourceBOM, error: fetchError } = await supabase
    .from("boms")
    .select("*, bom_items(*)")
    .eq("id", id)
    .single();

  if (fetchError) {
    return { data: null, error: fetchError.message };
  }

  const { id: _bomId, created_at: _ca, updated_at: _ua, bom_items, ...bomData } = sourceBOM as typeof sourceBOM & { bom_items: Database["public"]["Tables"]["bom_items"]["Row"][] };

  const { data: newBOM, error: bomError } = await supabase
    .from("boms")
    .insert({ ...bomData, name: newName, status: "draft", version: 1 })
    .select()
    .single();

  if (bomError) {
    return { data: null, error: bomError.message };
  }

  if (bom_items && bom_items.length > 0) {
    const clonedItems = bom_items.map(
      ({ id: _iid, created_at: _ica, bom_id: _bid, ...item }) => ({
        ...item,
        bom_id: newBOM.id,
      })
    );

    const { error: itemsError } = await supabase
      .from("bom_items")
      .insert(clonedItems);

    if (itemsError) {
      return { data: null, error: itemsError.message };
    }
  }

  return { data: newBOM, error: null };
}

export async function calculateBOMCost(bomId: string) {
  const supabase = await createClient();

  if (!bomId) {
    return { data: null, error: "BOM ID is required" };
  }

  const { data: items, error: itemsError } = await supabase
    .from("bom_items")
    .select("quantity_per_piece, rate, wastage_percent")
    .eq("bom_id", bomId);

  if (itemsError) {
    return { data: null, error: itemsError.message };
  }

  const totalCost = (items ?? []).reduce((sum, item) => {
    const effectiveQty =
      item.quantity_per_piece * (1 + (item.wastage_percent ?? 0) / 100);
    return sum + effectiveQty * item.rate;
  }, 0);

  const { data: updatedBOM, error: updateError } = await supabase
    .from("boms")
    .update({ total_cost: totalCost })
    .eq("id", bomId)
    .select()
    .single();

  if (updateError) {
    return { data: null, error: updateError.message };
  }

  return { data: { bom: updatedBOM, total_cost: totalCost }, error: null };
}
