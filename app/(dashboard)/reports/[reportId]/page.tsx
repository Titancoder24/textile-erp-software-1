"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Filter,
  RefreshCw,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Report metadata registry
const REPORT_META: Record<
  string,
  {
    title: string;
    description: string;
    category: string;
    filters: Array<{ key: string; label: string; type: "date" | "select"; options?: string[] }>;
    hasChart: boolean;
    chartType?: "bar" | "line";
  }
> = {
  "production-daily": {
    title: "Daily Production Report",
    description: "Hourly output, efficiency, and operator count by production line.",
    category: "Production",
    filters: [
      { key: "date", label: "Date", type: "date" },
      { key: "line", label: "Production Line", type: "select", options: ["All Lines", "Line 1", "Line 2", "Line 3", "Line 4", "Line 5", "Line 6", "Line 7", "Line 8"] },
    ],
    hasChart: true,
    chartType: "bar",
  },
  "production-efficiency": {
    title: "Efficiency Report",
    description: "Line-wise efficiency trends over the selected period.",
    category: "Production",
    filters: [
      { key: "from", label: "From Date", type: "date" },
      { key: "to", label: "To Date", type: "date" },
      { key: "line", label: "Production Line", type: "select", options: ["All Lines", "Line 1", "Line 2", "Line 3", "Line 4", "Line 5"] },
    ],
    hasChart: true,
    chartType: "line",
  },
  "production-orderwise": {
    title: "Order-wise Production Report",
    description: "Production completion by order with target vs actual comparisons.",
    category: "Production",
    filters: [
      { key: "from", label: "From Date", type: "date" },
      { key: "to", label: "To Date", type: "date" },
      { key: "buyer", label: "Buyer", type: "select", options: ["All Buyers", "H&M", "Zara", "Target", "Primark", "Next"] },
    ],
    hasChart: false,
  },
  "quality-inspection-summary": {
    title: "Quality Inspection Summary",
    description: "Pass/fail rates by order, line, and inspector.",
    category: "Quality",
    filters: [
      { key: "from", label: "From Date", type: "date" },
      { key: "to", label: "To Date", type: "date" },
      { key: "type", label: "Inspection Type", type: "select", options: ["All Types", "Inline", "Endline", "Pre-Final", "Final"] },
    ],
    hasChart: true,
    chartType: "bar",
  },
  "quality-defect-analysis": {
    title: "Defect Analysis Report",
    description: "Top defects by frequency, location, and severity.",
    category: "Quality",
    filters: [
      { key: "from", label: "From Date", type: "date" },
      { key: "to", label: "To Date", type: "date" },
      { key: "order", label: "Order", type: "select", options: ["All Orders", "SO-2026-0021", "SO-2026-0018", "SO-2026-0015"] },
    ],
    hasChart: true,
    chartType: "bar",
  },
  "inventory-stock-register": {
    title: "Stock Register",
    description: "Item-wise opening, received, issued, and closing balance.",
    category: "Inventory",
    filters: [
      { key: "date", label: "As of Date", type: "date" },
      { key: "category", label: "Item Category", type: "select", options: ["All Categories", "Fabric", "Yarn", "Trim", "Chemical", "Accessory", "Packing"] },
    ],
    hasChart: false,
  },
  "inventory-low-stock": {
    title: "Low Stock Report",
    description: "Items at or below reorder level.",
    category: "Inventory",
    filters: [
      { key: "category", label: "Item Category", type: "select", options: ["All Categories", "Fabric", "Yarn", "Trim", "Chemical"] },
    ],
    hasChart: false,
  },
  "purchase-po-register": {
    title: "PO Register",
    description: "All purchase orders with status, value, and supplier details.",
    category: "Purchase",
    filters: [
      { key: "from", label: "From Date", type: "date" },
      { key: "to", label: "To Date", type: "date" },
      { key: "status", label: "Status", type: "select", options: ["All Statuses", "Sent", "Partial Received", "Fully Received", "Closed"] },
    ],
    hasChart: false,
  },
  "purchase-pending-deliveries": {
    title: "Pending Deliveries",
    description: "Open PO items yet to be received.",
    category: "Purchase",
    filters: [
      { key: "from", label: "Expected From", type: "date" },
      { key: "to", label: "Expected To", type: "date" },
    ],
    hasChart: false,
  },
  "sales-order-register": {
    title: "Order Register",
    description: "All sales orders with buyer, style, quantity, status, and shipment date.",
    category: "Sales",
    filters: [
      { key: "from", label: "From Date", type: "date" },
      { key: "to", label: "To Date", type: "date" },
      { key: "buyer", label: "Buyer", type: "select", options: ["All Buyers", "H&M", "Zara", "Target", "Primark", "Next"] },
      { key: "status", label: "Status", type: "select", options: ["All Statuses", "Confirmed", "In Production", "Ready to Ship", "Shipped"] },
    ],
    hasChart: false,
  },
  "sales-buyer-revenue": {
    title: "Buyer-wise Revenue Report",
    description: "FOB value and order count by buyer.",
    category: "Sales",
    filters: [
      { key: "from", label: "From Date", type: "date" },
      { key: "to", label: "To Date", type: "date" },
    ],
    hasChart: true,
    chartType: "bar",
  },
};

