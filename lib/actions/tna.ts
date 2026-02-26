"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type TNAMilestoneInsert =
  Database["public"]["Tables"]["tna_milestones"]["Insert"];

interface TemplateItem {
  milestone_name: string;
  days_before_confirmation: number;
  responsible_department: string | null;
  sort_order: number;
}

export async function getTNAMilestones(orderId: string) {
  const supabase = await createClient();

  if (!orderId) {
    return { data: null, error: "Order ID is required" };
  }

  const { data, error } = await supabase
    .from("tna_milestones")
    .select("*")
    .eq("order_id", orderId)
    .order("sort_order", { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getTNATemplates(companyId: string) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const { data, error } = await supabase
    .from("tna_templates")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("name");

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function createTNAFromTemplate(
  orderId: string,
  templateId: string,
  confirmationDate: string
) {
  const supabase = await createClient();

  if (!orderId) {
    return { data: null, error: "Order ID is required" };
  }
  if (!templateId) {
    return { data: null, error: "Template ID is required" };
  }
  if (!confirmationDate) {
    return { data: null, error: "Confirmation date is required" };
  }

  // Check if milestones already exist for this order
  const { count: existingCount } = await supabase
    .from("tna_milestones")
    .select("*", { count: "exact", head: true })
    .eq("order_id", orderId)
    .eq("template_id", templateId);

  if ((existingCount ?? 0) > 0) {
    return {
      data: null,
      error: "TNA milestones already created for this order with this template",
    };
  }

  // Fetch template details (we expect it to have milestone items stored in a related table or JSON)
  // For now, we use a simplified structure: the template name and create generic milestones
  const { data: template, error: templateError } = await supabase
    .from("tna_templates")
    .select("*")
    .eq("id", templateId)
    .single();

  if (templateError) {
    return { data: null, error: templateError.message };
  }

  // Standard TNA milestones for garment manufacturing
  // days_before_confirmation means how many days before/after the order confirmation date
  const defaultTemplateItems: TemplateItem[] = [
    { milestone_name: "Order Confirmation", days_before_confirmation: 0, responsible_department: "Merchandising", sort_order: 1 },
    { milestone_name: "BOM Finalization", days_before_confirmation: 7, responsible_department: "Merchandising", sort_order: 2 },
    { milestone_name: "Fabric Order Placement", days_before_confirmation: 14, responsible_department: "Purchase", sort_order: 3 },
    { milestone_name: "Trim Order Placement", days_before_confirmation: 14, responsible_department: "Purchase", sort_order: 4 },
    { milestone_name: "PP Sample Submission", days_before_confirmation: 21, responsible_department: "Production", sort_order: 5 },
    { milestone_name: "PP Sample Approval", days_before_confirmation: 28, responsible_department: "Merchandising", sort_order: 6 },
    { milestone_name: "Fabric Received", days_before_confirmation: 30, responsible_department: "Store", sort_order: 7 },
    { milestone_name: "Cutting Start", days_before_confirmation: 35, responsible_department: "Production", sort_order: 8 },
    { milestone_name: "Sewing Start", days_before_confirmation: 40, responsible_department: "Production", sort_order: 9 },
    { milestone_name: "Inline Inspection", days_before_confirmation: 50, responsible_department: "Quality", sort_order: 10 },
    { milestone_name: "Final Inspection", days_before_confirmation: 60, responsible_department: "Quality", sort_order: 11 },
    { milestone_name: "Packing Complete", days_before_confirmation: 65, responsible_department: "Production", sort_order: 12 },
    { milestone_name: "Shipment", days_before_confirmation: 70, responsible_department: "Logistics", sort_order: 13 },
  ];

  const confirmDate = new Date(confirmationDate);

  const milestones: TNAMilestoneInsert[] = defaultTemplateItems.map((item) => {
    const plannedDate = new Date(confirmDate);
    plannedDate.setDate(plannedDate.getDate() + item.days_before_confirmation);

    return {
      order_id: orderId,
      template_id: templateId,
      milestone_name: item.milestone_name,
      planned_date: plannedDate.toISOString().split("T")[0],
      responsible_department: item.responsible_department,
      status: "pending",
      delay_days: 0,
      sort_order: item.sort_order,
    };
  });

  const { data: createdMilestones, error: insertError } = await supabase
    .from("tna_milestones")
    .insert(milestones)
    .select();

  if (insertError) {
    return { data: null, error: insertError.message };
  }

  return {
    data: {
      template,
      milestones: createdMilestones,
    },
    error: null,
  };
}

export async function updateMilestone(id: string, actualDate: string) {
  const supabase = await createClient();

  if (!id) {
    return { data: null, error: "Milestone ID is required" };
  }
  if (!actualDate) {
    return { data: null, error: "Actual date is required" };
  }

  const { data: milestone, error: fetchError } = await supabase
    .from("tna_milestones")
    .select("planned_date")
    .eq("id", id)
    .single();

  if (fetchError) {
    return { data: null, error: fetchError.message };
  }

  const planned = new Date(milestone.planned_date);
  const actual = new Date(actualDate);
  const delayDays = Math.round(
    (actual.getTime() - planned.getTime()) / (1000 * 60 * 60 * 24)
  );

  const status = delayDays <= 0 ? "completed" : "delayed";

  const { data, error } = await supabase
    .from("tna_milestones")
    .update({
      actual_date: actualDate,
      delay_days: Math.max(0, delayDays),
      status,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getOverdueMilestones(companyId: string) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const today = new Date().toISOString().split("T")[0];

  const { data: milestones, error } = await supabase
    .from("tna_milestones")
    .select(
      `
      *,
      sales_orders!inner (
        id,
        order_number,
        product_name,
        company_id,
        delivery_date,
        buyers ( id, name )
      )
    `
    )
    .eq("sales_orders.company_id", companyId)
    .lt("planned_date", today)
    .is("actual_date", null)
    .in("status", ["pending", "in_progress"])
    .order("planned_date", { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: milestones, error: null };
}
