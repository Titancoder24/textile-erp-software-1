"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { CURRENCIES } from "@/lib/constants";
import { useCompany } from "@/contexts/company-context";
import { getBuyers } from "@/lib/actions/buyers";
import { getProducts, getColors, getSizes } from "@/lib/actions/masters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ColorSizeMatrix } from "@/components/forms/color-size-matrix";

const PAYMENT_TERMS = [
  "Advance 100%",
  "30% Advance, 70% Before Shipment",
  "LC at Sight",
  "LC 30 Days",
  "LC 60 Days",
  "LC 90 Days",
  "TT 30 Days After B/L",
  "TT 60 Days After B/L",
  "DA 30 Days",
  "DA 60 Days",
  "DA 90 Days",
  "Open Account 30 Days",
  "Open Account 60 Days",
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function NewOrderPage() {
  const router = useRouter();
  const { companyId, userId } = useCompany();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Fetched master data
  const [buyers, setBuyers] = React.useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = React.useState<{ id: string; name: string }[]>([]);
  const [availableColors, setAvailableColors] = React.useState<{ id: string; name: string; hex_code?: string }[]>([]);
  const [availableSizes, setAvailableSizes] = React.useState<{ id: string; name: string; sort_order: number }[]>([]);

  const fetchMasterData = React.useCallback(async () => {
    if (!companyId) return;
    const [buyersRes, productsRes, colorsRes, sizesRes] = await Promise.all([
      getBuyers(companyId),
      getProducts(companyId),
      getColors(companyId),
      getSizes(companyId),
    ]);
    if (buyersRes.data) setBuyers(buyersRes.data.map((b) => ({ id: b.id, name: b.name })));
    if (productsRes.data) setProducts(productsRes.data.map((p) => ({ id: p.id, name: p.name })));
    if (colorsRes.data) setAvailableColors(colorsRes.data.map((c) => ({ id: c.id, name: c.name, hex_code: c.hex_code ?? undefined })));
    if (sizesRes.data) setAvailableSizes(sizesRes.data.map((s) => ({ id: s.id, name: s.name, sort_order: s.sort_order ?? 0 })));
  }, [companyId]);

  React.useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  // Section 1 - Basic Info
  const [buyer, setBuyer] = React.useState("");
  const [product, setProduct] = React.useState("");
  const [orderDate, setOrderDate] = React.useState(
    new Date().toISOString().slice(0, 10)
  );
  const [deliveryDate, setDeliveryDate] = React.useState("");
  const [paymentTerms, setPaymentTerms] = React.useState("");

  // Section 2 - Color x Size matrix
  const [selectedColorIds, setSelectedColorIds] = React.useState<string[]>([]);
  const [selectedSizeIds, setSelectedSizeIds] = React.useState<string[]>([]);
  const [matrixValue, setMatrixValue] = React.useState<Record<string, Record<string, number>>>({});

  const selectedColors = availableColors.filter((c) => selectedColorIds.includes(c.id));
  const selectedSizes = availableSizes.filter((s) => selectedSizeIds.includes(s.id));

  // Section 3 - Pricing
  const [fobPrice, setFobPrice] = React.useState("");
  const [currency, setCurrency] = React.useState("USD");

  // Section 4 - Notes
  const [notes, setNotes] = React.useState("");

  // Matrix helpers
  function toggleColor(colorId: string) {
    setSelectedColorIds((prev) =>
      prev.includes(colorId) ? prev.filter((c) => c !== colorId) : [...prev, colorId]
    );
  }

  function toggleSize(sizeId: string) {
    setSelectedSizeIds((prev) =>
      prev.includes(sizeId) ? prev.filter((s) => s !== sizeId) : [...prev, sizeId]
    );
  }

  const grandTotal = React.useMemo(() => {
    return Object.values(matrixValue).reduce((total, sizeMap) => {
      return total + Object.values(sizeMap).reduce((sum, qty) => sum + qty, 0);
    }, 0);
  }, [matrixValue]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();

      // Generate order number via DB RPC
      const { data: orderNumber, error: rpcError } = await supabase.rpc("get_next_number", {
        p_company_id: companyId,
        p_document_type: "sales_order",
      });

      if (rpcError || !orderNumber) {
        setError(rpcError?.message ?? "Failed to generate order number");
        setSubmitting(false);
        return;
      }

      const productObj = products.find((p) => p.id === product);

      const { data, error: insertError } = await supabase
        .from("sales_orders")
        .insert({
          company_id: companyId,
          order_number: orderNumber,
          buyer_id: buyer,
          product_id: product || null,
          product_name: productObj?.name ?? "Custom",
          order_date: orderDate,
          delivery_date: deliveryDate,
          payment_terms: paymentTerms || null,
          fob_price: parseFloat(fobPrice) || 0,
          currency,
          total_quantity: grandTotal,
          total_value: grandTotal * (parseFloat(fobPrice) || 0),
          color_size_matrix: matrixValue,
          special_instructions: notes || null,
          status: "confirmed",
          created_by: userId,
        })
        .select("id")
        .single();

      if (insertError) {
        setError(insertError.message);
        setSubmitting(false);
        return;
      }

      router.push(`/orders/${data.id}`);
    } catch (err) {
      // Fallback: navigate to orders list even if Supabase call fails
      console.warn("Submit error:", err);
      router.push("/orders");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="gap-1.5">
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4" />
            Orders
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <h1 className="text-xl font-bold text-gray-900">New Order</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1 - Basic Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white mr-2">
                1
              </span>
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="buyer">Buyer *</Label>
              <Select value={buyer} onValueChange={setBuyer} required>
                <SelectTrigger id="buyer">
                  <SelectValue placeholder="Select buyer..." />
                </SelectTrigger>
                <SelectContent>
                  {buyers.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product">Product / Style *</Label>
              <Select value={product} onValueChange={setProduct} required>
                <SelectTrigger id="product">
                  <SelectValue placeholder="Select product..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="orderDate">Order Date *</Label>
              <Input
                id="orderDate"
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="deliveryDate">Delivery Date *</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                required
                min={orderDate}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                <SelectTrigger id="paymentTerms">
                  <SelectValue placeholder="Select payment terms..." />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TERMS.map((pt) => (
                    <SelectItem key={pt} value={pt}>
                      {pt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Section 2 - Color x Size Matrix */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-base">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white mr-2">
                  2
                </span>
                Color x Size Matrix
              </CardTitle>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Total:</span>
                <span className="font-bold tabular-nums text-gray-900">
                  {grandTotal.toLocaleString()} pcs
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Color selector */}
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 uppercase tracking-wide">
                Select Colors
              </Label>
              <div className="flex flex-wrap gap-3">
                {availableColors.map((color) => (
                  <label
                    key={color.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedColorIds.includes(color.id)}
                      onCheckedChange={() => toggleColor(color.id)}
                    />
                    <span
                      className="h-3.5 w-3.5 rounded-sm border border-gray-200"
                      style={{ backgroundColor: color.hex_code }}
                    />
                    <span className="text-sm text-gray-700">{color.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 uppercase tracking-wide">
                Select Sizes
              </Label>
              <div className="flex flex-wrap gap-3">
                {availableSizes.map((size) => (
                  <label
                    key={size.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedSizeIds.includes(size.id)}
                      onCheckedChange={() => toggleSize(size.id)}
                    />
                    <span className="text-sm text-gray-700">{size.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Matrix grid */}
            <ColorSizeMatrix
              colors={selectedColors}
              sizes={selectedSizes}
              value={matrixValue}
              onChange={setMatrixValue}
            />
          </CardContent>
        </Card>

        {/* Section 3 - Pricing */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white mr-2">
                3
              </span>
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fobPrice">FOB Price (per piece) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  {currency}
                </span>
                <Input
                  id="fobPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={fobPrice}
                  onChange={(e) => setFobPrice(e.target.value)}
                  className="pl-14"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Total Order Value</Label>
              <div className="flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 px-3">
                <span className="text-sm font-bold tabular-nums text-gray-900">
                  {currency}{" "}
                  {(
                    grandTotal * (parseFloat(fobPrice) || 0)
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4 - Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white mr-2">
                4
              </span>
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Special Instructions</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Enter any special instructions, packing requirements, or other notes..."
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Button type="button" variant="outline" asChild>
            <Link href="/orders">Cancel</Link>
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitting ? "Creating..." : "Create Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
