"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Pencil, Mail, Phone, MapPin, Globe, CreditCard, CheckCircle } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormSheet } from "@/components/forms/form-sheet"
import { BuyerForm } from "@/components/forms/masters/buyer-form"
import { EmptyState } from "@/components/ui/empty-state"
import { getBuyer } from "@/lib/actions/buyers"
import { getOrders } from "@/lib/actions/orders"
import { getSamples } from "@/lib/actions/samples"
import { getShipments } from "@/lib/actions/shipment"
import { useCompany } from "@/contexts/company-context"
import type { Database } from "@/types/database"

type Buyer = Database["public"]["Tables"]["buyers"]["Row"]

interface BuyerStats {
  totalOrders: number
  activeOrders: number
  samplesPending: number
  shipments: number
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

export default function BuyerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { companyId } = useCompany()
  const [buyer, setBuyer] = useState<Buyer | null>(null)
  const [stats, setStats] = useState<BuyerStats>({
    totalOrders: 0,
    activeOrders: 0,
    samplesPending: 0,
    shipments: 0,
  })
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)

  const buyerId = params.id as string

  const loadBuyer = useCallback(async () => {
    if (!buyerId) return
    setLoading(true)
    try {
      const { data, error } = await getBuyer(buyerId)
      if (error || !data) {
        toast.error(error || "Failed to load buyer")
        setBuyer(null)
        return
      }
      setBuyer(data)

      // Fetch related stats in parallel
      const [ordersRes, samplesRes, shipmentsRes] = await Promise.all([
        getOrders(companyId, { buyer_id: buyerId }),
        getSamples(companyId, { buyer_id: buyerId }),
        getShipments(companyId, { buyer_id: buyerId }),
      ])

      const orders = ordersRes.data ?? []
      const samples = samplesRes.data ?? []
      const shipments = shipmentsRes.data ?? []

      setStats({
        totalOrders: orders.length,
        activeOrders: orders.filter(
          (o: { status: string }) =>
            o.status === "confirmed" || o.status === "in_production"
        ).length,
        samplesPending: samples.filter(
          (s: { status: string }) =>
            s.status === "requested" || s.status === "in_progress"
        ).length,
        shipments: shipments.length,
      })
    } catch {
      toast.error("Failed to load buyer")
      setBuyer(null)
    } finally {
      setLoading(false)
    }
  }, [buyerId, companyId])

  useEffect(() => {
    loadBuyer()
  }, [loadBuyer])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-48 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!buyer) {
    return (
      <EmptyState
        title="Buyer not found"
        description="The buyer you are looking for does not exist."
        action={
          <Button variant="outline" onClick={() => router.push("/masters/buyers")}>
            Back to Buyers
          </Button>
        }
      />
    )
  }

  return (
    <div>
      <PageHeader
        title={buyer.name}
        description={`Buyer Code: ${buyer.code}`}
        breadcrumb={[
          { label: "Masters", href: "/masters" },
          { label: "Buyers", href: "/masters/buyers" },
          { label: buyer.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/masters/buyers")}>
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
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="samples">Samples</TabsTrigger>
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main info card */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Buyer Information</CardTitle>
                  {buyer.is_active ? (
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
                  value={buyer.email}
                />
                <InfoRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone"
                  value={buyer.phone}
                />
                <InfoRow
                  icon={<Globe className="h-4 w-4" />}
                  label="Contact Person"
                  value={buyer.contact_person}
                />
                <InfoRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Address"
                  value={
                    [buyer.address, buyer.city, buyer.country]
                      .filter(Boolean)
                      .join(", ") || null
                  }
                />
                <InfoRow
                  icon={<CreditCard className="h-4 w-4" />}
                  label="Payment Terms"
                  value={buyer.payment_terms}
                />
                <InfoRow
                  icon={<CreditCard className="h-4 w-4" />}
                  label="Default Currency"
                  value={buyer.default_currency}
                />
                <InfoRow
                  icon={<CheckCircle className="h-4 w-4" />}
                  label="Quality Standard"
                  value={buyer.quality_standard}
                />
              </CardContent>
            </Card>

            {/* Summary card */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-5">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Total Orders</span>
                      <span className="text-sm font-semibold text-gray-900">{stats.totalOrders}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Active Orders</span>
                      <span className="text-sm font-semibold text-gray-900">{stats.activeOrders}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Samples Pending</span>
                      <span className="text-sm font-semibold text-gray-900">{stats.samplesPending}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-500">Shipments</span>
                      <span className="text-sm font-semibold text-gray-900">{stats.shipments}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <EmptyState
            title="No orders yet"
            description="Orders linked to this buyer will appear here."
          />
        </TabsContent>

        <TabsContent value="samples" className="mt-4">
          <EmptyState
            title="No samples yet"
            description="Samples linked to this buyer will appear here."
          />
        </TabsContent>

        <TabsContent value="shipments" className="mt-4">
          <EmptyState
            title="No shipments yet"
            description="Shipments linked to this buyer will appear here."
          />
        </TabsContent>

        <TabsContent value="communication" className="mt-4">
          <EmptyState
            title="No communication records"
            description="Communication logs linked to this buyer will appear here."
          />
        </TabsContent>
      </Tabs>

      <FormSheet
        title="Edit Buyer"
        description={`Editing ${buyer.name}`}
        open={editOpen}
        onOpenChange={setEditOpen}
        size="md"
        footer={null}
      >
        <BuyerForm
          companyId={companyId}
          buyer={buyer}
          onSuccess={(updated) => {
            setBuyer(updated)
            setEditOpen(false)
            toast.success("Buyer updated")
          }}
          onCancel={() => setEditOpen(false)}
        />
      </FormSheet>
    </div>
  )
}
