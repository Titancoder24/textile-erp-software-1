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
import { CURRENCIES } from "@/lib/constants"
import type { Database } from "@/types/database"

type Buyer = Database["public"]["Tables"]["buyers"]["Row"]

const buyerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required").max(20, "Code must be 20 chars or less"),
  contact_person: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  payment_terms: z.string().optional(),
  quality_standard: z.string().optional(),
  default_currency: z.string().min(1, "Currency is required"),
  is_active: z.boolean(),
})

type BuyerFormValues = z.infer<typeof buyerSchema>

interface BuyerFormProps {
  buyer?: Buyer | null
  onSuccess: (buyer: Buyer) => void
  onCancel?: () => void
}

const QUALITY_STANDARDS = ["ISO 9001", "OEKO-TEX", "GOTS", "WRAP", "BSCI", "SA8000", "SEDEX", "Other"]

export function BuyerForm({ buyer, onSuccess, onCancel }: BuyerFormProps) {
  const isEdit = !!buyer

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BuyerFormValues>({
    resolver: zodResolver(buyerSchema),
    defaultValues: {
      name: "",
      code: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      payment_terms: "",
      quality_standard: "",
      default_currency: "USD",
      is_active: true,
    },
  })

  useEffect(() => {
    if (buyer) {
      reset({
        name: buyer.name,
        code: buyer.code,
        contact_person: buyer.contact_person ?? "",
        email: buyer.email ?? "",
        phone: buyer.phone ?? "",
        address: buyer.address ?? "",
        city: buyer.city ?? "",
        country: buyer.country ?? "",
        payment_terms: buyer.payment_terms ?? "",
        quality_standard: buyer.quality_standard ?? "",
        default_currency: buyer.default_currency,
        is_active: buyer.is_active,
      })
    }
  }, [buyer, reset])

  async function onSubmit(values: BuyerFormValues) {
    try {
      // Simulate API call — replace with real Supabase action
      await new Promise((resolve) => setTimeout(resolve, 600))

      const result: Buyer = {
        id: buyer?.id ?? crypto.randomUUID(),
        company_id: buyer?.company_id ?? "",
        created_at: buyer?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
        name: values.name,
        code: values.code,
        contact_person: values.contact_person || null,
        email: values.email || null,
        phone: values.phone || null,
        address: values.address || null,
        city: values.city || null,
        country: values.country || null,
        payment_terms: values.payment_terms || null,
        quality_standard: values.quality_standard || null,
        default_currency: values.default_currency,
        is_active: values.is_active,
      }

      toast.success(isEdit ? "Buyer updated successfully" : "Buyer created successfully")
      onSuccess(result)
    } catch {
      toast.error("Failed to save buyer. Please try again.")
    }
  }

  const currency = watch("default_currency")
  const isActive = watch("is_active")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name & Code */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g. H&M Group"
            {...register("name")}
            className={errors.name ? "border-red-400 focus-visible:ring-red-400" : ""}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="code">
            Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="code"
            placeholder="e.g. HMG"
            {...register("code")}
            className={errors.code ? "border-red-400 focus-visible:ring-red-400" : ""}
          />
          {errors.code && <p className="text-xs text-red-500">{errors.code.message}</p>}
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-1.5">
        <Label htmlFor="contact_person">Contact Person</Label>
        <Input
          id="contact_person"
          placeholder="e.g. John Smith"
          {...register("contact_person")}
        />
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="buyer@example.com"
            {...register("email")}
            className={errors.email ? "border-red-400 focus-visible:ring-red-400" : ""}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" placeholder="+1 555 000 0000" {...register("phone")} />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          placeholder="Street address"
          rows={2}
          {...register("address")}
        />
      </div>

      {/* City & Country */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" placeholder="e.g. Stockholm" {...register("city")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="country">Country</Label>
          <Input id="country" placeholder="e.g. Sweden" {...register("country")} />
        </div>
      </div>

      {/* Currency & Quality Standard */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>
            Currency <span className="text-red-500">*</span>
          </Label>
          <Select value={currency} onValueChange={(v) => setValue("default_currency", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
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
          <Label>Quality Standard</Label>
          <Select
            value={watch("quality_standard") || "none"}
            onValueChange={(v) => setValue("quality_standard", v === "none" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select standard" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {QUALITY_STANDARDS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Payment Terms */}
      <div className="space-y-1.5">
        <Label htmlFor="payment_terms">Payment Terms</Label>
        <Input
          id="payment_terms"
          placeholder="e.g. Net 60, LC at sight"
          {...register("payment_terms")}
        />
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
          {isEdit ? "Update Buyer" : "Create Buyer"}
        </Button>
      </div>
    </form>
  )
}
