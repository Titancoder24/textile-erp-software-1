"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  Download,
  FileSpreadsheet,
  Filter,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";

// ---------------------------------------------------------------------------
// Report definitions
// ---------------------------------------------------------------------------

type ReportConfig = {
  title: string;
  description: string;
  category: string;
  filters: FilterDef[];
  columns: ColumnDef<Record<string, unknown>>[];
  data: Record<string, unknown>[];
};

type FilterDef = {
  key: string;
  label: string;
  type: "date" | "select";
  options?: { label: string; value: string }[];
};

const REPORT_CONFIGS: Record<string, ReportConfig> = {
  "production-daily": {
    title: "Daily Production Report",
    description: "Hourly output, efficiency, and operator count by line for any date.",
    category: "Production",
    filters: [
      { key: "date", label: "Date", type: "date" },
      {
        key: "line",
        label: "Line",
        type: "select",
        options: [
          { label: "Line 1", value: "Line 1" },
          { label: "Line 2", value: "Line 2" },
          { label: "Line 3", value: "Line 3" },
          { label: "Line 4", value: "Line 4" },
          { label: "Line 5", value: "Line 5" },
          { label: "Line 6", value: "Line 6" },
          { label: "Line 7", value: "Line 7" },
          { label: "Line 8", value: "Line 8" },
        ],
      },
    ],
    columns: [
      { accessorKey: "line", header: "Line" },
      { accessorKey: "shift", header: "Shift" },
      { accessorKey: "target", header: "Target" },
      { accessorKey: "produced", header: "Produced" },
      { accessorKey: "defective", header: "Defective" },
      { accessorKey: "operators", header: "Operators" },
      {
        accessorKey: "efficiency",
        header: "Efficiency %",
        cell: ({ row }) => {
          const v = row.original.efficiency as number;
          return (
            <span className={v >= 65 ? "text-green-600 font-semibold" : v >= 50 ? "text-yellow-600 font-semibold" : "text-red-600 font-semibold"}>
              {v}%
            </span>
          );
        },
      },
    ],
    data: [
      { line: "Line 1", shift: "Morning", target: 400, produced: 360, defective: 5, operators: 32, efficiency: 78 },
      { line: "Line 1", shift: "Evening", target: 400, produced: 340, defective: 8, operators: 30, efficiency: 72 },
      { line: "Line 2", shift: "Morning", target: 300, produced: 250, defective: 12, operators: 28, efficiency: 65 },
      { line: "Line 2", shift: "Evening", target: 300, produced: 220, defective: 10, operators: 26, efficiency: 60 },
      { line: "Line 3", shift: "Morning", target: 500, produced: 480, defective: 3, operators: 30, efficiency: 82 },
      { line: "Line 3", shift: "Evening", target: 500, produced: 460, defective: 4, operators: 29, efficiency: 80 },
      { line: "Line 4", shift: "Morning", target: 250, produced: 180, defective: 18, operators: 25, efficiency: 55 },
      { line: "Line 5", shift: "Morning", target: 200, produced: 165, defective: 6, operators: 22, efficiency: 71 },
      { line: "Line 7", shift: "Morning", target: 350, produced: 340, defective: 2, operators: 20, efficiency: 88 },
    ],
  },
  "production-efficiency": {
    title: "Efficiency Report",
    description: "Line-wise efficiency trends with operator utilization.",
    category: "Production",
    filters: [
      { key: "from_date", label: "From Date", type: "date" },
      { key: "to_date", label: "To Date", type: "date" },
    ],
    columns: [
      { accessorKey: "line", header: "Line" },
      { accessorKey: "avgEfficiency", header: "Avg Efficiency %" },
      { accessorKey: "peakEfficiency", header: "Peak %" },
      { accessorKey: "totalOutput", header: "Total Output" },
      { accessorKey: "avgOperators", header: "Avg Operators" },
      { accessorKey: "workingDays", header: "Working Days" },
    ],
    data: [
      { line: "Line 1", avgEfficiency: 76, peakEfficiency: 85, totalOutput: 12400, avgOperators: 31, workingDays: 20 },
      { line: "Line 2", avgEfficiency: 63, peakEfficiency: 72, totalOutput: 8800, avgOperators: 27, workingDays: 20 },
      { line: "Line 3", avgEfficiency: 81, peakEfficiency: 92, totalOutput: 16800, avgOperators: 30, workingDays: 20 },
      { line: "Line 4", avgEfficiency: 54, peakEfficiency: 68, totalOutput: 5200, avgOperators: 24, workingDays: 18 },
      { line: "Line 5", avgEfficiency: 70, peakEfficiency: 78, totalOutput: 5700, avgOperators: 22, workingDays: 20 },
      { line: "Line 7", avgEfficiency: 86, peakEfficiency: 94, totalOutput: 14000, avgOperators: 20, workingDays: 20 },
    ],
  },
  "sales-order-register": {
    title: "Order Register",
    description: "All sales orders with buyer, style, quantity, status, and shipment date.",
    category: "Sales",
    filters: [
      { key: "from_date", label: "From Date", type: "date" },
      { key: "to_date", label: "To Date", type: "date" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Confirmed", value: "confirmed" },
          { label: "In Production", value: "in_production" },
          { label: "Shipped", value: "shipped" },
          { label: "Completed", value: "completed" },
        ],
      },
    ],
    columns: [
      { accessorKey: "orderNumber", header: "Order #" },
      { accessorKey: "buyer", header: "Buyer" },
      { accessorKey: "style", header: "Style" },
      { accessorKey: "qty", header: "Qty" },
      { accessorKey: "fob", header: "FOB (USD)" },
      { accessorKey: "orderDate", header: "Order Date" },
      { accessorKey: "deliveryDate", header: "Delivery" },
      { accessorKey: "status", header: "Status" },
    ],
    data: [
      { orderNumber: "ORD-2401", buyer: "H&M", style: "Classic Polo Shirt", qty: 10000, fob: "$4.50", orderDate: "2026-01-15", deliveryDate: "2026-03-15", status: "In Production" },
      { orderNumber: "ORD-2398", buyer: "Zara", style: "Linen Blouse", qty: 6000, fob: "$6.20", orderDate: "2026-01-18", deliveryDate: "2026-03-18", status: "In Production" },
      { orderNumber: "ORD-2395", buyer: "Next", style: "Kids T-Shirt Set", qty: 12000, fob: "$3.80", orderDate: "2026-01-10", deliveryDate: "2026-03-10", status: "In Production" },
      { orderNumber: "ORD-2399", buyer: "Gap", style: "Chino Trousers", qty: 7000, fob: "$7.50", orderDate: "2026-01-12", deliveryDate: "2026-03-12", status: "In Production" },
      { orderNumber: "ORD-2390", buyer: "M&S", style: "Fleece Hoodie", qty: 5000, fob: "$9.00", orderDate: "2025-12-20", deliveryDate: "2026-03-08", status: "Ready to Ship" },
      { orderNumber: "ORD-2402", buyer: "Primark", style: "Slim Fit Jeans", qty: 4000, fob: "$8.50", orderDate: "2026-01-20", deliveryDate: "2026-03-20", status: "In Production" },
    ],
  },
  "inventory-stock-register": {
    title: "Stock Register",
    description: "Item-wise stock position: opening, received, issued, and closing balance.",
    category: "Inventory",
    filters: [
      { key: "from_date", label: "From Date", type: "date" },
      { key: "to_date", label: "To Date", type: "date" },
      {
        key: "item_type",
        label: "Item Type",
        type: "select",
        options: [
          { label: "Fabric", value: "fabric" },
          { label: "Trim", value: "trim" },
          { label: "Accessory", value: "accessory" },
          { label: "Packing", value: "packing" },
        ],
      },
    ],
    columns: [
      { accessorKey: "item", header: "Item" },
      { accessorKey: "type", header: "Type" },
      { accessorKey: "uom", header: "UOM" },
      { accessorKey: "opening", header: "Opening" },
      { accessorKey: "received", header: "Received" },
      { accessorKey: "issued", header: "Issued" },
      { accessorKey: "closing", header: "Closing" },
      { accessorKey: "status", header: "Status" },
    ],
    data: [
      { item: "Cotton Single Jersey 180gsm", type: "Fabric", uom: "kg", opening: 2500, received: 1200, issued: 1800, closing: 1900, status: "OK" },
      { item: "Polyester Interlock 160gsm", type: "Fabric", uom: "kg", opening: 1800, received: 0, issued: 600, closing: 1200, status: "OK" },
      { item: "YKK Zipper #5", type: "Trim", uom: "pcs", opening: 5000, received: 2000, issued: 3500, closing: 3500, status: "OK" },
      { item: "Main Label - H&M", type: "Trim", uom: "pcs", opening: 12000, received: 0, issued: 8000, closing: 4000, status: "Low" },
      { item: "Poly Bag 12x16", type: "Packing", uom: "pcs", opening: 20000, received: 10000, issued: 15000, closing: 15000, status: "OK" },
      { item: "Carton Box A4", type: "Packing", uom: "pcs", opening: 800, received: 500, issued: 600, closing: 700, status: "OK" },
    ],
  },
};

