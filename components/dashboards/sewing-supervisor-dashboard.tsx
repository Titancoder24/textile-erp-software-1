"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  Activity,
  Target,
  TrendingUp,
  AlertTriangle,
  Users,
  Scissors,
  Clock,
  Zap,
} from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* ---------- Demo Data ---------- */

interface LineData {
  line: string;
  style: string;
  target: number;
  output: number;
  efficiency: number;
  defects: number;
  status: "running" | "idle" | "breakdown";
}

const LINE_DATA: LineData[] = [
  { line: "Line 1", style: "ST-4421 Polo T-shirt", target: 500, output: 420, efficiency: 78, defects: 14, status: "running" },
  { line: "Line 2", style: "ST-4398 Fleece Hoodie", target: 500, output: 310, efficiency: 62, defects: 28, status: "running" },
  { line: "Line 3", style: "ST-4421 Polo T-shirt", target: 600, output: 510, efficiency: 85, defects: 9, status: "running" },
  { line: "Line 4", style: "ST-4412 Woven Trouser", target: 400, output: 180, efficiency: 45, defects: 31, status: "running" },
  { line: "Line 5", style: "ST-4405 Jersey Dress", target: 500, output: 355, efficiency: 71, defects: 17, status: "running" },
  { line: "Line 6", style: "ST-4380 Cargo Shorts", target: 600, output: 480, efficiency: 80, defects: 11, status: "running" },
  { line: "Line 7", style: "--", target: 0, output: 0, efficiency: 0, defects: 0, status: "idle" },
  { line: "Line 8", style: "--", target: 0, output: 0, efficiency: 0, defects: 0, status: "idle" },
];

const HOURLY_OUTPUT = [
  { hour: "8AM", output: 320, target: 500 },
  { hour: "9AM", output: 480, target: 500 },
  { hour: "10AM", output: 510, target: 500 },
  { hour: "11AM", output: 490, target: 500 },
  { hour: "12PM", output: 380, target: 500 },
  { hour: "1PM", output: 290, target: 500 },
  { hour: "2PM", output: 520, target: 500 },
  { hour: "3PM", output: 540, target: 500 },
];

const BOTTLENECKS = [
  { operation: "Collar attach", line: "Line 2", avgMinutes: 4.8, smv: 2.1, backlog: 68 },
  { operation: "Hem stitch", line: "Line 4", avgMinutes: 3.9, smv: 1.8, backlog: 52 },
  { operation: "Side seam", line: "Line 1", avgMinutes: 3.2, smv: 1.5, backlog: 41 },
  { operation: "Label attach", line: "Line 6", avgMinutes: 2.8, smv: 1.2, backlog: 28 },
  { operation: "Sleeve set", line: "Line 5", avgMinutes: 2.5, smv: 1.3, backlog: 21 },
];

/* ---------- Helpers ---------- */

function efficiencyColor(eff: number): string {
  if (eff >= 75) return "text-green-700";
  if (eff >= 60) return "text-yellow-700";
  return "text-red-700";
}

function efficiencyBg(eff: number): string {
  if (eff >= 75) return "bg-green-100";
  if (eff >= 60) return "bg-yellow-100";
  return "bg-red-100";
}

function statusPill(status: LineData["status"]) {
  if (status === "running")
    return (
      <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
        Running
      </span>
    );
  if (status === "idle")
    return (
      <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
        Idle
      </span>
    );
  return (
    <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
      Breakdown
    </span>
  );
}

/* ---------- Component ---------- */

interface SewingSupervisorDashboardProps {
  data?: Record<string, unknown>;
}

