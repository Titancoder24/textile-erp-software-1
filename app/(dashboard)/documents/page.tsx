"use client";

import * as React from "react";
import {
  FileText,
  Download,
  Eye,
  Share2,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  ChevronDown,
  Package,
  Ship,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useCompany } from "@/contexts/company-context";
import { getDocuments, getShipmentNumbers } from "@/lib/actions/documents";

/* ---------- Types ---------- */

type DocType =
  | "Packing List"
  | "Commercial Invoice"
  | "Certificate of Origin"
  | "Inspection Certificate"
  | "Test Report"
  | "Other";

type DocStatus = "Draft" | "Pending Approval" | "Approved" | "Sent";

interface Document {
  id: string;
  name: string;
  type: DocType;
  reference: string;
  generatedBy: string;
  generatedDate: string;
  status: DocStatus;
  shipmentId?: string;
  expiresIn?: number;
}

/* ---------- Constants ---------- */

const DOC_TYPES: DocType[] = [
  "Packing List",
  "Commercial Invoice",
  "Certificate of Origin",
  "Inspection Certificate",
  "Test Report",
  "Other",
];

/* ---------- Helpers ---------- */

function mapFileTypeToDocType(fileType: string | null, entityType: string | null): DocType {
  const ft = (fileType || "").toLowerCase();
  const et = (entityType || "").toLowerCase();
  if (et.includes("packing") || ft.includes("packing")) return "Packing List";
  if (et.includes("invoice") || ft.includes("invoice")) return "Commercial Invoice";
  if (et.includes("origin") || ft.includes("origin") || ft.includes("certificate")) return "Certificate of Origin";
  if (et.includes("inspection") || ft.includes("inspection")) return "Inspection Certificate";
  if (et.includes("test") || ft.includes("test")) return "Test Report";
  return "Other";
}

function mapStatusFromEntity(entityType: string | null): DocStatus {
  const et = (entityType || "").toLowerCase();
  if (et.includes("draft")) return "Draft";
  if (et.includes("pending")) return "Pending Approval";
  if (et.includes("sent") || et.includes("delivered")) return "Sent";
  return "Approved";
}

function statusBadge(status: DocStatus) {
  const variants: Record<DocStatus, string> = {
    Draft: "bg-gray-100 text-gray-700",
    "Pending Approval": "bg-yellow-100 text-yellow-700",
    Approved: "bg-green-100 text-green-700",
    Sent: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[status]
      )}
    >
      {status}
    </span>
  );
}

function docTypeBadge(type: DocType) {
  const color: Record<DocType, string> = {
    "Packing List": "bg-blue-50 text-blue-700",
    "Commercial Invoice": "bg-purple-50 text-purple-700",
    "Certificate of Origin": "bg-teal-50 text-teal-700",
    "Inspection Certificate": "bg-orange-50 text-orange-700",
    "Test Report": "bg-indigo-50 text-indigo-700",
    Other: "bg-gray-50 text-gray-600",
  };
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        color[type]
      )}
    >
      {type}
    </span>
  );
}

function expiryLabel(expiresIn?: number) {
  if (expiresIn === undefined) return null;
  if (expiresIn < 0)
    return (
      <span className="text-xs font-medium text-red-600">
        Overdue {Math.abs(expiresIn)}d
      </span>
    );
  if (expiresIn <= 7)
    return (
      <span className="text-xs font-medium text-orange-600">
        Expires in {expiresIn}d
      </span>
    );
  return null;
}

/* ---------- Packing List Preview ---------- */

