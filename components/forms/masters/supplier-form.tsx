"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { Database } from "@/types/database"

type Supplier = Database["public"]["Tables"]["suppliers"]["Row"]

const MATERIAL_TYPE_OPTIONS = [
  { value: "fabric", label: "Fabric" },
  { value: "yarn", label: "Yarn" },
  { value: "trim", label: "Trim" },
  { value: "chemical", label: "Chemical" },
  { value: "accessory", label: "Accessory" },
  { value: "packing", label: "Packing" },
]

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required").max(20, "Code must be 20 chars or less"),
  contact_person: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  material_types: z.array(z.string()),
  payment_terms: z.string().optional(),
  avg_lead_time_days: z.number().min(0, "Must be 0 or more"),
  gst_number: z.string().optional(),
  rating: z.number().min(1).max(5).optional().nullable(),
  is_active: z.boolean(),
})

type SupplierFormValues = z.infer<typeof supplierSchema>

interface SupplierFormProps {
  supplier?: Supplier | null
  onSuccess: (supplier: Supplier) => void
  onCancel?: () => void
}

export function SupplierForm({ supplier, onSuccess, onCancel }: SupplierFormProps) {
  const isEdit = !!supplier

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      code: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      material_types: [],
      payment_terms: "",
      avg_lead_time_days: 14,
      gst_number: "",
      rating: null,
      is_active: true,
    },
  })

  useEffect(() => {
    if (supplier) {
      reset({
        name: supplier.name,
        code: supplier.code,
        contact_person: supplier.contact_person ?? "",
        email: supplier.email ?? "",
        phone: supplier.phone ?? "",
        address: supplier.address ?? "",
        city: supplier.city ?? "",
        country: supplier.country ?? "",
        material_types: supplier.material_types ?? [],
        payment_terms: supplier.payment_terms ?? "",
        avg_lead_time_days: supplier.avg_lead_time_days,
        gst_number: supplier.gst_number ?? "",
        rating: supplier.rating ?? null,
        is_active: supplier.is_active,
      })
    }
  }, [supplier, reset])

  const materialTypes = watch("material_types")
  const isActive = watch("is_active")

  function toggleMaterialType(value: string) {
    const current = materialTypes ?? []
    if (current.includes(value)) {
      setValue("material_types", current.filter((v) => v !== value))
    } else {
      setValue("material_types", [...current, value])
    }
  }

  async function onSubmit(values: SupplierFormValues) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 600))

      const result: Supplier = {
        id: supplier?.id ?? crypto.randomUUID(),
        company_id: supplier?.company_id ?? "",
        created_at: supplier?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
        name: values.name,
        code: values.code,
        contact_person: values.contact_person || null,
        email: values.email || null,
        phone: values.phone || null,
        address: values.address || null,
        city: values.city || null,
        country: values.country || null,
        material_types: values.material_types,
        payment_terms: values.payment_terms || null,
        avg_lead_time_days: values.avg_lead_time_days,
        gst_number: values.gst_number || null,
        bank_details: null,
        rating: values.rating ?? null,
        is_active: values.is_active,
      }

      toast.success(isEdit ? "Supplier updated successfully" : "Supplier created successfully")
      onSuccess(result)
    } catch {
      toast.error("Failed to save supplier. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name & Code */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="s-name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="s-name"
            placeholder="e.g. Arvind Limited"
            {...register("name")}
            className={errors.name ? "border-red-400" : ""}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="s-code">
            Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="s-code"
            placeholder="e.g. ARV"
            {...register("code")}
            className={errors.code ? "border-red-400" : ""}
          />
          {errors.code && <p className="text-xs text-red-500">{errors.code.message}</p>}
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-1.5">
        <Label htmlFor="s-contact">Contact Person</Label>
        <Input id="s-contact" placeholder="e.g. Raj Patel" {...register("contact_person")} />
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="s-email">Email</Label>
          <Input
            id="s-email"
            type="email"
            placeholder="supplier@example.com"
            {...register("email")}
            className={errors.email ? "border-red-400" : ""}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="s-phone">Phone</Label>
          <Input id="s-phone" placeholder="+91 99999 00000" {...register("phone")} />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <Label htmlFor="s-address">Address</Label>
        <Textarea id="s-address" placeholder="Street address" rows={2} {...register("address")} />
      </div>

      {/* City & Country */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="s-city">City</Label>
          <Input id="s-city" placeholder="e.g. Surat" {...register("city")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="s-country">Country</Label>
          <Input id="s-country" placeholder="e.g. India" {...register("country")} />
        </div>
      </div>

      {/* Material Types */}
      <div className="space-y-2">
        <Label>Material Types</Label>
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-gray-200 p-3">
          {MATERIAL_TYPE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-gray-900"
            >
              <Checkbox
                checked={materialTypes?.includes(opt.value) ?? false}
                onCheckedChange={() => toggleMaterialType(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Lead Time & Rating */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="s-lead">Avg Lead Time (days)</Label>
          <Input
            id="s-lead"
            type="number"
            min={0}
            {...register("avg_lead_time_days", { valueAsNumber: true })}
            className={errors.avg_lead_time_days ? "border-red-400" : ""}
          />
          {errors.avg_lead_time_days && (
            <p className="text-xs text-red-500">{errors.avg_lead_time_days.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Rating (1-5)</Label>
          <Select
            value={watch("rating") ? String(watch("rating")) : "none"}
            onValueChange={(v) => setValue("rating", v === "none" ? null : Number(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not rated</SelectItem>
              {[1, 2, 3, 4, 5].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {"★".repeat(n)}{"☆".repeat(5 - n)} ({n})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Payment Terms */}
      <div className="space-y-1.5">
        <Label htmlFor="s-payment">Payment Terms</Label>
        <Input id="s-payment" placeholder="e.g. 30 days credit" {...register("payment_terms")} />
      </div>

      {/* GST */}
      <div className="space-y-1.5">
        <Label htmlFor="s-gst">GST Number</Label>
        <Input id="s-gst" placeholder="e.g. 27AABCS1429B1ZB" {...register("gst_number")} />
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select
          value={isActive ? "active" : "inactive"}
          onValueChange={(v) => setValue("is_active", v === "active")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Update Supplier" : "Create Supplier"}
        </Button>
      </div>
    </form>
  )
}
