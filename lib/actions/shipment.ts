"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ShipmentInsert = Database["public"]["Tables"]["shipments"]["Insert"];
type ShipmentUpdate = Database["public"]["Tables"]["shipments"]["Update"];

interface ShipmentFilters {
  status?: string;
  buyer_id?: string;
  search?: string;
  from_date?: string;
  to_date?: string;
}

interface CreateShipmentData {
  buyer_id: string;
  company_id: string;
  planned_shipment_date: string;
  port_of_loading?: string;
  port_of_discharge?: string;
  container_number?: string;
  container_type?: string;
  vessel_name?: string;
  order_ids?: string[];
  etd?: string;
  eta?: string;
  total_cartons?: number;
  total_pieces?: number;
  created_by: string;
}

interface UpdateShipmentStatusData {
  status?: string;
  actual_shipment_date?: string;
  production_complete?: boolean;
  qc_passed?: boolean;
  packing_done?: boolean;
  documents_ready?: boolean;
  transport_arranged?: boolean;
  container_number?: string;
  seal_number?: string;
  vessel_name?: string;
  voyage_number?: string;
  etd?: string;
  eta?: string;
}

export async function getShipments(
  companyId: string,
  filters?: ShipmentFilters
) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  let query = supabase
    .from("shipments")
    .select(
      `
      *,
      buyers ( id, name, code, country )
    `
    )
    .eq("company_id", companyId)
    .order("planned_shipment_date", { ascending: true });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.buyer_id) {
    query = query.eq("buyer_id", filters.buyer_id);
  }

  if (filters?.search) {
    query = query.ilike("shipment_number", `%${filters.search}%`);
  }

  if (filters?.from_date) {
    query = query.gte("planned_shipment_date", filters.from_date);
  }

  if (filters?.to_date) {
    query = query.lte("planned_shipment_date", filters.to_date);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function createShipment(shipmentData: CreateShipmentData) {
  const supabase = await createClient();

  if (!shipmentData.company_id) {
    return { data: null, error: "Company ID is required" };
  }
  if (!shipmentData.buyer_id) {
    return { data: null, error: "Buyer is required" };
  }
  if (!shipmentData.planned_shipment_date) {
    return { data: null, error: "Planned shipment date is required" };
  }
  if (!shipmentData.created_by) {
    return { data: null, error: "Creator user ID is required" };
  }

  const { data: shipmentNumber, error: numberError } = await supabase.rpc(
    "get_next_number",
    {
      p_company_id: shipmentData.company_id,
      p_document_type: "shipment",
    }
  );

  if (numberError) {
    return { data: null, error: numberError.message };
  }

  const insertPayload: ShipmentInsert = {
    company_id: shipmentData.company_id,
    shipment_number: shipmentNumber,
    buyer_id: shipmentData.buyer_id,
    planned_shipment_date: shipmentData.planned_shipment_date,
    port_of_loading: shipmentData.port_of_loading ?? null,
    port_of_discharge: shipmentData.port_of_discharge ?? null,
    container_number: shipmentData.container_number ?? null,
    container_type: shipmentData.container_type ?? "40ft",
    vessel_name: shipmentData.vessel_name ?? null,
    order_ids: shipmentData.order_ids ?? [],
    etd: shipmentData.etd ?? null,
    eta: shipmentData.eta ?? null,
    total_cartons: shipmentData.total_cartons ?? 0,
    total_pieces: shipmentData.total_pieces ?? 0,
    status: "packing",
    production_complete: false,
    qc_passed: false,
    packing_done: false,
    documents_ready: false,
    transport_arranged: false,
    created_by: shipmentData.created_by,
  };

  const { data: newShipment, error: insertError } = await supabase
    .from("shipments")
    .insert(insertPayload)
    .select(
      `
      *,
      buyers ( id, name, code, country )
    `
    )
    .single();

  if (insertError) {
    return { data: null, error: insertError.message };
  }

  return { data: newShipment, error: null };
}

export async function updateShipmentStatus(
  id: string,
  status: string,
  updateData?: UpdateShipmentStatusData
) {
  const supabase = await createClient();

  if (!id) {
    return { data: null, error: "Shipment ID is required" };
  }

  const validStatuses = [
    "packing",
    "ready",
    "in_transit",
    "delivered",
    "delayed",
  ];
  if (!validStatuses.includes(status)) {
    return { data: null, error: `Invalid status: ${status}` };
  }

  const updatePayload: ShipmentUpdate = {
    status,
    ...updateData,
  };

  // Auto-set actual_shipment_date when transitioning to in_transit
  if (status === "in_transit" && !updateData?.actual_shipment_date) {
    updatePayload.actual_shipment_date = new Date().toISOString().split("T")[0];
  }

  const { data: updated, error } = await supabase
    .from("shipments")
    .update(updatePayload)
    .eq("id", id)
    .select(
      `
      *,
      buyers ( id, name, code, country )
    `
    )
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: updated, error: null };
}

export async function updateShipmentChecklist(
  id: string,
  checklist: {
    production_complete?: boolean;
    qc_passed?: boolean;
    packing_done?: boolean;
    documents_ready?: boolean;
    transport_arranged?: boolean;
  }
) {
  const supabase = await createClient();

  if (!id) {
    return { data: null, error: "Shipment ID is required" };
  }

  const { data: updated, error } = await supabase
    .from("shipments")
    .update(checklist)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  // Auto-promote to "ready" if all checklist items are ticked
  const allChecked =
    (updated.production_complete ?? false) &&
    (updated.qc_passed ?? false) &&
    (updated.packing_done ?? false) &&
    (updated.documents_ready ?? false) &&
    (updated.transport_arranged ?? false);

  if (allChecked && updated.status === "packing") {
    await supabase
      .from("shipments")
      .update({ status: "ready" })
      .eq("id", id);
    updated.status = "ready";
  }

  return { data: updated, error: null };
}
