-- TextileOS Complete Database Schema
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- CORE TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  phone TEXT,
  email TEXT,
  website TEXT,
  gst_number TEXT,
  pan_number TEXT,
  financial_year_start INTEGER DEFAULT 4,
  default_currency TEXT DEFAULT 'INR',
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'data_entry_operator',
  department TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'factory',
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'India',
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS number_series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  prefix TEXT NOT NULL,
  current_sequence INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, document_type)
);

-- ============================================================
-- MASTER DATA
-- ============================================================

CREATE TABLE IF NOT EXISTS buyers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  payment_terms TEXT,
  quality_standard TEXT DEFAULT 'AQL 2.5',
  default_currency TEXT DEFAULT 'USD',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'India',
  material_types TEXT[] DEFAULT '{}',
  payment_terms TEXT,
  avg_lead_time_days INTEGER DEFAULT 14,
  gst_number TEXT,
  bank_details JSONB,
  rating NUMERIC(3,1),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS colors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  pantone_ref TEXT,
  hex_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS sizes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS uoms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fibers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'natural',
  properties JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS yarns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  count TEXT,
  ply TEXT,
  composition TEXT,
  twist_direction TEXT,
  fiber_id UUID REFERENCES fibers(id),
  supplier_id UUID REFERENCES suppliers(id),
  uom TEXT DEFAULT 'kg',
  rate NUMERIC(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fabrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  fabric_type TEXT NOT NULL DEFAULT 'knitted',
  construction TEXT,
  gsm NUMERIC(8,2),
  width_cm NUMERIC(8,2),
  weave_type TEXT,
  composition TEXT,
  uom TEXT DEFAULT 'meter',
  rate NUMERIC(12,2) DEFAULT 0,
  supplier_id UUID REFERENCES suppliers(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS trims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  trim_type TEXT NOT NULL,
  description TEXT,
  uom TEXT DEFAULT 'piece',
  rate NUMERIC(12,2) DEFAULT 0,
  supplier_id UUID REFERENCES suppliers(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS chemicals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  chemical_type TEXT NOT NULL,
  uom TEXT DEFAULT 'kg',
  rate NUMERIC(12,2) DEFAULT 0,
  supplier_id UUID REFERENCES suppliers(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  style_code TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'T-shirt',
  description TEXT,
  buyer_id UUID REFERENCES buyers(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, style_code)
);

CREATE TABLE IF NOT EXISTS machines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  machine_code TEXT NOT NULL,
  machine_type TEXT NOT NULL,
  department TEXT NOT NULL,
  location_id UUID REFERENCES locations(id),
  make TEXT,
  model TEXT,
  serial_number TEXT,
  capacity_per_hour NUMERIC(8,2),
  status TEXT DEFAULT 'running',
  purchase_date DATE,
  last_serviced_at DATE,
  next_service_due DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, machine_code)
);

CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_code TEXT NOT NULL,
  full_name TEXT NOT NULL,
  department TEXT NOT NULL,
  designation TEXT,
  phone TEXT,
  email TEXT,
  date_of_joining DATE,
  skill_grade TEXT DEFAULT 'B',
  skills TEXT[] DEFAULT '{}',
  current_shift TEXT DEFAULT 'morning',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, employee_code)
);

CREATE TABLE IF NOT EXISTS operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'sewing',
  smv NUMERIC(6,3) DEFAULT 0,
  machine_type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, code)
);

-- ============================================================
-- ORDER LIFECYCLE
-- ============================================================

CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  inquiry_number TEXT NOT NULL,
  buyer_id UUID NOT NULL REFERENCES buyers(id),
  product_id UUID REFERENCES products(id),
  product_name TEXT,
  expected_quantity INTEGER NOT NULL DEFAULT 0,
  target_price NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  expected_delivery_date DATE,
  notes TEXT,
  status TEXT DEFAULT 'new',
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, inquiry_number)
);

