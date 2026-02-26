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
import { ChemicalForm } from "@/components/forms/masters/chemical-form"
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

type Chemical = Database["public"]["Tables"]["chemicals"]["Row"]

const CHEMICAL_TYPE_LABELS: Record<string, string> = {
  reactive_dye: "Reactive Dye",
  disperse_dye: "Disperse Dye",
  vat_dye: "Vat Dye",
  pigment: "Pigment",
  softener: "Softener",
  caustic: "Caustic",
  sodium_carbonate: "Sodium Carbonate",
  peroxide: "Peroxide",
  fixing_agent: "Fixing Agent",
  anti_crease: "Anti-Crease",
}

const MOCK_CHEMICALS: Chemical[] = [
  {
    id: "ch1", company_id: "c1", name: "Reactive Red M5B", code: "RRM5B",
    chemical_type: "reactive_dye", uom: "kg", rate: 850,
    supplier_id: "s3", is_active: true,
    created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "ch2", company_id: "c1", name: "Disperse Blue 56", code: "DB56",
    chemical_type: "disperse_dye", uom: "kg", rate: 1200,
    supplier_id: "s3", is_active: true,
    created_at: "2024-01-02T00:00:00Z", updated_at: "2024-01-02T00:00:00Z",
  },
  {
    id: "ch3", company_id: "c1", name: "Macro Softener CT", code: "MSCT",
    chemical_type: "softener", uom: "kg", rate: 220,
    supplier_id: null, is_active: true,
    created_at: "2024-01-03T00:00:00Z", updated_at: "2024-01-03T00:00:00Z",
  },
  {
    id: "ch4", company_id: "c1", name: "Caustic Soda Flakes", code: "CSF",
    chemical_type: "caustic", uom: "kg", rate: 45,
    supplier_id: "s3", is_active: true,
    created_at: "2024-01-04T00:00:00Z", updated_at: "2024-01-04T00:00:00Z",
  },
  {
    id: "ch5", company_id: "c1", name: "Hydrogen Peroxide 50%", code: "HP50",
    chemical_type: "peroxide", uom: "liter", rate: 38,
    supplier_id: null, is_active: false,
    created_at: "2024-01-05T00:00:00Z", updated_at: "2024-01-05T00:00:00Z",
  },
]

export default function ChemicalsPage() {
  const [chemicals, setChemicals] = useState<Chemical[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingChemical, setEditingChemical] = useState<Chemical | null>(null)
  const [deletingChemical, setDeletingChemical] = useState<Chemical | null>(null)

  const fetchChemicals = useCallback(async () => {
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 300))
      setChemicals(MOCK_CHEMICALS)
    } catch {
      toast.error("Failed to load chemicals")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChemicals()
  }, [fetchChemicals])

  function handleEdit(chemical: Chemical) {
    setEditingChemical(chemical)
    setOpen(true)
  }

  function handleAdd() {
    setEditingChemical(null)
    setOpen(true)
  }

  function handleSuccess(chemical: Chemical) {
    setOpen(false)
    setEditingChemical(null)
    setChemicals((prev) => {
      const idx = prev.findIndex((c) => c.id === chemical.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = chemical
        return next
      }
      return [chemical, ...prev]
    })
  }

  async function handleDelete() {
    if (!deletingChemical) return
    try {
      await new Promise((r) => setTimeout(r, 400))
      setChemicals((prev) => prev.filter((c) => c.id !== deletingChemical.id))
      toast.success("Chemical deleted")
    } catch {
      toast.error("Failed to delete chemical")
    } finally {
      setDeletingChemical(null)
    }
  }

  const columns: ColumnDef<Chemical>[] = [
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
      accessorKey: "chemical_type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs">
          {CHEMICAL_TYPE_LABELS[row.original.chemical_type] ?? row.original.chemical_type}
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
              onClick={(e) => { e.stopPropagation(); setDeletingChemical(row.original) }}
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
        title="Chemicals"
        description="Manage dyes, chemicals, and auxiliaries master data"
        breadcrumb={[{ label: "Masters", href: "/masters" }, { label: "Chemicals" }]}
        actions={
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Chemical
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={chemicals}
        loading={loading}
        searchKey="name"
        searchPlaceholder="Search chemicals..."
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
        title={editingChemical ? "Edit Chemical" : "Add Chemical"}
        description={
          editingChemical
            ? `Editing ${editingChemical.name}`
            : "Add a new chemical or dye to the master library"
        }
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) setEditingChemical(null)
        }}
        size="md"
        footer={null}
      >
        <ChemicalForm
          chemical={editingChemical}
          onSuccess={handleSuccess}
          onCancel={() => {
            setOpen(false)
            setEditingChemical(null)
          }}
        />
      </FormSheet>

      <AlertDialog open={!!deletingChemical} onOpenChange={(v) => !v && setDeletingChemical(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chemical</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingChemical?.name}</strong>? This action
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