// Mock result data generator
function generateMockData(reportId: string) {
  switch (reportId) {
    case "production-daily":
      return {
        chart: [
          { label: "Line 1", value: 520, efficiency: 78 },
          { label: "Line 2", value: 490, efficiency: 74 },
          { label: "Line 3", value: 610, efficiency: 91 },
          { label: "Line 4", value: 380, efficiency: 67 },
          { label: "Line 5", value: 545, efficiency: 82 },
        ],
        columns: ["Line", "Target", "Produced", "Defects", "Efficiency %", "Operators"],
        rows: [
          ["Line 1", "600", "520", "14", "78%", "42"],
          ["Line 2", "580", "490", "18", "74%", "38"],
          ["Line 3", "600", "610", "8", "91%", "45"],
          ["Line 4", "500", "380", "22", "67%", "35"],
          ["Line 5", "580", "545", "11", "82%", "40"],
          ["Total", "2880", "2545", "73", "78.4%", "200"],
        ],
      };
    case "production-efficiency":
      return {
        chart: [
          { label: "Feb 20", value: 74 },
          { label: "Feb 21", value: 76 },
          { label: "Feb 22", value: 79 },
          { label: "Feb 23", value: 82 },
          { label: "Feb 24", value: 80 },
          { label: "Feb 25", value: 84 },
          { label: "Feb 26", value: 85 },
        ],
        columns: ["Date", "Line 1 %", "Line 2 %", "Line 3 %", "Avg %"],
        rows: [
          ["Feb 20", "72%", "74%", "78%", "74%"],
          ["Feb 21", "75%", "76%", "80%", "76%"],
          ["Feb 22", "78%", "79%", "82%", "79%"],
          ["Feb 23", "80%", "82%", "86%", "82%"],
          ["Feb 24", "79%", "80%", "84%", "80%"],
          ["Feb 25", "83%", "84%", "88%", "84%"],
          ["Feb 26", "84%", "85%", "89%", "85%"],
        ],
      };
    case "quality-inspection-summary":
      return {
        chart: [
          { label: "Inline", value: 92 },
          { label: "Endline", value: 88 },
          { label: "Pre-Final", value: 94 },
          { label: "Final", value: 97 },
        ],
        columns: ["Inspection", "Inspected", "Passed", "Failed", "Pass Rate"],
        rows: [
          ["Inline - Line 3", "500", "465", "35", "93%"],
          ["Endline - Line 1", "400", "354", "46", "88.5%"],
          ["Pre-Final - SO-21", "3200", "3040", "160", "95%"],
          ["Final - SO-09", "3200", "3136", "64", "98%"],
        ],
      };
    case "sales-buyer-revenue":
      return {
        chart: [
          { label: "H&M", value: 4850000 },
          { label: "Zara", value: 3620000 },
          { label: "Target", value: 2900000 },
          { label: "Primark", value: 1850000 },
          { label: "Next", value: 1200000 },
        ],
        columns: ["Buyer", "Orders", "Total Qty", "FOB Value (INR)", "Avg Order Value"],
        rows: [
          ["H&M", "3", "32,000", "48,50,000", "16,17,000"],
          ["Zara", "2", "22,000", "36,20,000", "18,10,000"],
          ["Target", "2", "18,500", "29,00,000", "14,50,000"],
          ["Primark", "2", "14,000", "18,50,000", "9,25,000"],
          ["Next", "1", "8,000", "12,00,000", "12,00,000"],
        ],
      };
    default:
      return {
        chart: [],
        columns: ["Order #", "Buyer", "Style", "Qty", "Status", "Ship Date"],
        rows: [
          ["SO-2026-0021", "H&M", "Men's T-Shirt", "12,000", "In Production", "15 Mar 2026"],
          ["SO-2026-0018", "Zara", "Ladies Polo", "8,500", "Material Sourcing", "28 Mar 2026"],
          ["SO-2026-0015", "Target", "Kids Trouser", "5,000", "Confirmed", "10 Apr 2026"],
          ["SO-2026-0009", "H&M", "Denim Jacket", "3,200", "Ready to Ship", "28 Feb 2026"],
          ["SO-2026-0005", "Primark", "Casual Shirt", "6,000", "Shipped", "15 Jan 2026"],
        ],
      };
  }
}