CREATE TABLE IF NOT EXISTS sales_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  buyer_id UUID NOT NULL REFERENCES buyers(id),
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  delivery_date DATE NOT NULL,
  payment_terms TEXT,
  fob_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  total_quantity INTEGER NOT NULL DEFAULT 0,
  total_value NUMERIC(14,2) NOT NULL DEFAULT 0,
  color_size_matrix JSONB DEFAULT '[]',
  status TEXT DEFAULT 'confirmed',
  special_instructions TEXT,
  bom_id UUID,
  inquiry_id UUID REFERENCES inquiries(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, order_number)
);

CREATE TABLE IF NOT EXISTS order_amendments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  reason TEXT,
  changed_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tna_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tna_template_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES tna_templates(id) ON DELETE CASCADE,
  milestone_name TEXT NOT NULL,
  days_from_confirmation INTEGER NOT NULL DEFAULT 0,
  responsible_department TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tna_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  template_id UUID REFERENCES tna_templates(id),
  milestone_name TEXT NOT NULL,
  planned_date DATE NOT NULL,
  actual_date DATE,
  responsible_department TEXT,
  status TEXT DEFAULT 'pending',
  delay_days INTEGER DEFAULT 0,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS samples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  sample_number TEXT NOT NULL,
  buyer_id UUID NOT NULL REFERENCES buyers(id),
  product_id UUID REFERENCES products(id),
  order_id UUID REFERENCES sales_orders(id),
  sample_type TEXT NOT NULL DEFAULT 'fit_sample',
  colors TEXT[] DEFAULT '{}',
  quantity INTEGER DEFAULT 1,
  required_date DATE,
  submitted_date DATE,
  approved_date DATE,
  special_instructions TEXT,
  status TEXT DEFAULT 'requested',
  rejection_comments TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, sample_number)
);

CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  recipe_number TEXT NOT NULL,
  name TEXT NOT NULL,
  shade_name TEXT NOT NULL,
  pantone_ref TEXT,
  buyer_id UUID REFERENCES buyers(id),
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft',
  temperature NUMERIC(6,2),
  time_minutes INTEGER,
  ph_level NUMERIC(4,2),
  liquor_ratio TEXT,
  cost_per_kg NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, recipe_number)
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  chemical_id UUID NOT NULL REFERENCES chemicals(id),
  quantity_grams_per_kg NUMERIC(10,4) NOT NULL,
  percentage NUMERIC(6,3),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_dips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  lab_dip_number TEXT NOT NULL,
  order_id UUID REFERENCES sales_orders(id),
  buyer_id UUID NOT NULL REFERENCES buyers(id),
  color_id UUID REFERENCES colors(id),
  color_name TEXT NOT NULL,
  recipe_id UUID REFERENCES recipes(id),
  status TEXT DEFAULT 'pending',
  submission_date DATE,
  approval_date DATE,
  rejection_comments TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, lab_dip_number)
);

CREATE TABLE IF NOT EXISTS cost_sheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  cs_number TEXT NOT NULL,
  product_id UUID REFERENCES products(id),
  order_id UUID REFERENCES sales_orders(id),
  version INTEGER DEFAULT 1,
  version_name TEXT,
  status TEXT DEFAULT 'draft',
  material_cost NUMERIC(12,2) DEFAULT 0,
  cutting_cost NUMERIC(12,2) DEFAULT 0,
  sewing_cost NUMERIC(12,2) DEFAULT 0,
  finishing_cost NUMERIC(12,2) DEFAULT 0,
  dyeing_cost NUMERIC(12,2) DEFAULT 0,
  overhead_cost NUMERIC(12,2) DEFAULT 0,
  admin_overhead NUMERIC(12,2) DEFAULT 0,
  testing_charges NUMERIC(12,2) DEFAULT 0,
  packing_cost NUMERIC(12,2) DEFAULT 0,
  transport_cost NUMERIC(12,2) DEFAULT 0,
  rejection_percent NUMERIC(5,2) DEFAULT 3,
  commission_percent NUMERIC(5,2) DEFAULT 5,
  profit_percent NUMERIC(5,2) DEFAULT 10,
  base_cost NUMERIC(12,2) DEFAULT 0,
  total_cost NUMERIC(12,2) DEFAULT 0,
  fob_price NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  exchange_rate NUMERIC(10,4) DEFAULT 83.5,
  fob_price_usd NUMERIC(12,2) DEFAULT 0,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, cs_number)
);

