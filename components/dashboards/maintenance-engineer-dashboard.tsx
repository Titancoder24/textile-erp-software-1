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
  Cell,
} from "recharts";
import {
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Package,
  Zap,
  Settings,
} from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* ---------- Demo Data ---------- */

type MachineStatus = "running" | "breakdown" | "maintenance" | "idle";

interface Machine {
  id: string;
  name: string;
  department: string;
  status: MachineStatus;
}

interface BreakdownLog {
  machine: string;
  issue: string;
  reportedTime: string;
  status: "open" | "in_progress" | "resolved";
  elapsed: string;
}

interface PMItem {
  machine: string;
  type: string;
  dueDate: string;
  done: boolean;
  techAssigned: string;
}

interface SparePart {
  name: string;
  current: number;
  reorderLevel: number;
  uom: string;
}

const MACHINES: Machine[] = [
  { id: "M-001", name: "Single Needle Lock-1", department: "Sewing", status: "running" },
  { id: "M-002", name: "Single Needle Lock-2", department: "Sewing", status: "running" },
  { id: "M-003", name: "Single Needle Lock-3", department: "Sewing", status: "running" },
  { id: "M-004", name: "Overlock 5-Thread-1", department: "Sewing", status: "breakdown" },
  { id: "M-005", name: "Overlock 5-Thread-2", department: "Sewing", status: "running" },
  { id: "M-006", name: "Overlock 5-Thread-3", department: "Sewing", status: "running" },
  { id: "M-007", name: "Flatlock Machine-1", department: "Sewing", status: "running" },
  { id: "M-008", name: "Flatlock Machine-2", department: "Sewing", status: "maintenance" },
  { id: "M-009", name: "Button Attach-1", department: "Sewing", status: "running" },
  { id: "M-010", name: "Button Attach-2", department: "Sewing", status: "running" },
  { id: "M-011", name: "Bartack Machine-1", department: "Sewing", status: "running" },
  { id: "M-012", name: "Kansai Machine-1", department: "Sewing", status: "breakdown" },
  { id: "M-013", name: "Cutting Spreader-1", department: "Cutting", status: "running" },
  { id: "M-014", name: "Straight Knife-1", department: "Cutting", status: "running" },
  { id: "M-015", name: "Band Knife-1", department: "Cutting", status: "maintenance" },
  { id: "M-016", name: "Steamer-1", department: "Finishing", status: "running" },
  { id: "M-017", name: "Steamer-2", department: "Finishing", status: "running" },
  { id: "M-018", name: "Pressing Iron-1", department: "Finishing", status: "running" },
  { id: "M-019", name: "Dyeing Machine-1", department: "Dyeing", status: "running" },
  { id: "M-020", name: "Dyeing Machine-2", department: "Dyeing", status: "running" },
];

const BREAKDOWN_LOG: BreakdownLog[] = [
  {
    machine: "M-004 Overlock 5-Thread-1",
    issue: "Looper thread breakage — looper worn out",
    reportedTime: "08:45 AM",
    status: "in_progress",
    elapsed: "1h 30m",
  },
  {
    machine: "M-012 Kansai Machine-1",
    issue: "Needle bar bent — impact damage from fabric roll",
    reportedTime: "09:15 AM",
    status: "open",
    elapsed: "1h 00m",
  },
  {
    machine: "M-008 Flatlock Machine-2",
    issue: "Scheduled lubrication & belt replacement (PM)",
    reportedTime: "08:00 AM",
    status: "in_progress",
    elapsed: "2h 15m",
  },
];

const PM_SCHEDULE: PMItem[] = [
  { machine: "M-001 Single Needle Lock-1", type: "Monthly PM", dueDate: "26 Feb 2026", done: true, techAssigned: "Rajesh K." },
  { machine: "M-003 Single Needle Lock-3", type: "Monthly PM", dueDate: "26 Feb 2026", done: true, techAssigned: "Suresh M." },
  { machine: "M-008 Flatlock Machine-2", type: "Belt & Lubrication", dueDate: "26 Feb 2026", done: false, techAssigned: "Rajesh K." },
  { machine: "M-019 Dyeing Machine-1", type: "Quarterly PM", dueDate: "27 Feb 2026", done: false, techAssigned: "Anand T." },
  { machine: "M-013 Cutting Spreader-1", type: "Blade sharpening", dueDate: "28 Feb 2026", done: false, techAssigned: "Suresh M." },
  { machine: "M-015 Band Knife-1", type: "Blade replacement", dueDate: "26 Feb 2026", done: false, techAssigned: "Rajesh K." },
];

