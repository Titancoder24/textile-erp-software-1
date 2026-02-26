"use client";

import * as React from "react";
import { Package, AlertTriangle, ShieldAlert, Archive } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable } from "@/components/data-table/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ---------- Types ---------- */

interface StockItem {
  id: string;
  item: string;
  type: string;
  batch: string;
  warehouse: string;
  quantity: number;
  uom: string;
  rate: number;
  value: number;
  status: "available" | "quarantine" | "reserved" | "rejected" | "dead_stock";
}

interface FabricRollItem {
  rollNo: string;
  fabric: string;
  width: number;
  length: number;
  dyeLot: string;
  grade: "A" | "B" | "C";
  status: "available" | "issued" | "quarantine" | "rejected";
}

/* ---------- Mock data ---------- */

const STOCK_DATA: StockItem[] = [
  {
    id: "STK-001",
    item: "Cotton Poplin 40s",
    type: "Fabric",
    batch: "FAB-2241",
    warehouse: "WH-01 Main Store",
    quantity: 2400,
    uom: "Meter",
    rate: 85,
    value: 204000,
    status: "available",
  },
  {
    id: "STK-002",
    item: "Reactive Blue 19",
    type: "Chemical",
    batch: "CHEM-0912",
    warehouse: "WH-02 Chemical Store",
    quantity: 45,
    uom: "kg",
    rate: 320,
    value: 14400,
    status: "available",
  },
  {
    id: "STK-003",
    item: "Poly-Cotton Twill 65/35",
    type: "Fabric",
    batch: "FAB-2195",
    warehouse: "WH-01 Main Store",
    quantity: 1800,
    uom: "Meter",
    rate: 72,
    value: 129600,
    status: "quarantine",
  },
  {
    id: "STK-004",
    item: "14L Plain Shirt Button",
    type: "Trim",
    batch: "TRM-0445",
    warehouse: "WH-01 Main Store",
    quantity: 18000,
    uom: "Pcs",
    rate: 0.45,
    value: 8100,
    status: "available",
  },
  {
    id: "STK-005",
    item: "Sodium Chloride",
    type: "Chemical",
    batch: "CHEM-0901",
    warehouse: "WH-02 Chemical Store",
    quantity: 12,
    uom: "kg",
    rate: 18,
    value: 216,
    status: "available",
  },
  {
    id: "STK-006",
    item: "Viscose Crepe 60gsm",
    type: "Fabric",
    batch: "FAB-2180",
    warehouse: "WH-01 Main Store",
    quantity: 320,
    uom: "Meter",
    rate: 115,
    value: 36800,
    status: "available",
  },
  {
    id: "STK-007",
    item: "Main Label Woven",
    type: "Trim",
    batch: "TRM-0412",
    warehouse: "WH-01 Main Store",
    quantity: 45,
    uom: "Pcs",
    rate: 2.1,
    value: 94.5,
    status: "dead_stock",
  },
  {
    id: "STK-008",
    item: "Hydrogen Peroxide 35%",
    type: "Chemical",
    batch: "CHEM-0888",
    warehouse: "WH-02 Chemical Store",
    quantity: 8,
    uom: "kg",
    rate: 65,
    value: 520,
    status: "available",
  },
];

const FABRIC_ROLLS: FabricRollItem[] = [
  {
    rollNo: "R-2241",
    fabric: "Cotton Poplin 40s",
    width: 58,
    length: 120,
    dyeLot: "DL-0085",
    grade: "A",
    status: "available",
  },
  {
    rollNo: "R-2240",
    fabric: "Cotton Poplin 40s",
    width: 58,
    length: 115,
    dyeLot: "DL-0085",
    grade: "A",
    status: "available",
  },
  {
    rollNo: "R-2195",
    fabric: "Poly-Cotton Twill",
    width: 60,
    length: 100,
    dyeLot: "DL-0081",
    grade: "B",
    status: "quarantine",
  },
  {
    rollNo: "R-2194",
    fabric: "Poly-Cotton Twill",
    width: 60,
    length: 108,
    dyeLot: "DL-0081",
    grade: "A",
    status: "available",
  },
  {
    rollNo: "R-2180",
    fabric: "Viscose Crepe",
    width: 54,
    length: 95,
    dyeLot: "DL-0079",
    grade: "A",
    status: "issued",
  },
];

/* ---------- Status config ---------- */

const STOCK_STATUS_BADGE: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  quarantine: "bg-orange-100 text-orange-700",
  reserved: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
  dead_stock: "bg-gray-100 text-gray-500",
};

const STOCK_STATUS_LABELS: Record<string, string> = {
  available: "Available",
  quarantine: "Quarantine",
  reserved: "Reserved",
  rejected: "Rejected",
  dead_stock: "Dead Stock",
};

const GRADE_BADGE: Record<string, string> = {
  A: "bg-green-100 text-green-700",
  B: "bg-yellow-100 text-yellow-700",
  C: "bg-red-100 text-red-700",
};

const ROLL_STATUS_BADGE: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  issued: "bg-blue-100 text-blue-700",
  quarantine: "bg-orange-100 text-orange-700",
  rejected: "bg-red-100 text-red-700",
};

