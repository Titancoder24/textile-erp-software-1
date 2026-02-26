"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { generateDocumentNumber } from "@/lib/utils";
import { CURRENCIES } from "@/lib/constants";
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

// ---------------------------------------------------------------------------
// Static options (replace with API-fetched data)
// ---------------------------------------------------------------------------

const BUYERS = [
  { id: "b1", name: "H&M" },
  { id: "b2", name: "Zara" },
  { id: "b3", name: "Marks & Spencer" },
  { id: "b4", name: "Primark" },
  { id: "b5", name: "Next" },
  { id: "b6", name: "Lidl" },
  { id: "b7", name: "ASOS" },
  { id: "b8", name: "Tesco" },
];

const PRODUCTS = [
  { id: "p1", name: "Men's Woven Shirt" },
  { id: "p2", name: "Women's Knitwear" },
  { id: "p3", name: "Kids T-Shirt" },
  { id: "p4", name: "Denim Jeans" },
  { id: "p5", name: "Ladies Blouse" },
  { id: "p6", name: "Sports Polo" },
  { id: "p7", name: "Casual Hoodie" },
];

const AVAILABLE_COLORS = [
  { id: "c1", name: "Navy", hex_code: "#001f3f" },
  { id: "c2", name: "White", hex_code: "#ffffff" },
  { id: "c3", name: "Grey", hex_code: "#aaaaaa" },
  { id: "c4", name: "Black", hex_code: "#111111" },
  { id: "c5", name: "Red", hex_code: "#e74c3c" },
  { id: "c6", name: "Blue", hex_code: "#3498db" },
  { id: "c7", name: "Green", hex_code: "#27ae60" },
  { id: "c8", name: "Yellow", hex_code: "#f1c40f" },
  { id: "c9", name: "Pink", hex_code: "#e91e8b" },
];

const AVAILABLE_SIZES = [
  { id: "s1", name: "XS", sort_order: 1 },
  { id: "s2", name: "S", sort_order: 2 },
  { id: "s3", name: "M", sort_order: 3 },
  { id: "s4", name: "L", sort_order: 4 },
  { id: "s5", name: "XL", sort_order: 5 },
  { id: "s6", name: "XXL", sort_order: 6 },
  { id: "s7", name: "3XL", sort_order: 7 },
];

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
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Section 1 - Basic Info
  const [buyer, setBuyer] = React.useState("");
  const [product, setProduct] = React.useState("");
  const [orderDate, setOrderDate] = React.useState(
    new Date().toISOString().slice(0, 10)
  );
  const [deliveryDate, setDeliveryDate] = React.useState("");
  const [paymentTerms, setPaymentTerms] = React.useState("");

  // Section 2 - Color x Size matrix
  const [selectedColorIds, setSelectedColorIds] = React.useState<string[]>(["c1"]);
  const [selectedSizeIds, setSelectedSizeIds] = React.useState<string[]>(["s2", "s3", "s4", "s5"]);
  const [matrixValue, setMatrixValue] = React.useState<Record<string, Record<string, number>>>({});

  const selectedColors = AVAILABLE_COLORS.filter((c) => selectedColorIds.includes(c.id));
  const selectedSizes = AVAILABLE_SIZES.filter((s) => selectedSizeIds.includes(s.id));

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
      const orderNumber = generateDocumentNumber("ORD", Math.floor(Math.random() * 9000) + 1000);

      const buyerObj = BUYERS.find((b) => b.id === buyer);
      const productObj = PRODUCTS.find((p) => p.id === product);

      const { data, error: insertError } = await supabase
        .from("sales_orders")
        .insert({
          order_number: orderNumber,
          buyer_name: buyerObj?.name ?? buyer,
          product_name: productObj?.name ?? product,
          order_date: orderDate,
          delivery_date: deliveryDate,
          payment_terms: paymentTerms,
          fob_price: parseFloat(fobPrice) || 0,
          currency,
          total_qty: grandTotal,
          color_size_matrix: matrixValue,
          special_instructions: notes,
          status: "confirmed",
        })
        .select("id")
        .single();

      if (insertError) {
        // If Supabase table does not exist or other DB error, navigate to orders list
        console.warn("Supabase insert error (table may not exist):", insertError.message);
        router.push("/orders");
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
                  {BUYERS.map((b) => (
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
                  {PRODUCTS.map((p) => (
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
                {AVAILABLE_COLORS.map((color) => (
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
                {AVAILABLE_SIZES.map((size) => (
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
