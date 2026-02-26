"use server";

import { createClient } from "@/lib/supabase/server";

export async function getFactoryOwnerDashboard(companyId: string) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];
  const today = now.toISOString().split("T")[0];
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [
    ordersResult,
    productionResult,
    inspectionsResult,
    shipmentsResult,
    recentActivityResult,
  ] = await Promise.all([
    supabase
      .from("sales_orders")
      .select("id, order_number, product_name, total_value, status, delivery_date, buyer_id, buyers(id, name)")
      .eq("company_id", companyId),
    supabase
      .from("production_entries")
      .select("efficiency_percent, entry_date")
      .eq("company_id", companyId)
      .gte("entry_date", startOfMonth)
      .lte("entry_date", endOfMonth),
    supabase
      .from("inspections")
      .select("result")
      .eq("company_id", companyId)
      .gte("inspection_date", startOfMonth)
      .lte("inspection_date", endOfMonth),
    supabase
      .from("shipments")
      .select("id, shipment_number, planned_shipment_date, status")
      .eq("company_id", companyId)
      .gte("planned_shipment_date", today)
      .lte("planned_shipment_date", sevenDaysLater),
    supabase
      .from("audit_logs")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const allOrders = ordersResult.data ?? [];

  // Monthly revenue (orders closed/shipped this month)
  const monthlyRevenue = allOrders
    .filter((o) =>
      ["shipped", "invoiced", "closed"].includes(o.status) &&
      o.delivery_date >= startOfMonth &&
      o.delivery_date <= endOfMonth
    )
    .reduce((sum, o) => sum + (o.total_value ?? 0), 0);

  // Active orders
  const activeOrders = allOrders.filter((o) =>
    ["confirmed", "in_production", "qc", "ready_to_ship"].includes(o.status)
  ).length;

  // Orders shipping this week
  const ordersShippingThisWeek = (shipmentsResult.data ?? []).length;

  // Average efficiency
  const prodEntries = productionResult.data ?? [];
  const avgEfficiency =
    prodEntries.length > 0
      ? Math.round(
          prodEntries.reduce((sum, e) => sum + e.efficiency_percent, 0) /
            prodEntries.length
        )
      : 0;

  // Quality pass rate
  const inspections = inspectionsResult.data ?? [];
  const passRate =
    inspections.length > 0
      ? Math.round(
          (inspections.filter((i) => i.result === "pass").length /
            inspections.length) *
            100
        )
      : 0;

  // 12-month revenue chart
  const revenueChart: { month: string; revenue: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = d.toISOString().split("T")[0];
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];
    const monthLabel = d.toLocaleString("default", {
      month: "short",
      year: "2-digit",
    });

    const monthRevenue = allOrders
      .filter(
        (o) =>
          ["shipped", "invoiced", "closed"].includes(o.status) &&
          o.delivery_date >= monthStart &&
          o.delivery_date <= monthEnd
      )
      .reduce((sum, o) => sum + (o.total_value ?? 0), 0);

    revenueChart.push({ month: monthLabel, revenue: monthRevenue });
  }

  // Orders by status
  const statusCounts = allOrders.reduce(
    (acc: Record<string, number>, order) => {
      acc[order.status] = (acc[order.status] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const ordersByStatus = Object.entries(statusCounts).map(
    ([status, count]) => ({ status, count })
  );

  // Top 5 buyers by order value
  const buyerTotals = allOrders.reduce(
    (acc: Record<string, { name: string; value: number; orders: number }>, order) => {
      const buyerId = order.buyer_id;
      const buyerName =
        (order.buyers as { name?: string } | null)?.name ?? "Unknown";
      if (!acc[buyerId]) {
        acc[buyerId] = { name: buyerName, value: 0, orders: 0 };
      }
      acc[buyerId].value += order.total_value ?? 0;
      acc[buyerId].orders += 1;
      return acc;
    },
    {}
  );

  const topBuyers = Object.entries(buyerTotals)
    .map(([id, data]) => ({ buyer_id: id, ...data }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return {
    data: {
      metrics: {
        monthly_revenue: monthlyRevenue,
        active_orders: activeOrders,
        orders_shipping_this_week: ordersShippingThisWeek,
        avg_efficiency: avgEfficiency,
        quality_pass_rate: passRate,
      },
      revenue_chart: revenueChart,
      orders_by_status: ordersByStatus,
      top_buyers: topBuyers,
      recent_activity: recentActivityResult.data ?? [],
    },
    error: null,
  };
}

export async function getProductionManagerDashboard(companyId: string) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const today = new Date().toISOString().split("T")[0];

  const [linesResult, todayEntriesResult, workOrdersResult, overdueResult] =
    await Promise.all([
      supabase
        .from("production_lines")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true),
      supabase
        .from("production_entries")
        .select("*")
        .eq("company_id", companyId)
        .eq("entry_date", today),
      supabase
        .from("work_orders")
        .select("id, wo_number, product_name, total_quantity, good_output, status, planned_end_date")
        .eq("company_id", companyId)
        .in("status", ["in_progress", "planned"]),
      supabase
        .from("work_orders")
        .select("id, wo_number, product_name, planned_end_date")
        .eq("company_id", companyId)
        .eq("status", "in_progress")
        .lt("planned_end_date", today),
    ]);

  const lines = linesResult.data ?? [];
  const todayEntries = todayEntriesResult.data ?? [];

  const lineStats = lines.map((line) => {
    const entries = todayEntries.filter(
      (e) => e.production_line === line.name
    );
    return {
      line_id: line.id,
      line_name: line.name,
      department: line.department,
      today_produced: entries.reduce((sum, e) => sum + e.produced_quantity, 0),
      today_target: entries.reduce((sum, e) => sum + e.target_quantity, 0),
      efficiency:
        entries.length > 0
          ? Math.round(
              entries.reduce((sum, e) => sum + e.efficiency_percent, 0) /
                entries.length
            )
          : 0,
    };
  });

  const totalProducedToday = todayEntries.reduce(
    (sum, e) => sum + e.produced_quantity,
    0
  );
  const totalTargetToday = todayEntries.reduce(
    (sum, e) => sum + e.target_quantity,
    0
  );

  return {
    data: {
      metrics: {
        total_lines: lines.length,
        active_work_orders: workOrdersResult.data?.length ?? 0,
        overdue_work_orders: overdueResult.data?.length ?? 0,
        today_total_produced: totalProducedToday,
        today_total_target: totalTargetToday,
        today_achievement_rate:
          totalTargetToday > 0
            ? Math.round((totalProducedToday / totalTargetToday) * 100)
            : 0,
      },
      line_stats: lineStats,
      active_work_orders: workOrdersResult.data ?? [],
      overdue_work_orders: overdueResult.data ?? [],
    },
    error: null,
  };
}

export async function getMerchandiserDashboard(companyId: string) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const today = new Date().toISOString().split("T")[0];

  const [inquiriesResult, samplesResult, ordersResult, overdueResult] =
    await Promise.all([
      supabase
        .from("inquiries")
        .select("id, status, created_at")
        .eq("company_id", companyId)
        .not("status", "eq", "converted"),
      supabase
        .from("samples")
        .select("id, sample_type, status, required_date")
        .eq("company_id", companyId)
        .not("status", "in", '("approved","rejected","cancelled")'),
      supabase
        .from("sales_orders")
        .select("id, order_number, product_name, delivery_date, status")
        .eq("company_id", companyId)
        .in("status", ["confirmed", "in_production"])
        .order("delivery_date"),
      supabase
        .from("tna_milestones")
        .select("id, milestone_name, planned_date, order_id, delay_days")
        .lt("planned_date", today)
        .eq("status", "pending")
        .order("planned_date"),
    ]);

  // Inquiry pipeline by status
  const inquiries = inquiriesResult.data ?? [];
  const inquiryByStatus = inquiries.reduce(
    (acc: Record<string, number>, inq) => {
      acc[inq.status] = (acc[inq.status] ?? 0) + 1;
      return acc;
    },
    {}
  );

  // Samples pending
  const pendingSamples = (samplesResult.data ?? []).filter((s) =>
    ["pending", "in_progress", "submitted"].includes(s.status)
  );

  return {
    data: {
      inquiry_pipeline: {
        total: inquiries.length,
        by_status: inquiryByStatus,
      },
      samples: {
        pending: pendingSamples.length,
        list: pendingSamples,
      },
      active_orders: ordersResult.data ?? [],
      overdue_milestones: overdueResult.data ?? [],
    },
    error: null,
  };
}

export async function getPurchaseManagerDashboard(companyId: string) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const today = new Date().toISOString().split("T")[0];
  const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [pendingPOsResult, approvedPOsResult, upcomingDeliveriesResult, pendingGRNsResult] =
    await Promise.all([
      supabase
        .from("purchase_orders")
        .select("id, po_number, supplier_id, total_amount, created_at, suppliers(name)")
        .eq("company_id", companyId)
        .eq("status", "pending_approval"),
      supabase
        .from("purchase_orders")
        .select("id, po_number, total_amount, status")
        .eq("company_id", companyId)
        .in("status", ["approved", "ordered", "partial"]),
      supabase
        .from("purchase_orders")
        .select("id, po_number, supplier_id, expected_delivery_date, total_amount, suppliers(name)")
        .eq("company_id", companyId)
        .in("status", ["approved", "ordered", "partial"])
        .gte("expected_delivery_date", today)
        .lte("expected_delivery_date", sevenDaysLater),
      supabase
        .from("grns")
        .select("id, grn_number, received_date, status")
        .eq("company_id", companyId)
        .eq("status", "received"),
    ]);

  const openPOs = approvedPOsResult.data ?? [];
  const totalOpenPOValue = openPOs.reduce(
    (sum, po) => sum + (po.total_amount ?? 0),
    0
  );

  return {
    data: {
      metrics: {
        pending_approvals: pendingPOsResult.data?.length ?? 0,
        open_pos: openPOs.length,
        open_po_value: totalOpenPOValue,
        deliveries_this_week: upcomingDeliveriesResult.data?.length ?? 0,
        grns_pending_qc: pendingGRNsResult.data?.length ?? 0,
      },
      pending_approvals: pendingPOsResult.data ?? [],
      upcoming_deliveries: upcomingDeliveriesResult.data ?? [],
      grns_pending_qc: pendingGRNsResult.data ?? [],
    },
    error: null,
  };
}

export async function getStoreManagerDashboard(companyId: string) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const [inventoryResult, quarantineResult, lowStockResult] =
    await Promise.all([
      supabase
        .from("inventory")
        .select("item_type, quantity, rate, status")
        .eq("company_id", companyId)
        .in("status", ["available", "approved"]),
      supabase
        .from("inventory")
        .select("id, item_name, item_type, quantity, uom")
        .eq("company_id", companyId)
        .eq("status", "quarantine"),
      supabase
        .from("inventory")
        .select("id, item_name, item_type, quantity, reorder_level, uom")
        .eq("company_id", companyId)
        .not("reorder_level", "is", null)
        .in("status", ["available", "approved"]),
    ]);

  // Calculate stock value
  const stockItems = inventoryResult.data ?? [];
  const stockValue = stockItems.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  );

  const stockByCategory = stockItems.reduce(
    (acc: Record<string, { quantity: number; value: number }>, item) => {
      if (!acc[item.item_type]) {
        acc[item.item_type] = { quantity: 0, value: 0 };
      }
      acc[item.item_type].quantity += item.quantity;
      acc[item.item_type].value += item.quantity * item.rate;
      return acc;
    },
    {}
  );

  // Low stock
  const lowStock = (lowStockResult.data ?? []).filter(
    (item) => item.reorder_level !== null && item.quantity <= item.reorder_level
  );

  return {
    data: {
      metrics: {
        total_stock_value: stockValue,
        quarantine_items: quarantineResult.data?.length ?? 0,
        low_stock_items: lowStock.length,
        total_sku_count: stockItems.length,
      },
      stock_by_category: Object.entries(stockByCategory).map(
        ([type, data]) => ({ item_type: type, ...data })
      ),
      quarantine_items: quarantineResult.data ?? [],
      low_stock_items: lowStock,
    },
    error: null,
  };
}

