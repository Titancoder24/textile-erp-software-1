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
import { createMachine, updateMachine } from "@/lib/actions/masters"
import type { Database } from "@/types/database"

type Machine = Database["public"]["Tables"]["machines"]["Row"]

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

const DEPARTMENTS = [
  "Cutting", "Sewing", "Finishing", "Dyeing", "Knitting",
  "Weaving", "Quality", "Maintenance", "Store",
]

const MACHINE_STATUSES = ["running", "idle", "maintenance", "breakdown"]

const MACHINE_STATUS_LABELS: Record<string, string> = {
  running: "Running",
  idle: "Idle",
  maintenance: "Maintenance",
  breakdown: "Breakdown",
}

const machineSchema = z.object({
  name: z.string().min(1, "Name is required"),
  machine_code: z.string().min(1, "Machine code is required").max(20),
  machine_type: z.string().min(1, "Machine type is required"),
  department: z.string().min(1, "Department is required"),
  make: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  capacity_per_hour: z.coerce.number().min(0).optional().nullable(),
  status: z.string().min(1, "Status is required"),
  purchase_date: z.string().optional(),
})

type MachineFormValues = z.infer<typeof machineSchema>

interface MachineFormProps {
  machine?: Machine | null
  companyId: string
  onSuccess: (machine: Machine) => void
  onCancel?: () => void
}

export function MachineForm({ machine, companyId, onSuccess, onCancel }: MachineFormProps) {
  const isEdit = !!machine

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MachineFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(machineSchema) as any,
    defaultValues: {
      name: "",
      machine_code: "",
      machine_type: "",
      department: "",
      make: "",
      model: "",
      serial_number: "",
      capacity_per_hour: null,
      status: "idle",
      purchase_date: "",
    },
  })

  useEffect(() => {
    if (machine) {
      reset({
        name: machine.name,
        machine_code: machine.machine_code,
        machine_type: machine.machine_type,
        department: machine.department,
        make: machine.make ?? "",
        model: machine.model ?? "",
        serial_number: machine.serial_number ?? "",
        capacity_per_hour: machine.capacity_per_hour ?? null,
        status: machine.status,
        purchase_date: machine.purchase_date ?? "",
      })
    }
  }, [machine, reset])

  const machineType = watch("machine_type")
  const department = watch("department")
  const status = watch("status")

  async function onSubmit(values: MachineFormValues) {
    try {
      const payload = {
        name: values.name,
        machine_code: values.machine_code,
        machine_type: values.machine_type,
        department: values.department,
        make: values.make || null,
        model: values.model || null,
        serial_number: values.serial_number || null,
        capacity_per_hour: values.capacity_per_hour ?? null,
        status: values.status,
        purchase_date: values.purchase_date || null,
      }

      if (isEdit && machine) {
        const { data: result, error } = await updateMachine(machine.id, payload)
        if (error) throw new Error(error)
        toast.success("Machine updated successfully")
        onSuccess(result!)
      } else {
        const { data: result, error } = await createMachine({ ...payload, company_id: companyId })
        if (error) throw new Error(error)
        toast.success("Machine created successfully")
        onSuccess(result!)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save machine. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name & Code */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="mc-name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="mc-name"
            placeholder="e.g. Juki DDL-8700"
            {...register("name")}
            className={errors.name ? "border-red-400" : ""}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mc-code">
            Machine Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="mc-code"
            placeholder="e.g. SEW-001"
            {...register("machine_code")}
            className={errors.machine_code ? "border-red-400" : ""}
          />
          {errors.machine_code && <p className="text-xs text-red-500">{errors.machine_code.message}</p>}
        </div>
      </div>

      {/* Machine Type & Department */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>
            Machine Type <span className="text-red-500">*</span>
          </Label>
          <Select value={machineType} onValueChange={(v) => setValue("machine_type", v)}>
            <SelectTrigger className={errors.machine_type ? "border-red-400" : ""}>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {MACHINE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {MACHINE_TYPE_LABELS[t] ?? t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.machine_type && <p className="text-xs text-red-500">{errors.machine_type.message}</p>}
        </div>
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
      </div>

      {/* Make & Model */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="mc-make">Make</Label>
          <Input id="mc-make" placeholder="e.g. Juki" {...register("make")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mc-model">Model</Label>
          <Input id="mc-model" placeholder="e.g. DDL-8700" {...register("model")} />
        </div>
      </div>

      {/* Serial Number */}
      <div className="space-y-1.5">
        <Label htmlFor="mc-serial">Serial Number</Label>
        <Input id="mc-serial" placeholder="e.g. JK2024001234" {...register("serial_number")} />
      </div>

      {/* Capacity & Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="mc-capacity">Capacity / Hour</Label>
          <Input
            id="mc-capacity"
            type="number"
            min={0}
            placeholder="e.g. 60"
            {...register("capacity_per_hour")}
          />
        </div>
        <div className="space-y-1.5">
          <Label>
            Status <span className="text-red-500">*</span>
          </Label>
          <Select value={status} onValueChange={(v) => setValue("status", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MACHINE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {MACHINE_STATUS_LABELS[s] ?? s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Purchase Date */}
      <div className="space-y-1.5">
        <Label htmlFor="mc-purchase">Purchase Date</Label>
        <Input id="mc-purchase" type="date" {...register("purchase_date")} />
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
          {isEdit ? "Update Machine" : "Create Machine"}
        </Button>
      </div>
    </form>
  )
}
