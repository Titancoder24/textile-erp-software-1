"use server";

import { createClient } from "@/lib/supabase/server";

export interface PLSummary {
  revenueThisMonth: number;
  cogsThisMonth: number;
  grossProfit: number;
  grossMarginPct: number;
  outstandingReceivables: number;
  revenueChange: number;
  cogsChange: number;
}

export interface MonthlyPLData {
  month: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  margin: number;
}

export interface BuyerRevenue {
  buyer: string;
  revenue: number;
  percentage: number;
  orders: number;
}

export interface OutstandingPayment {
  id: string;
  buyer: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  status: "current" | "overdue_30" | "overdue_60" | "overdue_90plus";
}

export interface ProfitableOrder {
  orderNumber: string;
  buyer: string;
  style: string;
  fobValue: number;
  cogs: number;
  profit: number;
  marginPct: number;
}

export interface StyleProfitability {
  styleCode: string;
  styleName: string;
  buyer: string;
  orderQty: number;
  fobPriceUsd: number;
  fobPriceInr: number;
  actualCogs: number;
  profitPerPiece: number;
  marginPct: number;
  budgetedMarginPct: number;
  variancePct: number;
  status: "profitable" | "breakeven" | "loss";
  varianceReason: string;
}

export async function getFinanceDashboard(companyId: string) {
  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("sales_orders")
    .select("id, total_value, currency, status, created_at, fob_price")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: orders, error: null };
}

export async function getStyleProfitability(companyId: string) {
  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const supabase = await createClient();

  const { data: costSheets, error } = await supabase
    .from("cost_sheets")
    .select(
      `
      *,
      products ( id, name, style_code ),
      sales_orders ( id, order_number, total_quantity )
    `
    )
    .eq("company_id", companyId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: costSheets, error: null };
}

export async function getBuyerWiseRevenue(companyId: string) {
  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sales_orders")
    .select(
      `
      total_value,
      currency,
      buyers ( id, name )
    `
    )
    .eq("company_id", companyId)
    .not("status", "in", '("cancelled","draft")');

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getOutstandingPayments(companyId: string) {
  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("sales_orders")
    .select(
      `
      id,
      order_number,
      total_value,
      delivery_date,
      status,
      buyers ( id, name )
    `
    )
    .eq("company_id", companyId)
    .in("status", ["shipped", "delivered"])
    .order("delivery_date");

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: orders, error: null };
}

export async function getMonthlyPL(companyId: string, year: number = 2025) {
  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const supabase = await createClient();

  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const { data: orders, error } = await supabase
    .from("sales_orders")
    .select("total_value, created_at, status")
    .eq("company_id", companyId)
    .gte("created_at", startDate)
    .lte("created_at", endDate)
    .not("status", "in", '("cancelled","draft")');

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: orders, error: null };
}
