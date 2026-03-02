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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createChemical, updateChemical } from "@/lib/actions/masters"
import type { Database } from "@/types/database"

type Chemical = Database["public"]["Tables"]["chemicals"]["Row"]

const CHEMICAL_TYPES = [
  "reactive_dye", "disperse_dye", "vat_dye", "pigment", "softener",
  "caustic", "sodium_carbonate", "peroxide", "fixing_agent", "anti_crease",
]
const UOM_OPTIONS = ["kg", "liter", "gram", "ml"]

const CHEMICAL_TYPE_LABELS: Record<string, string> = {
  reactive_dye: "Reactive Dye",
  disperse_dye: "Disperse Dye",
  vat_dye: "Vat Dye",
  pigment: "Pigment",
  softener: "Softener",
  caustic: "Caustic",
  sodium_carbonate: "Sodium Carbonate",
  peroxide: "Peroxide",
  fixing_agent: "Fixing Agent",
  anti_crease: "Anti-Crease",
}

const chemicalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required").max(20),
  chemical_type: z.string().min(1, "Chemical type is required"),
  uom: z.string().min(1, "UOM is required"),
  rate: z.coerce.number().min(0, "Rate must be 0 or more"),
  supplier_id: z.string().optional().nullable(),
  is_active: z.boolean(),
})

type ChemicalFormValues = z.infer<typeof chemicalSchema>

interface ChemicalFormProps {
  chemical?: Chemical | null
  companyId: string
  onSuccess: (chemical: Chemical) => void
  onCancel?: () => void
}

export function ChemicalForm({ chemical, companyId, onSuccess, onCancel }: ChemicalFormProps) {
  const isEdit = !!chemical

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChemicalFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(chemicalSchema) as any,
    defaultValues: {
      name: "",
      code: "",
      chemical_type: "",
      uom: "kg",
      rate: 0,
      supplier_id: null,
      is_active: true,
    },
  })

  useEffect(() => {
    if (chemical) {
      reset({
        name: chemical.name,
        code: chemical.code,
        chemical_type: chemical.chemical_type,
        uom: chemical.uom,
        rate: chemical.rate,
        supplier_id: chemical.supplier_id ?? null,
        is_active: chemical.is_active,
      })
    }
  }, [chemical, reset])

  const chemicalType = watch("chemical_type")
  const uom = watch("uom")
  const isActive = watch("is_active")

  async function onSubmit(values: ChemicalFormValues) {
    try {
      const payload = {
        name: values.name,
        code: values.code,
        chemical_type: values.chemical_type,
        uom: values.uom,
        rate: values.rate,
        supplier_id: values.supplier_id || null,
        is_active: values.is_active,
      }

      if (isEdit && chemical) {
        const { data: result, error } = await updateChemical(chemical.id, payload)
        if (error) throw new Error(error)
        toast.success("Chemical updated")
        onSuccess(result!)
      } else {
        const { data: result, error } = await createChemical({ ...payload, company_id: companyId })
        if (error) throw new Error(error)
        toast.success("Chemical created")
        onSuccess(result!)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save chemical.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="ch-name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="ch-name"
            placeholder="e.g. Reactive Red M5B"
            {...register("name")}
            className={errors.name ? "border-red-400" : ""}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ch-code">
            Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="ch-code"
            placeholder="e.g. RRM5B"
            {...register("code")}
            className={errors.code ? "border-red-400" : ""}
          />
          {errors.code && <p className="text-xs text-red-500">{errors.code.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>
          Chemical Type <span className="text-red-500">*</span>
        </Label>
        <Select value={chemicalType} onValueChange={(v) => setValue("chemical_type", v)}>
          <SelectTrigger className={errors.chemical_type ? "border-red-400" : ""}>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {CHEMICAL_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {CHEMICAL_TYPE_LABELS[t] ?? t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.chemical_type && <p className="text-xs text-red-500">{errors.chemical_type.message}</p>}
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
          <Label htmlFor="ch-rate">Rate / {uom}</Label>
          <Input
            id="ch-rate"
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
        <Label htmlFor="ch-supplier">Supplier ID</Label>
        <Input
          id="ch-supplier"
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
          {isEdit ? "Update Chemical" : "Create Chemical"}
        </Button>
      </div>
    </form>
  )
}
