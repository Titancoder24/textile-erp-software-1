"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { CURRENCIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MaterialRow {
  id: string;
  item: string;
  qtyPerPiece: number;
  rate: number;
}

// ---------------------------------------------------------------------------
// Static options
// ---------------------------------------------------------------------------

const PRODUCTS = [
  "Men's Woven Shirt",
  "Women's Knitwear",
  "Kids T-Shirt",
  "Denim Jeans",
  "Ladies Blouse",
  "Sports Polo",
  "Casual Hoodie",
];

// ---------------------------------------------------------------------------
// Helper: generate unique id
// ---------------------------------------------------------------------------

let nextId = 1;
function genId() {
  return `mat-${nextId++}`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CostingNewPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  // Header fields
  const [product, setProduct] = React.useState("");
  const [orderNumber, setOrderNumber] = React.useState("");
  const [currency, setCurrency] = React.useState("USD");
  const [exchangeRate, setExchangeRate] = React.useState("83.50");

  // Section 1 - Material costs
  const [materials, setMaterials] = React.useState<MaterialRow[]>([
    { id: genId(), item: "Main Fabric", qtyPerPiece: 1.5, rate: 180 },
    { id: genId(), item: "Lining Fabric", qtyPerPiece: 0.5, rate: 120 },
    { id: genId(), item: "Interlining", qtyPerPiece: 0.3, rate: 90 },
    { id: genId(), item: "Thread", qtyPerPiece: 0.05, rate: 200 },
    { id: genId(), item: "Buttons", qtyPerPiece: 8, rate: 1.5 },
    { id: genId(), item: "Labels", qtyPerPiece: 2, rate: 3 },
  ]);

  function addMaterial() {
    setMaterials((prev) => [...prev, { id: genId(), item: "", qtyPerPiece: 0, rate: 0 }]);
  }

  function removeMaterial(id: string) {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  }

  function updateMaterial(id: string, field: keyof MaterialRow, value: string | number) {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  }

  // Section 2 - Process costs (per piece in INR)
  const [cutting, setCutting] = React.useState("8.50");
  const [sewing, setSewing] = React.useState("35.00");
  const [finishing, setFinishing] = React.useState("12.00");
  const [dyeing, setDyeing] = React.useState("15.00");
  const [printing, setPrinting] = React.useState("0.00");

  // Section 3 - Overhead (per piece)
  const [factoryOverhead, setFactoryOverhead] = React.useState("10.00");
  const [adminOverhead, setAdminOverhead] = React.useState("5.00");

  // Section 4 - Other costs (per piece)
  const [testing, setTesting] = React.useState("4.00");
  const [packing, setPacking] = React.useState("6.00");
  const [transport, setTransport] = React.useState("3.50");

  // Section 5 - Allowances
  const [rejectionPct, setRejectionPct] = React.useState("3");
  const [commissionPct, setCommissionPct] = React.useState("5");
  const [profitPct, setProfitPct] = React.useState("10");

  // ---------------------------------------------------------------------------
  // Calculations (all in INR per piece)
  // ---------------------------------------------------------------------------

  const totalMaterial = React.useMemo(() => {
    return materials.reduce((sum, m) => sum + m.qtyPerPiece * m.rate, 0);
  }, [materials]);

  const totalProcess = React.useMemo(() => {
    return [cutting, sewing, finishing, dyeing, printing].reduce(
      (sum, v) => sum + (parseFloat(v) || 0),
      0
    );
  }, [cutting, sewing, finishing, dyeing, printing]);

  const totalOverhead = React.useMemo(() => {
    return (parseFloat(factoryOverhead) || 0) + (parseFloat(adminOverhead) || 0);
  }, [factoryOverhead, adminOverhead]);

  const totalOther = React.useMemo(() => {
    return [testing, packing, transport].reduce(
      (sum, v) => sum + (parseFloat(v) || 0),
      0
    );
  }, [testing, packing, transport]);

  const baseCost = totalMaterial + totalProcess + totalOverhead + totalOther;

  const rejectionAllowance = baseCost * ((parseFloat(rejectionPct) || 0) / 100);
  const afterRejection = baseCost + rejectionAllowance;

  const commissionAmount = afterRejection * ((parseFloat(commissionPct) || 0) / 100);
  const totalCost = afterRejection + commissionAmount;

  const profitAmount = totalCost * ((parseFloat(profitPct) || 0) / 100);
  const fobPriceINR = totalCost + profitAmount;

  const exRate = parseFloat(exchangeRate) || 1;
  const fobPriceUSD = fobPriceINR / exRate;

  const marginPct = fobPriceINR > 0 ? (profitAmount / fobPriceINR) * 100 : 0;

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    router.push("/costing");
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="gap-1.5">
          <Link href="/costing">
            <ArrowLeft className="h-4 w-4" />
            Costing
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <h1 className="text-xl font-bold text-gray-900">New Cost Sheet</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column - Form sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Product Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="cs-product">Product *</Label>
                  <Select value={product} onValueChange={setProduct}>
                    <SelectTrigger id="cs-product">
                      <SelectValue placeholder="Select product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCTS.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cs-order">Order # (optional)</Label>
                  <Input
                    id="cs-order"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g. ORD-2026-0012"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cs-currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="cs-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cs-exrate">Exchange Rate (INR per USD)</Label>
                  <Input
                    id="cs-exrate"
                    type="number"
                    step="0.01"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 1 - Material Cost */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white mr-2">1</span>
                    Material Cost
                  </CardTitle>
                  <span className="text-sm font-bold tabular-nums text-gray-900">
                    INR {totalMaterial.toFixed(2)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="py-2.5 pl-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 min-w-[180px]">Item</th>
                        <th className="px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 w-28">Qty/Piece</th>
                        <th className="px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 w-28">Rate (INR)</th>
                        <th className="px-2 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 w-28">Amount</th>
                        <th className="w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map((mat) => {
                        const amount = mat.qtyPerPiece * mat.rate;
                        return (
                          <tr key={mat.id} className="border-b border-gray-100">
                            <td className="py-2 pl-3 pr-2">
                              <Input
                                value={mat.item}
                                onChange={(e) => updateMaterial(mat.id, "item", e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Material name"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={mat.qtyPerPiece || ""}
                                onChange={(e) => updateMaterial(mat.id, "qtyPerPiece", parseFloat(e.target.value) || 0)}
                                className="h-8 text-center tabular-nums text-sm"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={mat.rate || ""}
                                onChange={(e) => updateMaterial(mat.id, "rate", parseFloat(e.target.value) || 0)}
                                className="h-8 text-center tabular-nums text-sm"
                              />
                            </td>
                            <td className="px-2 py-2 text-right tabular-nums font-medium text-gray-900">
                              {amount.toFixed(2)}
                            </td>
                            <td className="pr-2">
                              <button
                                type="button"
                                onClick={() => removeMaterial(mat.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-gray-50 border-t border-gray-200">
                        <td colSpan={3} className="py-2.5 pl-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Total Material
                        </td>
                        <td className="px-2 py-2.5 text-right font-bold tabular-nums text-gray-900">
                          {totalMaterial.toFixed(2)}
                        </td>
                        <td />
                      </tr>
                    </tbody>
                  </table>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addMaterial} className="mt-3">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add Material
                </Button>
              </CardContent>
            </Card>

            {/* Section 2 - Process Costs */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white mr-2">2</span>
                    Process Costs (per piece, INR)
                  </CardTitle>
                  <span className="text-sm font-bold tabular-nums text-gray-900">
                    INR {totalProcess.toFixed(2)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {[
                    { label: "Cutting", value: cutting, setter: setCutting },
                    { label: "Sewing", value: sewing, setter: setSewing },
                    { label: "Finishing", value: finishing, setter: setFinishing },
                    { label: "Dyeing", value: dyeing, setter: setDyeing },
                    { label: "Printing", value: printing, setter: setPrinting },
                  ].map((field) => (
                    <div key={field.label} className="space-y-1.5">
                      <Label className="text-xs">{field.label}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.value}
                        onChange={(e) => field.setter(e.target.value)}
                        className="tabular-nums"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Section 3 - Overhead */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white mr-2">3</span>
                    Overhead (per piece, INR)
                  </CardTitle>
                  <span className="text-sm font-bold tabular-nums text-gray-900">
                    INR {totalOverhead.toFixed(2)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Factory Overhead</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={factoryOverhead}
                      onChange={(e) => setFactoryOverhead(e.target.value)}
                      className="tabular-nums"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Admin Overhead</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={adminOverhead}
                      onChange={(e) => setAdminOverhead(e.target.value)}
                      className="tabular-nums"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 4 - Other costs */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white mr-2">4</span>
                    Other Costs (per piece, INR)
                  </CardTitle>
                  <span className="text-sm font-bold tabular-nums text-gray-900">
                    INR {totalOther.toFixed(2)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {[
                    { label: "Testing", value: testing, setter: setTesting },
                    { label: "Packing", value: packing, setter: setPacking },
                    { label: "Transport", value: transport, setter: setTransport },
                  ].map((field) => (
                    <div key={field.label} className="space-y-1.5">
                      <Label className="text-xs">{field.label}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.value}
                        onChange={(e) => field.setter(e.target.value)}
                        className="tabular-nums"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Section 5 - Allowances */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white mr-2">5</span>
                  Allowances
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Rejection %</Label>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={rejectionPct}
                      onChange={(e) => setRejectionPct(e.target.value)}
                      className="tabular-nums"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Commission %</Label>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={commissionPct}
                      onChange={(e) => setCommissionPct(e.target.value)}
                      className="tabular-nums"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Profit %</Label>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={profitPct}
                      onChange={(e) => setProfitPct(e.target.value)}
                      className="tabular-nums"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pb-6">
              <Button type="button" variant="outline" asChild>
                <Link href="/costing">Cancel</Link>
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitting ? "Saving..." : "Save Cost Sheet"}
              </Button>
            </div>
          </div>

          {/* Right column - Sticky Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <Card className="border-blue-200 bg-blue-50/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-blue-900">Cost Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-0">
                  <div className="divide-y divide-blue-100">
                    {/* Base components */}
                    <div className="space-y-2 pb-3">
                      <SummaryRow label="Material Cost" value={totalMaterial} />
                      <SummaryRow label="Process Cost" value={totalProcess} />
                      <SummaryRow label="Overhead" value={totalOverhead} />
                      <SummaryRow label="Other Costs" value={totalOther} />
                    </div>

                    {/* Base cost */}
                    <div className="py-3">
                      <SummaryRow label="Base Cost" value={baseCost} bold />
                    </div>

                    {/* Allowances */}
                    <div className="space-y-2 py-3">
                      <SummaryRow
                        label={`+ Rejection (${rejectionPct}%)`}
                        value={rejectionAllowance}
                        muted
                      />
                      <SummaryRow
                        label={`+ Commission (${commissionPct}%)`}
                        value={commissionAmount}
                        muted
                      />
                    </div>

                    {/* Total cost */}
                    <div className="py-3">
                      <SummaryRow label="Total Cost" value={totalCost} bold />
                    </div>

                    {/* Profit */}
                    <div className="py-3">
                      <SummaryRow
                        label={`+ Profit (${profitPct}%)`}
                        value={profitAmount}
                        muted
                      />
                    </div>

                    {/* FOB Price */}
                    <div className="pt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-blue-900">FOB Price (INR)</span>
                        <span className="text-lg font-black tabular-nums text-blue-900">
                          {fobPriceINR.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-blue-900">FOB Price (USD)</span>
                        <span className="text-lg font-black tabular-nums text-blue-900">
                          ${fobPriceUSD.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-gray-500">Margin %</span>
                        <span
                          className={cn(
                            "text-sm font-bold tabular-nums",
                            marginPct >= 25
                              ? "text-green-600"
                              : marginPct >= 15
                              ? "text-yellow-600"
                              : "text-red-600"
                          )}
                        >
                          {marginPct.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 pt-1">
                        Exchange rate: 1 USD = INR {exRate.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary row component
// ---------------------------------------------------------------------------

function SummaryRow({
  label,
  value,
  bold = false,
  muted = false,
}: {
  label: string;
  value: number;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={cn(
          "text-sm",
          bold ? "font-semibold text-gray-900" : muted ? "text-gray-500" : "text-gray-700"
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "tabular-nums text-sm",
          bold ? "font-bold text-gray-900" : muted ? "text-gray-500" : "font-medium text-gray-700"
        )}
      >
        {value.toFixed(2)}
      </span>
    </div>
  );
}
