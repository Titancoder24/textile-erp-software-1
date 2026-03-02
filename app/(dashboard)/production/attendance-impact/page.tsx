"use client";

import * as React from "react";
import {
  Users,
  UserMinus,
  Factory,
  Clock,
  Loader2,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

import { cn, formatNumber } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProfile } from "@/hooks/use-profile";
import {
  getAttendanceImpactData,
  type AttendanceImpact,
} from "@/lib/actions/analytics";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAbsentSeverity(absentCount: number) {
  if (absentCount === 0) {
    return {
      color: "border-green-200 bg-green-50/50",
      badge: "bg-green-100 text-green-700 border-green-200",
      label: "Fully Staffed",
      progressColor: "bg-green-500",
      dotColor: "bg-green-500",
    };
  }
  if (absentCount <= 3) {
    return {
      color: "border-amber-200 bg-amber-50/50",
      badge: "bg-amber-100 text-amber-700 border-amber-200",
      label: "Minor Shortage",
      progressColor: "bg-amber-500",
      dotColor: "bg-amber-500",
    };
  }
  return {
    color: "border-red-200 bg-red-50/50",
    badge: "bg-red-100 text-red-700 border-red-200",
    label: "Critical Shortage",
    progressColor: "bg-red-500",
    dotColor: "bg-red-500",
  };
}

// ---------------------------------------------------------------------------
// Line Impact Card
// ---------------------------------------------------------------------------

interface LineCardProps {
  line: AttendanceImpact;
}

