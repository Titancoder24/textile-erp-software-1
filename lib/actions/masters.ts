"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

// ============================================================
// PRODUCTS
// ============================================================

type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export async function getProducts(companyId: string) {
  const supabase = await createClient();
  if (!companyId) return { data: null, error: "Company ID is required" };

  const { data, error } = await supabase
    .from("products")
    .select("*, buyers ( id, name, code )")
    .eq("company_id", companyId)
    .order("name", { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function createProduct(data: ProductInsert) {
  const supabase = await createClient();
  if (!data.company_id) return { data: null, error: "Company ID is required" };
  if (!data.name) return { data: null, error: "Product name is required" };

  const { data: product, error } = await supabase
    .from("products")
    .insert(data)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: product, error: null };
}

export async function updateProduct(id: string, data: ProductUpdate) {
  const supabase = await createClient();
  if (!id) return { data: null, error: "Product ID is required" };

  const { data: product, error } = await supabase
    .from("products")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: product, error: null };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  if (!id) return { data: null, error: "Product ID is required" };

  const { data, error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ============================================================
// FABRICS
// ============================================================

type FabricInsert = Database["public"]["Tables"]["fabrics"]["Insert"];
type FabricUpdate = Database["public"]["Tables"]["fabrics"]["Update"];

export async function getFabrics(companyId: string) {
  const supabase = await createClient();
  if (!companyId) return { data: null, error: "Company ID is required" };

  const { data, error } = await supabase
    .from("fabrics")
    .select("*, suppliers ( id, name, code )")
    .eq("company_id", companyId)
    .order("name", { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function createFabric(data: FabricInsert) {
  const supabase = await createClient();
  if (!data.company_id) return { data: null, error: "Company ID is required" };
  if (!data.name) return { data: null, error: "Fabric name is required" };

  const { data: fabric, error } = await supabase
    .from("fabrics")
    .insert(data)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: fabric, error: null };
}

export async function updateFabric(id: string, data: FabricUpdate) {
  const supabase = await createClient();
  if (!id) return { data: null, error: "Fabric ID is required" };

  const { data: fabric, error } = await supabase
    .from("fabrics")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: fabric, error: null };
}

export async function deleteFabric(id: string) {
  const supabase = await createClient();
  if (!id) return { data: null, error: "Fabric ID is required" };

  const { data, error } = await supabase
    .from("fabrics")
    .update({ is_active: false })
    .eq("id", id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ============================================================
// TRIMS
// ============================================================

type TrimInsert = Database["public"]["Tables"]["trims"]["Insert"];
type TrimUpdate = Database["public"]["Tables"]["trims"]["Update"];

export async function getTrims(companyId: string) {
  const supabase = await createClient();
  if (!companyId) return { data: null, error: "Company ID is required" };

  const { data, error } = await supabase
    .from("trims")
    .select("*, suppliers ( id, name, code )")
    .eq("company_id", companyId)
    .order("name", { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function createTrim(data: TrimInsert) {
  const supabase = await createClient();
  if (!data.company_id) return { data: null, error: "Company ID is required" };
  if (!data.name) return { data: null, error: "Trim name is required" };

  const { data: trim, error } = await supabase
    .from("trims")
    .insert(data)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: trim, error: null };
}

export async function updateTrim(id: string, data: TrimUpdate) {
  const supabase = await createClient();
  if (!id) return { data: null, error: "Trim ID is required" };

  const { data: trim, error } = await supabase
    .from("trims")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: trim, error: null };
}

export async function deleteTrim(id: string) {
  const supabase = await createClient();
  if (!id) return { data: null, error: "Trim ID is required" };

  const { data, error } = await supabase
    .from("trims")
    .update({ is_active: false })
    .eq("id", id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ============================================================
// CHEMICALS
// ============================================================

type ChemicalInsert = Database["public"]["Tables"]["chemicals"]["Insert"];
type ChemicalUpdate = Database["public"]["Tables"]["chemicals"]["Update"];

export async function getChemicals(companyId: string) {
  const supabase = await createClient();
  if (!companyId) return { data: null, error: "Company ID is required" };

  const { data, error } = await supabase
    .from("chemicals")
    .select("*, suppliers ( id, name, code )")
    .eq("company_id", companyId)
    .order("name", { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function createChemical(data: ChemicalInsert) {
  const supabase = await createClient();
  if (!data.company_id) return { data: null, error: "Company ID is required" };
  if (!data.name) return { data: null, error: "Chemical name is required" };

  const { data: chemical, error } = await supabase
    .from("chemicals")
    .insert(data)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: chemical, error: null };
}

export async function updateChemical(id: string, data: ChemicalUpdate) {
  const supabase = await createClient();
  if (!id) return { data: null, error: "Chemical ID is required" };

  const { data: chemical, error } = await supabase
    .from("chemicals")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: chemical, error: null };
}

export async function deleteChemical(id: string) {
  const supabase = await createClient();
  if (!id) return { data: null, error: "Chemical ID is required" };

  const { data, error } = await supabase
    .from("chemicals")
    .update({ is_active: false })
    .eq("id", id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ============================================================
// COLORS
// ============================================================

type ColorInsert = Database["public"]["Tables"]["colors"]["Insert"];
type ColorUpdate = Database["public"]["Tables"]["colors"]["Update"];

export async function getColors(companyId: string) {
  const supabase = await createClient();
  if (!companyId) return { data: null, error: "Company ID is required" };

  const { data, error } = await supabase
    .from("colors")
    .select("*")
    .eq("company_id", companyId)
    .order("name", { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function createColor(data: ColorInsert) {
  const supabase = await createClient();
  if (!data.company_id) return { data: null, error: "Company ID is required" };
  if (!data.name) return { data: null, error: "Color name is required" };

  const { data: color, error } = await supabase
    .from("colors")
    .insert(data)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: color, error: null };
}

export async function updateColor(id: string, data: ColorUpdate) {
  const supabase = await createClient();
  if (!id) return { data: null, error: "Color ID is required" };

  const { data: color, error } = await supabase
    .from("colors")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: color, error: null };
}

export async function deleteColor(id: string) {
  const supabase = await createClient();
  if (!id) return { data: null, error: "Color ID is required" };

  const { error } = await supabase.from("colors").delete().eq("id", id);

  if (error) return { data: null, error: error.message };
  return { data: { id }, error: null };
}

// ============================================================
// SIZES
// ============================================================

type SizeInsert = Database["public"]["Tables"]["sizes"]["Insert"];
type SizeUpdate = Database["public"]["Tables"]["sizes"]["Update"];

export async function getSizes(companyId: string) {
  const supabase = await createClient();
  if (!companyId) return { data: null, error: "Company ID is required" };

  const { data, error } = await supabase
    .from("sizes")
    .select("*")
    .eq("company_id", companyId)
    .order("sort_order", { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function createSize(data: SizeInsert) {
  const supabase = await createClient();
  if (!data.company_id) return { data: null, error: "Company ID is required" };
  if (!data.name) return { data: null, error: "Size name is required" };

  const { data: size, error } = await supabase
    .from("sizes")
    .insert(data)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: size, error: null };
}

export async function updateSize(id: string, data: SizeUpdate) {
  const supabase = await createClient();
  if (!id) return { data: null, error: "Size ID is required" };

  const { data: size, error } = await supabase
    .from("sizes")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: size, error: null };
}

export async function deleteSize(id: string) {
  const supabase = await createClient();
  if (!id) return { data: null, error: "Size ID is required" };

  const { error } = await supabase.from("sizes").delete().eq("id", id);

  if (error) return { data: null, error: error.message };
  return { data: { id }, error: null };
}

// ============================================================
// EMPLOYEES
// ============================================================

type EmployeeInsert = Database["public"]["Tables"]["employees"]["Insert"];
type EmployeeUpdate = Database["public"]["Tables"]["employees"]["Update"];

export async function getEmployees(companyId: string) {
  const supabase = await createClient();
  if (!companyId) return { data: null, error: "Company ID is required" };

  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("company_id", companyId)
    .order("full_name", { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function createEmployee(data: EmployeeInsert) {
  const supabase = await createClient();
  if (!data.company_id) return { data: null, error: "Company ID is required" };
  if (!data.full_name) return { data: null, error: "Employee name is required" };

  const { data: employee, error } = await supabase
    .from("employees")
    .insert(data)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: employee, error: null };
}

export async function updateEmployee(id: string, data: EmployeeUpdate) {
  const supabase = await createClient();
  if (!id) return { data: null, error: "Employee ID is required" };

  const { data: employee, error } = await supabase
    .from("employees")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: employee, error: null };
}

export async function deleteEmployee(id: string) {
  const supabase = await createClient();
  if (!id) return { data: null, error: "Employee ID is required" };

  const { data, error } = await supabase
    .from("employees")
    .update({ is_active: false })
    .eq("id", id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ============================================================
// MACHINES
// ============================================================

type MachineInsert = Database["public"]["Tables"]["machines"]["Insert"];
type MachineUpdate = Database["public"]["Tables"]["machines"]["Update"];

export async function getMachines(companyId: string) {
  const supabase = await createClient();
  if (!companyId) return { data: null, error: "Company ID is required" };

  const { data, error } = await supabase
    .from("machines")
    .select("*, locations ( id, name )")
    .eq("company_id", companyId)
    .order("name", { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function createMachine(data: MachineInsert) {
  const supabase = await createClient();
  if (!data.company_id) return { data: null, error: "Company ID is required" };
  if (!data.name) return { data: null, error: "Machine name is required" };

  const { data: machine, error } = await supabase
    .from("machines")
    .insert(data)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: machine, error: null };
}

export async function updateMachine(id: string, data: MachineUpdate) {
  const supabase = await createClient();
  if (!id) return { data: null, error: "Machine ID is required" };

  const { data: machine, error } = await supabase
    .from("machines")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: machine, error: null };
}

export async function deleteMachine(id: string) {
  const supabase = await createClient();
  if (!id) return { data: null, error: "Machine ID is required" };

  const { data, error } = await supabase
    .from("machines")
    .update({ status: "decommissioned" })
    .eq("id", id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ============================================================
// OPERATIONS
// ============================================================

type OperationInsert = Database["public"]["Tables"]["operations"]["Insert"];
type OperationUpdate = Database["public"]["Tables"]["operations"]["Update"];

export async function getOperations(companyId: string) {
  const supabase = await createClient();
  if (!companyId) return { data: null, error: "Company ID is required" };

  const { data, error } = await supabase
    .from("operations")
    .select("*")
    .eq("company_id", companyId)
    .order("name", { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function createOperation(data: OperationInsert) {
  const supabase = await createClient();
  if (!data.company_id) return { data: null, error: "Company ID is required" };
  if (!data.name) return { data: null, error: "Operation name is required" };

  const { data: operation, error } = await supabase
    .from("operations")
    .insert(data)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: operation, error: null };
}

export async function updateOperation(id: string, data: OperationUpdate) {
  const supabase = await createClient();
  if (!id) return { data: null, error: "Operation ID is required" };

  const { data: operation, error } = await supabase
    .from("operations")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: operation, error: null };
}

export async function deleteOperation(id: string) {
  const supabase = await createClient();
  if (!id) return { data: null, error: "Operation ID is required" };

  const { error } = await supabase.from("operations").delete().eq("id", id);

  if (error) return { data: null, error: error.message };
  return { data: { id }, error: null };
}
