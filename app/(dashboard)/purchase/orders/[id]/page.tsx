import * as React from "react";
import { CheckCircle, XCircle, Download } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ---------- Types ---------- */

interface POItem {
  id: string;
  item: string;
  specification: string;
  uom: string;
  qty: number;
  rate: number;
  amount: number;
  receivedQty: number;
}

interface GRNRecord {
  id: string;
  date: string;
  receivedBy: string;
  vehicleNo: string;
  status: string;
  items: Array<{ item: string; qty: number; uom: string }>;
}

interface PODetail {
  id: string;
  supplier: string;
  supplierContact: string;
  supplierGST: string;
  order: string;
  orderDate: string;
  deliveryDate: string;
  currency: string;
  paymentTerms: string;
  status: string;
  approvedBy: string | null;
  approvedAt: string | null;
  items: POItem[];
  grnHistory: GRNRecord[];
}

/* ---------- Mock data ---------- */

const MOCK: Record<string, PODetail> = {
  "PO-0128": {
    id: "PO-0128",
    supplier: "Arvind Textiles Ltd",
    supplierContact: "+91 79 2234 5678",
    supplierGST: "24AAAAA0000A1Z5",
    order: "ORD-2401",
    orderDate: "2026-02-20",
    deliveryDate: "2026-03-05",
    currency: "INR",
    paymentTerms: "Net 30 days",
    status: "approved",
    approvedBy: "Rajesh Mehta (Purchase Manager)",
    approvedAt: "2026-02-21 10:30",
    items: [
      {
        id: "POI-001",
        item: "Cotton Poplin 40s — Navy Blue",
        specification: "58\" width, 100gsm",
        uom: "Meter",
        qty: 2400,
        rate: 85,
        amount: 204000,
        receivedQty: 0,
      },
    ],
    grnHistory: [],
  },
  "PO-0126": {
    id: "PO-0126",
    supplier: "Chemdyes Ltd",
    supplierContact: "+91 22 2800 1234",
    supplierGST: "27BBBBB1111B1Z4",
    order: "ORD-2401",
    orderDate: "2026-02-18",
    deliveryDate: "2026-02-28",
    currency: "INR",
    paymentTerms: "Net 30 days",
    status: "partial_received",
    approvedBy: "Rajesh Mehta (Purchase Manager)",
    approvedAt: "2026-02-19 09:15",
    items: [
      {
        id: "POI-002",
        item: "Reactive Blue 19",
        specification: "Dye grade, powder form",
        uom: "kg",
        qty: 50,
        rate: 320,
        amount: 16000,
        receivedQty: 35,
      },
      {
        id: "POI-003",
        item: "Sodium Chloride",
        specification: "Industrial grade",
        uom: "kg",
        qty: 200,
        rate: 18,
        amount: 3600,
        receivedQty: 200,
      },
      {
        id: "POI-004",
        item: "Leveling Agent",
        specification: "Non-ionic, 200L drum",
        uom: "kg",
        qty: 50,
        rate: 186,
        amount: 9300,
        receivedQty: 0,
      },
    ],
    grnHistory: [
      {
        id: "GRN-0087",
        date: "2026-02-23",
        receivedBy: "Store Manager",
        vehicleNo: "MH-01-AB-1234",
        status: "pending_qc",
        items: [
          { item: "Reactive Blue 19", qty: 35, uom: "kg" },
          { item: "Sodium Chloride", qty: 200, uom: "kg" },
        ],
      },
    ],
  },
};

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  pending_approval: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  sent: "bg-indigo-100 text-indigo-700",
  partial_received: "bg-orange-100 text-orange-700",
  fully_received: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-500",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  approved: "Approved",
  sent: "Sent",
  partial_received: "Partial Received",
  fully_received: "Fully Received",
  closed: "Closed",
  cancelled: "Cancelled",
};

