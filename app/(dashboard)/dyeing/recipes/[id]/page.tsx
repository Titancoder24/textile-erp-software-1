import * as React from "react";
import Link from "next/link";
import {
  Copy,
  GitBranch,
  CheckCircle,
  Download,
} from "lucide-react";

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

interface Ingredient {
  chemical: string;
  gPerKg: number;
  pct: number;
  unit: string;
  purpose: string;
}

interface RecipeVersion {
  version: string;
  createdAt: string;
  createdBy: string;
  notes: string;
  ingredients: Ingredient[];
  costPerKg: number;
  status: "approved" | "draft" | "archived";
}

interface RecipeDetail {
  id: string;
  name: string;
  shade: string;
  pantone: string;
  buyer: string;
  fabricType: string;
  dyeingMethod: string;
  processTemp: number;
  processTime: number;
  versions: RecipeVersion[];
  currentVersion: string;
}

/* ---------- Mock data ---------- */

const MOCK: Record<string, RecipeDetail> = {
  "RCP-0042": {
    id: "RCP-0042",
    name: "Navy Blue Standard",
    shade: "Navy Blue",
    pantone: "19-3832 TCX",
    buyer: "Zara International",
    fabricType: "100% Cotton",
    dyeingMethod: "Reactive Dyeing",
    processTemp: 60,
    processTime: 90,
    currentVersion: "v3",
    versions: [
      {
        version: "v3",
        createdAt: "2026-01-15",
        createdBy: "Suresh Kumar",
        notes: "Increased fixation agent by 2% for better wash fastness.",
        costPerKg: 42.5,
        status: "approved",
        ingredients: [
          {
            chemical: "Reactive Blue 19",
            gPerKg: 28.0,
            pct: 2.8,
            unit: "g/kg",
            purpose: "Primary dye",
          },
          {
            chemical: "Reactive Black 5",
            gPerKg: 8.5,
            pct: 0.85,
            unit: "g/kg",
            purpose: "Depth addition",
          },
          {
            chemical: "Sodium Chloride",
            gPerKg: 80.0,
            pct: 8.0,
            unit: "g/kg",
            purpose: "Electrolyte",
          },
          {
            chemical: "Sodium Carbonate",
            gPerKg: 20.0,
            pct: 2.0,
            unit: "g/kg",
            purpose: "Alkali / fixing agent",
          },
          {
            chemical: "Leveling Agent",
            gPerKg: 2.0,
            pct: 0.2,
            unit: "g/kg",
            purpose: "Uniformity",
          },
          {
            chemical: "Anti-creasing Agent",
            gPerKg: 1.5,
            pct: 0.15,
            unit: "g/kg",
            purpose: "Fabric protection",
          },
        ],
      },
      {
        version: "v2",
        createdAt: "2025-11-20",
        createdBy: "Suresh Kumar",
        notes: "Adjusted sodium chloride concentration.",
        costPerKg: 40.2,
        status: "archived",
        ingredients: [
          {
            chemical: "Reactive Blue 19",
            gPerKg: 26.0,
            pct: 2.6,
            unit: "g/kg",
            purpose: "Primary dye",
          },
          {
            chemical: "Reactive Black 5",
            gPerKg: 8.5,
            pct: 0.85,
            unit: "g/kg",
            purpose: "Depth addition",
          },
          {
            chemical: "Sodium Chloride",
            gPerKg: 75.0,
            pct: 7.5,
            unit: "g/kg",
            purpose: "Electrolyte",
          },
          {
            chemical: "Sodium Carbonate",
            gPerKg: 18.0,
            pct: 1.8,
            unit: "g/kg",
            purpose: "Alkali / fixing agent",
          },
        ],
      },
      {
        version: "v1",
        createdAt: "2025-09-10",
        createdBy: "Ramesh Patel",
        notes: "Initial recipe development.",
        costPerKg: 38.0,
        status: "archived",
        ingredients: [
          {
            chemical: "Reactive Blue 19",
            gPerKg: 24.0,
            pct: 2.4,
            unit: "g/kg",
            purpose: "Primary dye",
          },
          {
            chemical: "Sodium Chloride",
            gPerKg: 70.0,
            pct: 7.0,
            unit: "g/kg",
            purpose: "Electrolyte",
          },
          {
            chemical: "Sodium Carbonate",
            gPerKg: 18.0,
            pct: 1.8,
            unit: "g/kg",
            purpose: "Alkali / fixing agent",
          },
        ],
      },
    ],
  },
};

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-500",
};

