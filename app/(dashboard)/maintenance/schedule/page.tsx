"use client";

import * as React from "react";
import {
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  LayoutList,
  BarChart2,
  Filter,
  Download,
  Wrench,
  Loader2,
} from "lucide-react";
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
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useCompany } from "@/contexts/company-context";
import { getMachines, schedulePM } from "@/lib/actions/maintenance";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PMStatus = "done" | "due" | "overdue" | "scheduled";
type PMType = "oiling" | "belt_change" | "calibration" | "full_service" | "filter_change" | "lubrication";
type PMFrequency = "weekly" | "monthly" | "quarterly" | "annual";

interface PMTask {
  id: string;
  machineId: string;
  machineCode: string;
  machineName: string;
  department: string;
  pmType: PMType;
  frequency: PMFrequency;
  lastDone: string;
  nextDue: string;
  status: PMStatus;
  assignedTo: string;
  estimatedHours: number;
  notes: string;
}

interface MachineOption {
  id: string;
  code: string;
  name: string;
  department: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<PMStatus, { label: string; className: string; rowClass: string }> = {
  done: {
    label: "Done",
    className: "bg-green-100 text-green-800 border-green-200",
    rowClass: "bg-green-50/30",
  },
  due: {
    label: "Due",
    className: "bg-amber-100 text-amber-800 border-amber-200",
    rowClass: "bg-amber-50/30",
  },
  overdue: {
    label: "Overdue",
    className: "bg-red-100 text-red-800 border-red-200",
    rowClass: "bg-red-50/30",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    rowClass: "",
  },
};

const PM_TYPE_LABELS: Record<PMType, string> = {
  oiling: "Oiling & Lubrication",
  belt_change: "Belt Change",
  calibration: "Calibration",
  full_service: "Full Service",
  filter_change: "Filter Change",
  lubrication: "Lubrication",
};

const FREQ_LABELS: Record<PMFrequency, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
};

const FREQ_BADGE: Record<PMFrequency, string> = {
  weekly: "bg-blue-50 text-blue-700 border-blue-200",
  monthly: "bg-purple-50 text-purple-700 border-purple-200",
  quarterly: "bg-teal-50 text-teal-700 border-teal-200",
  annual: "bg-gray-100 text-gray-700 border-gray-300",
};

function derivePMStatus(nextDue: string | null, lastServiced: string | null): PMStatus {
  if (!nextDue) return "scheduled";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(nextDue);
  dueDate.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // If last serviced is after or equal to the due date, it's done
  if (lastServiced) {
    const lastDate = new Date(lastServiced);
    lastDate.setHours(0, 0, 0, 0);
    if (lastDate >= dueDate) return "done";
  }

  if (diffDays < 0) return "overdue";
  if (diffDays <= 7) return "due";
  return "scheduled";
}