/* ---------- Page ---------- */

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PODetailPage({ params }: PageProps) {
  const { id } = await params;
  const po = MOCK[id] ?? MOCK["PO-0128"];
  const totalAmount = po.items.reduce((s, i) => s + i.amount, 0);
  const totalReceived = po.items.reduce((s, i) => s + i.receivedQty, 0);
  const totalOrdered = po.items.reduce((s, i) => s + i.qty, 0);
  const isPendingApproval = po.status === "pending_approval";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Purchase Order ${po.id}`}
        description={`${po.supplier} · ${po.order} · ${po.orderDate}`}
        breadcrumb={[
          { label: "Purchase", href: "/purchase" },
          { label: po.id },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {isPendingApproval && (
              <>
                <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </>
            )}
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        }
      />

      {/* Header info */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="border-b border-gray-100 px-6 py-4">
            <p className="text-sm font-semibold text-gray-900">PO Details</p>
          </div>
          <CardContent className="p-6">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              {[
                { label: "PO Number", value: po.id },
                { label: "Supplier", value: po.supplier },
                { label: "Contact", value: po.supplierContact },
                { label: "GST Number", value: po.supplierGST },
                { label: "Linked Order", value: po.order },
                { label: "Order Date", value: po.orderDate },
                { label: "Delivery Date", value: po.deliveryDate },
                { label: "Currency", value: po.currency },
                { label: "Payment Terms", value: po.paymentTerms },
                {
                  label: "Status",
                  value: (
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[po.status]}`}
                    >
                      {STATUS_LABELS[po.status]}
                    </span>
                  ),
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs font-medium text-gray-500">{label}</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        {/* Approval / Summary */}
        <Card>
          <div className="border-b border-gray-100 px-6 py-4">
            <p className="text-sm font-semibold text-gray-900">Summary</p>
          </div>
          <CardContent className="p-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Items</span>
              <span className="font-semibold">{po.items.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Ordered Qty</span>
              <span className="font-semibold">{totalOrdered.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Received</span>
              <span className="font-semibold">{totalReceived.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 text-base">
              <span className="font-semibold text-gray-700">Total Amount</span>
              <span className="font-bold text-gray-900">
                ₹{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            {po.approvedBy && (
              <div className="border-t border-gray-100 pt-3 space-y-1">
                <p className="text-xs font-medium text-gray-500">Approved By</p>
                <p className="text-xs font-semibold text-gray-700">{po.approvedBy}</p>
                <p className="text-xs text-gray-500">{po.approvedAt}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items + GRN History */}
      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">PO Items</TabsTrigger>
          <TabsTrigger value="grn">
            GRN History
            {po.grnHistory.length > 0 && (
              <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">
                {po.grnHistory.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    {["Item", "Specification", "UOM", "Ordered Qty", "Rate", "Amount", "Received", "Balance"].map((h) => (
                      <TableHead
                        key={h}
                        className="text-xs font-semibold uppercase tracking-wide text-gray-500"
                      >
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {po.items.map((item) => (
                    <TableRow key={item.id} className="border-b border-gray-100">
                      <TableCell className="py-3 text-sm font-medium text-gray-900">
                        {item.item}
                      </TableCell>
                      <TableCell className="py-3 text-xs text-gray-500 max-w-[160px]">
                        {item.specification}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-gray-700">{item.uom}</TableCell>
                      <TableCell className="py-3 text-sm font-semibold text-gray-900">
                        {item.qty.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-gray-700">
                        ₹{item.rate.toFixed(2)}
                      </TableCell>
                      <TableCell className="py-3 text-sm font-semibold text-gray-900">
                        ₹{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-gray-700">
                        {item.receivedQty.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-3 text-sm">
                        <span
                          className={
                            item.qty - item.receivedQty > 0
                              ? "font-semibold text-orange-600"
                              : "font-semibold text-green-600"
                          }
                        >
                          {(item.qty - item.receivedQty).toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Totals row */}
                  <TableRow className="bg-gray-50 font-semibold">
                    <TableCell colSpan={4} className="py-3 text-sm text-gray-700">
                      Total
                    </TableCell>
                    <TableCell className="py-3" />
                    <TableCell className="py-3 text-sm font-bold text-gray-900">
                      ₹{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell colSpan={2} className="py-3" />
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grn" className="mt-4">
          {po.grnHistory.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-sm font-medium text-gray-500">No GRNs recorded for this PO</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {po.grnHistory.map((grn) => (
                <Card key={grn.id}>
                  <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{grn.id}</p>
                      <p className="text-xs text-gray-500">
                        Received on {grn.date} · Vehicle: {grn.vehicleNo}
                      </p>
                    </div>
                    <span className="rounded-md bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">
                      Pending QC
                    </span>
                  </div>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Item</TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Qty Received</TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">UOM</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {grn.items.map((item) => (
                          <TableRow key={item.item} className="border-b border-gray-100">
                            <TableCell className="py-2.5 text-sm text-gray-700">{item.item}</TableCell>
                            <TableCell className="py-2.5 text-sm font-semibold text-gray-900">{item.qty}</TableCell>
                            <TableCell className="py-2.5 text-sm text-gray-600">{item.uom}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
