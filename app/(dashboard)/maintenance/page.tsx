"use client";

import * as React from "react";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  CalendarClock,
  Filter,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useCompany } from "@/contexts/company-context";
import {
  getMachines,
  getMaintenanceStats,
  logBreakdown,
} from "@/lib/actions/maintenance";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Textarea } from "@/components/ui/textarea";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MachineStatus = "running" | "idle" | "under_maintenance" | "breakdown";

interface Machine {
  id: string;
  code: string;
  name: string;
  department: string;
  type: string;
  status: MachineStatus;
  lastService: string;
  nextServiceDue: string;
  make: string;
}

type Priority = "P1" | "P2" | "P3";
type TicketStatus = "open" | "in_progress" | "pending_parts" | "resolved";

interface MaintenanceTicket {
  id: string;
  machineCode: string;
  machineName: string;
  department: string;
  issueType: string;
  reportedTime: string;
  priority: Priority;
  assignedTo: string;
  status: TicketStatus;
  elapsed: string;
}

interface Stats {
  total: number;
  running: number;
  under_maintenance: number;
  breakdown: number;
  idle: number;
  oee: { availability: number; performance: number; quality: number; oee: number };
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  MachineStatus,
  { label: string; dotClass: string; badgeClass: string; cardBorder: string }
> = {
  running: {
    label: "Running",
    dotClass: "bg-green-500",
    badgeClass: "bg-green-100 text-green-800 border-green-200",
    cardBorder: "border-l-green-500",
  },
  idle: {
    label: "Idle",
    dotClass: "bg-blue-400",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    cardBorder: "border-l-blue-400",
  },
  under_maintenance: {
    label: "Maintenance",
    dotClass: "bg-yellow-500",
    badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-200",
    cardBorder: "border-l-yellow-500",
  },
  breakdown: {
    label: "Breakdown",
    dotClass: "bg-red-600 animate-pulse",
    badgeClass: "bg-red-100 text-red-800 border-red-200",
    cardBorder: "border-l-red-600",
  },
};

const PRIORITY_CONFIG: Record<Priority, { className: string; label: string }> = {
  P1: { className: "bg-red-100 text-red-800 border-red-300", label: "P1 Critical" },
  P2: { className: "bg-amber-100 text-amber-800 border-amber-300", label: "P2 High" },
  P3: { className: "bg-gray-100 text-gray-700 border-gray-300", label: "P3 Normal" },
};

const TICKET_STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; className: string }
> = {
  open: { label: "Open", className: "bg-red-50 text-red-700 border-red-200" },
  in_progress: { label: "In Progress", className: "bg-blue-50 text-blue-700 border-blue-200" },
  pending_parts: { label: "Pending Parts", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  resolved: { label: "Resolved", className: "bg-green-50 text-green-700 border-green-200" },
};

const DEPARTMENTS = ["All", "Sewing", "Cutting", "Finishing", "Dyeing", "Maintenance"];

// ---------------------------------------------------------------------------
// Machine card
// ---------------------------------------------------------------------------

function MachineCard({
  machine,
  onLogBreakdown,
}: {
  machine: Machine;
  onLogBreakdown: (machine: Machine) => void;
}) {
  const cfg = STATUS_CONFIG[machine.status] ?? STATUS_CONFIG.running;

  return (
    <div
      className={cn(
        "relative rounded-xl border-l-4 border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
        cfg.cardBorder
      )}
    >
      {/* Status dot */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="text-xs font-mono text-gray-400">{machine.code}</p>
          <p className="text-sm font-bold text-gray-900 truncate leading-tight mt-0.5">
            {machine.name}
          </p>
          <p className="text-xs text-gray-500">{machine.type}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={cn(
              "inline-flex h-2 w-2 rounded-full",
              cfg.dotClass
            )}
          />
          <span
            className={cn(
              "rounded-full border px-1.5 py-0.5 text-[10px] font-bold",
              cfg.badgeClass
            )}
          >
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Make</span>
          <span className="font-medium text-gray-700">{machine.make || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span>Last Service</span>
          <span className="font-medium text-gray-700">{machine.lastService || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span>Next Due</span>
          <span className="font-medium text-gray-700">{machine.nextServiceDue || "—"}</span>
        </div>
      </div>

      {/* Action */}
      {machine.status !== "running" && machine.status !== "idle" && (
        <Button
          size="sm"
          variant="outline"
          className="mt-3 w-full text-xs h-7 border-red-200 text-red-700 hover:bg-red-50"
          onClick={() => onLogBreakdown(machine)}
        >
          <AlertTriangle className="mr-1 h-3 w-3" />
          {machine.status === "breakdown" ? "Update Breakdown" : "Log Issue"}
        </Button>
      )}
      {(machine.status === "running" || machine.status === "idle") && (
        <Button
          size="sm"
          variant="ghost"
          className="mt-3 w-full text-xs h-7 text-gray-500 hover:text-red-600"
          onClick={() => onLogBreakdown(machine)}
        >
          <Plus className="mr-1 h-3 w-3" />
          Log Breakdown
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// OEE meter
// ---------------------------------------------------------------------------

function OEEMeter({ stats }: { stats: Stats }) {
  const { availability, performance, quality, oee } = stats.oee;

  const metrics = [
    { label: "Availability", value: availability, color: "bg-blue-500", description: "Uptime / Planned time" },
    { label: "Performance", value: performance, color: "bg-purple-500", description: "Actual speed / Ideal speed" },
    { label: "Quality", value: quality, color: "bg-green-500", description: "Good output / Total output" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">OEE Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* OEE big number */}
        <div className="flex items-center justify-between rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
          <div>
            <p className="text-xs text-gray-500 font-medium">Overall Equipment Effectiveness</p>
            <p className="text-xs text-gray-400 mt-0.5">
              OEE = Availability x Performance x Quality
            </p>
          </div>
          <div className="text-right">
            <p
              className={cn(
                "text-3xl font-black tabular-nums",
                oee >= 85 ? "text-green-600" : oee >= 65 ? "text-yellow-600" : "text-red-600"
              )}
            >
              {oee}%
            </p>
            <p className="text-xs text-gray-400">World class = 85%</p>
          </div>
        </div>

        {/* Individual metrics */}
        {metrics.map((m) => (
          <div key={m.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium text-gray-800">{m.label}</span>
                <span className="text-xs text-gray-400 ml-2">{m.description}</span>
              </div>
              <span className="font-bold tabular-nums text-gray-900">{m.value}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100">
              <div
                className={cn("h-2 rounded-full transition-all", m.color)}
                style={{ width: `${m.value}%` }}
              />
            </div>
          </div>
        ))}

        <p className="text-xs text-gray-400 italic">
          Formula: {availability}% x {performance}% x {quality}% = {oee}%
        </p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Department availability card
// ---------------------------------------------------------------------------

function DepartmentAvailability({ machines }: { machines: Machine[] }) {
  // Group by department and compute availability
  const deptMap: Record<string, { total: number; running: number }> = {};
  for (const m of machines) {
    if (!deptMap[m.department]) {
      deptMap[m.department] = { total: 0, running: 0 };
    }
    deptMap[m.department].total++;
    if (m.status === "running") {
      deptMap[m.department].running++;
    }
  }

  const rows = Object.entries(deptMap)
    .map(([dept, data]) => ({
      dept,
      machines: data.total,
      running: data.running,
      pct: data.total > 0 ? Math.round((data.running / data.total) * 100) : 0,
    }))
    .sort((a, b) => a.dept.localeCompare(b.dept));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Department-wise Availability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row) => (
          <div key={row.dept} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-800">{row.dept}</span>
                <span className="text-xs text-gray-400">
                  ({row.running}/{row.machines} running)
                </span>
              </div>
              <span
                className={cn(
                  "font-bold tabular-nums text-sm",
                  row.pct >= 90
                    ? "text-green-700"
                    : row.pct >= 75
                    ? "text-yellow-700"
                    : "text-red-700"
                )}
              >
                {row.pct}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  row.pct >= 90
                    ? "bg-green-500"
                    : row.pct >= 75
                    ? "bg-yellow-500"
                    : "bg-red-500"
                )}
                style={{ width: `${row.pct}%` }}
              />
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No machine data available.</p>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Log Breakdown Dialog
// ---------------------------------------------------------------------------

function LogBreakdownDialog({
  machine,
  open,
  onClose,
  machines,
  companyId,
  userId,
  onSuccess,
}: {
  machine: Machine | null;
  open: boolean;
  onClose: () => void;
  machines: Machine[];
  companyId: string;
  userId: string;
  onSuccess: () => void;
}) {
  const [priority, setPriority] = React.useState<Priority>("P2");
  const [description, setDescription] = React.useState("");
  const [selectedMachineId, setSelectedMachineId] = React.useState(machine?.id ?? "");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (machine?.id) setSelectedMachineId(machine.id);
  }, [machine]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const machineId = selectedMachineId || machine?.id;
    if (!machineId) {
      toast.error("Please select a machine");
      return;
    }
    if (!description.trim()) {
      toast.error("Issue description is required");
      return;
    }

    setSaving(true);
    const { error } = await logBreakdown({
      machine_id: machineId,
      company_id: companyId,
      issue_description: description,
      severity: priority,
      reported_by: userId,
    });
    setSaving(false);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Breakdown logged successfully");
    setDescription("");
    setPriority("P2");
    setSelectedMachineId("");
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Log Breakdown{machine?.code ? ` - ${machine.code}` : ""}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {machine?.id ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
              <span className="font-medium text-gray-700">{machine.name}</span>
              <span className="text-gray-400 ml-2">({machine.department})</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-sm">Select Machine *</Label>
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
          )}

          <div className="space-y-1.5">
            <Label className="text-sm">Issue Description *</Label>
            <Textarea
              placeholder="Describe the problem in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Severity / Priority *</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="P1">P1 - Critical (Line stopped)</SelectItem>
                <SelectItem value="P2">P2 - High (Degraded)</SelectItem>
                <SelectItem value="P3">P3 - Normal (Minor issue)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={!description || saving}>
              {saving ? "Logging..." : "Log Breakdown"}
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

export default function MaintenancePage() {
  const { companyId, userId } = useCompany();

  const [machines, setMachines] = React.useState<Machine[]>([]);
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [tickets, setTickets] = React.useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [activeDept, setActiveDept] = React.useState("All");
  const [selectedMachine, setSelectedMachine] = React.useState<Machine | null>(null);
  const [showBreakdownDialog, setShowBreakdownDialog] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    setLoading(true);

    const [machinesResult, statsResult] = await Promise.all([
      getMachines(companyId),
      getMaintenanceStats(companyId),
    ]);

    if (machinesResult.error) {
      toast.error(machinesResult.error);
    }
    if (statsResult.error) {
      toast.error(statsResult.error);
    }

    // Map machine data from DB to local Machine type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedMachines: Machine[] = (machinesResult.data ?? []).map((m: any) => ({
      id: m.id,
      code: m.machine_code ?? "",
      name: m.name ?? "",
      department: m.department ?? "",
      type: m.machine_type ?? "",
      status: (m.status as MachineStatus) ?? "running",
      lastService: m.last_serviced_at ?? "",
      nextServiceDue: m.next_service_due ?? "",
      make: m.make ?? "",
    }));

    setMachines(mappedMachines);

    if (statsResult.data) {
      setStats(statsResult.data as Stats);
    }

    // Derive maintenance tickets from machines that are in breakdown or under_maintenance
    const breakdownMachines = mappedMachines.filter(
      (m) => m.status === "breakdown" || m.status === "under_maintenance"
    );
    const derivedTickets: MaintenanceTicket[] = breakdownMachines.map((m, idx) => ({
      id: `MCT-${String(idx + 1).padStart(3, "0")}`,
      machineCode: m.code,
      machineName: m.name,
      department: m.department,
      issueType: m.status === "breakdown" ? "Breakdown - needs attention" : "Scheduled maintenance",
      reportedTime: "—",
      priority: m.status === "breakdown" ? ("P1" as Priority) : ("P3" as Priority),
      assignedTo: "—",
      status: m.status === "breakdown" ? ("open" as TicketStatus) : ("in_progress" as TicketStatus),
      elapsed: "—",
    }));
    setTickets(derivedTickets);

    setLoading(false);
  }, [companyId]);

  React.useEffect(() => {
    if (companyId) {
      fetchData();
    }
  }, [companyId, fetchData]);

  const totalMachines = machines.length;
  const runningCount = machines.filter((m) => m.status === "running").length;
  const maintenanceCount = machines.filter((m) => m.status === "under_maintenance").length;
  const breakdownCount = machines.filter((m) => m.status === "breakdown").length;
  const idleCount = machines.filter((m) => m.status === "idle").length;

  // Compute unique departments from actual data
  const uniqueDepts = Array.from(new Set(machines.map((m) => m.department))).sort();
  const deptFilters = ["All", ...uniqueDepts];

  const filteredMachines =
    activeDept === "All"
      ? machines
      : machines.filter((m) => m.department === activeDept);

  const handleLogBreakdown = (machine: Machine) => {
    setSelectedMachine(machine);
    setShowBreakdownDialog(true);
  };

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
        title="Machine Maintenance (TPM)"
        description="Total Productive Maintenance - machine status, breakdowns, and scheduling"
        breadcrumb={[
          { label: "Dashboard", href: "/" },
          { label: "Maintenance" },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedMachine(null);
                setShowBreakdownDialog(true);
              }}
            >
              <AlertTriangle className="mr-1.5 h-4 w-4 text-red-500" />
              Log Breakdown
            </Button>
            <Button size="sm" asChild>
              <a href="/maintenance/schedule">
                <CalendarClock className="mr-1.5 h-4 w-4" />
                Schedule PM
              </a>
            </Button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[
          {
            label: "Total Machines",
            value: totalMachines,
            icon: Wrench,
            iconBg: "bg-gray-700",
            sub: "All departments",
          },
          {
            label: "Running",
            value: runningCount,
            icon: CheckCircle2,
            iconBg: "bg-green-600",
            sub: totalMachines > 0 ? `${Math.round((runningCount / totalMachines) * 100)}% uptime` : "—",
          },
          {
            label: "Under Maintenance",
            value: maintenanceCount,
            icon: Wrench,
            iconBg: "bg-yellow-500",
            sub: "Planned / PM",
          },
          {
            label: "Breakdown",
            value: breakdownCount,
            icon: AlertTriangle,
            iconBg: "bg-red-600",
            sub: "Needs immediate attention",
          },
          {
            label: "Idle",
            value: idleCount,
            icon: CalendarClock,
            iconBg: "bg-blue-600",
            sub: "Not in use",
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

      {/* Main content tabs */}
      <Tabs defaultValue="machines" className="space-y-4">
        <TabsList>
          <TabsTrigger value="machines">Machine Status Grid</TabsTrigger>
          <TabsTrigger value="queue">Maintenance Queue</TabsTrigger>
          <TabsTrigger value="oee">OEE Metrics</TabsTrigger>
        </TabsList>

        {/* Machine grid tab */}
        <TabsContent value="machines" className="space-y-4">
          {/* Department filter tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            {deptFilters.map((dept) => (
              <button
                key={dept}
                onClick={() => setActiveDept(dept)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                  activeDept === dept
                    ? "border-blue-300 bg-blue-600 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:text-blue-700"
                )}
              >
                {dept}
                <span className="ml-1.5 text-[10px] opacity-70">
                  (
                  {dept === "All"
                    ? machines.length
                    : machines.filter((m) => m.department === dept).length}
                  )
                </span>
              </button>
            ))}
          </div>

          {/* Status legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            {(Object.entries(STATUS_CONFIG) as [MachineStatus, typeof STATUS_CONFIG[MachineStatus]][]).map(
              ([key, cfg]) => (
                <span key={key} className="flex items-center gap-1.5">
                  <span className={cn("h-2 w-2 rounded-full", cfg.dotClass)} />
                  {cfg.label}
                </span>
              )
            )}
          </div>

          {/* Machine cards grid */}
          {filteredMachines.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">
              No machines found for the selected department.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredMachines.map((machine) => (
                <MachineCard
                  key={machine.id}
                  machine={machine}
                  onLogBreakdown={handleLogBreakdown}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Maintenance queue tab */}
        <TabsContent value="queue">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Active Maintenance Tickets ({tickets.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <CheckCircle2 className="mb-3 h-8 w-8 text-green-400" />
                  <p className="text-sm font-medium text-gray-600">All machines operational</p>
                  <p className="text-xs text-gray-400">No active maintenance tickets</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        {[
                          "Ticket ID",
                          "Machine",
                          "Department",
                          "Issue Type",
                          "Reported",
                          "Priority",
                          "Assigned To",
                          "Status",
                          "Elapsed",
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
                      {tickets.map((ticket) => {
                        const pCfg = PRIORITY_CONFIG[ticket.priority];
                        const sCfg = TICKET_STATUS_CONFIG[ticket.status];
                        return (
                          <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <span className="font-mono text-xs font-semibold text-blue-600">
                                {ticket.id}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                                {ticket.machineCode}
                              </p>
                              <p className="text-xs text-gray-400 max-w-[140px] truncate">
                                {ticket.machineName}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                              {ticket.department}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 max-w-[180px]">
                              <span className="line-clamp-2">{ticket.issueType}</span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                              {ticket.reportedTime}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={cn(
                                  "rounded-full border px-2 py-0.5 text-xs font-bold",
                                  pCfg.className
                                )}
                              >
                                {pCfg.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                              {ticket.assignedTo}
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
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 text-xs">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span
                                  className={cn(
                                    "font-medium",
                                    ticket.priority === "P1" && ticket.status !== "resolved"
                                      ? "text-red-600"
                                      : "text-gray-600"
                                  )}
                                >
                                  {ticket.elapsed}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* OEE tab */}
        <TabsContent value="oee">
          <div className="grid gap-4 lg:grid-cols-2">
            {stats && <OEEMeter stats={stats} />}
            <DepartmentAvailability machines={machines} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Log Breakdown Dialog */}
      <LogBreakdownDialog
        machine={selectedMachine}
        open={showBreakdownDialog}
        onClose={() => {
          setShowBreakdownDialog(false);
          setSelectedMachine(null);
        }}
        machines={machines}
        companyId={companyId}
        userId={userId}
        onSuccess={fetchData}
      />
    </div>
  );
}
