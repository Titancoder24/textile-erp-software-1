"use client"

import { useState, useEffect, useCallback } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, Plus, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { useCompany } from "@/contexts/company-context"
import { getProducts, deleteProduct } from "@/lib/actions/masters"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table/data-table"
import { FormSheet } from "@/components/forms/form-sheet"
import { ProductForm } from "@/components/forms/masters/product-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Database } from "@/types/database"

type Product = Database["public"]["Tables"]["products"]["Row"]

const CATEGORY_LABELS: Record<string, string> = {
  "t-shirt": "T-Shirt", polo: "Polo", shirt: "Shirt", trouser: "Trouser",
  jacket: "Jacket", dress: "Dress", shorts: "Shorts", hoodie: "Hoodie",
  sweatshirt: "Sweatshirt", tank_top: "Tank Top",
}

export default function ProductsPage() {
  const { companyId } = useCompany()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await getProducts(companyId)
      if (error) {
        toast.error("Failed to load products")
        return
      }
      setProducts(data ?? [])
    } catch {
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  function handleEdit(product: Product) {
    setEditingProduct(product)
    setOpen(true)
  }

  function handleAdd() {
    setEditingProduct(null)
    setOpen(true)
  }

  function handleSuccess(product: Product) {
    setOpen(false)
    setEditingProduct(null)
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = product
        return next
      }
      return [product, ...prev]
    })
  }

  async function handleDelete() {
    if (!deletingProduct) return
    try {
      const { error } = await deleteProduct(deletingProduct.id)
      if (error) {
        toast.error("Failed to delete product")
        return
      }
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id))
      toast.success("Product deleted")
    } catch {
      toast.error("Failed to delete product")
    } finally {
      setDeletingProduct(null)
    }
  }

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "style_code",
      header: "Style Code",
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
          {row.original.style_code}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs">
          {CATEGORY_LABELS[row.original.category] ?? row.original.category}
        </Badge>
      ),
    },
    {
      accessorKey: "buyer_id",
      header: "Buyer",
      cell: ({ row }) => {
        const buyer = (row.original as Record<string, unknown>).buyers as { name?: string } | null
        return (
          <span className="text-sm text-gray-700">
            {buyer?.name ?? (row.original.buyer_id ? row.original.buyer_id : "—")}
          </span>
        )
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) =>
        row.original.is_active ? (
          <Badge className="bg-green-50 text-green-700 border border-green-200 text-xs font-medium">
            Active
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs text-gray-500">
            Inactive
          </Badge>
        ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(row.original) }}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
              onClick={(e) => { e.stopPropagation(); setDeletingProduct(row.original) }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage product styles and categories"
        breadcrumb={[{ label: "Masters", href: "/masters" }, { label: "Products" }]}
        actions={
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        searchKey="name"
        searchPlaceholder="Search by name or style code..."
        filters={[
          {
            key: "is_active",
            label: "Status",
            options: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
          },
        ]}
      />

      <FormSheet
        title={editingProduct ? "Edit Product" : "Add Product"}
        description={
          editingProduct
            ? `Editing ${editingProduct.name}`
            : "Create a new product / style record"
        }
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) setEditingProduct(null)
        }}
        size="md"
        footer={null}
      >
        <ProductForm
          product={editingProduct}
          companyId={companyId}
          onSuccess={handleSuccess}
          onCancel={() => {
            setOpen(false)
            setEditingProduct(null)
          }}
        />
      </FormSheet>

      <AlertDialog open={!!deletingProduct} onOpenChange={(v) => !v && setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingProduct?.name}</strong>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
