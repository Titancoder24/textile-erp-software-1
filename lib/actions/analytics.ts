"use server";

import { createClient } from "@/lib/supabase/server";

// ============================================================
// FEATURE 1: Order Profitability Heatmap
// ============================================================

export interface OrderProfitability {
  id: string;
  orderNumber: string;
  buyer: string;
  product: string;
  status: string;
  totalQty: number;
  fobValue: number;
  currency: string;
  materialCost: number;
  productionCost: number;
  dyeingCost: number;
  overheadCost: number;
  totalCost: number;
  profit: number;
  marginPct: number;
  deliveryDate: string;
  profitCategory: "profitable" | "thin_margin" | "loss";
  costBreakdown: {
    fabricOverConsumption: number;
    excessOvertime: number;
    reDyeingCost: number;
    airShipmentPenalty: number;
    reworkCost: number;
    otherLeakage: number;
  };
}

export async function getOrderProfitabilityData(companyId: string) {
  if (!companyId) return { data: null, error: "Company ID is required" };

  const supabase = await createClient();

  const { data: orders, error: ordersError } = await supabase
    .from("sales_orders")
    .select(`
      id, order_number, product_name, total_quantity, total_value,
      fob_price, currency, status, delivery_date,
      buyers ( id, name )
    `)
    .eq("company_id", companyId)
    .not("status", "eq", "cancelled")
    .order("created_at", { ascending: false });

  if (ordersError) return { data: null, error: ordersError.message };

  const { data: costSheets } = await supabase
    .from("cost_sheets")
    .select("*")
    .eq("company_id", companyId);

  const { data: cuttingEntries } = await supabase
    .from("cutting_entries")
    .select("work_order_id, fabric_consumed, planned_consumption, wastage_percent")
    .eq("company_id", companyId);

  const { data: productionEntries } = await supabase
    .from("production_entries")
    .select("order_id, produced_quantity, defective_quantity, rework_quantity, working_minutes, operators_present")
    .eq("company_id", companyId);

  const csMap = new Map<string, Record<string, unknown>>();
  (costSheets ?? []).forEach((cs) => {
    if (cs.order_id) csMap.set(cs.order_id, cs);
  });

  const prodByOrder = new Map<string, { produced: number; defective: number; rework: number; totalMinutes: number; totalOperators: number; entries: number }>();
  (productionEntries ?? []).forEach((pe) => {
    const existing = prodByOrder.get(pe.order_id) || { produced: 0, defective: 0, rework: 0, totalMinutes: 0, totalOperators: 0, entries: 0 };
    existing.produced += pe.produced_quantity;
    existing.defective += pe.defective_quantity ?? 0;
    existing.rework += pe.rework_quantity ?? 0;
    existing.totalMinutes += pe.working_minutes ?? 0;
    existing.totalOperators += pe.operators_present ?? 0;
    existing.entries += 1;
    prodByOrder.set(pe.order_id, existing);
  });

  const results: OrderProfitability[] = (orders ?? []).map((order) => {
    const buyer = order.buyers as Record<string, unknown> | null;
    const cs = csMap.get(order.id);
    const prod = prodByOrder.get(order.id);

    const materialCost = Number(cs?.material_cost ?? 0) * (order.total_quantity || 1);
    const sewingCost = Number(cs?.sewing_cost ?? 0) * (order.total_quantity || 1);
    const dyeingCost = Number(cs?.dyeing_cost ?? 0) * (order.total_quantity || 1);
    const overheadCost = (Number(cs?.overhead_cost ?? 0) + Number(cs?.admin_overhead ?? 0)) * (order.total_quantity || 1);
    const totalCost = materialCost + sewingCost + dyeingCost + overheadCost;

    const fobValue = order.total_value || (order.fob_price * (order.total_quantity || 0));
    const exchangeRate = Number(cs?.exchange_rate ?? 83.5);
    const fobValueInr = order.currency === "USD" ? fobValue * exchangeRate : fobValue;

    const profit = fobValueInr - totalCost;
    const marginPct = fobValueInr > 0 ? (profit / fobValueInr) * 100 : 0;

    const fabricOverConsumption = prod ? Math.max(0, (prod.defective * 0.5) * Number(cs?.material_cost ?? 0)) : 0;
    const reworkCost = prod ? prod.rework * (sewingCost / Math.max(1, order.total_quantity)) : 0;

    let profitCategory: "profitable" | "thin_margin" | "loss" = "profitable";
    if (marginPct < 0) profitCategory = "loss";
    else if (marginPct < 8) profitCategory = "thin_margin";

    return {
      id: order.id,
      orderNumber: order.order_number,
      buyer: (buyer?.name as string) || "Unknown",
      product: order.product_name,
      status: order.status || "confirmed",
      totalQty: order.total_quantity,
      fobValue: Math.round(fobValueInr),
      currency: "INR",
      materialCost: Math.round(materialCost),
      productionCost: Math.round(sewingCost),
      dyeingCost: Math.round(dyeingCost),
      overheadCost: Math.round(overheadCost),
      totalCost: Math.round(totalCost),
      profit: Math.round(profit),
      marginPct: Math.round(marginPct * 10) / 10,
      deliveryDate: order.delivery_date,
      profitCategory,
      costBreakdown: {
        fabricOverConsumption: Math.round(fabricOverConsumption),
        excessOvertime: 0,
        reDyeingCost: 0,
        airShipmentPenalty: 0,
        reworkCost: Math.round(reworkCost),
        otherLeakage: 0,
      },
    };
  });

  return { data: results, error: null };
}

// ============================================================
// FEATURE 2: Operator Attendance Impact Analyzer
// ============================================================

export interface AttendanceImpact {
  lineId: string;
  lineName: string;
  totalOperators: number;
  presentToday: number;
  absentCount: number;
  absentNames: string[];
  expectedOutput: number;
  adjustedOutput: number;
  outputDrop: number;
  affectedOrder: string;
  affectedOrderId: string;
  delayDays: number;
  recommendation: string;
}

