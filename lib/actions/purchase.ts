"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type PurchaseOrderInsert =
  Database["public"]["Tables"]["purchase_orders"]["Insert"];
type GRNInsert = Database["public"]["Tables"]["grns"]["Insert"];
type GRNItemInsert = Database["public"]["Tables"]["grn_items"]["Insert"];
type POItemInsert = Database["public"]["Tables"]["po_items"]["Insert"];

interface POFilters {
  status?: string;
  supplier_id?: string;
  search?: string;
  from_date?: string;
  to_date?: string;
}

interface GRNFilters {
  status?: string;
  supplier_id?: string;
  from_date?: string;
  to_date?: string;
}

interface CreatePOData {
  po: Omit<PurchaseOrderInsert, "po_number">;
  items: Omit<POItemInsert, "po_id">[];
}

interface CreateGRNData {
  grn: Omit<GRNInsert, "grn_number">;
  items: Omit<GRNItemInsert, "grn_id">[];
}

// Approval threshold in base currency (e.g., INR)
const APPROVAL_THRESHOLD = 50000;

export async function getPurchaseOrders(
  companyId: string,
  filters?: POFilters
) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  let query = supabase
    .from("purchase_orders")
    .select(
      `
      *,
      suppliers ( id, name, code, contact_person, email ),
      po_items ( * )
    `
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.supplier_id) {
    query = query.eq("supplier_id", filters.supplier_id);
  }

  if (filters?.search) {
    query = query.ilike("po_number", `%${filters.search}%`);
  }

  if (filters?.from_date) {
    query = query.gte("created_at", filters.from_date);
  }

  if (filters?.to_date) {
    query = query.lte("created_at", filters.to_date);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function createPurchaseOrder(poData: CreatePOData) {
  const supabase = await createClient();

  const { po, items } = poData;

  if (!po.company_id) {
    return { data: null, error: "Company ID is required" };
  }
  if (!po.supplier_id) {
    return { data: null, error: "Supplier ID is required" };
  }
  if (!items || items.length === 0) {
    return { data: null, error: "At least one PO item is required" };
  }

  const { data: poNumber, error: numberError } = await supabase.rpc(
    "get_next_number",
    {
      p_company_id: po.company_id,
      p_document_type: "purchase_order",
    }
  );

  if (numberError) {
    return { data: null, error: numberError.message };
  }

  // Determine status based on approval threshold
  const requiresApproval = (po.total_amount ?? 0) >= APPROVAL_THRESHOLD;
  const status = requiresApproval ? "pending_approval" : "approved";

  const { data: newPO, error: poError } = await supabase
    .from("purchase_orders")
    .insert({ ...po, po_number: poNumber, status })
    .select()
    .single();

  if (poError) {
    return { data: null, error: poError.message };
  }

  const poItems = items.map((item) => ({ ...item, po_id: newPO.id }));

  const { data: createdItems, error: itemsError } = await supabase
    .from("po_items")
    .insert(poItems)
    .select();

  if (itemsError) {
    return { data: null, error: itemsError.message };
  }

  return {
    data: {
      po: newPO,
      items: createdItems,
      requires_approval: requiresApproval,
    },
    error: null,
  };
}

export async function approvePurchaseOrder(poId: string, userId: string) {
  const supabase = await createClient();

  if (!poId) {
    return { data: null, error: "Purchase order ID is required" };
  }
  if (!userId) {
    return { data: null, error: "Approver user ID is required" };
  }

  const { data: po, error: fetchError } = await supabase
    .from("purchase_orders")
    .select("id, status")
    .eq("id", poId)
    .single();

  if (fetchError) {
    return { data: null, error: fetchError.message };
  }

  if (po.status === "approved") {
    return { data: null, error: "Purchase order is already approved" };
  }

  if (po.status === "cancelled") {
    return { data: null, error: "Cannot approve a cancelled purchase order" };
  }

  const { data: updated, error } = await supabase
    .from("purchase_orders")
    .update({
      status: "approved",
      approved_by: userId,
      approved_at: new Date().toISOString(),
    })
    .eq("id", poId)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: updated, error: null };
}

