"use client";

import * as React from "react";
import {
  BookOpen,
  Gauge,
  ShieldCheck,
  Layers,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn, formatNumber, formatDate } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import {
  getStyleLearningData,
  type StyleCard as StyleCardType,
} from "@/lib/actions/analytics";

/* ---------- Helpers ---------- */

function getEfficiencyColor(pct: number): string {
  if (pct >= 75) return "text-green-700";
  if (pct >= 55) return "text-amber-600";
  return "text-red-600";
}

function getPassRateColor(pct: number): string {
  if (pct >= 90) return "text-green-700";
  if (pct >= 70) return "text-amber-600";
  return "text-red-600";
}

function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    "T-shirt": "bg-blue-100 text-blue-700",
    Polo: "bg-indigo-100 text-indigo-700",
    Hoodie: "bg-purple-100 text-purple-700",
    Jacket: "bg-orange-100 text-orange-700",
    Trouser: "bg-green-100 text-green-700",
    Shorts: "bg-teal-100 text-teal-700",
    Dress: "bg-pink-100 text-pink-700",
    Shirt: "bg-cyan-100 text-cyan-700",
    Sweatshirt: "bg-violet-100 text-violet-700",
  };
  return map[category] || "bg-gray-100 text-gray-700";
}

/* ---------- Skeleton ---------- */

function StyleCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm animate-pulse">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-4 w-28 rounded bg-gray-200" />
            <div className="h-3 w-40 rounded bg-gray-200" />
          </div>
          <div className="h-5 w-16 rounded bg-gray-200" />
        </div>
        <div className="h-3 w-24 rounded bg-gray-200" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-14 rounded bg-gray-200" />
              <div className="h-4 w-10 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- StyleCard Component ---------- */

interface StyleCardItemProps {
  style: StyleCardType;
}