-- ============================================================
-- SUPPLY CHAIN
-- ============================================================

CREATE TABLE IF NOT EXISTS boms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id),
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft',
  total_cost NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bom_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bom_id UUID NOT NULL REFERENCES boms(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL DEFAULT 'fabric',
  item_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  quantity_per_piece NUMERIC(12,4) NOT NULL DEFAULT 1,
  uom TEXT NOT NULL DEFAULT 'meter',
  rate NUMERIC(12,2) NOT NULL DEFAULT 0,
  wastage_percent NUMERIC(5,2) DEFAULT 3,
  size_wise_consumption JSONB,
  notes TEXT,
  amount NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS material_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  request_number TEXT NOT NULL,
  order_id UUID REFERENCES sales_orders(id),
  requested_by UUID NOT NULL REFERENCES profiles(id),
  department TEXT,
  priority TEXT DEFAULT 'medium',
  required_date DATE,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, request_number)
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  po_number TEXT NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  order_id UUID REFERENCES sales_orders(id),
  indent_id UUID REFERENCES material_requests(id),
  expected_delivery_date DATE NOT NULL,
  payment_terms TEXT,
  subtotal NUMERIC(14,2) DEFAULT 0,
  tax_percent NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(14,2) DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'draft',
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, po_number)
);

CREATE TABLE IF NOT EXISTS po_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  quantity NUMERIC(12,3) NOT NULL,
  received_quantity NUMERIC(12,3) DEFAULT 0,
  uom TEXT NOT NULL,
  rate NUMERIC(12,2) NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  grn_number TEXT NOT NULL,
  po_id UUID NOT NULL REFERENCES purchase_orders(id),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vehicle_number TEXT,
  challan_number TEXT,
  status TEXT DEFAULT 'pending_qc',
  received_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, grn_number)
);

CREATE TABLE IF NOT EXISTS grn_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grn_id UUID NOT NULL REFERENCES grns(id) ON DELETE CASCADE,
  po_item_id UUID REFERENCES po_items(id),
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  expected_quantity NUMERIC(12,3) NOT NULL,
  received_quantity NUMERIC(12,3) NOT NULL,
  accepted_quantity NUMERIC(12,3) DEFAULT 0,
  rejected_quantity NUMERIC(12,3) DEFAULT 0,
  uom TEXT NOT NULL,
  batch_number TEXT,
  stock_status TEXT DEFAULT 'quarantine',
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  warehouse_id UUID REFERENCES locations(id),
  batch_number TEXT,
  dye_lot TEXT,
  quantity NUMERIC(14,3) DEFAULT 0,
  reserved_quantity NUMERIC(14,3) DEFAULT 0,
  uom TEXT NOT NULL,
  rate NUMERIC(12,2) DEFAULT 0,
  status TEXT DEFAULT 'available',
  reorder_level NUMERIC(12,3),
  grn_id UUID REFERENCES grns(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  inventory_id UUID NOT NULL REFERENCES inventory(id),
  transaction_type TEXT NOT NULL,
  quantity NUMERIC(14,3) NOT NULL,
  uom TEXT NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fabric_rolls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  roll_number TEXT NOT NULL,
  fabric_id UUID NOT NULL REFERENCES fabrics(id),
  grn_id UUID REFERENCES grns(id),
  supplier_id UUID REFERENCES suppliers(id),
  width_cm NUMERIC(8,2),
  length_meters NUMERIC(10,2) NOT NULL,
  weight_kg NUMERIC(10,3),
  dye_lot TEXT,
  batch_number TEXT,
  grade TEXT DEFAULT 'A',
  defect_points INTEGER DEFAULT 0,
  warehouse_id UUID REFERENCES locations(id),
  status TEXT DEFAULT 'in_stock',
  order_id UUID REFERENCES sales_orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, roll_number)
);

-- ============================================================
-- PRODUCTION
-- ============================================================