const SPARE_PARTS_LOW: SparePart[] = [
  { name: "Overlock looper (Yamato)", current: 2, reorderLevel: 5, uom: "pcs" },
  { name: "Single needle (DBx1 #14)", current: 18, reorderLevel: 50, uom: "pcs" },
  { name: "Flat belt 10mm x 1000mm", current: 1, reorderLevel: 3, uom: "pcs" },
  { name: "Machine oil (Singer 3-in-1)", current: 0.8, reorderLevel: 2, uom: "litre" },
];

const MTTR_DATA = [
  { month: "Sep 25", mttr: 3.2 },
  { month: "Oct 25", mttr: 2.8 },
  { month: "Nov 25", mttr: 3.5 },
  { month: "Dec 25", mttr: 2.4 },
  { month: "Jan 26", mttr: 2.6 },
  { month: "Feb 26", mttr: 2.1 },
];

const OEE_DATA = [
  { name: "Availability", value: 88, fill: "#2563eb" },
  { name: "Performance", value: 76, fill: "#f59e0b" },
  { name: "Quality", value: 94, fill: "#16a34a" },
];

/* ---------- Helpers ---------- */

function machineStatusColor(status: MachineStatus): string {
  if (status === "running") return "bg-green-500";
  if (status === "breakdown") return "bg-red-500";
  if (status === "maintenance") return "bg-amber-500";
  return "bg-gray-300";
}

function machineStatusRing(status: MachineStatus): string {
  if (status === "running") return "ring-green-100";
  if (status === "breakdown") return "ring-red-100";
  if (status === "maintenance") return "ring-amber-100";
  return "ring-gray-100";
}

function breakdownStatusBadge(status: BreakdownLog["status"]) {
  if (status === "open")
    return (
      <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
        Open
      </span>
    );
  if (status === "in_progress")
    return (
      <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
        In Progress
      </span>
    );
  return (
    <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
      Resolved
    </span>
  );
}

/* ---------- Component ---------- */

interface MaintenanceEngineerDashboardProps {
  data?: Record<string, unknown>;
}

