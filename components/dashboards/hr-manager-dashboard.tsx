"use client";

import * as React from "react";
import {
  Users,
  UserCheck,
  CalendarOff,
  Clock,
} from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { LineChartCard } from "@/components/charts/line-chart-card";
import { StatCardSkeleton } from "@/components/ui/loading-skeleton";
import { formatNumber } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_DATA = {
  metrics: {
    total_employees: 200,
    present_today: 185,
    on_leave: 10,
    overtime_hours: 124,
  },
  department_headcount: [
    { name: "Sewing", count: 80 },
    { name: "Cutting", count: 25 },
    { name: "Finishing", count: 20 },
    { name: "Dyeing", count: 18 },
    { name: "Quality", count: 15 },
    { name: "Packing", count: 12 },
    { name: "Maintenance", count: 10 },
    { name: "Admin", count: 8 },
    { name: "Store", count: 7 },
    { name: "HR", count: 5 },
  ],
  attendance_trend: [
    { day: "27 Jan", present: 182, absent: 18 },
    { day: "29 Jan", present: 188, absent: 12 },
    { day: "31 Jan", present: 179, absent: 21 },
    { day: "02 Feb", present: 190, absent: 10 },
    { day: "04 Feb", present: 185, absent: 15 },
    { day: "06 Feb", present: 192, absent: 8 },
    { day: "08 Feb", present: 178, absent: 22 },
    { day: "10 Feb", present: 186, absent: 14 },
    { day: "12 Feb", present: 189, absent: 11 },
    { day: "14 Feb", present: 184, absent: 16 },
    { day: "16 Feb", present: 191, absent: 9 },
    { day: "18 Feb", present: 180, absent: 20 },
    { day: "20 Feb", present: 187, absent: 13 },
    { day: "22 Feb", present: 193, absent: 7 },
    { day: "24 Feb", present: 183, absent: 17 },
    { day: "26 Feb", present: 185, absent: 15 },
  ],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface HRManagerDashboardProps {
  companyId: string;
}

export function HRManagerDashboard({ companyId }: HRManagerDashboardProps) {
  const [data, setData] = React.useState(DEMO_DATA);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();

        const [employeesResult, attendanceResult] = await Promise.all([
          supabase
            .from("employees")
            .select("id, department, status")
            .eq("company_id", companyId)
            .eq("status", "active"),
          supabase
            .from("attendance")
            .select("id, status, date")
            .eq("company_id", companyId)
            .eq("date", new Date().toISOString().split("T")[0]),
        ]);

        const employees = employeesResult.data ?? [];
        const todayAttendance = attendanceResult.data ?? [];

        if (employees.length === 0) {
          setLoading(false);
          return;
        }

        const present = todayAttendance.filter((a) => a.status === "present").length;
        const onLeave = todayAttendance.filter((a) => a.status === "leave").length;

        // Department headcount
        const deptCounts: Record<string, number> = {};
        for (const emp of employees) {
          const dept = emp.department ?? "Other";
          deptCounts[dept] = (deptCounts[dept] ?? 0) + 1;
        }
        const deptHeadcount = Object.entries(deptCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);

        setData((prev) => ({
          metrics: {
            total_employees: employees.length || prev.metrics.total_employees,
            present_today: present || prev.metrics.present_today,
            on_leave: onLeave || prev.metrics.on_leave,
            overtime_hours: prev.metrics.overtime_hours,
          },
          department_headcount: deptHeadcount.length > 0 ? deptHeadcount : prev.department_headcount,
          attendance_trend: prev.attendance_trend,
        }));
      } catch {
        // Keep demo data
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [companyId]);

  return (
    <div className="space-y-6">
      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={formatNumber(data.metrics.total_employees)}
          icon={<Users className="h-5 w-5" />}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Present Today"
          value={formatNumber(data.metrics.present_today)}
          icon={<UserCheck className="h-5 w-5" />}
          color="green"
          loading={loading}
        />
        <StatCard
          title="On Leave"
          value={formatNumber(data.metrics.on_leave)}
          icon={<CalendarOff className="h-5 w-5" />}
          color="orange"
          loading={loading}
        />
        <StatCard
          title="Overtime Hours (MTD)"
          value={`${formatNumber(data.metrics.overtime_hours)} hrs`}
          icon={<Clock className="h-5 w-5" />}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Row 2: Department Headcount + Attendance Trend */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <BarChartCard
              title="Department Headcount"
              data={data.department_headcount}
              dataKeys={["count"]}
              xAxisKey="name"
              colors={["#2563eb"]}
              horizontal
              height={340}
            />
            <LineChartCard
              title="Attendance Trend (30 Days)"
              data={data.attendance_trend}
              dataKeys={["present", "absent"]}
              xAxisKey="day"
              colors={["#16a34a", "#dc2626"]}
              height={340}
            />
          </>
        )}
      </div>
    </div>
  );
}