CREATE TABLE IF NOT EXISTS production_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'sewing',
  total_operators INTEGER DEFAULT 30,
  current_order_id UUID REFERENCES sales_orders(id),
  current_work_order_id UUID,
  target_per_hour INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  wo_number TEXT NOT NULL,
  order_id UUID NOT NULL REFERENCES sales_orders(id),
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  bom_id UUID REFERENCES boms(id),
  total_quantity INTEGER NOT NULL DEFAULT 0,
  good_output INTEGER DEFAULT 0,
  defective_output INTEGER DEFAULT 0,
  status TEXT DEFAULT 'planned',
  planned_start_date DATE,
  planned_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  production_line TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, wo_number)
);

CREATE TABLE IF NOT EXISTS production_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES work_orders(id),
  order_id UUID NOT NULL REFERENCES sales_orders(id),
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  shift TEXT NOT NULL DEFAULT 'morning',
  production_line TEXT NOT NULL,
  hour_slot TEXT,
  operation_id UUID REFERENCES operations(id),
  target_quantity INTEGER DEFAULT 0,
  produced_quantity INTEGER NOT NULL DEFAULT 0,
  defective_quantity INTEGER DEFAULT 0,
  rework_quantity INTEGER DEFAULT 0,
  operators_present INTEGER DEFAULT 30,
  working_minutes INTEGER DEFAULT 480,
  efficiency_percent NUMERIC(5,2) DEFAULT 0,
  notes TEXT,
  entered_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cutting_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES work_orders(id),
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  marker_length NUMERIC(10,2),
  marker_efficiency NUMERIC(5,2),
  layers INTEGER,
  fabric_rolls_used TEXT,
  fabric_consumed NUMERIC(12,3) NOT NULL,
  planned_consumption NUMERIC(12,3),
  wastage_percent NUMERIC(5,2) DEFAULT 0,
  size_breakdown JSONB DEFAULT '{}',
  total_cut_qty INTEGER NOT NULL DEFAULT 0,
  bundles_created INTEGER DEFAULT 0,
  entered_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finishing_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES work_orders(id),
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  received_from_sewing INTEGER DEFAULT 0,
  processed_quantity INTEGER DEFAULT 0,
  rejected_quantity INTEGER DEFAULT 0,
  passed_to_packing INTEGER DEFAULT 0,
  notes TEXT,
  entered_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS packing_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES work_orders(id),
  carton_number TEXT NOT NULL,
  size_breakdown JSONB DEFAULT '{}',
  total_pieces INTEGER NOT NULL DEFAULT 0,
  net_weight NUMERIC(8,3),
  gross_weight NUMERIC(8,3),
  dimensions TEXT,
  cbm NUMERIC(8,4),
  entered_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- QUALITY
-- ============================================================

CREATE TABLE IF NOT EXISTS inspection_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  inspection_type TEXT NOT NULL,
  buyer_id UUID REFERENCES buyers(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inspection_template_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES inspection_templates(id) ON DELETE CASCADE,
  checkpoint_name TEXT NOT NULL,
  checkpoint_type TEXT NOT NULL DEFAULT 'visual',
  tolerance TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  inspection_number TEXT NOT NULL,
  inspection_type TEXT NOT NULL,
  order_id UUID REFERENCES sales_orders(id),
  work_order_id UUID REFERENCES work_orders(id),
  production_line TEXT,
  template_id UUID REFERENCES inspection_templates(id),
  inspector_id UUID REFERENCES profiles(id),
  inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  lot_size INTEGER NOT NULL DEFAULT 0,
  sample_size INTEGER NOT NULL DEFAULT 0,
  pieces_checked INTEGER DEFAULT 0,
  total_defects INTEGER DEFAULT 0,
  critical_defects INTEGER DEFAULT 0,
  major_defects INTEGER DEFAULT 0,
  minor_defects INTEGER DEFAULT 0,
  aql_level TEXT DEFAULT 'AQL 2.5',
  result TEXT DEFAULT 'pending',
  notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, inspection_number)
);

