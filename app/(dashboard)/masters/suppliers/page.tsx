"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, Eye, Plus, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table/data-table"
import { FormSheet } from "@/components/forms/form-sheet"
import { SupplierForm } from "@/components/forms/masters/supplier-form"
import { useCompany } from "@/contexts/company-context"
import { getSuppliers, deleteSupplier } from "@/lib/actions/suppliers"
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

type Supplier = Database["public"]["Tables"]["suppliers"]["Row"]

function RatingStars({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-gray-400 text-sm">—</span>
  return (
    <span className="text-amber-400 text-sm">
      {"★".repeat(rating)}
      <span className="text-gray-300">{"★".repeat(5 - rating)}</span>
    </span>
  )
}

export default function SuppliersPage() {
  const router = useRouter()
  const { companyId } = useCompany()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null)

  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await getSuppliers(companyId)
      if (error) {
        toast.error("Failed to load suppliers")
        return
      }
      setSuppliers(data ?? [])
    } catch {
      toast.error("Failed to load suppliers")
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  function handleEdit(supplier: Supplier) {
    setEditingSupplier(supplier)
    setOpen(true)
  }

  function handleAdd() {
    setEditingSupplier(null)
    setOpen(true)
  }

  function handleSuccess(supplier: Supplier) {
    setOpen(false)
    setEditingSupplier(null)
    setSuppliers((prev) => {
      const idx = prev.findIndex((s) => s.id === supplier.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = supplier
        return next
      }
      return [supplier, ...prev]
    })
  }

  async function handleDelete() {
    if (!deletingSupplier) return
    try {
      const { error } = await deleteSupplier(deletingSupplier.id)
      if (error) {
        toast.error("Failed to delete supplier")
        return
      }
      setSuppliers((prev) => prev.filter((s) => s.id !== deletingSupplier.id))
      toast.success("Supplier deleted successfully")
    } catch {
      toast.error("Failed to delete supplier")
    } finally {
      setDeletingSupplier(null)
    }
  }

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-gray-900">{row.original.name}</p>
          {row.original.city && (
            <p className="text-xs text-gray-500">
              {row.original.city}, {row.original.country}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: "contact_person",
      header: "Contact",
      cell: ({ row }) => (
        <div>
          <p className="text-sm">{row.original.contact_person || "—"}</p>
          {row.original.email && (
            <p className="text-xs text-gray-500">{row.original.email}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "material_types",
      header: "Material Types",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {(row.original.material_types ?? []).slice(0, 3).map((type) => (
            <Badge key={type} variant="secondary" className="text-xs capitalize">
              {type}
            </Badge>
          ))}
          {(row.original.material_types ?? []).length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{row.original.material_types.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "avg_lead_time_days",
      header: "Lead Time",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.avg_lead_time_days} days</span>
      ),
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => <RatingStars rating={row.original.rating} />,
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/masters/suppliers/${row.original.id}`)
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                handleEdit(row.original)
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
              onClick={(e) => {
                e.stopPropagation()
                setDeletingSupplier(row.original)
              }}
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
        title="Suppliers"
        description="Manage supplier and vendor master data"
        breadcrumb={[{ label: "Masters", href: "/masters" }, { label: "Suppliers" }]}
        actions={
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={suppliers}
        loading={loading}
        searchKey="name"
        searchPlaceholder="Search by name or code..."
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
        onRowClick={(supplier) => router.push(`/masters/suppliers/${supplier.id}`)}
      />

      <FormSheet
        title={editingSupplier ? "Edit Supplier" : "Add Supplier"}
        description={
          editingSupplier
            ? `Editing ${editingSupplier.name}`
            : "Create a new supplier record"
        }
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) setEditingSupplier(null)
        }}
        size="md"
        footer={null}
      >
        <SupplierForm
          supplier={editingSupplier}
          companyId={companyId}
          onSuccess={handleSuccess}
          onCancel={() => {
            setOpen(false)
            setEditingSupplier(null)
          }}
        />
      </FormSheet>

      <AlertDialog
        open={!!deletingSupplier}
        onOpenChange={(v) => !v && setDeletingSupplier(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deletingSupplier?.name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
