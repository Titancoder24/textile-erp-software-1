"use client";

import * as React from "react";
import Link from "next/link";
import {
  FlaskConical,
  Layers,
  Percent,
  Droplets,
  BookOpen,
  GitBranch,
} from "lucide-react";
import { toast } from "sonner";

import { StatCard } from "@/components/ui/stat-card";
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
import { useCompany } from "@/contexts/company-context";
import { getDyeingDashboardStats } from "@/lib/actions/dyeing";

/* ---------- Types ---------- */

interface DashboardStats {
  activeBatchesCount: number;
  pendingShadeApproval: number;
  avgProcessLoss: number;
  pendingLabDips: number;
  activeBatchDetails: ActiveBatch[];
}

interface ActiveBatch {
  id: string;
  batchNumber: string;
  order: string;
  color: string;
  recipe: string;
  inputKg: number;
  stage: string;
  stageColor: string;
}

/* ---------- Quick Links ---------- */

const QUICK_LINKS = [
  {
    title: "Batches",
    description: "Manage dyeing batch records and process logs",
    href: "/dyeing/batches",
    icon: FlaskConical,
  },
  {
    title: "Recipes",
    description: "Dye recipe library with version control",
    href: "/dyeing/recipes",
    icon: BookOpen,
  },
  {
    title: "Lab Dips",
    description: "Lab dip submissions and shade approvals",
    href: "/lab-dips",
    icon: GitBranch,
  },
];

/* ---------- Stage color mapping ---------- */

function getStageColor(status: string): string {
  const statusLower = (status || "").toLowerCase();
  if (statusLower.includes("dye") || statusLower === "in_progress") return "bg-blue-100 text-blue-700";
  if (statusLower.includes("finish") || statusLower === "completed") return "bg-green-100 text-green-700";
  if (statusLower.includes("scour") || statusLower.includes("bleach")) return "bg-orange-100 text-orange-700";
  if (statusLower === "planned") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-700";
}

function getStageLabel(status: string, stages: Record<string, unknown>[] | null): string {
  // If we have batch_stages, show the latest incomplete stage name
  if (stages && Array.isArray(stages) && stages.length > 0) {
    const incomplete = stages.filter((s) => !s.completed_at);
    if (incomplete.length > 0) {
      return incomplete[0].stage_name as string;
    }
    // All completed - show last stage
    return (stages[stages.length - 1] as Record<string, unknown>).stage_name as string;
  }
  // Fallback to status
  if (status === "planned") return "Planned";
  if (status === "in_progress") return "Dyeing";
  if (status === "completed") return "Completed";
  return status || "Unknown";
}

/* ---------- Page ---------- */

