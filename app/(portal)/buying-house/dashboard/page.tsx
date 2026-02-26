"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Truck, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatCurrency } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  confirmed: { label: "Confirmed", color: "blue" },
  material_sourcing: { label: "Material Sourcing", color: "yellow" },
  in_production: { label: "In Production", color: "orange" },
  ready_to_ship: { label: "Ready to Ship", color: "purple" },
  shipped: { label: "Shipped", color: "green" },
  completed: { label: "Completed", color: "gray" },
};

// Placeholder data for buying house dashboard
const demoOrders = [
  {
    id: "1",
    order_number: "SO-2026-0041",
    buyer: "H&M Trading",
    factory: "TextileOS Demo Factory",
    style: "Classic Crew Neck T-Shirt",
    quantity: 2350,
    delivery_date: "2026-03-15",
    status: "in_production",
    progress: 62,
  },
  {
    id: "2",
    order_number: "SO-2026-0042",
    buyer: "Zara International",
    factory: "TextileOS Demo Factory",
    style: "Polo Shirt with Tipping",
    quantity: 5000,
    delivery_date: "2026-03-25",
    status: "material_sourcing",
    progress: 15,
  },
  {
    id: "3",
    order_number: "SO-2026-0043",
    buyer: "Target Corporation",
    factory: "TextileOS Demo Factory",
    style: "Slim Fit Chino Trouser",
    quantity: 3000,
    delivery_date: "2026-03-05",
    status: "in_production",
    progress: 78,
  },
];

export default function BuyingHouseDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Buying House Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Monitor orders across all factories
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Orders"
          value={12}
          icon={<ShoppingBag className="h-5 w-5" />}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="On-Time Delivery"
          value="87%"
          icon={<TrendingUp className="h-5 w-5" />}
          color="green"
          change={3}
          changeLabel="vs last month"
          loading={loading}
        />
        <StatCard
          title="Shipments This Month"
          value={4}
          icon={<Truck className="h-5 w-5" />}
          color="purple"
          loading={loading}
        />
        <StatCard
          title="Orders at Risk"
          value={2}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="red"
          loading={loading}
        />
      </div>

      {/* Orders Across Factories */}
      <Card>
        <CardHeader>
          <CardTitle>Orders Across Factories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {demoOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-4 rounded-lg border p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{order.order_number}</span>
                    <StatusBadge status={order.status} statusMap={STATUS_MAP} />
                  </div>
                  <p className="text-sm text-gray-500">
                    {order.buyer} / {order.style}
                  </p>
                  <p className="text-xs text-gray-400">
                    Factory: {order.factory} | Delivery:{" "}
                    {formatDate(order.delivery_date)}
                  </p>
                </div>
                <div className="w-32 text-right">
                  <p className="text-sm font-medium">
                    {order.quantity.toLocaleString()} pcs
                  </p>
                  <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full ${
                        order.progress > 70
                          ? "bg-green-500"
                          : order.progress > 40
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                      }`}
                      style={{ width: `${order.progress}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {order.progress}% complete
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Factory Status */}
      <Card>
        <CardHeader>
          <CardTitle>Factory Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                name: "TextileOS Demo Factory",
                city: "Tirupur",
                orders: 5,
                onTime: 85,
                quality: 92,
                status: "green",
              },
              {
                name: "Partner Factory 2",
                city: "Bangalore",
                orders: 3,
                onTime: 91,
                quality: 88,
                status: "green",
              },
              {
                name: "Partner Factory 3",
                city: "Noida",
                orders: 2,
                onTime: 72,
                quality: 78,
                status: "yellow",
              },
              {
                name: "Partner Factory 4",
                city: "Dhaka",
                orders: 2,
                onTime: 60,
                quality: 70,
                status: "red",
              },
            ].map((factory) => (
              <div
                key={factory.name}
                className="rounded-lg border p-4"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      factory.status === "green"
                        ? "bg-green-500"
                        : factory.status === "yellow"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  />
                  <span className="font-medium">{factory.name}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{factory.city}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {factory.orders}
                    </p>
                    <p className="text-gray-500">Orders</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {factory.onTime}%
                    </p>
                    <p className="text-gray-500">On-Time</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {factory.quality}%
                    </p>
                    <p className="text-gray-500">Quality</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
