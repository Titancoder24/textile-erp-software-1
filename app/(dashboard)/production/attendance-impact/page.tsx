"use client";

import * as React from "react";
import {
  Users,
  UserMinus,
  UserPlus,
  ArrowDownRight,
  Clock,
  AlertCircle,
  RefreshCw,
  ArrowRightLeft,
  Loader2,
  AlertTriangle,
  Calendar,
  ChevronRight,
} from "lucide-react";

import { cn, formatNumber } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { useProfile } from "@/hooks/use-profile";
import { toast } from "sonner";
import {
  getAttendanceImpactData,
  type AttendanceImpact,
} from "@/lib/actions/analytics";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSeverityConfig(absentCount: number) {
  if (absentCount === 0) {
    return {
      borderColor: "border-l-green-500",
      bgColor: "bg-white",
      label: "Fully Staffed",
      badgeClass: "bg-green-100 text-green-700 border-green-200",
      progressColor: "bg-green-500",
      dotColor: "bg-green-500",
    };
  }
  if (absentCount <= 3) {
    return {
      borderColor: "border-l-amber-500",
      bgColor: "bg-amber-50/30",
      label: "Minor Shortage",
      badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
      progressColor: "bg-amber-500",
      dotColor: "bg-amber-500",
    };
  }
  return {
    borderColor: "border-l-red-500",
    bgColor: "bg-red-50/30",
    label: "Critical Shortage",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    progressColor: "bg-red-500",
    dotColor: "bg-red-500",
  };
}

// ---------------------------------------------------------------------------
// Mark Absent Dialog
// ---------------------------------------------------------------------------

