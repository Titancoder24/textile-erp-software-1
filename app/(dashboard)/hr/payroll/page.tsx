"use client";

import * as React from "react";
import {
  Users,
  DollarSign,
  TrendingDown,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  Download,
  Play,
  Printer,
} from "lucide-react";

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

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

type PayrollStatus = "finalized" | "pending" | "processing";

interface PayrollRecord {
  id: string;
  empCode: string;
  name: string;
  department: string;
  designation: string;
  basic: number;
  hra: number;
  specialAllowance: number;
  transportAllowance: number;
  gross: number;
  pf: number;
  esi: number;
  tds: number;
  otherDeductions: number;
  net: number;
  workingDays: number;
  presentDays: number;
  status: PayrollStatus;
}

const MOCK_PAYROLL: PayrollRecord[] = [
  {
    id: "1",
    empCode: "EMP001",
    name: "Ravi Kumar",
    department: "Sewing",
    designation: "Sr. Tailor",
    basic: 14000,
    hra: 5600,
    specialAllowance: 2000,
    transportAllowance: 800,
    gross: 22400,
    pf: 1680,
    esi: 336,
    tds: 0,
    otherDeductions: 0,
    net: 20384,
    workingDays: 25,
    presentDays: 25,
    status: "finalized",
  },
  {
    id: "2",
    empCode: "EMP002",
    name: "Sunita Devi",
    department: "Sewing",
    designation: "Tailor",
    basic: 10500,
    hra: 4200,
    specialAllowance: 1500,
    transportAllowance: 600,
    gross: 16800,
    pf: 1260,
    esi: 252,
    tds: 0,
    otherDeductions: 500,
    net: 14788,
    workingDays: 25,
    presentDays: 24,
    status: "finalized",
  },
  {
    id: "3",
    empCode: "EMP101",
    name: "Ramesh Patel",
    department: "Cutting",
    designation: "Cutting Master",
    basic: 22000,
    hra: 8800,
    specialAllowance: 4000,
    transportAllowance: 1200,
    gross: 36000,
    pf: 2640,
    esi: 0,
    tds: 2200,
    otherDeductions: 0,
    net: 31160,
    workingDays: 25,
    presentDays: 25,
    status: "finalized",
  },
  {
    id: "4",
    empCode: "EMP201",
    name: "Deepak Chauhan",
    department: "Finishing",
    designation: "Finishing Operator",
    basic: 9500,
    hra: 3800,
    specialAllowance: 1200,
    transportAllowance: 600,
    gross: 15100,
    pf: 1140,
    esi: 227,
    tds: 0,
    otherDeductions: 0,
    net: 13733,
    workingDays: 25,
    presentDays: 23,
    status: "pending",
  },
  {
    id: "5",
    empCode: "EMP301",
    name: "Vijay Reddy",
    department: "Quality",
    designation: "QC Inspector",
    basic: 18000,
    hra: 7200,
    specialAllowance: 3000,
    transportAllowance: 1000,
    gross: 29200,
    pf: 2160,
    esi: 0,
    tds: 1500,
    otherDeductions: 0,
    net: 25540,
    workingDays: 25,
    presentDays: 25,
    status: "finalized",
  },
  {
    id: "6",
    empCode: "EMP401",
    name: "Ganesh Iyer",
    department: "Store",
    designation: "Store Keeper",
    basic: 16500,
    hra: 6600,
    specialAllowance: 2500,
    transportAllowance: 1000,
    gross: 26600,
    pf: 1980,
    esi: 0,
    tds: 1200,
    otherDeductions: 0,
    net: 23420,
    workingDays: 25,
    presentDays: 24,
    status: "finalized",
  },
  {
    id: "7",
    empCode: "EMP501",
    name: "Chandran Pillai",
    department: "Dyeing",
    designation: "Dye Master",
    basic: 28000,
    hra: 11200,
    specialAllowance: 5000,
    transportAllowance: 1500,
    gross: 45700,
    pf: 3360,
    esi: 0,
    tds: 3800,
    otherDeductions: 0,
    net: 38540,
    workingDays: 25,
    presentDays: 25,
    status: "finalized",
  },
  {
    id: "8",
    empCode: "EMP601",
    name: "Kavya Menon",
    department: "Admin",
    designation: "HR Executive",
    basic: 20000,
    hra: 8000,
    specialAllowance: 3500,
    transportAllowance: 1200,
    gross: 32700,
    pf: 2400,
    esi: 0,
    tds: 2000,
    otherDeductions: 0,
    net: 28300,
    workingDays: 25,
    presentDays: 25,
    status: "pending",
  },
  {
    id: "9",
    empCode: "EMP602",
    name: "Rohit Malhotra",
    department: "Admin",
    designation: "Accounts Manager",
    basic: 25000,
    hra: 10000,
    specialAllowance: 4500,
    transportAllowance: 1500,
    gross: 41000,
    pf: 3000,
    esi: 0,
    tds: 3200,
    otherDeductions: 0,
    net: 34800,
    workingDays: 25,
    presentDays: 25,
    status: "pending",
  },
  {
    id: "10",
    empCode: "EMP701",
    name: "Muthukumar Raja",
    department: "Maintenance",
    designation: "Sr. Maintenance Tech",
    basic: 19000,
    hra: 7600,
    specialAllowance: 3000,
    transportAllowance: 1200,
    gross: 30800,
    pf: 2280,
    esi: 0,
    tds: 1800,
    otherDeductions: 0,
    net: 26720,
    workingDays: 25,
    presentDays: 24,
    status: "finalized",
  },
  {
    id: "11",
    empCode: "EMP008",
    name: "Nalini Krishnamurthy",
    department: "Sewing",
    designation: "Line Supervisor",
    basic: 24000,
    hra: 9600,
    specialAllowance: 4000,
    transportAllowance: 1500,
    gross: 39100,
    pf: 2880,
    esi: 0,
    tds: 2800,
    otherDeductions: 0,
    net: 33420,
    workingDays: 25,
    presentDays: 25,
    status: "finalized",
  },
  {
    id: "12",
    empCode: "EMP302",
    name: "Shobha Pillai",
    department: "Quality",
    designation: "QA Manager",
    basic: 32000,
    hra: 12800,
    specialAllowance: 6000,
    transportAllowance: 2000,
    gross: 52800,
    pf: 3840,
    esi: 0,
    tds: 5200,
    otherDeductions: 0,
    net: 43760,
    workingDays: 25,
    presentDays: 25,
    status: "finalized",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(n: number): string {
  return `\u20B9${n.toLocaleString("en-IN")}`;
}

function getStatusBadge(status: PayrollStatus) {
  const variants: Record<PayrollStatus, { label: string; className: string }> = {
    finalized: { label: "Finalized", className: "bg-green-100 text-green-800 border-green-200" },
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    processing: { label: "Processing", className: "bg-blue-100 text-blue-800 border-blue-200" },
  };
  const v = variants[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
        v.className
      )}
    >
      {v.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Expanded salary breakdown
// ---------------------------------------------------------------------------

function SalaryBreakdown({ record }: { record: PayrollRecord }) {
  return (
    <tr>
      <td colSpan={12} className="bg-gray-50 px-8 py-4">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {/* Earnings */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
              Earnings
            </h4>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Basic Salary</span>
                <span className="font-medium tabular-nums">{fmt(record.basic)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">HRA</span>
                <span className="font-medium tabular-nums">{fmt(record.hra)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Special Allowance</span>
                <span className="font-medium tabular-nums">{fmt(record.specialAllowance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transport Allowance</span>
                <span className="font-medium tabular-nums">{fmt(record.transportAllowance)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-1.5 mt-1">
                <span className="font-bold text-gray-800">Gross Salary</span>
                <span className="font-bold text-green-700 tabular-nums">{fmt(record.gross)}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
              Deductions
            </h4>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">PF (12%)</span>
                <span className="font-medium tabular-nums text-red-700">{fmt(record.pf)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ESI (1.75%)</span>
                <span className="font-medium tabular-nums text-red-700">{fmt(record.esi)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">TDS</span>
                <span className="font-medium tabular-nums text-red-700">{fmt(record.tds)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Other Deductions</span>
                <span className="font-medium tabular-nums text-red-700">{fmt(record.otherDeductions)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-1.5 mt-1">
                <span className="font-bold text-gray-800">Total Deductions</span>
                <span className="font-bold text-red-700 tabular-nums">
                  {fmt(record.pf + record.esi + record.tds + record.otherDeductions)}
                </span>
              </div>
            </div>
          </div>

          {/* Attendance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
              Attendance
            </h4>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Working Days</span>
                <span className="font-medium tabular-nums">{record.workingDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Present Days</span>
                <span className="font-medium tabular-nums text-green-700">{record.presentDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Absent Days</span>
                <span className="font-medium tabular-nums text-red-700">
                  {record.workingDays - record.presentDays}
                </span>
              </div>
            </div>
          </div>

          {/* Net payable */}
          <div className="flex flex-col justify-between">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
              <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Net Payable</p>
              <p className="text-2xl font-black text-green-700 mt-1 tabular-nums">{fmt(record.net)}</p>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" className="flex-1 text-xs">
                <Printer className="h-3 w-3 mr-1" />
                Salary Slip
              </Button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Payroll table row
// ---------------------------------------------------------------------------

function PayrollRow({ record }: { record: PayrollRecord }) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <>
      <tr
        className={cn(
          "cursor-pointer border-b border-gray-100 transition-colors",
          record.status === "finalized"
            ? "hover:bg-green-50/40"
            : "hover:bg-yellow-50/40",
          expanded && record.status === "finalized"
            ? "bg-green-50/30"
            : expanded
            ? "bg-yellow-50/30"
            : ""
        )}
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-4 py-3">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </td>
        <td className="px-4 py-3">
          <span className="text-xs font-mono text-gray-500">{record.empCode}</span>
        </td>
        <td className="px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">{record.name}</p>
            <p className="text-xs text-gray-400">{record.designation}</p>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className="text-sm text-gray-600">{record.department}</span>
        </td>
        <td className="px-4 py-3 text-right tabular-nums text-sm text-gray-700">
          {fmt(record.basic)}
        </td>
        <td className="px-4 py-3 text-right tabular-nums text-sm text-gray-700">
          {fmt(record.hra)}
        </td>
        <td className="px-4 py-3 text-right tabular-nums text-sm text-gray-700">
          {fmt(record.specialAllowance + record.transportAllowance)}
        </td>
        <td className="px-4 py-3 text-right">
          <span className="text-sm font-semibold text-gray-900 tabular-nums">
            {fmt(record.gross)}
          </span>
        </td>
        <td className="px-4 py-3 text-right tabular-nums text-sm text-red-700">
          {fmt(record.pf)}
        </td>
        <td className="px-4 py-3 text-right tabular-nums text-sm text-red-700">
          {fmt(record.esi)}
        </td>
        <td className="px-4 py-3 text-right tabular-nums text-sm text-red-700">
          {fmt(record.tds)}
        </td>
        <td className="px-4 py-3 text-right">
          <span className="text-sm font-bold text-green-700 tabular-nums">
            {fmt(record.net)}
          </span>
        </td>
        <td className="px-4 py-3">{getStatusBadge(record.status)}</td>
      </tr>
      {expanded && <SalaryBreakdown record={record} />}
    </>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PayrollPage() {
  const [month, setMonth] = React.useState("2");
  const [year, setYear] = React.useState("2026");
  const [payrollStatus, setPayrollStatus] = React.useState<
    "draft" | "processing" | "finalized"
  >("draft");

  const totalGross = MOCK_PAYROLL.reduce((s, r) => s + r.gross, 0);
  const totalNet = MOCK_PAYROLL.reduce((s, r) => s + r.net, 0);
  const totalPF = MOCK_PAYROLL.reduce((s, r) => s + r.pf, 0);
  const totalESI = MOCK_PAYROLL.reduce((s, r) => s + r.esi, 0);
  const totalTDS = MOCK_PAYROLL.reduce((s, r) => s + r.tds, 0);
  const finalizedCount = MOCK_PAYROLL.filter((r) => r.status === "finalized").length;

  const MONTHS = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const selectedMonthLabel =
    MONTHS.find((m) => m.value === month)?.label ?? "February";

  const statusConfig = {
    draft: { label: "Draft", className: "bg-gray-100 text-gray-700 border-gray-300" },
    processing: { label: "Processing", className: "bg-blue-100 text-blue-800 border-blue-300" },
    finalized: { label: "Finalized", className: "bg-green-100 text-green-800 border-green-300" },
  };

  const handleProcessPayroll = () => {
    setPayrollStatus((prev) =>
      prev === "draft" ? "processing" : prev === "processing" ? "finalized" : "finalized"
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll Processing"
        description="Manage monthly salary computation and disbursement"
        breadcrumb={[
          { label: "Dashboard", href: "/" },
          { label: "HR", href: "/hr" },
          { label: "Payroll" },
        ]}
        actions={
          <>
            {/* Month/Year selector */}
            <div className="flex items-center gap-2">
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-32 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-24 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm">
              <FileText className="mr-1.5 h-4 w-4" />
              Generate Slips
            </Button>
            <Button
              size="sm"
              variant={payrollStatus === "finalized" ? "outline" : "default"}
              onClick={handleProcessPayroll}
              disabled={payrollStatus === "finalized"}
            >
              <Play className="mr-1.5 h-4 w-4" />
              {payrollStatus === "draft" ? "Process Payroll" : payrollStatus === "processing" ? "Finalize Payroll" : "Finalized"}
            </Button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Total Employees",
            value: MOCK_PAYROLL.length,
            sub: "Active employees",
            icon: Users,
            iconBg: "bg-blue-600",
          },
          {
            label: "Payroll Processed",
            value: `${finalizedCount}/${MOCK_PAYROLL.length}`,
            sub: "Records finalized",
            icon: CheckCircle2,
            iconBg: "bg-green-600",
          },
          {
            label: "Total Gross",
            value: `\u20B9${(totalGross / 100000).toFixed(1)}L`,
            sub: `${selectedMonthLabel} ${year}`,
            icon: DollarSign,
            iconBg: "bg-purple-600",
          },
          {
            label: "Total Net Payout",
            value: `\u20B9${(totalNet / 100000).toFixed(1)}L`,
            sub: "After all deductions",
            icon: TrendingDown,
            iconBg: "bg-teal-600",
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

      {/* Payroll status banner */}
      <div
        className={cn(
          "flex items-center justify-between rounded-xl border px-5 py-4",
          payrollStatus === "finalized"
            ? "border-green-200 bg-green-50"
            : payrollStatus === "processing"
            ? "border-blue-200 bg-blue-50"
            : "border-gray-200 bg-gray-50"
        )}
      >
        <div>
          <p className="text-sm font-semibold text-gray-700">
            {selectedMonthLabel} {year} Payroll
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {payrollStatus === "draft"
              ? "Payroll not yet processed. Click Process Payroll to begin."
              : payrollStatus === "processing"
              ? "Payroll has been calculated. Review and finalize."
              : "Payroll finalized. Salary slips can be distributed."}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-bold uppercase tracking-wide",
            statusConfig[payrollStatus].className
          )}
        >
          {statusConfig[payrollStatus].label}
        </span>
      </div>

      {/* Payroll table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Employee Payroll - {selectedMonthLabel} {year}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              disabled={payrollStatus !== "finalized"}
            >
              <Download className="mr-1.5 h-4 w-4" />
              Export to Bank
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1100px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 w-8" />
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Emp Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Department
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Basic
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    HRA
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Allowances
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Gross
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    PF
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    ESI
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    TDS
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Net Salary
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PAYROLL.map((record) => (
                  <PayrollRow key={record.id} record={record} />
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td colSpan={4} className="px-4 py-3 text-sm font-bold text-gray-900">
                    Totals
                  </td>
                  <td colSpan={3} />
                  <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 tabular-nums">
                    {fmt(totalGross)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-red-700 tabular-nums">
                    {fmt(totalPF)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-red-700 tabular-nums">
                    {fmt(totalESI)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-red-700 tabular-nums">
                    {fmt(totalTDS)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-green-700 tabular-nums">
                    {fmt(totalNet)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary deduction cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total PF Contribution",
            value: fmt(totalPF),
            sub: "Employee share (12% of basic)",
            color: "border-l-blue-500",
          },
          {
            label: "Total ESI Contribution",
            value: fmt(totalESI),
            sub: "Employee share (1.75% of gross)",
            color: "border-l-purple-500",
          },
          {
            label: "Total TDS Deducted",
            value: fmt(totalTDS),
            sub: "Income tax at source",
            color: "border-l-red-500",
          },
        ].map((card) => (
          <Card key={card.label} className={cn("border-l-4", card.color)}>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className="text-xl font-black tabular-nums text-gray-900 mt-1">
                {card.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
