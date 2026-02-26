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

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "e1", company_id: "c1", employee_code: "EMP-001", full_name: "Ramesh Kumar",
    department: "Sewing", designation: "Sewing Operator", phone: "+91 98765 43210",
    email: "ramesh@example.com", date_of_joining: "2022-04-01", skill_grade: "A",
    skills: ["lockstitch", "overlock"], current_shift: "morning", is_active: true,
    created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "e2", company_id: "c1", employee_code: "EMP-002", full_name: "Suresh Yadav",
    department: "Cutting", designation: "Cutting Master", phone: "+91 98765 43211",
    email: null, date_of_joining: "2021-01-15", skill_grade: "A",
    skills: ["spreading", "cutting"], current_shift: "morning", is_active: true,
    created_at: "2024-01-02T00:00:00Z", updated_at: "2024-01-02T00:00:00Z",
  },
  {
    id: "e3", company_id: "c1", employee_code: "EMP-003", full_name: "Priya Sharma",
    department: "Quality", designation: "QC Inspector", phone: "+91 98765 43212",
    email: "priya@example.com", date_of_joining: "2023-07-01", skill_grade: "B",
    skills: ["inspection", "measurement"], current_shift: "morning", is_active: true,
    created_at: "2024-01-03T00:00:00Z", updated_at: "2024-01-03T00:00:00Z",
  },
  {
    id: "e4", company_id: "c1", employee_code: "EMP-004", full_name: "Mohan Lal",
    department: "Dyeing", designation: "Dyeing Operator", phone: "+91 98765 43213",
    email: null, date_of_joining: "2023-11-10", skill_grade: "Trainee",
    skills: [], current_shift: "evening", is_active: true,
    created_at: "2024-01-04T00:00:00Z", updated_at: "2024-01-04T00:00:00Z",
  },
  {
    id: "e5", company_id: "c1", employee_code: "EMP-005", full_name: "Anjali Devi",
    department: "Finishing", designation: "Pressing Operator", phone: null,
    email: null, date_of_joining: "2020-03-01", skill_grade: "C",
    skills: ["pressing", "folding"], current_shift: "morning", is_active: false,
    created_at: "2024-01-05T00:00:00Z", updated_at: "2024-01-05T00:00:00Z",
  },
]

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null)

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 300))
      setEmployees(MOCK_EMPLOYEES)
    } catch {
      toast.error("Failed to load employees")
    } finally {
      setLoading(false)
    }
  }, [])

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
      await new Promise((r) => setTimeout(r, 400))
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
