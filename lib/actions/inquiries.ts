"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type InquiryInsert = Database["public"]["Tables"]["inquiries"]["Insert"];
type InquiryUpdate = Database["public"]["Tables"]["inquiries"]["Update"];

interface InquiryFilters {
  status?: string;
  buyer_id?: string;
  search?: string;
  from_date?: string;
  to_date?: string;
}

export async function getInquiries(
  companyId: string,
  filters?: InquiryFilters
) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  let query = supabase
    .from("inquiries")
    .select(
      `
      *,
      buyers ( id, name, code, country ),
      products ( id, name, style_code, category )
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
      `inquiry_number.ilike.%${filters.search}%,product_name.ilike.%${filters.search}%`
    );
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

export async function createInquiry(
  data: Omit<InquiryInsert, "inquiry_number">
) {
  const supabase = await createClient();

  if (!data.company_id) {
    return { data: null, error: "Company ID is required" };
  }
  if (!data.buyer_id) {
    return { data: null, error: "Buyer ID is required" };
  }

  const { data: inquiryNumber, error: numberError } = await supabase.rpc(
    "get_next_number",
    {
      p_company_id: data.company_id,
      p_document_type: "inquiry",
    }
  );

  if (numberError) {
    return { data: null, error: numberError.message };
  }

  const { data: inquiry, error } = await supabase
    .from("inquiries")
    .insert({ ...data, inquiry_number: inquiryNumber })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: inquiry, error: null };
}

export async function updateInquiry(id: string, data: InquiryUpdate) {
  const supabase = await createClient();

  if (!id) {
    return { data: null, error: "Inquiry ID is required" };
  }

  const { data: inquiry, error } = await supabase
    .from("inquiries")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: inquiry, error: null };
}

export async function convertToOrder(inquiryId: string) {
  const supabase = await createClient();

  if (!inquiryId) {
    return { data: null, error: "Inquiry ID is required" };
  }

  const { data: inquiry, error: inquiryError } = await supabase
    .from("inquiries")
    .select("*")
    .eq("id", inquiryId)
    .single();

  if (inquiryError) {
    return { data: null, error: inquiryError.message };
  }

  if (inquiry.status === "converted") {
    return { data: null, error: "Inquiry has already been converted to an order" };
  }

  const { data: orderNumber, error: numberError } = await supabase.rpc(
    "get_next_number",
    {
      p_company_id: inquiry.company_id,
      p_document_type: "sales_order",
    }
  );

  if (numberError) {
    return { data: null, error: numberError.message };
  }

  const today = new Date().toISOString().split("T")[0];
  const deliveryDate = inquiry.expected_delivery_date ?? today;

  const { data: order, error: orderError } = await supabase
    .from("sales_orders")
    .insert({
      company_id: inquiry.company_id,
      order_number: orderNumber,
      buyer_id: inquiry.buyer_id,
      product_id: inquiry.product_id,
      product_name: inquiry.product_name ?? "TBD",
      order_date: today,
      delivery_date: deliveryDate,
      fob_price: inquiry.target_price ?? 0,
      currency: inquiry.currency,
      total_quantity: inquiry.expected_quantity,
      total_value: (inquiry.target_price ?? 0) * inquiry.expected_quantity,
      color_size_matrix: {},
      status: "draft",
      inquiry_id: inquiry.id,
      created_by: inquiry.created_by,
    })
    .select()
    .single();

  if (orderError) {
    return { data: null, error: orderError.message };
  }

  // Mark inquiry as converted
  await supabase
    .from("inquiries")
    .update({ status: "converted" })
    .eq("id", inquiryId);

  return { data: order, error: null };
}
