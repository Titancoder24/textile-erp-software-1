"use client";

import * as React from "react";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Pause,
  Activity,
  Plus,
  CalendarClock,
  Filter,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

type MachineStatus = "running" | "idle" | "maintenance" | "breakdown";

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
  breakdownCount: number;
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
  estimatedHours: number;
  elapsed: string;
}

const MOCK_MACHINES: Machine[] = [
  // Sewing
  { id: "1", code: "SEW-001", name: "Brother Lock Stitch", department: "Sewing", type: "Lock Stitch", status: "running", lastService: "15 Jan 2026", nextServiceDue: "15 Apr 2026", make: "Brother", breakdownCount: 0 },
  { id: "2", code: "SEW-002", name: "Brother Lock Stitch", department: "Sewing", type: "Lock Stitch", status: "running", lastService: "15 Jan 2026", nextServiceDue: "15 Apr 2026", make: "Brother", breakdownCount: 0 },
  { id: "3", code: "SEW-003", name: "Pegasus Overlock", department: "Sewing", type: "Overlock", status: "breakdown", lastService: "10 Dec 2025", nextServiceDue: "10 Mar 2026", make: "Pegasus", breakdownCount: 2 },
  { id: "4", code: "SEW-004", name: "Brother Button Attach", department: "Sewing", type: "Button Attach", status: "running", lastService: "20 Jan 2026", nextServiceDue: "20 Apr 2026", make: "Brother", breakdownCount: 0 },
  { id: "5", code: "SEW-005", name: "Singer Bartack", department: "Sewing", type: "Bartack", status: "maintenance", lastService: "05 Jan 2026", nextServiceDue: "05 Feb 2026", make: "Singer", breakdownCount: 1 },
  { id: "6", code: "SEW-006", name: "Juki Flat Seamer", department: "Sewing", type: "Flat Seam", status: "running", lastService: "12 Feb 2026", nextServiceDue: "12 May 2026", make: "Juki", breakdownCount: 0 },
  { id: "7", code: "SEW-007", name: "Brother Kansai Special", department: "Sewing", type: "Multi-needle", status: "idle", lastService: "01 Feb 2026", nextServiceDue: "01 May 2026", make: "Brother", breakdownCount: 0 },
  { id: "8", code: "SEW-008", name: "Juki DDL-9000", department: "Sewing", type: "Lock Stitch", status: "running", lastService: "18 Jan 2026", nextServiceDue: "18 Apr 2026", make: "Juki", breakdownCount: 0 },

  // Cutting
  { id: "9", code: "CUT-001", name: "Eastman Straight Knife", department: "Cutting", type: "Straight Knife", status: "running", lastService: "10 Jan 2026", nextServiceDue: "10 Mar 2026", make: "Eastman", breakdownCount: 0 },
  { id: "10", code: "CUT-002", name: "Gerber Auto Cutter", department: "Cutting", type: "Auto Cutter", status: "breakdown", lastService: "05 Nov 2025", nextServiceDue: "05 Feb 2026", make: "Gerber", breakdownCount: 3 },
  { id: "11", code: "CUT-003", name: "Fusing Machine", department: "Cutting", type: "Fusing", status: "running", lastService: "14 Jan 2026", nextServiceDue: "14 Apr 2026", make: "Kannegiesser", breakdownCount: 0 },
  { id: "12", code: "CUT-004", name: "Spreading Machine", department: "Cutting", type: "Spreader", status: "idle", lastService: "20 Dec 2025", nextServiceDue: "20 Mar 2026", make: "Eastman", breakdownCount: 0 },

  // Finishing
  { id: "13", code: "FIN-001", name: "Hoffman Steam Press", department: "Finishing", type: "Steam Press", status: "running", lastService: "15 Feb 2026", nextServiceDue: "15 May 2026", make: "Hoffman", breakdownCount: 0 },
  { id: "14", code: "FIN-002", name: "Boiler Unit A", department: "Finishing", type: "Boiler", status: "maintenance", lastService: "01 Jan 2026", nextServiceDue: "01 Feb 2026", make: "Thermax", breakdownCount: 0 },
  { id: "15", code: "FIN-003", name: "Tunnel Finisher", department: "Finishing", type: "Tunnel Finish", status: "running", lastService: "10 Jan 2026", nextServiceDue: "10 Apr 2026", make: "Veit", breakdownCount: 0 },
  { id: "16", code: "FIN-004", name: "Tag Gun Station", department: "Finishing", type: "Tag Gun", status: "running", lastService: "01 Feb 2026", nextServiceDue: "01 May 2026", make: "Avery Dennison", breakdownCount: 0 },

  // Dyeing
  { id: "17", code: "DYE-001", name: "Winch Dyeing Machine", department: "Dyeing", type: "Winch", status: "running", lastService: "20 Jan 2026", nextServiceDue: "20 Apr 2026", make: "Fongs", breakdownCount: 0 },
  { id: "18", code: "DYE-002", name: "Jet Dyeing Machine", department: "Dyeing", type: "Jet", status: "running", lastService: "18 Jan 2026", nextServiceDue: "18 Apr 2026", make: "Thies", breakdownCount: 0 },
  { id: "19", code: "DYE-003", name: "Hydro Extractor", department: "Dyeing", type: "Extractor", status: "breakdown", lastService: "01 Oct 2025", nextServiceDue: "01 Jan 2026", make: "Bianco", breakdownCount: 1 },
  { id: "20", code: "DYE-004", name: "Stenter Frame", department: "Dyeing", type: "Stenter", status: "running", lastService: "10 Feb 2026", nextServiceDue: "10 May 2026", make: "Monforts", breakdownCount: 0 },
  { id: "21", code: "DYE-005", name: "Drum Tumble Dryer", department: "Dyeing", type: "Dryer", status: "running", lastService: "05 Jan 2026", nextServiceDue: "05 Apr 2026", make: "Thies", breakdownCount: 0 },

  // Utility / Maintenance
  { id: "22", code: "UTL-001", name: "Air Compressor A", department: "Maintenance", type: "Compressor", status: "running", lastService: "15 Jan 2026", nextServiceDue: "15 Mar 2026", make: "Atlas Copco", breakdownCount: 0 },
  { id: "23", code: "UTL-002", name: "Air Compressor B", department: "Maintenance", type: "Compressor", status: "idle", lastService: "15 Jan 2026", nextServiceDue: "15 Mar 2026", make: "Atlas Copco", breakdownCount: 0 },
  { id: "24", code: "UTL-003", name: "Generator Set", department: "Maintenance", type: "Generator", status: "running", lastService: "01 Feb 2026", nextServiceDue: "01 May 2026", make: "Cummins", breakdownCount: 0 },
  { id: "25", code: "UTL-004", name: "Water Softener", department: "Maintenance", type: "WTP", status: "running", lastService: "10 Jan 2026", nextServiceDue: "10 Apr 2026", make: "Thermax", breakdownCount: 0 },

  // Extra sewing machines to reach 30
  { id: "26", code: "SEW-009", name: "Juki MO-6714", department: "Sewing", type: "Overlock", status: "running", lastService: "10 Feb 2026", nextServiceDue: "10 May 2026", make: "Juki", breakdownCount: 0 },
  { id: "27", code: "SEW-010", name: "Brother B945", department: "Sewing", type: "Buttonhole", status: "running", lastService: "08 Feb 2026", nextServiceDue: "08 May 2026", make: "Brother", breakdownCount: 0 },
  { id: "28", code: "SEW-011", name: "Juki LBH-1790", department: "Sewing", type: "Buttonhole", status: "maintenance", lastService: "01 Dec 2025", nextServiceDue: "01 Mar 2026", make: "Juki", breakdownCount: 0 },
  { id: "29", code: "CUT-005", name: "Band Knife", department: "Cutting", type: "Band Knife", status: "running", lastService: "05 Feb 2026", nextServiceDue: "05 May 2026", make: "Eastman", breakdownCount: 0 },
  { id: "30", code: "FIN-005", name: "Label Printing Machine", department: "Finishing", type: "Label Printer", status: "running", lastService: "12 Jan 2026", nextServiceDue: "12 Apr 2026", make: "Zebra", breakdownCount: 0 },
];

