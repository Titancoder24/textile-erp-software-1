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

import { cn } from "@/lib/utils";
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
// Mock data
// ---------------------------------------------------------------------------

type PMStatus = "done" | "due" | "overdue" | "scheduled";
type PMType = "oiling" | "belt_change" | "calibration" | "full_service" | "filter_change" | "lubrication";
type PMFrequency = "weekly" | "monthly" | "quarterly" | "annual";

interface PMTask {
  id: string;
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

const MOCK_PM_TASKS: PMTask[] = [
  {
    id: "PM-001",
    machineCode: "SEW-001",
    machineName: "Brother Lock Stitch",
    department: "Sewing",
    pmType: "oiling",
    frequency: "weekly",
    lastDone: "19 Feb 2026",
    nextDue: "26 Feb 2026",
    status: "due",
    assignedTo: "Muthukumar Raja",
    estimatedHours: 0.5,
    notes: "Oil needle bar, presser foot assembly, hook assembly",
  },
  {
    id: "PM-002",
    machineCode: "SEW-003",
    machineName: "Pegasus Overlock",
    department: "Sewing",
    pmType: "calibration",
    frequency: "monthly",
    lastDone: "10 Jan 2026",
    nextDue: "10 Feb 2026",
    status: "overdue",
    assignedTo: "Siva Subramaniam",
    estimatedHours: 1.5,
    notes: "Thread tension calibration and needle plate alignment",
  },
  {
    id: "PM-003",
    machineCode: "CUT-001",
    machineName: "Eastman Straight Knife",
    department: "Cutting",
    pmType: "belt_change",
    frequency: "quarterly",
    lastDone: "10 Nov 2025",
    nextDue: "10 Feb 2026",
    status: "overdue",
    assignedTo: "Dinesh Kumar",
    estimatedHours: 2.0,
    notes: "Replace drive belt and blade guard",
  },
  {
    id: "PM-004",
    machineCode: "CUT-002",
    machineName: "Gerber Auto Cutter",
    department: "Cutting",
    pmType: "full_service",
    frequency: "quarterly",
    lastDone: "05 Aug 2025",
    nextDue: "05 Nov 2025",
    status: "overdue",
    assignedTo: "External Vendor",
    estimatedHours: 8.0,
    notes: "Full service by Gerber certified technician required",
  },
  {
    id: "PM-005",
    machineCode: "DYE-001",
    machineName: "Winch Dyeing Machine",
    department: "Dyeing",
    pmType: "lubrication",
    frequency: "monthly",
    lastDone: "20 Jan 2026",
    nextDue: "20 Feb 2026",
    status: "overdue",
    assignedTo: "Siva Subramaniam",
    estimatedHours: 1.0,
    notes: "Lubricate winch shaft bearings and drive chain",
  },
  {
    id: "PM-006",
    machineCode: "DYE-003",
    machineName: "Hydro Extractor",
    department: "Dyeing",
    pmType: "calibration",
    frequency: "monthly",
    lastDone: "01 Jan 2026",
    nextDue: "01 Feb 2026",
    status: "overdue",
    assignedTo: "Muthukumar Raja",
    estimatedHours: 2.0,
    notes: "Balance check and vibration analysis",
  },
  {
    id: "PM-007",
    machineCode: "FIN-001",
    machineName: "Hoffman Steam Press",
    department: "Finishing",
    pmType: "oiling",
    frequency: "weekly",
    lastDone: "19 Feb 2026",
    nextDue: "26 Feb 2026",
    status: "due",
    assignedTo: "Muthukumar Raja",
    estimatedHours: 0.5,
    notes: "Oil pressing head arm and foot pedal mechanism",
  },
  {
    id: "PM-008",
    machineCode: "FIN-002",
    machineName: "Boiler Unit A",
    department: "Finishing",
    pmType: "full_service",
    frequency: "annual",
    lastDone: "01 Feb 2025",
    nextDue: "01 Feb 2026",
    status: "overdue",
    assignedTo: "External Vendor",
    estimatedHours: 16.0,
    notes: "IBR statutory inspection + full service by Thermax",
  },
  {
    id: "PM-009",
    machineCode: "UTL-001",
    machineName: "Air Compressor A",
    department: "Maintenance",
    pmType: "filter_change",
    frequency: "monthly",
    lastDone: "15 Jan 2026",
    nextDue: "15 Feb 2026",
    status: "overdue",
    assignedTo: "Dinesh Kumar",
    estimatedHours: 0.5,
    notes: "Air filter, oil filter and separator element change",
  },
  {
    id: "PM-010",
    machineCode: "SEW-006",
    machineName: "Juki Flat Seamer",
    department: "Sewing",
    pmType: "oiling",
    frequency: "weekly",
    lastDone: "19 Feb 2026",
    nextDue: "26 Feb 2026",
    status: "due",
    assignedTo: "Muthukumar Raja",
    estimatedHours: 0.5,
    notes: "Lubricate all moving parts",
  },
  {
    id: "PM-011",
    machineCode: "DYE-002",
    machineName: "Jet Dyeing Machine",
    department: "Dyeing",
    pmType: "lubrication",
    frequency: "monthly",
    lastDone: "18 Jan 2026",
    nextDue: "18 Feb 2026",
    status: "overdue",
    assignedTo: "Siva Subramaniam",
    estimatedHours: 1.5,
    notes: "Seal inspection and pump lubrication",
  },
  {
    id: "PM-012",
    machineCode: "CUT-003",
    machineName: "Fusing Machine",
    department: "Cutting",
    pmType: "calibration",
    frequency: "monthly",
    lastDone: "14 Jan 2026",
    nextDue: "14 Mar 2026",
    status: "scheduled",
    assignedTo: "Dinesh Kumar",
    estimatedHours: 1.0,
    notes: "Temperature calibration for fusing belt",
  },
  {
    id: "PM-013",
    machineCode: "SEW-008",
    machineName: "Juki DDL-9000",
    department: "Sewing",
    pmType: "oiling",
    frequency: "weekly",
    lastDone: "26 Feb 2026",
    nextDue: "05 Mar 2026",
    status: "done",
    assignedTo: "Muthukumar Raja",
    estimatedHours: 0.5,
    notes: "Weekly lubrication completed",
  },
  {
    id: "PM-014",
    machineCode: "DYE-004",
    machineName: "Stenter Frame",
    department: "Dyeing",
    pmType: "belt_change",
    frequency: "quarterly",
    lastDone: "10 Nov 2025",
    nextDue: "10 May 2026",
    status: "scheduled",
    assignedTo: "Siva Subramaniam",
    estimatedHours: 4.0,
    notes: "Chain and pin replacement on stenter",
  },
  {
    id: "PM-015",
    machineCode: "UTL-003",
    machineName: "Generator Set",
    department: "Maintenance",
    pmType: "full_service",
    frequency: "quarterly",
    lastDone: "01 Nov 2025",
    nextDue: "01 Mar 2026",
    status: "due",
    assignedTo: "Dinesh Kumar",
    estimatedHours: 4.0,
    notes: "Oil change, air/fuel filter change, battery check",
  },
  {
    id: "PM-016",
    machineCode: "SEW-009",
    machineName: "Juki MO-6714",
    department: "Sewing",
    pmType: "oiling",
    frequency: "weekly",
    lastDone: "26 Feb 2026",
    nextDue: "05 Mar 2026",
    status: "done",
    assignedTo: "Muthukumar Raja",
    estimatedHours: 0.5,
    notes: "Weekly lubrication completed",
  },
  {
    id: "PM-017",
    machineCode: "FIN-003",
    machineName: "Tunnel Finisher",
    department: "Finishing",
    pmType: "filter_change",
    frequency: "monthly",
    lastDone: "10 Jan 2026",
    nextDue: "10 Mar 2026",
    status: "scheduled",
    assignedTo: "Muthukumar Raja",
    estimatedHours: 1.0,
    notes: "Air and condensate filter replacement",
  },
  {
    id: "PM-018",
    machineCode: "UTL-004",
    machineName: "Water Softener",
    department: "Maintenance",
    pmType: "full_service",
    frequency: "quarterly",
    lastDone: "10 Oct 2025",
    nextDue: "10 Apr 2026",
    status: "scheduled",
    assignedTo: "Siva Subramaniam",
    estimatedHours: 2.0,
    notes: "Salt replenishment and resin cleaning",
  },
  {
    id: "PM-019",
    machineCode: "SEW-010",
    machineName: "Brother B945",
    department: "Sewing",
    pmType: "calibration",
    frequency: "quarterly",
    lastDone: "08 Nov 2025",
    nextDue: "08 Mar 2026",
    status: "due",
    assignedTo: "Siva Subramaniam",
    estimatedHours: 1.5,
    notes: "Buttonhole size and stitch density calibration",
  },
  {
    id: "PM-020",
    machineCode: "DYE-005",
    machineName: "Drum Tumble Dryer",
    department: "Dyeing",
    pmType: "belt_change",
    frequency: "annual",
    lastDone: "05 Jan 2025",
    nextDue: "05 Apr 2026",
    status: "scheduled",
    assignedTo: "External Vendor",
    estimatedHours: 3.0,
    notes: "Drum drive belt and bearing replacement",
  },
];

const PM_COMPLIANCE_DATA = [
  { month: "Sep 25", planned: 18, completed: 15, pct: 83 },
  { month: "Oct 25", planned: 20, completed: 17, pct: 85 },
  { month: "Nov 25", planned: 19, completed: 14, pct: 74 },
  { month: "Dec 25", planned: 16, completed: 13, pct: 81 },
  { month: "Jan 26", planned: 20, completed: 16, pct: 80 },
  { month: "Feb 26", planned: 20, completed: 7, pct: 35 },
];

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

// ---------------------------------------------------------------------------
// Add PM Task Dialog
// ---------------------------------------------------------------------------

function AddPMDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [machineCode, setMachineCode] = React.useState("");
  const [pmType, setPmType] = React.useState<PMType>("oiling");
  const [frequency, setFrequency] = React.useState<PMFrequency>("monthly");
  const [scheduledDate, setScheduledDate] = React.useState("");
  const [assignedTo, setAssignedTo] = React.useState("");

