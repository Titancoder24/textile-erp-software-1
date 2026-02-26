"use client";

import * as React from "react";
import {
  ClipboardCheck,
  AlertTriangle,
  BarChart3,
  Search,
} from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChartCard } from "@/components/charts/line-chart-card";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { StatCardSkeleton } from "@/components/ui/loading-skeleton";
import { cn, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_DATA = {
  metrics: {
    inspections_today: 12,
    pass_percent: 83,
    open_capas: 8,
    defect_rate: 3.2,
    pending_fabric_inspections: 4,
  },
  defect_trend: [
    { day: "27 Jan", rate: 4.1 },
    { day: "29 Jan", rate: 3.8 },
    { day: "31 Jan", rate: 4.5 },
    { day: "02 Feb", rate: 3.9 },
    { day: "04 Feb", rate: 3.2 },
    { day: "06 Feb", rate: 3.5 },
    { day: "08 Feb", rate: 2.8 },
    { day: "10 Feb", rate: 3.0 },
    { day: "12 Feb", rate: 3.4 },
    { day: "14 Feb", rate: 2.9 },
    { day: "16 Feb", rate: 3.1 },
    { day: "18 Feb", rate: 2.7 },
    { day: "20 Feb", rate: 3.3 },
    { day: "22 Feb", rate: 2.5 },
    { day: "24 Feb", rate: 3.2 },
    { day: "26 Feb", rate: 2.8 },
  ],
  top_defects: [
    { name: "Broken Stitch", count: 45 },
    { name: "Oil Stain", count: 32 },
    { name: "Skip Stitch", count: 28 },
    { name: "Fabric Defect", count: 22 },
    { name: "Shade Variation", count: 18 },
    { name: "Puckering", count: 15 },
    { name: "Open Seam", count: 12 },
    { name: "Raw Edge", count: 10 },
    { name: "Uneven Hem", count: 8 },
    { name: "Button Missing", count: 5 },
  ],
  failed_inspections: [
    { id: "1", inspection_id: "INS-0338", order: "SO-2026-0045", type: "Inline", date: "2026-02-24", defects: 12 },
    { id: "2", inspection_id: "INS-0340", order: "SO-2026-0048", type: "End-Line", date: "2026-02-25", defects: 8 },
    { id: "3", inspection_id: "INS-0341", order: "SO-2026-0050", type: "Final", date: "2026-02-25", defects: 15 },
    { id: "4", inspection_id: "INS-0343", order: "SO-2026-0051", type: "Inline", date: "2026-02-26", defects: 6 },
  ],
  overdue_capas: [
    { id: "1", capa_number: "CAPA-0023", description: "Recurring broken stitch on Line 2", due_date: "2026-02-20", status: "open" },
    { id: "2", capa_number: "CAPA-0025", description: "Shade variation in dye lot BT-445", due_date: "2026-02-18", status: "in_progress" },
    { id: "3", capa_number: "CAPA-0026", description: "Oil stain from machine #12", due_date: "2026-02-22", status: "open" },
  ],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface QualityManagerDashboardProps {
  companyId: string;
}

export function QualityManagerDashboard({ companyId }: QualityManagerDashboardProps) {
  const [data, setData] = React.useState(DEMO_DATA);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
        const today = now.toISOString().split("T")[0];

        const [inspectionsResult, capasResult, defectsResult] = await Promise.all([
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
            .select("defect_type, quantity")
            .order("created_at", { ascending: false })
            .limit(100),
        ]);

        const inspections = inspectionsResult.data ?? [];
        const capas = capasResult.data ?? [];

        if (inspections.length === 0 && capas.length === 0) {
          setLoading(false);
          return;
        }

        const todayInspections = inspections.filter((i) => i.inspection_date === today);
        const passed = todayInspections.filter((i) => i.result === "pass").length;
        const passPct = todayInspections.length > 0 ? Math.round((passed / todayInspections.length) * 100) : 0;

        const totalDefects = inspections.reduce((s, i) => s + (i.total_defects ?? 0), 0);
        const defectRate = inspections.length > 0 ? parseFloat(((totalDefects / inspections.length) * 0.8).toFixed(1)) : 0;

        const overdueCAPAs = capas.filter((c) => c.due_date && c.due_date < today);

        // Top defects
        const defects = defectsResult.data ?? [];
        const defectCounts: Record<string, number> = {};
        for (const d of defects) {
          defectCounts[d.defect_type] = (defectCounts[d.defect_type] ?? 0) + d.quantity;
        }
        const topDefects = Object.entries(defectCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setData((prev) => ({
          metrics: {
            inspections_today: todayInspections.length || prev.metrics.inspections_today,
            pass_percent: passPct || prev.metrics.pass_percent,
            open_capas: capas.length || prev.metrics.open_capas,
            defect_rate: defectRate || prev.metrics.defect_rate,
            pending_fabric_inspections: prev.metrics.pending_fabric_inspections,
          },
          defect_trend: prev.defect_trend,
          top_defects: topDefects.length > 0 ? topDefects : prev.top_defects,
          failed_inspections: prev.failed_inspections,
          overdue_capas:
            overdueCAPAs.length > 0
              ? overdueCAPAs.map((c) => ({
                  id: c.id,
                  capa_number: c.capa_number,
                  description: c.defect_description ?? "--",
                  due_date: c.due_date ?? "--",
                  status: c.status,
                }))
              : prev.overdue_capas,
        }));
      } catch {
        // Keep demo data
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [companyId]);

  return (
    <div className="space-y-6">
      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Inspections Today"
          value={`${data.metrics.inspections_today} (${data.metrics.pass_percent}% pass)`}
          icon={<ClipboardCheck className="h-5 w-5" />}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Open CAPAs"
          value={data.metrics.open_capas}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="orange"
          loading={loading}
        />
        <StatCard
          title="Defect Rate"
          value={`${data.metrics.defect_rate}%`}
          icon={<BarChart3 className="h-5 w-5" />}
          color={data.metrics.defect_rate > 4 ? "red" : data.metrics.defect_rate > 2 ? "orange" : "green"}
          loading={loading}
        />
        <StatCard
          title="Pending Fabric Inspections"
          value={data.metrics.pending_fabric_inspections}
          icon={<Search className="h-5 w-5" />}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Row 2: Defect Trend + Top 10 Defects (Pareto) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <LineChartCard
              title="Defect Rate Trend (30 Days)"
              data={data.defect_trend}
              dataKeys={["rate"]}
              xAxisKey="day"
              colors={["#dc2626"]}
              formatYAxis={(v) => `${v}%`}
              formatTooltipValue={(v) => `${v}%`}
              height={280}
            />
            <BarChartCard
              title="Top 10 Defects (Pareto)"
              data={data.top_defects}
              dataKeys={["count"]}
              xAxisKey="name"
              colors={["#ea580c"]}
              horizontal
              height={320}
            />
          </>
        )}
      </div>

      {/* Row 3: Failed Inspections + Overdue CAPAs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900">
              Failed Inspections This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 rounded bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-2 text-left font-medium text-gray-500">ID</th>
                      <th className="pb-2 text-left font-medium text-gray-500">Order</th>
                      <th className="pb-2 text-left font-medium text-gray-500">Type</th>
                      <th className="pb-2 text-right font-medium text-gray-500">Defects</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.failed_inspections.map((insp) => (
                      <tr key={insp.id} className="hover:bg-gray-50">
                        <td className="py-2.5 font-medium text-gray-900">{insp.inspection_id}</td>
                        <td className="py-2.5 text-gray-600">{insp.order}</td>
                        <td className="py-2.5 text-gray-600">{insp.type}</td>
                        <td className="py-2.5 text-right">
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                            {insp.defects}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900">
              Overdue CAPAs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 rounded bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-2 text-left font-medium text-gray-500">CAPA #</th>
                      <th className="pb-2 text-left font-medium text-gray-500">Description</th>
                      <th className="pb-2 text-right font-medium text-gray-500">Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.overdue_capas.map((capa) => (
                      <tr key={capa.id} className="hover:bg-gray-50">
                        <td className="py-2.5 font-medium text-gray-900">{capa.capa_number}</td>
                        <td className="py-2.5 text-gray-600 max-w-[200px] truncate">{capa.description}</td>
                        <td className="py-2.5 text-right text-red-600 tabular-nums">
                          {capa.due_date !== "--" ? formatDate(capa.due_date) : "--"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
