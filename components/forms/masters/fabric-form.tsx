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
import { FABRIC_TYPES } from "@/lib/constants"
import { createFabric, updateFabric } from "@/lib/actions/masters"
import type { Database } from "@/types/database"

type Fabric = Database["public"]["Tables"]["fabrics"]["Row"]

const FABRIC_TYPE_LABELS: Record<string, string> = {
  woven: "Woven",
  knitted: "Knitted",
  non_woven: "Non-Woven",
}

const UOM_OPTIONS = ["meter", "kg", "yard", "roll"]
const WEAVE_TYPES = ["Plain", "Twill", "Satin", "Rib", "Jersey", "Fleece", "Interlock", "Other"]

const fabricSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required").max(20),
  fabric_type: z.string().min(1, "Fabric type is required"),
  construction: z.string().optional(),
  gsm: z.number().min(0).optional().nullable(),
  width_cm: z.number().min(0).optional().nullable(),
  weave_type: z.string().optional(),
  composition: z.string().optional(),
  uom: z.string().min(1, "UOM is required"),
  rate: z.number().min(0, "Rate must be 0 or more"),
  supplier_id: z.string().optional().nullable(),
  is_active: z.boolean(),
})

type FabricFormValues = z.infer<typeof fabricSchema>

interface FabricFormProps {
  fabric?: Fabric | null
  companyId: string
  onSuccess: (fabric: Fabric) => void
  onCancel?: () => void
}

export function FabricForm({ fabric, companyId, onSuccess, onCancel }: FabricFormProps) {
  const isEdit = !!fabric

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FabricFormValues>({
    resolver: zodResolver(fabricSchema),
    defaultValues: {
      name: "",
      code: "",
      fabric_type: "",
      construction: "",
      gsm: null,
      width_cm: null,
      weave_type: "",
      composition: "",
      uom: "meter",
      rate: 0,
      supplier_id: null,
      is_active: true,
    },
  })

  useEffect(() => {
    if (fabric) {
      reset({
        name: fabric.name,
        code: fabric.code,
        fabric_type: fabric.fabric_type,
        construction: fabric.construction ?? "",
        gsm: fabric.gsm ?? null,
        width_cm: fabric.width_cm ?? null,
        weave_type: fabric.weave_type ?? "",
        composition: fabric.composition ?? "",
        uom: fabric.uom,
        rate: fabric.rate,
        supplier_id: fabric.supplier_id ?? null,
        is_active: fabric.is_active,
      })
    }
  }, [fabric, reset])

  const fabricType = watch("fabric_type")
  const uom = watch("uom")
  const isActive = watch("is_active")

  async function onSubmit(values: FabricFormValues) {
    try {
      const payload = {
        name: values.name,
        code: values.code,
        fabric_type: values.fabric_type,
        construction: values.construction || null,
        gsm: values.gsm ?? null,
        width_cm: values.width_cm ?? null,
        weave_type: values.weave_type || null,
        composition: values.composition || null,
        uom: values.uom,
        rate: values.rate,
        supplier_id: values.supplier_id || null,
        is_active: values.is_active,
      }

      if (isEdit && fabric) {
        const { data: result, error } = await updateFabric(fabric.id, payload)
        if (error) throw new Error(error)
        toast.success("Fabric updated")
        onSuccess(result!)
      } else {
        const { data: result, error } = await createFabric({ ...payload, company_id: companyId })
        if (error) throw new Error(error)
        toast.success("Fabric created")
        onSuccess(result!)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save fabric.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name & Code */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="f-name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="f-name"
            placeholder="e.g. Cotton Poplin"
            {...register("name")}
            className={errors.name ? "border-red-400" : ""}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-code">
            Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="f-code"
            placeholder="e.g. CPO45"
            {...register("code")}
            className={errors.code ? "border-red-400" : ""}
          />
          {errors.code && <p className="text-xs text-red-500">{errors.code.message}</p>}
        </div>
      </div>

      {/* Fabric Type */}
      <div className="space-y-1.5">
        <Label>
          Fabric Type <span className="text-red-500">*</span>
        </Label>
        <Select value={fabricType} onValueChange={(v) => setValue("fabric_type", v)}>
          <SelectTrigger className={errors.fabric_type ? "border-red-400" : ""}>
            <SelectValue placeholder="Select fabric type" />
          </SelectTrigger>
          <SelectContent>
            {FABRIC_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {FABRIC_TYPE_LABELS[t] ?? t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.fabric_type && (
          <p className="text-xs text-red-500">{errors.fabric_type.message}</p>
        )}
      </div>

      {/* Composition */}
      <div className="space-y-1.5">
        <Label htmlFor="f-composition">Composition</Label>
        <Input
          id="f-composition"
          placeholder="e.g. 100% Cotton, 65/35 Polyester/Cotton"
          {...register("composition")}
        />
      </div>

      {/* GSM & Width */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="f-gsm">GSM</Label>
          <Input
            id="f-gsm"
            type="number"
            min={0}
            step={0.1}
            placeholder="e.g. 140"
            {...register("gsm")}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-width">Width (cm)</Label>
          <Input
            id="f-width"
            type="number"
            min={0}
            step={0.1}
            placeholder="e.g. 145"
            {...register("width_cm")}
          />
        </div>
      </div>

      {/* Construction & Weave */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="f-construction">Construction</Label>
          <Input
            id="f-construction"
            placeholder="e.g. 40x40 / 100x60"
            {...register("construction")}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Weave Type</Label>
          <Select
            value={watch("weave_type") || "none"}
            onValueChange={(v) => setValue("weave_type", v === "none" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select weave" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not specified</SelectItem>
              {WEAVE_TYPES.map((w) => (
                <SelectItem key={w} value={w}>
                  {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* UOM & Rate */}
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
          <Label htmlFor="f-rate">Rate / {uom}</Label>
          <Input
            id="f-rate"
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
        <Label htmlFor="f-supplier">Supplier ID</Label>
        <Input
          id="f-supplier"
          placeholder="Supplier reference (optional)"
          {...register("supplier_id")}
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

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Update Fabric" : "Create Fabric"}
        </Button>
      </div>
    </form>
  )
}
