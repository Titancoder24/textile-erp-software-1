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
// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Shipment {
  id: string;
  shipmentNumber: string;
  buyer: string;
  orders: string[];
  containerNumber: string;
  containerType: string;
  plannedShipDate: string;
  etd: string;
  eta: string;
  portOfLoading: string;
  portOfDischarge: string;
  vesselName: string;
  totalCartons: number;
  totalPieces: number;
  status: "packing" | "ready" | "in_transit" | "delivered" | "delayed";
  productionComplete: boolean;
  qcPassed: boolean;
  packingDone: boolean;
  documentsReady: boolean;
  transportArranged: boolean;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_SHIPMENTS: Shipment[] = [
  {
    id: "1",
    shipmentNumber: "SHP-2026-0041",
    buyer: "H&M",
    orders: ["ORD-2026-0012", "ORD-2026-0011"],
    containerNumber: "MSCU7823410",
    containerType: "40ft",
    plannedShipDate: "2026-03-05",
    etd: "2026-03-06",
    eta: "2026-03-28",
    portOfLoading: "INNSA (Nhava Sheva)",
    portOfDischarge: "DEHAM (Hamburg)",
    vesselName: "MSC DIANA",
    totalCartons: 840,
    totalPieces: 25200,
    status: "packing",
    productionComplete: true,
    qcPassed: true,
    packingDone: false,
    documentsReady: false,
    transportArranged: false,
  },
  {
    id: "2",
    shipmentNumber: "SHP-2026-0040",
    buyer: "Zara",
    orders: ["ORD-2026-0009"],
    containerNumber: "CSNU4512890",
    containerType: "40HC",
    plannedShipDate: "2026-03-10",
    etd: "2026-03-11",
    eta: "2026-03-30",
    portOfLoading: "INMAA (Chennai)",
    portOfDischarge: "ESVLC (Valencia)",
    vesselName: "EVER GIVEN II",
    totalCartons: 620,
    totalPieces: 18600,
    status: "ready",
    productionComplete: true,
    qcPassed: true,
    packingDone: true,
    documentsReady: true,
    transportArranged: true,
  },
  {
    id: "3",
    shipmentNumber: "SHP-2026-0039",
    buyer: "Primark",
    orders: ["ORD-2026-0008", "ORD-2026-0007"],
    containerNumber: "TEMU9234561",
    containerType: "40ft",
    plannedShipDate: "2026-02-20",
    etd: "2026-02-21",
    eta: "2026-03-10",
    portOfLoading: "INKOL (Kolkata)",
    portOfDischarge: "GBFXT (Felixstowe)",
    vesselName: "CSCL ATLANTIC OCEAN",
    totalCartons: 1120,
    totalPieces: 44800,
    status: "in_transit",
    productionComplete: true,
    qcPassed: true,
    packingDone: true,
    documentsReady: true,
    transportArranged: true,
  },
  {
    id: "4",
    shipmentNumber: "SHP-2026-0038",
    buyer: "Next",
    orders: ["ORD-2026-0005"],
    containerNumber: "OOLU6712345",
    containerType: "20ft",
    plannedShipDate: "2026-02-10",
    etd: "2026-02-11",
    eta: "2026-03-02",
    portOfLoading: "INNSA (Nhava Sheva)",
    portOfDischarge: "GBSOU (Southampton)",
    vesselName: "APL RAFFLES",
    totalCartons: 390,
    totalPieces: 15600,
    status: "delivered",
    productionComplete: true,
    qcPassed: true,
    packingDone: true,
    documentsReady: true,
    transportArranged: true,
  },
  {
    id: "5",
    shipmentNumber: "SHP-2026-0037",
    buyer: "Target",
    orders: ["ORD-2026-0006"],
    containerNumber: "HLXU8901234",
    containerType: "40HC",
    plannedShipDate: "2026-02-15",
    etd: "2026-02-16",
    eta: "2026-03-25",
    portOfLoading: "INMUN (Mundra)",
    portOfDischarge: "USLAX (Los Angeles)",
    vesselName: "ONE INNOVATION",
    totalCartons: 980,
    totalPieces: 39200,
    status: "delivered",
    productionComplete: true,
    qcPassed: true,
    packingDone: true,
    documentsReady: true,
    transportArranged: true,
  },
  {
    id: "6",
    shipmentNumber: "SHP-2026-0042",
    buyer: "Marks & Spencer",
    orders: ["ORD-2026-0014"],
    containerNumber: "",
    containerType: "40ft",
    plannedShipDate: "2026-03-22",
    etd: "2026-03-23",
    eta: "2026-04-15",
    portOfLoading: "INNSA (Nhava Sheva)",
    portOfDischarge: "GBFXT (Felixstowe)",
    vesselName: "",
    totalCartons: 750,
    totalPieces: 30000,
    status: "packing",
    productionComplete: false,
    qcPassed: false,
    packingDone: false,
    documentsReady: false,
    transportArranged: false,
  },
  {
    id: "7",
    shipmentNumber: "SHP-2026-0036",
    buyer: "Lidl",
    orders: ["ORD-2026-0003"],
    containerNumber: "CAIU7234567",
    containerType: "40ft",
    plannedShipDate: "2026-01-25",
    etd: "2026-01-26",
    eta: "2026-02-18",
    portOfLoading: "INMAA (Chennai)",
    portOfDischarge: "DEHAM (Hamburg)",
    vesselName: "BALTIC WIND",
    totalCartons: 560,
    totalPieces: 22400,
    status: "delayed",
    productionComplete: true,
    qcPassed: false,
    packingDone: false,
    documentsReady: false,
    transportArranged: false,
  },
  {
    id: "8",
    shipmentNumber: "SHP-2026-0043",
    buyer: "ASOS",
    orders: ["ORD-2026-0016"],
    containerNumber: "",
    containerType: "20ft",
    plannedShipDate: "2026-04-15",
    etd: "2026-04-16",
    eta: "2026-05-05",
    portOfLoading: "INMUN (Mundra)",
    portOfDischarge: "NLRTM (Rotterdam)",
    vesselName: "",
    totalCartons: 240,
    totalPieces: 9600,
    status: "packing",
    productionComplete: false,
    qcPassed: false,
    packingDone: false,
    documentsReady: false,
    transportArranged: false,
  },
];

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
    shipment.productionComplete,
    shipment.qcPassed,
    shipment.packingDone,
    shipment.documentsReady,
    shipment.transportArranged,
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
      accessorKey: "shipmentNumber",
      header: "Shipment #",
      cell: ({ row }) => (
        <button
          onClick={() => onSelect(row.original)}
          className="font-mono text-sm font-semibold text-blue-600 hover:underline"
        >
          {row.original.shipmentNumber}
        </button>
      ),
    },
    {
      accessorKey: "buyer",
      header: "Buyer",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-900">
          {row.original.buyer}
        </span>
      ),
    },
    {
      id: "orders",
      header: "Orders",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {row.original.orders.map((o) => (
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
      accessorKey: "containerNumber",
      header: "Container #",
      cell: ({ row }) =>
        row.original.containerNumber ? (
          <span className="font-mono text-xs text-gray-700">
            {row.original.containerNumber}
            <span className="ml-1.5 text-gray-400">
              ({row.original.containerType})
            </span>
          </span>
        ) : (
          <span className="text-gray-400 text-xs italic">Not assigned</span>
        ),
    },
    {
      accessorKey: "plannedShipDate",
      header: "Planned Ship",
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">
          {formatDate(row.original.plannedShipDate)}
        </span>
      ),
    },
    {
      accessorKey: "etd",
      header: "ETD",
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">
          {formatDate(row.original.etd)}
        </span>
      ),
    },
    {
      accessorKey: "eta",
      header: "ETA",
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">
          {formatDate(row.original.eta)}
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
  buyer: string;
  orders: string;
  containerNumber: string;
  containerType: string;
  plannedDate: string;
  portOfLoading: string;
  portOfDischarge: string;
  vesselName: string;
}

const FORM_DEFAULTS: NewShipmentFormState = {
  buyer: "",
  orders: "",
  containerNumber: "",
  containerType: "40ft",
  plannedDate: "",
  portOfLoading: "",
  portOfDischarge: "",
  vesselName: "",
};

function NewShipmentForm({
  form,
  onChange,
}: {
  form: NewShipmentFormState;
  onChange: (field: keyof NewShipmentFormState, value: string) => void;
}) {
  const BUYERS = ["H&M", "Zara", "Primark", "Next", "Target", "Marks & Spencer", "Lidl", "ASOS"];
  const PORTS = [
    "INNSA (Nhava Sheva)",
    "INMAA (Chennai)",
    "INMUN (Mundra)",
    "INKOL (Kolkata)",
    "INBLR (Bangalore)",
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="buyer">Buyer *</Label>
        <Select value={form.buyer} onValueChange={(v) => onChange("buyer", v)}>
          <SelectTrigger id="buyer">
            <SelectValue placeholder="Select buyer..." />
          </SelectTrigger>
          <SelectContent>
            {BUYERS.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
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
  const [selectedShipment, setSelectedShipment] =
    React.useState<Shipment | null>(MOCK_SHIPMENTS[0]);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [form, setForm] = React.useState<NewShipmentFormState>(FORM_DEFAULTS);
  const [saving, setSaving] = React.useState(false);
  const [shipments, setShipments] = React.useState<Shipment[]>(MOCK_SHIPMENTS);

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

  function handleSave() {
    if (!form.buyer || !form.plannedDate) return;
    setSaving(true);
    setTimeout(() => {
      const newShipment: Shipment = {
        id: String(shipments.length + 1),
        shipmentNumber: `SHP-2026-${String(44 + shipments.length).padStart(4, "0")}`,
        buyer: form.buyer,
        orders: form.orders
          ? form.orders.split(",").map((o) => o.trim())
          : [],
        containerNumber: form.containerNumber,
        containerType: form.containerType,
        plannedShipDate: form.plannedDate,
        etd: form.plannedDate,
        eta: "",
        portOfLoading: form.portOfLoading,
        portOfDischarge: form.portOfDischarge,
        vesselName: form.vesselName,
        totalCartons: 0,
        totalPieces: 0,
        status: "packing",
        productionComplete: false,
        qcPassed: false,
        packingDone: false,
        documentsReady: false,
        transportArranged: false,
      };
      setShipments((prev) => [newShipment, ...prev]);
      setSaving(false);
      setCreateOpen(false);
      setForm(FORM_DEFAULTS);
    }, 800);
  }

  const pct = selectedShipment ? checklistCompletion(selectedShipment) : 0;

  const FILTERS = [
    {
      key: "buyer",
      label: "Buyer",
      options: [
        { label: "H&M", value: "H&M" },
        { label: "Zara", value: "Zara" },
        { label: "Primark", value: "Primark" },
        { label: "Next", value: "Next" },
        { label: "Target", value: "Target" },
        { label: "Marks & Spencer", value: "Marks & Spencer" },
        { label: "Lidl", value: "Lidl" },
        { label: "ASOS", value: "ASOS" },
      ],
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
                searchKey="shipmentNumber"
                searchPlaceholder="Search shipment number..."
                filters={FILTERS}
                onRowClick={setSelectedShipment}
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
                        {selectedShipment.shipmentNumber} &mdash;{" "}
                        {selectedShipment.buyer}
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
                        selectedShipment.productionComplete,
                        selectedShipment.qcPassed,
                        selectedShipment.packingDone,
                        selectedShipment.documentsReady,
                        selectedShipment.transportArranged,
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
                      checked={selectedShipment.productionComplete}
                      icon={<Package className="h-4 w-4" />}
                    />
                    <ChecklistItem
                      label="QC Passed"
                      checked={selectedShipment.qcPassed}
                      icon={<CheckCircle2 className="h-4 w-4" />}
                    />
                    <ChecklistItem
                      label="Packing Done"
                      checked={selectedShipment.packingDone}
                      icon={<Package className="h-4 w-4" />}
                    />
                    <ChecklistItem
                      label="Documents Ready"
                      checked={selectedShipment.documentsReady}
                      icon={<FileText className="h-4 w-4" />}
                    />
                    <ChecklistItem
                      label="Transport Arranged"
                      checked={selectedShipment.transportArranged}
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
                      {selectedShipment.portOfLoading || "Port TBD"}
                    </span>
                    <ChevronRight className="h-3 w-3 text-gray-300 shrink-0" />
                    <span className="truncate">
                      {selectedShipment.portOfDischarge || "Port TBD"}
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
                  {selectedShipment.vesselName && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Ship className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <span>{selectedShipment.vesselName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Package className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span>
                      {selectedShipment.totalCartons.toLocaleString()} ctns /{" "}
                      {selectedShipment.totalPieces.toLocaleString()} pcs
                    </span>
                  </div>

                  {delayed && selectedShipment.status === "delayed" && (
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
        <NewShipmentForm form={form} onChange={handleFormChange} />
      </FormSheet>
    </div>
  );
}
