"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDocuments(companyId: string) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const { data, error } = await supabase
    .from("files")
    .select(
      `
      *,
      profiles:uploaded_by ( id, full_name )
    `
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getShipmentNumbers(companyId: string) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const { data, error } = await supabase
    .from("shipments")
    .select("id, shipment_number, status")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
