"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Pencil, Mail, Phone, MapPin, Star } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormSheet } from "@/components/forms/form-sheet"
import { SupplierForm } from "@/components/forms/masters/supplier-form"
import { EmptyState } from "@/components/ui/empty-state"
import { StatCard } from "@/components/ui/stat-card"
import type { Database } from "@/types/database"

type Supplier = Database["public"]["Tables"]["suppliers"]["Row"]

const MOCK_SUPPLIER: Supplier = {
  id: "s1",
  company_id: "c1",
  name: "Arvind Limited",
  code: "ARV",
  contact_person: "Raj Patel",
  email: "sourcing@arvind.com",
  phone: "+91 79 4000 8000",
  address: "Naroda Road, Naroda",
  city: "Ahmedabad",
  country: "India",
  material_types: ["fabric", "yarn"],
  payment_terms: "30 days",
  avg_lead_time_days: 21,
  gst_number: "24AACCA7024N1ZW",
  bank_details: null,
  rating: 4,
  is_active: true,
  created_at: "2024-01-10T10:00:00Z",
  updated_at: "2024-01-10T10:00:00Z",
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | null | undefined
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="mt-0.5 text-sm text-gray-900">{value}</p>
      </div>
    </div>
  )
}

export default function SupplierDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        await new Promise((r) => setTimeout(r, 400))
        setSupplier(MOCK_SUPPLIER)
      } catch {
        toast.error("Failed to load supplier")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-48 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!supplier) {
    return (
      <EmptyState
        title="Supplier not found"
        description="The supplier you are looking for does not exist."
        action={
          <Button variant="outline" onClick={() => router.push("/masters/suppliers")}>
            Back to Suppliers
          </Button>
        }
      />
    )
  }

  return (
    <div>
      <PageHeader
        title={supplier.name}
        description={`Supplier Code: ${supplier.code}`}
        breadcrumb={[
          { label: "Masters", href: "/masters" },
          { label: "Suppliers", href: "/masters/suppliers" },
          { label: supplier.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/masters/suppliers")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="grns">GRNs</TabsTrigger>
          <TabsTrigger value="quality">Quality Feedback</TabsTrigger>
          <TabsTrigger value="scorecard">Scorecard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Supplier Information</CardTitle>
                  {supplier.is_active ? (
                    <Badge className="bg-green-50 text-green-700 border border-green-200 text-xs">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs text-gray-500">
                      Inactive
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <InfoRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={supplier.email}
                />
                <InfoRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone"
                  value={supplier.phone}
                />
                <InfoRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Address"
                  value={
                    [supplier.address, supplier.city, supplier.country]
                      .filter(Boolean)
                      .join(", ") || null
                  }
                />
                <div className="py-3 border-b border-gray-100">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">
                    Material Types
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(supplier.material_types ?? []).map((type) => (
                      <Badge key={type} variant="secondary" className="text-xs capitalize">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                <InfoRow
                  icon={<Star className="h-4 w-4" />}
                  label="Payment Terms"
                  value={supplier.payment_terms}
                />
                <InfoRow
                  icon={<Star className="h-4 w-4" />}
                  label="GST Number"
                  value={supplier.gst_number}
                />
                {supplier.avg_lead_time_days !== undefined && (
                  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                      <Star className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Avg Lead Time
                      </p>
                      <p className="mt-0.5 text-sm text-gray-900">
                        {supplier.avg_lead_time_days} days
                      </p>
                    </div>
                  </div>
                )}
                {supplier.rating && (
                  <div className="flex items-start gap-3 py-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                      <Star className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Rating
                      </p>
                      <p className="mt-0.5 text-sm text-amber-500">
                        {"★".repeat(supplier.rating)}
                        <span className="text-gray-300">{"★".repeat(5 - supplier.rating)}</span>
                        <span className="text-gray-500 ml-1">({supplier.rating}/5)</span>
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-5">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Total POs</span>
                      <span className="text-sm font-semibold text-gray-900">—</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Open POs</span>
                      <span className="text-sm font-semibold text-gray-900">—</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">GRNs (30 days)</span>
                      <span className="text-sm font-semibold text-gray-900">—</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-500">Quality Issues</span>
                      <span className="text-sm font-semibold text-gray-900">—</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="purchase-orders" className="mt-4">
          <EmptyState
            title="No purchase orders"
            description="Purchase orders linked to this supplier will appear here."
          />
        </TabsContent>

        <TabsContent value="grns" className="mt-4">
          <EmptyState
            title="No GRNs"
            description="Goods receipt notes linked to this supplier will appear here."
          />
        </TabsContent>

        <TabsContent value="quality" className="mt-4">
          <EmptyState
            title="No quality feedback"
            description="Quality inspection results for this supplier will appear here."
          />
        </TabsContent>

        <TabsContent value="scorecard" className="mt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Price Competitiveness"
              value="—"
              icon={<Star className="h-5 w-5" />}
              color="blue"
            />
            <StatCard
              title="Delivery Reliability"
              value="—"
              icon={<Star className="h-5 w-5" />}
              color="green"
            />
            <StatCard
              title="Quality Score"
              value="—"
              icon={<Star className="h-5 w-5" />}
              color="purple"
            />
            <StatCard
              title="Lead Time"
              value={`${supplier.avg_lead_time_days} days`}
              icon={<Star className="h-5 w-5" />}
              color="orange"
            />
          </div>
          <div className="mt-6">
            <EmptyState
              title="Scorecard data not available"
              description="Scorecard metrics will populate once purchase orders and inspections are recorded."
            />
          </div>
        </TabsContent>
      </Tabs>

      <FormSheet
        title="Edit Supplier"
        description={`Editing ${supplier.name}`}
        open={editOpen}
        onOpenChange={setEditOpen}
        size="md"
        footer={null}
      >
        <SupplierForm
          supplier={supplier}
          onSuccess={(updated) => {
            setSupplier(updated)
            setEditOpen(false)
            toast.success("Supplier updated")
          }}
          onCancel={() => setEditOpen(false)}
        />
      </FormSheet>
    </div>
  )
}
