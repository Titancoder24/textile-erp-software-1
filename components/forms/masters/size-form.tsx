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
import { createSize, updateSize } from "@/lib/actions/masters"
import type { Database } from "@/types/database"

type Size = Database["public"]["Tables"]["sizes"]["Row"]

const sizeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required").max(20, "Code max 20 chars"),
  sort_order: z.number().min(0, "Must be 0 or more"),
})

type SizeFormValues = z.infer<typeof sizeSchema>

interface SizeFormProps {
  size?: Size | null
  companyId: string
  onSuccess: (size: Size) => void
  onCancel?: () => void
}

export function SizeForm({ size, companyId, onSuccess, onCancel }: SizeFormProps) {
  const isEdit = !!size

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SizeFormValues>({
    resolver: zodResolver(sizeSchema),
    defaultValues: {
      name: "",
      code: "",
      sort_order: 0,
    },
  })

  useEffect(() => {
    if (size) {
      reset({
        name: size.name,
        code: size.code,
        sort_order: size.sort_order,
      })
    }
  }, [size, reset])

  async function onSubmit(values: SizeFormValues) {
    try {
      const payload = {
        name: values.name,
        code: values.code,
        sort_order: values.sort_order,
      }

      if (isEdit && size) {
        const { data: result, error } = await updateSize(size.id, payload)
        if (error) throw new Error(error)
        toast.success("Size updated")
        onSuccess(result!)
      } else {
        const { data: result, error } = await createSize({ ...payload, company_id: companyId })
        if (error) throw new Error(error)
        toast.success("Size created")
        onSuccess(result!)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save size. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="sz-name">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="sz-name"
          placeholder="e.g. Extra Large"
          {...register("name")}
          className={errors.name ? "border-red-400" : ""}
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sz-code">
          Code <span className="text-red-500">*</span>
        </Label>
        <Input
          id="sz-code"
          placeholder="e.g. XL"
          {...register("code")}
          className={errors.code ? "border-red-400" : ""}
        />
        {errors.code && <p className="text-xs text-red-500">{errors.code.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sz-sort">Sort Order</Label>
        <Input
          id="sz-sort"
          type="number"
          min={0}
          placeholder="e.g. 5"
          {...register("sort_order", { valueAsNumber: true })}
          className={errors.sort_order ? "border-red-400" : ""}
        />
        {errors.sort_order && <p className="text-xs text-red-500">{errors.sort_order.message}</p>}
        <p className="text-xs text-gray-500">Lower number = appears first in lists</p>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Update Size" : "Create Size"}
        </Button>
      </div>
    </form>
  )
}
