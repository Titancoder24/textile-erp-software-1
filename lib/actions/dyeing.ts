"use server";

import { createClient } from "@/lib/supabase/server";

// ============================================================
// LAB DIPS
// ============================================================

export async function getLabDips(companyId: string) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const { data, error } = await supabase
    .from("lab_dips")
    .select(
      `
      *,
      buyers ( id, name, code ),
      colors ( id, name, code ),
      recipes ( id, recipe_number, name ),
      sales_orders:order_id ( id, order_number )
    `
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function createLabDip(data: {
  company_id: string;
  buyer_id: string;
  order_id?: string;
  color_id?: string;
  color_name: string;
  recipe_id?: string;
  submission_date?: string;
  created_by: string;
}) {
  const supabase = await createClient();

  if (!data.company_id) {
    return { data: null, error: "Company ID is required" };
  }
  if (!data.buyer_id) {
    return { data: null, error: "Buyer ID is required" };
  }
  if (!data.color_name) {
    return { data: null, error: "Color name is required" };
  }

  const { data: labDipNumber, error: numberError } = await supabase.rpc(
    "get_next_number",
    {
      p_company_id: data.company_id,
      p_document_type: "lab_dip",
    }
  );

  if (numberError) {
    return { data: null, error: numberError.message };
  }

  const { data: labDip, error } = await supabase
    .from("lab_dips")
    .insert({
      ...data,
      lab_dip_number: labDipNumber,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: labDip, error: null };
}

// ============================================================
// DYEING BATCHES
// ============================================================

export async function getDyeingBatches(companyId: string) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const { data, error } = await supabase
    .from("dyeing_batches")
    .select(
      `
      *,
      sales_orders:order_id ( id, order_number ),
      colors ( id, name, code ),
      recipes ( id, recipe_number, name )
    `
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getDyeingDashboardStats(companyId: string) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  // Fetch active batches (status in planned, in_progress)
  const { data: batches, error: batchError } = await supabase
    .from("dyeing_batches")
    .select("id, status, process_loss_percent, shade_result")
    .eq("company_id", companyId);

  if (batchError) {
    return { data: null, error: batchError.message };
  }

  // Fetch pending lab dips
  const { data: labDips, error: labDipError } = await supabase
    .from("lab_dips")
    .select("id, status")
    .eq("company_id", companyId);

  if (labDipError) {
    return { data: null, error: labDipError.message };
  }

  const activeBatches = (batches ?? []).filter(
    (b) => b.status === "planned" || b.status === "in_progress"
  );

  const pendingShadeApproval = (batches ?? []).filter(
    (b) => b.shade_result === "pending" || b.shade_result === "submitted"
  );

  const completedBatches = (batches ?? []).filter(
    (b) => b.status === "completed"
  );

  const avgProcessLoss =
    completedBatches.length > 0
      ? Math.round(
          (completedBatches.reduce(
            (sum, b) => sum + (Number(b.process_loss_percent) || 0),
            0
          ) /
            completedBatches.length) *
            10
        ) / 10
      : 0;

  const pendingLabDips = (labDips ?? []).filter(
    (l) => l.status === "pending" || l.status === "submitted"
  );

  // Fetch recent active batches with stages for the table
  const { data: activeBatchDetails, error: detailError } = await supabase
    .from("dyeing_batches")
    .select(
      `
      *,
      sales_orders:order_id ( id, order_number ),
      recipes ( id, recipe_number ),
      batch_stages ( id, stage_name, completed_at )
    `
    )
    .eq("company_id", companyId)
    .in("status", ["planned", "in_progress"])
    .order("created_at", { ascending: false })
    .limit(10);

  if (detailError) {
    return { data: null, error: detailError.message };
  }

  return {
    data: {
      active_batches_count: activeBatches.length,
      pending_shade_approval: pendingShadeApproval.length,
      avg_process_loss: avgProcessLoss,
      pending_lab_dips: pendingLabDips.length,
      active_batch_details: activeBatchDetails ?? [],
    },
    error: null,
  };
}
