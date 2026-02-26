"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  GripVertical,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChartCard } from "@/components/charts/bar-chart-card";

// ---------------------------------------------------------------------------
// Kanban Data
// ---------------------------------------------------------------------------

type KanbanCard = {
  id: string;
  orderNumber: string;
  buyer: string;
  qty: number;
  deliveryDate: string;
  style: string;
};

type KanbanColumn = {
  id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
};

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: "not_started",
    title: "Not Started",
    color: "border-t-gray-400",
    cards: [
      { id: "k1", orderNumber: "ORD-2410", buyer: "Primark", qty: 5000, deliveryDate: "2026-04-10", style: "Basic Tee" },
      { id: "k2", orderNumber: "ORD-2411", buyer: "C&A", qty: 3000, deliveryDate: "2026-04-15", style: "Cargo Pants" },
    ],
  },
  {
    id: "cutting",
    title: "Cutting",
    color: "border-t-blue-500",
    cards: [
      { id: "k3", orderNumber: "ORD-2406", buyer: "Next", qty: 8000, deliveryDate: "2026-03-25", style: "Kids Shorts" },
    ],
  },
  {
    id: "sewing",
    title: "Sewing",
    color: "border-t-yellow-500",
    cards: [
      { id: "k4", orderNumber: "ORD-2401", buyer: "H&M", qty: 10000, deliveryDate: "2026-03-15", style: "Polo Shirt" },
      { id: "k5", orderNumber: "ORD-2398", buyer: "Zara", qty: 6000, deliveryDate: "2026-03-18", style: "Linen Blouse" },
      { id: "k6", orderNumber: "ORD-2402", buyer: "Primark", qty: 4000, deliveryDate: "2026-03-20", style: "Slim Jeans" },
    ],
  },
  {
    id: "finishing",
    title: "Finishing",
    color: "border-t-orange-500",
    cards: [
      { id: "k7", orderNumber: "ORD-2399", buyer: "Gap", qty: 7000, deliveryDate: "2026-03-12", style: "Chinos" },
    ],
  },
  {
    id: "packing",
    title: "Packing",
    color: "border-t-purple-500",
    cards: [
      { id: "k8", orderNumber: "ORD-2395", buyer: "Next", qty: 12000, deliveryDate: "2026-03-10", style: "Kids T-Shirt" },
    ],
  },
  {
    id: "ready_to_ship",
    title: "Ready to Ship",
    color: "border-t-green-500",
    cards: [
      { id: "k9", orderNumber: "ORD-2390", buyer: "M&S", qty: 5000, deliveryDate: "2026-03-08", style: "Fleece Hoodie" },
    ],
  },
];

