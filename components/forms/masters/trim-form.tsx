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
import type { Database } from "@/types/database"

type Trim = Database["public"]["Tables"]["trims"]["Row"]

const TRIM_TYPES = ["button", "zipper", "label", "thread", "interlining", "tape", "elastic", "hanger", "poly_bag", "carton", "tag"]
const UOM_OPTIONS = ["pcs", "meter", "roll", "kg", "dozen", "gross"]

const TRIM_TYPE_LABELS: Record<string, string> = {
  button: "Button",
  zipper: "Zipper",
  label: "Label",
  thread: "Thread",
  interlining: "Interlining",
  tape: "Tape",
  elastic: "Elastic",
  hanger: "Hanger",
  poly_bag: "Poly Bag",
  carton: "Carton",
  tag: "Tag",
}

const trimSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required").max(20),
  trim_type: z.string().min(1, "Trim type is required"),
  description: z.string().optional(),
  uom: z.string().min(1, "UOM is required"),
  rate: z.coerce.number().min(0, "Rate must be 0 or more"),
  supplier_id: z.string().optional().nullable(),
  is_active: z.boolean(),
})

type TrimFormValues = z.infer<typeof trimSchema>

interface TrimFormProps {
  trim?: Trim | null
  onSuccess: (trim: Trim) => void
  onCancel?: () => void
}

export function TrimForm({ trim, onSuccess, onCancel }: TrimFormProps) {
  const isEdit = !!trim

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TrimFormValues>({
    resolver: zodResolver(trimSchema),
    defaultValues: {
      name: "",
      code: "",
      trim_type: "",
      description: "",
      uom: "pcs",
      rate: 0,
      supplier_id: null,
      is_active: true,
    },
  })

  useEffect(() => {
    if (trim) {
      reset({
        name: trim.name,
        code: trim.code,
        trim_type: trim.trim_type,
        description: trim.description ?? "",
        uom: trim.uom,
        rate: trim.rate,
        supplier_id: trim.supplier_id ?? null,
        is_active: trim.is_active,
      })
    }
  }, [trim, reset])

  const trimType = watch("trim_type")
  const uom = watch("uom")
  const isActive = watch("is_active")

  async function onSubmit(values: TrimFormValues) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const result: Trim = {
        id: trim?.id ?? crypto.randomUUID(),
        company_id: trim?.company_id ?? "",
        created_at: trim?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
        supplier_id: values.supplier_id || null,
        name: values.name,
        code: values.code,
        trim_type: values.trim_type,
        description: values.description || null,
        uom: values.uom,
        rate: values.rate,
        is_active: values.is_active,
      }

      toast.success(isEdit ? "Trim updated" : "Trim created")
      onSuccess(result)
    } catch {
      toast.error("Failed to save trim.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="t-name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="t-name"
            placeholder="e.g. Metal Button 15mm"
            {...register("name")}
            className={errors.name ? "border-red-400" : ""}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="t-code">
            Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="t-code"
            placeholder="e.g. BTN15M"
            {...register("code")}
            className={errors.code ? "border-red-400" : ""}
          />
          {errors.code && <p className="text-xs text-red-500">{errors.code.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>
          Trim Type <span className="text-red-500">*</span>
        </Label>
        <Select value={trimType} onValueChange={(v) => setValue("trim_type", v)}>
          <SelectTrigger className={errors.trim_type ? "border-red-400" : ""}>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {TRIM_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {TRIM_TYPE_LABELS[t] ?? t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.trim_type && <p className="text-xs text-red-500">{errors.trim_type.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="t-desc">Description</Label>
        <Textarea
          id="t-desc"
          placeholder="Optional description or specifications"
          rows={2}
          {...register("description")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>
            UOM <span className="text-red-500">*</span>
          </Label>
          <Select value={uom} onValueChange={(v) => setValue("uom", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UOM_OPTIONS.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="t-rate">Rate / {uom}</Label>
          <Input
            id="t-rate"
            type="number"
            min={0}
            step={0.01}
            placeholder="0.00"
            {...register("rate")}
            className={errors.rate ? "border-red-400" : ""}
          />
          {errors.rate && <p className="text-xs text-red-500">{errors.rate.message}</p>}
        </div>
      </div>

      {/* Supplier */}
      <div className="space-y-1.5">
        <Label htmlFor="t-supplier">Supplier ID</Label>
        <Input
          id="t-supplier"
          placeholder="Supplier reference (optional)"
          {...register("supplier_id")}
        />
      </div>

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

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Update Trim" : "Create Trim"}
        </Button>
      </div>
    </form>
  )
}
