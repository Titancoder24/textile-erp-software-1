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

const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: "s1",
    company_id: "c1",
    name: "Arvind Limited",
    code: "ARV",
    contact_person: "Raj Patel",
    email: "sourcing@arvind.com",
    phone: "+91 79 4000 8000",
    address: "Naroda Road",
    city: "Ahmedabad",
    country: "India",
    material_types: ["fabric", "yarn"],
    payment_terms: "30 days",
    avg_lead_time_days: 21,
    gst_number: "24AACCA7024N1ZW",
    bank_details: null,
    rating: 4,
    is_active: true,
    created_at: "2024-01-10T10:00:00Z",
    updated_at: "2024-01-10T10:00:00Z",
  },
  {
    id: "s2",
    company_id: "c1",
    name: "YKK India Pvt Ltd",
    code: "YKK",
    contact_person: "Sanjay Mehta",
    email: "india@ykk.com",
    phone: "+91 22 6600 0000",
    address: "Marol Industrial Area",
    city: "Mumbai",
    country: "India",
    material_types: ["trim", "accessory"],
    payment_terms: "45 days",
    avg_lead_time_days: 7,
    gst_number: "27AABCY1234A1ZZ",
    bank_details: null,
    rating: 5,
    is_active: true,
    created_at: "2024-02-05T10:00:00Z",
    updated_at: "2024-02-05T10:00:00Z",
  },
  {
    id: "s3",
    company_id: "c1",
    name: "Huntsman Corporation",
    code: "HNT",
    contact_person: "Wei Zhang",
    email: "sales@huntsman.com",
    phone: "+86 21 5884 0000",
    address: "Pudong New District",
    city: "Shanghai",
    country: "China",
    material_types: ["chemical"],
    payment_terms: "60 days",
    avg_lead_time_days: 14,
    gst_number: null,
    bank_details: null,
    rating: 3,
    is_active: false,
    created_at: "2024-03-20T10:00:00Z",
    updated_at: "2024-03-20T10:00:00Z",
  },
]

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
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null)

  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 400))
      setSuppliers(MOCK_SUPPLIERS)
    } catch {
      toast.error("Failed to load suppliers")
    } finally {
      setLoading(false)
    }
  }, [])

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
      await new Promise((r) => setTimeout(r, 400))
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
