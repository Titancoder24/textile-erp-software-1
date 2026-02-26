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

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_BOMS: BOM[] = [
  {
    id: "1",
    name: "Men's Polo Shirt BOM v2",
    productName: "Men's Polo Shirt",
    styleCode: "MPS-24-001",
    version: 2,
    status: "active",
    totalCost: 312.40,
    createdAt: "2026-01-15",
    notes: "Updated after buyer sampling. Approved by QC.",
    items: [
      { id: "i1", name: "Cotton Pique Fabric (200 GSM)", type: "fabric", qtyPerPiece: 0.55, uom: "meter", rate: 280, wastagePercent: 5, amount: 161.70 },
      { id: "i2", name: "Polyester Rib (Collar & Cuffs)", type: "fabric", qtyPerPiece: 0.08, uom: "meter", rate: 180, wastagePercent: 3, amount: 14.83 },
      { id: "i3", name: "Polo Button (Horn Look)", type: "trim", qtyPerPiece: 3, uom: "piece", rate: 2.5, wastagePercent: 2, amount: 7.65 },
      { id: "i4", name: "Woven Label (Brand)", type: "trim", qtyPerPiece: 1, uom: "piece", rate: 8, wastagePercent: 0, amount: 8.00 },
      { id: "i5", name: "Care Label", type: "trim", qtyPerPiece: 1, uom: "piece", rate: 3, wastagePercent: 0, amount: 3.00 },
      { id: "i6", name: "Sewing Thread (Polyester)", type: "trim", qtyPerPiece: 0.025, uom: "cone", rate: 220, wastagePercent: 5, amount: 5.78 },
      { id: "i7", name: "Interlining (Collar)", type: "fabric", qtyPerPiece: 0.04, uom: "meter", rate: 120, wastagePercent: 5, amount: 5.04 },
      { id: "i8", name: "Hangtag", type: "accessory", qtyPerPiece: 1, uom: "piece", rate: 5, wastagePercent: 0, amount: 5.00 },
      { id: "i9", name: "Polybag", type: "accessory", qtyPerPiece: 1, uom: "piece", rate: 4.5, wastagePercent: 0, amount: 4.50 },
      { id: "i10", name: "Reactive Dye (Navy)", type: "chemical", qtyPerPiece: 0.015, uom: "kg", rate: 450, wastagePercent: 10, amount: 7.43 },
    ],
  },
  {
    id: "2",
    name: "Women's Kurta BOM v1",
    productName: "Women's Ethnic Kurta",
    styleCode: "WEK-24-005",
    version: 1,
    status: "approved",
    totalCost: 485.80,
    createdAt: "2026-01-22",
    notes: "Approved for production run.",
    items: [
      { id: "j1", name: "Cotton Voile (65 GSM)", type: "fabric", qtyPerPiece: 2.20, uom: "meter", rate: 160, wastagePercent: 8, amount: 380.16 },
      { id: "j2", name: "Lace Trim (Border)", type: "trim", qtyPerPiece: 0.80, uom: "meter", rate: 45, wastagePercent: 3, amount: 37.08 },
      { id: "j3", name: "Small Buttons (Neck)", type: "trim", qtyPerPiece: 5, uom: "piece", rate: 1.5, wastagePercent: 2, amount: 7.65 },
      { id: "j4", name: "Brand Label", type: "trim", qtyPerPiece: 1, uom: "piece", rate: 12, wastagePercent: 0, amount: 12.00 },
      { id: "j5", name: "Cotton Thread", type: "trim", qtyPerPiece: 0.03, uom: "cone", rate: 180, wastagePercent: 5, amount: 5.67 },
      { id: "j6", name: "Embroidery Thread", type: "trim", qtyPerPiece: 0.01, uom: "cone", rate: 320, wastagePercent: 5, amount: 3.36 },
      { id: "j7", name: "Polybag", type: "accessory", qtyPerPiece: 1, uom: "piece", rate: 5, wastagePercent: 0, amount: 5.00 },
    ],
  },
  {
    id: "3",
    name: "Basic Tee BOM v3",
    productName: "Unisex Basic T-Shirt",
    styleCode: "UBT-23-010",
    version: 3,
    status: "active",
    totalCost: 198.60,
    createdAt: "2025-11-05",
    notes: "Version 3 - reduced fabric wastage from 8% to 5%.",
    items: [
      { id: "k1", name: "Cotton Jersey (160 GSM)", type: "fabric", qtyPerPiece: 0.45, uom: "meter", rate: 240, wastagePercent: 5, amount: 113.40 },
      { id: "k2", name: "Polyester Rib Neck", type: "fabric", qtyPerPiece: 0.05, uom: "meter", rate: 160, wastagePercent: 3, amount: 8.24 },
      { id: "k3", name: "Brand Label", type: "trim", qtyPerPiece: 1, uom: "piece", rate: 8, wastagePercent: 0, amount: 8.00 },
      { id: "k4", name: "Care Label", type: "trim", qtyPerPiece: 1, uom: "piece", rate: 3, wastagePercent: 0, amount: 3.00 },
      { id: "k5", name: "Sewing Thread", type: "trim", qtyPerPiece: 0.02, uom: "cone", rate: 200, wastagePercent: 5, amount: 4.20 },
      { id: "k6", name: "Polybag", type: "accessory", qtyPerPiece: 1, uom: "piece", rate: 4, wastagePercent: 0, amount: 4.00 },
      { id: "k7", name: "Reactive Dye (Black)", type: "chemical", qtyPerPiece: 0.012, uom: "kg", rate: 420, wastagePercent: 10, amount: 5.54 },
    ],
  },
  {
    id: "4",
    name: "Denim Jeans BOM v1",
    productName: "Men's Slim Fit Denim",
    styleCode: "MSD-24-002",
    version: 1,
    status: "draft",
    totalCost: 672.15,
    createdAt: "2026-02-01",
    notes: "Draft pending fabric GSM confirmation from buyer.",
    items: [
      { id: "l1", name: "Denim Fabric (360 GSM)", type: "fabric", qtyPerPiece: 1.35, uom: "meter", rate: 380, wastagePercent: 7, amount: 549.09 },
      { id: "l2", name: "Denim Zipper (YKK)", type: "trim", qtyPerPiece: 1, uom: "piece", rate: 18, wastagePercent: 2, amount: 18.36 },
      { id: "l3", name: "Copper Rivets", type: "trim", qtyPerPiece: 6, uom: "piece", rate: 3.5, wastagePercent: 2, amount: 21.42 },
      { id: "l4", name: "Brand Button (Metal)", type: "trim", qtyPerPiece: 1, uom: "piece", rate: 12, wastagePercent: 0, amount: 12.00 },
      { id: "l5", name: "Sewing Thread (Jeans)", type: "trim", qtyPerPiece: 0.04, uom: "cone", rate: 260, wastagePercent: 5, amount: 10.92 },
      { id: "l6", name: "Brand Label (Leather Patch)", type: "trim", qtyPerPiece: 1, uom: "piece", rate: 22, wastagePercent: 0, amount: 22.00 },
      { id: "l7", name: "Potassium Permanganate", type: "chemical", qtyPerPiece: 0.008, uom: "kg", rate: 380, wastagePercent: 5, amount: 3.19 },
    ],
  },
  {
    id: "5",
    name: "Kids Hoodie BOM v2",
    productName: "Kids Fleece Hoodie",
    styleCode: "KFH-24-008",
    version: 2,
    status: "approved",
    totalCost: 389.25,
    createdAt: "2026-01-30",
    notes: "Drawstring removed per EU safety regulation.",
    items: [
      { id: "m1", name: "Fleece Fabric (280 GSM)", type: "fabric", qtyPerPiece: 0.80, uom: "meter", rate: 320, wastagePercent: 6, amount: 271.36 },
      { id: "m2", name: "Poly Rib (Cuffs & Hem)", type: "fabric", qtyPerPiece: 0.15, uom: "meter", rate: 200, wastagePercent: 3, amount: 30.90 },
      { id: "m3", name: "YKK Zipper (Full Length)", type: "trim", qtyPerPiece: 1, uom: "piece", rate: 28, wastagePercent: 2, amount: 28.56 },
      { id: "m4", name: "Brand Label", type: "trim", qtyPerPiece: 1, uom: "piece", rate: 10, wastagePercent: 0, amount: 10.00 },
      { id: "m5", name: "Sewing Thread", type: "trim", qtyPerPiece: 0.03, uom: "cone", rate: 200, wastagePercent: 5, amount: 6.30 },
      { id: "m6", name: "Kangaroo Pocket Zip", type: "trim", qtyPerPiece: 1, uom: "piece", rate: 15, wastagePercent: 2, amount: 15.30 },
      { id: "m7", name: "Polybag + Hanger", type: "accessory", qtyPerPiece: 1, uom: "piece", rate: 8.5, wastagePercent: 0, amount: 8.50 },
    ],
  },
  {
    id: "6",
    name: "Ladies Blouse BOM v1",
    productName: "Chiffon Formal Blouse",
    styleCode: "CFB-24-011",
    version: 1,
    status: "draft",
    totalCost: 284.70,
    createdAt: "2026-02-10",
    notes: "New style - awaiting first sample approval.",
    items: [
      { id: "n1", name: "Poly Chiffon (60 GSM)", type: "fabric", qtyPerPiece: 1.40, uom: "meter", rate: 140, wastagePercent: 8, amount: 211.68 },
      { id: "n2", name: "Lining Fabric", type: "fabric", qtyPerPiece: 0.60, uom: "meter", rate: 90, wastagePercent: 5, amount: 56.70 },
      { id: "n3", name: "Pearl Buttons", type: "trim", qtyPerPiece: 7, uom: "piece", rate: 2, wastagePercent: 2, amount: 14.28 },
      { id: "n4", name: "Brand Label", type: "trim", qtyPerPiece: 1, uom: "piece", rate: 12, wastagePercent: 0, amount: 12.00 },
      { id: "n5", name: "Interlining", type: "fabric", qtyPerPiece: 0.05, uom: "meter", rate: 100, wastagePercent: 5, amount: 5.25 },
      { id: "n6", name: "Polybag", type: "accessory", qtyPerPiece: 1, uom: "piece", rate: 5, wastagePercent: 0, amount: 5.00 },
    ],
  },
];

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
  productName: string;
  styleCode: string;
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
  productName: "",
  styleCode: "",
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
}: {
  form: NewBOMFormState;
  onChange: (field: keyof Omit<NewBOMFormState, "items">, value: string) => void;
  onItemChange: (idx: number, field: keyof NewBOMItem, value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (idx: number) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="productName">Product Name *</Label>
          <Input
            id="productName"
            placeholder="e.g. Men's Polo Shirt"
            value={form.productName}
            onChange={(e) => onChange("productName", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="styleCode">Style Code *</Label>
          <Input
            id="styleCode"
            placeholder="e.g. MPS-24-001"
            value={form.styleCode}
            onChange={(e) => onChange("styleCode", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="bomName">BOM Name *</Label>
          <Input
            id="bomName"
            placeholder="e.g. Men's Polo Shirt BOM v1"
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
          />
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
  const [boms, setBoms] = React.useState<BOM[]>(MOCK_BOMS);
  const [selectedBOM, setSelectedBOM] = React.useState<BOM | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<NewBOMFormState>(FORM_DEFAULTS);

  const columns = React.useMemo(() => buildColumns(handleOpenDetail), []);

  function handleOpenDetail(bom: BOM) {
    setSelectedBOM(bom);
    setDetailOpen(true);
  }

  function handleClone(bom: BOM) {
    const cloned: BOM = {
      ...bom,
      id: String(boms.length + 1),
      name: `${bom.name} (Copy)`,
      status: "draft",
      version: bom.version + 1,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setBoms((prev) => [cloned, ...prev]);
    setDetailOpen(false);
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

  function handleSave() {
    if (!form.productName || !form.name) return;
    setSaving(true);
    setTimeout(() => {
      const items: BOMItem[] = form.items
        .filter((i) => i.itemName)
        .map((i, idx) => {
          const qty = parseFloat(i.qty) || 0;
          const rate = parseFloat(i.rate) || 0;
          return {
            id: `new-${idx}`,
            name: i.itemName,
            type: i.itemType as BOMItem["type"],
            qtyPerPiece: qty,
            uom: i.uom,
            rate,
            wastagePercent: 5,
            amount: qty * rate * 1.05,
          };
        });
      const totalCost = items.reduce((s, i) => s + i.amount, 0);
      const newBOM: BOM = {
        id: String(boms.length + 1),
        name: form.name,
        productName: form.productName,
        styleCode: form.styleCode,
        version: parseInt(form.version) || 1,
        status: "draft",
        totalCost,
        createdAt: new Date().toISOString().split("T")[0],
        items,
        notes: form.notes,
      };
      setBoms((prev) => [newBOM, ...prev]);
      setSaving(false);
      setCreateOpen(false);
      setForm(FORM_DEFAULTS);
    }, 800);
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
        />
      </FormSheet>
    </div>
  );
}