function PackingListPreview({ shipment }: { shipment: string }) {
  const cartons = [
    { no: "CTN-001", size: "S: 12, M: 24, L: 24, XL: 12", pieces: 72, net: 8.4, gross: 9.1, dim: "60x40x50 cm", cbm: 0.12 },
    { no: "CTN-002", size: "S: 12, M: 24, L: 24, XL: 12", pieces: 72, net: 8.4, gross: 9.1, dim: "60x40x50 cm", cbm: 0.12 },
    { no: "CTN-003", size: "M: 36, L: 36", pieces: 72, net: 8.1, gross: 8.8, dim: "60x40x50 cm", cbm: 0.12 },
    { no: "CTN-004", size: "S: 24, M: 24, L: 24", pieces: 72, net: 7.9, gross: 8.6, dim: "60x40x50 cm", cbm: 0.12 },
    { no: "CTN-005", size: "XL: 48, XXL: 24", pieces: 72, net: 9.2, gross: 10.0, dim: "60x40x50 cm", cbm: 0.12 },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 text-xs">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between border-b border-gray-200 pb-4">
        <div>
          <p className="text-base font-bold text-gray-900">PACKING LIST</p>
          <p className="text-gray-500">Reference: {shipment}</p>
          <p className="text-gray-500">Date: {new Date().toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-700">TextileOS Demo Factory</p>
          <p className="text-gray-500">123 Industrial Area, Tirupur</p>
          <p className="text-gray-500">Tamil Nadu - 641604</p>
          <p className="text-gray-500">GSTIN: 33AAAA1234Z1Z5</p>
        </div>
      </div>
      {/* Consignee */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <p className="font-semibold text-gray-700">Buyer / Consignee</p>
          <p className="text-gray-500">Buyer details from shipment</p>
        </div>
        <div>
          <p className="font-semibold text-gray-700">Shipment Details</p>
          <p className="text-gray-500">Reference: {shipment}</p>
        </div>
      </div>
      {/* Cartons Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-2 py-1.5 text-left text-gray-600">Carton No.</th>
            <th className="border border-gray-200 px-2 py-1.5 text-left text-gray-600">Size Breakdown</th>
            <th className="border border-gray-200 px-2 py-1.5 text-right text-gray-600">Pieces</th>
            <th className="border border-gray-200 px-2 py-1.5 text-right text-gray-600">Net Wt (kg)</th>
            <th className="border border-gray-200 px-2 py-1.5 text-right text-gray-600">Gross Wt (kg)</th>
            <th className="border border-gray-200 px-2 py-1.5 text-right text-gray-600">Dimensions</th>
            <th className="border border-gray-200 px-2 py-1.5 text-right text-gray-600">CBM</th>
          </tr>
        </thead>
        <tbody>
          {cartons.map((c) => (
            <tr key={c.no} className="hover:bg-gray-50/50">
              <td className="border border-gray-200 px-2 py-1.5 font-medium text-gray-800">{c.no}</td>
              <td className="border border-gray-200 px-2 py-1.5 text-gray-600">{c.size}</td>
              <td className="border border-gray-200 px-2 py-1.5 text-right tabular-nums text-gray-700">{c.pieces}</td>
              <td className="border border-gray-200 px-2 py-1.5 text-right tabular-nums text-gray-700">{c.net.toFixed(1)}</td>
              <td className="border border-gray-200 px-2 py-1.5 text-right tabular-nums text-gray-700">{c.gross.toFixed(1)}</td>
              <td className="border border-gray-200 px-2 py-1.5 text-right text-gray-600">{c.dim}</td>
              <td className="border border-gray-200 px-2 py-1.5 text-right tabular-nums text-gray-700">{c.cbm.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50 font-semibold">
            <td className="border border-gray-200 px-2 py-1.5 text-gray-900">Total</td>
            <td className="border border-gray-200 px-2 py-1.5" />
            <td className="border border-gray-200 px-2 py-1.5 text-right tabular-nums text-gray-900">360</td>
            <td className="border border-gray-200 px-2 py-1.5 text-right tabular-nums text-gray-900">42.0</td>
            <td className="border border-gray-200 px-2 py-1.5 text-right tabular-nums text-gray-900">45.6</td>
            <td className="border border-gray-200 px-2 py-1.5" />
            <td className="border border-gray-200 px-2 py-1.5 text-right tabular-nums text-gray-900">0.60</td>
          </tr>
        </tfoot>
      </table>
      <p className="mt-4 text-gray-400 italic">
        Generated by TextileOS Document Center. This is a system-generated document.
      </p>
    </div>
  );
}

/* ---------- Generate Document Sheet ---------- */

function GenerateDocSheet({
  open,
  onClose,
  shipments,
}: {
  open: boolean;
  onClose: () => void;
  shipments: string[];
}) {
  const [docType, setDocType] = React.useState<string>("");
  const [shipment, setShipment] = React.useState<string>("");
  const [notes, setNotes] = React.useState("");

  const showPreview = docType === "Packing List" && shipment;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader className="mb-6">
          <SheetTitle>Generate Document</SheetTitle>
          <SheetDescription>
            Select document type and linked shipment to generate export documentation.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5">
          {/* Document Type */}
          <div className="space-y-1.5">
            <Label>Document Type</Label>
            <Select onValueChange={setDocType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Packing List">Packing List</SelectItem>
                <SelectItem value="Commercial Invoice">Commercial Invoice</SelectItem>
                <SelectItem value="Certificate of Origin">Certificate of Origin</SelectItem>
                <SelectItem value="Inspection Certificate">Inspection Certificate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Linked Shipment */}
          <div className="space-y-1.5">
            <Label>Linked Shipment</Label>
            <Select onValueChange={setShipment}>
              <SelectTrigger>
                <SelectValue placeholder="Select shipment..." />
              </SelectTrigger>
              <SelectContent>
                {shipments.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes / Special Instructions</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any special instructions for this document..."
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Document Preview</p>
              <PackingListPreview shipment={shipment} />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={!docType || !shipment}
              onClick={() => {
                toast.success(`Document "${docType}" generated for ${shipment}`);
                onClose();
              }}
            >
              Generate Document
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ---------- Document Row ---------- */

function DocRow({ doc }: { doc: Document }) {
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50">
      <td className="py-3 pr-4">
        <div className="flex items-start gap-2">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">{doc.name}</p>
            <p className="text-xs text-gray-400">{doc.id}</p>
          </div>
        </div>
      </td>
      <td className="py-3 pr-4">{docTypeBadge(doc.type)}</td>
      <td className="py-3 pr-4 text-sm text-gray-600">{doc.reference}</td>
      <td className="py-3 pr-4 text-sm text-gray-600">{doc.generatedBy}</td>
      <td className="py-3 pr-4 text-sm text-gray-500 tabular-nums">{doc.generatedDate}</td>
      <td className="py-3 pr-4">
        <div className="flex flex-col gap-1">
          {statusBadge(doc.status)}
          {expiryLabel(doc.expiresIn)}
        </div>
      </td>
      <td className="py-3">
        <div className="flex items-center gap-1">
          <button
            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            title="View"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            title="Download PDF"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          {doc.status === "Pending Approval" && (
            <button
              className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-green-600"
              title="Approve"
            >
              <CheckCircle className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600"
            title="Share"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ---------- Documents Table ---------- */

function DocumentsTable({ docs, loading }: { docs: Document[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        <p className="mt-3 text-sm text-gray-500">Loading documents...</p>
      </div>
    );
  }

  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="mb-3 h-10 w-10 text-gray-300" />
        <p className="text-sm font-medium text-gray-500">No documents found</p>
        <p className="text-xs text-gray-400">Generate a document to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="pb-3 text-left font-medium text-gray-500">Document Name</th>
            <th className="pb-3 text-left font-medium text-gray-500">Type</th>
            <th className="pb-3 text-left font-medium text-gray-500">Reference</th>
            <th className="pb-3 text-left font-medium text-gray-500">Generated By</th>
            <th className="pb-3 text-left font-medium text-gray-500">Date</th>
            <th className="pb-3 text-left font-medium text-gray-500">Status</th>
            <th className="pb-3 text-left font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {docs.map((doc) => (
            <DocRow key={doc.id} doc={doc} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Page Component ---------- */

export default function DocumentCenterPage() {
  const { companyId } = useCompany();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("all");
  const [loading, setLoading] = React.useState(true);
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [shipmentNumbers, setShipmentNumbers] = React.useState<string[]>([]);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [docRes, shipRes] = await Promise.all([
        getDocuments(companyId),
        getShipmentNumbers(companyId),
      ]);

      if (docRes.error) {
        toast.error("Failed to load documents: " + docRes.error);
      } else {
        const mapped: Document[] = (docRes.data ?? []).map((f: Record<string, unknown>) => {
          const profileObj = f.profiles as Record<string, unknown> | null;
          const createdAt = f.created_at as string;
          const date = createdAt ? createdAt.split("T")[0] : "";

          return {
            id: f.id as string,
            name: (f.file_name as string) || "Untitled Document",
            type: mapFileTypeToDocType(f.file_type as string | null, f.entity_type as string | null),
            reference: (f.entity_id as string)?.slice(0, 8) || "—",
            generatedBy: (profileObj?.full_name as string) || "System",
            generatedDate: date,
            status: mapStatusFromEntity(f.entity_type as string | null),
            shipmentId: (f.entity_type as string) === "shipment" ? (f.entity_id as string) : undefined,
          };
        });
        setDocuments(mapped);
      }

      if (shipRes.error) {
        toast.error("Failed to load shipments: " + shipRes.error);
      } else {
        setShipmentNumbers(
          (shipRes.data ?? []).map((s: Record<string, unknown>) => s.shipment_number as string)
        );
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalDocs = documents.length;
  const pendingDocs = documents.filter((d) => d.status === "Pending Approval" || d.status === "Draft").length;
  const approvedDocs = documents.filter((d) => d.status === "Approved" || d.status === "Sent").length;
  const overdueDocs = documents.filter((d) => d.expiresIn !== undefined && d.expiresIn < 0).length;
  const expiringSoon = documents.filter((d) => d.expiresIn !== undefined && d.expiresIn >= 0 && d.expiresIn <= 7);

  const filterByTab = (docs: Document[], tab: string) => {
    if (tab === "all") return docs;
    const typeMap: Record<string, DocType> = {
      packing: "Packing List",
      invoice: "Commercial Invoice",
      origin: "Certificate of Origin",
      inspection: "Inspection Certificate",
      test: "Test Report",
      other: "Other",
    };
    return docs.filter((d) => d.type === typeMap[tab]);
  };

  const filtered = filterByTab(documents, activeTab);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Document Center"
        description="Manage export documentation for shipments — packing lists, invoices, certificates"
        breadcrumb={[{ label: "Document Center" }]}
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="mr-1.5 h-4 w-4" />
                Generate Document
                <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {DOC_TYPES.slice(0, 4).map((type) => (
                <DropdownMenuItem key={type} onClick={() => setSheetOpen(true)}>
                  {type}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Documents This Month"
          value={totalDocs}
          icon={<FileText className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Pending / Draft"
          value={pendingDocs}
          icon={<Clock className="h-5 w-5" />}
          color="orange"
        />
        <StatCard
          title="Approved / Sent"
          value={approvedDocs}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Overdue / Expired"
          value={overdueDocs}
          icon={<AlertCircle className="h-5 w-5" />}
          color="red"
        />
      </div>

      {/* Alert: Expiring Soon */}
      {expiringSoon.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
          <div>
            <p className="text-sm font-semibold text-orange-800">Documents Expiring Soon</p>
            <p className="text-xs text-orange-700">
              {expiringSoon.map((d) => d.name).join(", ")} expire within 7 days. Take action immediately.
            </p>
          </div>
        </div>
      )}

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Ship className="h-4 w-4 text-blue-500" />
              Pending Buyer Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {documents.filter((d) => d.status === "Pending Approval").map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2">
                  <div>
                    <p className="text-xs font-medium text-gray-800">{d.name}</p>
                    <p className="text-xs text-gray-400">{d.reference}</p>
                  </div>
                  <button className="flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100">
                    <CheckCircle className="h-3 w-3" /> Approve
                  </button>
                </div>
              ))}
              {documents.filter((d) => d.status === "Pending Approval").length === 0 && (
                <p className="text-sm text-gray-400">No documents pending approval</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Package className="h-4 w-4 text-purple-500" />
              Recent Shipment Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {documents.filter((d) => d.shipmentId).slice(0, 5).map((d) => (
                <div key={d.id} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-gray-800">{d.name}</p>
                    <p className="text-xs text-gray-400">{d.shipmentId}</p>
                  </div>
                  <div className="ml-2">{statusBadge(d.status)}</div>
                </div>
              ))}
              {documents.filter((d) => d.shipmentId).length === 0 && (
                <p className="text-sm text-gray-400">No shipment documents found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document List with Tabs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold text-gray-900">All Documents</CardTitle>
            <p className="text-sm text-gray-500">{filtered.length} documents</p>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 flex-wrap gap-1 h-auto">
              <TabsTrigger value="all" className="text-xs">All ({documents.length})</TabsTrigger>
              <TabsTrigger value="packing" className="text-xs">
                Packing List ({documents.filter((d) => d.type === "Packing List").length})
              </TabsTrigger>
              <TabsTrigger value="invoice" className="text-xs">
                Commercial Invoice ({documents.filter((d) => d.type === "Commercial Invoice").length})
              </TabsTrigger>
              <TabsTrigger value="origin" className="text-xs">
                Cert. of Origin ({documents.filter((d) => d.type === "Certificate of Origin").length})
              </TabsTrigger>
              <TabsTrigger value="inspection" className="text-xs">
                Inspection Cert. ({documents.filter((d) => d.type === "Inspection Certificate").length})
              </TabsTrigger>
              <TabsTrigger value="test" className="text-xs">
                Test Reports ({documents.filter((d) => d.type === "Test Report").length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab}>
              <DocumentsTable docs={filtered} loading={loading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Generate Document Sheet */}
      <GenerateDocSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        shipments={shipmentNumbers}
      />
    </div>
  );
}