export async function getAttendanceImpactData(companyId: string, date?: string) {
  if (!companyId) return { data: null, error: "Company ID is required" };

  const supabase = await createClient();
  const targetDate = date || new Date().toISOString().split("T")[0];

  const { data: lines, error: linesError } = await supabase
    .from("production_lines")
    .select(`
      id, name, total_operators, target_per_hour,
      sales_orders:current_order_id ( id, order_number, product_name, total_quantity, delivery_date )
    `)
    .eq("company_id", companyId)
    .eq("is_active", true);

  if (linesError) return { data: null, error: linesError.message };

  const { data: employees } = await supabase
    .from("employees")
    .select("id, full_name, department, current_shift, is_active")
    .eq("company_id", companyId)
    .eq("department", "sewing")
    .eq("is_active", true);

  const { data: todayEntries } = await supabase
    .from("production_entries")
    .select("production_line, operators_present, target_quantity")
    .eq("company_id", companyId)
    .eq("entry_date", targetDate);

  const totalSewingEmployees = (employees ?? []).length;
  const linesCount = (lines ?? []).length || 1;
  const avgOperatorsPerLine = Math.round(totalSewingEmployees / linesCount);

  const results: AttendanceImpact[] = (lines ?? []).map((line) => {
    const order = line.sales_orders as Record<string, unknown> | null;
    const lineEntries = (todayEntries ?? []).filter(
      (e) => e.production_line === line.name
    );

    const operatorsPresent = lineEntries.length > 0
      ? Math.round(lineEntries.reduce((s, e) => s + (e.operators_present ?? 0), 0) / lineEntries.length)
      : line.total_operators ?? avgOperatorsPerLine;

    const totalOps = line.total_operators ?? avgOperatorsPerLine;
    const absentCount = Math.max(0, totalOps - operatorsPresent);

    const expectedOutput = (line.target_per_hour ?? 100) * 8;
    const efficiencyDrop = absentCount / Math.max(1, totalOps);
    const adjustedOutput = Math.round(expectedOutput * (1 - efficiencyDrop));
    const outputDrop = expectedOutput - adjustedOutput;

    const remainingQty = order ? (Number(order.total_quantity ?? 0) - adjustedOutput) : 0;
    const dailyCapacity = adjustedOutput || 1;
    const daysNeeded = Math.ceil(Math.max(0, remainingQty) / dailyCapacity);
    const deliveryDate = order?.delivery_date as string | undefined;
    const daysRemaining = deliveryDate
      ? Math.ceil((new Date(deliveryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 30;
    const delayDays = Math.max(0, daysNeeded - daysRemaining);

    let recommendation = "On track";
    if (absentCount >= 5) recommendation = `Redistribute ${absentCount} operators from underloaded lines`;
    else if (absentCount >= 3) recommendation = `Consider cross-training backup from finishing dept`;
    else if (absentCount >= 1) recommendation = "Minor impact - monitor through shift";

    return {
      lineId: line.id,
      lineName: line.name,
      totalOperators: totalOps,
      presentToday: operatorsPresent,
      absentCount,
      absentNames: [],
      expectedOutput,
      adjustedOutput,
      outputDrop,
      affectedOrder: (order?.order_number as string) || "No order assigned",
      affectedOrderId: (order?.id as string) || "",
      delayDays,
      recommendation,
    };
  });

  return { data: results, error: null };
}

// ============================================================
// FEATURE 3: Fabric Consumption Variance Tracker
// ============================================================

export interface FabricVariance {
  id: string;
  orderNumber: string;
  buyer: string;
  product: string;
  bomStandardMeters: number;
  actualConsumedMeters: number;
  varianceMeters: number;
  variancePct: number;
  varianceValue: number;
  cuttingWaste: number;
  reCutting: number;
  dyeLotMismatch: number;
  markerEfficiency: number;
  standardMarkerEfficiency: number;
  status: "within_limit" | "warning" | "critical";
}

export async function getFabricVarianceData(companyId: string) {
  if (!companyId) return { data: null, error: "Company ID is required" };

  const supabase = await createClient();

  const { data: workOrders, error: woError } = await supabase
    .from("work_orders")
    .select(`
      id, wo_number, product_name, total_quantity,
      sales_orders ( id, order_number, product_name, total_quantity, buyers ( name ) ),
      boms ( id, total_cost )
    `)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (woError) return { data: null, error: woError.message };

  const { data: cuttingEntries } = await supabase
    .from("cutting_entries")
    .select("work_order_id, fabric_consumed, planned_consumption, wastage_percent, marker_efficiency, total_cut_qty")
    .eq("company_id", companyId);

  const { data: bomItems } = await supabase
    .from("bom_items")
    .select("bom_id, item_type, quantity_per_piece, rate, wastage_percent")
    .eq("item_type", "fabric");

  const cuttingByWO = new Map<string, { totalConsumed: number; totalPlanned: number; avgMarkerEff: number; entries: number }>();
  (cuttingEntries ?? []).forEach((ce) => {
    const existing = cuttingByWO.get(ce.work_order_id) || { totalConsumed: 0, totalPlanned: 0, avgMarkerEff: 0, entries: 0 };
    existing.totalConsumed += Number(ce.fabric_consumed ?? 0);
    existing.totalPlanned += Number(ce.planned_consumption ?? 0);
    existing.avgMarkerEff += Number(ce.marker_efficiency ?? 0);
    existing.entries += 1;
    cuttingByWO.set(ce.work_order_id, existing);
  });

  const results: FabricVariance[] = (workOrders ?? []).map((wo) => {
    const order = wo.sales_orders as Record<string, unknown> | null;
    const buyer = order?.buyers as Record<string, unknown> | null;
    const bom = wo.boms as Record<string, unknown> | null;
    const cutting = cuttingByWO.get(wo.id);

    const bomStandard = cutting?.totalPlanned || (wo.total_quantity * 1.2);
    const actualConsumed = cutting?.totalConsumed || 0;
    const variance = actualConsumed - bomStandard;
    const variancePct = bomStandard > 0 ? (variance / bomStandard) * 100 : 0;

    const fabricRate = 180;
    const varianceValue = variance * fabricRate;

    const markerEfficiency = cutting && cutting.entries > 0
      ? Math.round(cutting.avgMarkerEff / cutting.entries * 10) / 10
      : 0;

    const standardMarkerEfficiency = 80;
    const cuttingWaste = markerEfficiency > 0 ? Math.max(0, variance * ((standardMarkerEfficiency - markerEfficiency) / 100)) : variance * 0.5;
    const reCutting = variance * 0.28;
    const dyeLotMismatch = variance * 0.22;

    let status: "within_limit" | "warning" | "critical" = "within_limit";
    if (variancePct > 5) status = "critical";
    else if (variancePct > 3) status = "warning";

    return {
      id: wo.id,
      orderNumber: (order?.order_number as string) || wo.wo_number,
      buyer: (buyer?.name as string) || "Unknown",
      product: wo.product_name,
      bomStandardMeters: Math.round(bomStandard * 10) / 10,
      actualConsumedMeters: Math.round(actualConsumed * 10) / 10,
      varianceMeters: Math.round(variance * 10) / 10,
      variancePct: Math.round(variancePct * 10) / 10,
      varianceValue: Math.round(varianceValue),
      cuttingWaste: Math.round(cuttingWaste * 10) / 10,
      reCutting: Math.round(reCutting * 10) / 10,
      dyeLotMismatch: Math.round(dyeLotMismatch * 10) / 10,
      markerEfficiency,
      standardMarkerEfficiency,
      status,
    };
  });

  return { data: results, error: null };
}

// ============================================================
// FEATURE 4: Supplier Delivery Countdown & Risk Alert
// ============================================================

export interface SupplierCountdown {
  id: string;
  poNumber: string;
  supplierName: string;
  materialName: string;
  orderedQty: number;
  receivedQty: number;
  pendingQty: number;
  uom: string;
  expectedDate: string;
  daysRemaining: number;
  riskLevel: "on_track" | "at_risk" | "critical" | "overdue";
  affectedOrders: string[];
  downstreamImpact: string;
  suggestedAction: string;
}

export async function getSupplierCountdownData(companyId: string) {
  if (!companyId) return { data: null, error: "Company ID is required" };

  const supabase = await createClient();

  const { data: pos, error: posError } = await supabase
    .from("purchase_orders")
    .select(`
      id, po_number, expected_delivery_date, status,
      suppliers ( id, name, avg_lead_time_days ),
      sales_orders:order_id ( id, order_number, delivery_date, product_name )
    `)
    .eq("company_id", companyId)
    .not("status", "in", '("closed","cancelled","fully_received")')
    .order("expected_delivery_date", { ascending: true });

  if (posError) return { data: null, error: posError.message };

  const { data: poItems } = await supabase
    .from("po_items")
    .select("po_id, item_name, quantity, received_quantity, uom")
    .in("po_id", (pos ?? []).map(p => p.id));

  const itemsByPO = new Map<string, Array<Record<string, unknown>>>();
  (poItems ?? []).forEach((item) => {
    const existing = itemsByPO.get(item.po_id) || [];
    existing.push(item);
    itemsByPO.set(item.po_id, existing);
  });

  const now = new Date();

  const results: SupplierCountdown[] = (pos ?? []).flatMap((po) => {
    const supplier = po.suppliers as Record<string, unknown> | null;
    const order = po.sales_orders as Record<string, unknown> | null;
    const items = itemsByPO.get(po.id) || [];

    return items.map((item) => {
      const expectedDate = new Date(po.expected_delivery_date);
      const daysRemaining = Math.ceil((expectedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      const orderedQty = Number(item.quantity ?? 0);
      const receivedQty = Number(item.received_quantity ?? 0);
      const pendingQty = orderedQty - receivedQty;

      let riskLevel: "on_track" | "at_risk" | "critical" | "overdue" = "on_track";
      if (daysRemaining < 0) riskLevel = "overdue";
      else if (daysRemaining <= 2 && pendingQty > 0) riskLevel = "critical";
      else if (daysRemaining <= 5 && pendingQty > 0) riskLevel = "at_risk";

      const orderDelivery = order?.delivery_date as string | undefined;
      const avgLeadTime = Number(supplier?.avg_lead_time_days ?? 14);
      let downstreamImpact = "No downstream impact";
      let suggestedAction = "On track - no action needed";

      if (riskLevel === "overdue") {
        const delayDays = Math.abs(daysRemaining);
        downstreamImpact = `Material delayed ${delayDays} days. Fabric production delays by ${delayDays} days, cutting delays by ${delayDays + 2} days`;
        if (orderDelivery) {
          const orderDaysLeft = Math.ceil((new Date(orderDelivery).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          downstreamImpact += `. Order ${(order?.order_number as string) || ""} may miss shipment by ${Math.max(0, delayDays - orderDaysLeft + avgLeadTime)} days`;
        }
        suggestedAction = "Escalate immediately. Contact supplier MD. Arrange alternate source.";
      } else if (riskLevel === "critical") {
        downstreamImpact = `If delayed by 3 days: fabric production delays 3 days, cutting delays 5 days`;
        suggestedAction = "Call supplier for dispatch confirmation. Prepare alternate vendor list.";
      } else if (riskLevel === "at_risk") {
        downstreamImpact = `Potential 2-3 day cascade delay on downstream processes`;
        suggestedAction = "Send reminder to supplier. Monitor dispatch status.";
      }

      return {
        id: po.id + "-" + (item.item_name as string),
        poNumber: po.po_number,
        supplierName: (supplier?.name as string) || "Unknown",
        materialName: (item.item_name as string) || "Unknown",
        orderedQty,
        receivedQty,
        pendingQty,
        uom: (item.uom as string) || "pcs",
        expectedDate: po.expected_delivery_date,
        daysRemaining,
        riskLevel,
        affectedOrders: order ? [(order.order_number as string) || ""] : [],
        downstreamImpact,
        suggestedAction,
      };
    });
  });

  return { data: results, error: null };
}

// ============================================================
// FEATURE 5: Rework Cost Tracker
// ============================================================

export interface ReworkEntry {
  id: string;
  orderNumber: string;
  line: string;
  defectType: string;
  severity: string;
  quantity: number;
  reworkMinutes: number;
  costPerMinute: number;
  threadCost: number;
  handlingCost: number;
  totalCost: number;
  operator: string;
  date: string;
}

export interface ReworkSummary {
  totalReworkCost: number;
  totalReworkPieces: number;
  avgCostPerPiece: number;
  revenuePercentage: number;
  byDefectType: Array<{ defect: string; count: number; cost: number }>;
  byLine: Array<{ line: string; count: number; cost: number }>;
  trend: Array<{ week: string; cost: number; pieces: number }>;
}

export async function getReworkCostData(companyId: string) {
  if (!companyId) return { data: null, error: "Company ID is required" };

  const supabase = await createClient();

  const { data: inspections, error: inspError } = await supabase
    .from("inspections")
    .select(`
      id, inspection_number, inspection_date, production_line,
      total_defects, major_defects, minor_defects, critical_defects,
      sales_orders:order_id ( id, order_number, product_name ),
      inspection_defects ( id, defect_type, severity, quantity, notes )
    `)
    .eq("company_id", companyId)
    .gt("total_defects", 0)
    .order("inspection_date", { ascending: false })
    .limit(200);

  if (inspError) return { data: null, error: inspError.message };

  const { data: productionEntries } = await supabase
    .from("production_entries")
    .select("order_id, rework_quantity, production_line, entry_date")
    .eq("company_id", companyId)
    .gt("rework_quantity", 0);

  const costPerMinute = 3.5;
  const avgReworkMinutes = 8;
  const threadCostPerPiece = 2;
  const handlingCostPerPiece = 1.5;

  const reworkEntries: ReworkEntry[] = [];
  const defectCosts = new Map<string, { count: number; cost: number }>();
  const lineCosts = new Map<string, { count: number; cost: number }>();
  let totalCost = 0;
  let totalPieces = 0;

  (inspections ?? []).forEach((insp) => {
    const order = insp.sales_orders as Record<string, unknown> | null;
    const defects = insp.inspection_defects as Array<Record<string, unknown>> ?? [];

    defects.forEach((defect) => {
      const qty = Number(defect.quantity ?? 1);
      const reworkTime = avgReworkMinutes * qty;
      const laborCost = reworkTime * costPerMinute;
      const threadTotal = threadCostPerPiece * qty;
      const handlingTotal = handlingCostPerPiece * qty;
      const entryTotalCost = laborCost + threadTotal + handlingTotal;

      totalCost += entryTotalCost;
      totalPieces += qty;

      const defectType = (defect.defect_type as string) || "Unknown";
      const line = insp.production_line || "Unknown";

      const existingDefect = defectCosts.get(defectType) || { count: 0, cost: 0 };
      existingDefect.count += qty;
      existingDefect.cost += entryTotalCost;
      defectCosts.set(defectType, existingDefect);

      const existingLine = lineCosts.get(line) || { count: 0, cost: 0 };
      existingLine.count += qty;
      existingLine.cost += entryTotalCost;
      lineCosts.set(line, existingLine);

      reworkEntries.push({
        id: (defect.id as string) || crypto.randomUUID(),
        orderNumber: (order?.order_number as string) || insp.inspection_number,
        line,
        defectType,
        severity: (defect.severity as string) || "major",
        quantity: qty,
        reworkMinutes: reworkTime,
        costPerMinute,
        threadCost: threadTotal,
        handlingCost: handlingTotal,
        totalCost: Math.round(entryTotalCost),
        operator: "",
        date: insp.inspection_date,
      });
    });
  });

  (productionEntries ?? []).forEach((pe) => {
    const qty = pe.rework_quantity ?? 0;
    if (qty > 0) {
      const reworkTime = avgReworkMinutes * qty;
      const entryTotalCost = (reworkTime * costPerMinute) + (threadCostPerPiece * qty) + (handlingCostPerPiece * qty);
      totalCost += entryTotalCost;
      totalPieces += qty;

      const line = pe.production_line || "Unknown";
      const existingLine = lineCosts.get(line) || { count: 0, cost: 0 };
      existingLine.count += qty;
      existingLine.cost += entryTotalCost;
      lineCosts.set(line, existingLine);
    }
  });

  const byDefectType = Array.from(defectCosts.entries())
    .map(([defect, data]) => ({ defect, count: data.count, cost: Math.round(data.cost) }))
    .sort((a, b) => b.cost - a.cost);

  const byLine = Array.from(lineCosts.entries())
    .map(([line, data]) => ({ line, count: data.count, cost: Math.round(data.cost) }))
    .sort((a, b) => b.cost - a.cost);

  const summary: ReworkSummary = {
    totalReworkCost: Math.round(totalCost),
    totalReworkPieces: totalPieces,
    avgCostPerPiece: totalPieces > 0 ? Math.round((totalCost / totalPieces) * 100) / 100 : 0,
    revenuePercentage: 2.8,
    byDefectType,
    byLine,
    trend: [],
  };

  return { data: { entries: reworkEntries, summary }, error: null };
}

// ============================================================
// FEATURE 6: Style Learning Database
// ============================================================

export interface StyleCard {
  id: string;
  styleCode: string;
  styleName: string;
  buyer: string;
  category: string;
  lastProducedDate: string;
  ordersCount: number;
  totalQuantityProduced: number;
  actualFabricPerPiece: number;
  bomFabricPerPiece: number;
  actualSmv: number;
  theoreticalSmv: number;
  avgEfficiency: number;
  markerEfficiency: number;
  commonDefects: string[];
  recipeUsed: string;
  specialNotes: string;
  qualityPassRate: number;
}

export async function getStyleLearningData(companyId: string) {
  if (!companyId) return { data: null, error: "Company ID is required" };

  const supabase = await createClient();

  const { data: products, error: prodError } = await supabase
    .from("products")
    .select(`
      id, name, style_code, category,
      buyers ( id, name )
    `)
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("updated_at", { ascending: false });

  if (prodError) return { data: null, error: prodError.message };

  const { data: orders } = await supabase
    .from("sales_orders")
    .select("id, product_id, total_quantity, status, delivery_date")
    .eq("company_id", companyId)
    .not("status", "eq", "cancelled");

  const { data: workOrders } = await supabase
    .from("work_orders")
    .select("id, product_id, total_quantity, good_output, status, actual_end_date")
    .eq("company_id", companyId);

  const { data: productionEntries } = await supabase
    .from("production_entries")
    .select("work_order_id, produced_quantity, defective_quantity, efficiency_percent, working_minutes, operators_present")
    .eq("company_id", companyId);

  const { data: cuttingEntries } = await supabase
    .from("cutting_entries")
    .select("work_order_id, fabric_consumed, total_cut_qty, marker_efficiency")
    .eq("company_id", companyId);

  const { data: inspections } = await supabase
    .from("inspections")
    .select("order_id, result, total_defects, pieces_checked, inspection_defects ( defect_type )")
    .eq("company_id", companyId);

  const ordersByProduct = new Map<string, Array<Record<string, unknown>>>();
  (orders ?? []).forEach((o) => {
    if (o.product_id) {
      const existing = ordersByProduct.get(o.product_id) || [];
      existing.push(o);
      ordersByProduct.set(o.product_id, existing);
    }
  });

  const woByProduct = new Map<string, Array<Record<string, unknown>>>();
  (workOrders ?? []).forEach((wo) => {
    if (wo.product_id) {
      const existing = woByProduct.get(wo.product_id) || [];
      existing.push(wo);
      woByProduct.set(wo.product_id, existing);
    }
  });

  const peByWO = new Map<string, Array<Record<string, unknown>>>();
  (productionEntries ?? []).forEach((pe) => {
    const existing = peByWO.get(pe.work_order_id) || [];
    existing.push(pe);
    peByWO.set(pe.work_order_id, existing);
  });

  const cuttingByWO = new Map<string, Array<Record<string, unknown>>>();
  (cuttingEntries ?? []).forEach((ce) => {
    const existing = cuttingByWO.get(ce.work_order_id) || [];
    existing.push(ce);
    cuttingByWO.set(ce.work_order_id, existing);
  });

  const results: StyleCard[] = (products ?? []).map((product) => {
    const buyer = product.buyers as Record<string, unknown> | null;
    const productOrders = ordersByProduct.get(product.id) || [];
    const productWOs = woByProduct.get(product.id) || [];

    const totalQtyProduced = productWOs.reduce((s, wo) => s + Number(wo.good_output ?? 0), 0);

    let totalFabricConsumed = 0;
    let totalCutQty = 0;
    let totalMarkerEff = 0;
    let markerEntries = 0;
    let totalEfficiency = 0;
    let effEntries = 0;

    productWOs.forEach((wo) => {
      const cuts = cuttingByWO.get(wo.id as string) || [];
      cuts.forEach((c) => {
        totalFabricConsumed += Number(c.fabric_consumed ?? 0);
        totalCutQty += Number(c.total_cut_qty ?? 0);
        if (Number(c.marker_efficiency ?? 0) > 0) {
          totalMarkerEff += Number(c.marker_efficiency);
          markerEntries++;
        }
      });

      const prods = peByWO.get(wo.id as string) || [];
      prods.forEach((pe) => {
        totalEfficiency += Number(pe.efficiency_percent ?? 0);
        effEntries++;
      });
    });

    const lastDate = productWOs
      .filter((wo) => wo.actual_end_date)
      .sort((a, b) => new Date(b.actual_end_date as string).getTime() - new Date(a.actual_end_date as string).getTime())[0];

    const orderIds = productOrders.map((o) => o.id as string);
    const orderInspections = (inspections ?? []).filter((i) => orderIds.includes(i.order_id || ""));
    const passedCount = orderInspections.filter((i) => i.result === "pass" || i.result === "accepted").length;
    const qualityPassRate = orderInspections.length > 0 ? Math.round((passedCount / orderInspections.length) * 100) : 0;

    const defectTypes = new Map<string, number>();
    orderInspections.forEach((i) => {
      const defects = i.inspection_defects as Array<Record<string, unknown>> ?? [];
      defects.forEach((d) => {
        const type = (d.defect_type as string) || "Unknown";
        defectTypes.set(type, (defectTypes.get(type) || 0) + 1);
      });
    });
    const commonDefects = Array.from(defectTypes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([d]) => d);

    return {
      id: product.id,
      styleCode: product.style_code,
      styleName: product.name,
      buyer: (buyer?.name as string) || "Unknown",
      category: product.category,
      lastProducedDate: (lastDate?.actual_end_date as string) || "",
      ordersCount: productOrders.length,
      totalQuantityProduced: totalQtyProduced,
      actualFabricPerPiece: totalCutQty > 0 ? Math.round((totalFabricConsumed / totalCutQty) * 1000) / 1000 : 0,
      bomFabricPerPiece: 0,
      actualSmv: 0,
      theoreticalSmv: 0,
      avgEfficiency: effEntries > 0 ? Math.round(totalEfficiency / effEntries) : 0,
      markerEfficiency: markerEntries > 0 ? Math.round((totalMarkerEff / markerEntries) * 10) / 10 : 0,
      commonDefects,
      recipeUsed: "",
      specialNotes: "",
      qualityPassRate,
    };
  });

  return { data: results, error: null };
}

// ============================================================
// FEATURE 7: Production Floor Exception Feed
// ============================================================

export interface ProductionException {
  id: string;
  timestamp: string;
  type: "output_drop" | "machine_breakdown" | "quality_fail" | "material_shortage" | "cutting_waste" | "attendance" | "delay";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  affectedEntity: string;
  affectedEntityId?: string;
  metric?: string;
  threshold?: string;
  actual?: string;
}

export async function getExceptionFeedData(companyId: string) {
  if (!companyId) return { data: null, error: "Company ID is required" };

  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const [
    { data: productionEntries },
    { data: machines },
    { data: inspections },
    { data: cuttingEntries },
    { data: lines },
  ] = await Promise.all([
    supabase.from("production_entries").select("*").eq("company_id", companyId).eq("entry_date", today),
    supabase.from("machines").select("*").eq("company_id", companyId).eq("status", "breakdown"),
    supabase.from("inspections").select("*, sales_orders:order_id ( order_number )").eq("company_id", companyId).eq("inspection_date", today).in("result", ["fail", "rejected"]),
    supabase.from("cutting_entries").select("*, work_orders ( wo_number, product_name )").eq("company_id", companyId).eq("entry_date", today),
    supabase.from("production_lines").select("*").eq("company_id", companyId).eq("is_active", true),
  ]);

  const exceptions: ProductionException[] = [];
  const now = new Date();

  // Machine breakdowns
  (machines ?? []).forEach((machine) => {
    exceptions.push({
      id: `mc-${machine.id}`,
      timestamp: machine.updated_at || now.toISOString(),
      type: "machine_breakdown",
      severity: "critical",
      title: `${machine.name} (${machine.machine_code}) is down`,
      description: `Machine ${machine.name} in ${machine.department} department reported breakdown. Type: ${machine.machine_type}`,
      affectedEntity: machine.department || "Production",
      affectedEntityId: machine.id,
      metric: "Machine Status",
      threshold: "Running",
      actual: "Breakdown",
    });
  });

  // Quality failures
  (inspections ?? []).forEach((insp) => {
    const order = insp.sales_orders as Record<string, unknown> | null;
    exceptions.push({
      id: `qc-${insp.id}`,
      timestamp: insp.created_at || now.toISOString(),
      type: "quality_fail",
      severity: insp.critical_defects > 0 ? "critical" : "high",
      title: `QC Failed: ${insp.inspection_number}`,
      description: `${insp.inspection_type} inspection failed for ${(order?.order_number as string) || "order"} - ${insp.total_defects} defects found (${insp.critical_defects} critical, ${insp.major_defects} major, ${insp.minor_defects} minor)`,
      affectedEntity: insp.production_line || "Quality",
      affectedEntityId: insp.id,
      metric: "Defects",
      threshold: "0",
      actual: String(insp.total_defects),
    });
  });

  // Cutting waste alerts
  (cuttingEntries ?? []).forEach((ce) => {
    const wastage = Number(ce.wastage_percent ?? 0);
    if (wastage > 5) {
      const wo = ce.work_orders as Record<string, unknown> | null;
      exceptions.push({
        id: `cw-${ce.id}`,
        timestamp: ce.created_at || now.toISOString(),
        type: "cutting_waste",
        severity: wastage > 8 ? "high" : "medium",
        title: `Cutting wastage at ${wastage}% on ${(wo?.wo_number as string) || "work order"}`,
        description: `Wastage percentage is ${wastage}% against standard of 5% for ${(wo?.product_name as string) || "product"}`,
        affectedEntity: "Cutting",
        metric: "Wastage %",
        threshold: "5%",
        actual: `${wastage}%`,
      });
    }
  });

  // Production output drops
  const lineEntries = new Map<string, { produced: number; target: number }>();
  (productionEntries ?? []).forEach((pe) => {
    const existing = lineEntries.get(pe.production_line) || { produced: 0, target: 0 };
    existing.produced += pe.produced_quantity;
    existing.target += pe.target_quantity;
    lineEntries.set(pe.production_line, existing);
  });

  lineEntries.forEach((data, lineName) => {
    if (data.target > 0) {
      const achievementPct = (data.produced / data.target) * 100;
      if (achievementPct < 70) {
        exceptions.push({
          id: `od-${lineName}`,
          timestamp: now.toISOString(),
          type: "output_drop",
          severity: achievementPct < 50 ? "critical" : "high",
          title: `${lineName} output at ${Math.round(achievementPct)}% of target`,
          description: `Produced ${data.produced} pcs against target of ${data.target} pcs today`,
          affectedEntity: lineName,
          metric: "Output Achievement",
          threshold: "85%",
          actual: `${Math.round(achievementPct)}%`,
        });
      }
    }
  });

  exceptions.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return (severityOrder[a.severity] - severityOrder[b.severity]) || (new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  });

  return { data: exceptions, error: null };
}

// ============================================================
// FEATURE 8: Buyer Behavior & Pattern Insights
// ============================================================

export interface BuyerInsight {
  id: string;
  name: string;
  code: string;
  avgOrderSize: number;
  totalOrders: number;
  preferredStyles: string[];
  avgLeadTimeDays: number;
  avgSampleRounds: number;
  qcPassRate: number;
  avgPaymentDays: number;
  paymentReliability: "excellent" | "good" | "fair" | "poor";
  seasonalPattern: string;
  totalRevenue: number;
  lastOrderDate: string;
  rejectionRate: number;
  avgFobPrice: number;
}

export async function getBuyerInsightsData(companyId: string) {
  if (!companyId) return { data: null, error: "Company ID is required" };

  const supabase = await createClient();

  const { data: buyers, error: buyerError } = await supabase
    .from("buyers")
    .select("id, name, code, payment_terms, quality_standard, default_currency")
    .eq("company_id", companyId)
    .eq("is_active", true);

  if (buyerError) return { data: null, error: buyerError.message };

  const { data: orders } = await supabase
    .from("sales_orders")
    .select("id, buyer_id, total_quantity, total_value, fob_price, currency, order_date, delivery_date, status, product_name")
    .eq("company_id", companyId)
    .not("status", "eq", "cancelled");

  const { data: samples } = await supabase
    .from("samples")
    .select("id, buyer_id, sample_type, status, created_at, approved_date")
    .eq("company_id", companyId);

  const { data: inspections } = await supabase
    .from("inspections")
    .select("id, order_id, result, inspection_type")
    .eq("company_id", companyId)
    .in("inspection_type", ["final", "pre_final"]);

  const ordersByBuyer = new Map<string, Array<Record<string, unknown>>>();
  (orders ?? []).forEach((o) => {
    const existing = ordersByBuyer.get(o.buyer_id) || [];
    existing.push(o);
    ordersByBuyer.set(o.buyer_id, existing);
  });

  const samplesByBuyer = new Map<string, Array<Record<string, unknown>>>();
  (samples ?? []).forEach((s) => {
    const existing = samplesByBuyer.get(s.buyer_id) || [];
    existing.push(s);
    samplesByBuyer.set(s.buyer_id, existing);
  });

  const inspByOrder = new Map<string, Array<Record<string, unknown>>>();
  (inspections ?? []).forEach((i) => {
    if (i.order_id) {
      const existing = inspByOrder.get(i.order_id) || [];
      existing.push(i);
      inspByOrder.set(i.order_id, existing);
    }
  });

  const results: BuyerInsight[] = (buyers ?? []).map((buyer) => {
    const buyerOrders = ordersByBuyer.get(buyer.id) || [];
    const buyerSamples = samplesByBuyer.get(buyer.id) || [];

    const totalOrders = buyerOrders.length;
    const avgOrderSize = totalOrders > 0
      ? Math.round(buyerOrders.reduce((s, o) => s + Number(o.total_quantity ?? 0), 0) / totalOrders)
      : 0;

    const totalRevenue = buyerOrders.reduce((s, o) => s + Number(o.total_value ?? 0), 0);
    const avgFobPrice = totalOrders > 0
      ? Math.round(buyerOrders.reduce((s, o) => s + Number(o.fob_price ?? 0), 0) / totalOrders * 100) / 100
      : 0;

    const leadTimes = buyerOrders
      .filter((o) => o.order_date && o.delivery_date)
      .map((o) => Math.ceil((new Date(o.delivery_date as string).getTime() - new Date(o.order_date as string).getTime()) / (1000 * 60 * 60 * 24)));
    const avgLeadTime = leadTimes.length > 0 ? Math.round(leadTimes.reduce((s, d) => s + d, 0) / leadTimes.length) : 0;

    const sampleGroups = new Map<string, number>();
    buyerSamples.forEach((s) => {
      const type = (s.sample_type as string) || "unknown";
      sampleGroups.set(type, (sampleGroups.get(type) || 0) + 1);
    });
    const avgSampleRounds = sampleGroups.size;

    let totalInspections = 0;
    let passedInspections = 0;
    buyerOrders.forEach((o) => {
      const orderInsps = inspByOrder.get(o.id as string) || [];
      orderInsps.forEach((i) => {
        totalInspections++;
        if (i.result === "pass" || i.result === "accepted") passedInspections++;
      });
    });
    const qcPassRate = totalInspections > 0 ? Math.round((passedInspections / totalInspections) * 100) : 0;
    const rejectionRate = totalInspections > 0 ? 100 - qcPassRate : 0;

    const styles = new Set<string>();
    buyerOrders.forEach((o) => { if (o.product_name) styles.add(o.product_name as string); });
    const preferredStyles = Array.from(styles).slice(0, 5);

    const sortedOrders = [...buyerOrders].sort((a, b) =>
      new Date(b.order_date as string).getTime() - new Date(a.order_date as string).getTime()
    );
    const lastOrderDate = sortedOrders[0]?.order_date as string || "";

    const avgPaymentDays = buyer.payment_terms ? parseInt(buyer.payment_terms) || 30 : 30;
    let paymentReliability: "excellent" | "good" | "fair" | "poor" = "good";
    if (avgPaymentDays <= 15) paymentReliability = "excellent";
    else if (avgPaymentDays <= 30) paymentReliability = "good";
    else if (avgPaymentDays <= 60) paymentReliability = "fair";
    else paymentReliability = "poor";

    const months = buyerOrders.map((o) => new Date(o.order_date as string).getMonth());
    const monthCounts = new Array(12).fill(0);
    months.forEach((m) => { if (!isNaN(m)) monthCounts[m]++; });
    const peakMonth = monthCounts.indexOf(Math.max(...monthCounts));
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const seasonalPattern = totalOrders > 3 ? `Peak: ${monthNames[peakMonth]}` : "Insufficient data";

    return {
      id: buyer.id,
      name: buyer.name,
      code: buyer.code,
      avgOrderSize,
      totalOrders,
      preferredStyles,
      avgLeadTimeDays: avgLeadTime,
      avgSampleRounds,
      qcPassRate,
      avgPaymentDays,
      paymentReliability,
      seasonalPattern,
      totalRevenue: Math.round(totalRevenue),
      lastOrderDate,
      rejectionRate,
      avgFobPrice,
    };
  });

  return { data: results, error: null };
}

// ============================================================
// FEATURE 9: Material Expiry & Shelf Life Tracker
// ============================================================

export interface MaterialExpiry {
  id: string;
  itemName: string;
  itemType: string;
  batchNumber: string;
  quantity: number;
  uom: string;
  expiryDate: string;
  daysToExpiry: number;
  status: "expired" | "critical" | "warning" | "safe";
  warehouse: string;
  value: number;
  suggestedAction: string;
}

export async function getMaterialExpiryData(companyId: string) {
  if (!companyId) return { data: null, error: "Company ID is required" };

  const supabase = await createClient();

  const { data: inventory, error: invError } = await supabase
    .from("inventory")
    .select(`
      id, item_name, item_type, batch_number, quantity, uom, rate, status,
      locations:warehouse_id ( name )
    `)
    .eq("company_id", companyId)
    .in("item_type", ["chemical", "trim", "accessory"])
    .gt("quantity", 0);

  if (invError) return { data: null, error: invError.message };

  const { data: chemicals } = await supabase
    .from("chemicals")
    .select("id, name, chemical_type")
    .eq("company_id", companyId);

  const chemicalTypes = new Map<string, string>();
  (chemicals ?? []).forEach((c) => {
    chemicalTypes.set(c.id, c.chemical_type);
  });

  const now = new Date();
  const shelfLifeDays: Record<string, number> = {
    "reactive_dye": 365,
    "disperse_dye": 365,
    "acid_dye": 300,
    "auxiliary": 180,
    "softener": 270,
    "fixing_agent": 240,
    "binder": 200,
    "chemical": 365,
    "trim": 730,
    "accessory": 1095,
  };

  const results: MaterialExpiry[] = (inventory ?? []).map((item) => {
    const warehouse = item.locations as Record<string, unknown> | null;
    const chemType = item.item_id ? chemicalTypes.get(item.item_id) : null;

    const defaultShelfLife = shelfLifeDays[chemType || item.item_type] || 365;
    const createdDate = new Date(item.created_at || now);
    const expiryDate = new Date(createdDate.getTime() + defaultShelfLife * 24 * 60 * 60 * 1000);
    const daysToExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let status: "expired" | "critical" | "warning" | "safe" = "safe";
    let suggestedAction = "No action needed";

    if (daysToExpiry <= 0) {
      status = "expired";
      suggestedAction = "Remove from stock. Do NOT use in production. Return to supplier or dispose.";
    } else if (daysToExpiry <= 15) {
      status = "critical";
      suggestedAction = `Use within ${daysToExpiry} days or return to supplier. Prioritize for current production batches.`;
    } else if (daysToExpiry <= 45) {
      status = "warning";
      suggestedAction = `Plan usage within ${daysToExpiry} days. Allocate to upcoming dyeing batches.`;
    }

    return {
      id: item.id,
      itemName: item.item_name,
      itemType: item.item_type,
      batchNumber: item.batch_number || "N/A",
      quantity: Number(item.quantity),
      uom: item.uom,
      expiryDate: expiryDate.toISOString().split("T")[0],
      daysToExpiry,
      status,
      warehouse: (warehouse?.name as string) || "Main Store",
      value: Math.round(Number(item.quantity) * Number(item.rate ?? 0)),
      suggestedAction,
    };
  });

  results.sort((a, b) => a.daysToExpiry - b.daysToExpiry);

  return { data: results, error: null };
}

// ============================================================
// FEATURE 10: Inter-Department Handoff Tracker
// ============================================================

export interface HandoffEntry {
  id: string;
  orderNumber: string;
  fromDept: string;
  toDept: string;
  completedAt: string;
  receivedAt: string;
  waitTimeMinutes: number;
  waitTimeFormatted: string;
  quantity: number;
  status: "on_time" | "delayed" | "critical_delay";
  date: string;
}

export interface HandoffSummary {
  avgWaitMinutes: number;
  totalIdleHours: number;
  worstHandoff: string;
  handoffsByRoute: Array<{ route: string; avgWait: number; count: number }>;
}

export async function getHandoffTrackerData(companyId: string) {
  if (!companyId) return { data: null, error: "Company ID is required" };

  const supabase = await createClient();

  const { data: workOrders, error: woError } = await supabase
    .from("work_orders")
    .select(`
      id, wo_number, product_name, status, actual_start_date, actual_end_date,
      sales_orders ( id, order_number )
    `)
    .eq("company_id", companyId)
    .in("status", ["in_progress", "completed"])
    .order("created_at", { ascending: false })
    .limit(50);

  if (woError) return { data: null, error: woError.message };

  const woIds = (workOrders ?? []).map((wo) => wo.id);

  const [
    { data: cuttingEntries },
    { data: productionEntries },
    { data: finishingEntries },
  ] = await Promise.all([
    supabase.from("cutting_entries").select("work_order_id, entry_date, total_cut_qty, created_at").in("work_order_id", woIds),
    supabase.from("production_entries").select("work_order_id, entry_date, produced_quantity, created_at, production_line").in("work_order_id", woIds),
    supabase.from("finishing_entries").select("work_order_id, entry_date, received_from_sewing, processed_quantity, created_at").in("work_order_id", woIds),
  ]);

  const handoffs: HandoffEntry[] = [];

  (workOrders ?? []).forEach((wo) => {
    const order = wo.sales_orders as Record<string, unknown> | null;
    const orderNum = (order?.order_number as string) || wo.wo_number;

    const cuts = (cuttingEntries ?? []).filter((c) => c.work_order_id === wo.id);
    const prods = (productionEntries ?? []).filter((p) => p.work_order_id === wo.id);
    const fins = (finishingEntries ?? []).filter((f) => f.work_order_id === wo.id);

    if (cuts.length > 0 && prods.length > 0) {
      const lastCut = cuts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      const firstProd = prods.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];

      const cutTime = new Date(lastCut.created_at);
      const prodTime = new Date(firstProd.created_at);
      const waitMinutes = Math.max(0, Math.round((prodTime.getTime() - cutTime.getTime()) / (1000 * 60)));

      const hours = Math.floor(waitMinutes / 60);
      const mins = waitMinutes % 60;

      let status: "on_time" | "delayed" | "critical_delay" = "on_time";
      if (waitMinutes > 240) status = "critical_delay";
      else if (waitMinutes > 60) status = "delayed";

      handoffs.push({
        id: `${wo.id}-cut-sew`,
        orderNumber: orderNum,
        fromDept: "Cutting",
        toDept: "Sewing",
        completedAt: lastCut.created_at,
        receivedAt: firstProd.created_at,
        waitTimeMinutes: waitMinutes,
        waitTimeFormatted: `${hours}h ${mins}m`,
        quantity: lastCut.total_cut_qty || 0,
        status,
        date: lastCut.entry_date,
      });
    }

    if (prods.length > 0 && fins.length > 0) {
      const lastProd = prods.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      const firstFin = fins.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];

      const prodTime = new Date(lastProd.created_at);
      const finTime = new Date(firstFin.created_at);
      const waitMinutes = Math.max(0, Math.round((finTime.getTime() - prodTime.getTime()) / (1000 * 60)));

      const hours = Math.floor(waitMinutes / 60);
      const mins = waitMinutes % 60;

      let status: "on_time" | "delayed" | "critical_delay" = "on_time";
      if (waitMinutes > 240) status = "critical_delay";
      else if (waitMinutes > 60) status = "delayed";

      handoffs.push({
        id: `${wo.id}-sew-fin`,
        orderNumber: orderNum,
        fromDept: "Sewing",
        toDept: "Finishing",
        completedAt: lastProd.created_at,
        receivedAt: firstFin.created_at,
        waitTimeMinutes: waitMinutes,
        waitTimeFormatted: `${hours}h ${mins}m`,
        quantity: lastProd.produced_quantity || 0,
        status,
        date: lastProd.entry_date,
      });
    }
  });

  const routeMap = new Map<string, { totalWait: number; count: number }>();
  handoffs.forEach((h) => {
    const route = `${h.fromDept} → ${h.toDept}`;
    const existing = routeMap.get(route) || { totalWait: 0, count: 0 };
    existing.totalWait += h.waitTimeMinutes;
    existing.count++;
    routeMap.set(route, existing);
  });

  const handoffsByRoute = Array.from(routeMap.entries()).map(([route, data]) => ({
    route,
    avgWait: Math.round(data.totalWait / data.count),
    count: data.count,
  }));

  const totalWait = handoffs.reduce((s, h) => s + h.waitTimeMinutes, 0);
  const avgWait = handoffs.length > 0 ? Math.round(totalWait / handoffs.length) : 0;
  const worstRoute = handoffsByRoute.sort((a, b) => b.avgWait - a.avgWait)[0];

  const summary: HandoffSummary = {
    avgWaitMinutes: avgWait,
    totalIdleHours: Math.round(totalWait / 60 * 10) / 10,
    worstHandoff: worstRoute ? `${worstRoute.route} (avg ${worstRoute.avgWait} min)` : "N/A",
    handoffsByRoute,
  };

  return { data: { handoffs, summary }, error: null };
}

// ============================================================
// FEATURE 11: Capacity Booking Calendar
// ============================================================

export interface CapacitySlot {
  lineId: string;
  lineName: string;
  weekStart: string;
  weekEnd: string;
  weekLabel: string;
  bookedPct: number;
  orderNumber: string;
  buyer: string;
  product: string;
  color: string;
  status: "booked" | "partial" | "free";
}

export async function getCapacityCalendarData(companyId: string, weeksAhead: number = 12) {
  if (!companyId) return { data: null, error: "Company ID is required" };

  const supabase = await createClient();

  const { data: lines, error: linesError } = await supabase
    .from("production_lines")
    .select("id, name, total_operators, target_per_hour")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("name");

  if (linesError) return { data: null, error: linesError.message };

  const { data: workOrders } = await supabase
    .from("work_orders")
    .select(`
      id, production_line, total_quantity, good_output, planned_start_date, planned_end_date, status,
      sales_orders ( id, order_number, product_name, buyer_id, buyers ( name ) )
    `)
    .eq("company_id", companyId)
    .in("status", ["planned", "in_progress"])
    .order("planned_start_date");

  const now = new Date();
  const weeks: Array<{ start: Date; end: Date; label: string }> = [];

  for (let i = 0; i < weeksAhead; i++) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + (i * 7) - now.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    weeks.push({
      start: weekStart,
      end: weekEnd,
      label: `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()}`,
    });
  }

  const BUYER_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6"];
  const buyerColorMap = new Map<string, string>();
  let colorIdx = 0;

  const slots: CapacitySlot[] = [];

  (lines ?? []).forEach((line) => {
    weeks.forEach((week) => {
      const overlappingWOs = (workOrders ?? []).filter((wo) => {
        if (wo.production_line !== line.name) return false;
        const woStart = wo.planned_start_date ? new Date(wo.planned_start_date) : null;
        const woEnd = wo.planned_end_date ? new Date(wo.planned_end_date) : null;
        if (!woStart || !woEnd) return false;
        return woStart <= week.end && woEnd >= week.start;
      });

      if (overlappingWOs.length > 0) {
        const wo = overlappingWOs[0];
        const order = wo.sales_orders as Record<string, unknown> | null;
        const buyer = order?.buyers as Record<string, unknown> | null;
        const buyerName = (buyer?.name as string) || "Unknown";

        if (!buyerColorMap.has(buyerName)) {
          buyerColorMap.set(buyerName, BUYER_COLORS[colorIdx % BUYER_COLORS.length]);
          colorIdx++;
        }

        slots.push({
          lineId: line.id,
          lineName: line.name,
          weekStart: week.start.toISOString().split("T")[0],
          weekEnd: week.end.toISOString().split("T")[0],
          weekLabel: week.label,
          bookedPct: 100,
          orderNumber: (order?.order_number as string) || "",
          buyer: buyerName,
          product: (order?.product_name as string) || wo.product_name || "",
          color: buyerColorMap.get(buyerName) || "#3b82f6",
          status: "booked",
        });
      } else {
        slots.push({
          lineId: line.id,
          lineName: line.name,
          weekStart: week.start.toISOString().split("T")[0],
          weekEnd: week.end.toISOString().split("T")[0],
          weekLabel: week.label,
          bookedPct: 0,
          orderNumber: "",
          buyer: "",
          product: "",
          color: "#e5e7eb",
          status: "free",
        });
      }
    });
  });

  return {
    data: {
      slots,
      lines: (lines ?? []).map((l) => ({ id: l.id, name: l.name })),
      weeks: weeks.map((w) => ({ start: w.start.toISOString().split("T")[0], end: w.end.toISOString().split("T")[0], label: w.label })),
    },
    error: null,
  };
}

// ============================================================
// FEATURE 12: Process-Wise Cost Per Piece Benchmark
// ============================================================

export interface ProcessBenchmark {
  process: string;
  benchmarkCost: number;
  orders: Array<{
    orderNumber: string;
    buyer: string;
    actualCost: number;
    variance: number;
    variancePct: number;
    status: "below" | "at" | "above";
  }>;
}

export async function getProcessCostBenchmarkData(companyId: string) {
  if (!companyId) return { data: null, error: "Company ID is required" };

  const supabase = await createClient();

  const { data: costSheets, error: csError } = await supabase
    .from("cost_sheets")
    .select(`
      id, material_cost, cutting_cost, sewing_cost, finishing_cost, dyeing_cost,
      overhead_cost, packing_cost, total_cost,
      sales_orders:order_id ( id, order_number, total_quantity, buyers ( name ) ),
      products ( id, style_code )
    `)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (csError) return { data: null, error: csError.message };

  const processes = ["material", "cutting", "sewing", "finishing", "dyeing", "overhead", "packing"] as const;
  const processLabels: Record<string, string> = {
    material: "Material",
    cutting: "Cutting",
    sewing: "Sewing",
    finishing: "Finishing",
    dyeing: "Dyeing",
    overhead: "Overhead",
    packing: "Packing",
  };

  const processData = new Map<string, number[]>();
  processes.forEach((p) => processData.set(p, []));

  const sheetsByOrder = new Map<string, Record<string, unknown>>();

  (costSheets ?? []).forEach((cs) => {
    const order = cs.sales_orders as Record<string, unknown> | null;
    const qty = Number(order?.total_quantity ?? 1);

    if (qty > 0) {
      processes.forEach((p) => {
        const costField = `${p}_cost` as keyof typeof cs;
        const costPerPiece = Number(cs[costField] ?? 0);
        processData.get(p)!.push(costPerPiece);
      });

      if (order?.id) {
        sheetsByOrder.set(order.id as string, cs);
      }
    }
  });

  const benchmarks = new Map<string, number>();
  processes.forEach((p) => {
    const values = processData.get(p)!;
    const avg = values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : 0;
    benchmarks.set(p, Math.round(avg * 100) / 100);
  });

  const results: ProcessBenchmark[] = processes.map((process) => {
    const benchmark = benchmarks.get(process) || 0;

    const orders = (costSheets ?? []).map((cs) => {
      const order = cs.sales_orders as Record<string, unknown> | null;
      const buyer = order?.buyers as Record<string, unknown> | null;
      const costField = `${process}_cost` as keyof typeof cs;
      const actualCost = Number(cs[costField] ?? 0);
      const variance = actualCost - benchmark;
      const variancePct = benchmark > 0 ? (variance / benchmark) * 100 : 0;

      let status: "below" | "at" | "above" = "at";
      if (variancePct > 10) status = "above";
      else if (variancePct < -10) status = "below";

      return {
        orderNumber: (order?.order_number as string) || "",
        buyer: (buyer?.name as string) || "Unknown",
        actualCost: Math.round(actualCost * 100) / 100,
        variance: Math.round(variance * 100) / 100,
        variancePct: Math.round(variancePct * 10) / 10,
        status,
      };
    }).filter((o) => o.orderNumber);

    return {
      process: processLabels[process],
      benchmarkCost: benchmark,
      orders,
    };
  });

  return { data: results, error: null };
}

// ============================================================
// FEATURE 13: Quality Hold & Release Gate
// ============================================================

export interface ShipmentGate {
  id: string;
  shipmentNumber: string;
  buyer: string;
  orderNumbers: string[];
  plannedDate: string;
  totalCartons: number;
  totalPieces: number;
  status: string;
  qualityHold: boolean;
  holdReasons: string[];
  pendingActions: string[];
  lastInspectionResult: string;
  lastInspectionDate: string;
  canRelease: boolean;
}

export async function getQualityGateData(companyId: string) {
  if (!companyId) return { data: null, error: "Company ID is required" };

  const supabase = await createClient();

  const { data: shipments, error: shipError } = await supabase
    .from("shipments")
    .select(`
      id, shipment_number, planned_shipment_date, actual_shipment_date,
      total_cartons, total_pieces, status, order_ids,
      production_complete, qc_passed, packing_done, documents_ready, transport_arranged,
      buyers ( id, name )
    `)
    .eq("company_id", companyId)
    .in("status", ["packing", "ready"])
    .order("planned_shipment_date", { ascending: true });

  if (shipError) return { data: null, error: shipError.message };

  const allOrderIds: string[] = [];
  (shipments ?? []).forEach((s) => {
    if (Array.isArray(s.order_ids)) allOrderIds.push(...s.order_ids);
  });

  const { data: orders } = await supabase
    .from("sales_orders")
    .select("id, order_number")
    .in("id", allOrderIds.length > 0 ? allOrderIds : ["none"]);

  const { data: inspections } = await supabase
    .from("inspections")
    .select("id, order_id, result, inspection_date, inspection_type, total_defects, critical_defects")
    .eq("company_id", companyId)
    .in("inspection_type", ["final", "pre_final"])
    .order("inspection_date", { ascending: false });

  const orderMap = new Map<string, string>();
  (orders ?? []).forEach((o) => orderMap.set(o.id, o.order_number));

  const inspByOrder = new Map<string, Array<Record<string, unknown>>>();
  (inspections ?? []).forEach((i) => {
    if (i.order_id) {
      const existing = inspByOrder.get(i.order_id) || [];
      existing.push(i);
      inspByOrder.set(i.order_id, existing);
    }
  });

  const results: ShipmentGate[] = (shipments ?? []).map((shipment) => {
    const buyer = shipment.buyers as Record<string, unknown> | null;
    const orderNums = (shipment.order_ids || []).map((id: string) => orderMap.get(id) || id);

    const holdReasons: string[] = [];
    const pendingActions: string[] = [];

    if (!shipment.production_complete) {
      holdReasons.push("Production not complete");
      pendingActions.push("Complete remaining production");
    }
    if (!shipment.qc_passed) {
      holdReasons.push("QC not passed");
      pendingActions.push("Complete final QC inspection");
    }
    if (!shipment.packing_done) {
      holdReasons.push("Packing incomplete");
      pendingActions.push("Complete packing and carton markings");
    }
    if (!shipment.documents_ready) {
      holdReasons.push("Documents not ready");
      pendingActions.push("Prepare shipping documents");
    }

    let hasQualityIssues = false;
    let lastResult = "pending";
    let lastDate = "";

    (shipment.order_ids || []).forEach((orderId: string) => {
      const orderInsps = inspByOrder.get(orderId) || [];
      if (orderInsps.length > 0) {
        const latest = orderInsps[0];
        if (latest.result === "fail" || latest.result === "rejected") {
          hasQualityIssues = true;
          holdReasons.push(`Order ${orderMap.get(orderId) || orderId}: QC failed with ${latest.total_defects} defects`);
          pendingActions.push(`Re-inspect order ${orderMap.get(orderId) || orderId}`);
        }
        if (Number(latest.critical_defects ?? 0) > 0) {
          hasQualityIssues = true;
          holdReasons.push(`Critical defects found in order ${orderMap.get(orderId) || orderId}`);
        }
        lastResult = (latest.result as string) || "pending";
        lastDate = (latest.inspection_date as string) || "";
      }
    });

    const qualityHold = holdReasons.length > 0 || hasQualityIssues;
    const canRelease = !qualityHold;

    return {
      id: shipment.id,
      shipmentNumber: shipment.shipment_number,
      buyer: (buyer?.name as string) || "Unknown",
      orderNumbers: orderNums,
      plannedDate: shipment.planned_shipment_date,
      totalCartons: shipment.total_cartons || 0,
      totalPieces: shipment.total_pieces || 0,
      status: shipment.status || "packing",
      qualityHold,
      holdReasons,
      pendingActions,
      lastInspectionResult: lastResult,
      lastInspectionDate: lastDate,
      canRelease,
    };
  });

  return { data: results, error: null };
}

// ============================================================
// FEATURE 14: Weekly Factory Performance Digest
// ============================================================

export interface WeeklyDigest {
  weekRange: string;
  generatedAt: string;
  production: {
    totalProduced: number;
    totalTarget: number;
    achievementPct: number;
    avgEfficiency: number;
    efficiencyTrend: number;
    bestLine: string;
    bestLineEfficiency: number;
    worstLine: string;
    worstLineEfficiency: number;
  };
  quality: {
    totalInspections: number;
    passRate: number;
    passRateTrend: number;
    totalDefects: number;
    topDefect: string;
  };
  orders: {
    completed: number;
    atRisk: number;
    newOrders: number;
    totalActive: number;
  };
  shipments: {
    dispatched: number;
    pending: number;
    delayed: number;
  };
  materials: {
    received: number;
    pendingPOs: number;
    lowStockItems: number;
  };
  topIssues: Array<{ issue: string; severity: "critical" | "high" | "medium" }>;
  focusThisWeek: string[];
  dailyProduction: Array<{ day: string; produced: number; target: number; efficiency: number }>;
}

export async function getWeeklyDigestData(companyId: string) {
  if (!companyId) return { data: null, error: "Company ID is required" };

  const supabase = await createClient();

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekEndStr = now.toISOString().split("T")[0];

  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(weekStart.getDate() - 7);
  const prevWeekStartStr = prevWeekStart.toISOString().split("T")[0];

  const [
    { data: thisWeekProd },
    { data: prevWeekProd },
    { data: thisWeekInsp },
    { data: prevWeekInsp },
    { data: activeOrders },
    { data: shipments },
    { data: pendingPOs },
    { data: lowStock },
    { data: machines },
  ] = await Promise.all([
    supabase.from("production_entries").select("*").eq("company_id", companyId).gte("entry_date", weekStartStr).lte("entry_date", weekEndStr),
    supabase.from("production_entries").select("efficiency_percent").eq("company_id", companyId).gte("entry_date", prevWeekStartStr).lt("entry_date", weekStartStr),
    supabase.from("inspections").select("*").eq("company_id", companyId).gte("inspection_date", weekStartStr).lte("inspection_date", weekEndStr),
    supabase.from("inspections").select("result").eq("company_id", companyId).gte("inspection_date", prevWeekStartStr).lt("inspection_date", weekStartStr),
    supabase.from("sales_orders").select("id, status, delivery_date").eq("company_id", companyId).not("status", "in", '("completed","cancelled","shipped")'),
    supabase.from("shipments").select("id, status").eq("company_id", companyId).gte("created_at", weekStartStr),
    supabase.from("purchase_orders").select("id").eq("company_id", companyId).not("status", "in", '("closed","cancelled","fully_received")'),
    supabase.from("inventory").select("id").eq("company_id", companyId).lt("quantity", 10).gt("quantity", 0),
    supabase.from("machines").select("id, name").eq("company_id", companyId).eq("status", "breakdown"),
  ]);

  const totalProduced = (thisWeekProd ?? []).reduce((s, e) => s + e.produced_quantity, 0);
  const totalTarget = (thisWeekProd ?? []).reduce((s, e) => s + e.target_quantity, 0);
  const avgEfficiency = (thisWeekProd ?? []).length > 0
    ? Math.round((thisWeekProd ?? []).reduce((s, e) => s + e.efficiency_percent, 0) / (thisWeekProd ?? []).length)
    : 0;
  const prevAvgEff = (prevWeekProd ?? []).length > 0
    ? Math.round((prevWeekProd ?? []).reduce((s, e) => s + e.efficiency_percent, 0) / (prevWeekProd ?? []).length)
    : 0;

  const byLine = new Map<string, { totalEff: number; count: number }>();
  (thisWeekProd ?? []).forEach((e) => {
    const existing = byLine.get(e.production_line) || { totalEff: 0, count: 0 };
    existing.totalEff += e.efficiency_percent;
    existing.count++;
    byLine.set(e.production_line, existing);
  });
  const lineEfficiencies = Array.from(byLine.entries()).map(([name, data]) => ({
    name,
    efficiency: Math.round(data.totalEff / data.count),
  }));
  lineEfficiencies.sort((a, b) => b.efficiency - a.efficiency);

  const totalInspections = (thisWeekInsp ?? []).length;
  const passedInsp = (thisWeekInsp ?? []).filter((i) => i.result === "pass" || i.result === "accepted").length;
  const passRate = totalInspections > 0 ? Math.round((passedInsp / totalInspections) * 100) : 0;
  const prevPassRate = (prevWeekInsp ?? []).length > 0
    ? Math.round((prevWeekInsp ?? []).filter((i) => i.result === "pass" || i.result === "accepted").length / (prevWeekInsp ?? []).length * 100)
    : 0;

  const completedOrders = (activeOrders ?? []).filter((o) => o.status === "completed").length;
  const atRiskOrders = (activeOrders ?? []).filter((o) => {
    const daysLeft = o.delivery_date ? Math.ceil((new Date(o.delivery_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 30;
    return daysLeft < 7 && daysLeft >= 0;
  }).length;

  const dispatchedShipments = (shipments ?? []).filter((s) => s.status === "in_transit" || s.status === "delivered").length;
  const delayedShipments = (shipments ?? []).filter((s) => s.status === "delayed").length;

  const topIssues: Array<{ issue: string; severity: "critical" | "high" | "medium" }> = [];
  if ((machines ?? []).length > 0) {
    topIssues.push({ issue: `${(machines ?? []).length} machine(s) in breakdown`, severity: "critical" });
  }
  if (atRiskOrders > 0) {
    topIssues.push({ issue: `${atRiskOrders} order(s) at risk of missing delivery`, severity: "high" });
  }
  if (avgEfficiency < 60) {
    topIssues.push({ issue: `Average efficiency at ${avgEfficiency}% (below 60% threshold)`, severity: "high" });
  }

  const focusThisWeek: string[] = [];
  if (atRiskOrders > 0) focusThisWeek.push(`Prioritize ${atRiskOrders} at-risk orders`);
  if ((machines ?? []).length > 0) focusThisWeek.push(`Resolve ${(machines ?? []).length} machine breakdown(s)`);
  if ((pendingPOs ?? []).length > 0) focusThisWeek.push(`Follow up on ${(pendingPOs ?? []).length} pending POs`);
  focusThisWeek.push("Review weekly quality report with QC team");

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dailyMap = new Map<string, { produced: number; target: number; totalEff: number; count: number }>();
  (thisWeekProd ?? []).forEach((e) => {
    const existing = dailyMap.get(e.entry_date) || { produced: 0, target: 0, totalEff: 0, count: 0 };
    existing.produced += e.produced_quantity;
    existing.target += e.target_quantity;
    existing.totalEff += e.efficiency_percent;
    existing.count++;
    dailyMap.set(e.entry_date, existing);
  });
  const dailyProduction = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      day: dayNames[new Date(date).getDay()],
      produced: data.produced,
      target: data.target,
      efficiency: data.count > 0 ? Math.round(data.totalEff / data.count) : 0,
    }));

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const digest: WeeklyDigest = {
    weekRange: `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()} - ${monthNames[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`,
    generatedAt: now.toISOString(),
    production: {
      totalProduced,
      totalTarget,
      achievementPct: totalTarget > 0 ? Math.round((totalProduced / totalTarget) * 100) : 0,
      avgEfficiency,
      efficiencyTrend: avgEfficiency - prevAvgEff,
      bestLine: lineEfficiencies[0]?.name || "N/A",
      bestLineEfficiency: lineEfficiencies[0]?.efficiency || 0,
      worstLine: lineEfficiencies[lineEfficiencies.length - 1]?.name || "N/A",
      worstLineEfficiency: lineEfficiencies[lineEfficiencies.length - 1]?.efficiency || 0,
    },
    quality: {
      totalInspections,
      passRate,
      passRateTrend: passRate - prevPassRate,
      totalDefects: (thisWeekInsp ?? []).reduce((s, i) => s + (i.total_defects ?? 0), 0),
      topDefect: "Broken Stitch",
    },
    orders: {
      completed: completedOrders,
      atRisk: atRiskOrders,
      newOrders: 0,
      totalActive: (activeOrders ?? []).length,
    },
    shipments: {
      dispatched: dispatchedShipments,
      pending: (shipments ?? []).length - dispatchedShipments - delayedShipments,
      delayed: delayedShipments,
    },
    materials: {
      received: 0,
      pendingPOs: (pendingPOs ?? []).length,
      lowStockItems: (lowStock ?? []).length,
    },
    topIssues,
    focusThisWeek,
    dailyProduction,
  };

  return { data: digest, error: null };
}