export function SewingSupervisorDashboard(_props: SewingSupervisorDashboardProps) {
  const runningLines = LINE_DATA.filter((l) => l.status === "running").length;
  const todayTarget = LINE_DATA.reduce((s, l) => s + l.target, 0);
  const todayOutput = LINE_DATA.reduce((s, l) => s + l.output, 0);
  const runningLineData = LINE_DATA.filter((l) => l.status === "running");
  const avgEff =
    runningLineData.length > 0
      ? Math.round(runningLineData.reduce((s, l) => s + l.efficiency, 0) / runningLineData.length)
      : 0;
  const totalDefects = LINE_DATA.reduce((s, l) => s + l.defects, 0);
  const defectRate = todayOutput > 0 ? ((totalDefects / todayOutput) * 100).toFixed(1) : "0.0";
  const lowEffLines = LINE_DATA.filter((l) => l.efficiency > 0 && l.efficiency < 60);

  // Attendance mock
  const present = 172;
  const total = 200;

  return (
    <div className="space-y-6">
      {/* KPI Tiles */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          title="Lines Running"
          value={`${runningLines}/${LINE_DATA.length}`}
          icon={<Activity className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Today's Target"
          value={todayTarget.toLocaleString("en-IN")}
          icon={<Target className="h-5 w-5" />}
          color="purple"
        />
        <StatCard
          title="Today's Output"
          value={todayOutput.toLocaleString("en-IN")}
          change={todayOutput >= todayTarget ? 5.0 : -((todayTarget - todayOutput) / todayTarget) * 100}
          changeLabel="vs target"
          icon={<TrendingUp className="h-5 w-5" />}
          color={todayOutput >= todayTarget * 0.9 ? "green" : "orange"}
        />
        <StatCard
          title="Avg Line Efficiency"
          value={`${avgEff}%`}
          change={-2.1}
          changeLabel="vs yesterday"
          icon={<Zap className="h-5 w-5" />}
          color={avgEff >= 70 ? "green" : avgEff >= 55 ? "orange" : "red"}
        />
        <StatCard
          title="Defect Rate"
          value={`${defectRate}%`}
          change={0.3}
          changeLabel="vs yesterday"
          icon={<AlertTriangle className="h-5 w-5" />}
          color="red"
        />
      </div>

      {/* Alerts for low efficiency lines */}
      {lowEffLines.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              {lowEffLines.length} Line{lowEffLines.length > 1 ? "s" : ""} Below 60% Efficiency
            </p>
            <p className="text-xs text-red-700">
              {lowEffLines.map((l) => `${l.line} (${l.efficiency}%)`).join(", ")} — immediate supervisor attention
              required.
            </p>
          </div>
        </div>
      )}

      {/* Row 2: Line Table + Hourly Output Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Line Performance Table */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Scissors className="h-4 w-4 text-blue-500" />
              Line-by-Line Performance (Today)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-2 text-left font-medium text-gray-500">Line</th>
                    <th className="pb-2 text-left font-medium text-gray-500">Style</th>
                    <th className="pb-2 text-right font-medium text-gray-500">Target</th>
                    <th className="pb-2 text-right font-medium text-gray-500">Output</th>
                    <th className="pb-2 text-right font-medium text-gray-500">Efficiency</th>
                    <th className="pb-2 text-right font-medium text-gray-500">Defects</th>
                    <th className="pb-2 text-center font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {LINE_DATA.map((row) => (
                    <tr
                      key={row.line}
                      className={cn(
                        "hover:bg-gray-50/50",
                        row.efficiency > 0 && row.efficiency < 60 && "bg-red-50/40"
                      )}
                    >
                      <td className="py-2 font-semibold text-gray-900">{row.line}</td>
                      <td className="py-2 max-w-[120px] truncate text-gray-600">{row.style}</td>
                      <td className="py-2 text-right tabular-nums text-gray-600">
                        {row.target > 0 ? row.target.toLocaleString("en-IN") : "--"}
                      </td>
                      <td className="py-2 text-right tabular-nums font-medium text-gray-900">
                        {row.output > 0 ? row.output.toLocaleString("en-IN") : "--"}
                      </td>
                      <td className="py-2 text-right">
                        {row.efficiency > 0 ? (
                          <span
                            className={cn(
                              "inline-block rounded-full px-2 py-0.5 font-semibold tabular-nums",
                              efficiencyBg(row.efficiency),
                              efficiencyColor(row.efficiency)
                            )}
                          >
                            {row.efficiency}%
                          </span>
                        ) : (
                          <span className="text-gray-400">--</span>
                        )}
                      </td>
                      <td className="py-2 text-right tabular-nums text-gray-600">
                        {row.defects > 0 ? row.defects : "--"}
                      </td>
                      <td className="py-2 text-center">{statusPill(row.status)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200 bg-gray-50/60">
                    <td className="py-2 font-semibold text-gray-900" colSpan={2}>
                      Total (Running Lines)
                    </td>
                    <td className="py-2 text-right tabular-nums font-semibold text-gray-900">
                      {todayTarget.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2 text-right tabular-nums font-bold text-blue-700">
                      {todayOutput.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2 text-right">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2 py-0.5 font-bold tabular-nums",
                          efficiencyBg(avgEff),
                          efficiencyColor(avgEff)
                        )}
                      >
                        {avgEff}%
                      </span>
                    </td>
                    <td className="py-2 text-right tabular-nums font-semibold text-red-700">
                      {totalDefects}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Right column: Hourly Output + Attendance */}
        <div className="space-y-4 lg:col-span-2">
          {/* Hourly Output Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Clock className="h-4 w-4 text-blue-500" />
                Hourly Output (Current Shift)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart
                  data={HOURLY_OUTPUT}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                  barCategoryGap="25%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} dy={6} />
                  <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: "11px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                    formatter={(v: number | undefined) => [
                      (v ?? 0).toLocaleString("en-IN"),
                    ]}
                  />
                  <ReferenceLine
                    y={500}
                    stroke="#2563eb"
                    strokeDasharray="4 3"
                    label={{ value: "Target", fill: "#2563eb", fontSize: 9, position: "insideTopRight" }}
                  />
                  <Bar dataKey="output" radius={[3, 3, 0, 0]} maxBarSize={28} name="output">
                    {HOURLY_OUTPUT.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.output >= entry.target ? "#16a34a" : entry.output >= entry.target * 0.85 ? "#f59e0b" : "#dc2626"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Operator Attendance Widget */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Users className="h-4 w-4 text-purple-500" />
                Operator Attendance Today
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="flex items-center gap-4">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-8 border-green-100">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(#16a34a ${(present / total) * 360}deg, #f3f4f6 0deg)`,
                    }}
                  />
                  <div className="relative z-10 flex flex-col items-center justify-center rounded-full bg-white h-14 w-14">
                    <span className="text-base font-bold text-gray-900">{present}</span>
                    <span className="text-xs text-gray-400">Present</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    <span className="text-xs text-gray-600">Present: <strong className="text-gray-900">{present}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="text-xs text-gray-600">Absent: <strong className="text-gray-900">{total - present}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                    <span className="text-xs text-gray-600">Total: <strong className="text-gray-900">{total}</strong></span>
                  </div>
                  <p className="text-xs font-semibold text-gray-700">
                    Attendance: {((present / total) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 3: Operation-wise Bottleneck Tracker */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Operation-Wise Bottleneck Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 text-left font-medium text-gray-500">Operation</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Line</th>
                  <th className="pb-2 text-right font-medium text-gray-500">Avg Time (min)</th>
                  <th className="pb-2 text-right font-medium text-gray-500">SMV (min)</th>
                  <th className="pb-2 text-right font-medium text-gray-500">WIP Backlog</th>
                  <th className="pb-2 text-left pl-4 font-medium text-gray-500">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {BOTTLENECKS.map((row, i) => {
                  const ratio = row.avgMinutes / row.smv;
                  const severity = ratio >= 2.0 ? "Critical" : ratio >= 1.5 ? "High" : "Medium";
                  const sevColor =
                    severity === "Critical"
                      ? "bg-red-100 text-red-700"
                      : severity === "High"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-yellow-100 text-yellow-700";
                  return (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="py-2.5 font-medium text-gray-900">{row.operation}</td>
                      <td className="py-2.5 text-gray-600">{row.line}</td>
                      <td className="py-2.5 text-right tabular-nums font-semibold text-red-700">
                        {row.avgMinutes.toFixed(1)}
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-gray-500">{row.smv.toFixed(1)}</td>
                      <td className="py-2.5 text-right tabular-nums text-gray-700">{row.backlog}</td>
                      <td className="py-2.5 pl-4">
                        <span
                          className={cn(
                            "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
                            sevColor
                          )}
                        >
                          {severity}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SewingSupervisorDashboard;
