"use server";

import { createClient } from "@/lib/supabase/server";

export async function getCompanyUsers(companyId: string) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("company_id", companyId)
    .order("full_name", { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function updateUserRole(
  userId: string,
  role: string
) {
  const supabase = await createClient();

  if (!userId) return { data: null, error: "User ID is required" };
  if (!role) return { data: null, error: "Role is required" };

  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  const supabase = await createClient();

  if (!userId) return { data: null, error: "User ID is required" };

  const { data, error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", userId)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}