export async function getQualityManagerDashboard(companyId: string) {
  const supabase = await createClient();

  if (!companyId) {
    return { data: null, error: "Company ID is required" };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const today = now.toISOString().split("T")[0];

  const [inspectionsResult, capasResult, recentDefectsResult] =
    await Promise.all([
      supabase
        .from("inspections")
        .select("id, result, inspection_date, inspection_type, total_defects")
        .eq("company_id", companyId)
        .gte("inspection_date", startOfMonth),
      supabase
        .from("capas")
        .select("id, capa_number, status, due_date, defect_description")
        .eq("company_id", companyId)
        .not("status", "in", '("closed")'),
      supabase
        .from("inspection_defects")
        .select("defect_type, severity, quantity, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  const inspections = inspectionsResult.data ?? [];
  const passed = inspections.filter((i) => i.result === "pass").length;
  const failed = inspections.filter((i) => i.result === "fail").length;
  const passRate =
    inspections.length > 0
      ? Math.round((passed / inspections.length) * 100)
      : 0;

  const totalDefects = inspections.reduce(
    (sum, i) => sum + (i.total_defects ?? 0),
    0
  );

  const capas = capasResult.data ?? [];
  const overdueCAPAs = capas.filter(
    (c) => c.due_date && c.due_date < today && c.status !== "closed"
  );

  const capaByStatus = capas.reduce(
    (acc: Record<string, number>, capa) => {
      acc[capa.status] = (acc[capa.status] ?? 0) + 1;
      return acc;
    },
    {}
  );

  // Top defect types
  const defects = recentDefectsResult.data ?? [];
  const defectTypeCounts = defects.reduce(
    (acc: Record<string, number>, d) => {
      acc[d.defect_type] = (acc[d.defect_type] ?? 0) + d.quantity;
      return acc;
    },
    {}
  );
  const topDefects = Object.entries(defectTypeCounts)
    .map(([type, count]) => ({ defect_type: type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    data: {
      metrics: {
        inspections_this_month: inspections.length,
        pass_rate: passRate,
        passed,
        failed,
        total_defects: totalDefects,
        open_capas: capas.length,
        overdue_capas: overdueCAPAs.length,
      },
      capa_by_status: capaByStatus,
      top_defects: topDefects,
      overdue_capas: overdueCAPAs,
    },
    error: null,
  };
}
