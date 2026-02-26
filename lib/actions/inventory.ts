"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type InventoryInsert = Database["public"]["Tables"]["inventory"]["Insert"];
type GRNInsert = Database["public"]["Tables"]["grns"]["Insert"];
type GRNItemInsert = Database["public"]["Tables"]["grn_items"]["Insert"];

interface InventoryFilters {
  item_type?: string;
  status?: string;
  search?: string;
  warehouse_id?: string;
  low_stock_only?: boolean;
}

interface GRNData {
  grn: Omit<GRNInsert, "grn_number">;
  items: Omit<GRNItemInsert, "grn_id">[];
}

interface IssueItem {
  item_type: string;
  item_id: string;
  quantity: number;
  uom: string;
}

interface QCResult {
  grn_item_id: string;
  accepted_quantity: number;
  rejected_quantity: number;
  rejection_reason?: string;
}

export async function getInventory(
  companyId: string,
  filters?: InventoryFilters
) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  let query = supabase
    .from("inventory")
    .select("*")
    .eq("company_id", companyId)
    .order("item_name", { ascending: true });

  if (filters?.item_type) {
    query = query.eq("item_type", filters.item_type);
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.warehouse_id) {
    query = query.eq("warehouse_id", filters.warehouse_id);
  }

  if (filters?.search) {
    query = query.ilike("item_name", `%${filters.search}%`);
  }

  if (filters?.low_stock_only) {
    query = query.not("reorder_level", "is", null);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error: error.message };
  }

  let result = data ?? [];

  if (filters?.low_stock_only) {
    result = result.filter(
      (item) =>
        item.reorder_level !== null &&
        item.quantity <= item.reorder_level
    );
  }

  return { data: result, error: null };
}

export async function getStockSummary(companyId: string) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const { data, error } = await supabase
    .from("inventory")
    .select("item_type, quantity, rate, status")
    .eq("company_id", companyId);

  if (error) {
    return { data: null, error: error.message };
  }

  const byCategory = (data ?? []).reduce(
    (
      acc: Record<
        string,
        {
          item_type: string;
          total_quantity: number;
          total_value: number;
          available_value: number;
          quarantine_value: number;
        }
      >,
      item
    ) => {
      const type = item.item_type;
      if (!acc[type]) {
        acc[type] = {
          item_type: type,
          total_quantity: 0,
          total_value: 0,
          available_value: 0,
          quarantine_value: 0,
        };
      }
      const value = item.quantity * item.rate;
      acc[type].total_quantity += item.quantity;
      acc[type].total_value += value;
      if (item.status === "available" || item.status === "approved") {
        acc[type].available_value += value;
      }
      if (item.status === "quarantine") {
        acc[type].quarantine_value += value;
      }
      return acc;
    },
    {}
  );

  const totalValue = Object.values(byCategory).reduce(
    (sum, cat) => sum + cat.total_value,
    0
  );

  return {
    data: {
      by_category: Object.values(byCategory),
      total_value: totalValue,
    },
    error: null,
  };
}

export async function getLowStockItems(companyId: string) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .eq("company_id", companyId)
    .not("reorder_level", "is", null)
    .in("status", ["available", "approved"])
    .order("item_name");

  if (error) {
    return { data: null, error: error.message };
  }

  const lowStockItems = (data ?? []).filter(
    (item) => item.reorder_level !== null && item.quantity <= item.reorder_level
  );

  return { data: lowStockItems, error: null };
}

export async function createGRN(grnData: GRNData) {
  const supabase = await createClient();

  const { grn, items } = grnData;

  if (!grn.company_id) {
    return { data: null, error: "Company ID is required" };
  }
  if (!grn.po_id) {
    return { data: null, error: "Purchase order ID is required" };
  }
  if (!items || items.length === 0) {
    return { data: null, error: "At least one GRN item is required" };
  }

  const { data: grnNumber, error: numberError } = await supabase.rpc(
    "get_next_number",
    {
      p_company_id: grn.company_id,
      p_document_type: "grn",
    }
  );

  if (numberError) {
    return { data: null, error: numberError.message };
  }

  const { data: newGRN, error: grnError } = await supabase
    .from("grns")
    .insert({ ...grn, grn_number: grnNumber })
    .select()
    .single();

  if (grnError) {
    return { data: null, error: grnError.message };
  }

  const grnItems = items.map((item) => ({
    ...item,
    grn_id: newGRN.id,
    stock_status: "quarantine" as const,
  }));

  const { data: createdItems, error: itemsError } = await supabase
    .from("grn_items")
    .insert(grnItems)
    .select();

  if (itemsError) {
    return { data: null, error: itemsError.message };
  }

  // Add items to inventory with 'quarantine' status
  const inventoryInserts: InventoryInsert[] = items.map((item) => ({
    company_id: grn.company_id,
    item_type: item.item_type,
    item_id: item.item_id,
    item_name: item.item_name,
    quantity: item.received_quantity,
    reserved_quantity: 0,
    uom: item.uom,
    rate: 0,
    status: "quarantine",
    grn_id: newGRN.id,
    batch_number: item.batch_number,
  }));

  await supabase.from("inventory").insert(inventoryInserts);

  return { data: { grn: newGRN, items: createdItems }, error: null };
}