/* ---------- Page ---------- */

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const recipe = MOCK[id] ?? MOCK["RCP-0042"];
  const currentVer = recipe.versions.find((v) => v.version === recipe.currentVersion)!;

  return (
    <div className="space-y-6">
      <PageHeader
        title={recipe.name}
        description={`${recipe.id} · ${recipe.shade} · ${recipe.pantone}`}
        breadcrumb={[
          { label: "Dyeing", href: "/dyeing" },
          { label: "Recipes", href: "/dyeing/recipes" },
          { label: recipe.id },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Copy className="mr-2 h-4 w-4" />
              Clone
            </Button>
            <Button variant="outline" size="sm">
              <GitBranch className="mr-2 h-4 w-4" />
              New Version
            </Button>
            {currentVer.status !== "approved" && (
              <Button size="sm">
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      {/* Header info */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="border-b border-gray-100 px-6 py-4">
            <p className="text-sm font-semibold text-gray-900">Recipe Information</p>
          </div>
          <CardContent className="p-6">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              {[
                { label: "Recipe ID", value: recipe.id },
                { label: "Name", value: recipe.name },
                { label: "Shade", value: recipe.shade },
                { label: "Pantone", value: recipe.pantone },
                { label: "Buyer", value: recipe.buyer },
                { label: "Fabric Type", value: recipe.fabricType },
                { label: "Dyeing Method", value: recipe.dyeingMethod },
                { label: "Process Temp", value: `${recipe.processTemp}°C` },
                { label: "Process Time", value: `${recipe.processTime} min` },
                {
                  label: "Current Version",
                  value: recipe.currentVersion,
                },
                {
                  label: "Status",
                  value: (
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_BADGE[currentVer.status]}`}
                    >
                      {currentVer.status}
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

        {/* Cost summary */}
        <Card>
          <div className="border-b border-gray-100 px-6 py-4">
            <p className="text-sm font-semibold text-gray-900">Cost Summary</p>
          </div>
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Dyes</span>
              <span className="font-semibold">₹24.80/kg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Auxiliaries</span>
              <span className="font-semibold">₹12.40/kg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Water + Energy</span>
              <span className="font-semibold">₹5.30/kg</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 text-base">
              <span className="font-semibold text-gray-700">Total Cost/kg</span>
              <span className="font-bold text-gray-900">
                ₹{currentVer.costPerKg.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Version tabs with ingredients */}
      <Card>
        <div className="border-b border-gray-100 px-6 pt-4">
          <p className="mb-3 text-sm font-semibold text-gray-900">Ingredients &amp; Version History</p>
          <Tabs defaultValue={recipe.currentVersion}>
            <TabsList>
              {recipe.versions.map((v) => (
                <TabsTrigger key={v.version} value={v.version}>
                  {v.version}
                  {v.version === recipe.currentVersion && (
                    <span className="ml-1.5 rounded bg-green-100 px-1 py-0.5 text-[10px] font-bold text-green-700">
                      Current
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {recipe.versions.map((ver) => (
              <TabsContent key={ver.version} value={ver.version} className="mt-0 pb-4">
                <div className="mt-3 mb-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 px-0">
                  <span>Created: {ver.createdAt}</span>
                  <span>By: {ver.createdBy}</span>
                  <span>Cost: ₹{ver.costPerKg.toFixed(2)}/kg</span>
                  <span
                    className={`rounded px-1.5 py-0.5 font-semibold capitalize ${STATUS_BADGE[ver.status]}`}
                  >
                    {ver.status}
                  </span>
                </div>
                {ver.notes && (
                  <p className="mb-3 rounded-lg bg-gray-50 px-4 py-2 text-xs text-gray-600 italic">
                    {ver.notes}
                  </p>
                )}
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      {["Chemical / Dye", "g/kg", "%", "Unit", "Purpose"].map((h) => (
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
                    {ver.ingredients.map((ing) => (
                      <TableRow key={ing.chemical} className="border-b border-gray-100">
                        <TableCell className="py-2.5 text-sm font-medium text-gray-900">
                          {ing.chemical}
                        </TableCell>
                        <TableCell className="py-2.5 text-sm text-gray-700">
                          {ing.gPerKg.toFixed(1)}
                        </TableCell>
                        <TableCell className="py-2.5 text-sm text-gray-700">
                          {ing.pct.toFixed(2)}%
                        </TableCell>
                        <TableCell className="py-2.5 text-sm text-gray-600">
                          {ing.unit}
                        </TableCell>
                        <TableCell className="py-2.5 text-sm text-gray-500">
                          {ing.purpose}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </Card>
    </div>
  );
}