export default function DyeingPage() {
  const { companyId } = useCompany();
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState<DashboardStats>({
    activeBatchesCount: 0,
    pendingShadeApproval: 0,
    avgProcessLoss: 0,
    pendingLabDips: 0,
    activeBatchDetails: [],
  });

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDyeingDashboardStats(companyId);
      if (result.error) {
        toast.error("Failed to load dyeing data: " + result.error);
      } else if (result.data) {
        const d = result.data;
        const batches: ActiveBatch[] = (d.active_batch_details ?? []).map(
          (batch: Record<string, unknown>) => {
            const orderObj = batch.sales_orders as Record<string, unknown> | null;
            const recipeObj = batch.recipes as Record<string, unknown> | null;
            const stagesArr = batch.batch_stages as Record<string, unknown>[] | null;
            const status = batch.status as string;
            const stageLabel = getStageLabel(status, stagesArr);

            return {
              id: batch.id as string,
              batchNumber: batch.batch_number as string,
              order: (orderObj?.order_number as string) || "—",
              color: (batch.color_name as string) || "—",
              recipe: (recipeObj?.recipe_number as string) || "—",
              inputKg: Number(batch.input_quantity_kg) || 0,
              stage: stageLabel,
              stageColor: getStageColor(stageLabel),
            };
          }
        );

        setStats({
          activeBatchesCount: d.active_batches_count,
          pendingShadeApproval: d.pending_shade_approval,
          avgProcessLoss: d.avg_process_loss,
          pendingLabDips: d.pending_lab_dips,
          activeBatchDetails: batches,
        });
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

  const statCards = [
    {
      title: "Active Batches",
      value: loading ? "..." : String(stats.activeBatchesCount),
      changeLabel: `${stats.activeBatchesCount > 0 ? stats.activeBatchesCount : "No"} in process`,
      icon: <FlaskConical className="h-5 w-5" />,
      color: "blue" as const,
      href: "/dyeing/batches",
    },
    {
      title: "Pending Shade Approval",
      value: loading ? "..." : String(stats.pendingShadeApproval),
      changeLabel: "awaiting buyer approval",
      icon: <Layers className="h-5 w-5" />,
      color: "orange" as const,
      href: "/dyeing/batches",
    },
    {
      title: "Avg Process Loss %",
      value: loading ? "..." : `${stats.avgProcessLoss}%`,
      changeLabel: "across completed batches",
      icon: <Percent className="h-5 w-5" />,
      color: "green" as const,
    },
    {
      title: "Pending Lab Dips",
      value: loading ? "..." : String(stats.pendingLabDips),
      changeLabel: "pending or submitted",
      icon: <Droplets className="h-5 w-5" />,
      color: "purple" as const,
      href: "/lab-dips",
    },
  ];

  const quickLinksWithBadges = QUICK_LINKS.map((link) => {
    let badge = "";
    let badgeColor = "bg-gray-100 text-gray-600";
    if (link.href === "/dyeing/batches") {
      badge = loading ? "..." : `${stats.activeBatchesCount} active`;
      badgeColor = "bg-blue-100 text-blue-700";
    } else if (link.href === "/dyeing/recipes") {
      badge = "View library";
      badgeColor = "bg-gray-100 text-gray-600";
    } else if (link.href === "/lab-dips") {
      badge = loading ? "..." : `${stats.pendingLabDips} pending`;
      badgeColor = "bg-purple-100 text-purple-700";
    }
    return { ...link, badge, badgeColor };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dyeing"
        description="Batch management, recipe library, and lab dip tracking."
        breadcrumb={[{ label: "Dyeing" }]}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            changeLabel={stat.changeLabel}
            icon={stat.icon}
            color={stat.color}
            href={stat.href}
          />
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {quickLinksWithBadges.map(({ title, description, href, icon: Icon, badge, badgeColor }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-blue-50 transition-colors">
                <Icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeColor}`}>
                {badge}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
              {title}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">{description}</p>
          </Link>
        ))}
      </div>

      {/* Active Batches */}
      <Card>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Active Batches</p>
            <p className="text-xs text-gray-500">Currently in process</p>
          </div>
          <Link href="/dyeing/batches" className="text-xs font-medium text-blue-600 hover:underline">
            View all
          </Link>
        </div>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            </div>
          ) : stats.activeBatchDetails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FlaskConical className="mb-2 h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-500">No active batches</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  {["Batch #", "Order", "Color", "Recipe", "Input (kg)", "Stage"].map((h) => (
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
                {stats.activeBatchDetails.map((batch) => (
                  <TableRow key={batch.id} className="border-b border-gray-100">
                    <TableCell className="py-3">
                      <Link
                        href={`/dyeing/batches/${batch.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {batch.batchNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="py-3 text-sm text-gray-700">{batch.order}</TableCell>
                    <TableCell className="py-3 text-sm text-gray-700">{batch.color}</TableCell>
                    <TableCell className="py-3 text-sm text-gray-700">{batch.recipe}</TableCell>
                    <TableCell className="py-3 text-sm text-gray-700">{batch.inputKg}</TableCell>
                    <TableCell className="py-3">
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${batch.stageColor}`}
                      >
                        {batch.stage}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
