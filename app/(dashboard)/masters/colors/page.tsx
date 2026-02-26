"use client"

import { useState, useEffect, useCallback } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, Plus, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

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

const MOCK_COLORS: Color[] = [
  { id: "col1", company_id: "c1", name: "Royal Blue", code: "RBLUE", pantone_ref: "Pantone 286 C", hex_code: "#2563EB", created_at: "2024-01-01T00:00:00Z" },
  { id: "col2", company_id: "c1", name: "Scarlet Red", code: "SRED", pantone_ref: "Pantone 1797 C", hex_code: "#DC2626", created_at: "2024-01-02T00:00:00Z" },
  { id: "col3", company_id: "c1", name: "Forest Green", code: "FGRN", pantone_ref: "Pantone 357 C", hex_code: "#16A34A", created_at: "2024-01-03T00:00:00Z" },
  { id: "col4", company_id: "c1", name: "Ivory White", code: "IVWH", pantone_ref: "Pantone 9141 C", hex_code: "#FAFAF9", created_at: "2024-01-04T00:00:00Z" },
  { id: "col5", company_id: "c1", name: "Charcoal Grey", code: "CGRY", pantone_ref: "Pantone 431 C", hex_code: "#374151", created_at: "2024-01-05T00:00:00Z" },
  { id: "col6", company_id: "c1", name: "Sunflower Yellow", code: "SYEL", pantone_ref: "Pantone 012 C", hex_code: "#EAB308", created_at: "2024-01-06T00:00:00Z" },
  { id: "col7", company_id: "c1", name: "Dusty Pink", code: "DPNK", pantone_ref: "Pantone 210 C", hex_code: "#F9A8D4", created_at: "2024-01-07T00:00:00Z" },
  { id: "col8", company_id: "c1", name: "Navy", code: "NAVY", pantone_ref: "Pantone 289 C", hex_code: "#1E3A5F", created_at: "2024-01-08T00:00:00Z" },
]

export default function ColorsPage() {
  const [colors, setColors] = useState<Color[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingColor, setEditingColor] = useState<Color | null>(null)
  const [deletingColor, setDeletingColor] = useState<Color | null>(null)

  const fetchColors = useCallback(async () => {
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 300))
      setColors(MOCK_COLORS)
    } catch {
      toast.error("Failed to load colors")
    } finally {
      setLoading(false)
    }
  }, [])

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
      await new Promise((r) => setTimeout(r, 400))
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