function LineImpactCard({ line }: LineCardProps) {
  const severity = getAbsentSeverity(line.absentCount);
  const outputPct =
    line.expectedOutput > 0
      ? Math.round((line.adjustedOutput / line.expectedOutput) * 100)
      : 100;
  const attendancePct =
    line.totalOperators > 0
      ? Math.round((line.presentToday / line.totalOperators) * 100)
      : 100;

  return (
    <Card className={cn("transition-all", severity.color)}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900">{line.lineName}</h3>
            {line.affectedOrder !== "No order assigned" && (
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <ChevronRight className="h-3 w-3 shrink-0" />
                {line.affectedOrder}
              </p>
            )}
          </div>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
              severity.badge
            )}
          >
            {severity.label}
          </span>
        </div>

        {/* Operator Counts */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg bg-white/80 p-2.5 text-center">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-bold text-gray-900 tabular-nums">
              {line.totalOperators}
            </p>
          </div>
          <div className="rounded-lg bg-white/80 p-2.5 text-center">
            <p className="text-xs text-gray-500">Present</p>
            <p className="text-lg font-bold text-green-700 tabular-nums">
              {line.presentToday}
            </p>
          </div>
          <div className="rounded-lg bg-white/80 p-2.5 text-center">
            <p className="text-xs text-gray-500">Absent</p>
            <p
              className={cn(
                "text-lg font-bold tabular-nums",
                line.absentCount === 0
                  ? "text-gray-400"
                  : line.absentCount <= 3
                  ? "text-amber-700"
                  : "text-red-700"
              )}
            >
              {line.absentCount}
            </p>
          </div>
        </div>

        {/* Attendance Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">Attendance</span>
            <span className="text-xs font-semibold text-gray-700 tabular-nums">
              {attendancePct}%
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                severity.progressColor
              )}
              style={{ width: `${attendancePct}%` }}
            />
          </div>
        </div>

        {/* Output Impact */}
        <div className="rounded-lg bg-white/80 p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">
              Output Impact
            </span>
            {line.outputDrop > 0 && (
              <span className="text-xs font-bold text-red-600 tabular-nums">
                -{formatNumber(line.outputDrop)} pcs
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-gray-500">Expected</p>
              <p className="text-sm font-bold text-gray-900 tabular-nums">
                {formatNumber(line.expectedOutput)} pcs
              </p>
            </div>
            <div className="text-gray-300">
              <ChevronRight className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Adjusted</p>
              <p
                className={cn(
                  "text-sm font-bold tabular-nums",
                  line.outputDrop > 0 ? "text-red-700" : "text-green-700"
                )}
              >
                {formatNumber(line.adjustedOutput)} pcs
              </p>
            </div>
          </div>
          <div className="mt-2">
            <Progress value={outputPct} className="h-1.5" />
          </div>
        </div>

        {/* Delay Estimate */}
        {line.delayDays > 0 && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-500 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-red-700">
                  Estimated Delay: {line.delayDays}{" "}
                  {line.delayDays === 1 ? "day" : "days"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recommendation */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
          <p className="text-xs font-medium text-blue-800">
            {line.recommendation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AttendanceImpactPage() {
  const { profile } = useProfile();
  const companyId = profile?.company_id;

  const [lines, setLines] = React.useState<AttendanceImpact[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!companyId) return;

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const result = await getAttendanceImpactData(companyId!);
        if (!cancelled) {
          if (result.error) {
            setError(result.error);
          } else {
            setLines(result.data ?? []);
          }
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load attendance impact data");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  // Computed stats
  const totalAbsent = lines.reduce((sum, l) => sum + l.absentCount, 0);
  const totalOutputDrop = lines.reduce((sum, l) => sum + l.outputDrop, 0);
  const linesAffected = lines.filter((l) => l.absentCount > 0).length;
  const avgDelayDays =
    linesAffected > 0
      ? lines
          .filter((l) => l.absentCount > 0)
          .reduce((sum, l) => sum + l.delayDays, 0) / linesAffected
      : 0;

  // Sort: critical first (most absent), then warning, then green
  const sortedLines = React.useMemo(() => {
    return [...lines].sort((a, b) => b.absentCount - a.absentCount);
  }, [lines]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Attendance Impact Analyzer"
          description="Real-time impact of operator absences on production lines"
          breadcrumb={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Production", href: "/production" },
            { label: "Attendance Impact" },
          ]}
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCard key={i} title="" value="" loading />
          ))}
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Attendance Impact Analyzer"
          description="Real-time impact of operator absences on production lines"
          breadcrumb={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Production", href: "/production" },
            { label: "Attendance Impact" },
          ]}
        />
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-red-400 mb-3" />
            <p className="text-sm font-medium text-gray-900">
              Failed to load data
            </p>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Impact Analyzer"
        description="Real-time impact of operator absences on production lines"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Production", href: "/production" },
          { label: "Attendance Impact" },
        ]}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          title="Total Absent Today"
          value={formatNumber(totalAbsent)}
          icon={<UserMinus className="h-5 w-5" />}
          color={totalAbsent === 0 ? "green" : totalAbsent <= 5 ? "orange" : "red"}
        />
        <StatCard
          title="Expected Output Drop"
          value={`${formatNumber(totalOutputDrop)} pcs`}
          icon={<Users className="h-5 w-5" />}
          color={totalOutputDrop === 0 ? "green" : "orange"}
        />
        <StatCard
          title="Lines Affected"
          value={`${linesAffected} / ${lines.length}`}
          icon={<Factory className="h-5 w-5" />}
          color={linesAffected === 0 ? "green" : "orange"}
        />
        <StatCard
          title="Avg Delay Days"
          value={avgDelayDays.toFixed(1)}
          icon={<Clock className="h-5 w-5" />}
          color={avgDelayDays === 0 ? "green" : avgDelayDays <= 1 ? "orange" : "red"}
        />
      </div>

      {/* Summary Bar */}
      {lines.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-6 text-xs">
              <span className="font-medium text-gray-700">
                Line Status Summary:
              </span>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-gray-600">
                  Fully Staffed:{" "}
                  <span className="font-semibold">
                    {lines.filter((l) => l.absentCount === 0).length}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="text-gray-600">
                  Minor Shortage (1-3):{" "}
                  <span className="font-semibold">
                    {
                      lines.filter(
                        (l) => l.absentCount >= 1 && l.absentCount <= 3
                      ).length
                    }
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-gray-600">
                  Critical (4+):{" "}
                  <span className="font-semibold">
                    {lines.filter((l) => l.absentCount >= 4).length}
                  </span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Line Cards Grid */}
      {sortedLines.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Factory className="mx-auto h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-900">
              No production lines found
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Set up production lines to track attendance impact.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {sortedLines.map((line) => (
            <LineImpactCard key={line.lineId} line={line} />
          ))}
        </div>
      )}
    </div>
  );
}