const MOCK_TICKETS: MaintenanceTicket[] = [
  { id: "MCT-001", machineCode: "SEW-003", machineName: "Pegasus Overlock", department: "Sewing", issueType: "Needle thread breakage", reportedTime: "26 Feb 2026 09:15", priority: "P2", assignedTo: "Muthukumar Raja", status: "in_progress", estimatedHours: 2, elapsed: "3h 45m" },
  { id: "MCT-002", machineCode: "CUT-002", machineName: "Gerber Auto Cutter", department: "Cutting", issueType: "Motor failure - not starting", reportedTime: "25 Feb 2026 14:30", priority: "P1", assignedTo: "Dinesh Kumar", status: "pending_parts", estimatedHours: 8, elapsed: "19h 30m" },
  { id: "MCT-003", machineCode: "DYE-003", machineName: "Hydro Extractor", department: "Dyeing", issueType: "Vibration at high speed", reportedTime: "26 Feb 2026 07:00", priority: "P2", assignedTo: "Siva Subramaniam", status: "open", estimatedHours: 4, elapsed: "6h 00m" },
  { id: "MCT-004", machineCode: "SEW-005", machineName: "Singer Bartack", department: "Sewing", issueType: "Thread tension inconsistency", reportedTime: "25 Feb 2026 16:00", priority: "P3", assignedTo: "Muthukumar Raja", status: "in_progress", estimatedHours: 1, elapsed: "17h 30m" },
  { id: "MCT-005", machineCode: "FIN-002", machineName: "Boiler Unit A", department: "Finishing", issueType: "Scheduled annual maintenance", reportedTime: "24 Feb 2026 08:00", priority: "P3", assignedTo: "External Vendor", status: "in_progress", estimatedHours: 16, elapsed: "2d 2h" },
  { id: "MCT-006", machineCode: "SEW-011", machineName: "Juki LBH-1790", department: "Sewing", issueType: "Bobbin winder malfunction", reportedTime: "26 Feb 2026 10:00", priority: "P3", assignedTo: "Dinesh Kumar", status: "open", estimatedHours: 1, elapsed: "3h 00m" },
  { id: "MCT-007", machineCode: "UTL-002", machineName: "Air Compressor B", department: "Maintenance", issueType: "Scheduled oiling and filter change", reportedTime: "26 Feb 2026 11:30", priority: "P3", assignedTo: "Siva Subramaniam", status: "open", estimatedHours: 1, elapsed: "1h 30m" },
];

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
  maintenance: {
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
  const cfg = STATUS_CONFIG[machine.status];

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

      {/* Breakdown badge */}
      {machine.breakdownCount > 0 && (
        <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow">
          {machine.breakdownCount}
        </div>
      )}

      {/* Details */}
      <div className="space-y-1 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Make</span>
          <span className="font-medium text-gray-700">{machine.make}</span>
        </div>
        <div className="flex justify-between">
          <span>Last Service</span>
          <span className="font-medium text-gray-700">{machine.lastService}</span>
        </div>
        <div className="flex justify-between">
          <span>Next Due</span>
          <span
            className={cn(
              "font-medium",
              machine.nextServiceDue < "01 Mar 2026"
                ? "text-red-600"
                : machine.nextServiceDue < "01 Apr 2026"
                ? "text-amber-600"
                : "text-gray-700"
            )}
          >
            {machine.nextServiceDue}
          </span>
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

function OEEMeter() {
  const availability = 92;
  const performance = 78;
  const quality = 96;
  const oee = Math.round((availability * performance * quality) / 10000);

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
              OEE = Availability × Performance × Quality
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
          Formula: {availability}% × {performance}% × {quality}% = {oee}%
        </p>
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
}: {
  machine: Machine | null;
  open: boolean;
  onClose: () => void;
}) {
  const [priority, setPriority] = React.useState<Priority>("P2");
  const [description, setDescription] = React.useState("");
  const [engineer, setEngineer] = React.useState("");

  const ENGINEERS = [
    "Muthukumar Raja",
    "Dinesh Kumar",
    "Siva Subramaniam",
    "Rajesh Pillai",
    "External Vendor",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production: call logBreakdown server action
    console.log("Logging breakdown for", machine?.code, { priority, description, engineer });
    setDescription("");
    setEngineer("");
    setPriority("P2");
    onClose();
  };

  if (!machine) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Breakdown - {machine.code}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
            <span className="font-medium text-gray-700">{machine.name}</span>
            <span className="text-gray-400 ml-2">({machine.department})</span>
          </div>

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

          <div className="grid grid-cols-2 gap-3">
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
            <div className="space-y-1.5">
              <Label className="text-sm">Assign Engineer</Label>
              <Select value={engineer} onValueChange={setEngineer}>
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
            <Button type="submit" disabled={!description}>
              Log Breakdown
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
  const [activeDept, setActiveDept] = React.useState("All");
  const [selectedMachine, setSelectedMachine] = React.useState<Machine | null>(null);
  const [showBreakdownDialog, setShowBreakdownDialog] = React.useState(false);

  const totalMachines = MOCK_MACHINES.length;
  const runningCount = MOCK_MACHINES.filter((m) => m.status === "running").length;
  const maintenanceCount = MOCK_MACHINES.filter((m) => m.status === "maintenance").length;
  const breakdownCount = MOCK_MACHINES.filter((m) => m.status === "breakdown").length;
  const pmDueThisWeek = 8; // mock

  const filteredMachines =
    activeDept === "All"
      ? MOCK_MACHINES
      : MOCK_MACHINES.filter((m) => m.department === activeDept);

  const handleLogBreakdown = (machine: Machine) => {
    setSelectedMachine(machine);
    setShowBreakdownDialog(true);
  };

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
              onClick={() =>
                handleLogBreakdown({
                  id: "",
                  code: "",
                  name: "",
                  department: "",
                  type: "",
                  status: "running",
                  lastService: "",
                  nextServiceDue: "",
                  make: "",
                  breakdownCount: 0,
                })
              }
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
            sub: `${Math.round((runningCount / totalMachines) * 100)}% uptime`,
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
            label: "PM Due This Week",
            value: pmDueThisWeek,
            icon: CalendarClock,
            iconBg: "bg-blue-600",
            sub: "Scheduled tasks",
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
            {DEPARTMENTS.map((dept) => (
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
                    ? MOCK_MACHINES.length
                    : MOCK_MACHINES.filter((m) => m.department === dept).length}
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredMachines.map((machine) => (
              <MachineCard
                key={machine.id}
                machine={machine}
                onLogBreakdown={handleLogBreakdown}
              />
            ))}
          </div>
        </TabsContent>

        {/* Maintenance queue tab */}
        <TabsContent value="queue">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Active Maintenance Tickets ({MOCK_TICKETS.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
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
                    {MOCK_TICKETS.map((ticket) => {
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* OEE tab */}
        <TabsContent value="oee">
          <div className="grid gap-4 lg:grid-cols-2">
            <OEEMeter />
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Department-wise Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { dept: "Sewing", machines: 11, running: 9, pct: 82 },
                  { dept: "Cutting", machines: 5, running: 4, pct: 80 },
                  { dept: "Finishing", machines: 5, running: 4, pct: 80 },
                  { dept: "Dyeing", machines: 5, running: 4, pct: 80 },
                  { dept: "Maintenance", machines: 4, running: 3, pct: 75 },
                ].map((row) => (
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
              </CardContent>
            </Card>
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
      />
    </div>
  );
}
