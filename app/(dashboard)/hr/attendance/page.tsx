"use client";

import * as React from "react";
import {
  Users,
  UserCheck,
  UserX,
  Calendar,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Square,
  Clock,
  Filter,
  Download,
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

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface Employee {
  id: string;
  code: string;
  name: string;
  status: "present" | "absent" | "leave" | "half_day";
  checkIn: string;
  checkOut: string;
  shift: string;
}

interface Department {
  name: string;
  total: number;
  present: number;
  absent: number;
  onLeave: number;
  employees: Employee[];
}

const MOCK_DEPARTMENTS: Department[] = [
  {
    name: "Sewing",
    total: 145,
    present: 132,
    absent: 8,
    onLeave: 5,
    employees: [
      { id: "1", code: "EMP001", name: "Ravi Kumar", status: "present", checkIn: "08:02", checkOut: "17:05", shift: "Morning" },
      { id: "2", code: "EMP002", name: "Sunita Devi", status: "present", checkIn: "07:58", checkOut: "17:00", shift: "Morning" },
      { id: "3", code: "EMP003", name: "Arjun Singh", status: "absent", checkIn: "--", checkOut: "--", shift: "Morning" },
      { id: "4", code: "EMP004", name: "Meena Sharma", status: "leave", checkIn: "--", checkOut: "--", shift: "Morning" },
      { id: "5", code: "EMP005", name: "Prakash Yadav", status: "present", checkIn: "08:10", checkOut: "17:12", shift: "Morning" },
      { id: "6", code: "EMP006", name: "Kavitha Nair", status: "half_day", checkIn: "08:05", checkOut: "13:00", shift: "Morning" },
    ],
  },
  {
    name: "Cutting",
    total: 62,
    present: 58,
    absent: 3,
    onLeave: 1,
    employees: [
      { id: "7", code: "EMP101", name: "Ramesh Patel", status: "present", checkIn: "07:55", checkOut: "17:00", shift: "Morning" },
      { id: "8", code: "EMP102", name: "Suresh Babu", status: "present", checkIn: "08:00", checkOut: "17:08", shift: "Morning" },
      { id: "9", code: "EMP103", name: "Priya Menon", status: "absent", checkIn: "--", checkOut: "--", shift: "Morning" },
      { id: "10", code: "EMP104", name: "Asha Rani", status: "present", checkIn: "08:03", checkOut: "17:02", shift: "Morning" },
    ],
  },
  {
    name: "Finishing",
    total: 88,
    present: 79,
    absent: 6,
    onLeave: 3,
    employees: [
      { id: "11", code: "EMP201", name: "Deepak Chauhan", status: "present", checkIn: "08:00", checkOut: "17:05", shift: "Morning" },
      { id: "12", code: "EMP202", name: "Lalitha Kumari", status: "present", checkIn: "08:15", checkOut: "17:10", shift: "Morning" },
      { id: "13", code: "EMP203", name: "Mohan Das", status: "leave", checkIn: "--", checkOut: "--", shift: "Morning" },
      { id: "14", code: "EMP204", name: "Rekha Verma", status: "present", checkIn: "08:02", checkOut: "17:00", shift: "Morning" },
    ],
  },
  {
    name: "Quality",
    total: 45,
    present: 42,
    absent: 2,
    onLeave: 1,
    employees: [
      { id: "15", code: "EMP301", name: "Vijay Reddy", status: "present", checkIn: "08:00", checkOut: "17:30", shift: "Morning" },
      { id: "16", code: "EMP302", name: "Shobha Pillai", status: "present", checkIn: "08:05", checkOut: "17:00", shift: "Morning" },
      { id: "17", code: "EMP303", name: "Arun Kumar", status: "absent", checkIn: "--", checkOut: "--", shift: "Morning" },
    ],
  },
  {
    name: "Store",
    total: 28,
    present: 25,
    absent: 2,
    onLeave: 1,
    employees: [
      { id: "18", code: "EMP401", name: "Ganesh Iyer", status: "present", checkIn: "07:50", checkOut: "17:00", shift: "Morning" },
      { id: "19", code: "EMP402", name: "Usha Nambiar", status: "present", checkIn: "08:00", checkOut: "17:05", shift: "Morning" },
      { id: "20", code: "EMP403", name: "Balaji Subramanian", status: "leave", checkIn: "--", checkOut: "--", shift: "Morning" },
    ],
  },
  {
    name: "Dyeing",
    total: 52,
    present: 47,
    absent: 4,
    onLeave: 1,
    employees: [
      { id: "21", code: "EMP501", name: "Chandran Pillai", status: "present", checkIn: "06:00", checkOut: "14:00", shift: "Morning" },
      { id: "22", code: "EMP502", name: "Anitha Krishnan", status: "present", checkIn: "06:05", checkOut: "14:02", shift: "Morning" },
      { id: "23", code: "EMP503", name: "Selvam Murugan", status: "absent", checkIn: "--", checkOut: "--", shift: "Morning" },
    ],
  },
  {
    name: "Admin",
    total: 32,
    present: 30,
    absent: 1,
    onLeave: 1,
    employees: [
      { id: "24", code: "EMP601", name: "Kavya Menon", status: "present", checkIn: "09:00", checkOut: "18:05", shift: "General" },
      { id: "25", code: "EMP602", name: "Rohit Malhotra", status: "present", checkIn: "09:10", checkOut: "18:00", shift: "General" },
      { id: "26", code: "EMP603", name: "Preethi Srinivasan", status: "leave", checkIn: "--", checkOut: "--", shift: "General" },
    ],
  },
  {
    name: "Maintenance",
    total: 33,
    present: 28,
    absent: 3,
    onLeave: 2,
    employees: [
      { id: "27", code: "EMP701", name: "Muthukumar Raja", status: "present", checkIn: "07:45", checkOut: "17:00", shift: "Morning" },
      { id: "28", code: "EMP702", name: "Dinesh Kumar", status: "absent", checkIn: "--", checkOut: "--", shift: "Morning" },
      { id: "29", code: "EMP703", name: "Siva Subramaniam", status: "present", checkIn: "07:52", checkOut: "17:05", shift: "Morning" },
    ],
  },
];

const DAILY_ATTENDANCE_TREND = [
  { date: "12 Feb", present: 398 },
  { date: "13 Feb", present: 405 },
  { date: "14 Feb", present: 412 },
  { date: "15 Feb", present: 389 },
  { date: "16 Feb", present: 417 },
  { date: "17 Feb", present: 421 },
  { date: "18 Feb", present: 0, future: true },
  { date: "19 Feb", present: 409 },
  { date: "20 Feb", present: 415 },
  { date: "21 Feb", present: 418 },
  { date: "22 Feb", present: 403 },
  { date: "23 Feb", present: 420 },
  { date: "24 Feb", present: 421 },
  { date: "25 Feb", present: 416 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAttendancePct(dept: Department): number {
  return Math.round((dept.present / dept.total) * 100);
}

function getAttendancePctColor(pct: number): string {
  if (pct >= 90) return "text-green-700";
  if (pct >= 75) return "text-yellow-700";
  return "text-red-700";
}

function getAttendancePctBg(pct: number): string {
  if (pct >= 90) return "bg-green-50 border-green-200";
  if (pct >= 75) return "bg-yellow-50 border-yellow-200";
  return "bg-red-50 border-red-200";
}

function getStatusBadge(status: Employee["status"]) {
  const variants: Record<
    Employee["status"],
    { label: string; className: string }
  > = {
    present: { label: "Present", className: "bg-green-100 text-green-800 border-green-200" },
    absent: { label: "Absent", className: "bg-red-100 text-red-800 border-red-200" },
    leave: { label: "On Leave", className: "bg-blue-100 text-blue-800 border-blue-200" },
    half_day: { label: "Half Day", className: "bg-amber-100 text-amber-800 border-amber-200" },
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
// Department Row (collapsible)
// ---------------------------------------------------------------------------

function DepartmentRow({
  dept,
  selectedIds,
  onToggleEmployee,
  onToggleAll,
}: {
  dept: Department;
  selectedIds: Set<string>;
  onToggleEmployee: (id: string) => void;
  onToggleAll: (deptName: string, empIds: string[], select: boolean) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const pct = getAttendancePct(dept);
  const empIds = dept.employees.map((e) => e.id);
  const allSelected = empIds.every((id) => selectedIds.has(id));
  const someSelected = empIds.some((id) => selectedIds.has(id));

  return (
    <>
      {/* Department summary row */}
      <tr
        className={cn(
          "cursor-pointer transition-colors",
          expanded ? "bg-blue-50/60" : "hover:bg-gray-50"
        )}
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleAll(dept.name, empIds, !allSelected);
              }}
              className="text-gray-400 hover:text-blue-600"
            >
              {allSelected ? (
                <CheckSquare className="h-4 w-4 text-blue-600" />
              ) : someSelected ? (
                <CheckSquare className="h-4 w-4 text-blue-400" />
              ) : (
                <Square className="h-4 w-4" />
              )}
            </button>
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-sm font-semibold text-gray-900">{dept.name}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="text-sm font-bold text-gray-900">{dept.total}</span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="text-sm font-semibold text-green-700">{dept.present}</span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="text-sm font-semibold text-red-700">{dept.absent}</span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="text-sm font-semibold text-blue-700">{dept.onLeave}</span>
        </td>
        <td className="px-4 py-3 text-center">
          <span
            className={cn(
              "inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold",
              getAttendancePctBg(pct),
              getAttendancePctColor(pct)
            )}
          >
            {pct}%
          </span>
        </td>
      </tr>

      {/* Expanded employee rows */}
      {expanded &&
        dept.employees.map((emp) => (
          <tr
            key={emp.id}
            className="bg-blue-50/30 border-b border-blue-100/50 hover:bg-blue-50/60"
          >
            <td className="pl-12 pr-4 py-2.5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleEmployee(emp.id)}
                  className="text-gray-400 hover:text-blue-600"
                >
                  {selectedIds.has(emp.id) ? (
                    <CheckSquare className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
                <span className="text-xs font-mono text-gray-500">{emp.code}</span>
                <span className="text-sm text-gray-800">{emp.name}</span>
              </div>
            </td>
            <td className="px-4 py-2.5" colSpan={2}>
              {getStatusBadge(emp.status)}
            </td>
            <td className="px-4 py-2.5 text-center" colSpan={2}>
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{emp.checkIn}</span>
                <span>-</span>
                <span>{emp.checkOut}</span>
              </div>
            </td>
            <td className="px-4 py-2.5 text-center">
              <span className="text-xs text-gray-500">{emp.shift}</span>
            </td>
          </tr>
        ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Bulk action bar
// ---------------------------------------------------------------------------

function BulkActionBar({
  count,
  onMark,
  onClear,
}: {
  count: number;
  onMark: (status: Employee["status"]) => void;
  onClear: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5">
      <span className="text-sm font-semibold text-blue-800">
        {count} employee{count > 1 ? "s" : ""} selected
      </span>
      <div className="flex items-center gap-2 ml-auto">
        <Button
          size="sm"
          variant="outline"
          className="border-green-300 text-green-700 hover:bg-green-50 text-xs"
          onClick={() => onMark("present")}
        >
          Mark Present
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-50 text-xs"
          onClick={() => onMark("absent")}
        >
          Mark Absent
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-blue-300 text-blue-700 hover:bg-blue-50 text-xs"
          onClick={() => onMark("leave")}
        >
          Mark Leave
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-gray-500 text-xs"
          onClick={onClear}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AttendancePage() {
  const [selectedDept, setSelectedDept] = React.useState("all");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [_showMarkSheet, setShowMarkSheet] = React.useState(false);

  const totalEmployees = MOCK_DEPARTMENTS.reduce((s, d) => s + d.total, 0);
  const totalPresent = MOCK_DEPARTMENTS.reduce((s, d) => s + d.present, 0);
  const totalAbsent = MOCK_DEPARTMENTS.reduce((s, d) => s + d.absent, 0);
  const totalOnLeave = MOCK_DEPARTMENTS.reduce((s, d) => s + d.onLeave, 0);

  const filteredDepts =
    selectedDept === "all"
      ? MOCK_DEPARTMENTS
      : MOCK_DEPARTMENTS.filter((d) => d.name === selectedDept);

  const handleToggleEmployee = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleAll = (
    _deptName: string,
    empIds: string[],
    select: boolean
  ) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      empIds.forEach((id) => (select ? next.add(id) : next.delete(id)));
      return next;
    });
  };

  const handleBulkMark = (status: Employee["status"]) => {
    // In production: call markAttendance for each selected employee
    console.log("Marking", selectedIds.size, "employees as", status);
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Management"
        description="Track daily attendance across all departments"
        breadcrumb={[
          { label: "Dashboard", href: "/" },
          { label: "HR", href: "/hr" },
          { label: "Attendance" },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 h-4 w-4" />
              Export Report
            </Button>
            <Button size="sm" onClick={() => setShowMarkSheet(true)}>
              <Calendar className="mr-1.5 h-4 w-4" />
              Mark Attendance
            </Button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Total Employees",
            value: totalEmployees,
            icon: Users,
            iconBg: "bg-blue-600",
            cardBg: "bg-blue-50",
            sub: "All departments",
          },
          {
            label: "Present Today",
            value: totalPresent,
            icon: UserCheck,
            iconBg: "bg-green-600",
            cardBg: "bg-green-50",
            sub: `${Math.round((totalPresent / totalEmployees) * 100)}% attendance`,
          },
          {
            label: "Absent Today",
            value: totalAbsent,
            icon: UserX,
            iconBg: "bg-red-600",
            cardBg: "bg-red-50",
            sub: `${Math.round((totalAbsent / totalEmployees) * 100)}% of workforce`,
          },
          {
            label: "On Leave",
            value: totalOnLeave,
            icon: Calendar,
            iconBg: "bg-amber-500",
            cardBg: "bg-amber-50",
            sub: "Approved leaves",
          },
        ].map((card) => (
          <Card key={card.label} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-gray-500">{card.label}</p>
                  <p className="text-3xl font-black tabular-nums text-gray-900">
                    {card.value.toLocaleString()}
                  </p>
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

      {/* Charts + Filter row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Attendance trend chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Last 14 Days - Daily Attendance Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={DAILY_ATTENDANCE_TREND} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  interval={1}
                  angle={-30}
                  textAnchor="end"
                  height={40}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  domain={[350, 440]}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                  formatter={(val: number) => [val, "Present"]}
                />
                <Bar dataKey="present" radius={[4, 4, 0, 0]}>
                  {DAILY_ATTENDANCE_TREND.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.present >= 410 ? "#22c55e" : entry.present >= 400 ? "#eab308" : "#ef4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Today's quick stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Today - 26 Feb 2026</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_DEPARTMENTS.map((dept) => {
              const pct = getAttendancePct(dept);
              return (
                <div key={dept.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 font-medium">{dept.name}</span>
                    <span className={cn("font-bold", getAttendancePctColor(pct))}>
                      {dept.present}/{dept.total} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100">
                    <div
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        pct >= 90 ? "bg-green-500" : pct >= 75 ? "bg-yellow-500" : "bg-red-500"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Department-wise table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Department-wise Attendance</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {MOCK_DEPARTMENTS.map((d) => (
                    <SelectItem key={d.name} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Bulk action bar */}
          <div className="px-4 pb-2">
            <BulkActionBar
              count={selectedIds.size}
              onMark={handleBulkMark}
              onClear={() => setSelectedIds(new Set())}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Department / Employee
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Total
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Present
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Absent
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    On Leave
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Attendance %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDepts.map((dept) => (
                  <DepartmentRow
                    key={dept.name}
                    dept={dept}
                    selectedIds={selectedIds}
                    onToggleEmployee={handleToggleEmployee}
                    onToggleAll={handleToggleAll}
                  />
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">
                    Total
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-bold text-gray-900">
                    {totalEmployees}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-bold text-green-700">
                    {totalPresent}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-bold text-red-700">
                    {totalAbsent}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-bold text-blue-700">
                    {totalOnLeave}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700">
                      {Math.round((totalPresent / totalEmployees) * 100)}%
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <span className="font-semibold text-gray-600">Attendance %:</span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-6 rounded-full border border-green-200 bg-green-50" />
          On track (90%+)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-6 rounded-full border border-yellow-200 bg-yellow-50" />
          Below target (75-89%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-6 rounded-full border border-red-200 bg-red-50" />
          Critical (&lt;75%)
        </span>
      </div>
    </div>
  );
}
