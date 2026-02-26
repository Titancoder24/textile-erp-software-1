"use client"

import Link from "next/link"
import {
  Users,
  Truck,
  Palette,
  Ruler,
  Layers,
  Scissors,
  FlaskConical,
  Package,
  Cog,
  UserCheck,
  GitBranch,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"

const MASTER_CATEGORIES = [
  {
    title: "Buyers",
    description: "Manage buyer and brand master data",
    href: "/masters/buyers",
    icon: Users,
    color: "bg-blue-50 text-blue-600",
    count: null,
  },
  {
    title: "Suppliers",
    description: "Manage supplier and vendor master data",
    href: "/masters/suppliers",
    icon: Truck,
    color: "bg-green-50 text-green-600",
    count: null,
  },
  {
    title: "Colors",
    description: "Color library with Pantone references",
    href: "/masters/colors",
    icon: Palette,
    color: "bg-purple-50 text-purple-600",
    count: null,
  },
  {
    title: "Sizes",
    description: "Size masters with sort order",
    href: "/masters/sizes",
    icon: Ruler,
    color: "bg-orange-50 text-orange-600",
    count: null,
  },
  {
    title: "Fabrics",
    description: "Fabric library with GSM, composition and rates",
    href: "/masters/fabrics",
    icon: Layers,
    color: "bg-cyan-50 text-cyan-600",
    count: null,
  },
  {
    title: "Trims",
    description: "Trim and accessory master data",
    href: "/masters/trims",
    icon: Scissors,
    color: "bg-pink-50 text-pink-600",
    count: null,
  },
  {
    title: "Chemicals",
    description: "Chemical and auxiliary master data",
    href: "/masters/chemicals",
    icon: FlaskConical,
    color: "bg-yellow-50 text-yellow-600",
    count: null,
  },
  {
    title: "Products",
    description: "Style and product master data",
    href: "/masters/products",
    icon: Package,
    color: "bg-indigo-50 text-indigo-600",
    count: null,
  },
  {
    title: "Machines",
    description: "Machine and equipment master data",
    href: "/masters/machines",
    icon: Cog,
    color: "bg-gray-100 text-gray-600",
    count: null,
  },
  {
    title: "Employees",
    description: "Employee skills and department data",
    href: "/masters/employees",
    icon: UserCheck,
    color: "bg-teal-50 text-teal-600",
    count: null,
  },
  {
    title: "Operations",
    description: "Production operation master with SMV",
    href: "/masters/operations",
    icon: GitBranch,
    color: "bg-rose-50 text-rose-600",
    count: null,
  },
]

export default function MastersPage() {
  return (
    <div>
      <PageHeader
        title="Masters"
        description="Manage all master data for your factory"
        breadcrumb={[{ label: "Masters" }]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {MASTER_CATEGORIES.map((category) => {
          const Icon = category.icon
          return (
            <Link key={category.href} href={category.href}>
              <Card className="group cursor-pointer transition-all duration-150 hover:shadow-md hover:border-gray-300">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${category.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {category.title}
                        </h3>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