export default function ReportViewerPage() {
  const params = useParams<{ reportId: string }>();
  const reportId = params.reportId;
  const meta = REPORT_META[reportId];

  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [generated, setGenerated] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<ReturnType<typeof generateMockData> | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setData(generateMockData(reportId));
    setGenerated(true);
    setLoading(false);
  };

  const handleExport = (format: "excel" | "pdf") => {
    toast.success(`Export initiated. Your ${format.toUpperCase()} file will be ready shortly.`);
  };

  if (!meta) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-gray-500">Report not found.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={meta.title}
        description={meta.description}
        breadcrumb={[
          { label: "Reports", href: "/reports" },
          { label: meta.category, href: "/reports" },
          { label: meta.title },
        ]}
        actions={
          generated ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("excel")}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("pdf")}
              >
                <FileText className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Filter panel */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {meta.filters.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={f.key}>{f.label}</Label>
              {f.type === "date" ? (
                <Input
                  id={f.key}
                  type="date"
                  value={filters[f.key] ?? ""}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                />
              ) : (
                <Select
                  value={filters[f.key] ?? ""}
                  onValueChange={(v) =>
                    setFilters((prev) => ({ ...prev, [f.key]: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`All ${f.label}s`} />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options?.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
          {generated && (
            <Button
              variant="outline"
              onClick={() => {
                setGenerated(false);
                setData(null);
                setFilters({});
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {generated && data && (
        <div className="space-y-6">
          {/* Chart */}
          {meta.hasChart && data.chart.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                Chart View
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {meta.chartType === "line" ? (
                    <LineChart data={data.chart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                      />
                      <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #e5e7eb",
                          fontSize: 12,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#2563eb" }}
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={data.chart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                      />
                      <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #e5e7eb",
                          fontSize: 12,
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#2563eb"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={60}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Data table */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
              <h2 className="text-sm font-semibold text-gray-900">
                Report Data
              </h2>
              <span className="text-xs text-gray-400">
                {data.rows.length} row{data.rows.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {data.columns.map((col) => (
                      <th
                        key={col}
                        className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.rows.map((row, ri) => (
                    <tr
                      key={ri}
                      className={cn(
                        "transition-colors hover:bg-gray-50",
                        ri === data.rows.length - 1 &&
                          data.rows.length > 1 &&
                          row[0]?.toString().toLowerCase() === "total"
                          ? "bg-gray-50 font-semibold"
                          : ""
                      )}
                    >
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className="px-4 py-2.5 text-sm text-gray-700"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!generated && (
        <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white">
          <BarChart3 className="h-10 w-10 text-gray-300" />
          <p className="mt-2 text-sm font-medium text-gray-500">
            Set filters and click Generate to view the report.
          </p>
        </div>
      )}
    </div>
  );
}
