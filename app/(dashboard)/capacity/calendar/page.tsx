"use client";

import * as React from "react";
import {
  CalendarDays,
  LayoutGrid,
  CheckSquare,
  Square,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile } from "@/hooks/use-profile";
import {
  getCapacityCalendarData,
  type CapacitySlot,
} from "@/lib/actions/analytics";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CalendarData {
  slots: CapacitySlot[];
  lines: Array<{ id: string; name: string }>;
  weeks: Array<{ start: string; end: string; label: string }>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CapacityCalendarPage() {
  const { profile } = useProfile();
  const companyId = profile?.company_id;

  const [data, setData] = React.useState<CalendarData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!companyId) return;

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const result = await getCapacityCalendarData(companyId!);
        if (!cancelled) {
          if (result.error) {
            setError(result.error);
          } else {
            setData(result.data as CalendarData);
          }
        }
      } catch {
        if (!cancelled) setError("Failed to load capacity calendar data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  // Derive stats
  const totalLines = data?.lines.length ?? 0;
  const weeksShown = data?.weeks.length ?? 0;
  const bookedSlots = data?.slots.filter((s) => s.status === "booked").length ?? 0;
  const freeSlots = data?.slots.filter((s) => s.status === "free").length ?? 0;

  // Build buyer color legend
  const buyerColors = React.useMemo(() => {
    if (!data) return new Map<string, string>();
    const map = new Map<string, string>();
    data.slots.forEach((slot) => {
      if (slot.status === "booked" && slot.buyer && !map.has(slot.buyer)) {
        map.set(slot.buyer, slot.color);
      }
    });
    return map;
  }, [data]);

  // Build lookup: lineId + weekLabel -> slot
  const slotMap = React.useMemo(() => {
    if (!data) return new Map<string, CapacitySlot>();
    const map = new Map<string, CapacitySlot>();
    data.slots.forEach((slot) => {
      const key = `${slot.lineId}__${slot.weekLabel}`;
      map.set(key, slot);
    });
    return map;
  }, [data]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Capacity Booking Calendar"
          description="Visual calendar showing factory capacity per production line"
          breadcrumb={[
            { label: "Capacity", href: "/capacity" },
            { label: "Calendar" },
          ]}
        />
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (!data || data.lines.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Capacity Booking Calendar"
          description="Visual calendar showing factory capacity per production line"
          breadcrumb={[
            { label: "Capacity", href: "/capacity" },
            { label: "Calendar" },
          ]}
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarDays className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-600">
              No production lines found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Add production lines and work orders to see the capacity calendar.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Capacity Booking Calendar"
        description="Visual calendar showing next 12 weeks of factory capacity per production line"
        breadcrumb={[
          { label: "Capacity", href: "/capacity" },
          { label: "Calendar" },
        ]}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          title="Total Lines"
          value={totalLines}
          icon={<LayoutGrid className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Weeks Shown"
          value={weeksShown}
          icon={<CalendarDays className="h-5 w-5" />}
          color="purple"
        />
        <StatCard
          title="Booked Slots"
          value={bookedSlots}
          icon={<CheckSquare className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Free Slots"
          value={freeSlots}
          icon={<Square className="h-5 w-5" />}
          color="orange"
        />
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900">
            Production Line Capacity ({weeksShown} Weeks)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/60">
                  <th className="sticky left-0 z-10 min-w-[160px] bg-gray-50 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 border-r border-gray-200">
                    Production Line
                  </th>
                  {data.weeks.map((week) => (
                    <th
                      key={week.start}
                      className="min-w-[80px] px-1 py-3 text-center text-xs font-medium text-gray-500"
                    >
                      {week.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.lines.map((line) => (
                  <tr
                    key={line.id}
                    className="hover:bg-gray-50/30 transition-colors"
                  >
                    <td className="sticky left-0 z-10 bg-white px-4 py-2 text-sm font-medium text-gray-800 border-r border-gray-200 whitespace-nowrap">
                      {line.name}
                    </td>
                    {data.weeks.map((week) => {
                      const key = `${line.id}__${week.label}`;
                      const slot = slotMap.get(key);
                      const isBooked = slot?.status === "booked";

                      return (
                        <td key={week.start} className="px-1 py-2">
                          <div
                            className={cn(
                              "mx-auto h-8 rounded-md transition-all cursor-default flex items-center justify-center",
                              isBooked
                                ? "shadow-sm hover:shadow-md"
                                : "bg-gray-100 hover:bg-gray-150"
                            )}
                            style={
                              isBooked
                                ? {
                                    backgroundColor: slot?.color || "#3b82f6",
                                    opacity: 0.85,
                                  }
                                : undefined
                            }
                            title={
                              isBooked
                                ? `${slot?.orderNumber} - ${slot?.buyer}\n${slot?.product}`
                                : "Free slot"
                            }
                          >
                            {isBooked && (
                              <span className="text-[9px] font-bold text-white truncate px-1 select-none">
                                {slot?.orderNumber || ""}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Buyer Color Legend */}
      {buyerColors.size > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              Buyer Legend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {Array.from(buyerColors.entries()).map(([buyer, color]) => (
                <div key={buyer} className="flex items-center gap-2">
                  <div
                    className="h-3.5 w-3.5 rounded-sm shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    {buyer}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-3.5 rounded-sm shrink-0 bg-gray-100 border border-gray-200" />
                <span className="text-sm text-gray-500">Free / Available</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Utilization Summary */}
      <Card className="border-blue-200 bg-blue-50/40">
        <CardContent className="flex items-start gap-4 pt-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100">
            <CalendarDays className="h-5 w-5 text-blue-700" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-blue-900">
              Capacity Utilization
            </p>
            <p className="text-xs text-blue-700 leading-relaxed">
              {bookedSlots + freeSlots > 0
                ? `${Math.round(
                    (bookedSlots / (bookedSlots + freeSlots)) * 100
                  )}% of capacity is booked across ${totalLines} lines for the next ${weeksShown} weeks. ${
                    freeSlots > 0
                      ? `${freeSlots} free slot(s) available for new orders.`
                      : "All slots are currently booked."
                  }`
                : "No capacity data available yet."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
