"use client";

import * as React from "react";
import { cn, formatDate, getDaysRemaining } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

type TNAStatus = "done" | "in_progress" | "pending" | "delayed";

interface TNAMilestone {
  id: string;
  name: string;
  plannedDate: string;
  actualDate?: string;
  status: TNAStatus;
  department: string;
}

interface OrderTNA {
  orderId: string;
  orderNumber: string;
  buyer: string;
  style: string;
  deliveryDate: string;
  milestones: TNAMilestone[];
}

const MOCK_TNA_ORDERS: OrderTNA[] = [
  {
    orderId: "1",
    orderNumber: "ORD-2026-0012",
    buyer: "H&M",
    style: "Men's Woven Shirt",
    deliveryDate: "2026-03-05",
    milestones: [
      { id: "m1", name: "Order Confirmation", plannedDate: "2026-01-15", actualDate: "2026-01-15", status: "done", department: "Merchandising" },
      { id: "m2", name: "Fabric Booking", plannedDate: "2026-01-20", actualDate: "2026-01-19", status: "done", department: "Purchase" },
      { id: "m3", name: "Trim Booking", plannedDate: "2026-01-22", actualDate: "2026-01-22", status: "done", department: "Purchase" },
      { id: "m4", name: "Fabric In-House", plannedDate: "2026-02-05", actualDate: "2026-02-06", status: "done", department: "Store" },
      { id: "m5", name: "Cutting Start", plannedDate: "2026-02-10", actualDate: "2026-02-11", status: "done", department: "Production" },
      { id: "m6", name: "Sewing Start", plannedDate: "2026-02-15", actualDate: "2026-02-16", status: "in_progress", department: "Production" },
      { id: "m7", name: "Finishing", plannedDate: "2026-02-25", status: "pending", department: "Production" },
      { id: "m8", name: "Ex-Factory", plannedDate: "2026-03-01", status: "pending", department: "Shipping" },
    ],
  },
  {
    orderId: "2",
    orderNumber: "ORD-2026-0013",
    buyer: "Zara",
    style: "Women's Knitwear",
    deliveryDate: "2026-03-15",
    milestones: [
      { id: "m9", name: "Order Confirmation", plannedDate: "2026-01-22", actualDate: "2026-01-22", status: "done", department: "Merchandising" },
      { id: "m10", name: "Fabric Booking", plannedDate: "2026-01-28", actualDate: "2026-01-30", status: "done", department: "Purchase" },
      { id: "m11", name: "Trim Booking", plannedDate: "2026-02-01", actualDate: "2026-02-01", status: "done", department: "Purchase" },
      { id: "m12", name: "Fabric In-House", plannedDate: "2026-02-12", status: "in_progress", department: "Store" },
      { id: "m13", name: "Cutting Start", plannedDate: "2026-02-18", status: "pending", department: "Production" },
      { id: "m14", name: "Sewing Start", plannedDate: "2026-02-22", status: "pending", department: "Production" },
      { id: "m15", name: "Finishing", plannedDate: "2026-03-05", status: "pending", department: "Production" },
      { id: "m16", name: "Ex-Factory", plannedDate: "2026-03-12", status: "pending", department: "Shipping" },
    ],
  },
  {
    orderId: "3",
    orderNumber: "ORD-2026-0014",
    buyer: "Marks & Spencer",
    style: "Kids T-Shirt",
    deliveryDate: "2026-03-22",
    milestones: [
      { id: "m17", name: "Order Confirmation", plannedDate: "2026-01-30", actualDate: "2026-01-30", status: "done", department: "Merchandising" },
      { id: "m18", name: "Fabric Booking", plannedDate: "2026-02-03", actualDate: "2026-02-03", status: "done", department: "Purchase" },
      { id: "m19", name: "Trim Booking", plannedDate: "2026-02-05", actualDate: "2026-02-07", status: "delayed", department: "Purchase" },
      { id: "m20", name: "Fabric In-House", plannedDate: "2026-02-18", status: "pending", department: "Store" },
      { id: "m21", name: "Cutting Start", plannedDate: "2026-02-22", status: "pending", department: "Production" },
      { id: "m22", name: "Sewing Start", plannedDate: "2026-02-26", status: "pending", department: "Production" },
      { id: "m23", name: "Finishing", plannedDate: "2026-03-10", status: "pending", department: "Production" },
      { id: "m24", name: "Ex-Factory", plannedDate: "2026-03-18", status: "pending", department: "Shipping" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Status configs
// ---------------------------------------------------------------------------

const TNA_STATUS_CONFIG: Record<TNAStatus, { label: string; className: string; dot: string }> = {
  done: { label: "Completed", className: "bg-green-50 text-green-700 border border-green-200", dot: "bg-green-500" },
  in_progress: { label: "In Progress", className: "bg-blue-50 text-blue-700 border border-blue-200", dot: "bg-blue-500" },
  pending: { label: "Pending", className: "bg-gray-100 text-gray-500 border border-gray-200", dot: "bg-gray-300" },
  delayed: { label: "Overdue", className: "bg-red-50 text-red-700 border border-red-200", dot: "bg-red-500" },
};

function TNABadge({ status }: { status: TNAStatus }) {
  const conf = TNA_STATUS_CONFIG[status];
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold", conf.className)}>
      {conf.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeDelayDays(planned: string, actual?: string): number {
  if (!actual) {
    const today = new Date();
    const plan = new Date(planned);
    if (today > plan) return Math.ceil((today.getTime() - plan.getTime()) / (1000 * 60 * 60 * 24));
    return 0;
  }
  const p = new Date(planned);
  const a = new Date(actual);
  return Math.ceil((a.getTime() - p.getTime()) / (1000 * 60 * 60 * 24));
}

function isOverdue(m: TNAMilestone): boolean {
  if (m.status === "done") return false;
  const today = new Date();
  return new Date(m.plannedDate) < today;
}

function isUpcomingThisWeek(m: TNAMilestone): boolean {
  if (m.status === "done") return false;
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const planned = new Date(m.plannedDate);
  return planned >= today && planned <= nextWeek;
}

// ---------------------------------------------------------------------------
// Calendar helpers
// ---------------------------------------------------------------------------

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getMilestonesInMonth(orders: OrderTNA[], year: number, month: number) {
  const results: { order: OrderTNA; milestone: TNAMilestone; day: number }[] = [];
  orders.forEach((order) => {
    order.milestones.forEach((m) => {
      const d = new Date(m.plannedDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        results.push({ order, milestone: m, day: d.getDate() });
      }
    });
  });
  return results;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

// ---------------------------------------------------------------------------
// Calendar View
// ---------------------------------------------------------------------------

function CalendarView({ orders }: { orders: OrderTNA[] }) {
  const today = new Date();
  const [viewYear, setViewYear] = React.useState(today.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth);
  const milestonesThisMonth = getMilestonesInMonth(orders, viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  const dayMilestones: Record<number, typeof milestonesThisMonth> = {};
  milestonesThisMonth.forEach((item) => {
    if (!dayMilestones[item.day]) dayMilestones[item.day] = [];
    dayMilestones[item.day].push(item);
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </CardTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 text-sm"
            >
              &lt;
            </button>
            <button
              onClick={nextMonth}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 text-sm"
            >
              &gt;
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="bg-gray-50 py-2 text-center text-xs font-semibold text-gray-500 uppercase">
              {d}
            </div>
          ))}
          {/* Empty cells before first day */}
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-white min-h-[80px]" />
          ))}
          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday =
              today.getFullYear() === viewYear &&
              today.getMonth() === viewMonth &&
              today.getDate() === day;
            const items = dayMilestones[day] ?? [];

            return (
              <div
                key={day}
                className={cn(
                  "bg-white min-h-[80px] p-1.5",
                  isToday && "bg-blue-50/60"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                    isToday
                      ? "bg-blue-600 text-white"
                      : "text-gray-700"
                  )}
                >
                  {day}
                </span>
                <div className="mt-1 flex flex-col gap-0.5">
                  {items.slice(0, 3).map((item, idx) => {
                    const dotColor =
                      item.milestone.status === "done"
                        ? "bg-green-500"
                        : isOverdue(item.milestone)
                        ? "bg-red-500"
                        : isUpcomingThisWeek(item.milestone)
                        ? "bg-blue-500"
                        : "bg-gray-300";
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-1 text-[10px] leading-tight"
                        title={`${item.order.buyer}: ${item.milestone.name}`}
                      >
                        <span
                          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotColor)}
                        />
                        <span className="truncate text-gray-600">
                          {item.milestone.name}
                        </span>
                      </div>
                    );
                  })}
                  {items.length > 3 && (
                    <span className="text-[9px] text-gray-400">
                      +{items.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4">
          {[
            { label: "Completed", dot: "bg-green-500" },
            { label: "Overdue", dot: "bg-red-500" },
            { label: "Upcoming", dot: "bg-blue-500" },
            { label: "Pending", dot: "bg-gray-300" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className={cn("h-2.5 w-2.5 rounded-full", item.dot)} />
              <span className="text-xs text-gray-500">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Table View
// ---------------------------------------------------------------------------

function TableView({
  orders,
  onUpdate,
}: {
  orders: OrderTNA[];
  onUpdate: (milestoneId: string, orderId: string) => void;
}) {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.orderId}>
          <CardHeader className="pb-2 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-blue-600">
                {order.orderNumber}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {order.buyer}
              </span>
              <span className="text-sm text-gray-500">{order.style}</span>
              <Badge className="ml-auto text-xs">
                Delivery: {formatDate(order.deliveryDate)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-4 overflow-x-auto p-0">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["Milestone", "Department", "Planned Date", "Actual Date", "Delay Days", "Status", ""].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 first:pl-4"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.milestones.map((m, idx) => {
                  const delay = computeDelayDays(m.plannedDate, m.actualDate);
                  const overdue = isOverdue(m);
                  return (
                    <tr
                      key={m.id}
                      className={cn(
                        "border-b border-gray-100",
                        overdue && m.status !== "done" && "bg-red-50/50"
                      )}
                    >
                      <td className="px-3 py-2.5 pl-4 font-medium text-gray-900">
                        {m.name}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600">
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                          {m.department}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">
                        {formatDate(m.plannedDate)}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">
                        {m.actualDate ? formatDate(m.actualDate) : (
                          <span className="text-gray-400">--</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {delay !== 0 || m.actualDate ? (
                          <span
                            className={cn(
                              "tabular-nums font-semibold text-sm",
                              delay > 0 ? "text-red-600" : delay < 0 ? "text-green-600" : "text-gray-500"
                            )}
                          >
                            {delay > 0 ? `+${delay}d` : delay < 0 ? `${delay}d` : "On time"}
                          </span>
                        ) : (
                          <span className="text-gray-400">--</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <TNABadge status={overdue && m.status !== "done" ? "delayed" : m.status} />
                      </td>
                      <td className="px-3 py-2.5">
                        {m.status !== "done" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => onUpdate(m.id, order.orderId)}
                          >
                            Update
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TNAPage() {
  const [orders, setOrders] = React.useState(MOCK_TNA_ORDERS);

  // Update dialog state
  const [updateDialog, setUpdateDialog] = React.useState<{
    open: boolean;
    milestoneId: string;
    orderId: string;
    actualDate: string;
  }>({ open: false, milestoneId: "", orderId: "", actualDate: new Date().toISOString().slice(0, 10) });

  function handleOpenUpdate(milestoneId: string, orderId: string) {
    setUpdateDialog({
      open: true,
      milestoneId,
      orderId,
      actualDate: new Date().toISOString().slice(0, 10),
    });
  }

  function handleConfirmUpdate() {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.orderId !== updateDialog.orderId) return order;
        return {
          ...order,
          milestones: order.milestones.map((m) => {
            if (m.id !== updateDialog.milestoneId) return m;
            return {
              ...m,
              actualDate: updateDialog.actualDate,
              status: "done" as TNAStatus,
            };
          }),
        };
      })
    );
    setUpdateDialog({ open: false, milestoneId: "", orderId: "", actualDate: "" });
  }

  const allMilestones = orders.flatMap((o) => o.milestones);
  const totalMilestones = allMilestones.length;
  const completedCount = allMilestones.filter((m) => m.status === "done").length;
  const overdueCount = allMilestones.filter((m) => isOverdue(m)).length;
  const upcomingThisWeek = allMilestones.filter((m) => isUpcomingThisWeek(m)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="TNA Overview"
        description="Time and Action calendar across all active orders"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          title="Total Milestones"
          value={totalMilestones}
          icon={<CalendarDays className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Completed"
          value={completedCount}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Overdue"
          value={overdueCount}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="red"
        />
        <StatCard
          title="Upcoming This Week"
          value={upcomingThisWeek}
          icon={<Clock className="h-5 w-5" />}
          color="orange"
        />
      </div>

      {/* Views */}
      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-4">
          <TableView orders={orders} onUpdate={handleOpenUpdate} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <CalendarView orders={orders} />
        </TabsContent>
      </Tabs>

      {/* Update milestone dialog */}
      <Dialog
        open={updateDialog.open}
        onOpenChange={(open) =>
          setUpdateDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Milestone</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="actual-date">Actual Date</Label>
              <Input
                id="actual-date"
                type="date"
                value={updateDialog.actualDate}
                onChange={(e) =>
                  setUpdateDialog((prev) => ({
                    ...prev,
                    actualDate: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setUpdateDialog((prev) => ({ ...prev, open: false }))
              }
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmUpdate}>
              Mark as Completed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