CREATE TABLE IF NOT EXISTS inspection_defects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  defect_type TEXT NOT NULL,
  defect_location TEXT,
  severity TEXT NOT NULL DEFAULT 'major',
  quantity INTEGER DEFAULT 1,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fabric_inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  roll_id UUID NOT NULL REFERENCES fabric_rolls(id),
  inspector_id UUID REFERENCES profiles(id),
  inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_defect_points INTEGER DEFAULT 0,
  points_per_100sqyd NUMERIC(8,2),
  tolerance_limit NUMERIC(8,2) DEFAULT 28,
  result TEXT DEFAULT 'pending',
  notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fabric_inspection_defects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fabric_inspection_id UUID NOT NULL REFERENCES fabric_inspections(id) ON DELETE CASCADE,
  defect_type TEXT NOT NULL,
  length_inches NUMERIC(8,2) NOT NULL,
  points INTEGER NOT NULL,
  position_meters NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS capas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  capa_number TEXT NOT NULL,
  inspection_id UUID REFERENCES inspections(id),
  defect_description TEXT NOT NULL,
  root_cause TEXT,
  corrective_action TEXT,
  preventive_action TEXT,
  assigned_to UUID REFERENCES profiles(id),
  due_date DATE,
  status TEXT DEFAULT 'open',
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, capa_number)
);

-- ============================================================
-- DYEING
-- ============================================================

CREATE TABLE IF NOT EXISTS dyeing_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL,
  order_id UUID REFERENCES sales_orders(id),
  color_id UUID REFERENCES colors(id),
  color_name TEXT NOT NULL,
  recipe_id UUID REFERENCES recipes(id),
  input_quantity_kg NUMERIC(10,3) NOT NULL,
  output_quantity_kg NUMERIC(10,3),
  process_loss_percent NUMERIC(5,2),
  shade_result TEXT,
  status TEXT DEFAULT 'planned',
  start_date DATE,
  end_date DATE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, batch_number)
);

CREATE TABLE IF NOT EXISTS batch_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES dyeing_batches(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  input_weight NUMERIC(10,3),
  output_weight NUMERIC(10,3),
  process_loss_percent NUMERIC(5,2),
  water_consumed_liters NUMERIC(10,2),
  temperature NUMERIC(6,2),
  time_minutes INTEGER,
  ph_level NUMERIC(4,2),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SHIPMENT
-- ============================================================

CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  shipment_number TEXT NOT NULL,
  order_ids UUID[] DEFAULT '{}',
  buyer_id UUID NOT NULL REFERENCES buyers(id),
  planned_shipment_date DATE NOT NULL,
  actual_shipment_date DATE,
  port_of_loading TEXT,
  port_of_discharge TEXT,
  container_number TEXT,
  container_type TEXT DEFAULT '40ft',
  seal_number TEXT,
  vessel_name TEXT,
  voyage_number TEXT,
  etd DATE,
  eta DATE,
  total_cartons INTEGER DEFAULT 0,
  total_pieces INTEGER DEFAULT 0,
  status TEXT DEFAULT 'packing',
  production_complete BOOLEAN DEFAULT FALSE,
  qc_passed BOOLEAN DEFAULT FALSE,
  packing_done BOOLEAN DEFAULT FALSE,
  documents_ready BOOLEAN DEFAULT FALSE,
  transport_arranged BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, shipment_number)
);

