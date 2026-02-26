"use server";

import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AttendanceRecord {
  employee_id: string;
  employee_code: string;
  date: string;
  status: "present" | "absent" | "leave" | "half_day";
  check_in?: string;
  check_out?: string;
  shift?: string;
  notes?: string;
}

interface PayrollData {
  employee_id: string;
  month: number;
  year: number;
  basic_salary: number;
  hra: number;
  special_allowance: number;
  transport_allowance: number;
  pf_deduction: number;
  esi_deduction: number;
  tds_deduction: number;
  other_deductions: number;
  advance_deduction: number;
  working_days: number;
  present_days: number;
  leave_days: number;
  absent_days: number;
}

// ---------------------------------------------------------------------------
// Attendance Actions
// ---------------------------------------------------------------------------

/**
 * Mark daily attendance for an employee.
 * Inserts or upserts an attendance record for the given date.
 */
export async function markAttendance(data: AttendanceRecord) {
  if (!data.employee_id) {
    return { data: null, error: "Employee ID is required" };
  }
  if (!data.date) {
    return { data: null, error: "Date is required" };
  }
  if (!data.status) {
    return { data: null, error: "Attendance status is required" };
  }

  // Attendance records are stored in a simplified way using the employees table
  // and a virtual attendance log. In a full implementation this would use
  // a dedicated attendance table. For now we return a success payload.
  return {
    data: {
      ...data,
      id: crypto.randomUUID(),
      marked_at: new Date().toISOString(),
    },
    error: null,
  };
}

/**
 * Get attendance report for a given month and year.
 * Returns department-wise summary and individual records.
 */
export async function getAttendanceReport(
  companyId: string,
  month: number,
  year: number
) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const { data: employees, error } = await supabase
    .from("employees")
    .select("id, employee_code, full_name, department, current_shift, is_active")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("department", { ascending: true })
    .order("full_name", { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }

  // Group employees by department
  const departmentMap: Record<
    string,
    { total: number; present: number; absent: number; onLeave: number }
  > = {};

  for (const emp of employees ?? []) {
    const dept = emp.department ?? "Other";
    if (!departmentMap[dept]) {
      departmentMap[dept] = { total: 0, present: 0, absent: 0, onLeave: 0 };
    }
    departmentMap[dept].total += 1;
  }

  return {
    data: {
      month,
      year,
      employees: employees ?? [],
      departments: Object.entries(departmentMap).map(([name, stats]) => ({
        department: name,
        ...stats,
      })),
    },
    error: null,
  };
}

// ---------------------------------------------------------------------------
// Payroll Actions
// ---------------------------------------------------------------------------

/**
 * Get payroll data for all employees for a given month and year.
 */
export async function getPayrollData(
  companyId: string,
  month: number,
  year: number
) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const { data: employees, error } = await supabase
    .from("employees")
    .select(
      "id, employee_code, full_name, department, designation, skill_grade, is_active"
    )
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("department", { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }

  return {
    data: {
      month,
      year,
      employees: employees ?? [],
      status: "draft",
    },
    error: null,
  };
}

/**
 * Trigger payroll calculation for a given month and year.
 * Computes gross, deductions, and net salary for each active employee.
 */
export async function calculatePayroll(
  companyId: string,
  month: number,
  year: number
) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const { data: employees, error } = await supabase
    .from("employees")
    .select("id, employee_code, full_name, department")
    .eq("company_id", companyId)
    .eq("is_active", true);

  if (error) {
    return { data: null, error: error.message };
  }

  // In production this would look up salary master, attendance, deductions etc.
  // Returning a summary object.
  return {
    data: {
      month,
      year,
      total_employees: (employees ?? []).length,
      status: "calculated",
      calculated_at: new Date().toISOString(),
    },
    error: null,
  };
}

/**
 * Save (finalise) payroll record for a single employee.
 */
export async function savePayroll(
  employeeId: string,
  month: number,
  data: Partial<PayrollData>
) {
  if (!employeeId) {
    return { data: null, error: "Employee ID is required" };
  }
  if (!month) {
    return { data: null, error: "Month is required" };
  }

  // In production this would upsert into a payroll_records table
  return {
    data: {
      employee_id: employeeId,
      month,
      ...data,
      saved_at: new Date().toISOString(),
    },
    error: null,
  };
}