function StyleCardItem({ style }: StyleCardItemProps) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Card
      className={cn(
        "transition-shadow hover:shadow-md cursor-pointer",
        expanded && "ring-1 ring-blue-200"
      )}
      onClick={() => setExpanded((v) => !v)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm font-bold text-gray-900 truncate">
              {style.styleCode}
            </CardTitle>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {style.styleName}
            </p>
          </div>
          <Badge
            className={cn(
              "shrink-0 text-xs",
              getCategoryColor(style.category)
            )}
          >
            {style.category}
          </Badge>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Buyer: {style.buyer}
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-3 mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
              Orders
            </p>
            <p className="text-sm font-bold tabular-nums text-gray-900">
              {formatNumber(style.ordersCount)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
              Total Qty
            </p>
            <p className="text-sm font-bold tabular-nums text-gray-900">
              {formatNumber(style.totalQuantityProduced)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
              Fabric/pc
            </p>
            <p className="text-sm font-bold tabular-nums text-gray-900">
              {style.actualFabricPerPiece > 0
                ? `${style.actualFabricPerPiece.toFixed(3)} m`
                : "--"}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
              Avg Eff %
            </p>
            <p
              className={cn(
                "text-sm font-bold tabular-nums",
                style.avgEfficiency > 0
                  ? getEfficiencyColor(style.avgEfficiency)
                  : "text-gray-400"
              )}
            >
              {style.avgEfficiency > 0 ? `${style.avgEfficiency}%` : "--"}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
              Marker Eff %
            </p>
            <p className="text-sm font-bold tabular-nums text-gray-900">
              {style.markerEfficiency > 0
                ? `${style.markerEfficiency}%`
                : "--"}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
              QC Pass %
            </p>
            <p
              className={cn(
                "text-sm font-bold tabular-nums",
                style.qualityPassRate > 0
                  ? getPassRateColor(style.qualityPassRate)
                  : "text-gray-400"
              )}
            >
              {style.qualityPassRate > 0 ? `${style.qualityPassRate}%` : "--"}
            </p>
          </div>
        </div>

        {/* Common Defects */}
        {style.commonDefects.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-1">
              Common Defects
            </p>
            <div className="flex flex-wrap gap-1">
              {style.commonDefects.map((defect) => (
                <span
                  key={defect}
                  className="inline-block rounded-md bg-red-50 border border-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700"
                >
                  {defect}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expand Toggle */}
        <button
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium mt-1"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              Show details
            </>
          )}
        </button>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <span className="text-gray-400">BOM Fabric/pc:</span>{" "}
                <span className="font-medium text-gray-700">
                  {style.bomFabricPerPiece > 0
                    ? `${style.bomFabricPerPiece.toFixed(3)} m`
                    : "--"}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Actual SMV:</span>{" "}
                <span className="font-medium text-gray-700">
                  {style.actualSmv > 0 ? style.actualSmv.toFixed(2) : "--"}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Theoretical SMV:</span>{" "}
                <span className="font-medium text-gray-700">
                  {style.theoreticalSmv > 0
                    ? style.theoreticalSmv.toFixed(2)
                    : "--"}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Recipe Used:</span>{" "}
                <span className="font-medium text-gray-700">
                  {style.recipeUsed || "--"}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400">Last Produced:</span>{" "}
                <span className="font-medium text-gray-700">
                  {style.lastProducedDate
                    ? formatDate(style.lastProducedDate)
                    : "--"}
                </span>
              </div>
              {style.specialNotes && (
                <div className="col-span-2">
                  <span className="text-gray-400">Notes:</span>{" "}
                  <span className="font-medium text-gray-700">
                    {style.specialNotes}
                  </span>
                </div>
              )}
            </div>

            {/* Fabric Variance */}
            {style.bomFabricPerPiece > 0 && style.actualFabricPerPiece > 0 && (
              <div className="rounded-lg bg-gray-50 p-2 text-xs">
                <span className="text-gray-500">Fabric Variance: </span>
                {(() => {
                  const variance =
                    ((style.actualFabricPerPiece - style.bomFabricPerPiece) /
                      style.bomFabricPerPiece) *
                    100;
                  return (
                    <span
                      className={cn(
                        "font-semibold",
                        variance > 5
                          ? "text-red-600"
                          : variance > 0
                          ? "text-amber-600"
                          : "text-green-600"
                      )}
                    >
                      {variance > 0 ? "+" : ""}
                      {variance.toFixed(1)}% vs BOM
                    </span>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------- Page ---------- */

export default function StyleLibraryPage() {
  const { profile } = useProfile();
  const companyId = profile?.company_id;

  const [styles, setStyles] = React.useState<StyleCardType[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    if (!companyId) return;

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const result = await getStyleLearningData(companyId!);
        if (result.error) {
          if (!cancelled) setError(result.error);
          toast.error("Failed to load style library data");
        } else {
          if (!cancelled) setStyles(result.data ?? []);
        }
      } catch {
        if (!cancelled) setError("An unexpected error occurred");
        toast.error("An unexpected error occurred");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  /* ---------- Filtered Styles ---------- */

  const filtered = React.useMemo(() => {
    if (!searchQuery.trim()) return styles;
    const q = searchQuery.toLowerCase();
    return styles.filter(
      (s) =>
        s.styleCode.toLowerCase().includes(q) ||
        s.styleName.toLowerCase().includes(q) ||
        s.buyer.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [styles, searchQuery]);

  /* ---------- Stats ---------- */

  const totalStyles = styles.length;
  const avgEfficiency =
    styles.length > 0
      ? Math.round(
          styles.reduce((s, st) => s + st.avgEfficiency, 0) / styles.length
        )
      : 0;
  const avgQCPassRate =
    styles.length > 0
      ? Math.round(
          styles.reduce((s, st) => s + st.qualityPassRate, 0) / styles.length
        )
      : 0;
  const activeStyles = styles.filter(
    (s) => s.ordersCount > 0
  ).length;

  /* ---------- Loading State ---------- */

  if (!companyId || loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Style Learning Database"
          description="Historical data for every style ever produced"
          breadcrumb={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Style Library" },
          ]}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCard key={i} title="" value="" loading />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <StyleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  /* ---------- Error State ---------- */

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Style Learning Database"
          description="Historical data for every style ever produced"
          breadcrumb={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Style Library" },
          ]}
        />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="mb-3 h-10 w-10 text-red-300" />
          <p className="text-sm font-medium text-gray-600">{error}</p>
          <p className="text-xs text-gray-400 mt-1">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  /* ---------- Empty State ---------- */

  if (styles.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Style Learning Database"
          description="Historical data for every style ever produced"
          breadcrumb={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Style Library" },
          ]}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Styles"
            value="0"
            icon={<BookOpen className="h-5 w-5" />}
            color="blue"
          />
          <StatCard
            title="Avg Efficiency %"
            value="0%"
            icon={<Gauge className="h-5 w-5" />}
            color="green"
          />
          <StatCard
            title="Avg QC Pass Rate %"
            value="0%"
            icon={<ShieldCheck className="h-5 w-5" />}
            color="purple"
          />
          <StatCard
            title="Active Styles"
            value="0"
            icon={<Layers className="h-5 w-5" />}
            color="orange"
          />
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Layers className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">
            No styles found
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Add products in the Masters section to build your style library
          </p>
        </div>
      </div>
    );
  }

  /* ---------- Main Render ---------- */

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Style Learning Database"
        description="Historical data for every style ever produced"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Style Library" },
        ]}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Styles"
          value={formatNumber(totalStyles)}
          icon={<BookOpen className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Avg Efficiency %"
          value={`${avgEfficiency}%`}
          icon={<Gauge className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Avg QC Pass Rate %"
          value={`${avgQCPassRate}%`}
          icon={<ShieldCheck className="h-5 w-5" />}
          color="purple"
        />
        <StatCard
          title="Active Styles"
          value={formatNumber(activeStyles)}
          icon={<Layers className="h-5 w-5" />}
          color="orange"
        />
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by style code, name, buyer, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Results Count */}
      {searchQuery.trim() && (
        <p className="text-xs text-gray-500">
          Showing {formatNumber(filtered.length)} of{" "}
          {formatNumber(styles.length)} styles
        </p>
      )}

      {/* No Search Results */}
      {filtered.length === 0 && searchQuery.trim() && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">
            No styles match your search
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Try a different style code, name, or buyer
          </p>
        </div>
      )}

      {/* Style Cards Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((style) => (
            <StyleCardItem key={style.id} style={style} />
          ))}
        </div>
      )}
    </div>
  );
}