export async function updateInventoryAfterQC(
  grnId: string,
  results: QCResult[]
) {
  const supabase = await createClient();

  if (!grnId) {
    return { data: null, error: "GRN ID is required" };
  }
  if (!results || results.length === 0) {
    return { data: null, error: "QC results are required" };
  }

  const updates: { grnItemId: string; status: string }[] = [];

  for (const result of results) {
    const { data: grnItem, error: itemError } = await supabase
      .from("grn_items")
      .update({
        accepted_quantity: result.accepted_quantity,
        rejected_quantity: result.rejected_quantity,
        stock_status: result.rejected_quantity === 0 ? "approved" : "partial",
        rejection_reason: result.rejection_reason ?? null,
      })
      .eq("id", result.grn_item_id)
      .select()
      .single();

    if (itemError) {
      return { data: null, error: itemError.message };
    }

    updates.push({
      grnItemId: result.grn_item_id,
      status: result.rejected_quantity === 0 ? "approved" : "partial",
    });

    // Update corresponding inventory record
    if (grnItem) {
      const newStatus =
        result.accepted_quantity > 0 ? "available" : "rejected";

      await supabase
        .from("inventory")
        .update({
          quantity: result.accepted_quantity,
          status: newStatus,
        })
        .eq("grn_id", grnId)
        .eq("item_id", grnItem.item_id)
        .eq("item_type", grnItem.item_type);
    }
  }

  // Update GRN status
  await supabase
    .from("grns")
    .update({ status: "qc_completed" })
    .eq("id", grnId);

  return { data: updates, error: null };
}

export async function issueToProduction(
  workOrderId: string,
  items: IssueItem[]
) {
  const supabase = await createClient();

  if (!workOrderId) {
    return { data: null, error: "Work order ID is required" };
  }
  if (!items || items.length === 0) {
    return { data: null, error: "Items to issue are required" };
  }

  const issuedItems: { item_id: string; item_type: string; quantity: number }[] = [];

  for (const item of items) {
    const { data: inventoryItems, error: invError } = await supabase
      .from("inventory")
      .select("id, quantity, reserved_quantity")
      .eq("item_id", item.item_id)
      .eq("item_type", item.item_type)
      .in("status", ["available", "approved"])
      .order("created_at", { ascending: true });

    if (invError) {
      return { data: null, error: invError.message };
    }

    const totalAvailable =
      inventoryItems?.reduce(
        (sum, inv) => sum + (inv.quantity - (inv.reserved_quantity ?? 0)),
        0
      ) ?? 0;

    if (totalAvailable < item.quantity) {
      return {
        data: null,
        error: `Insufficient stock for ${item.item_type} item ${item.item_id}. Required: ${item.quantity}, Available: ${totalAvailable}`,
      };
    }

    // Deduct FIFO
    let remaining = item.quantity;
    for (const inv of inventoryItems ?? []) {
      if (remaining <= 0) break;
      const available = inv.quantity - (inv.reserved_quantity ?? 0);
      const deduct = Math.min(available, remaining);

      await supabase
        .from("inventory")
        .update({ quantity: inv.quantity - deduct })
        .eq("id", inv.id);

      remaining -= deduct;
    }

    issuedItems.push({
      item_id: item.item_id,
      item_type: item.item_type,
      quantity: item.quantity,
    });
  }

  return { data: { work_order_id: workOrderId, issued_items: issuedItems }, error: null };
}

export async function adjustStock(
  inventoryId: string,
  newQty: number,
  reason: string,
  userId: string
) {
  const supabase = await createClient();

  if (!inventoryId) {
    return { data: null, error: "Inventory ID is required" };
  }
  if (newQty < 0) {
    return { data: null, error: "New quantity cannot be negative" };
  }
  if (!reason) {
    return { data: null, error: "Reason for adjustment is required" };
  }
  if (!userId) {
    return { data: null, error: "User ID is required" };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("inventory")
    .select("*")
    .eq("id", inventoryId)
    .single();

  if (fetchError) {
    return { data: null, error: fetchError.message };
  }

  const { data: updated, error: updateError } = await supabase
    .from("inventory")
    .update({ quantity: newQty })
    .eq("id", inventoryId)
    .select()
    .single();

  if (updateError) {
    return { data: null, error: updateError.message };
  }

  // Log audit
  await supabase.from("audit_logs").insert({
    company_id: existing.company_id,
    table_name: "inventory",
    record_id: inventoryId,
    action: "stock_adjustment",
    old_data: { quantity: existing.quantity },
    new_data: { quantity: newQty, reason },
    user_id: userId,
  });

  return { data: updated, error: null };
}
