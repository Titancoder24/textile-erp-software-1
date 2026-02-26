"use client";

import * as React from "react";
import {
  ClipboardList,
  CheckCircle,
  Layers,
  Clock,
  Plus,
  Scissors,
  ArrowRight,
  Calendar,
  User,
} from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* ---------- Demo Data ---------- */

interface TaskAssignment {
  id: string;
  workOrder: string;
  style: string;
  line: string;
  shift: "morning" | "afternoon" | "night";
  entryType: "production" | "cutting" | "finishing";
  status: "pending" | "done";
}

interface RecentEntry {
  id: string;
  entryType: string;
  workOrder: string;
  line: string;
  shift: string;
  producedQty: number;
  defectiveQty: number;
  entryTime: string;
}

const TODAY_TASKS: TaskAssignment[] = [
  {
    id: "T-001",
    workOrder: "WO-2026-0089",
    style: "ST-4421 Polo T-shirt",
    line: "Line 1",
    shift: "morning",
    entryType: "production",
    status: "done",
  },
  {
    id: "T-002",
    workOrder: "WO-2026-0089",
    style: "ST-4421 Polo T-shirt",
    line: "Line 1",
    shift: "afternoon",
    entryType: "production",
    status: "pending",
  },
  {
    id: "T-003",
    workOrder: "WO-2026-0091",
    style: "ST-4398 Fleece Hoodie",
    line: "Line 2",
    shift: "morning",
    entryType: "production",
    status: "done",
  },
  {
    id: "T-004",
    workOrder: "WO-2026-0093",
    style: "ST-4412 Woven Trouser",
    line: "Cutting",
    shift: "morning",
    entryType: "cutting",
    status: "pending",
  },
  {
    id: "T-005",
    workOrder: "WO-2026-0087",
    style: "ST-4405 Jersey Dress",
    line: "Line 3",
    shift: "afternoon",
    entryType: "production",
    status: "pending",
  },
];

const RECENT_ENTRIES: RecentEntry[] = [
  {
    id: "PE-2026-0891",
    entryType: "Production Entry",
    workOrder: "WO-2026-0089",
    line: "Line 1",
    shift: "Morning",
    producedQty: 385,
    defectiveQty: 12,
    entryTime: "10:30 AM",
  },
  {
    id: "PE-2026-0890",
    entryType: "Production Entry",
    workOrder: "WO-2026-0091",
    line: "Line 2",
    shift: "Morning",
    producedQty: 310,
    defectiveQty: 18,
    entryTime: "10:15 AM",
  },
  {
    id: "CE-2026-0112",
    entryType: "Cutting Entry",
    workOrder: "WO-2026-0093",
    line: "Cutting",
    shift: "Morning",
    producedQty: 840,
    defectiveQty: 0,
    entryTime: "09:50 AM",
  },
  {
    id: "PE-2026-0889",
    entryType: "Production Entry",
    workOrder: "WO-2026-0088",
    line: "Line 4",
    shift: "Morning",
    producedQty: 185,
    defectiveQty: 22,
    entryTime: "Yesterday 5:45 PM",
  },
  {
    id: "PE-2026-0888",
    entryType: "Production Entry",
    workOrder: "WO-2026-0087",
    line: "Line 3",
    shift: "Afternoon",
    producedQty: 440,
    defectiveQty: 8,
    entryTime: "Yesterday 3:30 PM",
  },
  {
    id: "CE-2026-0111",
    entryType: "Cutting Entry",
    workOrder: "WO-2026-0090",
    line: "Cutting",
    shift: "Morning",
    producedQty: 720,
    defectiveQty: 0,
    entryTime: "Yesterday 10:00 AM",
  },
  {
    id: "PE-2026-0887",
    entryType: "Production Entry",
    workOrder: "WO-2026-0086",
    line: "Line 5",
    shift: "Morning",
    producedQty: 355,
    defectiveQty: 14,
    entryTime: "Yesterday 10:00 AM",
  },
  {
    id: "PE-2026-0886",
    entryType: "Production Entry",
    workOrder: "WO-2026-0085",
    line: "Line 6",
    shift: "Afternoon",
    producedQty: 480,
    defectiveQty: 9,
    entryTime: "25 Feb, 4:15 PM",
  },
  {
    id: "PE-2026-0885",
    entryType: "Production Entry",
    workOrder: "WO-2026-0084",
    line: "Line 1",
    shift: "Morning",
    producedQty: 400,
    defectiveQty: 11,
    entryTime: "25 Feb, 10:30 AM",
  },
  {
    id: "CE-2026-0110",
    entryType: "Cutting Entry",
    workOrder: "WO-2026-0083",
    line: "Cutting",
    shift: "Morning",
    producedQty: 650,
    defectiveQty: 0,
    entryTime: "24 Feb, 11:00 AM",
  },
];

