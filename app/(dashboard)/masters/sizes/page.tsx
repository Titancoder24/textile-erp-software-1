"use client"

import { useState, useEffect, useCallback } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, Plus, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { useCompany } from "@/contexts/company-context"
import { getSizes, deleteSize } from "@/lib/actions/masters"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import { FormSheet } from "@/components/forms/form-sheet"
import { SizeForm } from "@/components/forms/masters/size-form"
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

type Size = Database["public"]["Tables"]["sizes"]["Row"]

export default function SizesPage() {
  const { companyId } = useCompany()
  const [sizes, setSizes] = useState<Size[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingSize, setEditingSize] = useState<Size | null>(null)
  const [deletingSize, setDeletingSize] = useState<Size | null>(null)

  const fetchSizes = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await getSizes(companyId)
      if (error) {
        toast.error("Failed to load sizes")
        return
      }
      setSizes(data ?? [])
    } catch {
      toast.error("Failed to load sizes")
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchSizes()
  }, [fetchSizes])

  function handleEdit(size: Size) {
    setEditingSize(size)
    setOpen(true)
  }

  function handleAdd() {
    setEditingSize(null)
    setOpen(true)
  }

  function handleSuccess(size: Size) {
    setOpen(false)
    setEditingSize(null)
    setSizes((prev) => {
      const idx = prev.findIndex((s) => s.id === size.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = size
        return next.sort((a, b) => a.sort_order - b.sort_order)
      }
      return [...prev, size].sort((a, b) => a.sort_order - b.sort_order)
    })
  }

  async function handleDelete() {
    if (!deletingSize) return
    try {
      const { error } = await deleteSize(deletingSize.id)
      if (error) {
        toast.error("Failed to delete size")
        return
      }
      setSizes((prev) => prev.filter((s) => s.id !== deletingSize.id))
      toast.success("Size deleted")
    } catch {
      toast.error("Failed to delete size")
    } finally {
      setDeletingSize(null)
    }
  }

  const columns: ColumnDef<Size>[] = [
    {
      accessorKey: "sort_order",
      header: "Order",
      cell: ({ row }) => (
        <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
          {row.original.sort_order}
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
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">
          {row.original.code}
        </span>
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
              onClick={(e) => { e.stopPropagation(); setDeletingSize(row.original) }}
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
        title="Sizes"
        description="Manage size masters with sort order for consistent ordering"
        breadcrumb={[{ label: "Masters", href: "/masters" }, { label: "Sizes" }]}
        actions={
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Size
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={sizes}
        loading={loading}
        searchKey="name"
        searchPlaceholder="Search sizes..."
      />

      <FormSheet
        title={editingSize ? "Edit Size" : "Add Size"}
        description="Define a size with its code and display order"
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) setEditingSize(null)
        }}
        size="sm"
        footer={null}
      >
        <SizeForm
          companyId={companyId}
          size={editingSize}
          onSuccess={handleSuccess}
          onCancel={() => {
            setOpen(false)
            setEditingSize(null)
          }}
        />
      </FormSheet>

      <AlertDialog open={!!deletingSize} onOpenChange={(v) => !v && setDeletingSize(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Size</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete size <strong>{deletingSize?.name}</strong>? This
              action cannot be undone.
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
