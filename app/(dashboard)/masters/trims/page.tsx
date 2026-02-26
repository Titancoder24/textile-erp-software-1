"use client"

import { useState, useEffect, useCallback } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, Plus, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table/data-table"
import { FormSheet } from "@/components/forms/form-sheet"
import { TrimForm } from "@/components/forms/masters/trim-form"
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

type Trim = Database["public"]["Tables"]["trims"]["Row"]

const TRIM_TYPE_LABELS: Record<string, string> = {
  button: "Button",
  zipper: "Zipper",
  label: "Label",
  thread: "Thread",
  interlining: "Interlining",
  tape: "Tape",
  elastic: "Elastic",
  hanger: "Hanger",
  poly_bag: "Poly Bag",
  carton: "Carton",
  tag: "Tag",
}

const MOCK_TRIMS: Trim[] = [
  {
    id: "t1", company_id: "c1", name: "Metal Button 15mm 4-Hole", code: "BTN15M",
    trim_type: "button", description: "Antique brass finish", uom: "pcs", rate: 2.50,
    supplier_id: "s2", is_active: true,
    created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "t2", company_id: "c1", name: "YKK Zipper #5 Close-End", code: "ZIP5CE",
    trim_type: "zipper", description: "Nylon coil, auto-lock slider", uom: "pcs", rate: 18.00,
    supplier_id: "s2", is_active: true,
    created_at: "2024-01-02T00:00:00Z", updated_at: "2024-01-02T00:00:00Z",
  },
  {
    id: "t3", company_id: "c1", name: "Woven Main Label", code: "WLBL01",
    trim_type: "label", description: "Satin weave, brand label", uom: "pcs", rate: 1.20,
    supplier_id: null, is_active: true,
    created_at: "2024-01-03T00:00:00Z", updated_at: "2024-01-03T00:00:00Z",
  },
  {
    id: "t4", company_id: "c1", name: "Polyester Thread 40/2", code: "THR402",
    trim_type: "thread", description: "High tenacity polyester", uom: "meter", rate: 0.05,
    supplier_id: "s2", is_active: true,
    created_at: "2024-01-04T00:00:00Z", updated_at: "2024-01-04T00:00:00Z",
  },
  {
    id: "t5", company_id: "c1", name: "Woven Elastic 25mm", code: "EL25W",
    trim_type: "elastic", description: "White waistband elastic", uom: "meter", rate: 4.50,
    supplier_id: null, is_active: false,
    created_at: "2024-01-05T00:00:00Z", updated_at: "2024-01-05T00:00:00Z",
  },
]

export default function TrimsPage() {
  const [trims, setTrims] = useState<Trim[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingTrim, setEditingTrim] = useState<Trim | null>(null)
  const [deletingTrim, setDeletingTrim] = useState<Trim | null>(null)

  const fetchTrims = useCallback(async () => {
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 300))
      setTrims(MOCK_TRIMS)
    } catch {
      toast.error("Failed to load trims")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTrims()
  }, [fetchTrims])

  function handleEdit(trim: Trim) {
    setEditingTrim(trim)
    setOpen(true)
  }

  function handleAdd() {
    setEditingTrim(null)
    setOpen(true)
  }

  function handleSuccess(trim: Trim) {
    setOpen(false)
    setEditingTrim(null)
    setTrims((prev) => {
      const idx = prev.findIndex((t) => t.id === trim.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = trim
        return next
      }
      return [trim, ...prev]
    })
  }

  async function handleDelete() {
    if (!deletingTrim) return
    try {
      await new Promise((r) => setTimeout(r, 400))
      setTrims((prev) => prev.filter((t) => t.id !== deletingTrim.id))
      toast.success("Trim deleted")
    } catch {
      toast.error("Failed to delete trim")
    } finally {
      setDeletingTrim(null)
    }
  }

  const columns: ColumnDef<Trim>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-gray-900">{row.original.name}</p>
          {row.original.description && (
            <p className="text-xs text-gray-500 truncate max-w-[200px]">{row.original.description}</p>
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
      accessorKey: "trim_type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs capitalize">
          {TRIM_TYPE_LABELS[row.original.trim_type] ?? row.original.trim_type}
        </Badge>
      ),
    },
    {
      accessorKey: "uom",
      header: "UOM",
      cell: ({ row }) => (
        <span className="text-sm capitalize">{row.original.uom}</span>
      ),
    },
    {
      accessorKey: "rate",
      header: "Rate",
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original.rate.toFixed(2)} / {row.original.uom}
        </span>
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
              onClick={(e) => { e.stopPropagation(); setDeletingTrim(row.original) }}
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
        title="Trims"
        description="Manage trims and accessories master data"
        breadcrumb={[{ label: "Masters", href: "/masters" }, { label: "Trims" }]}
        actions={
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Trim
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={trims}
        loading={loading}
        searchKey="name"
        searchPlaceholder="Search trims..."
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
        title={editingTrim ? "Edit Trim" : "Add Trim"}
        description={
          editingTrim
            ? `Editing ${editingTrim.name}`
            : "Add a new trim or accessory to the master library"
        }
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) setEditingTrim(null)
        }}
        size="md"
        footer={null}
      >
        <TrimForm
          trim={editingTrim}
          onSuccess={handleSuccess}
          onCancel={() => {
            setOpen(false)
            setEditingTrim(null)
          }}
        />
      </FormSheet>

      <AlertDialog open={!!deletingTrim} onOpenChange={(v) => !v && setDeletingTrim(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trim</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingTrim?.name}</strong>? This action
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
