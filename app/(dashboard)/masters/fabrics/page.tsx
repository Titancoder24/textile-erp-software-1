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
import { FabricForm } from "@/components/forms/masters/fabric-form"
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

type Fabric = Database["public"]["Tables"]["fabrics"]["Row"]

const FABRIC_TYPE_LABELS: Record<string, string> = {
  woven: "Woven",
  knitted: "Knitted",
  non_woven: "Non-Woven",
}

const MOCK_FABRICS: Fabric[] = [
  {
    id: "f1", company_id: "c1", name: "Single Jersey 160 GSM", code: "SJ160",
    fabric_type: "knitted", construction: "20s Combed", gsm: 160, width_cm: 150,
    weave_type: null, composition: "100% Cotton", uom: "kg", rate: 320,
    supplier_id: "s1", is_active: true,
    created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "f2", company_id: "c1", name: "Cotton Poplin", code: "CPO45",
    fabric_type: "woven", construction: "40x40 / 133x72", gsm: 120, width_cm: 145,
    weave_type: "Plain", composition: "100% Cotton", uom: "meter", rate: 180,
    supplier_id: "s1", is_active: true,
    created_at: "2024-01-02T00:00:00Z", updated_at: "2024-01-02T00:00:00Z",
  },
  {
    id: "f3", company_id: "c1", name: "Pique Mesh 220 GSM", code: "PM220",
    fabric_type: "knitted", construction: "24s Carded", gsm: 220, width_cm: 165,
    weave_type: null, composition: "65% Polyester / 35% Cotton", uom: "kg", rate: 290,
    supplier_id: null, is_active: true,
    created_at: "2024-01-03T00:00:00Z", updated_at: "2024-01-03T00:00:00Z",
  },
  {
    id: "f4", company_id: "c1", name: "Twill Denim 10oz", code: "TD10",
    fabric_type: "woven", construction: "7x6 / 68x45", gsm: 340, width_cm: 152,
    weave_type: "Twill", composition: "100% Cotton", uom: "meter", rate: 420,
    supplier_id: "s1", is_active: false,
    created_at: "2024-01-04T00:00:00Z", updated_at: "2024-01-04T00:00:00Z",
  },
]

export default function FabricsPage() {
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingFabric, setEditingFabric] = useState<Fabric | null>(null)
  const [deletingFabric, setDeletingFabric] = useState<Fabric | null>(null)

  const fetchFabrics = useCallback(async () => {
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 300))
      setFabrics(MOCK_FABRICS)
    } catch {
      toast.error("Failed to load fabrics")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFabrics()
  }, [fetchFabrics])

  function handleEdit(fabric: Fabric) {
    setEditingFabric(fabric)
    setOpen(true)
  }

  function handleAdd() {
    setEditingFabric(null)
    setOpen(true)
  }

  function handleSuccess(fabric: Fabric) {
    setOpen(false)
    setEditingFabric(null)
    setFabrics((prev) => {
      const idx = prev.findIndex((f) => f.id === fabric.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = fabric
        return next
      }
      return [fabric, ...prev]
    })
  }

  async function handleDelete() {
    if (!deletingFabric) return
    try {
      await new Promise((r) => setTimeout(r, 400))
      setFabrics((prev) => prev.filter((f) => f.id !== deletingFabric.id))
      toast.success("Fabric deleted")
    } catch {
      toast.error("Failed to delete fabric")
    } finally {
      setDeletingFabric(null)
    }
  }

  const columns: ColumnDef<Fabric>[] = [
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
        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: "fabric_type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs capitalize">
          {FABRIC_TYPE_LABELS[row.original.fabric_type] ?? row.original.fabric_type}
        </Badge>
      ),
    },
    {
      accessorKey: "gsm",
      header: "GSM",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.gsm ?? "—"}</span>
      ),
    },
    {
      accessorKey: "width_cm",
      header: "Width",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.width_cm ? `${row.original.width_cm} cm` : "—"}
        </span>
      ),
    },
    {
      accessorKey: "composition",
      header: "Composition",
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">{row.original.composition ?? "—"}</span>
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
              onClick={(e) => { e.stopPropagation(); setDeletingFabric(row.original) }}
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
        title="Fabrics"
        description="Manage fabric master data with specifications and pricing"
        breadcrumb={[{ label: "Masters", href: "/masters" }, { label: "Fabrics" }]}
        actions={
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Fabric
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={fabrics}
        loading={loading}
        searchKey="name"
        searchPlaceholder="Search fabrics..."
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
        title={editingFabric ? "Edit Fabric" : "Add Fabric"}
        description={
          editingFabric
            ? `Editing ${editingFabric.name}`
            : "Add a new fabric to the master library"
        }
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) setEditingFabric(null)
        }}
        size="md"
        footer={null}
      >
        <FabricForm
          fabric={editingFabric}
          onSuccess={handleSuccess}
          onCancel={() => {
            setOpen(false)
            setEditingFabric(null)
          }}
        />
      </FormSheet>

      <AlertDialog open={!!deletingFabric} onOpenChange={(v) => !v && setDeletingFabric(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fabric</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingFabric?.name}</strong>? This action
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
