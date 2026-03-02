"use client";

import * as React from "react";
import {
  Layers,
  IndianRupee,
  CheckCircle2,
  Clock,
  Plus,
  Copy,
  Trash2,
  ChevronRight,
  Box,
  Scissors,
  FlaskConical,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { cn, formatDate, formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { StatusConfig } from "@/components/ui/status-badge";
import { DataTable } from "@/components/data-table/data-table";
import { FormSheet } from "@/components/forms/form-sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useCompany } from "@/contexts/company-context";
import { getBOMs, getBOM, createBOM, cloneBOM } from "@/lib/actions/bom";
import { getProducts } from "@/lib/actions/masters";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BOMItem {
  id: string;
  name: string;
  type: "fabric" | "trim" | "chemical" | "accessory";
  qtyPerPiece: number;
  uom: string;
  rate: number;
  wastagePercent: number;
  amount: number;
}

interface BOM {
  id: string;
  name: string;
  productName: string;
  styleCode: string;
  version: number;
  status: "draft" | "approved" | "active";
  totalCost: number;
  createdAt: string;
  items: BOMItem[];
  notes: string;
}

interface Product {
  id: string;
  name: string;
  style_code: string;
}

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const BOM_STATUS_MAP: Record<string, StatusConfig> = {
  draft: { label: "Draft", color: "gray" },
  approved: { label: "Approved", color: "green" },
  active: { label: "Active", color: "blue" },
};

// ---------------------------------------------------------------------------
// Item type icons/colors
// ---------------------------------------------------------------------------

const ITEM_TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; chartColor: string }
> = {
  fabric: {
    label: "Fabric",
    icon: <Scissors className="h-3.5 w-3.5" />,
    color: "bg-blue-100 text-blue-700",
    chartColor: "#3b82f6",
  },
  trim: {
    label: "Trim",
    icon: <Layers className="h-3.5 w-3.5" />,
    color: "bg-green-100 text-green-700",
    chartColor: "#22c55e",
  },
  chemical: {
    label: "Chemical",
    icon: <FlaskConical className="h-3.5 w-3.5" />,
    color: "bg-amber-100 text-amber-700",
    chartColor: "#f59e0b",
  },
  accessory: {
    label: "Accessory",
    icon: <Box className="h-3.5 w-3.5" />,
    color: "bg-purple-100 text-purple-700",
    chartColor: "#a855f7",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCostBreakdown(items: BOMItem[]) {
  const byType: Record<string, number> = {};
  for (const item of items) {
    byType[item.type] = (byType[item.type] ?? 0) + item.amount;
  }
  return Object.entries(byType).map(([type, value]) => ({
    name: ITEM_TYPE_CONFIG[type]?.label ?? type,
    value: Math.round(value * 100) / 100,
    color: ITEM_TYPE_CONFIG[type]?.chartColor ?? "#6b7280",
  }));
}

// ---------------------------------------------------------------------------
// Map DB rows to UI types
// ---------------------------------------------------------------------------

function mapBOMFromDB(row: Record<string, unknown>): BOM {
  const product = row.products as Record<string, unknown> | null;
  return {
    id: row.id as string,
    name: row.name as string,
    productName: product?.name as string ?? "Unknown Product",
    styleCode: product?.style_code as string ?? "",
    version: row.version as number ?? 1,
    status: (row.status as string ?? "draft") as BOM["status"],
    totalCost: Number(row.total_cost ?? 0),
    createdAt: row.created_at as string ?? "",
    items: [],
    notes: row.notes as string ?? "",
  };
}

function mapBOMItemFromDB(row: Record<string, unknown>): BOMItem {
  return {
    id: row.id as string,
    name: row.item_name as string,
    type: (row.item_type as string ?? "fabric") as BOMItem["type"],
    qtyPerPiece: Number(row.quantity_per_piece ?? 0),
    uom: row.uom as string ?? "meter",
    rate: Number(row.rate ?? 0),
    wastagePercent: Number(row.wastage_percent ?? 0),
    amount: Number(row.amount ?? 0),
  };
}

// ---------------------------------------------------------------------------
// New BOM form
// ---------------------------------------------------------------------------

interface NewBOMItem {
  itemType: string;
  itemName: string;
  qty: string;
  uom: string;
  rate: string;
}

interface NewBOMFormState {
  productId: string;
  name: string;
  version: string;
  notes: string;
  items: NewBOMItem[];
}

const BLANK_ITEM: NewBOMItem = {
  itemType: "fabric",
  itemName: "",
  qty: "",
  uom: "meter",
  rate: "",
};

const FORM_DEFAULTS: NewBOMFormState = {
  productId: "",
  name: "",
  version: "1",
  notes: "",
  items: [{ ...BLANK_ITEM }],
};

function NewBOMForm({
  form,
  onChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  products,
}: {
  form: NewBOMFormState;
  onChange: (field: keyof Omit<NewBOMFormState, "items">, value: string) => void;
  onItemChange: (idx: number, field: keyof NewBOMItem, value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (idx: number) => void;
  products: Product[];
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="productId">Product *</Label>
          <Select
            value={form.productId}
            onValueChange={(v) => onChange("productId", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a product..." />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} ({p.style_code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="version">Version</Label>
          <Input
            id="version"
            type="number"
            min={1}
            value={form.version}
            onChange={(e) => onChange("version", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bomName">BOM Name *</Label>
        <Input
          id="bomName"
          placeholder="e.g. Men's Polo Shirt BOM v1"
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any notes about this BOM..."
          value={form.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          rows={2}
        />
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-800">BOM Items</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddItem}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {form.items.map((item, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-gray-200 p-3 space-y-2 bg-gray-50/50"
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={item.itemType}
                    onValueChange={(v) => onItemChange(idx, "itemType", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fabric">Fabric</SelectItem>
                      <SelectItem value="trim">Trim</SelectItem>
                      <SelectItem value="chemical">Chemical</SelectItem>
                      <SelectItem value="accessory">Accessory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Item Name *</Label>
                  <Input
                    className="h-8 text-xs"
                    placeholder="Material name"
                    value={item.itemName}
                    onChange={(e) => onItemChange(idx, "itemName", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1 col-span-1">
                  <Label className="text-xs">Qty/Pc</Label>
                  <Input
                    className="h-8 text-xs"
                    placeholder="0.00"
                    type="number"
                    min={0}
                    step="0.001"
                    value={item.qty}
                    onChange={(e) => onItemChange(idx, "qty", e.target.value)}
                  />
                </div>
                <div className="space-y-1 col-span-1">
                  <Label className="text-xs">UOM</Label>
                  <Select
                    value={item.uom}
                    onValueChange={(v) => onItemChange(idx, "uom", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meter">meter</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="piece">piece</SelectItem>
                      <SelectItem value="cone">cone</SelectItem>
                      <SelectItem value="dozen">dozen</SelectItem>
                      <SelectItem value="liter">liter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 col-span-1">
                  <Label className="text-xs">Rate (INR)</Label>
                  <Input
                    className="h-8 text-xs"
                    placeholder="0.00"
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => onItemChange(idx, "rate", e.target.value)}
                  />
                </div>
                <div className="flex items-end pb-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(idx)}
                    disabled={form.items.length === 1}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BOM Detail Sheet
// ---------------------------------------------------------------------------

function BOMDetailSheet({
  bom,
  open,
  onOpenChange,
  onClone,
}: {
  bom: BOM | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClone: (bom: BOM) => void;
}) {
  if (!bom) return null;

  const total = bom.items.reduce((s, i) => s + i.amount, 0);
  const chartData = getCostBreakdown(bom.items);

  return (
    <FormSheet
      title={bom.name}
      description={`${bom.productName} — Style: ${bom.styleCode} — v${bom.version}`}
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      footer={
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onClone(bom)}
          >
            <Copy className="h-4 w-4 mr-2" />
            Clone BOM
          </Button>
          <StatusBadge status={bom.status} statusMap={BOM_STATUS_MAP} />
        </div>
      }
    >
      <div className="space-y-5">
        {/* Cost chart + summary */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Cost Breakdown
            </h4>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartTooltip
                    formatter={(value) =>
                      [`${formatCurrency(Number(value), "INR")}`, "Cost"]
                    }
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs text-gray-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-400 py-8 text-center">No items</p>
            )}
          </div>
          <div className="space-y-2">
            {chartData.map((d) => {
              const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
              return (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-sm text-gray-700">{d.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(d.value, "INR")}
                    </span>
                    <span className="ml-1 text-xs text-gray-400">({pct}%)</span>
                  </div>
                </div>
              );
            })}
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total Cost / Piece</span>
              <span className="text-base font-bold text-gray-900">
                {formatCurrency(total, "INR")}
              </span>
            </div>
          </div>
        </div>

        {/* Items table */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Material Items ({bom.items.length})
          </h4>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs font-semibold">Material Name</TableHead>
                  <TableHead className="text-xs font-semibold">Type</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Qty/Pc</TableHead>
                  <TableHead className="text-xs font-semibold">UOM</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Rate</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bom.items.map((item) => {
                  const typeCfg = ITEM_TYPE_CONFIG[item.type];
                  return (
                    <TableRow key={item.id} className="hover:bg-gray-50/50">
                      <TableCell className="text-sm text-gray-800">
                        {item.name}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                            typeCfg?.color ?? "bg-gray-100 text-gray-600"
                          )}
                        >
                          {typeCfg?.icon}
                          {typeCfg?.label ?? item.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums">
                        {item.qtyPerPiece}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {item.uom}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums">
                        {formatCurrency(item.rate, "INR")}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium tabular-nums">
                        {formatCurrency(item.amount, "INR")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {bom.notes && (
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
            <p className="text-xs font-semibold text-blue-700 mb-1">Notes</p>
            <p className="text-sm text-blue-800">{bom.notes}</p>
          </div>
        )}
      </div>
    </FormSheet>
  );
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

function buildColumns(
  onDetail: (bom: BOM) => void
): ColumnDef<BOM>[] {
  return [
    {
      accessorKey: "name",
      header: "BOM Name",
      cell: ({ row }) => (
        <button
          onClick={() => onDetail(row.original)}
          className="text-sm font-semibold text-blue-600 hover:underline text-left"
        >
          {row.original.name}
        </button>
      ),
    },
    {
      id: "product",
      header: "Product / Style",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {row.original.productName}
          </p>
          <p className="text-xs text-gray-400 font-mono">
            {row.original.styleCode}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "version",
      header: "Version",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">v{row.original.version}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.status}
          statusMap={BOM_STATUS_MAP}
        />
      ),
    },
    {
      accessorKey: "totalCost",
      header: "Total Cost / Pc",
      cell: ({ row }) => (
        <span className="text-sm font-semibold tabular-nums text-gray-900">
          {formatCurrency(row.original.totalCost, "INR")}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "action",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDetail(row.original)}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </Button>
      ),
    },
  ];
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BOMPage() {
  const { companyId, userId } = useCompany();
  const [boms, setBoms] = React.useState<BOM[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selectedBOM, setSelectedBOM] = React.useState<BOM | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<NewBOMFormState>(FORM_DEFAULTS);

  // Fetch BOMs
  const fetchBOMs = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await getBOMs(companyId);
      if (error) {
        toast.error("Failed to load BOMs");
        return;
      }
      const mapped: BOM[] = (data ?? []).map((row: Record<string, unknown>) =>
        mapBOMFromDB(row)
      );
      setBoms(mapped);
    } catch {
      toast.error("Failed to load BOMs");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Fetch products for the form dropdown
  const fetchProducts = React.useCallback(async () => {
    try {
      const { data, error } = await getProducts(companyId);
      if (error) return;
      const mapped: Product[] = (data ?? []).map((p: Record<string, unknown>) => ({
        id: p.id as string,
        name: p.name as string,
        style_code: p.style_code as string,
      }));
      setProducts(mapped);
    } catch {
      // Silently fail - products are for the form dropdown
    }
  }, [companyId]);

  React.useEffect(() => {
    fetchBOMs();
    fetchProducts();
  }, [fetchBOMs, fetchProducts]);

  const columns = React.useMemo(() => buildColumns(handleOpenDetail), []);

  // Open detail: fetch full BOM with items
  async function handleOpenDetail(bom: BOM) {
    try {
      const { data, error } = await getBOM(bom.id);
      if (error || !data) {
        toast.error("Failed to load BOM details");
        // Fallback to BOM without items
        setSelectedBOM(bom);
        setDetailOpen(true);
        return;
      }
      const row = data as Record<string, unknown>;
      const mapped = mapBOMFromDB(row);
      const bomItems = (row.bom_items as Record<string, unknown>[]) ?? [];
      mapped.items = bomItems.map(mapBOMItemFromDB);
      setSelectedBOM(mapped);
      setDetailOpen(true);
    } catch {
      toast.error("Failed to load BOM details");
      setSelectedBOM(bom);
      setDetailOpen(true);
    }
  }

  async function handleClone(bom: BOM) {
    try {
      const newName = `${bom.name} (Copy)`;
      const { error } = await cloneBOM(bom.id, newName);
      if (error) {
        toast.error("Failed to clone BOM: " + error);
        return;
      }
      toast.success("BOM cloned successfully");
      setDetailOpen(false);
      fetchBOMs();
    } catch {
      toast.error("Failed to clone BOM");
    }
  }

  function handleFormChange(
    field: keyof Omit<NewBOMFormState, "items">,
    value: string
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleItemChange(idx: number, field: keyof NewBOMItem, value: string) {
    setForm((prev) => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, items };
    });
  }

  function handleAddItem() {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { ...BLANK_ITEM }],
    }));
  }

  function handleRemoveItem(idx: number) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  }

  async function handleSave() {
    if (!form.productId || !form.name) {
      toast.error("Product and BOM name are required");
      return;
    }
    setSaving(true);
    try {
      const items = form.items
        .filter((i) => i.itemName)
        .map((i) => ({
          item_type: i.itemType,
          item_id: crypto.randomUUID(),
          item_name: i.itemName,
          quantity_per_piece: parseFloat(i.qty) || 0,
          uom: i.uom,
          rate: parseFloat(i.rate) || 0,
          wastage_percent: 5,
        }));

      const { error } = await createBOM({
        bom: {
          company_id: companyId,
          product_id: form.productId,
          name: form.name,
          version: parseInt(form.version) || 1,
          notes: form.notes || null,
          status: "draft",
          created_by: userId,
        },
        items,
      });

      if (error) {
        toast.error("Failed to create BOM: " + error);
        return;
      }

      toast.success("BOM created successfully");
      setCreateOpen(false);
      setForm(FORM_DEFAULTS);
      fetchBOMs();
    } catch {
      toast.error("Failed to create BOM");
    } finally {
      setSaving(false);
    }
  }

  // Stats
  const total = boms.length;
  const active = boms.filter((b) => b.status === "active").length;
  const avgCost =
    boms.length > 0
      ? boms.reduce((s, b) => s + b.totalCost, 0) / boms.length
      : 0;
  const pending = boms.filter((b) => b.status === "draft").length;

  const STAT_CARDS = [
    {
      title: "Total BOMs",
      value: total,
      icon: Layers,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Active BOMs",
      value: active,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Avg Material Cost",
      value: formatCurrency(Math.round(avgCost), "INR"),
      icon: IndianRupee,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Pending Approval",
      value: pending,
      icon: Clock,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  const FILTERS = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Approved", value: "approved" },
        { label: "Active", value: "active" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <PageHeader
        title="Bill of Materials"
        description="Define material composition and cost for each product style. Manage BOM versions and approvals."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Bill of Materials" },
        ]}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New BOM
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 leading-tight">
                    {card.title}
                  </p>
                  <p className="mt-1 text-2xl font-black tabular-nums text-gray-900">
                    {card.value}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    card.bg
                  )}
                >
                  <card.icon className={cn("h-5 w-5", card.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={boms}
            loading={loading}
            searchKey="name"
            searchPlaceholder="Search BOM name..."
            filters={FILTERS}
            onRowClick={handleOpenDetail}
            emptyMessage="No BOMs found. Create your first BOM."
          />
        </CardContent>
      </Card>

      {/* BOM Detail Sheet */}
      <BOMDetailSheet
        bom={selectedBOM}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onClone={handleClone}
      />

      {/* Create BOM Sheet */}
      <FormSheet
        title="New Bill of Materials"
        description="Define materials and quantities for this product style."
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSave={handleSave}
        saveLabel="Create BOM"
        saving={saving}
        size="lg"
      >
        <NewBOMForm
          form={form}
          onChange={handleFormChange}
          onItemChange={handleItemChange}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          products={products}
        />
      </FormSheet>
    </div>
  );
}
