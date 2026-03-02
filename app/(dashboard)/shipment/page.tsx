"use client";

import * as React from "react";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Ship,
  Plus,
  FileText,
  MapPin,
  Calendar,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { cn, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import type { StatusConfig } from "@/components/ui/status-badge";
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
import { useCompany } from "@/contexts/company-context";
import { getShipments, createShipment } from "@/lib/actions/shipment";
import { getBuyers } from "@/lib/actions/buyers";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Shipment {
  id: string;
  shipment_number: string;
  buyer_name: string;
  buyer_id: string;
  order_ids: string[];
  container_number: string | null;
  container_type: string;
  planned_shipment_date: string;
  etd: string | null;
  eta: string | null;
  port_of_loading: string | null;
  port_of_discharge: string | null;
  vessel_name: string | null;
  total_cartons: number;
  total_pieces: number;
  status: "packing" | "ready" | "in_transit" | "delivered" | "delayed";
  production_complete: boolean;
  qc_passed: boolean;
  packing_done: boolean;
  documents_ready: boolean;
  transport_arranged: boolean;
}

interface Buyer {
  id: string;
  name: string;
  code: string;
}

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const SHIPMENT_STATUS_MAP: Record<string, StatusConfig> = {
  packing: { label: "Packing", color: "gray" },
  ready: { label: "Ready to Ship", color: "blue" },
  in_transit: { label: "In Transit", color: "amber" },
  delivered: { label: "Delivered", color: "green" },
  delayed: { label: "Delayed", color: "red" },
};

// ---------------------------------------------------------------------------
// Checklist helpers
// ---------------------------------------------------------------------------

function checklistCompletion(shipment: Shipment): number {
  const items = [
    shipment.production_complete,
    shipment.qc_passed,
    shipment.packing_done,
    shipment.documents_ready,
    shipment.transport_arranged,
  ];
  const done = items.filter(Boolean).length;
  return Math.round((done / items.length) * 100);
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

function buildColumns(
  onSelect: (shipment: Shipment) => void
): ColumnDef<Shipment>[] {
  return [
    {
      accessorKey: "shipment_number",
      header: "Shipment #",
      cell: ({ row }) => (
        <button
          onClick={() => onSelect(row.original)}
          className="font-mono text-sm font-semibold text-blue-600 hover:underline"
        >
          {row.original.shipment_number}
        </button>
      ),
    },
    {
      accessorKey: "buyer_name",
      header: "Buyer",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-900">
          {row.original.buyer_name}
        </span>
      ),
    },
    {
      id: "orders",
      header: "Orders",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {(row.original.order_ids ?? []).map((o) => (
            <span
              key={o}
              className="inline-block bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded font-mono"
            >
              {o}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "container_number",
      header: "Container #",
      cell: ({ row }) =>
        row.original.container_number ? (
          <span className="font-mono text-xs text-gray-700">
            {row.original.container_number}
            <span className="ml-1.5 text-gray-400">
              ({row.original.container_type})
            </span>
          </span>
        ) : (
          <span className="text-gray-400 text-xs italic">Not assigned</span>
        ),
    },
    {
      accessorKey: "planned_shipment_date",
      header: "Planned Ship",
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">
          {formatDate(row.original.planned_shipment_date)}
        </span>
      ),
    },
    {
      accessorKey: "etd",
      header: "ETD",
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">
          {row.original.etd ? formatDate(row.original.etd) : "-"}
        </span>
      ),
    },
    {
      accessorKey: "eta",
      header: "ETA",
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">
          {row.original.eta ? formatDate(row.original.eta) : "-"}
        </span>
      ),
    },
    {
      id: "checklist",
      header: "Checklist",
      cell: ({ row }) => {
        const pct = checklistCompletion(row.original);
        return (
          <div className="flex items-center gap-2 min-w-[100px]">
            <Progress
              value={pct}
              className={cn(
                "h-1.5 w-16",
                pct === 100 ? "[&>div]:bg-green-500" : "[&>div]:bg-blue-500"
              )}
            />
            <span
              className={cn(
                "text-xs font-semibold tabular-nums",
                pct === 100 ? "text-green-600" : "text-gray-500"
              )}
            >
              {pct}%
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.status}
          statusMap={SHIPMENT_STATUS_MAP}
        />
      ),
    },
    {
      id: "action",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelect(row.original)}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </Button>
      ),
    },
  ];
}

