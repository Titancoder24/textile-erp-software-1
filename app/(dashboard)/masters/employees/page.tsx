"use client"

import { useState, useEffect, useCallback } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, Plus, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { useCompany } from "@/contexts/company-context"
import { getEmployees, deleteEmployee } from "@/lib/actions/masters"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table/data-table"
import { FormSheet } from "@/components/forms/form-sheet"
import { EmployeeForm } from "@/components/forms/masters/employee-form"
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

type Employee = Database["public"]["Tables"]["employees"]["Row"]

const SKILL_GRADE_STYLES: Record<string, string> = {
  A: "bg-green-50 text-green-700 border-green-200",
  B: "bg-blue-50 text-blue-700 border-blue-200",
  C: "bg-amber-50 text-amber-700 border-amber-200",
  Trainee: "bg-purple-50 text-purple-700 border-purple-200",
}

const SHIFT_LABELS: Record<string, string> = {
  morning: "Morning",
  evening: "Evening",
  night: "Night",
}

export default function EmployeesPage() {
  const { companyId } = useCompany()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null)

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await getEmployees(companyId)
      if (error) {
        toast.error("Failed to load employees")
        return
      }
      setEmployees(data ?? [])
    } catch {
      toast.error("Failed to load employees")
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  function handleEdit(employee: Employee) {
    setEditingEmployee(employee)
    setOpen(true)
  }

  function handleAdd() {
    setEditingEmployee(null)
    setOpen(true)
  }

  function handleSuccess(employee: Employee) {
    setOpen(false)
    setEditingEmployee(null)
    setEmployees((prev) => {
      const idx = prev.findIndex((e) => e.id === employee.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = employee
        return next
      }
      return [employee, ...prev]
    })
  }

  async function handleDelete() {
    if (!deletingEmployee) return
    try {
      const { error } = await deleteEmployee(deletingEmployee.id)
      if (error) {
        toast.error("Failed to delete employee")
        return
      }
      setEmployees((prev) => prev.filter((e) => e.id !== deletingEmployee.id))
      toast.success("Employee deleted")
    } catch {
      toast.error("Failed to delete employee")
    } finally {
      setDeletingEmployee(null)
    }
  }

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "employee_code",
      header: "Code",
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
          {row.original.employee_code}
        </span>
      ),
    },
    {
      accessorKey: "full_name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-gray-900">{row.original.full_name}</p>
          {row.original.designation && (
            <p className="text-xs text-gray-500">{row.original.designation}</p>
          )}
        </div>
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
      accessorKey: "designation",
      header: "Designation",
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">{row.original.designation ?? "—"}</span>
      ),
    },
    {
      accessorKey: "skill_grade",
      header: "Skill Grade",
      cell: ({ row }) => {
        const grade = row.original.skill_grade
        if (!grade) return <span className="text-gray-400">—</span>
        const styles = SKILL_GRADE_STYLES[grade] ?? "bg-gray-50 text-gray-500 border-gray-200"
        return (
          <Badge className={`${styles} border text-xs font-medium`}>
            {grade}
          </Badge>
        )
      },
    },
    {
      accessorKey: "current_shift",
      header: "Shift",
      cell: ({ row }) => (
        <span className="text-sm capitalize">
          {row.original.current_shift ? (SHIFT_LABELS[row.original.current_shift] ?? row.original.current_shift) : "—"}
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
              onClick={(e) => { e.stopPropagation(); setDeletingEmployee(row.original) }}
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
        title="Employees"
        description="Manage employee master data, departments, and skill grades"
        breadcrumb={[{ label: "Masters", href: "/masters" }, { label: "Employees" }]}
        actions={
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={employees}
        loading={loading}
        searchKey="full_name"
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
      />

      <FormSheet
        title={editingEmployee ? "Edit Employee" : "Add Employee"}
        description={
          editingEmployee
            ? `Editing ${editingEmployee.full_name}`
            : "Register a new employee"
        }
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) setEditingEmployee(null)
        }}
        size="md"
        footer={null}
      >
        <EmployeeForm
          companyId={companyId}
          employee={editingEmployee}
          onSuccess={handleSuccess}
          onCancel={() => {
            setOpen(false)
            setEditingEmployee(null)
          }}
        />
      </FormSheet>

      <AlertDialog open={!!deletingEmployee} onOpenChange={(v) => !v && setDeletingEmployee(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingEmployee?.full_name}</strong> ({deletingEmployee?.employee_code})? This action
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
