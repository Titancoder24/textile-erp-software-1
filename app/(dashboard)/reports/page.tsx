import * as React from "react";
import Link from "next/link";
import {
  Factory,
  CheckSquare,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart2,
  TrendingUp,
  ClipboardList,
  AlertTriangle,
  Layers,
  AlertCircle,
  FileText,
  Truck,
  Users,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

type ReportItem = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
};

type ReportCategory = {
  category: string;
  icon: React.ElementType;
  color: string;
  reports: ReportItem[];
};

const REPORT_CATEGORIES: ReportCategory[] = [
  {
    category: "Production",
    icon: Factory,
    color: "blue",
    reports: [
      {
        id: "production-daily",
        title: "Daily Production Report",
        description: "Hourly output, efficiency, and operator count by line for any date.",
        icon: BarChart2,
      },
      {
        id: "production-efficiency",
        title: "Efficiency Report",
        description: "Line-wise efficiency trends, SAM vs actual time, operator utilization.",
        icon: TrendingUp,
      },
      {
        id: "production-orderwise",
        title: "Order-wise Report",
        description: "Production completion by order: target vs actual, pending qty.",
        icon: ClipboardList,
      },
    ],
  },
  {
    category: "Quality",
    icon: CheckSquare,
    color: "green",
    reports: [
      {
        id: "quality-inspection-summary",
        title: "Inspection Summary",
        description: "Pass/fail rates by order, line, and inspector for a date range.",
        icon: CheckSquare,
      },
      {
        id: "quality-defect-analysis",
        title: "Defect Analysis",
        description: "Top defects by frequency, location, and severity with Pareto chart.",
        icon: AlertTriangle,
      },
    ],
  },
  {
    category: "Inventory",
    icon: Package,
    color: "orange",
    reports: [
      {
        id: "inventory-stock-register",
        title: "Stock Register",
        description: "Item-wise stock position: opening, received, issued, and closing balance.",
        icon: Layers,
      },
      {
        id: "inventory-low-stock",
        title: "Low Stock Report",
        description: "Items at or below reorder level requiring replenishment.",
        icon: AlertCircle,
      },
    ],
  },
  {
    category: "Purchase",
    icon: ShoppingCart,
    color: "purple",
    reports: [
      {
        id: "purchase-po-register",
        title: "PO Register",
        description: "All purchase orders with status, value, and supplier details.",
        icon: FileText,
      },
      {
        id: "purchase-pending-deliveries",
        title: "Pending Deliveries",
        description: "Open PO items yet to be received with expected delivery dates.",
        icon: Truck,
      },
    ],
  },
  {
    category: "Sales",
    icon: DollarSign,
    color: "teal",
    reports: [
      {
        id: "sales-order-register",
        title: "Order Register",
        description: "All sales orders with buyer, style, quantity, status, and shipment date.",
        icon: ClipboardList,
      },
      {
        id: "sales-buyer-revenue",
        title: "Buyer-wise Revenue",
        description: "FOB value and order count by buyer for a selected period.",
        icon: Users,
      },
    ],
  },
];

const COLOR_MAP: Record<string, { category: string; item: string; badge: string }> = {
  blue: {
    category: "border-blue-200 bg-blue-50",
    item: "text-blue-600",
    badge: "bg-blue-600 text-white",
  },
  green: {
    category: "border-green-200 bg-green-50",
    item: "text-green-600",
    badge: "bg-green-600 text-white",
  },
  orange: {
    category: "border-orange-200 bg-orange-50",
    item: "text-orange-600",
    badge: "bg-orange-500 text-white",
  },
  purple: {
    category: "border-purple-200 bg-purple-50",
    item: "text-purple-600",
    badge: "bg-purple-600 text-white",
  },
  teal: {
    category: "border-teal-200 bg-teal-50",
    item: "text-teal-600",
    badge: "bg-teal-600 text-white",
  },
};

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generate, filter, and export reports across all modules."
        breadcrumb={[{ label: "Reports" }]}
      />

      <div className="space-y-8">
        {REPORT_CATEGORIES.map((cat) => {
          const CatIcon = cat.icon;
          const colors = COLOR_MAP[cat.color] ?? COLOR_MAP["blue"];

          return (
            <div key={cat.category}>
              {/* Category header */}
              <div className="mb-3 flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-md ${colors.badge}`}
                >
                  <CatIcon className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-semibold text-gray-900">
                  {cat.category}
                </h2>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* Report cards */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {cat.reports.map((report) => {
                  const ReportIcon = report.icon;

                  return (
                    <div
                      key={report.id}
                      className="group flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colors.category}`}
                        >
                          <ReportIcon className={`h-4.5 w-4.5 ${colors.item}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {report.title}
                          </h3>
                          <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                            {report.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Link
                          href={`/reports/${report.id}`}
                          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 group-hover:border-blue-300"
                        >
                          Generate Report
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
