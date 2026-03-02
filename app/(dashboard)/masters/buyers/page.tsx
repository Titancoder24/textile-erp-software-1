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
import { BuyerForm } from "@/components/forms/masters/buyer-form"
import { useCompany } from "@/contexts/company-context"
import { getBuyers, deleteBuyer } from "@/lib/actions/buyers"
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

type Buyer = Database["public"]["Tables"]["buyers"]["Row"]

export default function BuyersPage() {
  const router = useRouter()
  const { companyId } = useCompany()
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null)
  const [deletingBuyer, setDeletingBuyer] = useState<Buyer | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const fetchBuyers = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await getBuyers(companyId)
      if (error) {
        toast.error("Failed to load buyers")
        return
      }
      setBuyers(data ?? [])
    } catch {
      toast.error("Failed to load buyers")
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchBuyers()
  }, [fetchBuyers])

  const filteredBuyers =
    statusFilter === "all"
      ? buyers
      : buyers.filter((b) =>
          statusFilter === "active" ? b.is_active : !b.is_active
        )

  function handleEdit(buyer: Buyer) {
    setEditingBuyer(buyer)
    setOpen(true)
  }

  function handleAdd() {
    setEditingBuyer(null)
    setOpen(true)
  }

  function handleSuccess(buyer: Buyer) {
    setOpen(false)
    setEditingBuyer(null)
    setBuyers((prev) => {
      const idx = prev.findIndex((b) => b.id === buyer.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = buyer
        return next
      }
      return [buyer, ...prev]
    })
  }

  async function handleDelete() {
    if (!deletingBuyer) return
    try {
      const { error } = await deleteBuyer(deletingBuyer.id)
      if (error) {
        toast.error("Failed to delete buyer")
        return
      }
      setBuyers((prev) => prev.filter((b) => b.id !== deletingBuyer.id))
      toast.success("Buyer deleted successfully")
    } catch {
      toast.error("Failed to delete buyer")
    } finally {
      setDeletingBuyer(null)
    }
  }

  const columns: ColumnDef<Buyer>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-gray-900">{row.original.name}</p>
          {row.original.city && row.original.country && (
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
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => row.original.country || "—",
    },
    {
      accessorKey: "default_currency",
      header: "Currency",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.default_currency}</span>
      ),
    },
    {
      accessorKey: "quality_standard",
      header: "Quality Std",
      cell: ({ row }) =>
        row.original.quality_standard ? (
          <Badge variant="secondary" className="text-xs">
            {row.original.quality_standard}
          </Badge>
        ) : (
          <span className="text-gray-400">—</span>
        ),
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
      filterFn: (row, _, filterValue) => {
        if (filterValue === "all") return true
        return filterValue === "active" ? row.original.is_active : !row.original.is_active
      },
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
                router.push(`/masters/buyers/${row.original.id}`)
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
                setDeletingBuyer(row.original)
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
        title="Buyers"
        description="Manage buyer and brand master data"
        breadcrumb={[{ label: "Masters", href: "/masters" }, { label: "Buyers" }]}
        actions={
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Buyer
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={filteredBuyers}
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
        onRowClick={(buyer) => router.push(`/masters/buyers/${buyer.id}`)}
      />

      <FormSheet
        title={editingBuyer ? "Edit Buyer" : "Add Buyer"}
        description={
          editingBuyer
            ? `Editing ${editingBuyer.name}`
            : "Create a new buyer / brand record"
        }
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) setEditingBuyer(null)
        }}
        size="md"
        footer={null}
      >
        <BuyerForm
          buyer={editingBuyer}
          companyId={companyId}
          onSuccess={handleSuccess}
          onCancel={() => {
            setOpen(false)
            setEditingBuyer(null)
          }}
        />
      </FormSheet>

      <AlertDialog
        open={!!deletingBuyer}
        onOpenChange={(v) => !v && setDeletingBuyer(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Buyer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deletingBuyer?.name}</strong>? This action cannot be
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