export function MaintenanceEngineerDashboard(_props: MaintenanceEngineerDashboardProps) {
  const running = MACHINES.filter((m) => m.status === "running").length;
  const breakdowns = MACHINES.filter((m) => m.status === "breakdown").length;
  const maintenance = MACHINES.filter((m) => m.status === "maintenance").length;
  const pmCompletedThisWeek = PM_SCHEDULE.filter((p) => p.done).length;
  const pmOverdue = PM_SCHEDULE.filter((p) => !p.done && p.dueDate <= "26 Feb 2026").length;
  const mttr = 2.1;

  const oeeOverall = Math.round(
    (OEE_DATA[0].value / 100) * (OEE_DATA[1].value / 100) * (OEE_DATA[2].value / 100) * 100
  );

  return (
    <div className="space-y-6">
      {/* KPI Tiles */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          title="Machines Running"
          value={`${running}/${MACHINES.length}`}
          icon={<Activity className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Breakdowns Today"
          value={breakdowns}
          icon={<AlertTriangle className="h-5 w-5" />}
          color={breakdowns > 0 ? "red" : "green"}
        />
        <StatCard
          title="PM Completed (Week)"
          value={`${pmCompletedThisWeek}/${PM_SCHEDULE.length}`}
          icon={<CheckCircle className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="PM Overdue"
          value={pmOverdue}
          icon={<Clock className="h-5 w-5" />}
          color={pmOverdue > 0 ? "orange" : "green"}
        />
        <StatCard
          title="MTTR (Avg)"
          value={`${mttr}h`}
          change={-19.0}
          changeLabel="vs last month"
          icon={<Wrench className="h-5 w-5" />}
          color="purple"
        />
      </div>

      {/* Row 2: Machine Status Grid + OEE */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Machine Status Grid */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Settings className="h-4 w-4 text-blue-500" />
                Machine Status Overview
              </CardTitle>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Running ({running})
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Breakdown ({breakdowns})
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Maintenance ({maintenance})
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {MACHINES.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-lg border p-2 ring-2 transition-shadow hover:shadow-sm",
                    machineStatusRing(m.status),
                    m.status === "breakdown" && "border-red-200 bg-red-50",
                    m.status === "maintenance" && "border-amber-200 bg-amber-50",
                    m.status === "running" && "border-green-100 bg-green-50/40",
                    m.status === "idle" && "border-gray-100 bg-gray-50/40"
                  )}
                  title={`${m.name} — ${m.status}`}
                >
                  <span
                    className={cn(
                      "mb-1 h-2.5 w-2.5 rounded-full",
                      machineStatusColor(m.status)
                    )}
                  />
                  <p className="text-center text-[10px] font-medium leading-tight text-gray-700">
                    {m.id}
                  </p>
                  <p className="mt-0.5 text-center text-[9px] leading-tight text-gray-400">
                    {m.department}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* OEE Display */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Zap className="h-4 w-4 text-yellow-500" />
              OEE (Overall Equipment Effectiveness)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1">
            {/* OEE Score */}
            <div className="mb-3 flex flex-col items-center">
              <span className="text-4xl font-bold text-gray-900">{oeeOverall}%</span>
              <span className="text-xs text-gray-400">Overall OEE Score</span>
              <span
                className={cn(
                  "mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
                  oeeOverall >= 85
                    ? "bg-green-100 text-green-700"
                    : oeeOverall >= 70
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                )}
              >
                {oeeOverall >= 85 ? "World Class" : oeeOverall >= 70 ? "Acceptable" : "Poor"}
              </span>
            </div>
            {/* Three components */}
            <div className="space-y-3">
              {OEE_DATA.map((item) => (
                <div key={item.name}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700">{item.name}</span>
                    <span className="font-semibold text-gray-900 tabular-nums">{item.value}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${item.value}%`, backgroundColor: item.fill }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* MTTR Trend */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-gray-500">MTTR Trend (6 Months)</p>
              <ResponsiveContainer width="100%" height={80}>
                <BarChart
                  data={MTTR_DATA}
                  margin={{ top: 0, right: 0, left: -30, bottom: 0 }}
                  barCategoryGap="20%"
                >
                  <XAxis dataKey="month" tick={{ fontSize: 8, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 8, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: "10px", borderRadius: "6px" }}
                    formatter={(v: number | undefined) => [`${v ?? 0}h`, "MTTR"]}
                  />
                  <Bar dataKey="mttr" fill="#8b5cf6" radius={[2, 2, 0, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Breakdown Log + PM Schedule */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Breakdown Log */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Breakdown Log (Today)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {BREAKDOWN_LOG.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle className="mb-2 h-8 w-8 text-green-400" />
                <p className="text-sm text-gray-500">No breakdowns today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {BREAKDOWN_LOG.map((log, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-lg border p-3",
                      log.status === "open" ? "border-red-200 bg-red-50/50" : "border-gray-100 bg-gray-50/50"
                    )}
                  >
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-900">{log.machine}</p>
                      {breakdownStatusBadge(log.status)}
                    </div>
                    <p className="text-xs text-gray-600">{log.issue}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                      <span>Reported: {log.reportedTime}</span>
                      <span>Elapsed: <strong className="text-gray-600">{log.elapsed}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* PM Schedule */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <CheckCircle className="h-4 w-4 text-blue-500" />
              PM Schedule This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {PM_SCHEDULE.map((pm, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border px-3 py-2.5",
                    pm.done
                      ? "border-green-100 bg-green-50/40"
                      : "border-gray-100 bg-white"
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                      pm.done ? "bg-green-500" : "border-2 border-gray-300 bg-white"
                    )}
                  >
                    {pm.done && (
                      <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1.5 5l2.5 2.5 4-4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-xs font-medium", pm.done ? "text-gray-500 line-through" : "text-gray-900")}>
                      {pm.machine}
                    </p>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-400">
                      <span>{pm.type}</span>
                      <span>Due: {pm.dueDate}</span>
                      <span>{pm.techAssigned}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Spare Parts Low Stock */}
      {SPARE_PARTS_LOW.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/40">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Package className="h-4 w-4 text-orange-500" />
              Spare Parts Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {SPARE_PARTS_LOW.map((part, i) => (
                <div key={i} className="rounded-lg border border-orange-200 bg-white p-3">
                  <p className="text-xs font-semibold text-gray-800">{part.name}</p>
                  <div className="mt-2 flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-red-600 tabular-nums">
                        {part.current}
                      </p>
                      <p className="text-xs text-gray-400">{part.uom} in stock</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Reorder at</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {part.reorderLevel} {part.uom}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
                    <div
                      className="h-1.5 rounded-full bg-red-500"
                      style={{
                        width: `${Math.min(100, (part.current / part.reorderLevel) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MaintenanceEngineerDashboard;
