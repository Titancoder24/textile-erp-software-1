import * as React from "react";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ---------- Types ---------- */

interface StageLog {
  stage: "Scouring" | "Bleaching" | "Dyeing" | "Finishing";
  status: "completed" | "in_progress" | "pending";
  startTime: string | null;
  endTime: string | null;
  inputKg: number;
  outputKg: number | null;
  processLossPct: number | null;
  operator: string;
  machine: string;
  temp: number | null;
  duration: number | null;
  chemicals: Array<{ name: string; qty: number; unit: string }>;
  notes: string;
}

interface BatchDetail {
  id: string;
  order: string;
  buyer: string;
  color: string;
  recipe: string;
  inputKg: number;
  plannedDate: string;
  machine: string;
  status: string;
  shadeResult: string;
  stages: StageLog[];
}

/* ---------- Mock data ---------- */

const MOCK: Record<string, BatchDetail> = {
  "BAT-0085": {
    id: "BAT-0085",
    order: "ORD-2401",
    buyer: "Zara International",
    color: "Navy Blue",
    recipe: "RCP-0042",
    inputKg: 120,
    plannedDate: "2026-02-26",
    machine: "JFO Machine 2 — 150kg",
    status: "dyeing",
    shadeResult: "pending",
    stages: [
      {
        stage: "Scouring",
        status: "completed",
        startTime: "2026-02-26 06:00",
        endTime: "2026-02-26 08:30",
        inputKg: 120,
        outputKg: 118.4,
        processLossPct: 1.3,
        operator: "Mohan Singh",
        machine: "JFO Machine 2",
        temp: 90,
        duration: 150,
        chemicals: [
          { name: "Caustic Soda", qty: 3.6, unit: "kg" },
          { name: "Scouring Agent", qty: 1.2, unit: "kg" },
          { name: "Hydrogen Peroxide", qty: 2.4, unit: "kg" },
        ],
        notes: "No issues observed. Fabric scoured uniformly.",
      },
      {
        stage: "Bleaching",
        status: "completed",
        startTime: "2026-02-26 09:00",
        endTime: "2026-02-26 11:00",
        inputKg: 118.4,
        outputKg: 117.2,
        processLossPct: 1.0,
        operator: "Mohan Singh",
        machine: "JFO Machine 2",
        temp: 80,
        duration: 120,
        chemicals: [
          { name: "Hydrogen Peroxide 35%", qty: 5.9, unit: "kg" },
          { name: "Optical Brightener", qty: 0.59, unit: "kg" },
          { name: "Stabilizer", qty: 1.2, unit: "kg" },
        ],
        notes: "Whiteness index achieved.",
      },
      {
        stage: "Dyeing",
        status: "in_progress",
        startTime: "2026-02-26 11:30",
        endTime: null,
        inputKg: 117.2,
        outputKg: null,
        processLossPct: null,
        operator: "Suresh Kumar",
        machine: "JFO Machine 2",
        temp: 60,
        duration: null,
        chemicals: [
          { name: "Reactive Blue 19", qty: 3.29, unit: "kg" },
          { name: "Reactive Black 5", qty: 1.0, unit: "kg" },
          { name: "Sodium Chloride", qty: 9.38, unit: "kg" },
          { name: "Sodium Carbonate", qty: 2.34, unit: "kg" },
          { name: "Leveling Agent", qty: 0.23, unit: "kg" },
        ],
        notes: "Currently at 60°C, 45 min remaining.",
      },
      {
        stage: "Finishing",
        status: "pending",
        startTime: null,
        endTime: null,
        inputKg: 0,
        outputKg: null,
        processLossPct: null,
        operator: "—",
        machine: "JFO Machine 2",
        temp: null,
        duration: null,
        chemicals: [],
        notes: "",
      },
    ],
  },
};

const STAGE_STATUS_CONFIG: Record<
  string,
  { icon: React.ReactNode; color: string; bg: string; border: string }
> = {
  completed: {
    icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  in_progress: {
    icon: (
      <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
    ),
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  pending: {
    icon: <Clock className="h-5 w-5 text-gray-400" />,
    color: "text-gray-500",
    bg: "bg-gray-50",
    border: "border-gray-200",
  },
};

/* ---------- Page ---------- */

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BatchDetailPage({ params }: PageProps) {
  const { id } = await params;
  const batch = MOCK[id] ?? MOCK["BAT-0085"];

  const completedStages = batch.stages.filter((s) => s.status === "completed");
  const totalInputKg = batch.inputKg;
  const lastOutput =
    completedStages.length > 0
      ? completedStages[completedStages.length - 1].outputKg
      : null;
  const overallLoss =
    lastOutput !== null
      ? (((totalInputKg - lastOutput) / totalInputKg) * 100).toFixed(1)
      : "—";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Batch ${batch.id}`}
        description={`${batch.color} · ${batch.recipe} · ${batch.order}`}
        breadcrumb={[
          { label: "Dyeing", href: "/dyeing" },
          { label: "Batches", href: "/dyeing/batches" },
          { label: batch.id },
        ]}
      />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Order", value: batch.order },
          { label: "Buyer", value: batch.buyer },
          { label: "Color", value: batch.color },
          { label: "Recipe", value: batch.recipe },
          { label: "Input Weight", value: `${batch.inputKg} kg` },
          {
            label: "Current Output",
            value: lastOutput !== null ? `${lastOutput} kg` : "—",
          },
          { label: "Overall Process Loss", value: `${overallLoss}%` },
          { label: "Machine", value: batch.machine },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <dt className="text-xs font-medium text-gray-500">{label}</dt>
            <dd className="mt-0.5 text-sm font-bold text-gray-900">{value}</dd>
          </div>
        ))}
      </div>

      {/* Stage-wise processing log */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Stage-wise Processing Log</h2>
        {batch.stages.map((stage) => {
          const cfg = STAGE_STATUS_CONFIG[stage.status];
          return (
            <Card key={stage.stage} className={`border ${cfg.border}`}>
              <div className={`flex items-center justify-between border-b px-6 py-4 ${cfg.bg} ${cfg.border}`}>
                <div className="flex items-center gap-3">
                  {cfg.icon}
                  <div>
                    <p className={`text-sm font-semibold ${cfg.color}`}>{stage.stage}</p>
                    {stage.startTime && (
                      <p className="text-xs text-gray-500">
                        {stage.startTime}
                        {stage.endTime ? ` → ${stage.endTime}` : " (in progress)"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <p>Operator: {stage.operator}</p>
                  {stage.temp && <p>{stage.temp}°C</p>}
                  {stage.duration && <p>{stage.duration} min</p>}
                </div>
              </div>

              <CardContent className="p-5">
                {stage.status === "pending" ? (
                  <p className="text-sm text-gray-400 italic">Awaiting previous stage completion.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* Weight summary */}
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Weight Summary
                      </p>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Input</span>
                          <span className="font-semibold">{stage.inputKg} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Output</span>
                          <span className="font-semibold">
                            {stage.outputKg !== null ? `${stage.outputKg} kg` : "—"}
                          </span>
                        </div>
                        {stage.processLossPct !== null && (
                          <div className="flex justify-between border-t border-gray-100 pt-1.5">
                            <span className="text-gray-600">Process Loss</span>
                            <span
                              className={`font-bold ${
                                stage.processLossPct > 3
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {stage.processLossPct.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chemicals */}
                    {stage.chemicals.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Chemicals Used
                        </p>
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500 py-1.5">
                                Chemical
                              </TableHead>
                              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500 py-1.5">
                                Qty
                              </TableHead>
                              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500 py-1.5">
                                Unit
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {stage.chemicals.map((chem) => (
                              <TableRow key={chem.name} className="border-b border-gray-100">
                                <TableCell className="py-1.5 text-xs text-gray-700">
                                  {chem.name}
                                </TableCell>
                                <TableCell className="py-1.5 text-xs font-semibold text-gray-900">
                                  {chem.qty}
                                </TableCell>
                                <TableCell className="py-1.5 text-xs text-gray-600">
                                  {chem.unit}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* Notes */}
                    {stage.notes && (
                      <div className="md:col-span-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                          Notes
                        </p>
                        <p className="text-sm text-gray-600 italic">{stage.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
