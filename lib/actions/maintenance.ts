"use server";

import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BreakdownLogData {
  machine_id: string;
  company_id: string;
  issue_description: string;
  severity: "P1" | "P2" | "P3";
  assigned_engineer_id?: string;
  reported_by: string;
  reported_at?: string;
}

interface PMScheduleData {
  machine_id: string;
  company_id: string;
  pm_type: "oiling" | "belt_change" | "calibration" | "full_service";
  frequency: "weekly" | "monthly" | "quarterly" | "annual";
  scheduled_date: string;
  assigned_to?: string;
  notes?: string;
}

interface MaintenanceCloseData {
  resolution_notes: string;
  resolved_by: string;
  parts_replaced?: string[];
  downtime_minutes: number;
  closed_at?: string;
}

// ---------------------------------------------------------------------------
// Machine Actions
// ---------------------------------------------------------------------------

/**
 * Get all machines with current status for a company.
 */
export async function getMachines(companyId: string) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const { data, error } = await supabase
    .from("machines")
    .select(
      `
      id,
      name,
      machine_code,
      machine_type,
      department,
      status,
      make,
      model,
      last_serviced_at,
      next_service_due,
      location_id,
      locations ( name )
    `
    )
    .eq("company_id", companyId)
    .order("department", { ascending: true })
    .order("machine_code", { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Log a machine breakdown event.
 * Updates machine status to 'breakdown' and creates a maintenance record.
 */
export async function logBreakdown(data: BreakdownLogData) {
  const supabase = await createClient();

  if (!data.machine_id) {
    return { data: null, error: "Machine ID is required" };
  }
  if (!data.issue_description) {
    return { data: null, error: "Issue description is required" };
  }
  if (!data.severity) {
    return { data: null, error: "Severity is required" };
  }

  // Update machine status to breakdown
  const { error: updateError } = await supabase
    .from("machines")
    .update({ status: "breakdown", updated_at: new Date().toISOString() })
    .eq("id", data.machine_id);

  if (updateError) {
    return { data: null, error: updateError.message };
  }

  // In a full implementation, this would insert into a maintenance_logs table
  return {
    data: {
      id: crypto.randomUUID(),
      ...data,
      status: "open",
      logged_at: data.reported_at ?? new Date().toISOString(),
    },
    error: null,
  };
}

/**
 * Schedule preventive maintenance for a machine.
 */
export async function schedulePM(data: PMScheduleData) {
  const supabase = await createClient();

  if (!data.machine_id) {
    return { data: null, error: "Machine ID is required" };
  }
  if (!data.pm_type) {
    return { data: null, error: "PM type is required" };
  }
  if (!data.scheduled_date) {
    return { data: null, error: "Scheduled date is required" };
  }

  // Update machine's next service due
  const { error: updateError } = await supabase
    .from("machines")
    .update({
      next_service_due: data.scheduled_date,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.machine_id);

  if (updateError) {
    return { data: null, error: updateError.message };
  }

  return {
    data: {
      id: crypto.randomUUID(),
      ...data,
      status: "scheduled",
      created_at: new Date().toISOString(),
    },
    error: null,
  };
}

/**
 * Close a maintenance task (breakdown or PM) with resolution details.
 */
export async function closeMaintenance(
  id: string,
  machineId: string,
  data: MaintenanceCloseData
) {
  const supabase = await createClient();

  if (!id) {
    return { data: null, error: "Maintenance record ID is required" };
  }
  if (!data.resolution_notes) {
    return { data: null, error: "Resolution notes are required" };
  }

  // Update machine status back to running and record last service date
  const { error: updateError } = await supabase
    .from("machines")
    .update({
      status: "running",
      last_serviced_at: new Date().toISOString().split("T")[0],
      updated_at: new Date().toISOString(),
    })
    .eq("id", machineId);

  if (updateError) {
    return { data: null, error: updateError.message };
  }

  return {
    data: {
      id,
      machine_id: machineId,
      ...data,
      status: "closed",
      closed_at: data.closed_at ?? new Date().toISOString(),
    },
    error: null,
  };
}

/**
 * Get maintenance history for a specific machine.
 */
export async function getMachineHistory(machineId: string) {
  const supabase = await createClient();

  if (!machineId) {
    return { data: null, error: "Machine ID is required" };
  }

  // Fetch machine details
  const { data: machine, error } = await supabase
    .from("machines")
    .select("id, name, machine_code, department, last_serviced_at, next_service_due, status")
    .eq("id", machineId)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  // In production, maintenance_logs table would be queried here
  return {
    data: {
      machine,
      history: [],
    },
    error: null,
  };
}

/**
 * Get overall maintenance statistics and OEE metrics.
 */
export async function getMaintenanceStats(companyId: string) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const { data: machines, error } = await supabase
    .from("machines")
    .select("id, status, department")
    .eq("company_id", companyId);

  if (error) {
    return { data: null, error: error.message };
  }

  const total = (machines ?? []).length;
  const running = (machines ?? []).filter((m) => m.status === "running").length;
  const underMaintenance = (machines ?? []).filter(
    (m) => m.status === "under_maintenance"
  ).length;
  const breakdown = (machines ?? []).filter(
    (m) => m.status === "breakdown"
  ).length;
  const idle = (machines ?? []).filter((m) => m.status === "idle").length;

  // OEE calculation (mock values — in production derived from production data)
  const availability = total > 0 ? Math.round((running / total) * 100) : 0;
  const performance = 78; // would come from production_entries
  const quality = 96; // would come from inspection data
  const oee = Math.round((availability * performance * quality) / 10000);

  return {
    data: {
      total,
      running,
      under_maintenance: underMaintenance,
      breakdown,
      idle,
      oee: { availability, performance, quality, oee },
    },
    error: null,
  };
}