// ---------------------------------------------------------------------------
// Checklist Item Component
// ---------------------------------------------------------------------------

function ChecklistItem({
  label,
  checked,
  icon,
}: {
  label: string;
  checked: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 transition-colors",
        checked
          ? "border-green-200 bg-green-50"
          : "border-gray-200 bg-white"
      )}
    >
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
          checked ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"
        )}
      >
        {checked ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Clock className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            "text-sm font-medium",
            checked ? "text-green-700" : "text-gray-600"
          )}
        >
          {label}
        </span>
      </div>
      {icon && (
        <div className={cn("text-sm", checked ? "text-green-500" : "text-gray-300")}>
          {icon}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// New Shipment Form
// ---------------------------------------------------------------------------

interface NewShipmentFormState {
  buyer_id: string;
  orders: string;
  containerNumber: string;
  containerType: string;
  plannedDate: string;
  portOfLoading: string;
  portOfDischarge: string;
  vesselName: string;
}

const FORM_DEFAULTS: NewShipmentFormState = {
  buyer_id: "",
  orders: "",
  containerNumber: "",
  containerType: "40ft",
  plannedDate: "",
  portOfLoading: "",
  portOfDischarge: "",
  vesselName: "",
};

const PORTS = [
  "INNSA (Nhava Sheva)",
  "INMAA (Chennai)",
  "INMUN (Mundra)",
  "INKOL (Kolkata)",
  "INBLR (Bangalore)",
];

function NewShipmentForm({
  form,
  onChange,
  buyers,
}: {
  form: NewShipmentFormState;
  onChange: (field: keyof NewShipmentFormState, value: string) => void;
  buyers: Buyer[];
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="buyer">Buyer *</Label>
        <Select value={form.buyer_id} onValueChange={(v) => onChange("buyer_id", v)}>
          <SelectTrigger id="buyer">
            <SelectValue placeholder="Select buyer..." />
          </SelectTrigger>
          <SelectContent>
            {buyers.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="orders">Order Numbers</Label>
        <Input
          id="orders"
          placeholder="e.g. ORD-2026-0012, ORD-2026-0013"
          value={form.orders}
          onChange={(e) => onChange("orders", e.target.value)}
        />
        <p className="text-xs text-gray-500">Separate multiple orders with commas</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="containerNumber">Container Number</Label>
          <Input
            id="containerNumber"
            placeholder="e.g. MSCU7823410"
            value={form.containerNumber}
            onChange={(e) => onChange("containerNumber", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="containerType">Container Type</Label>
          <Select
            value={form.containerType}
            onValueChange={(v) => onChange("containerType", v)}
          >
            <SelectTrigger id="containerType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20ft">20ft Standard</SelectItem>
              <SelectItem value="40ft">40ft Standard</SelectItem>
              <SelectItem value="40HC">40ft High Cube</SelectItem>
              <SelectItem value="45HC">45ft High Cube</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="plannedDate">Planned Ship Date *</Label>
        <Input
          id="plannedDate"
          type="date"
          value={form.plannedDate}
          onChange={(e) => onChange("plannedDate", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="portOfLoading">Port of Loading</Label>
        <Select
          value={form.portOfLoading}
          onValueChange={(v) => onChange("portOfLoading", v)}
        >
          <SelectTrigger id="portOfLoading">
            <SelectValue placeholder="Select port..." />
          </SelectTrigger>
          <SelectContent>
            {PORTS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="portOfDischarge">Port of Discharge</Label>
        <Input
          id="portOfDischarge"
          placeholder="e.g. DEHAM (Hamburg)"
          value={form.portOfDischarge}
          onChange={(e) => onChange("portOfDischarge", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="vesselName">Vessel Name</Label>
        <Input
          id="vesselName"
          placeholder="e.g. MSC DIANA"
          value={form.vesselName}
          onChange={(e) => onChange("vesselName", e.target.value)}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ShipmentPage() {
  const { companyId, userId } = useCompany();
  const [selectedShipment, setSelectedShipment] =
    React.useState<Shipment | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [form, setForm] = React.useState<NewShipmentFormState>(FORM_DEFAULTS);
  const [saving, setSaving] = React.useState(false);
  const [shipments, setShipments] = React.useState<Shipment[]>([]);
  const [buyers, setBuyers] = React.useState<Buyer[]>([]);
  const [loading, setLoading] = React.useState(true);

  // ---- Fetch shipments from Supabase ----
  const fetchShipments = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await getShipments(companyId);
      if (error) {
        toast.error("Failed to load shipments");
        return;
      }
      const mapped: Shipment[] = (data ?? []).map((s: Record<string, unknown>) => ({
        id: s.id as string,
        shipment_number: s.shipment_number as string,
        buyer_name:
          (s.buyers as Record<string, unknown>)?.name as string ?? "Unknown",
        buyer_id: s.buyer_id as string,
        order_ids: (s.order_ids as string[]) ?? [],
        container_number: (s.container_number as string | null) ?? null,
        container_type: (s.container_type as string) ?? "40ft",
        planned_shipment_date: s.planned_shipment_date as string,
        etd: (s.etd as string | null) ?? null,
        eta: (s.eta as string | null) ?? null,
        port_of_loading: (s.port_of_loading as string | null) ?? null,
        port_of_discharge: (s.port_of_discharge as string | null) ?? null,
        vessel_name: (s.vessel_name as string | null) ?? null,
        total_cartons: (s.total_cartons as number) ?? 0,
        total_pieces: (s.total_pieces as number) ?? 0,
        status: s.status as Shipment["status"],
        production_complete: (s.production_complete as boolean) ?? false,
        qc_passed: (s.qc_passed as boolean) ?? false,
        packing_done: (s.packing_done as boolean) ?? false,
        documents_ready: (s.documents_ready as boolean) ?? false,
        transport_arranged: (s.transport_arranged as boolean) ?? false,
      }));
      setShipments(mapped);
      // Auto-select first shipment if none selected
      if (mapped.length > 0 && !selectedShipment) {
        setSelectedShipment(mapped[0]);
      }
    } catch {
      toast.error("Failed to load shipments");
    } finally {
      setLoading(false);
    }
  }, [companyId, selectedShipment]);

  // ---- Fetch buyers for the form dropdown ----
  const fetchBuyers = React.useCallback(async () => {
    try {
      const { data, error } = await getBuyers(companyId);
      if (error) return;
      const mapped: Buyer[] = (data ?? []).map((b: Record<string, unknown>) => ({
        id: b.id as string,
        name: b.name as string,
        code: b.code as string,
      }));
      setBuyers(mapped);
    } catch {
      // silent - buyers are supplementary
    }
  }, [companyId]);

  React.useEffect(() => {
    fetchShipments();
    fetchBuyers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = React.useMemo(
    () => buildColumns(setSelectedShipment),
    []
  );

  // Stats
  const total = shipments.length;
  const readyToShip = shipments.filter((s) => s.status === "ready").length;
  const inTransit = shipments.filter((s) => s.status === "in_transit").length;
  const deliveredThisMonth = shipments.filter(
    (s) => s.status === "delivered"
  ).length;
  const delayed = shipments.filter((s) => s.status === "delayed").length;

  const STAT_CARDS = [
    {
      title: "Total Shipments",
      value: total,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Ready to Ship",
      value: readyToShip,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "In Transit",
      value: inTransit,
      icon: Ship,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Delivered This Month",
      value: deliveredThisMonth,
      icon: Truck,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  function handleFormChange(
    field: keyof NewShipmentFormState,
    value: string
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!form.buyer_id || !form.plannedDate) return;
    setSaving(true);
    try {
      const { data, error } = await createShipment({
        company_id: companyId,
        buyer_id: form.buyer_id,
        planned_shipment_date: form.plannedDate,
        container_number: form.containerNumber || undefined,
        container_type: form.containerType || "40ft",
        port_of_loading: form.portOfLoading || undefined,
        port_of_discharge: form.portOfDischarge || undefined,
        vessel_name: form.vesselName || undefined,
        order_ids: form.orders
          ? form.orders.split(",").map((o) => o.trim()).filter(Boolean)
          : [],
        created_by: userId,
      });
      if (error) {
        toast.error(error);
        return;
      }
      toast.success("Shipment created successfully");
      setCreateOpen(false);
      setForm(FORM_DEFAULTS);
      // Refresh the list
      await fetchShipments();
      // Select the newly created shipment
      if (data) {
        const newMapped: Shipment = {
          id: data.id as string,
          shipment_number: data.shipment_number as string,
          buyer_name:
            (data.buyers as Record<string, unknown>)?.name as string ?? "Unknown",
          buyer_id: data.buyer_id as string,
          order_ids: (data.order_ids as string[]) ?? [],
          container_number: (data.container_number as string | null) ?? null,
          container_type: (data.container_type as string) ?? "40ft",
          planned_shipment_date: data.planned_shipment_date as string,
          etd: (data.etd as string | null) ?? null,
          eta: (data.eta as string | null) ?? null,
          port_of_loading: (data.port_of_loading as string | null) ?? null,
          port_of_discharge: (data.port_of_discharge as string | null) ?? null,
          vessel_name: (data.vessel_name as string | null) ?? null,
          total_cartons: (data.total_cartons as number) ?? 0,
          total_pieces: (data.total_pieces as number) ?? 0,
          status: data.status as Shipment["status"],
          production_complete: (data.production_complete as boolean) ?? false,
          qc_passed: (data.qc_passed as boolean) ?? false,
          packing_done: (data.packing_done as boolean) ?? false,
          documents_ready: (data.documents_ready as boolean) ?? false,
          transport_arranged: (data.transport_arranged as boolean) ?? false,
        };
        setSelectedShipment(newMapped);
      }
    } catch {
      toast.error("Failed to create shipment");
    } finally {
      setSaving(false);
    }
  }

  const pct = selectedShipment ? checklistCompletion(selectedShipment) : 0;

  // Build buyer filter options dynamically from data
  const buyerFilterOptions = React.useMemo(() => {
    const unique = [...new Set(shipments.map((s) => s.buyer_name))].sort();
    return unique.map((b) => ({ label: b, value: b }));
  }, [shipments]);

  const FILTERS = [
    {
      key: "buyer_name",
      label: "Buyer",
      options: buyerFilterOptions,
    },
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Packing", value: "packing" },
        { label: "Ready to Ship", value: "ready" },
        { label: "In Transit", value: "in_transit" },
        { label: "Delivered", value: "delivered" },
        { label: "Delayed", value: "delayed" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <PageHeader
        title="Shipment Tracker"
        description="Track containers from packing to delivery. Monitor pre-shipment checklists and vessel schedules."
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Shipment Tracker" }]}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Shipment
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 leading-tight">
                    {card.title}
                  </p>
                  <p className="mt-1 text-2xl font-black tabular-nums text-gray-900">
                    {card.value}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    card.bg
                  )}
                >
                  <card.icon className={cn("h-5 w-5", card.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content: Table + Checklist Sidebar */}
      <div className="flex gap-6 items-start">
        {/* Left: Table */}
        <div className="flex-1 min-w-0">
          <Card>
            <CardContent className="p-0">
              <DataTable
                columns={columns}
                data={shipments}
                searchKey="shipment_number"
                searchPlaceholder="Search shipment number..."
                filters={FILTERS}
                onRowClick={setSelectedShipment}
                loading={loading}
                emptyMessage="No shipments found. Create your first shipment."
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: Pre-Shipment Checklist */}
        <div className="w-72 shrink-0">
          <Card className="sticky top-6">
            <CardContent className="p-0">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Pre-Shipment Checklist
                    </h3>
                    {selectedShipment ? (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {selectedShipment.shipment_number} &mdash;{" "}
                        {selectedShipment.buyer_name}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Select a shipment row
                      </p>
                    )}
                  </div>
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      pct === 100
                        ? "bg-green-100 text-green-700"
                        : pct >= 60
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {pct}%
                  </div>
                </div>

                {selectedShipment && (
                  <div className="mt-3">
                    <Progress
                      value={pct}
                      className={cn(
                        "h-2",
                        pct === 100
                          ? "[&>div]:bg-green-500"
                          : "[&>div]:bg-blue-500"
                      )}
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      {[
                        selectedShipment.production_complete,
                        selectedShipment.qc_passed,
                        selectedShipment.packing_done,
                        selectedShipment.documents_ready,
                        selectedShipment.transport_arranged,
                      ].filter(Boolean).length}{" "}
                      of 5 tasks complete
                    </p>
                  </div>
                )}
              </div>

              {/* Checklist Items */}
              <div className="p-3 space-y-2">
                {selectedShipment ? (
                  <>
                    <ChecklistItem
                      label="Production Complete"
                      checked={selectedShipment.production_complete}
                      icon={<Package className="h-4 w-4" />}
                    />
                    <ChecklistItem
                      label="QC Passed"
                      checked={selectedShipment.qc_passed}
                      icon={<CheckCircle2 className="h-4 w-4" />}
                    />
                    <ChecklistItem
                      label="Packing Done"
                      checked={selectedShipment.packing_done}
                      icon={<Package className="h-4 w-4" />}
                    />
                    <ChecklistItem
                      label="Documents Ready"
                      checked={selectedShipment.documents_ready}
                      icon={<FileText className="h-4 w-4" />}
                    />
                    <ChecklistItem
                      label="Transport Arranged"
                      checked={selectedShipment.transport_arranged}
                      icon={<Truck className="h-4 w-4" />}
                    />
                  </>
                ) : (
                  <div className="py-8 text-center text-sm text-gray-400">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    Click any shipment row to view its checklist
                  </div>
                )}
              </div>

              {/* Shipment Details footer */}
              {selectedShipment && (
                <div className="border-t border-gray-100 p-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span className="truncate">
                      {selectedShipment.port_of_loading || "Port TBD"}
                    </span>
                    <ChevronRight className="h-3 w-3 text-gray-300 shrink-0" />
                    <span className="truncate">
                      {selectedShipment.port_of_discharge || "Port TBD"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span>
                      ETD {selectedShipment.etd ? formatDate(selectedShipment.etd) : "TBD"}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span>
                      ETA {selectedShipment.eta ? formatDate(selectedShipment.eta) : "TBD"}
                    </span>
                  </div>
                  {selectedShipment.vessel_name && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Ship className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <span>{selectedShipment.vessel_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Package className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span>
                      {selectedShipment.total_cartons.toLocaleString()} ctns /{" "}
                      {selectedShipment.total_pieces.toLocaleString()} pcs
                    </span>
                  </div>

                  {delayed > 0 && selectedShipment.status === "delayed" && (
                    <div className="mt-2 flex items-center gap-1.5 rounded-md bg-red-50 border border-red-200 px-2.5 py-1.5 text-xs text-red-700">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      Shipment is delayed. Action required.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Shipment Sheet */}
      <FormSheet
        title="New Shipment"
        description="Create a new export shipment and assign orders to a container."
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSave={handleSave}
        saveLabel="Create Shipment"
        saving={saving}
        size="md"
      >
        <NewShipmentForm form={form} onChange={handleFormChange} buyers={buyers} />
      </FormSheet>
    </div>
  );
}