function MarkAbsentDialog({
  line,
  open,
  onOpenChange,
  onSave,
}: {
  line: AttendanceImpact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (lineId: string, absentCount: number) => void;
}) {
  const [absentCount, setAbsentCount] = React.useState(
    String(line.absentCount)
  );

  function handleSave() {
    const count = parseInt(absentCount, 10);
    if (isNaN(count) || count < 0) {
      toast.error("Please enter a valid number");
      return;
    }
    if (count > line.totalOperators) {
      toast.error("Absent count cannot exceed total operators");
      return;
    }
    onSave(line.lineId, count);
    onOpenChange(false);
    toast.success(
      `Updated ${line.lineName}: ${count} operator${count !== 1 ? "s" : ""} marked absent`
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Absent - {line.lineName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Operators</span>
              <span className="font-bold text-gray-900 tabular-nums">
                {line.totalOperators}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="absent-count">Number of Absent Operators</Label>
            <Input
              id="absent-count"
              type="number"
              min={0}
              max={line.totalOperators}
              value={absentCount}
              onChange={(e) => setAbsentCount(e.target.value)}
              className="text-center text-lg font-bold"
            />
            <p className="text-xs text-gray-500">
              Present will be: {line.totalOperators - (parseInt(absentCount) || 0)}{" "}
              operators
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <UserMinus className="mr-2 h-4 w-4" />
              Update Attendance
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Redistribute Dialog
// ---------------------------------------------------------------------------

function RedistributeDialog({
  targetLine,
  allLines,
  open,
  onOpenChange,
}: {
  targetLine: AttendanceImpact;
  allLines: AttendanceImpact[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [transferCount, setTransferCount] = React.useState("2");
  const [sourceLine, setSourceLine] = React.useState("");

  const availableLines = allLines.filter(
    (l) => l.lineId !== targetLine.lineId && l.absentCount < 2
  );

  function handleSave() {
    const count = parseInt(transferCount, 10);
    if (isNaN(count) || count <= 0) {
      toast.error("Enter a valid number of operators to transfer");
      return;
    }
    if (!sourceLine) {
      toast.error("Select a source line");
      return;
    }
    const source = allLines.find((l) => l.lineId === sourceLine);
    toast.success(
      `${count} operator${count !== 1 ? "s" : ""} redistributed from ${source?.lineName ?? "Unknown"} to ${targetLine.lineName}`
    );
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Redistribute Operators to {targetLine.lineName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-center gap-2 text-sm text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                {targetLine.lineName} is short{" "}
                <span className="font-bold">{targetLine.absentCount}</span>{" "}
                operator{targetLine.absentCount !== 1 ? "s" : ""}. Output
                projected to drop by{" "}
                <span className="font-bold">
                  {formatNumber(targetLine.outputDrop)}
                </span>{" "}
                pcs today.
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transfer-count">
              Number of Operators to Transfer
            </Label>
            <Input
              id="transfer-count"
              type="number"
              min={1}
              max={10}
              value={transferCount}
              onChange={(e) => setTransferCount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Transfer From</Label>
            <Select value={sourceLine} onValueChange={setSourceLine}>
              <SelectTrigger>
                <SelectValue placeholder="Select source line" />
              </SelectTrigger>
              <SelectContent>
                {availableLines.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No lines with surplus operators
                  </SelectItem>
                ) : (
                  availableLines.map((l) => (
                    <SelectItem key={l.lineId} value={l.lineId}>
                      {l.lineName} (Present: {l.presentToday}/{l.totalOperators})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Redistribute
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Line Impact Card - two-column layout
// ---------------------------------------------------------------------------

function LineImpactCard({
  line,
  allLines,
  onMarkAbsent,
}: {
  line: AttendanceImpact;
  allLines: AttendanceImpact[];
  onMarkAbsent: (line: AttendanceImpact) => void;
}) {
  const severity = getSeverityConfig(line.absentCount);
  const attendancePct =
    line.totalOperators > 0
      ? Math.round((line.presentToday / line.totalOperators) * 100)
      : 100;
  const [redistributeOpen, setRedistributeOpen] = React.useState(false);

  return (
    <>
      <Card
        className={cn(
          "border-l-4 transition-all hover:shadow-md",
          severity.borderColor,
          severity.bgColor
        )}
      >
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900">
                {line.lineName}
              </h3>
              {line.affectedOrder !== "No order assigned" && (
                <p className="text-xs text-blue-600 mt-0.5 flex items-center gap-1 font-medium">
                  <ChevronRight className="h-3 w-3 shrink-0" />
                  {line.affectedOrder}
                </p>
              )}
            </div>
            <Badge variant="outline" className={cn("text-xs shrink-0", severity.badgeClass)}>
              {severity.label}
            </Badge>
          </div>

          {/* Two-Column Layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* LEFT: Attendance */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Attendance
              </h4>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">
                    Present: {line.presentToday} / {line.totalOperators}
                  </span>
                  <span className="font-semibold text-gray-700 tabular-nums">
                    {attendancePct}%
                  </span>
                </div>
                <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      severity.progressColor
                    )}
                    style={{ width: `${attendancePct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Absent:</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs tabular-nums",
                    line.absentCount > 0
                      ? "bg-red-100 text-red-700 border-red-200"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                  )}
                >
                  {line.absentCount}
                </Badge>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-7"
                onClick={() => onMarkAbsent(line)}
              >
                <UserMinus className="mr-1.5 h-3.5 w-3.5" />
                Mark Absent
              </Button>
            </div>

            {/* RIGHT: Impact */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Impact
              </h4>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Expected</span>
                  <span className="font-semibold text-green-700 tabular-nums">
                    {formatNumber(line.expectedOutput)} pcs
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Adjusted</span>
                  <span
                    className={cn(
                      "font-semibold tabular-nums",
                      line.outputDrop > 0 ? "text-orange-700" : "text-green-700"
                    )}
                  >
                    {formatNumber(line.adjustedOutput)} pcs
                  </span>
                </div>
                {line.outputDrop > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Drop</span>
                    <span className="font-bold text-red-700 tabular-nums flex items-center gap-0.5">
                      <ArrowDownRight className="h-3 w-3" />-
                      {formatNumber(line.outputDrop)} pcs
                    </span>
                  </div>
                )}
              </div>

              {/* Delay Risk */}
              <div
                className={cn(
                  "rounded-md px-2.5 py-1.5 flex items-center gap-1.5",
                  line.delayDays > 0
                    ? "bg-red-100 border border-red-200"
                    : "bg-green-100 border border-green-200"
                )}
              >
                <Clock className={cn("h-3.5 w-3.5", line.delayDays > 0 ? "text-red-600" : "text-green-600")} />
                <span
                  className={cn(
                    "text-xs font-semibold",
                    line.delayDays > 0 ? "text-red-700" : "text-green-700"
                  )}
                >
                  {line.delayDays > 0
                    ? `Delay: ${line.delayDays} day${line.delayDays !== 1 ? "s" : ""}`
                    : "On track"}
                </span>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div
            className={cn(
              "mt-4 rounded-lg p-3 text-xs font-medium",
              line.absentCount >= 4
                ? "bg-red-50 border border-red-200 text-red-800"
                : line.absentCount >= 1
                  ? "bg-blue-50 border border-blue-200 text-blue-800"
                  : "bg-green-50 border border-green-200 text-green-800"
            )}
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{line.recommendation}</span>
            </div>
          </div>

          {/* Redistribute Button (only if shortage) */}
          {line.absentCount >= 2 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3 text-xs h-8 border-dashed"
              onClick={() => setRedistributeOpen(true)}
            >
              <ArrowRightLeft className="mr-1.5 h-3.5 w-3.5" />
              Redistribute Operators
            </Button>
          )}
        </CardContent>
      </Card>

      <RedistributeDialog
        targetLine={line}
        allLines={allLines}
        open={redistributeOpen}
        onOpenChange={setRedistributeOpen}
      />
    </>
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
  const [selectedDate, setSelectedDate] = React.useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Mark Absent Dialog state
  const [markAbsentLine, setMarkAbsentLine] =
    React.useState<AttendanceImpact | null>(null);
  const [markAbsentOpen, setMarkAbsentOpen] = React.useState(false);

  React.useEffect(() => {
    if (!companyId) return;

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const result = await getAttendanceImpactData(companyId!, selectedDate);
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
  }, [companyId, selectedDate]);

  // Handle mark absent
  function handleMarkAbsentSave(lineId: string, absentCount: number) {
    setLines((prev) =>
      prev.map((l) => {
        if (l.lineId !== lineId) return l;
        const presentToday = l.totalOperators - absentCount;
        const efficiencyDrop = absentCount / Math.max(1, l.totalOperators);
        const adjustedOutput = Math.round(
          l.expectedOutput * (1 - efficiencyDrop)
        );
        return {
          ...l,
          absentCount,
          presentToday,
          adjustedOutput,
          outputDrop: l.expectedOutput - adjustedOutput,
        };
      })
    );
  }

  // Computed stats
  const totalOperators = lines.reduce((sum, l) => sum + l.totalOperators, 0);
  const totalAbsent = lines.reduce((sum, l) => sum + l.absentCount, 0);
  const totalOutputDrop = lines.reduce((sum, l) => sum + l.outputDrop, 0);

  // Sort: critical first
  const sortedLines = React.useMemo(() => {
    return [...lines].sort((a, b) => b.absentCount - a.absentCount);
  }, [lines]);

  // Bar chart data for Expected vs Adjusted
  const barChartData = React.useMemo(() => {
    return lines.map((l) => ({
      name: l.lineName.replace("Line ", "L"),
      Expected: l.expectedOutput,
      Adjusted: l.adjustedOutput,
    }));
  }, [lines]);

  // Summary counts
  const fullyStaffed = lines.filter((l) => l.absentCount === 0).length;
  const minorShortage = lines.filter(
    (l) => l.absentCount >= 1 && l.absentCount <= 3
  ).length;
  const criticalShortage = lines.filter((l) => l.absentCount >= 4).length;

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Operator Attendance Impact Analyzer"
          description="Analyze the impact of operator absences on production output and delivery timelines"
          breadcrumb={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Production", href: "/production" },
            { label: "Attendance Impact" },
          ]}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
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
          title="Operator Attendance Impact Analyzer"
          description="Analyze the impact of operator absences on production output and delivery timelines"
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
        title="Operator Attendance Impact Analyzer"
        description="Analyze the impact of operator absences on production output and delivery timelines"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Production", href: "/production" },
          { label: "Attendance Impact" },
        ]}
      />

      {/* Date Picker */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Label htmlFor="date-picker" className="text-sm font-medium text-gray-700">
                Date
              </Label>
              <Input
                id="date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-8 w-[170px] text-sm"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() =>
                setSelectedDate(new Date().toISOString().split("T")[0])
              }
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Today
            </Button>

            {/* Summary pills */}
            <div className="ml-auto flex items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span>Fully Staffed: <span className="font-semibold text-gray-700">{fullyStaffed}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span>Minor: <span className="font-semibold text-gray-700">{minorShortage}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span>Critical: <span className="font-semibold text-gray-700">{criticalShortage}</span></span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Operators Across Lines"
          value={formatNumber(totalOperators)}
          icon={<Users className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Total Absent Today"
          value={formatNumber(totalAbsent)}
          icon={<UserMinus className="h-5 w-5" />}
          color={totalAbsent === 0 ? "green" : totalAbsent <= 5 ? "orange" : "red"}
        />
        <StatCard
          title="Estimated Output Drop"
          value={`${formatNumber(totalOutputDrop)} pcs`}
          icon={<ArrowDownRight className="h-5 w-5" />}
          color={totalOutputDrop === 0 ? "green" : "orange"}
        />
      </div>

      {/* Line Cards Grid */}
      {sortedLines.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="mx-auto h-10 w-10 text-gray-300 mb-3" />
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
            <LineImpactCard
              key={line.lineId}
              line={line}
              allLines={lines}
              onMarkAbsent={(l) => {
                setMarkAbsentLine(l);
                setMarkAbsentOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Bar Chart: Expected vs Adjusted Output */}
      {lines.length > 0 && (
        <BarChartCard
          title="Expected vs Adjusted Output by Line"
          data={barChartData}
          dataKeys={["Expected", "Adjusted"]}
          colors={["#16a34a", "#ea580c"]}
          xAxisKey="name"
          height={300}
          formatTooltipValue={(value, name) => `${formatNumber(value)} pcs`}
        />
      )}

      {/* Mark Absent Dialog */}
      {markAbsentLine && (
        <MarkAbsentDialog
          line={markAbsentLine}
          open={markAbsentOpen}
          onOpenChange={(open) => {
            setMarkAbsentOpen(open);
            if (!open) setMarkAbsentLine(null);
          }}
          onSave={handleMarkAbsentSave}
        />
      )}
    </div>
  );
}