function getUrgencyColor(deliveryDate: string): string {
  const daysLeft = Math.ceil(
    (new Date(deliveryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (daysLeft <= 7) return "border-l-red-500 bg-red-50/50";
  if (daysLeft <= 14) return "border-l-yellow-500 bg-yellow-50/30";
  return "border-l-green-500 bg-green-50/30";
}

function daysUntil(dateStr: string): number {
  return Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

// ---------------------------------------------------------------------------
// Calendar Data
// ---------------------------------------------------------------------------

type CalendarOrder = {
  id: string;
  orderNumber: string;
  buyer: string;
  start: string;
  end: string;
  color: string;
};

const CALENDAR_ORDERS: CalendarOrder[] = [
  { id: "c1", orderNumber: "ORD-2401", buyer: "H&M", start: "2026-03-02", end: "2026-03-15", color: "bg-blue-200 text-blue-800" },
  { id: "c2", orderNumber: "ORD-2398", buyer: "Zara", start: "2026-03-05", end: "2026-03-18", color: "bg-purple-200 text-purple-800" },
  { id: "c3", orderNumber: "ORD-2395", buyer: "Next", start: "2026-03-01", end: "2026-03-10", color: "bg-green-200 text-green-800" },
  { id: "c4", orderNumber: "ORD-2399", buyer: "Gap", start: "2026-03-04", end: "2026-03-12", color: "bg-orange-200 text-orange-800" },
  { id: "c5", orderNumber: "ORD-2402", buyer: "Primark", start: "2026-03-08", end: "2026-03-20", color: "bg-pink-200 text-pink-800" },
  { id: "c6", orderNumber: "ORD-2406", buyer: "Next", start: "2026-03-12", end: "2026-03-25", color: "bg-teal-200 text-teal-800" },
];

// ---------------------------------------------------------------------------
// Line Capacity Data
// ---------------------------------------------------------------------------

const LINE_CAPACITY = [
  { name: "Line 1", load: 92 },
  { name: "Line 2", load: 78 },
  { name: "Line 3", load: 85 },
  { name: "Line 4", load: 65 },
  { name: "Line 5", load: 70 },
  { name: "Line 6", load: 45 },
  { name: "Line 7", load: 88 },
  { name: "Line 8", load: 30 },
];

// ---------------------------------------------------------------------------
// Simple Month Calendar Component
// ---------------------------------------------------------------------------

function MonthCalendar({
  year,
  month,
  orders,
}: {
  year: number;
  month: number;
  orders: CalendarOrder[];
}) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  const getOrdersForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return orders.filter((o) => dateStr >= o.start && dateStr <= o.end);
  };

  const monthName = firstDay.toLocaleString("default", { month: "long" });

  return (
    <div>
      <h3 className="mb-3 text-center text-sm font-semibold text-gray-900">
        {monthName} {year}
      </h3>
      <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
        {cells.map((day, idx) => {
          const dayOrders = day ? getOrdersForDay(day) : [];
          const isToday =
            day !== null &&
            year === new Date().getFullYear() &&
            month === new Date().getMonth() &&
            day === new Date().getDate();

          return (
            <div
              key={idx}
              className={cn(
                "bg-white min-h-[60px] p-1",
                day === null && "bg-gray-50"
              )}
            >
              {day !== null && (
                <>
                  <span
                    className={cn(
                      "inline-flex h-5 w-5 items-center justify-center rounded-full text-xs",
                      isToday
                        ? "bg-blue-600 text-white font-bold"
                        : "text-gray-700"
                    )}
                  >
                    {day}
                  </span>
                  <div className="mt-0.5 space-y-0.5">
                    {dayOrders.slice(0, 2).map((o) => (
                      <div
                        key={o.id}
                        className={cn(
                          "truncate rounded px-1 py-0.5 text-[9px] font-medium leading-tight",
                          o.color
                        )}
                        title={`${o.orderNumber} - ${o.buyer}`}
                      >
                        {o.orderNumber}
                      </div>
                    ))}
                    {dayOrders.length > 2 && (
                      <div className="text-[9px] text-gray-400 pl-1">
                        +{dayOrders.length - 2} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PlanningPage() {
  const [calMonth, setCalMonth] = React.useState(new Date().getMonth());
  const [calYear, setCalYear] = React.useState(new Date().getFullYear());

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Production Planning"
        description="Kanban board, calendar timeline, and line capacity overview."
        breadcrumb={[
          { label: "Production", href: "/production" },
          { label: "Planning" },
        ]}
      />

      <Tabs defaultValue="kanban">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="capacity">Line Capacity</TabsTrigger>
        </TabsList>

        {/* ----- KANBAN ----- */}
        <TabsContent value="kanban">
          <div className="flex gap-3 overflow-x-auto pb-4">
            {KANBAN_COLUMNS.map((col) => (
              <div
                key={col.id}
                className={cn(
                  "flex w-[260px] shrink-0 flex-col rounded-xl border border-gray-200 bg-gray-50/60 border-t-4",
                  col.color
                )}
              >
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-700">
                    {col.title}
                  </h3>
                  <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">
                    {col.cards.length}
                  </span>
                </div>
                <div className="flex-1 space-y-2 p-2">
                  {col.cards.map((card) => {
                    const days = daysUntil(card.deliveryDate);
                    return (
                      <div
                        key={card.id}
                        className={cn(
                          "rounded-lg border border-gray-200 bg-white p-3 shadow-sm border-l-4 transition-shadow hover:shadow-md cursor-pointer",
                          getUrgencyColor(card.deliveryDate)
                        )}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xs font-bold text-gray-900">
                            {card.orderNumber}
                          </span>
                          <GripVertical className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                        </div>
                        <p className="mt-0.5 text-xs text-gray-600">
                          {card.buyer}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {card.style}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-gray-700">
                            {card.qty.toLocaleString()} pcs
                          </span>
                          <span
                            className={cn(
                              "flex items-center gap-0.5 font-medium",
                              days <= 7
                                ? "text-red-600"
                                : days <= 14
                                ? "text-yellow-600"
                                : "text-green-600"
                            )}
                          >
                            <Clock className="h-3 w-3" />
                            {days}d left
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {col.cards.length === 0 && (
                    <div className="py-6 text-center text-xs text-gray-400">
                      No orders
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ----- CALENDAR ----- */}
        <TabsContent value="calendar">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="sm" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-semibold text-gray-700">
                  {new Date(calYear, calMonth).toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <MonthCalendar
                year={calYear}
                month={calMonth}
                orders={CALENDAR_ORDERS}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {CALENDAR_ORDERS.map((o) => (
                  <div
                    key={o.id}
                    className={cn(
                      "rounded px-2 py-1 text-[11px] font-medium",
                      o.color
                    )}
                  >
                    {o.orderNumber} - {o.buyer}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ----- LINE CAPACITY ----- */}
        <TabsContent value="capacity">
          <BarChartCard
            title="Line Load Percentage"
            data={LINE_CAPACITY}
            dataKeys={["load"]}
            xAxisKey="name"
            horizontal
            height={360}
            formatTooltipValue={(v) => `${v}%`}
            colors={LINE_CAPACITY.map((l) =>
              l.load >= 85
                ? "#ef4444"
                : l.load >= 65
                ? "#eab308"
                : "#22c55e"
            )}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
