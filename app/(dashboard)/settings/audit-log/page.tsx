"use client";

import * as React from "react";
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";

type AuditAction = "INSERT" | "UPDATE" | "DELETE";

type AuditLog = {
  id: string;
  tableName: string;
  recordId: string;
  action: AuditAction;
  changedBy: string;
  changedByEmail: string;
  changedAt: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
};

const SAMPLE_LOGS: AuditLog[] = [
  {
    id: "1",
    tableName: "sales_orders",
    recordId: "SO-2026-0021",
    action: "UPDATE",
    changedBy: "Priya Nair",
    changedByEmail: "merchandiser@demo.textile-os.com",
    changedAt: "2026-02-26T08:45:00Z",
    before: { status: "material_sourcing", updated_at: "2026-02-24T10:00:00Z" },
    after: { status: "in_production", updated_at: "2026-02-26T08:45:00Z" },
  },
  {
    id: "2",
    tableName: "purchase_orders",
    recordId: "PO-2026-0041",
    action: "INSERT",
    changedBy: "Meenakshi Devi",
    changedByEmail: "purchase@demo.textile-os.com",
    changedAt: "2026-02-25T14:30:00Z",
    before: null,
    after: {
      id: "PO-2026-0041",
      supplier: "Cotton Fab Suppliers",
      total_value: 485000,
      status: "sent",
    },
  },
  {
    id: "3",
    tableName: "quality_inspections",
    recordId: "QC-2026-0083",
    action: "UPDATE",
    changedBy: "Karthik Rajan",
    changedByEmail: "quality@demo.textile-os.com",
    changedAt: "2026-02-25T11:15:00Z",
    before: { result: "pending", aql_result: null },
    after: { result: "pass", aql_result: "accepted", defect_rate: 1.2 },
  },
  {
    id: "4",
    tableName: "profiles",
    recordId: "usr_007",
    action: "UPDATE",
    changedBy: "Rajesh Kumar",
    changedByEmail: "owner@demo.textile-os.com",
    changedAt: "2026-02-24T16:00:00Z",
    before: { is_active: true, role: "finance_manager" },
    after: { is_active: false, role: "finance_manager" },
  },
  {
    id: "5",
    tableName: "styles",
    recordId: "MTS-001",
    action: "INSERT",
    changedBy: "Priya Nair",
    changedByEmail: "merchandiser@demo.textile-os.com",
    changedAt: "2026-02-23T09:30:00Z",
    before: null,
    after: {
      code: "MTS-001",
      name: "Men's Classic T-Shirt",
      category: "T-Shirt",
      fabric_composition: "100% Cotton Jersey",
      gsm: 160,
    },
  },
  {
    id: "6",
    tableName: "production_entries",
    recordId: "PE-2026-8921",
    action: "DELETE",
    changedBy: "Anand Selvam",
    changedByEmail: "production@demo.textile-os.com",
    changedAt: "2026-02-23T14:00:00Z",
    before: {
      line: "Line 3",
      date: "2026-02-22",
      produced: 450,
      defects: 12,
    },
    after: null,
  },
  {
    id: "7",
    tableName: "cost_sheets",
    recordId: "CS-2026-0019",
    action: "UPDATE",
    changedBy: "Priya Nair",
    changedByEmail: "merchandiser@demo.textile-os.com",
    changedAt: "2026-02-22T11:00:00Z",
    before: { fob_price_usd: 4.85, status: "draft" },
    after: { fob_price_usd: 5.20, status: "approved" },
  },
];

const TABLES = [
  "All Tables",
  "sales_orders",
  "purchase_orders",
  "quality_inspections",
  "profiles",
  "styles",
  "production_entries",
  "cost_sheets",
  "work_orders",
  "inventory",
];

const ACTION_COLORS: Record<AuditAction, string> = {
  INSERT: "border-green-200 bg-green-50 text-green-700",
  UPDATE: "border-blue-200 bg-blue-50 text-blue-700",
  DELETE: "border-red-200 bg-red-50 text-red-700",
};