/* ---------- Helpers ---------- */

function shiftBadge(shift: string) {
  const colors: Record<string, string> = {
    morning: "bg-yellow-50 text-yellow-700",
    Morning: "bg-yellow-50 text-yellow-700",
    afternoon: "bg-blue-50 text-blue-700",
    Afternoon: "bg-blue-50 text-blue-700",
    night: "bg-purple-50 text-purple-700",
    Night: "bg-purple-50 text-purple-700",
  };
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        colors[shift] ?? "bg-gray-50 text-gray-600"
      )}
    >
      {shift}
    </span>
  );
}

function entryTypeIcon(type: string) {
  if (type === "production" || type === "Production Entry")
    return <Layers className="h-3.5 w-3.5 text-blue-500 shrink-0" />;
  if (type === "cutting" || type === "Cutting Entry")
    return <Scissors className="h-3.5 w-3.5 text-purple-500 shrink-0" />;
  return <ClipboardList className="h-3.5 w-3.5 text-gray-400 shrink-0" />;
}

/* ---------- Component ---------- */

interface DataEntryOperatorDashboardProps {
  data?: Record<string, unknown>;
  operatorName?: string;
}

export function DataEntryOperatorDashboard({
  _props,
  operatorName = "Deepak Sharma",
}: DataEntryOperatorDashboardProps & { _props?: unknown }) {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const pendingCount = TODAY_TASKS.filter((t) => t.status === "pending").length;
  const doneCount = TODAY_TASKS.filter((t) => t.status === "done").length;
  const activeWorkOrders = [...new Set(TODAY_TASKS.map((t) => t.workOrder))].length;
  const lastEntryTime = RECENT_ENTRIES[0]?.entryTime ?? "--";

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex items-start justify-between rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold text-blue-900">Good morning, {operatorName}</p>
            <p className="text-sm text-blue-700">{today}</p>
            <p className="mt-1 text-xs text-blue-600">
              You have <strong>{pendingCount} entries pending</strong> for today. Keep up the good work!
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm">
            <Calendar className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs font-medium text-gray-700">Morning Shift</span>
          </div>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          title="Entries Pending"
          value={pendingCount}
          icon={<ClipboardList className="h-5 w-5" />}
          color={pendingCount > 0 ? "orange" : "green"}
        />
        <StatCard
          title="Entries Done Today"
          value={doneCount}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Work Orders Active"
          value={activeWorkOrders}
          icon={<Layers className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Last Entry"
          value={lastEntryTime}
          icon={<Clock className="h-5 w-5" />}
          color="purple"
        />
      </div>

      {/* Row 3: Today's Task List + Quick Entry Shortcuts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Task List */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <ClipboardList className="h-4 w-4 text-blue-500" />
              Today&apos;s Entry Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {TODAY_TASKS.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border px-4 py-3",
                    task.status === "done"
                      ? "border-green-100 bg-green-50/40"
                      : "border-gray-100 bg-white hover:bg-gray-50/60"
                  )}
                >
                  {/* Checkbox-style indicator */}
                  <div
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                      task.status === "done"
                        ? "bg-green-500"
                        : "border-2 border-gray-300 bg-white"
                    )}
                  >
                    {task.status === "done" && (
                      <svg viewBox="0 0 10 10" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1.5 5l2.5 2.5 4-4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {entryTypeIcon(task.entryType)}
                      <p
                        className={cn(
                          "text-sm font-medium",
                          task.status === "done" ? "text-gray-400 line-through" : "text-gray-900"
                        )}
                      >
                        {task.entryType === "production"
                          ? "Production Entry"
                          : task.entryType === "cutting"
                          ? "Cutting Entry"
                          : "Finishing Entry"}
                      </p>
                      {shiftBadge(task.shift)}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-400">
                      <span>{task.workOrder}</span>
                      <span>{task.style}</span>
                      <span>{task.line}</span>
                    </div>
                  </div>

                  {task.status === "pending" && (
                    <a
                      href={
                        task.entryType === "cutting"
                          ? "/production/cutting"
                          : task.entryType === "finishing"
                          ? "/production/finishing"
                          : "/production/entries"
                      }
                      className="flex shrink-0 items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      Enter
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  )}
                  {task.status === "done" && (
                    <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Done
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Entry Shortcuts */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900">
                Quick Entry Shortcuts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a
                href="/production/entries"
                className="flex w-full items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800 transition-colors hover:bg-blue-100"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">Production Entry</p>
                  <p className="text-xs font-normal text-blue-600">Hourly / shift output</p>
                </div>
              </a>

              <a
                href="/production/cutting"
                className="flex w-full items-center gap-3 rounded-lg border border-purple-100 bg-purple-50 px-4 py-3 text-sm font-medium text-purple-800 transition-colors hover:bg-purple-100"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-purple-600 text-white">
                  <Scissors className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">Cutting Entry</p>
                  <p className="text-xs font-normal text-purple-600">Fabric & cut quantity</p>
                </div>
              </a>

              <a
                href="/production/finishing"
                className="flex w-full items-center gap-3 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 transition-colors hover:bg-green-100"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-green-600 text-white">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">Finishing Entry</p>
                  <p className="text-xs font-normal text-green-600">Passed / rejected count</p>
                </div>
              </a>
            </CardContent>
          </Card>

          {/* Progress widget */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-900">Today&apos;s Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Entries completed</span>
                <span className="font-semibold text-gray-900">
                  {doneCount}/{TODAY_TASKS.length}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-gray-100">
                <div
                  className="h-2.5 rounded-full bg-blue-600 transition-all"
                  style={{ width: `${(doneCount / TODAY_TASKS.length) * 100}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-400">
                {Math.round((doneCount / TODAY_TASKS.length) * 100)}% complete
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 4: Recent Entries Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Clock className="h-4 w-4 text-gray-400" />
            Recent Entries (Last 10)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 text-left font-medium text-gray-500">Entry ID</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Type</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Work Order</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Line / Dept</th>
                  <th className="pb-2 text-center font-medium text-gray-500">Shift</th>
                  <th className="pb-2 text-right font-medium text-gray-500">Produced</th>
                  <th className="pb-2 text-right font-medium text-gray-500">Defects</th>
                  <th className="pb-2 text-right font-medium text-gray-500">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {RECENT_ENTRIES.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50/50">
                    <td className="py-2 font-mono text-gray-500">{entry.id}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-1.5">
                        {entryTypeIcon(entry.entryType)}
                        <span className="text-gray-700">{entry.entryType}</span>
                      </div>
                    </td>
                    <td className="py-2 font-medium text-gray-900">{entry.workOrder}</td>
                    <td className="py-2 text-gray-600">{entry.line}</td>
                    <td className="py-2 text-center">{shiftBadge(entry.shift)}</td>
                    <td className="py-2 text-right tabular-nums font-semibold text-gray-900">
                      {entry.producedQty.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {entry.defectiveQty > 0 ? (
                        <span className="text-red-600 font-medium">{entry.defectiveQty}</span>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                    <td className="py-2 text-right text-gray-400 tabular-nums">{entry.entryTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DataEntryOperatorDashboard;
