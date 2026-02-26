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

const MOCK_MACHINES: Machine[] = [
  {
    id: "m1", company_id: "c1", name: "Juki DDL-8700", machine_code: "SEW-001",
    machine_type: "sewing", department: "Sewing", location_id: null,
    make: "Juki", model: "DDL-8700", serial_number: "JK2024001234",
    capacity_per_hour: 60, status: "running", purchase_date: "2023-03-15",
    last_serviced_at: "2024-11-01", next_service_due: "2025-02-01",
    created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "m2", company_id: "c1", name: "Brother Overlock S-7300A", machine_code: "OVL-003",
    machine_type: "overlock", department: "Sewing", location_id: null,
    make: "Brother", model: "S-7300A", serial_number: "BR2024005678",
    capacity_per_hour: 50, status: "running", purchase_date: "2023-05-20",
    last_serviced_at: "2024-10-15", next_service_due: "2025-01-15",
    created_at: "2024-01-02T00:00:00Z", updated_at: "2024-01-02T00:00:00Z",
  },
  {
    id: "m3", company_id: "c1", name: "Gerber Spreader XLS-50", machine_code: "SPR-001",
    machine_type: "spreading", department: "Cutting", location_id: null,
    make: "Gerber", model: "XLS-50", serial_number: null,
    capacity_per_hour: 120, status: "idle", purchase_date: "2022-09-10",
    last_serviced_at: null, next_service_due: null,
    created_at: "2024-01-03T00:00:00Z", updated_at: "2024-01-03T00:00:00Z",
  },
  {
    id: "m4", company_id: "c1", name: "Fong's Jet Dyeing THEN:S", machine_code: "DYE-002",
    machine_type: "dyeing", department: "Dyeing", location_id: null,
    make: "Fong's", model: "THEN:S", serial_number: "FG2023009876",
    capacity_per_hour: 200, status: "maintenance", purchase_date: "2021-12-01",
    last_serviced_at: "2024-12-01", next_service_due: "2025-03-01",
    created_at: "2024-01-04T00:00:00Z", updated_at: "2024-01-04T00:00:00Z",
  },
  {
    id: "m5", company_id: "c1", name: "Eastman Straight Knife", machine_code: "CUT-005",
    machine_type: "cutting", department: "Cutting", location_id: null,
    make: "Eastman", model: "Brute", serial_number: null,
    capacity_per_hour: 80, status: "breakdown", purchase_date: "2020-06-15",
    last_serviced_at: "2024-08-20", next_service_due: "2024-11-20",
    created_at: "2024-01-05T00:00:00Z", updated_at: "2024-01-05T00:00:00Z",
  },
]

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null)
  const [deletingMachine, setDeletingMachine] = useState<Machine | null>(null)

  const fetchMachines = useCallback(async () => {
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 300))
      setMachines(MOCK_MACHINES)
    } catch {
      toast.error("Failed to load machines")
    } finally {
      setLoading(false)
    }
  }, [])

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
      await new Promise((r) => setTimeout(r, 400))
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