function JsonDiff({
  before,
  after,
}: {
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
}) {
  const allKeys = new Set([
    ...Object.keys(before ?? {}),
    ...Object.keys(after ?? {}),
  ]);

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {before !== null && (
        <div>
          <p className="mb-1 text-xs font-semibold text-red-600">Before</p>
          <div className="rounded-lg border border-red-100 bg-red-50 p-3">
            <table className="w-full text-xs">
              <tbody>
                {Array.from(allKeys).map((key) => {
                  if (!(key in (before ?? {}))) return null;
                  const changed =
                    after !== null &&
                    key in after &&
                    JSON.stringify(before[key]) !== JSON.stringify(after[key]);
                  return (
                    <tr key={key} className={changed ? "font-semibold" : ""}>
                      <td className="py-0.5 pr-2 text-gray-500">{key}</td>
                      <td className={changed ? "text-red-700" : "text-gray-700"}>
                        {JSON.stringify(before[key])}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {after !== null && (
        <div>
          <p className="mb-1 text-xs font-semibold text-green-600">After</p>
          <div className="rounded-lg border border-green-100 bg-green-50 p-3">
            <table className="w-full text-xs">
              <tbody>
                {Array.from(allKeys).map((key) => {
                  if (!(key in (after ?? {}))) return null;
                  const changed =
                    before !== null &&
                    key in before &&
                    JSON.stringify(before[key]) !== JSON.stringify(after[key]);
                  const isNew = before === null || !(key in (before ?? {}));
                  return (
                    <tr key={key} className={changed || isNew ? "font-semibold" : ""}>
                      <td className="py-0.5 pr-2 text-gray-500">{key}</td>
                      <td className={changed || isNew ? "text-green-700" : "text-gray-700"}>
                        {JSON.stringify(after[key])}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuditLogPage() {
  const [search, setSearch] = React.useState("");
  const [tableFilter, setTableFilter] = React.useState("All Tables");
  const [actionFilter, setActionFilter] = React.useState<string>("all");
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const filtered = SAMPLE_LOGS.filter((log) => {
    const matchSearch =
      search === "" ||
      log.tableName.includes(search.toLowerCase()) ||
      log.recordId.toLowerCase().includes(search.toLowerCase()) ||
      log.changedBy.toLowerCase().includes(search.toLowerCase());
    const matchTable =
      tableFilter === "All Tables" || log.tableName === tableFilter;
    const matchAction =
      actionFilter === "all" || log.action === actionFilter;
    return matchSearch && matchTable && matchAction;
  });

  return (
    <div>
      <PageHeader
        title="Audit Log"
        description="Track all data changes, user actions, and system events across the application."
        breadcrumb={[
          { label: "Settings", href: "/settings" },
          { label: "Audit Log" },
        ]}
      />

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by table, record ID, or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={tableFilter} onValueChange={setTableFilter}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TABLES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="INSERT">Insert</SelectItem>
              <SelectItem value="UPDATE">Update</SelectItem>
              <SelectItem value="DELETE">Delete</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Log table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Table
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Record ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hidden sm:table-cell">
                  Changed By
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hidden lg:table-cell">
                  Date &amp; Time
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Diff
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((log) => (
                <React.Fragment key={log.id}>
                  <tr
                    className="cursor-pointer transition-colors hover:bg-gray-50"
                    onClick={() =>
                      setExpandedId(expandedId === log.id ? null : log.id)
                    }
                  >
                    <td className="px-4 py-3">
                      <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-700">
                        {log.tableName}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {log.recordId}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-md border px-2 py-0.5 text-xs font-bold",
                          ACTION_COLORS[log.action]
                        )}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div>
                        <p className="text-sm text-gray-700">{log.changedBy}</p>
                        <p className="text-xs text-gray-400">{log.changedByEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">
                      {formatDateTime(log.changedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        {expandedId === log.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </td>
                  </tr>
                  {expandedId === log.id && (
                    <tr>
                      <td colSpan={6} className="bg-gray-50 px-4 py-4">
                        <JsonDiff before={log.before} after={log.after} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-sm text-gray-500"
                  >
                    No audit entries match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
          Showing {filtered.length} of {SAMPLE_LOGS.length} entries
        </div>
      </div>
    </div>
  );
}
