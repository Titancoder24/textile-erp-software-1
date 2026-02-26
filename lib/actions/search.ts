"use server";

import { createClient } from "@/lib/supabase/server";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  url: string;
}

interface GlobalSearchResults {
  orders: SearchResult[];
  buyers: SearchResult[];
  products: SearchResult[];
  suppliers: SearchResult[];
  inquiries: SearchResult[];
  samples: SearchResult[];
  purchase_orders: SearchResult[];
  work_orders: SearchResult[];
}

export async function globalSearch(
  companyId: string,
  query: string
): Promise<{ data: GlobalSearchResults | null; error: string | null }> {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  if (!query || query.trim().length < 2) {
    return {
      data: null,
      error: "Search query must be at least 2 characters",
    };
  }

  const q = query.trim();

  const [
    ordersResult,
    buyersResult,
    productsResult,
    suppliersResult,
    inquiriesResult,
    samplesResult,
    posResult,
    workOrdersResult,
  ] = await Promise.all([
    // Sales Orders
    supabase
      .from("sales_orders")
      .select("id, order_number, product_name, status, buyers(name)")
      .eq("company_id", companyId)
      .or(`order_number.ilike.%${q}%,product_name.ilike.%${q}%`)
      .limit(5),

    // Buyers
    supabase
      .from("buyers")
      .select("id, name, code, country")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .or(`name.ilike.%${q}%,code.ilike.%${q}%,contact_person.ilike.%${q}%`)
      .limit(5),

    // Products
    supabase
      .from("products")
      .select("id, name, style_code, category")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .or(`name.ilike.%${q}%,style_code.ilike.%${q}%`)
      .limit(5),

    // Suppliers
    supabase
      .from("suppliers")
      .select("id, name, code, country")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .or(`name.ilike.%${q}%,code.ilike.%${q}%`)
      .limit(5),

    // Inquiries
    supabase
      .from("inquiries")
      .select("id, inquiry_number, product_name, status, buyers(name)")
      .eq("company_id", companyId)
      .or(`inquiry_number.ilike.%${q}%,product_name.ilike.%${q}%`)
      .limit(5),

    // Samples
    supabase
      .from("samples")
      .select("id, sample_number, sample_type, status, buyers(name)")
      .eq("company_id", companyId)
      .ilike("sample_number", `%${q}%`)
      .limit(5),

    // Purchase Orders
    supabase
      .from("purchase_orders")
      .select("id, po_number, status, total_amount, suppliers(name)")
      .eq("company_id", companyId)
      .ilike("po_number", `%${q}%`)
      .limit(5),

    // Work Orders
    supabase
      .from("work_orders")
      .select("id, wo_number, product_name, status")
      .eq("company_id", companyId)
      .or(`wo_number.ilike.%${q}%,product_name.ilike.%${q}%`)
      .limit(5),
  ]);

  const orders: SearchResult[] = (ordersResult.data ?? []).map((o) => ({
    id: o.id,
    title: o.order_number,
    subtitle: `${o.product_name} — ${(o.buyers as { name?: string } | null)?.name ?? ""} (${o.status})`,
    type: "sales_order",
    url: `/orders/${o.id}`,
  }));

  const buyers: SearchResult[] = (buyersResult.data ?? []).map((b) => ({
    id: b.id,
    title: b.name,
    subtitle: `${b.code} — ${b.country ?? ""}`,
    type: "buyer",
    url: `/buyers/${b.id}`,
  }));

  const products: SearchResult[] = (productsResult.data ?? []).map((p) => ({
    id: p.id,
    title: p.name,
    subtitle: `${p.style_code} — ${p.category}`,
    type: "product",
    url: `/products/${p.id}`,
  }));

  const suppliers: SearchResult[] = (suppliersResult.data ?? []).map((s) => ({
    id: s.id,
    title: s.name,
    subtitle: `${s.code} — ${s.country ?? ""}`,
    type: "supplier",
    url: `/suppliers/${s.id}`,
  }));

  const inquiries: SearchResult[] = (inquiriesResult.data ?? []).map((i) => ({
    id: i.id,
    title: i.inquiry_number,
    subtitle: `${i.product_name ?? ""} — ${(i.buyers as { name?: string } | null)?.name ?? ""} (${i.status})`,
    type: "inquiry",
    url: `/inquiries/${i.id}`,
  }));

  const samples: SearchResult[] = (samplesResult.data ?? []).map((s) => ({
    id: s.id,
    title: s.sample_number,
    subtitle: `${s.sample_type} — ${(s.buyers as { name?: string } | null)?.name ?? ""} (${s.status})`,
    type: "sample",
    url: `/samples/${s.id}`,
  }));

  const purchaseOrders: SearchResult[] = (posResult.data ?? []).map((po) => ({
    id: po.id,
    title: po.po_number,
    subtitle: `${(po.suppliers as { name?: string } | null)?.name ?? ""} — ${po.status}`,
    type: "purchase_order",
    url: `/purchase/orders/${po.id}`,
  }));

  const workOrders: SearchResult[] = (workOrdersResult.data ?? []).map(
    (wo) => ({
      id: wo.id,
      title: wo.wo_number,
      subtitle: `${wo.product_name} (${wo.status})`,
      type: "work_order",
      url: `/production/work-orders/${wo.id}`,
    })
  );

  return {
    data: {
      orders,
      buyers,
      products,
      suppliers,
      inquiries,
      samples,
      purchase_orders: purchaseOrders,
      work_orders: workOrders,
    },
    error: null,
  };
}
