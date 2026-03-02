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
import { createOperation, updateOperation } from "@/lib/actions/masters"
import type { Database } from "@/types/database"

type Operation = Database["public"]["Tables"]["operations"]["Row"]

const DEPARTMENTS = [
  "Cutting", "Sewing", "Finishing", "Quality", "Dyeing",
  "Knitting", "Weaving", "Printing", "Embroidery",
]

const MACHINE_TYPES = [
  "sewing", "overlock", "flatlock", "cutting", "spreading",
  "loom", "knitting", "dyeing", "stenter", "compactor",
]

const MACHINE_TYPE_LABELS: Record<string, string> = {
  sewing: "Sewing",
  overlock: "Overlock",
  flatlock: "Flatlock",
  cutting: "Cutting",
  spreading: "Spreading",
  loom: "Loom",
  knitting: "Knitting",
  dyeing: "Dyeing",
  stenter: "Stenter",
  compactor: "Compactor",
}

const operationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required").max(20),
  department: z.string().min(1, "Department is required"),
  smv: z.coerce.number().min(0, "SMV must be 0 or more"),
  machine_type: z.string().optional().nullable(),
  description: z.string().optional(),
})

type OperationFormValues = z.infer<typeof operationSchema>

interface OperationFormProps {
  operation?: Operation | null
  companyId: string
  onSuccess: (operation: Operation) => void
  onCancel?: () => void
}

export function OperationForm({ operation, companyId, onSuccess, onCancel }: OperationFormProps) {
  const isEdit = !!operation

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OperationFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(operationSchema) as any,
    defaultValues: {
      name: "",
      code: "",
      department: "",
      smv: 0,
      machine_type: null,
      description: "",
    },
  })

  useEffect(() => {
    if (operation) {
      reset({
        name: operation.name,
        code: operation.code,
        department: operation.department,
        smv: operation.smv,
        machine_type: operation.machine_type ?? null,
        description: operation.description ?? "",
      })
    }
  }, [operation, reset])

  const department = watch("department")
  const machineType = watch("machine_type")

  async function onSubmit(values: OperationFormValues) {
    try {
      const payload = {
        name: values.name,
        code: values.code,
        department: values.department,
        smv: values.smv,
        machine_type: values.machine_type || null,
        description: values.description || null,
      }

      if (isEdit && operation) {
        const { data: result, error } = await updateOperation(operation.id, payload)
        if (error) throw new Error(error)
        toast.success("Operation updated")
        onSuccess(result!)
      } else {
        const { data: result, error } = await createOperation({ ...payload, company_id: companyId })
        if (error) throw new Error(error)
        toast.success("Operation created")
        onSuccess(result!)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save operation.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name & Code */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="op-name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="op-name"
            placeholder="e.g. Collar Attach"
            {...register("name")}
            className={errors.name ? "border-red-400" : ""}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="op-code">
            Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="op-code"
            placeholder="e.g. SEW-CA"
            {...register("code")}
            className={errors.code ? "border-red-400" : ""}
          />
          {errors.code && <p className="text-xs text-red-500">{errors.code.message}</p>}
        </div>
      </div>

      {/* Department */}
      <div className="space-y-1.5">
        <Label>
          Department <span className="text-red-500">*</span>
        </Label>
        <Select value={department} onValueChange={(v) => setValue("department", v)}>
          <SelectTrigger className={errors.department ? "border-red-400" : ""}>
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.department && <p className="text-xs text-red-500">{errors.department.message}</p>}
      </div>

      {/* SMV & Machine Type */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="op-smv">
            SMV <span className="text-red-500">*</span>
          </Label>
          <Input
            id="op-smv"
            type="number"
            min={0}
            step={0.01}
            placeholder="e.g. 0.85"
            {...register("smv")}
            className={errors.smv ? "border-red-400" : ""}
          />
          {errors.smv && <p className="text-xs text-red-500">{errors.smv.message}</p>}
          <p className="text-xs text-gray-500">Standard Minute Value</p>
        </div>
        <div className="space-y-1.5">
          <Label>Machine Type</Label>
          <Select
            value={machineType || "none"}
            onValueChange={(v) => setValue("machine_type", v === "none" ? null : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select machine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not specified</SelectItem>
              {MACHINE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {MACHINE_TYPE_LABELS[t] ?? t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="op-desc">Description</Label>
        <Textarea
          id="op-desc"
          placeholder="Optional description of this operation"
          rows={2}
          {...register("description")}
        />
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
          {isEdit ? "Update Operation" : "Create Operation"}
        </Button>
      </div>
    </form>
  )
}
