"use client";

import * as React from "react";
import { Building2, Upload, Save } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED"];

export default function GeneralSettingsPage() {
  const [saving, setSaving] = React.useState(false);
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    companyName: "TextileOS Demo Factory",
    legalName: "TextileOS Demo Factory Pvt. Ltd.",
    email: "admin@demo.textile-os.com",
    phone: "+91 98765 43210",
    website: "https://demo.textile-os.com",
    gstNumber: "33AABCT1234A1Z5",
    panNumber: "AABCT1234A",
    address: "123, Industrial Area, SIDCO",
    city: "Tirupur",
    state: "Tamil Nadu",
    country: "India",
    pincode: "641604",
    financialYearStart: "4",
    defaultCurrency: "INR",
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success("Company settings saved successfully.");
  };

  return (
    <div>
      <PageHeader
        title="General Settings"
        description="Manage your company profile, contact information, and financial year."
        breadcrumb={[
          { label: "Settings", href: "/settings" },
          { label: "General" },
        ]}
        actions={
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Logo upload */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Building2 className="h-4 w-4 text-gray-500" />
            Company Logo
          </h2>
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Company logo"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-blue-600 text-2xl font-bold text-white rounded-xl">
                  T
                </div>
              )}
            </div>
            <label
              htmlFor="logo-upload"
              className="flex cursor-pointer items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload Logo
            </label>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
            <p className="text-center text-[11px] text-gray-400">
              PNG, JPG up to 2MB.
              <br />
              Recommended: 200x200px
            </p>
          </div>
        </div>

        {/* Company info */}
        <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900">
            Company Information
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={form.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="legalName">Legal / Registered Name</Label>
              <Input
                id="legalName"
                value={form.legalName}
                onChange={(e) => handleChange("legalName", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={form.website}
                onChange={(e) => handleChange("website", e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <h2 className="text-sm font-semibold text-gray-900">Tax & Compliance</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="gstNumber">GST Number</Label>
              <Input
                id="gstNumber"
                value={form.gstNumber}
                onChange={(e) =>
                  handleChange("gstNumber", e.target.value.toUpperCase())
                }
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="panNumber">PAN Number</Label>
              <Input
                id="panNumber"
                value={form.panNumber}
                onChange={(e) =>
                  handleChange("panNumber", e.target.value.toUpperCase())
                }
                className="font-mono"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Registered Address
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="address">Street Address</Label>
              <Textarea
                id="address"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                value={form.pincode}
                onChange={(e) => handleChange("pincode", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={form.state}
                onChange={(e) => handleChange("state", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={form.country}
                onChange={(e) => handleChange("country", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Financial settings */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Financial Settings
          </h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Financial Year Start</Label>
              <Select
                value={form.financialYearStart}
                onValueChange={(v) => handleChange("financialYearStart", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, idx) => (
                    <SelectItem key={idx} value={String(idx + 1)}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">
                Financial year will start from {MONTHS[parseInt(form.financialYearStart) - 1]}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Default Currency</Label>
              <Select
                value={form.defaultCurrency}
                onValueChange={(v) => handleChange("defaultCurrency", v)}
              >
                <SelectTrigger>
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
          </div>
        </div>
      </div>
    </div>
  );
}
