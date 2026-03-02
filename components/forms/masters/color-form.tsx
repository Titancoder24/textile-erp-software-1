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
import { createColor, updateColor } from "@/lib/actions/masters"
import type { Database } from "@/types/database"

type Color = Database["public"]["Tables"]["colors"]["Row"]

const colorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required").max(20, "Code max 20 chars"),
  pantone_ref: z.string().optional(),
  hex_code: z.string().regex(/^#([0-9A-Fa-f]{6})$/, "Invalid hex color").optional().or(z.literal("")),
})

type ColorFormValues = z.infer<typeof colorSchema>

interface ColorFormProps {
  color?: Color | null
  companyId: string
  onSuccess: (color: Color) => void
  onCancel?: () => void
}

export function ColorForm({ color, companyId, onSuccess, onCancel }: ColorFormProps) {
  const isEdit = !!color

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ColorFormValues>({
    resolver: zodResolver(colorSchema),
    defaultValues: {
      name: "",
      code: "",
      pantone_ref: "",
      hex_code: "#000000",
    },
  })

  useEffect(() => {
    if (color) {
      reset({
        name: color.name,
        code: color.code,
        pantone_ref: color.pantone_ref ?? "",
        hex_code: color.hex_code ?? "#000000",
      })
    }
  }, [color, reset])

  const hexCode = watch("hex_code")

  async function onSubmit(values: ColorFormValues) {
    try {
      const payload = {
        name: values.name,
        code: values.code,
        pantone_ref: values.pantone_ref || null,
        hex_code: values.hex_code || null,
      }

      if (isEdit && color) {
        const { data: result, error } = await updateColor(color.id, payload)
        if (error) throw new Error(error)
        toast.success("Color updated")
        onSuccess(result!)
      } else {
        const { data: result, error } = await createColor({ ...payload, company_id: companyId })
        if (error) throw new Error(error)
        toast.success("Color created")
        onSuccess(result!)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save color. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Color Preview */}
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div
          className="h-12 w-12 rounded-full border border-gray-300 shadow-inner flex-shrink-0"
          style={{ backgroundColor: hexCode || "#e5e7eb" }}
        />
        <div>
          <p className="text-sm font-medium text-gray-900">Color Preview</p>
          <p className="text-xs text-gray-500">{hexCode || "No hex code set"}</p>
        </div>
      </div>

      {/* Name & Code */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="c-name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="c-name"
            placeholder="e.g. Royal Blue"
            {...register("name")}
            className={errors.name ? "border-red-400" : ""}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-code">
            Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="c-code"
            placeholder="e.g. RBLUE"
            {...register("code")}
            className={errors.code ? "border-red-400" : ""}
          />
          {errors.code && <p className="text-xs text-red-500">{errors.code.message}</p>}
        </div>
      </div>

      {/* Pantone Ref */}
      <div className="space-y-1.5">
        <Label htmlFor="c-pantone">Pantone Reference</Label>
        <Input
          id="c-pantone"
          placeholder="e.g. Pantone 286 C"
          {...register("pantone_ref")}
        />
      </div>

      {/* Hex Code */}
      <div className="space-y-1.5">
        <Label htmlFor="c-hex">Hex Color Code</Label>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={hexCode || "#000000"}
            onChange={(e) => {
              const input = document.getElementById("c-hex") as HTMLInputElement
              if (input) input.value = e.target.value
            }}
            className="h-9 w-12 cursor-pointer rounded-md border border-gray-300 p-0.5"
          />
          <Input
            id="c-hex"
            placeholder="#000000"
            {...register("hex_code")}
            className={errors.hex_code ? "border-red-400" : ""}
          />
        </div>
        {errors.hex_code && <p className="text-xs text-red-500">{errors.hex_code.message}</p>}
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
          {isEdit ? "Update Color" : "Create Color"}
        </Button>
      </div>
    </form>
  )
}
