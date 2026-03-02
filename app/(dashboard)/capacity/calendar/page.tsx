"use client";

import * as React from "react";
import {
  CalendarDays,
  LayoutGrid,
  CheckSquare,
  Square,
  Plus,
  X,
  Maximize2,
  Info,
  Loader2,
} from "lucide-react";

import { cn, formatNumber } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfile } from "@/hooks/use-profile";
import { toast } from "sonner";
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

interface BookingDialogState {
  open: boolean;
  lineId: string;
  lineName: string;
  weekStart: string;
  weekEnd: string;
  weekLabel: string;
}

interface DetailDialogState {
  open: boolean;
  slot: CapacitySlot | null;
}

// ---------------------------------------------------------------------------
// Tooltip component for slot hover
// ---------------------------------------------------------------------------

function SlotTooltip({
  slot,
  children,
}: {
  slot: CapacitySlot;
  children: React.ReactNode;
}) {
  const [show, setShow] = React.useState(false);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const ref = React.useRef<HTMLDivElement>(null);

  function handleMouseEnter(e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
    setShow(true);
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && slot.status === "booked" && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -100%)" }}
        >
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg text-xs max-w-[220px]">
            <p className="font-semibold text-gray-900">{slot.orderNumber}</p>
            <p className="text-gray-600">Buyer: {slot.buyer}</p>
            <p className="text-gray-500">Product: {slot.product}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Utilization bar for each line
// ---------------------------------------------------------------------------

function LineUtilizationBar({
  lineName,
  bookedWeeks,
  totalWeeks,
}: {
  lineName: string;
  bookedWeeks: number;
  totalWeeks: number;
}) {
  const pct = totalWeeks > 0 ? Math.round((bookedWeeks / totalWeeks) * 100) : 0;
  const barColor =
    pct > 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-green-500";
  const textColor =
    pct > 90 ? "text-red-700" : pct >= 70 ? "text-amber-700" : "text-green-700";

  return (
    <div className="flex items-center gap-3">
      <span className="min-w-[100px] text-sm font-medium text-gray-700 truncate">
        {lineName}
      </span>
      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${pct}%` }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-800">
          {bookedWeeks} / {totalWeeks} weeks
        </span>
      </div>
      <span className={cn("min-w-[48px] text-right text-sm font-bold tabular-nums", textColor)}>
        {pct}%
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mock active orders for booking form
// ---------------------------------------------------------------------------

const MOCK_ORDERS = [
  { id: "ord-1", number: "SO-2026-0001", buyer: "H&M Group", product: "Cotton T-shirt" },
  { id: "ord-2", number: "SO-2026-0002", buyer: "Zara", product: "Polo Shirt" },
  { id: "ord-3", number: "SO-2026-0003", buyer: "Target", product: "Denim Jacket" },
  { id: "ord-4", number: "SO-2026-0004", buyer: "Next PLC", product: "Joggers" },
  { id: "ord-5", number: "SO-2026-0005", buyer: "GAP Inc", product: "Hooded Sweatshirt" },
];

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function CapacityCalendarPage() {
  const { profile } = useProfile();
  const companyId = profile?.company_id;

  const [data, setData] = React.useState<CalendarData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Booking dialog (for free slots)
  const [bookingDialog, setBookingDialog] = React.useState<BookingDialogState>({
    open: false,
    lineId: "",
    lineName: "",
    weekStart: "",
    weekEnd: "",
    weekLabel: "",
  });
  const [bookingOrder, setBookingOrder] = React.useState("");
  const [bookingNotes, setBookingNotes] = React.useState("");

  // Detail dialog (for booked slots)
  const [detailDialog, setDetailDialog] = React.useState<DetailDialogState>({
    open: false,
    slot: null,
  });

  // Expanded view toggle
  const [expanded, setExpanded] = React.useState(false);

  // ---------------------------------------------------------------------------
  // Data fetch
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const totalLines = data?.lines.length ?? 0;
  const totalSlots = data?.slots.length ?? 0;
  const bookedSlots = data?.slots.filter((s) => s.status === "booked").length ?? 0;
  const freeSlots = data?.slots.filter((s) => s.status === "free").length ?? 0;
  const bookedPct = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

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

  const slotMap = React.useMemo(() => {
    if (!data) return new Map<string, CapacitySlot>();
    const map = new Map<string, CapacitySlot>();
    data.slots.forEach((slot) => {
      map.set(`${slot.lineId}__${slot.weekLabel}`, slot);
    });
    return map;
  }, [data]);

  // Per-line utilization
  const lineUtilization = React.useMemo(() => {
    if (!data) return [];
    return data.lines.map((line) => {
      const lineSlots = data.slots.filter((s) => s.lineId === line.id);
      const booked = lineSlots.filter((s) => s.status === "booked").length;
      return { lineName: line.name, bookedWeeks: booked, totalWeeks: lineSlots.length };
    });
  }, [data]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function handleFreeSlotClick(lineId: string, lineName: string, week: { start: string; end: string; label: string }) {
    setBookingOrder("");
    setBookingNotes("");
    setBookingDialog({
      open: true,
      lineId,
      lineName,
      weekStart: week.start,
      weekEnd: week.end,
      weekLabel: week.label,
    });
  }

  function handleBookedSlotClick(slot: CapacitySlot) {
    setDetailDialog({ open: true, slot });
  }

  function handleBookSlot() {
    if (!bookingOrder) {
      toast.error("Please select an order to book");
      return;
    }
    const selectedOrder = MOCK_ORDERS.find((o) => o.id === bookingOrder);
    toast.success(`Capacity booked for ${bookingDialog.lineName}`, {
      description: `Order ${selectedOrder?.number} assigned for week of ${bookingDialog.weekLabel}`,
    });
    setBookingDialog((prev) => ({ ...prev, open: false }));
  }

  function handleReleaseSlot() {
    if (!detailDialog.slot) return;
    toast.success(`Slot released on ${detailDialog.slot.lineName}`, {
      description: `Week of ${detailDialog.slot.weekLabel} is now available`,
    });
    setDetailDialog({ open: false, slot: null });
  }

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Error
  // ---------------------------------------------------------------------------

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Capacity Booking Calendar"
          description="See next 12 weeks of factory capacity at a glance"
          breadcrumb={[{ label: "Capacity", href: "/capacity" }, { label: "Calendar" }]}
        />
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Empty
  // ---------------------------------------------------------------------------

  if (!data || data.lines.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Capacity Booking Calendar"
          description="See next 12 weeks of factory capacity at a glance"
          breadcrumb={[{ label: "Capacity", href: "/capacity" }, { label: "Calendar" }]}
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarDays className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-600">No production lines found</p>
            <p className="text-xs text-gray-400 mt-1">
              Add production lines and work orders to see the capacity calendar.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      <PageHeader
        title="Capacity Booking Calendar"
        description="See next 12 weeks of factory capacity at a glance"
        breadcrumb={[{ label: "Capacity", href: "/capacity" }, { label: "Calendar" }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            <Maximize2 className="mr-1.5 h-3.5 w-3.5" />
            {expanded ? "Compact" : "Expand"}
          </Button>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Lines"
          value={totalLines}
          icon={<LayoutGrid className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Booked"
          value={`${bookedPct}%`}
          icon={<CheckSquare className="h-5 w-5" />}
          color="green"
          changeLabel={`${bookedSlots} of ${totalSlots} slots`}
        />
        <StatCard
          title="Free Slots Available"
          value={freeSlots}
          icon={<Square className="h-5 w-5" />}
          color="orange"
        />
      </div>

      {/* Buyer Color Legend */}
      {buyerColors.size > 0 && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-gray-200 bg-white px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-1">
            Legend:
          </span>
          {Array.from(buyerColors.entries()).map(([buyer, color]) => (
            <div key={buyer} className="flex items-center gap-1.5">
              <div
                className="h-3 w-3 rounded-sm shrink-0 shadow-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs font-medium text-gray-700">{buyer}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm shrink-0 border-2 border-dashed border-gray-300 bg-gray-50" />
            <span className="text-xs text-gray-500">Available</span>
          </div>
        </div>
      )}

      {/* THE CALENDAR GRID */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-900">
              Production Line Capacity ({data.weeks.length} Weeks)
            </CardTitle>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Info className="h-3.5 w-3.5" />
              Click a slot to book or view details
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="sticky left-0 z-20 min-w-[140px] bg-gray-50 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 border-r border-gray-200">
                    Line
                  </th>
                  {data.weeks.map((week) => (
                    <th
                      key={week.start}
                      className="min-w-[72px] px-0.5 py-2.5 text-center"
                    >
                      <span className="text-[10px] font-semibold text-gray-500 leading-none block">
                        {week.label}
                      </span>
                      <span className="text-[9px] text-gray-400 block mt-0.5">
                        {week.start.slice(5)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.lines.map((line) => (
                  <tr key={line.id} className="group hover:bg-gray-50/40 transition-colors">
                    <td className="sticky left-0 z-10 bg-white px-4 py-1.5 border-r border-gray-200 group-hover:bg-gray-50/40 transition-colors">
                      <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                        {line.name}
                      </span>
                    </td>
                    {data.weeks.map((week) => {
                      const key = `${line.id}__${week.label}`;
                      const slot = slotMap.get(key);
                      const isBooked = slot?.status === "booked";

                      return (
                        <td key={week.start} className="px-0.5 py-1.5">
                          <SlotTooltip slot={slot || ({} as CapacitySlot)}>
                            <button
                              type="button"
                              onClick={() =>
                                isBooked && slot
                                  ? handleBookedSlotClick(slot)
                                  : handleFreeSlotClick(line.id, line.name, week)
                              }
                              className={cn(
                                "w-full rounded-md transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1",
                                expanded ? "h-12" : "h-9",
                                isBooked
                                  ? "shadow-sm hover:shadow-md hover:scale-[1.03] cursor-pointer"
                                  : "border-2 border-dashed border-gray-200 bg-gray-50/50 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer"
                              )}
                              style={
                                isBooked
                                  ? { backgroundColor: slot?.color || "#3b82f6" }
                                  : undefined
                              }
                              aria-label={
                                isBooked
                                  ? `${slot?.orderNumber} - ${slot?.buyer}, ${week.label}`
                                  : `Book ${line.name} for ${week.label}`
                              }
                            >
                              {isBooked ? (
                                <span className="text-[9px] font-bold text-white truncate px-1 select-none leading-none">
                                  {slot?.orderNumber || ""}
                                </span>
                              ) : (
                                <Plus className="h-3 w-3 text-gray-300 group-hover:text-blue-400 transition-colors" />
                              )}
                            </button>
                          </SlotTooltip>
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

      {/* Utilization Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900">
            Line Utilization Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {lineUtilization.map((line) => (
            <LineUtilizationBar
              key={line.lineName}
              lineName={line.lineName}
              bookedWeeks={line.bookedWeeks}
              totalWeeks={line.totalWeeks}
            />
          ))}
          <div className="flex items-center gap-4 pt-3 border-t border-gray-100 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Below 70%
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              70 - 90%
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Above 90%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* BOOK CAPACITY DIALOG                                             */}
      {/* ================================================================ */}

      <Dialog
        open={bookingDialog.open}
        onOpenChange={(open) => setBookingDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Capacity</DialogTitle>
            <DialogDescription>
              Assign an order to this production slot.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Line name (read-only) */}
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Production Line</Label>
              <Input
                value={bookingDialog.lineName}
                readOnly
                className="bg-gray-50 text-sm font-medium"
              />
            </div>

            {/* Week dates (read-only) */}
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Week</Label>
              <Input
                value={`${bookingDialog.weekLabel} (${bookingDialog.weekStart} to ${bookingDialog.weekEnd})`}
                readOnly
                className="bg-gray-50 text-sm"
              />
            </div>

            {/* Order dropdown */}
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">
                Select Order <span className="text-red-500">*</span>
              </Label>
              <Select value={bookingOrder} onValueChange={setBookingOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an active order" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_ORDERS.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      <span className="font-mono text-xs">{order.number}</span>
                      <span className="text-gray-500 ml-2 text-xs">
                        {order.buyer} - {order.product}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Auto-fill buyer */}
            {bookingOrder && (
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Buyer</Label>
                <Input
                  value={MOCK_ORDERS.find((o) => o.id === bookingOrder)?.buyer || ""}
                  readOnly
                  className="bg-gray-50 text-sm"
                />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Notes</Label>
              <Textarea
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="Optional notes about this booking..."
                rows={3}
                className="text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                <X className="mr-1.5 h-3.5 w-3.5" />
                Cancel
              </Button>
            </DialogClose>
            <Button size="sm" onClick={handleBookSlot}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Book Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================ */}
      {/* BOOKED SLOT DETAIL DIALOG                                        */}
      {/* ================================================================ */}

      <Dialog
        open={detailDialog.open}
        onOpenChange={(open) => setDetailDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              View or manage this capacity booking.
            </DialogDescription>
          </DialogHeader>

          {detailDialog.slot && (
            <div className="space-y-4 py-2">
              {/* Colored header bar */}
              <div
                className="rounded-lg p-4 text-white"
                style={{ backgroundColor: detailDialog.slot.color || "#3b82f6" }}
              >
                <p className="text-lg font-bold">{detailDialog.slot.orderNumber}</p>
                <p className="text-sm opacity-90">{detailDialog.slot.buyer}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Production Line</p>
                  <p className="font-semibold text-gray-900">{detailDialog.slot.lineName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Week</p>
                  <p className="font-semibold text-gray-900">{detailDialog.slot.weekLabel}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Product</p>
                  <p className="font-semibold text-gray-900">{detailDialog.slot.product || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Period</p>
                  <p className="font-medium text-gray-700 text-xs">
                    {detailDialog.slot.weekStart} to {detailDialog.slot.weekEnd}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Close
              </Button>
            </DialogClose>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleReleaseSlot}
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Release Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