-- ============================================================
-- COMMUNICATION & SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  entity_type TEXT,
  entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id),
  mentioned_users UUID[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION get_next_number(
  p_company_id UUID,
  p_document_type TEXT
) RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
  v_sequence INTEGER;
  v_year TEXT;
BEGIN
  UPDATE number_series
  SET current_sequence = current_sequence + 1, updated_at = NOW()
  WHERE company_id = p_company_id AND document_type = p_document_type
  RETURNING prefix, current_sequence INTO v_prefix, v_sequence;

  IF NOT FOUND THEN
    INSERT INTO number_series (company_id, document_type, prefix, current_sequence)
    VALUES (p_company_id, p_document_type, UPPER(LEFT(p_document_type, 3)), 1)
    RETURNING prefix, current_sequence INTO v_prefix, v_sequence;
  END IF;

  v_year := TO_CHAR(NOW(), 'YYYY');

  RETURN v_prefix || '-' || v_year || '-' || LPAD(v_sequence::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'companies', 'profiles', 'buyers', 'suppliers', 'fabrics', 'trims',
    'chemicals', 'products', 'machines', 'employees', 'inquiries',
    'sales_orders', 'tna_milestones', 'samples', 'recipes', 'lab_dips',
    'cost_sheets', 'boms', 'purchase_orders', 'grns', 'inventory',
    'work_orders', 'production_lines', 'inspections', 'capas',
    'dyeing_batches', 'shipments', 'fabric_rolls', 'yarns', 'number_series'
  ]
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
       CREATE TRIGGER update_%I_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION update_updated_at();',
      t, t, t, t
    );
  END LOOP;
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fabrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE trims ENABLE ROW LEVEL SECURITY;
ALTER TABLE chemicals ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_amendments ENABLE ROW LEVEL SECURITY;
ALTER TABLE samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_dips ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE boms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bom_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE po_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE grns ENABLE ROW LEVEL SECURITY;
ALTER TABLE grn_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fabric_rolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cutting_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE finishing_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE packing_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE fabric_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE capas ENABLE ROW LEVEL SECURITY;
ALTER TABLE dyeing_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tna_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE number_series ENABLE ROW LEVEL SECURITY;

-- Helper function for RLS
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Company-scoped policies (same pattern for all tables)
CREATE POLICY "Authenticated users can create companies" ON companies
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can view their company data" ON companies
  FOR SELECT USING (id = get_user_company_id());

CREATE POLICY "Admins can update company" ON companies
  FOR UPDATE USING (
    id = get_user_company_id() AND
    get_user_role() IN ('super_admin', 'factory_owner')
  );

-- Profiles policies
CREATE POLICY "Authenticated users can insert their own profile" ON profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY "Users can view company profiles" ON profiles
  FOR SELECT USING (company_id = get_user_company_id() OR id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can manage profiles" ON profiles
  FOR ALL USING (
    company_id = get_user_company_id() AND
    get_user_role() IN ('super_admin', 'factory_owner')
  );

-- Generic company-scoped read/write policies for all other tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'locations', 'buyers', 'suppliers', 'colors', 'sizes', 'fabrics',
    'trims', 'chemicals', 'products', 'machines', 'employees', 'operations',
    'inquiries', 'samples', 'recipes', 'lab_dips', 'cost_sheets',
    'boms', 'purchase_orders', 'grns', 'inventory', 'stock_transactions',
    'fabric_rolls', 'production_lines', 'work_orders', 'production_entries',
    'cutting_entries', 'finishing_entries', 'packing_entries', 'inspections',
    'capas', 'dyeing_batches', 'batch_stages', 'shipments', 'tna_milestones',
    'notifications', 'comments', 'files', 'number_series',
    'recipe_ingredients', 'bom_items', 'po_items', 'grn_items',
    'inspection_defects', 'fabric_inspections', 'uoms', 'fibers', 'yarns',
    'material_requests', 'inspection_templates', 'inspection_template_items',
    'tna_templates', 'tna_template_items', 'order_amendments',
    'fabric_inspection_defects', 'packing_entries', 'finishing_entries'
  ]
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS "company_read_%I" ON %I;
       CREATE POLICY "company_read_%I" ON %I
       FOR SELECT USING (company_id = get_user_company_id());
       DROP POLICY IF EXISTS "company_write_%I" ON %I;
       CREATE POLICY "company_write_%I" ON %I
       FOR ALL USING (company_id = get_user_company_id());',
      t, t, t, t, t, t, t, t
    );
  END LOOP;
END;
$$;

-- Audit logs: read only for admins
CREATE POLICY "Admin can view audit logs" ON audit_logs
  FOR SELECT USING (
    company_id = get_user_company_id() AND
    get_user_role() IN ('super_admin', 'factory_owner', 'general_manager')
  );

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Notifications: user can only see their own
DROP POLICY IF EXISTS "company_read_notifications" ON notifications;
DROP POLICY IF EXISTS "company_write_notifications" ON notifications;

CREATE POLICY "Users see own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================================
-- DEMO DATA SEED
-- ============================================================

-- This will be run separately via the app's setup flow
-- See: app/api/setup/seed-demo/route.ts
