"use client";

import * as React from "react";
import {
  XCircle,
  AlertTriangle,
  Clock,
  Package,
  Search,
} from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { cn, formatDate, formatCurrency } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import {
  getMaterialExpiryData,
  type MaterialExpiry,
} from "@/lib/actions/analytics";

/* ---------- Helpers ---------- */

const STATUS_CONFIG: Record<
  MaterialExpiry["status"],
  { cls: string; label: string; badgeCls: string }
> = {
  expired: {
    cls: "text-red-700",
    label: "Expired",
    badgeCls: "bg-red-100 text-red-700 hover:bg-red-100",
  },
  critical: {
    cls: "text-red-600",
    label: "Critical",
    badgeCls: "bg-red-100 text-red-600 hover:bg-red-100",
  },
  warning: {
    cls: "text-yellow-700",
    label: "Warning",
    badgeCls: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  },
  safe: {
    cls: "text-green-700",
    label: "Safe",
    badgeCls: "bg-green-100 text-green-700 hover:bg-green-100",
  },
};

function getDaysColor(days: number): string {
  if (days <= 0) return "text-red-700 bg-red-50";
  if (days <= 15) return "text-red-600 bg-red-50";
  if (days <= 45) return "text-yellow-700 bg-yellow-50";
  return "text-green-700 bg-green-50";
}

function filterByTab(
  items: MaterialExpiry[],
  tab: string
): MaterialExpiry[] {
  switch (tab) {
    case "expired":
      return items.filter((i) => i.status === "expired");
    case "critical":
      return items.filter((i) => i.status === "critical");
    case "warning":
      return items.filter((i) => i.status === "warning");
    case "safe":
      return items.filter((i) => i.status === "safe");
    default:
      return items;
  }
}

/* ---------- Table Row ---------- */

function ExpiryRow({ item }: { item: MaterialExpiry }) {
  const statusConfig = STATUS_CONFIG[item.status];

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium text-gray-900">{item.itemName}</p>
          <p className="text-[11px] text-gray-400 capitalize">
            {item.itemType.replace(/_/g, " ")}
          </p>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs font-mono text-gray-600">
          {item.batchNumber}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-sm tabular-nums text-gray-700">
          {item.quantity.toLocaleString("en-IN")}
        </span>
        <span className="ml-1 text-xs text-gray-400">{item.uom}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-gray-600">
          {formatDate(item.expiryDate)}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-sm font-bold tabular-nums min-w-[60px]",
            getDaysColor(item.daysToExpiry)
          )}
        >
          {item.daysToExpiry <= 0
            ? `${Math.abs(item.daysToExpiry)}d overdue`
            : `${item.daysToExpiry}d`}
        </span>
      </td>
      <td className="px-4 py-3">
        <Badge className={statusConfig.badgeCls}>{statusConfig.label}</Badge>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-gray-600">{item.warehouse}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-xs tabular-nums font-medium text-gray-700">
          {formatCurrency(item.value)}
        </span>
      </td>
      <td className="px-4 py-3 max-w-[200px]">
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          {item.suggestedAction}
        </p>
      </td>
    </tr>
  );
}

/* ---------- Table Component ---------- */

