"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { FormSheet } from "@/components/forms/form-sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ---------- Types ---------- */

interface CAPA {
  id: string;
  linkedInspection: string;
  defectType: string;
  rootCause: string;
  assignedTo: string;
  dueDate: string;
  status: "open" | "in_progress" | "completed" | "verified" | "closed";
}

/* ---------- Mock data ---------- */

const MOCK: CAPA[] = [
  {
    id: "CAPA-0012",
    linkedInspection: "INS-0040",
    defectType: "Shade variation",
    rootCause: "Incorrect dye bath temperature in batch B-114. Thermostat calibration drift identified.",
    assignedTo: "Dyeing Dept.",
    dueDate: "2026-03-05",
    status: "open",
  },
  {
    id: "CAPA-0011",
    linkedInspection: "INS-0035",
    defectType: "Broken stitch",
    rootCause: "Machine M-07 needle bar misalignment. Preventive maintenance schedule not followed.",
    assignedTo: "Maintenance",
    dueDate: "2026-02-28",
    status: "in_progress",
  },
  {
    id: "CAPA-0010",
    linkedInspection: "INS-0031",
    defectType: "Dropped stitch",
    rootCause: "Yarn tension inconsistency on circular knitting machine.",
    assignedTo: "Production Mgr.",
    dueDate: "2026-02-20",
    status: "completed",
  },
  {
    id: "CAPA-0009",
    linkedInspection: "INS-0028",
    defectType: "Needle hole",
    rootCause: "Incorrect needle gauge used for fabric type. Training gap identified.",
    assignedTo: "Sewing Supervisor",
    dueDate: "2026-02-15",
    status: "verified",
  },
  {
    id: "CAPA-0008",
    linkedInspection: "INS-0022",
    defectType: "Puckering",
    rootCause: "Thread tension not adjusted for lightweight fabric. SOP updated.",
    assignedTo: "Sewing Supervisor",
    dueDate: "2026-02-10",
    status: "closed",
  },
  {
    id: "CAPA-0007",
    linkedInspection: "INS-0019",
    defectType: "Open seam",
    rootCause: "Stitch density below spec on sleeve attachment.",
    assignedTo: "Quality Mgr.",
    dueDate: "2026-03-01",
    status: "open",
  },
];

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  completed: "Completed",
  verified: "Verified",
  closed: "Closed",
};

const STATUS_BADGE: Record<string, string> = {
  open: "bg-red-100 text-red-700 border border-red-200",
  in_progress: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  completed: "bg-blue-100 text-blue-700 border border-blue-200",
  verified: "bg-green-100 text-green-700 border border-green-200",
  closed: "bg-gray-100 text-gray-600 border border-gray-200",
};

/* ---------- Columns ---------- */

function buildColumns(): ColumnDef<CAPA>[] {
  return [
    {
      accessorKey: "id",
      header: "CAPA #",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">{row.original.id}</span>
      ),
    },
    {
      accessorKey: "linkedInspection",
      header: "Linked Inspection",
      cell: ({ row }) => (
        <a
          href={`/quality/inspections/${row.original.linkedInspection}`}
          className="text-blue-600 hover:underline text-sm"
        >
          {row.original.linkedInspection}
        </a>
      ),
    },
    { accessorKey: "defectType", header: "Defect Type" },
    {
      accessorKey: "rootCause",
      header: "Root Cause",
      cell: ({ row }) => (
        <span
          className="block max-w-xs truncate text-sm text-gray-600"
          title={row.original.rootCause}
        >
          {row.original.rootCause}
        </span>
      ),
    },
    { accessorKey: "assignedTo", header: "Assigned To" },
    { accessorKey: "dueDate", header: "Due Date" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[row.original.status]}`}
        >
          {STATUS_LABELS[row.original.status]}
        </span>
      ),
    },
  ];
}

/* ---------- New CAPA Form ---------- */

function NewCAPAForm() {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>Linked Inspection</Label>
        <Input placeholder="INS-XXXX" />
      </div>
      <div className="space-y-1.5">
        <Label>Defect Type</Label>
        <Input placeholder="e.g. Broken stitch" />
      </div>
      <div className="space-y-1.5">
        <Label>Root Cause Analysis</Label>
        <textarea
          rows={4}
          placeholder="Describe the root cause identified..."
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Corrective Action</Label>
        <textarea
          rows={3}
          placeholder="Describe the corrective action planned..."
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Preventive Action</Label>
        <textarea
          rows={3}
          placeholder="Describe the preventive action to avoid recurrence..."
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Assigned To</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quality">Quality Dept.</SelectItem>
              <SelectItem value="production">Production Mgr.</SelectItem>
              <SelectItem value="dyeing">Dyeing Dept.</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="sewing">Sewing Supervisor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Due Date</Label>
          <Input type="date" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Priority</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

export default function CAPAPage() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const columns = buildColumns();

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="CAPA"
        description="Corrective and Preventive Action tracking for quality non-conformances."
        breadcrumb={[
          { label: "Quality", href: "/quality" },
          { label: "CAPA" },
        ]}
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New CAPA
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={MOCK}
        searchKey="defectType"
        searchPlaceholder="Search by defect type..."
        filters={[
          {
            key: "status",
            label: "Status",
            options: Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })),
          },
        ]}
        onRowClick={(row) => router.push(`/quality/capa/${row.id}`)}
        emptyMessage="No CAPAs recorded yet."
        actions={
          <Button onClick={() => setOpen(true)} size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            New CAPA
          </Button>
        }
      />

      <FormSheet
        title="New CAPA"
        description="Create a corrective and preventive action record."
        open={open}
        onOpenChange={setOpen}
        onSave={handleSave}
        saving={saving}
        saveLabel="Create CAPA"
        size="md"
      >
        <NewCAPAForm />
      </FormSheet>
    </div>
  );
}
