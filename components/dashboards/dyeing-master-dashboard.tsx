"use client";

import * as React from "react";
import {
  Beaker,
  Palette,
  TrendingDown,
  Droplets,
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
    active_batches: 6,
    pending_shade_approval: 4,
    avg_process_loss: 3.8,
    pending_lab_dips: 9,
  },
  process_loss_trend: [
    { day: "Mon", loss: 4.2 },
    { day: "Tue", loss: 3.9 },
    { day: "Wed", loss: 4.5 },
    { day: "Thu", loss: 3.6 },
    { day: "Fri", loss: 3.2 },
    { day: "Sat", loss: 3.8 },
    { day: "Sun", loss: 4.0 },
  ],
  chemical_consumption: [
    { name: "Reactive Dyes", consumed: 145 },
    { name: "Salt", consumed: 320 },
    { name: "Soda Ash", consumed: 180 },
    { name: "Softener", consumed: 95 },
    { name: "Fixing Agent", consumed: 60 },
    { name: "Leveling Agent", consumed: 42 },
  ],
  lab_dips_pending: [
    { id: "1", lab_dip: "LD-2026-0045", buyer: "H&M Group", color: "Navy Blue #2245", submitted: "2026-02-22", status: "submitted" },
    { id: "2", lab_dip: "LD-2026-0046", buyer: "Zara", color: "Olive Green #3312", submitted: "2026-02-23", status: "submitted" },
    { id: "3", lab_dip: "LD-2026-0047", buyer: "Next PLC", color: "Burgundy #1105", submitted: "2026-02-24", status: "in_progress" },
    { id: "4", lab_dip: "LD-2026-0048", buyer: "Primark", color: "Charcoal #0890", submitted: "2026-02-25", status: "in_progress" },
  ],
  batches_in_process: [
    { id: "1", batch: "BT-2026-0445", order: "SO-2026-0045", color: "Navy Blue", stage: "Dyeing", started: "2026-02-25", progress: 65 },
    { id: "2", batch: "BT-2026-0446", order: "SO-2026-0048", color: "Black", stage: "Washing", started: "2026-02-24", progress: 80 },
    { id: "3", batch: "BT-2026-0447", order: "SO-2026-0050", color: "White", stage: "Bleaching", started: "2026-02-26", progress: 30 },
    { id: "4", batch: "BT-2026-0448", order: "SO-2026-0051", color: "Olive", stage: "Dyeing", started: "2026-02-26", progress: 15 },
    { id: "5", batch: "BT-2026-0449", order: "SO-2026-0052", color: "Khaki", stage: "Finishing", started: "2026-02-23", progress: 90 },
    { id: "6", batch: "BT-2026-0450", order: "SO-2026-0053", color: "Grey", stage: "QC", started: "2026-02-22", progress: 95 },
  ],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface DyeingMasterDashboardProps {
  companyId: string;
}

export function DyeingMasterDashboard({ companyId }: DyeingMasterDashboardProps) {
  const [data, setData] = React.useState(DEMO_DATA);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();

        const [batchesResult, labDipsResult] = await Promise.all([
          supabase
            .from("dyeing_batches")
            .select("id, batch_number, status, process_loss_percent")
            .eq("company_id", companyId)
            .in("status", ["in_progress", "planned"]),
          supabase
            .from("lab_dips")
            .select("id, lab_dip_number, status, color_name, buyers(name)")
            .eq("company_id", companyId)
            .not("status", "in", '("approved","rejected","cancelled")'),
        ]);

        const batches = batchesResult.data ?? [];
        const labDips = labDipsResult.data ?? [];

        if (batches.length === 0 && labDips.length === 0) {
          setLoading(false);
          return;
        }

        const activeBatches = batches.filter((b) => b.status === "in_progress");
        const avgLoss = activeBatches.length > 0
          ? parseFloat(
              (activeBatches.reduce((s, b) => s + (b.process_loss_percent ?? 0), 0) / activeBatches.length).toFixed(1)
            )
          : 0;

        const pendingLabDips = labDips.filter((l) =>
          ["pending", "in_progress", "submitted"].includes(l.status)
        );

        setData((prev) => ({
          ...prev,
          metrics: {
            active_batches: activeBatches.length || prev.metrics.active_batches,
            pending_shade_approval: prev.metrics.pending_shade_approval,
            avg_process_loss: avgLoss || prev.metrics.avg_process_loss,
            pending_lab_dips: pendingLabDips.length || prev.metrics.pending_lab_dips,
          },
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
          title="Active Batches"
          value={data.metrics.active_batches}
          icon={<Beaker className="h-5 w-5" />}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Pending Shade Approval"
          value={data.metrics.pending_shade_approval}
          icon={<Palette className="h-5 w-5" />}
          color="orange"
          loading={loading}
        />
        <StatCard
          title="Avg Process Loss"
          value={`${data.metrics.avg_process_loss}%`}
          icon={<TrendingDown className="h-5 w-5" />}
          color={data.metrics.avg_process_loss > 5 ? "red" : data.metrics.avg_process_loss > 3 ? "orange" : "green"}
          loading={loading}
        />
        <StatCard
          title="Pending Lab Dips"
          value={data.metrics.pending_lab_dips}
          icon={<Droplets className="h-5 w-5" />}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Row 2: Process Loss Trend + Chemical Consumption */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <LineChartCard
              title="Process Loss Trend"
              data={data.process_loss_trend}
              dataKeys={["loss"]}
              xAxisKey="day"
              colors={["#dc2626"]}
              formatYAxis={(v) => `${v}%`}
              formatTooltipValue={(v) => `${v}%`}
              height={280}
            />
            <BarChartCard
              title="Chemical Consumption (kg)"
              data={data.chemical_consumption}
              dataKeys={["consumed"]}
              xAxisKey="name"
              colors={["#9333ea"]}
              horizontal
              height={280}
            />
          </>
        )}
      </div>

      {/* Row 3: Lab Dips Awaiting Approval + Batches In Process */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900">
              Lab Dips Awaiting Approval
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
                      <th className="pb-2 text-left font-medium text-gray-500">Lab Dip #</th>
                      <th className="pb-2 text-left font-medium text-gray-500">Buyer</th>
                      <th className="pb-2 text-left font-medium text-gray-500">Color</th>
                      <th className="pb-2 text-right font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.lab_dips_pending.map((ld) => (
                      <tr key={ld.id} className="hover:bg-gray-50">
                        <td className="py-2.5 font-medium text-gray-900">{ld.lab_dip}</td>
                        <td className="py-2.5 text-gray-600">{ld.buyer}</td>
                        <td className="py-2.5 text-gray-600">{ld.color}</td>
                        <td className="py-2.5 text-right">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                              ld.status === "submitted"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                            )}
                          >
                            {ld.status === "submitted" ? "Submitted" : "In Progress"}
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
              Batches In Process
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 rounded bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {data.batches_in_process.map((batch) => (
                  <div
                    key={batch.id}
                    className="rounded-lg border border-gray-100 px-4 py-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-sm font-semibold text-gray-900">{batch.batch}</span>
                        <span className="ml-2 text-xs text-gray-500">{batch.order}</span>
                      </div>
                      <span className="text-xs font-medium text-gray-600">{batch.stage}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                      <span>{batch.color}</span>
                      <span className="tabular-nums">{batch.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100">
                      <div
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          batch.progress >= 80
                            ? "bg-green-500"
                            : batch.progress >= 50
                              ? "bg-blue-500"
                              : "bg-orange-400"
                        )}
                        style={{ width: `${batch.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