// Fallback for unknown slugs
const FALLBACK_CONFIG: ReportConfig = {
  title: "Report",
  description: "This report is under development.",
  category: "General",
  filters: [
    { key: "from_date", label: "From Date", type: "date" },
    { key: "to_date", label: "To Date", type: "date" },
  ],
  columns: [
    { accessorKey: "message", header: "Info" },
  ],
  data: [
    { message: "No data available for this report. Try generating with different filters." },
  ],
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ReportViewerPage() {
  const params = useParams();
  const slug = params.slug as string;

  const config = REPORT_CONFIGS[slug] ?? FALLBACK_CONFIG;

  const [filterValues, setFilterValues] = React.useState<Record<string, string>>({});
  const [generated, setGenerated] = React.useState(false);

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = () => {
    setGenerated(true);
    toast.success("Report generated.");
  };

  const handleExport = (format: string) => {
    toast.success(`${format.toUpperCase()} export initiated. File will be ready shortly.`);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={config.title}
        description={config.description}
        breadcrumb={[
          { label: "Reports", href: "/reports" },
          { label: config.title },
        ]}
      />

      {/* Filter Panel */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {config.filters.map((filter) => (
              <div key={filter.key} className="space-y-1">
                <Label className="text-xs">{filter.label}</Label>
                {filter.type === "date" ? (
                  <Input
                    type="date"
                    value={filterValues[filter.key] ?? ""}
                    onChange={(e) =>
                      handleFilterChange(filter.key, e.target.value)
                    }
                  />
                ) : (
                  <Select
                    value={filterValues[filter.key] ?? "all"}
                    onValueChange={(v) =>
                      handleFilterChange(filter.key, v === "all" ? "" : v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`All ${filter.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {filter.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button onClick={handleGenerate} size="sm">
              <Calendar className="h-4 w-4" />
              Generate
            </Button>
            {generated && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("csv")}
                >
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("excel")}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      {generated && (
        <DataTable
          columns={config.columns}
          data={config.data}
          searchPlaceholder="Search results..."
          emptyMessage="No data for the selected filters."
        />
      )}

      {!generated && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <Calendar className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">
            Configure filters above and click <strong>Generate</strong> to view the report.
          </p>
        </div>
      )}
    </div>
  );
}