function ExpiryTable({ items }: { items: MaterialExpiry[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package className="mb-3 h-10 w-10 text-gray-300" />
        <p className="text-sm font-medium text-gray-500">
          No items in this category
        </p>
        <p className="text-xs text-gray-400 mt-1">
          All tracked materials are outside this filter
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Item Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Batch No.
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expiry Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Days to Expiry
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Warehouse
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Value (INR)
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Suggested Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {items.map((item) => (
            <ExpiryRow key={item.id} item={item} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Page Component ---------- */

export default function MaterialExpiryTrackerPage() {
  const { profile } = useProfile();
  const companyId = profile?.company_id;

  const [materials, setMaterials] = React.useState<MaterialExpiry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  const fetchData = React.useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const result = await getMaterialExpiryData(companyId);
      if (result.data) {
        setMaterials(result.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const searchFiltered = React.useMemo(() => {
    if (!search.trim()) return materials;
    const q = search.toLowerCase();
    return materials.filter(
      (m) =>
        m.itemName.toLowerCase().includes(q) ||
        m.batchNumber.toLowerCase().includes(q) ||
        m.itemType.toLowerCase().includes(q) ||
        m.warehouse.toLowerCase().includes(q)
    );
  }, [materials, search]);

  const expiredCount = materials.filter(
    (m) => m.status === "expired"
  ).length;
  const criticalCount = materials.filter(
    (m) => m.status === "critical"
  ).length;
  const warningCount = materials.filter(
    (m) => m.status === "warning"
  ).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Material Expiry & Shelf Life Tracker"
          description="Track expiry dates on chemicals, dyes, and perishable materials"
          breadcrumb={[
            { label: "Inventory", href: "/inventory" },
            { label: "Expiry Tracker" },
          ]}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCard key={i} title="" value="" loading />
          ))}
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Material Expiry & Shelf Life Tracker"
        description="Track expiry dates on chemicals, dyes, and perishable materials"
        breadcrumb={[
          { label: "Inventory", href: "/inventory" },
          { label: "Expiry Tracker" },
        ]}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Expired Items"
          value={expiredCount}
          icon={<XCircle className="h-5 w-5" />}
          color="red"
        />
        <StatCard
          title="Expiring in 15 Days"
          value={criticalCount}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="red"
        />
        <StatCard
          title="Expiring in 45 Days"
          value={warningCount}
          icon={<Clock className="h-5 w-5" />}
          color="orange"
        />
        <StatCard
          title="Total Tracked Items"
          value={materials.length}
          icon={<Package className="h-5 w-5" />}
          color="blue"
        />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, batch, type, warehouse..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabs + Table */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="all">
            <div className="border-b border-gray-100 px-4 pt-4">
              <TabsList>
                <TabsTrigger value="all">
                  All ({searchFiltered.length})
                </TabsTrigger>
                <TabsTrigger value="expired">
                  Expired ({filterByTab(searchFiltered, "expired").length})
                </TabsTrigger>
                <TabsTrigger value="critical">
                  Critical ({filterByTab(searchFiltered, "critical").length})
                </TabsTrigger>
                <TabsTrigger value="warning">
                  Warning ({filterByTab(searchFiltered, "warning").length})
                </TabsTrigger>
                <TabsTrigger value="safe">
                  Safe ({filterByTab(searchFiltered, "safe").length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all">
              <ExpiryTable items={searchFiltered} />
            </TabsContent>
            <TabsContent value="expired">
              <ExpiryTable
                items={filterByTab(searchFiltered, "expired")}
              />
            </TabsContent>
            <TabsContent value="critical">
              <ExpiryTable
                items={filterByTab(searchFiltered, "critical")}
              />
            </TabsContent>
            <TabsContent value="warning">
              <ExpiryTable
                items={filterByTab(searchFiltered, "warning")}
              />
            </TabsContent>
            <TabsContent value="safe">
              <ExpiryTable
                items={filterByTab(searchFiltered, "safe")}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Alert Banner */}
      {expiredCount > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              Expired Materials in Stock
            </p>
            <p className="text-xs text-red-700">
              {expiredCount} material(s) have passed their expiry date and should
              be removed from production stock immediately. Using expired
              chemicals can lead to shade variation, dye failures, and buyer
              rejections.
            </p>
          </div>
        </div>
      )}

      {criticalCount > 0 && expiredCount === 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
          <div>
            <p className="text-sm font-semibold text-orange-800">
              Materials Expiring Soon
            </p>
            <p className="text-xs text-orange-700">
              {criticalCount} material(s) will expire within 15 days. Prioritize
              these for immediate use in upcoming production batches or arrange
              for return/replacement with suppliers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
