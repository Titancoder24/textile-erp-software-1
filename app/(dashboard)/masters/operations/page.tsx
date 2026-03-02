"use client"

import { useState, useEffect, useCallback } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, Plus, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { useCompany } from "@/contexts/company-context"
import { getOperations, deleteOperation } from "@/lib/actions/masters"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table/data-table"
import { FormSheet } from "@/components/forms/form-sheet"
import { OperationForm } from "@/components/forms/masters/operation-form"
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

type Operation = Database["public"]["Tables"]["operations"]["Row"]

export default function OperationsPage() {
  const { companyId } = useCompany()
  const [operations, setOperations] = useState<Operation[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null)
  const [deletingOperation, setDeletingOperation] = useState<Operation | null>(null)

  const fetchOperations = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await getOperations(companyId)
      if (error) {
        toast.error("Failed to load operations")
        return
      }
      setOperations(data ?? [])
    } catch {
      toast.error("Failed to load operations")
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchOperations()
  }, [fetchOperations])

  function handleEdit(op: Operation) {
    setEditingOperation(op)
    setOpen(true)
  }

  function handleAdd() {
    setEditingOperation(null)
    setOpen(true)
  }

  function handleSuccess(op: Operation) {
    setOpen(false)
    setEditingOperation(null)
    setOperations((prev) => {
      const idx = prev.findIndex((o) => o.id === op.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = op
        return next
      }
      return [op, ...prev]
    })
  }

  async function handleDelete() {
    if (!deletingOperation) return
    try {
      const { error } = await deleteOperation(deletingOperation.id)
      if (error) {
        toast.error("Failed to delete operation")
        return
      }
      setOperations((prev) => prev.filter((o) => o.id !== deletingOperation.id))
      toast.success("Operation deleted")
    } catch {
      toast.error("Failed to delete operation")
    } finally {
      setDeletingOperation(null)
    }
  }

  const columns: ColumnDef<Operation>[] = [
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
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs">
          {row.original.department}
        </Badge>
      ),
    },
    {
      accessorKey: "smv",
      header: "SMV",
      cell: ({ row }) => (
        <span className="tabular-nums text-sm font-medium">
          {Number(row.original.smv).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "machine_type",
      header: "Machine Type",
      cell: ({ row }) =>
        row.original.machine_type ? (
          <span className="text-sm capitalize">{row.original.machine_type}</span>
        ) : (
          <span className="text-gray-400">-</span>
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
                setDeletingOperation(row.original)
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
        title="Operations"
        description="Manage sewing and production operations with SMV"
        breadcrumb={[{ label: "Masters", href: "/masters" }, { label: "Operations" }]}
        actions={
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Operation
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={operations}
        loading={loading}
        searchKey="name"
        searchPlaceholder="Search by name or code..."
      />

      <FormSheet
        title={editingOperation ? "Edit Operation" : "Add Operation"}
        description={
          editingOperation
            ? `Editing ${editingOperation.name}`
            : "Create a new operation record"
        }
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) setEditingOperation(null)
        }}
        size="md"
        footer={null}
      >
        <OperationForm
          operation={editingOperation}
          companyId={companyId}
          onSuccess={handleSuccess}
          onCancel={() => {
            setOpen(false)
            setEditingOperation(null)
          }}
        />
      </FormSheet>

      <AlertDialog
        open={!!deletingOperation}
        onOpenChange={(v) => !v && setDeletingOperation(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Operation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deletingOperation?.name}</strong>? This action cannot be
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
