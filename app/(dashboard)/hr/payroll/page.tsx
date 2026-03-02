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
  Loader2,
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
import { useCompany } from "@/contexts/company-context";
import { getPayrollData, calculatePayroll } from "@/lib/actions/hr";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
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

/**
 * Generate payroll figures from employee data.
 * In production, these would come from a dedicated payroll/salary master table.
 * For now, we derive reasonable values based on skill_grade.
 */
function computePayrollFromEmployee(emp: {
  id: string;
  employee_code: string;
  full_name: string;
  department: string;
  designation: string | null;
  skill_grade: string | null;
}): PayrollRecord {
  // Base salary tiers by skill grade
  const gradeBasicMap: Record<string, number> = {
    A: 25000,
    B: 18000,
    C: 14000,
    D: 10000,
  };
  const grade = emp.skill_grade ?? "B";
  const basic = gradeBasicMap[grade] ?? 15000;
  const hra = Math.round(basic * 0.4);
  const specialAllowance = Math.round(basic * 0.2);
  const transportAllowance = Math.round(basic * 0.06);
  const gross = basic + hra + specialAllowance + transportAllowance;

  const pf = Math.round(basic * 0.12);
  // ESI applies if gross <= 21000
  const esi = gross <= 21000 ? Math.round(gross * 0.0175) : 0;
  // TDS rough estimate for higher salaries
  const tds = gross > 30000 ? Math.round((gross - 30000) * 0.1) : 0;
  const otherDeductions = 0;

  const totalDeductions = pf + esi + tds + otherDeductions;
  const net = gross - totalDeductions;

  return {
    id: emp.id,
    empCode: emp.employee_code,
    name: emp.full_name,
    department: emp.department,
    designation: emp.designation ?? "Staff",
    basic,
    hra,
    specialAllowance,
    transportAllowance,
    gross,
    pf,
    esi,
    tds,
    otherDeductions,
    net,
    workingDays: 25,
    presentDays: 25,
    status: "pending",
  };
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
  const { companyId } = useCompany();
  const [payrollRecords, setPayrollRecords] = React.useState<PayrollRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [month, setMonth] = React.useState(String(new Date().getMonth() + 1));
  const [year, setYear] = React.useState(String(new Date().getFullYear()));
  const [payrollStatus, setPayrollStatus] = React.useState<
    "draft" | "processing" | "finalized"
  >("draft");

  const fetchPayroll = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await getPayrollData(companyId, Number(month), Number(year));
      if (error) {
        toast.error("Failed to load payroll data");
        return;
      }
      if (!data || !data.employees) {
        setPayrollRecords([]);
        return;
      }

      const records: PayrollRecord[] = data.employees.map(
        (emp: {
          id: string;
          employee_code: string;
          full_name: string;
          department: string;
          designation: string | null;
          skill_grade: string | null;
        }) => computePayrollFromEmployee(emp)
      );

      setPayrollRecords(records);
      setPayrollStatus(data.status === "calculated" ? "processing" : "draft");
    } catch {
      toast.error("Failed to load payroll data");
    } finally {
      setLoading(false);
    }
  }, [companyId, month, year]);

  React.useEffect(() => {
    fetchPayroll();
  }, [fetchPayroll]);

  const totalGross = payrollRecords.reduce((s, r) => s + r.gross, 0);
  const totalNet = payrollRecords.reduce((s, r) => s + r.net, 0);
  const totalPF = payrollRecords.reduce((s, r) => s + r.pf, 0);
  const totalESI = payrollRecords.reduce((s, r) => s + r.esi, 0);
  const totalTDS = payrollRecords.reduce((s, r) => s + r.tds, 0);
  const finalizedCount = payrollRecords.filter((r) => r.status === "finalized").length;

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

  const handleProcessPayroll = async () => {
    if (payrollStatus === "draft") {
      try {
        const { error } = await calculatePayroll(companyId, Number(month), Number(year));
        if (error) {
          toast.error("Failed to process payroll");
          return;
        }
        setPayrollStatus("processing");
        // Mark all records as processing
        setPayrollRecords((prev) =>
          prev.map((r) => ({ ...r, status: "processing" as PayrollStatus }))
        );
        toast.success("Payroll calculated successfully");
      } catch {
        toast.error("Failed to process payroll");
      }
    } else if (payrollStatus === "processing") {
      setPayrollStatus("finalized");
      setPayrollRecords((prev) =>
        prev.map((r) => ({ ...r, status: "finalized" as PayrollStatus }))
      );
      toast.success("Payroll finalized");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

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
            value: payrollRecords.length,
            sub: "Active employees",
            icon: Users,
            iconBg: "bg-blue-600",
          },
          {
            label: "Payroll Processed",
            value: `${finalizedCount}/${payrollRecords.length}`,
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
                {payrollRecords.map((record) => (
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
