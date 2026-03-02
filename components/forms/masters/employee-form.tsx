"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createEmployee, updateEmployee } from "@/lib/actions/masters"
import type { Database } from "@/types/database"

type Employee = Database["public"]["Tables"]["employees"]["Row"]

const DEPARTMENTS = [
  "Merchandising", "Production", "Cutting", "Sewing", "Finishing",
  "Quality", "Store", "Dyeing", "Shipping", "Accounts", "HR", "Maintenance",
]

const SKILL_GRADES = [
  { value: "A", label: "Grade A" },
  { value: "B", label: "Grade B" },
  { value: "C", label: "Grade C" },
  { value: "Trainee", label: "Trainee" },
]

const SHIFTS = [
  { value: "morning", label: "Morning" },
  { value: "evening", label: "Evening" },
  { value: "night", label: "Night" },
]

const employeeSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  employee_code: z.string().min(1, "Employee code is required").max(20),
  department: z.string().min(1, "Department is required"),
  designation: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  date_of_joining: z.string().optional(),
  skill_grade: z.string().optional().nullable(),
  current_shift: z.string().optional().nullable(),
  is_active: z.boolean(),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

interface EmployeeFormProps {
  employee?: Employee | null
  companyId: string
  onSuccess: (employee: Employee) => void
  onCancel?: () => void
}

export function EmployeeForm({ employee, companyId, onSuccess, onCancel }: EmployeeFormProps) {
  const isEdit = !!employee

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      full_name: "",
      employee_code: "",
      department: "",
      designation: "",
      phone: "",
      email: "",
      date_of_joining: "",
      skill_grade: null,
      current_shift: null,
      is_active: true,
    },
  })

  useEffect(() => {
    if (employee) {
      reset({
        full_name: employee.full_name,
        employee_code: employee.employee_code,
        department: employee.department,
        designation: employee.designation ?? "",
        phone: employee.phone ?? "",
        email: employee.email ?? "",
        date_of_joining: employee.date_of_joining ?? "",
        skill_grade: employee.skill_grade ?? null,
        current_shift: employee.current_shift ?? null,
        is_active: employee.is_active,
      })
    }
  }, [employee, reset])

  const department = watch("department")
  const skillGrade = watch("skill_grade")
  const currentShift = watch("current_shift")
  const isActive = watch("is_active")

  async function onSubmit(values: EmployeeFormValues) {
    try {
      const payload = {
        full_name: values.full_name,
        employee_code: values.employee_code,
        department: values.department,
        designation: values.designation || null,
        phone: values.phone || null,
        email: values.email || null,
        date_of_joining: values.date_of_joining || null,
        skill_grade: values.skill_grade || null,
        current_shift: values.current_shift || null,
        is_active: values.is_active,
      }

      if (isEdit && employee) {
        const { data: result, error } = await updateEmployee(employee.id, payload)
        if (error) throw new Error(error)
        toast.success("Employee updated successfully")
        onSuccess(result!)
      } else {
        const { data: result, error } = await createEmployee({ ...payload, company_id: companyId })
        if (error) throw new Error(error)
        toast.success("Employee created successfully")
        onSuccess(result!)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save employee. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name & Code */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="emp-name">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="emp-name"
            placeholder="e.g. Ramesh Kumar"
            {...register("full_name")}
            className={errors.full_name ? "border-red-400" : ""}
          />
          {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="emp-code">
            Employee Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="emp-code"
            placeholder="e.g. EMP-001"
            {...register("employee_code")}
            className={errors.employee_code ? "border-red-400" : ""}
          />
          {errors.employee_code && <p className="text-xs text-red-500">{errors.employee_code.message}</p>}
        </div>
      </div>

      {/* Department & Designation */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>
            Department <span className="text-red-500">*</span>
          </Label>
          <Select value={department} onValueChange={(v) => setValue("department", v)}>
            <SelectTrigger className={errors.department ? "border-red-400" : ""}>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.department && <p className="text-xs text-red-500">{errors.department.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="emp-designation">Designation</Label>
          <Input
            id="emp-designation"
            placeholder="e.g. Sewing Operator"
            {...register("designation")}
          />
        </div>
      </div>

      {/* Phone & Email */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="emp-phone">Phone</Label>
          <Input id="emp-phone" placeholder="+91 99999 00000" {...register("phone")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="emp-email">Email</Label>
          <Input
            id="emp-email"
            type="email"
            placeholder="employee@example.com"
            {...register("email")}
            className={errors.email ? "border-red-400" : ""}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>
      </div>

      {/* Date of Joining */}
      <div className="space-y-1.5">
        <Label htmlFor="emp-doj">Date of Joining</Label>
        <Input id="emp-doj" type="date" {...register("date_of_joining")} />
      </div>

      {/* Skill Grade & Shift */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Skill Grade</Label>
          <Select
            value={skillGrade || "none"}
            onValueChange={(v) => setValue("skill_grade", v === "none" ? null : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not assigned</SelectItem>
              {SKILL_GRADES.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Current Shift</Label>
          <Select
            value={currentShift || "none"}
            onValueChange={(v) => setValue("current_shift", v === "none" ? null : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select shift" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not assigned</SelectItem>
              {SHIFTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select
          value={isActive ? "active" : "inactive"}
          onValueChange={(v) => setValue("is_active", v === "active")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Update Employee" : "Create Employee"}
        </Button>
      </div>
    </form>
  )
}