function derivePMFrequency(lastServiced: string | null, nextDue: string | null): PMFrequency {
  if (!lastServiced || !nextDue) return "monthly";
  const last = new Date(lastServiced);
  const next = new Date(nextDue);
  const diffDays = Math.floor((next.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 10) return "weekly";
  if (diffDays <= 45) return "monthly";
  if (diffDays <= 120) return "quarterly";
  return "annual";
}

// ---------------------------------------------------------------------------
// Add PM Task Dialog
// ---------------------------------------------------------------------------

function AddPMDialog({
  open,
  onClose,
  machines,
  companyId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  machines: MachineOption[];
  companyId: string;
  onSuccess: () => void;
}) {
  const [selectedMachineId, setSelectedMachineId] = React.useState("");
  const [pmType, setPmType] = React.useState<PMType>("oiling");
  const [frequency, setFrequency] = React.useState<PMFrequency>("monthly");
  const [scheduledDate, setScheduledDate] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachineId) {
      toast.error("Please select a machine");
      return;
    }
    if (!scheduledDate) {
      toast.error("Scheduled date is required");
      return;
    }

    setSaving(true);
    const { error } = await schedulePM({
      machine_id: selectedMachineId,
      company_id: companyId,
      pm_type: pmType as "oiling" | "belt_change" | "calibration" | "full_service",
      frequency: frequency as "weekly" | "monthly" | "quarterly" | "annual",
      scheduled_date: scheduledDate,
    });
    setSaving(false);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("PM task scheduled successfully");
    setSelectedMachineId("");
    setScheduledDate("");
    setPmType("oiling");
    setFrequency("monthly");
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add PM Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Machine *</Label>
            <Select value={selectedMachineId} onValueChange={setSelectedMachineId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a machine..." />
              </SelectTrigger>
              <SelectContent>
                {machines.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.code} - {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">PM Type *</Label>
              <Select value={pmType} onValueChange={(v) => setPmType(v as PMType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(PM_TYPE_LABELS) as [PMType, string][]).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Frequency *</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as PMFrequency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(FREQ_LABELS) as [PMFrequency, string][]).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Scheduled Date *</Label>
            <Input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedMachineId || !scheduledDate || saving}>
              {saving ? "Scheduling..." : "Add PM Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PMSchedulePage() {
  const { companyId } = useCompany();

  const [pmTasks, setPmTasks] = React.useState<PMTask[]>([]);
  const [machineOptions, setMachineOptions] = React.useState<MachineOption[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [filterStatus, setFilterStatus] = React.useState("all");
  const [filterDept, setFilterDept] = React.useState("all");
  const [filterPMType, setFilterPMType] = React.useState("all");
  const [viewMode, setViewMode] = React.useState<"table" | "chart">("table");
  const [showAddDialog, setShowAddDialog] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await getMachines(companyId);

    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawMachines = (data ?? []) as any[];

    // Build machine options for the Add PM dialog
    const options: MachineOption[] = rawMachines.map((m) => ({
      id: m.id,
      code: m.machine_code ?? "",
      name: m.name ?? "",
      department: m.department ?? "",
    }));
    setMachineOptions(options);

    // Derive PM tasks from machines that have next_service_due set
    const tasks: PMTask[] = rawMachines
      .filter((m) => m.next_service_due)
      .map((m) => {
        const lastServiced = m.last_serviced_at ?? null;
        const nextDue = m.next_service_due ?? null;
        const status = derivePMStatus(nextDue, lastServiced);
        const frequency = derivePMFrequency(lastServiced, nextDue);

        return {
          id: m.id,
          machineId: m.id,
          machineCode: m.machine_code ?? "",
          machineName: m.name ?? "",
          department: m.department ?? "",
          pmType: "full_service" as PMType,
          frequency,
          lastDone: lastServiced ?? "—",
          nextDue: nextDue ?? "—",
          status,
          assignedTo: "—",
          estimatedHours: frequency === "weekly" ? 0.5 : frequency === "monthly" ? 1.5 : frequency === "quarterly" ? 4 : 8,
          notes: `${m.make ?? ""} ${m.model ?? ""}`.trim() || "—",
        };
      })
      // Sort: overdue first, then due, then scheduled, then done
      .sort((a, b) => {
        const order: Record<PMStatus, number> = { overdue: 0, due: 1, scheduled: 2, done: 3 };
        return (order[a.status] ?? 9) - (order[b.status] ?? 9);
      });

    setPmTasks(tasks);
    setLoading(false);
  }, [companyId]);

  React.useEffect(() => {
    if (companyId) {
      fetchData();
    }
  }, [companyId, fetchData]);

  const overdueCount = pmTasks.filter((t) => t.status === "overdue").length;
  const dueCount = pmTasks.filter((t) => t.status === "due").length;
  const doneCount = pmTasks.filter((t) => t.status === "done").length;
  const scheduledCount = pmTasks.filter((t) => t.status === "scheduled").length;

  const totalTasks = pmTasks.length;
  const latestCompliance = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  const filteredTasks = pmTasks.filter((task) => {
    if (filterStatus !== "all" && task.status !== filterStatus) return false;
    if (filterDept !== "all" && task.department !== filterDept) return false;
    if (filterPMType !== "all" && task.pmType !== filterPMType) return false;
    return true;
  });

  // Build unique departments from data
  const uniqueDepts = Array.from(new Set(pmTasks.map((t) => t.department))).sort();
  const DEPARTMENTS = ["all", ...uniqueDepts];

  // PM compliance data: derive a simple summary
  const PM_COMPLIANCE_DATA = [
    { month: "Current", planned: totalTasks, completed: doneCount, pct: latestCompliance },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="PM Schedule"
        description="Preventive maintenance schedule and compliance tracking"
        breadcrumb={[
          { label: "Dashboard", href: "/" },
          { label: "Maintenance", href: "/maintenance" },
          { label: "PM Schedule" },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 h-4 w-4" />
              Export Schedule
            </Button>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add PM Task
            </Button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Overdue",
            value: overdueCount,
            icon: AlertTriangle,
            iconBg: "bg-red-600",
            sub: "Needs immediate attention",
          },
          {
            label: "Due This Week",
            value: dueCount,
            icon: Clock,
            iconBg: "bg-amber-500",
            sub: "Scheduled for this week",
          },
          {
            label: "Completed",
            value: doneCount,
            icon: CheckCircle2,
            iconBg: "bg-green-600",
            sub: "Service up to date",
          },
          {
            label: "Upcoming",
            value: scheduledCount,
            icon: CalendarClock,
            iconBg: "bg-blue-600",
            sub: "Future scheduled tasks",
          },
        ].map((card) => (
          <Card key={card.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-gray-500">{card.label}</p>
                  <p className="text-2xl font-black tabular-nums text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-400">{card.sub}</p>
                </div>
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    card.iconBg
                  )}
                >
                  <card.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* PM Compliance chart + summary */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">PM Compliance Summary</CardTitle>
              <div className="text-right">
                <p className="text-xs text-gray-400">Compliance Rate</p>
                <p
                  className={cn(
                    "text-lg font-black tabular-nums",
                    latestCompliance >= 80
                      ? "text-green-600"
                      : latestCompliance >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                  )}
                >
                  {latestCompliance}%
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={PM_COMPLIANCE_DATA} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, Math.max(totalTasks, 1)]} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                  formatter={(val, name) => [
                    val,
                    name === "planned" ? "Planned" : "Completed",
                  ]}
                />
                <Bar dataKey="planned" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Planned" />
                <Bar dataKey="completed" radius={[4, 4, 0, 0]} name="Completed">
                  {PM_COMPLIANCE_DATA.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.pct >= 80
                          ? "#22c55e"
                          : entry.pct >= 60
                          ? "#eab308"
                          : "#ef4444"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(Object.entries(STATUS_CONFIG) as [PMStatus, typeof STATUS_CONFIG[PMStatus]][]).map(
              ([statusKey, cfg]) => {
                const count = pmTasks.filter((t) => t.status === statusKey).length;
                const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                return (
                  <div key={statusKey} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">{cfg.label}</span>
                      <span className="font-semibold text-gray-800">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100">
                      <div
                        className={cn(
                          "h-1.5 rounded-full",
                          statusKey === "overdue"
                            ? "bg-red-500"
                            : statusKey === "due"
                            ? "bg-amber-500"
                            : statusKey === "done"
                            ? "bg-green-500"
                            : "bg-blue-500"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </CardContent>
        </Card>
      </div>

      {/* Schedule table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">
              PM Schedule ({filteredTasks.length} tasks)
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              {/* View toggle */}
              <div className="flex items-center rounded-lg border border-gray-200 p-0.5">
                <button
                  onClick={() => setViewMode("table")}
                  className={cn(
                    "flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors",
                    viewMode === "table"
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <LayoutList className="h-3 w-3" />
                  Table
                </button>
                <button
                  onClick={() => setViewMode("chart")}
                  className={cn(
                    "flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors",
                    viewMode === "chart"
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <BarChart2 className="h-3 w-3" />
                  Chart
                </button>
              </div>

              {/* Filters */}
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={filterDept} onValueChange={setFilterDept}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d === "all" ? "All Depts" : d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterPMType} onValueChange={setFilterPMType}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue placeholder="PM Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All PM Types</SelectItem>
                  {(Object.entries(PM_TYPE_LABELS) as [PMType, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="due">Due</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {[
                    "Machine",
                    "Department",
                    "PM Type",
                    "Frequency",
                    "Last Done",
                    "Next Due",
                    "Est. Hours",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTasks.map((task) => {
                  const sCfg = STATUS_CONFIG[task.status];
                  const fCfg = FREQ_BADGE[task.frequency];

                  return (
                    <tr
                      key={task.id}
                      className={cn(
                        "transition-colors hover:brightness-95",
                        sCfg.rowClass
                      )}
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                          {task.machineCode}
                        </p>
                        <p className="text-xs text-gray-400 max-w-[120px] truncate">
                          {task.machineName}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {task.department}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Wrench className="h-3 w-3 text-gray-400 shrink-0" />
                          <span className="text-sm text-gray-700 whitespace-nowrap">
                            {PM_TYPE_LABELS[task.pmType] ?? task.pmType}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-xs font-semibold",
                            fCfg
                          )}
                        >
                          {FREQ_LABELS[task.frequency]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {task.lastDone}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "text-sm font-medium whitespace-nowrap",
                            task.status === "overdue"
                              ? "text-red-700"
                              : task.status === "due"
                              ? "text-amber-700"
                              : "text-gray-700"
                          )}
                        >
                          {task.nextDue}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-center tabular-nums">
                        {task.estimatedHours}h
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-xs font-semibold",
                            sCfg.className
                          )}
                        >
                          {sCfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredTasks.length === 0 && (
              <div className="py-12 text-center text-sm text-gray-400">
                No PM tasks match the selected filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <span className="font-semibold text-gray-600">Status colours:</span>
        {(Object.entries(STATUS_CONFIG) as [PMStatus, typeof STATUS_CONFIG[PMStatus]][]).map(
          ([key, cfg]) => (
            <span key={key} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "h-3 w-5 rounded-full border",
                  cfg.className
                )}
              />
              {cfg.label}
            </span>
          )
        )}
      </div>

      {/* Add PM Dialog */}
      <AddPMDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        machines={machineOptions}
        companyId={companyId}
        onSuccess={fetchData}
      />
    </div>
  );
}
