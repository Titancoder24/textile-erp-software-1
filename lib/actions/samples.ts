"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type SampleInsert = Database["public"]["Tables"]["samples"]["Insert"];

interface SampleFilters {
  status?: string;
  buyer_id?: string;
  sample_type?: string;
  order_id?: string;
  search?: string;
}

export async function getSamples(
  companyId: string,
  filters?: SampleFilters
) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  let query = supabase
    .from("samples")
    .select(
      `
      *,
      buyers ( id, name, code, country ),
      products ( id, name, style_code ),
      sales_orders ( id, order_number )
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

  if (filters?.sample_type) {
    query = query.eq("sample_type", filters.sample_type);
  }

  if (filters?.order_id) {
    query = query.eq("order_id", filters.order_id);
  }

  if (filters?.search) {
    query = query.ilike("sample_number", `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function createSample(
  data: Omit<SampleInsert, "sample_number">
) {
  const supabase = await createClient();

  if (!data.company_id) {
    return { data: null, error: "Company ID is required" };
  }
  if (!data.buyer_id) {
    return { data: null, error: "Buyer ID is required" };
  }
  if (!data.sample_type) {
    return { data: null, error: "Sample type is required" };
  }

  const { data: sampleNumber, error: numberError } = await supabase.rpc(
    "get_next_number",
    {
      p_company_id: data.company_id,
      p_document_type: "sample",
    }
  );

  if (numberError) {
    return { data: null, error: numberError.message };
  }

  const { data: sample, error } = await supabase
    .from("samples")
    .insert({
      ...data,
      sample_number: sampleNumber,
      status: data.status ?? "pending",
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: sample, error: null };
}

export async function updateSampleStatus(
  id: string,
  status: string,
  comments?: string
) {
  const supabase = await createClient();

  if (!id) {
    return { data: null, error: "Sample ID is required" };
  }
  if (!status) {
    return { data: null, error: "Status is required" };
  }

  const validStatuses = [
    "pending",
    "in_progress",
    "submitted",
    "approved",
    "rejected",
    "cancelled",
  ];
  if (!validStatuses.includes(status)) {
    return {
      data: null,
      error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    };
  }

  const updateData: {
    status: string;
    rejection_comments?: string | null;
    approved_date?: string | null;
    submitted_date?: string | null;
  } = { status };

  if (status === "approved") {
    updateData.approved_date = new Date().toISOString().split("T")[0];
  }

  if (status === "submitted") {
    updateData.submitted_date = new Date().toISOString().split("T")[0];
  }

  if (status === "rejected" && comments) {
    updateData.rejection_comments = comments;
  }

  const { data, error } = await supabase
    .from("samples")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
