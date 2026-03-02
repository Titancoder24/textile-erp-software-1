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
import { createProduct, updateProduct } from "@/lib/actions/masters"
import type { Database } from "@/types/database"

type Product = Database["public"]["Tables"]["products"]["Row"]

const PRODUCT_CATEGORIES = [
  "t-shirt", "polo", "shirt", "trouser", "jacket",
  "dress", "shorts", "hoodie", "sweatshirt", "tank_top",
]

const CATEGORY_LABELS: Record<string, string> = {
  "t-shirt": "T-Shirt", polo: "Polo", shirt: "Shirt", trouser: "Trouser",
  jacket: "Jacket", dress: "Dress", shorts: "Shorts", hoodie: "Hoodie",
  sweatshirt: "Sweatshirt", tank_top: "Tank Top",
}

const productSchema = z.object({
  style_code: z.string().min(1, "Style code is required").max(30),
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  buyer_id: z.string().optional().nullable(),
  is_active: z.boolean(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: Product | null
  companyId: string
  onSuccess: (product: Product) => void
  onCancel?: () => void
}

export function ProductForm({ product, companyId, onSuccess, onCancel }: ProductFormProps) {
  const isEdit = !!product

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      style_code: "",
      name: "",
      category: "",
      description: "",
      buyer_id: null,
      is_active: true,
    },
  })

  useEffect(() => {
    if (product) {
      reset({
        style_code: product.style_code,
        name: product.name,
        category: product.category,
        description: product.description ?? "",
        buyer_id: product.buyer_id ?? null,
        is_active: product.is_active,
      })
    }
  }, [product, reset])

  const category = watch("category")
  const isActive = watch("is_active")

  async function onSubmit(values: ProductFormValues) {
    try {
      const payload = {
        style_code: values.style_code,
        name: values.name,
        category: values.category,
        description: values.description || null,
        buyer_id: values.buyer_id || null,
        is_active: values.is_active,
      }

      if (isEdit && product) {
        const { data: result, error } = await updateProduct(product.id, payload)
        if (error) throw new Error(error)
        toast.success("Product updated")
        onSuccess(result!)
      } else {
        const { data: result, error } = await createProduct({ ...payload, company_id: companyId })
        if (error) throw new Error(error)
        toast.success("Product created")
        onSuccess(result!)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save product.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="p-code">
            Style Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="p-code"
            placeholder="e.g. HMG-2024-001"
            {...register("style_code")}
            className={errors.style_code ? "border-red-400" : ""}
          />
          {errors.style_code && <p className="text-xs text-red-500">{errors.style_code.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>
            Category <span className="text-red-500">*</span>
          </Label>
          <Select value={category} onValueChange={(v) => setValue("category", v)}>
            <SelectTrigger className={errors.category ? "border-red-400" : ""}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORY_LABELS[c] ?? c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="p-name">
          Product Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="p-name"
          placeholder="e.g. Men's Basic Crew Neck T-Shirt"
          {...register("name")}
          className={errors.name ? "border-red-400" : ""}
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="p-desc">Description</Label>
        <Textarea
          id="p-desc"
          placeholder="Optional product description or style notes"
          rows={3}
          {...register("description")}
        />
      </div>

      {/* Buyer */}
      <div className="space-y-1.5">
        <Label htmlFor="p-buyer">Buyer ID</Label>
        <Input
          id="p-buyer"
          placeholder="Buyer reference (optional)"
          {...register("buyer_id")}
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
          {isEdit ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  )
}