  const ENGINEERS = [
    "Muthukumar Raja",
    "Dinesh Kumar",
    "Siva Subramaniam",
    "Rajesh Pillai",
    "External Vendor",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production: call schedulePM server action
    console.log("Scheduling PM", { machineCode, pmType, frequency, scheduledDate, assignedTo });
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
            <Label className="text-sm">Machine Code *</Label>
            <Input
              placeholder="e.g. SEW-001"
              value={machineCode}
              onChange={(e) => setMachineCode(e.target.value)}
              required
            />
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Scheduled Date *</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Assign To</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {ENGINEERS.map((eng) => (
                    <SelectItem key={eng} value={eng}>
                      {eng}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!machineCode || !scheduledDate}>
              Add PM Task
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
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [filterDept, setFilterDept] = React.useState("all");
  const [filterPMType, setFilterPMType] = React.useState("all");
  const [viewMode, setViewMode] = React.useState<"table" | "chart">("table");
  const [showAddDialog, setShowAddDialog] = React.useState(false);

  const overdueCount = MOCK_PM_TASKS.filter((t) => t.status === "overdue").length;
  const dueCount = MOCK_PM_TASKS.filter((t) => t.status === "due").length;
  const doneCount = MOCK_PM_TASKS.filter((t) => t.status === "done").length;
  const scheduledCount = MOCK_PM_TASKS.filter((t) => t.status === "scheduled").length;

  const latestCompliance = PM_COMPLIANCE_DATA[PM_COMPLIANCE_DATA.length - 1].pct;

  const filteredTasks = MOCK_PM_TASKS.filter((task) => {
    if (filterStatus !== "all" && task.status !== filterStatus) return false;
    if (filterDept !== "all" && task.department !== filterDept) return false;
    if (filterPMType !== "all" && task.pmType !== filterPMType) return false;
    return true;
  });

  const DEPARTMENTS = ["all", "Sewing", "Cutting", "Finishing", "Dyeing", "Maintenance"];

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
            label: "Completed (MTD)",
            value: doneCount,
            icon: CheckCircle2,
            iconBg: "bg-green-600",
            sub: "This month",
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
              <CardTitle className="text-base">PM Compliance Rate - Last 6 Months</CardTitle>
              <div className="text-right">
                <p className="text-xs text-gray-400">Current Month</p>
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
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: number, name: string): any => [
                    name === "pct" ? `${val}%` : val,
                    name === "pct" ? "Compliance" : name === "planned" ? "Planned" : "Completed",
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

        {/* PM type breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tasks by Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(Object.keys(PM_TYPE_LABELS) as PMType[]).map((type) => {
              const count = MOCK_PM_TASKS.filter((t) => t.pmType === type).length;
              const total = MOCK_PM_TASKS.length;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">{PM_TYPE_LABELS[type]}</span>
                    <span className="font-semibold text-gray-800">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100">
                    <div
                      className="h-1.5 rounded-full bg-blue-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
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
                    "ID",
                    "Machine",
                    "Department",
                    "PM Type",
                    "Frequency",
                    "Last Done",
                    "Next Due",
                    "Assigned To",
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
                        <span className="font-mono text-xs font-semibold text-blue-600">
                          {task.id}
                        </span>
                      </td>
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
                            {PM_TYPE_LABELS[task.pmType]}
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
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {task.assignedTo}
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
      />
    </div>
  );
}
