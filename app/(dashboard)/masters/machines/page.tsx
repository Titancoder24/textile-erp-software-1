"use client"

import { useState, useEffect, useCallback } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, Plus, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { useCompany } from "@/contexts/company-context"
import { getMachines, deleteMachine } from "@/lib/actions/masters"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table/data-table"
import { FormSheet } from "@/components/forms/form-sheet"
import { MachineForm } from "@/components/forms/masters/machine-form"
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

type Machine = Database["public"]["Tables"]["machines"]["Row"]

const MACHINE_TYPE_LABELS: Record<string, string> = {
  sewing: "Sewing",
  overlock: "Overlock",
  flatlock: "Flatlock",
  cutting: "Cutting",
  spreading: "Spreading",
  loom: "Loom",
  knitting: "Knitting",
  dyeing: "Dyeing",
  stenter: "Stenter",
  compactor: "Compactor",
}

const STATUS_STYLES: Record<string, string> = {
  running: "bg-green-50 text-green-700 border-green-200",
  breakdown: "bg-red-50 text-red-700 border-red-200",
  maintenance: "bg-yellow-50 text-yellow-700 border-yellow-200",
  idle: "bg-gray-50 text-gray-500 border-gray-200",
}

const STATUS_LABELS: Record<string, string> = {
  running: "Running",
  idle: "Idle",
  maintenance: "Maintenance",
  breakdown: "Breakdown",
}

export default function MachinesPage() {
  const { companyId } = useCompany()
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null)
  const [deletingMachine, setDeletingMachine] = useState<Machine | null>(null)

  const fetchMachines = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await getMachines(companyId)
      if (error) {
        toast.error("Failed to load machines")
        return
      }
      setMachines(data ?? [])
    } catch {
      toast.error("Failed to load machines")
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchMachines()
  }, [fetchMachines])

  function handleEdit(machine: Machine) {
    setEditingMachine(machine)
    setOpen(true)
  }

  function handleAdd() {
    setEditingMachine(null)
    setOpen(true)
  }

  function handleSuccess(machine: Machine) {
    setOpen(false)
    setEditingMachine(null)
    setMachines((prev) => {
      const idx = prev.findIndex((m) => m.id === machine.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = machine
        return next
      }
      return [machine, ...prev]
    })
  }

  async function handleDelete() {
    if (!deletingMachine) return
    try {
      const { error } = await deleteMachine(deletingMachine.id)
      if (error) {
        toast.error("Failed to delete machine")
        return
      }
      setMachines((prev) => prev.filter((m) => m.id !== deletingMachine.id))
      toast.success("Machine deleted")
    } catch {
      toast.error("Failed to delete machine")
    } finally {
      setDeletingMachine(null)
    }
  }

  const columns: ColumnDef<Machine>[] = [
    {
      accessorKey: "machine_code",
      header: "Code",
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
          {row.original.machine_code}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-gray-900">{row.original.name}</p>
          {row.original.make && (
            <p className="text-xs text-gray-500">{row.original.make} {row.original.model ?? ""}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "machine_type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs capitalize">
          {MACHINE_TYPE_LABELS[row.original.machine_type] ?? row.original.machine_type}
        </Badge>
      ),
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.department}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const styles = STATUS_STYLES[row.original.status] ?? STATUS_STYLES.idle
        return (
          <Badge className={`${styles} border text-xs font-medium`}>
            {STATUS_LABELS[row.original.status] ?? row.original.status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "capacity_per_hour",
      header: "Capacity/hr",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.capacity_per_hour != null ? row.original.capacity_per_hour : "—"}
        </span>
      ),
    },
    {
      accessorKey: "next_service_due",
      header: "Next Service Due",
      cell: ({ row }) => {
        const date = row.original.next_service_due
        if (!date) return <span className="text-gray-400">—</span>
        const isOverdue = new Date(date) < new Date()
        return (
          <span className={`text-sm ${isOverdue ? "text-red-600 font-medium" : "text-gray-700"}`}>
            {new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        )
      },
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
              onClick={(e) => { e.stopPropagation(); setDeletingMachine(row.original) }}
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
        title="Machines"
        description="Manage machine and equipment master data"
        breadcrumb={[{ label: "Masters", href: "/masters" }, { label: "Machines" }]}
        actions={
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Machine
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={machines}
        loading={loading}
        searchKey="name"
        searchPlaceholder="Search by name or code..."
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { label: "Running", value: "running" },
              { label: "Idle", value: "idle" },
              { label: "Maintenance", value: "maintenance" },
              { label: "Breakdown", value: "breakdown" },
            ],
          },
        ]}
      />

      <FormSheet
        title={editingMachine ? "Edit Machine" : "Add Machine"}
        description={
          editingMachine
            ? `Editing ${editingMachine.name}`
            : "Register a new machine or equipment"
        }
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) setEditingMachine(null)
        }}
        size="md"
        footer={null}
      >
        <MachineForm
          companyId={companyId}
          machine={editingMachine}
          onSuccess={handleSuccess}
          onCancel={() => {
            setOpen(false)
            setEditingMachine(null)
          }}
        />
      </FormSheet>

      <AlertDialog open={!!deletingMachine} onOpenChange={(v) => !v && setDeletingMachine(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Machine</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingMachine?.name}</strong> ({deletingMachine?.machine_code})? This action
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