/* ---------- Columns ---------- */

const STOCK_COLUMNS: ColumnDef<StockItem>[] = [
  { accessorKey: "item", header: "Item" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "batch", header: "Batch" },
  { accessorKey: "warehouse", header: "Warehouse" },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => (
      <span className={row.original.quantity < 20 ? "font-semibold text-red-600" : ""}>
        {row.original.quantity.toLocaleString()}
      </span>
    ),
  },
  { accessorKey: "uom", header: "UOM" },
  {
    accessorKey: "rate",
    header: "Rate",
    cell: ({ row }) => `₹${row.original.rate.toFixed(2)}`,
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => `₹${row.original.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${STOCK_STATUS_BADGE[row.original.status]}`}
      >
        {STOCK_STATUS_LABELS[row.original.status]}
      </span>
    ),
  },
];

const FABRIC_COLUMNS: ColumnDef<FabricRollItem>[] = [
  { accessorKey: "rollNo", header: "Roll #" },
  { accessorKey: "fabric", header: "Fabric" },
  {
    accessorKey: "width",
    header: "Width (in)",
    cell: ({ row }) => `${row.original.width}"`,
  },
  {
    accessorKey: "length",
    header: "Length (yd)",
    cell: ({ row }) => `${row.original.length} yd`,
  },
  { accessorKey: "dyeLot", header: "Dye Lot" },
  {
    accessorKey: "grade",
    header: "Grade",
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold ${GRADE_BADGE[row.original.grade]}`}
      >
        {row.original.grade}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold capitalize ${ROLL_STATUS_BADGE[row.original.status]}`}
      >
        {row.original.status}
      </span>
    ),
  },
];

const LOW_STOCK = STOCK_DATA.filter((s) => s.quantity < 20);
const QUARANTINE = STOCK_DATA.filter((s) => s.status === "quarantine");

/* ---------- Page ---------- */

export default function InventoryPage() {
  const totalValue = STOCK_DATA.reduce((s, i) => s + i.value, 0);
  const lowStockCount = LOW_STOCK.length;
  const quarantineCount = QUARANTINE.length;
  const deadStockCount = STOCK_DATA.filter((s) => s.status === "dead_stock").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Real-time stock levels, fabric rolls, and warehouse management."
        breadcrumb={[{ label: "Inventory" }]}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Stock Value"
          value={`₹${(totalValue / 1000).toFixed(0)}K`}
          icon={<Package className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockCount}
          changeLabel="Needs reorder"
          icon={<AlertTriangle className="h-5 w-5" />}
          color="orange"
        />
        <StatCard
          title="In Quarantine"
          value={quarantineCount}
          changeLabel="Pending QC release"
          icon={<ShieldAlert className="h-5 w-5" />}
          color="red"
        />
        <StatCard
          title="Dead Stock"
          value={deadStockCount}
          changeLabel="No movement 90+ days"
          icon={<Archive className="h-5 w-5" />}
          color="purple"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Stock</TabsTrigger>
          <TabsTrigger value="fabric_rolls">Fabric Rolls</TabsTrigger>
          <TabsTrigger value="low_stock">
            Low Stock
            {lowStockCount > 0 && (
              <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                {lowStockCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="quarantine">
            Quarantine
            {quarantineCount > 0 && (
              <span className="ml-1.5 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">
                {quarantineCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <DataTable
            columns={STOCK_COLUMNS}
            data={STOCK_DATA}
            searchKey="item"
            searchPlaceholder="Search by item name..."
            filters={[
              {
                key: "type",
                label: "Type",
                options: [
                  { value: "Fabric", label: "Fabric" },
                  { value: "Chemical", label: "Chemical" },
                  { value: "Trim", label: "Trim" },
                ],
              },
              {
                key: "status",
                label: "Status",
                options: Object.entries(STOCK_STATUS_LABELS).map(([v, l]) => ({
                  value: v,
                  label: l,
                })),
              },
            ]}
            emptyMessage="No stock items found."
          />
        </TabsContent>

        <TabsContent value="fabric_rolls" className="mt-4">
          <DataTable
            columns={FABRIC_COLUMNS}
            data={FABRIC_ROLLS}
            searchKey="rollNo"
            searchPlaceholder="Search by roll number..."
            filters={[
              {
                key: "status",
                label: "Status",
                options: ["available", "issued", "quarantine", "rejected"].map((v) => ({
                  value: v,
                  label: v.charAt(0).toUpperCase() + v.slice(1),
                })),
              },
            ]}
            emptyMessage="No fabric rolls found."
          />
        </TabsContent>

        <TabsContent value="low_stock" className="mt-4">
          <DataTable
            columns={STOCK_COLUMNS}
            data={LOW_STOCK}
            searchKey="item"
            searchPlaceholder="Search..."
            emptyMessage="No low stock items."
          />
        </TabsContent>

        <TabsContent value="quarantine" className="mt-4">
          <DataTable
            columns={STOCK_COLUMNS}
            data={QUARANTINE}
            searchKey="item"
            searchPlaceholder="Search..."
            emptyMessage="No items in quarantine."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
