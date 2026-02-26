"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type SalesOrderInsert =
  Database["public"]["Tables"]["sales_orders"]["Insert"];
type SalesOrderUpdate =
  Database["public"]["Tables"]["sales_orders"]["Update"];

interface OrderFilters {
  status?: string;
  buyer_id?: string;
  search?: string;
  from_date?: string;
  to_date?: string;
}

export async function getOrders(companyId: string, filters?: OrderFilters) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  let query = supabase
    .from("sales_orders")
    .select(
      `
      *,
      buyers ( id, name, code, country, default_currency )
    `
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.buyer_id) {
    query = query.eq("buyer_id", filters.buyer_id);
  }

  if (filters?.search) {
    query = query.or(
      `order_number.ilike.%${filters.search}%,product_name.ilike.%${filters.search}%`
    );
  }

  if (filters?.from_date) {
    query = query.gte("order_date", filters.from_date);
  }

  if (filters?.to_date) {
    query = query.lte("order_date", filters.to_date);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getOrder(id: string) {
  const supabase = await createClient();

  if (!id) {
    return { data: null, error: "Order ID is required" };
  }

  const { data: order, error: orderError } = await supabase
    .from("sales_orders")
    .select(
      `
      *,
      buyers ( * ),
      products ( * ),
      boms ( id, name, version, total_cost )
    `
    )
    .eq("id", id)
    .single();

  if (orderError) {
    return { data: null, error: orderError.message };
  }

  const [
    amendmentsResult,
    workOrdersResult,
    samplesResult,
    shipmentsResult,
    inspectionsResult,
    tnaMilestonesResult,
  ] = await Promise.all([
    supabase
      .from("order_amendments")
      .select("*")
      .eq("order_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("work_orders")
      .select("*")
      .eq("order_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("samples")
      .select("*")
      .eq("order_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("shipments")
      .select("*")
      .contains("order_ids", [id]),
    supabase
      .from("inspections")
      .select("*")
      .eq("order_id", id)
      .order("inspection_date", { ascending: false }),
    supabase
      .from("tna_milestones")
      .select("*")
      .eq("order_id", id)
      .order("sort_order", { ascending: true }),
  ]);

  return {
    data: {
      ...order,
      amendments: amendmentsResult.data ?? [],
      work_orders: workOrdersResult.data ?? [],
      samples: samplesResult.data ?? [],
      shipments: shipmentsResult.data ?? [],
      inspections: inspectionsResult.data ?? [],
      tna_milestones: tnaMilestonesResult.data ?? [],
    },
    error: null,
  };
}

export async function createOrder(
  data: Omit<SalesOrderInsert, "order_number">
) {
  const supabase = await createClient();

  if (!data.company_id) {
    return { data: null, error: "Company ID is required" };
  }
  if (!data.buyer_id) {
    return { data: null, error: "Buyer ID is required" };
  }

  const { data: orderNumber, error: numberError } = await supabase.rpc(
    "get_next_number",
    {
      p_company_id: data.company_id,
      p_document_type: "sales_order",
    }
  );

  if (numberError) {
    return { data: null, error: numberError.message };
  }

  const { data: order, error } = await supabase
    .from("sales_orders")
    .insert({ ...data, order_number: orderNumber })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: order, error: null };
}

export async function updateOrder(
  id: string,
  data: SalesOrderUpdate,
  changedBy: string
) {
  const supabase = await createClient();

  if (!id) {
    return { data: null, error: "Order ID is required" };
  }
  if (!changedBy) {
    return { data: null, error: "Changed by user ID is required" };
  }

  const { data: existingOrder, error: fetchError } = await supabase
    .from("sales_orders")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) {
    return { data: null, error: fetchError.message };
  }

  const { data: updatedOrder, error: updateError } = await supabase
    .from("sales_orders")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return { data: null, error: updateError.message };
  }

  // Log amendments for changed fields
  const amendableFields: (keyof SalesOrderUpdate)[] = [
    "delivery_date",
    "total_quantity",
    "fob_price",
    "total_value",
    "status",
    "payment_terms",
    "special_instructions",
    "color_size_matrix",
  ];

  const amendments = amendableFields
    .filter((field) => {
      const newVal = data[field];
      const oldVal = existingOrder[field as keyof typeof existingOrder];
      return newVal !== undefined && JSON.stringify(newVal) !== JSON.stringify(oldVal);
    })
    .map((field) => ({
      order_id: id,
      field_name: field,
      old_value: JSON.stringify(
        existingOrder[field as keyof typeof existingOrder]
      ),
      new_value: JSON.stringify(data[field]),
      changed_by: changedBy,
    }));

  if (amendments.length > 0) {
    await supabase.from("order_amendments").insert(amendments);
  }

  return { data: updatedOrder, error: null };
}

export async function getOrderProductionStatus(orderId: string) {
  const supabase = await createClient();

  if (!orderId) {
    return { data: null, error: "Order ID is required" };
  }

  const { data: order, error: orderError } = await supabase
    .from("sales_orders")
    .select("id, total_quantity")
    .eq("id", orderId)
    .single();

  if (orderError) {
    return { data: null, error: orderError.message };
  }

  const { data: workOrders, error: woError } = await supabase
    .from("work_orders")
    .select("good_output, total_quantity, status")
    .eq("order_id", orderId);

  if (woError) {
    return { data: null, error: woError.message };
  }

  const totalProduced = workOrders?.reduce(
    (sum, wo) => sum + (wo.good_output ?? 0),
    0
  ) ?? 0;

  const totalQuantity = order.total_quantity;
  const percentComplete =
    totalQuantity > 0
      ? Math.min(100, Math.round((totalProduced / totalQuantity) * 100))
      : 0;

  return {
    data: {
      order_id: orderId,
      total_quantity: totalQuantity,
      produced_quantity: totalProduced,
      percent_complete: percentComplete,
    },
    error: null,
  };
}

export async function getOrderMaterialStatus(orderId: string) {
  const supabase = await createClient();

  if (!orderId) {
    return { data: null, error: "Order ID is required" };
  }

  const { data: order, error: orderError } = await supabase
    .from("sales_orders")
    .select("id, bom_id, total_quantity")
    .eq("id", orderId)
    .single();

  if (orderError) {
    return { data: null, error: orderError.message };
  }

  if (!order.bom_id) {
    return {
      data: {
        order_id: orderId,
        has_bom: false,
        materials: [],
        overall_availability: "unknown",
      },
      error: null,
    };
  }

  const { data: bomItems, error: bomError } = await supabase
    .from("bom_items")
    .select("*")
    .eq("bom_id", order.bom_id);

  if (bomError) {
    return { data: null, error: bomError.message };
  }

  const materialStatus = await Promise.all(
    (bomItems ?? []).map(async (item) => {
      const requiredQty = item.quantity_per_piece * order.total_quantity;

      const { data: invItems } = await supabase
        .from("inventory")
        .select("quantity, reserved_quantity, status")
        .eq("item_id", item.item_id)
        .eq("item_type", item.item_type)
        .in("status", ["available", "approved"]);

      const availableQty =
        invItems?.reduce(
          (sum, inv) =>
            sum + (inv.quantity - (inv.reserved_quantity ?? 0)),
          0
        ) ?? 0;

      return {
        item_id: item.item_id,
        item_type: item.item_type,
        item_name: item.item_name,
        required_quantity: requiredQty,
        available_quantity: availableQty,
        uom: item.uom,
        is_available: availableQty >= requiredQty,
        shortage: Math.max(0, requiredQty - availableQty),
      };
    })
  );

  const allAvailable = materialStatus.every((m) => m.is_available);
  const noneAvailable = materialStatus.every((m) => !m.is_available);

  return {
    data: {
      order_id: orderId,
      has_bom: true,
      materials: materialStatus,
      overall_availability: allAvailable
        ? "full"
        : noneAvailable
        ? "none"
        : "partial",
    },
    error: null,
  };
}
