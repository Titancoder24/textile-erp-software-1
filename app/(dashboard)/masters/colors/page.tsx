"use client"

import { useState, useEffect, useCallback } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, Plus, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { useCompany } from "@/contexts/company-context"
import { getColors, deleteColor } from "@/lib/actions/masters"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import { FormSheet } from "@/components/forms/form-sheet"
import { ColorForm } from "@/components/forms/masters/color-form"
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

type Color = Database["public"]["Tables"]["colors"]["Row"]

export default function ColorsPage() {
  const { companyId } = useCompany()
  const [colors, setColors] = useState<Color[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingColor, setEditingColor] = useState<Color | null>(null)
  const [deletingColor, setDeletingColor] = useState<Color | null>(null)

  const fetchColors = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await getColors(companyId)
      if (error) {
        toast.error("Failed to load colors")
        return
      }
      setColors(data ?? [])
    } catch {
      toast.error("Failed to load colors")
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchColors()
  }, [fetchColors])

  function handleEdit(color: Color) {
    setEditingColor(color)
    setOpen(true)
  }

  function handleAdd() {
    setEditingColor(null)
    setOpen(true)
  }

  function handleSuccess(color: Color) {
    setOpen(false)
    setEditingColor(null)
    setColors((prev) => {
      const idx = prev.findIndex((c) => c.id === color.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = color
        return next
      }
      return [color, ...prev]
    })
  }

  async function handleDelete() {
    if (!deletingColor) return
    try {
      const { error } = await deleteColor(deletingColor.id)
      if (error) {
        toast.error("Failed to delete color")
        return
      }
      setColors((prev) => prev.filter((c) => c.id !== deletingColor.id))
      toast.success("Color deleted")
    } catch {
      toast.error("Failed to delete color")
    } finally {
      setDeletingColor(null)
    }
  }

  const columns: ColumnDef<Color>[] = [
    {
      id: "swatch",
      header: "Swatch",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div
            className="h-7 w-7 rounded-full border border-gray-200 shadow-sm flex-shrink-0"
            style={{ backgroundColor: row.original.hex_code ?? "#e5e7eb" }}
            title={row.original.hex_code ?? "No color"}
          />
          <span className="font-mono text-xs text-gray-500">
            {row.original.hex_code ?? "—"}
          </span>
        </div>
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
        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: "pantone_ref",
      header: "Pantone Ref",
      cell: ({ row }) =>
        row.original.pantone_ref ? (
          <span className="text-sm text-gray-700">{row.original.pantone_ref}</span>
        ) : (
          <span className="text-gray-400">—</span>
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
              onClick={(e) => { e.stopPropagation(); setDeletingColor(row.original) }}
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
        title="Colors"
        description="Manage color library with Pantone references and hex codes"
        breadcrumb={[{ label: "Masters", href: "/masters" }, { label: "Colors" }]}
        actions={
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Color
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={colors}
        loading={loading}
        searchKey="name"
        searchPlaceholder="Search colors..."
      />

      <FormSheet
        title={editingColor ? "Edit Color" : "Add Color"}
        description="Define a color with its Pantone reference and hex code"
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) setEditingColor(null)
        }}
        size="sm"
        footer={null}
      >
        <ColorForm
          companyId={companyId}
          color={editingColor}
          onSuccess={handleSuccess}
          onCancel={() => {
            setOpen(false)
            setEditingColor(null)
          }}
        />
      </FormSheet>

      <AlertDialog open={!!deletingColor} onOpenChange={(v) => !v && setDeletingColor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Color</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingColor?.name}</strong>? This action
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
