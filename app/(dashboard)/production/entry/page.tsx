"use client";

import * as React from "react";
import { Save, RotateCcw, Calculator, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Demo options -- in production fetched from Supabase
// ---------------------------------------------------------------------------

const LINES = [
  { value: "Line 1", label: "Line 1 - Main Sewing" },
  { value: "Line 2", label: "Line 2 - Ladies Tops" },
  { value: "Line 3", label: "Line 3 - Kids Wear" },
  { value: "Line 4", label: "Line 4 - Denim" },
  { value: "Line 5", label: "Line 5 - Outerwear" },
  { value: "Line 6", label: "Line 6 - Knits" },
  { value: "Line 7", label: "Line 7 - Finishing" },
  { value: "Line 8", label: "Line 8 - Sportswear" },
];

const SHIFTS = [
  { value: "morning", label: "Morning (6 AM - 2 PM)" },
  { value: "evening", label: "Evening (2 PM - 10 PM)" },
  { value: "night", label: "Night (10 PM - 6 AM)" },
];

const HOUR_SLOTS = [
  { value: "08:00", label: "08:00 - 09:00" },
  { value: "09:00", label: "09:00 - 10:00" },
  { value: "10:00", label: "10:00 - 11:00" },
  { value: "11:00", label: "11:00 - 12:00" },
  { value: "12:00", label: "12:00 - 13:00" },
  { value: "13:00", label: "13:00 - 14:00" },
  { value: "14:00", label: "14:00 - 15:00" },
  { value: "15:00", label: "15:00 - 16:00" },
  { value: "16:00", label: "16:00 - 17:00" },
  { value: "17:00", label: "17:00 - 18:00" },
];

const WORK_ORDERS: Record<string, { woNumber: string; orderNumber: string; product: string }> = {
  "Line 1": { woNumber: "WO-2026-0051", orderNumber: "ORD-2401", product: "Classic Polo Shirt" },
  "Line 2": { woNumber: "WO-2026-0052", orderNumber: "ORD-2398", product: "Linen Blouse" },
  "Line 3": { woNumber: "WO-2026-0053", orderNumber: "ORD-2395", product: "Kids T-Shirt Set" },
  "Line 4": { woNumber: "WO-2026-0054", orderNumber: "ORD-2402", product: "Slim Fit Jeans" },
  "Line 5": { woNumber: "WO-2026-0055", orderNumber: "ORD-2400", product: "Quilted Jacket" },
  "Line 6": { woNumber: "WO-2026-0056", orderNumber: "ORD-2403", product: "Crew Neck Sweater" },
  "Line 7": { woNumber: "WO-2026-0057", orderNumber: "ORD-2399", product: "Chino Trousers" },
  "Line 8": { woNumber: "WO-2026-0058", orderNumber: "ORD-2404", product: "Dry-Fit T-Shirt" },
};

const DEFAULT_SMV = 10;

type FormState = {
  date: string;
  shift: string;
  line: string;
  hourSlot: string;
  targetQty: string;
  producedQty: string;
  defectiveQty: string;
  reworkQty: string;
  operatorsPresent: string;
  workingMinutes: string;
  notes: string;
};

const today = new Date().toISOString().split("T")[0];

const INITIAL_FORM: FormState = {
  date: today,
  shift: "morning",
  line: "",
  hourSlot: "",
  targetQty: "",
  producedQty: "",
  defectiveQty: "0",
  reworkQty: "0",
  operatorsPresent: "",
  workingMinutes: "60",
  notes: "",
};

export default function ProductionEntryPage() {
  const [form, setForm] = React.useState<FormState>(INITIAL_FORM);
  const [saving, setSaving] = React.useState(false);
  const [entriesSaved, setEntriesSaved] = React.useState(0);

  const lineWO = form.line ? WORK_ORDERS[form.line] : null;

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Calculate efficiency
  const produced = parseInt(form.producedQty) || 0;
  const operators = parseInt(form.operatorsPresent) || 0;
  const minutes = parseInt(form.workingMinutes) || 0;
  const efficiency =
    operators > 0 && minutes > 0
      ? Math.round((produced * DEFAULT_SMV) / (minutes * operators) * 100)
      : 0;

  const handleSave = async () => {
    if (!form.line) {
      toast.error("Please select a production line.");
      return;
    }
    if (!form.producedQty || produced === 0) {
      toast.error("Please enter produced quantity.");
      return;
    }
    if (operators === 0) {
      toast.error("Please enter number of operators present.");
      return;
    }

    setSaving(true);
    // In production: await createProductionEntry({ ... })
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    setEntriesSaved((prev) => prev + 1);

    toast.success(
      `Entry saved: ${produced} pcs on ${form.line} (${efficiency}% efficiency)`,
      { duration: 3000 }
    );

    // Reset form keeping date, shift, line
    setForm((prev) => ({
      ...INITIAL_FORM,
      date: prev.date,
      shift: prev.shift,
      line: prev.line,
    }));
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Production Data Entry"
        description="Enter hourly production data. Form resets after each save, keeping date, shift, and line."
        breadcrumb={[
          { label: "Production", href: "/production" },
          { label: "Data Entry" },
        ]}
        actions={
          entriesSaved > 0 ? (
            <div className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              {entriesSaved} {entriesSaved === 1 ? "entry" : "entries"} saved this session
            </div>
          ) : undefined
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-5 space-y-5">
              {/* Row 1: Date, Shift, Line */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="entry-date">Date</Label>
                  <Input
                    id="entry-date"
                    type="date"
                    value={form.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Shift</Label>
                  <Select
                    value={form.shift}
                    onValueChange={(v) => handleChange("shift", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      {SHIFTS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>
                    Line <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={form.line}
                    onValueChange={(v) => handleChange("line", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select line" />
                    </SelectTrigger>
                    <SelectContent>
                      {LINES.map((l) => (
                        <SelectItem key={l.value} value={l.value}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Hour Slot + Work Order */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Hour Slot (optional)</Label>
                  <Select
                    value={form.hourSlot}
                    onValueChange={(v) => handleChange("hourSlot", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select hour" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOUR_SLOTS.map((h) => (
                        <SelectItem key={h.value} value={h.value}>
                          {h.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Work Order</Label>
                  <Input
                    readOnly
                    value={lineWO ? `${lineWO.woNumber} - ${lineWO.product}` : "Select a line first"}
                    className="bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              {/* Row 3: Quantities */}
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-1.5">
                  <Label htmlFor="target-qty">Target Qty</Label>
                  <Input
                    id="target-qty"
                    type="number"
                    min="0"
                    value={form.targetQty}
                    onChange={(e) => handleChange("targetQty", e.target.value)}
                    placeholder="e.g. 100"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="produced-qty">
                    Produced Qty <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="produced-qty"
                    type="number"
                    min="0"
                    value={form.producedQty}
                    onChange={(e) => handleChange("producedQty", e.target.value)}
                    placeholder="e.g. 85"
                    className="font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="defective-qty">Defective Qty</Label>
                  <Input
                    id="defective-qty"
                    type="number"
                    min="0"
                    value={form.defectiveQty}
                    onChange={(e) => handleChange("defectiveQty", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rework-qty">Rework Qty</Label>
                  <Input
                    id="rework-qty"
                    type="number"
                    min="0"
                    value={form.reworkQty}
                    onChange={(e) => handleChange("reworkQty", e.target.value)}
                  />
                </div>
              </div>

              {/* Row 4: Operators, Working Minutes */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="operators">
                    Operators Present <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="operators"
                    type="number"
                    min="1"
                    value={form.operatorsPresent}
                    onChange={(e) =>
                      handleChange("operatorsPresent", e.target.value)
                    }
                    placeholder="e.g. 30"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="working-min">Working Minutes</Label>
                  <Input
                    id="working-min"
                    type="number"
                    min="1"
                    max="480"
                    value={form.workingMinutes}
                    onChange={(e) =>
                      handleChange("workingMinutes", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Any remarks about this entry..."
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <Button variant="outline" onClick={handleReset} size="sm">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Entry"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Efficiency Panel */}
        <div>
          <Card className="sticky top-4">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-gray-700">
                <Calculator className="h-5 w-5" />
                <h3 className="text-sm font-semibold">Live Calculation</h3>
              </div>

              <div className="text-center py-4">
                <p
                  className={cn(
                    "text-5xl font-black tabular-nums",
                    efficiency >= 65
                      ? "text-green-600"
                      : efficiency >= 50
                      ? "text-yellow-600"
                      : efficiency > 0
                      ? "text-red-600"
                      : "text-gray-300"
                  )}
                >
                  {efficiency > 0 ? `${efficiency}%` : "--"}
                </p>
                <p className="mt-1 text-sm text-gray-500">Efficiency</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Formula</span>
                  <span className="text-xs font-mono text-gray-400">
                    (pcs x SMV) / (min x ops) x 100
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Produced</span>
                  <span className="font-semibold text-gray-900 tabular-nums">
                    {produced || 0} pcs
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Default SMV</span>
                  <span className="font-semibold text-gray-900 tabular-nums">
                    {DEFAULT_SMV}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Operators</span>
                  <span className="font-semibold text-gray-900 tabular-nums">
                    {operators || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Minutes</span>
                  <span className="font-semibold text-gray-900 tabular-nums">
                    {minutes || 0}
                  </span>
                </div>
              </div>

              {lineWO && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs">
                  <p className="font-semibold text-gray-700">
                    {lineWO.woNumber}
                  </p>
                  <p className="text-gray-500">
                    {lineWO.orderNumber} - {lineWO.product}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