export async function getPriceHistory(
  itemId: string,
  itemType: string,
  companyId: string
) {
  const supabase = await createClient();

  if (!itemId) {
    return { data: null, error: "Item ID is required" };
  }
  if (!itemType) {
    return { data: null, error: "Item type is required" };
  }
  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const { data: poItems, error } = await supabase
    .from("po_items")
    .select(
      `
      rate,
      uom,
      quantity,
      purchase_orders!inner (
        id,
        po_number,
        company_id,
        supplier_id,
        created_at,
        status,
        suppliers ( id, name, code )
      )
    `
    )
    .eq("item_id", itemId)
    .eq("item_type", itemType)
    .eq("purchase_orders.company_id", companyId)
    .in("purchase_orders.status", ["approved", "ordered", "partial", "received", "closed"])
    .order("purchase_orders.created_at", { ascending: false })
    .limit(5);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: poItems, error: null };
}

export async function getGRNs(companyId: string, filters?: GRNFilters) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  let query = supabase
    .from("grns")
    .select(
      `
      *,
      suppliers ( id, name, code ),
      purchase_orders ( id, po_number ),
      grn_items ( * )
    `
    )
    .eq("company_id", companyId)
    .order("received_date", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.supplier_id) {
    query = query.eq("supplier_id", filters.supplier_id);
  }

  if (filters?.from_date) {
    query = query.gte("received_date", filters.from_date);
  }

  if (filters?.to_date) {
    query = query.lte("received_date", filters.to_date);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function createGRN(grnData: CreateGRNData) {
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

  // Verify PO exists and is approved/ordered
  const { data: po, error: poError } = await supabase
    .from("purchase_orders")
    .select("id, status, supplier_id")
    .eq("id", grn.po_id)
    .single();

  if (poError) {
    return { data: null, error: poError.message };
  }

  if (!["approved", "ordered", "partial"].includes(po.status)) {
    return {
      data: null,
      error: `Cannot create GRN for a PO with status: ${po.status}`,
    };
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
    .insert({
      ...grn,
      grn_number: grnNumber,
      supplier_id: grn.supplier_id ?? po.supplier_id,
      status: "received",
    })
    .select()
    .single();

  if (grnError) {
    return { data: null, error: grnError.message };
  }

  const grnItems = items.map((item) => ({
    ...item,
    grn_id: newGRN.id,
    stock_status: "quarantine",
  }));

  const { data: createdItems, error: itemsError } = await supabase
    .from("grn_items")
    .insert(grnItems)
    .select();

  if (itemsError) {
    return { data: null, error: itemsError.message };
  }

  // Update PO received quantities
  for (const item of items) {
    if (item.po_item_id) {
      const { data: poItem } = await supabase
        .from("po_items")
        .select("quantity, received_quantity")
        .eq("id", item.po_item_id)
        .single();

      if (poItem) {
        await supabase
          .from("po_items")
          .update({
            received_quantity:
              (poItem.received_quantity ?? 0) + item.received_quantity,
          })
          .eq("id", item.po_item_id);
      }
    }
  }

  // Update PO status
  const { data: allPOItems } = await supabase
    .from("po_items")
    .select("quantity, received_quantity")
    .eq("po_id", grn.po_id);

  if (allPOItems) {
    const allReceived = allPOItems.every(
      (i) => (i.received_quantity ?? 0) >= i.quantity
    );
    const anyReceived = allPOItems.some((i) => (i.received_quantity ?? 0) > 0);

    await supabase
      .from("purchase_orders")
      .update({ status: allReceived ? "received" : anyReceived ? "partial" : "ordered" })
      .eq("id", grn.po_id);
  }

  return { data: { grn: newGRN, items: createdItems }, error: null };
}
