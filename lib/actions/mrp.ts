"use server";

import { createClient } from "@/lib/supabase/server";

interface MRPMaterialRequirement {
  materialId: string;
  materialName: string;
  materialType: string;
  uom: string;
  requiredQty: number;
  availableStock: number;
  shortage: number;
  orderId: string;
  orderNumber: string;
  deliveryDate: string;
}

interface MRPOrderData {
  orderId: string;
  orderNumber: string;
  buyer: string;
  styleName: string;
  quantity: number;
  deliveryDate: string;
  status: string;
  materials: MRPMaterialRequirement[];
}

interface MRPData {
  orders: MRPOrderData[];
  globalShortages: MRPMaterialRequirement[];
  summary: {
    totalOpenOrders: number;
    totalMaterialsRequired: number;
    criticalShortages: number;
    indentsRaised: number;
  };
}

export async function getMRPData(companyId: string): Promise<{
  data: MRPData | null;
  error: string | null;
}> {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  // Fetch confirmed/in-progress orders
  const { data: orders, error: ordersError } = await supabase
    .from("sales_orders")
    .select(
      `
      id,
      order_number,
      product_name,
      total_quantity,
      delivery_date,
      status,
      bom_id,
      buyers ( name )
    `
    )
    .eq("company_id", companyId)
    .in("status", ["confirmed", "in_production", "planned"])
    .order("delivery_date", { ascending: true });

  if (ordersError) {
    return { data: null, error: ordersError.message };
  }

  const mrpOrders: MRPOrderData[] = [];
  const allShortages: MRPMaterialRequirement[] = [];

  for (const order of orders ?? []) {
    const materials: MRPMaterialRequirement[] = [];

    // If order has a BOM, fetch it
    if (order.bom_id) {
      const { data: bomItems } = await supabase
        .from("bom_items")
        .select("item_id, item_name, item_type, quantity_per_piece, uom, wastage_percent")
        .eq("bom_id", order.bom_id);

      for (const item of bomItems ?? []) {
        const qtyWithWastage =
          item.quantity_per_piece *
          (1 + (item.wastage_percent ?? 0) / 100) *
          order.total_quantity;

        // Check available stock
        const { data: stockRows } = await supabase
          .from("inventory")
          .select("quantity, reserved_quantity")
          .eq("company_id", companyId)
          .eq("item_id", item.item_id)
          .eq("status", "available");

        const available = (stockRows ?? []).reduce(
          (sum, r) => sum + (r.quantity - (r.reserved_quantity ?? 0)),
          0
        );

        const shortage = available - qtyWithWastage;

        const req: MRPMaterialRequirement = {
          materialId: item.item_id,
          materialName: item.item_name,
          materialType: item.item_type,
          uom: item.uom,
          requiredQty: Math.ceil(qtyWithWastage * 100) / 100,
          availableStock: Math.round(available * 100) / 100,
          shortage: Math.round(shortage * 100) / 100,
          orderId: order.id,
          orderNumber: order.order_number,
          deliveryDate: order.delivery_date,
        };

        materials.push(req);

        if (shortage < 0) {
          allShortages.push(req);
        }
      }
    }

    const buyerName =
      (order.buyers as { name: string } | null)?.name ?? "Unknown";

    mrpOrders.push({
      orderId: order.id,
      orderNumber: order.order_number,
      buyer: buyerName,
      styleName: order.product_name,
      quantity: order.total_quantity,
      deliveryDate: order.delivery_date,
      status: order.status,
      materials,
    });
  }

  // Sort shortages by delivery date (most urgent first)
  allShortages.sort(
    (a, b) =>
      new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
  );

  const criticalShortages = allShortages.length;

  return {
    data: {
      orders: mrpOrders,
      globalShortages: allShortages,
      summary: {
        totalOpenOrders: mrpOrders.length,
        totalMaterialsRequired: mrpOrders.reduce(
          (sum, o) => sum + o.materials.length,
          0
        ),
        criticalShortages,
        indentsRaised: 0,
      },
    },
    error: null,
  };
}

export async function generatePurchaseIndents(
  companyId: string,
  userId: string,
  items: {
    materialId: string;
    materialName: string;
    materialType: string;
    requiredQty: number;
    shortageQty: number;
    uom: string;
    orderId?: string;
  }[]
) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }
  if (!items || items.length === 0) {
    return { data: null, error: "No items provided" };
  }
  if (!userId) {
    return { data: null, error: "User ID is required" };
  }

  // Get a document number for the material request
  const { data: requestNumber, error: numberError } = await supabase.rpc(
    "get_next_number",
    {
      p_company_id: companyId,
      p_document_type: "material_request",
    }
  );

  if (numberError) {
    return { data: null, error: numberError.message };
  }

  // Get the order_id from first item if present
  const primaryOrderId = items[0]?.orderId ?? null;

  // Create material request header
  const { data: mr, error: mrError } = await supabase
    .from("material_requests")
    .insert({
      company_id: companyId,
      request_number: requestNumber,
      order_id: primaryOrderId,
      requested_by: userId,
      department: "purchase",
      priority: "high",
      required_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status: "pending",
      notes: `Auto-generated from MRP run. ${items.length} items with shortages.`,
    })
    .select()
    .single();

  if (mrError) {
    return { data: null, error: mrError.message };
  }

  return {
    data: {
      materialRequest: mr,
      itemsCount: items.length,
      requestNumber,
    },
    error: null,
  };
}
