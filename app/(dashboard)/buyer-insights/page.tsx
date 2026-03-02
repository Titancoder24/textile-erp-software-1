"use client";

import * as React from "react";
import {
  UserCircle,
  TrendingUp,
  Globe,
  Star,
  FileText,
  Plus,
  Eye,
  DollarSign,
  Calendar,
  ShieldCheck,
  Search,
  ArrowUpDown,
  StickyNote,
  Tag,
  Clock,
  Package,
  BarChart3,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { cn, formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import {
  getBuyerInsightsData,
  type BuyerInsight,
} from "@/lib/actions/analytics";
import { toast } from "sonner";

/* ---------- constants ---------- */

const PAYMENT_BADGE: Record<
  BuyerInsight["paymentReliability"],
  { label: string; className: string }
> = {
  excellent: {
    label: "Excellent",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  good: {
    label: "Good",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  fair: {
    label: "Fair",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  poor: {
    label: "Poor",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-violet-600",
  "bg-rose-600",
  "bg-amber-600",
  "bg-cyan-600",
  "bg-indigo-600",
  "bg-pink-600",
  "bg-teal-600",
  "bg-orange-600",
];

const NOTE_CATEGORIES = [
  "Pricing",
  "Quality",
  "Communication",
  "Payment",
  "General",
] as const;

const NOTE_PRIORITIES = ["Normal", "Important"] as const;

type SortOption = "revenue" | "orders" | "qcPassRate";

interface RelationshipNote {
  id: string;
  text: string;
  category: (typeof NOTE_CATEGORIES)[number];
  priority: (typeof NOTE_PRIORITIES)[number];
  date: string;
}

/* ---------- Skeleton ---------- */

function CardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        <div className="flex gap-5">
          <div className="h-16 w-16 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-40 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="grid grid-cols-3 gap-3 mt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------- page ---------- */

export default function BuyerInsightsPage() {
  const { profile } = useProfile();
  const companyId = profile?.company_id;

  const [data, setData] = React.useState<BuyerInsight[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<SortOption>("revenue");

  // Detail sheet
  const [selectedBuyer, setSelectedBuyer] = React.useState<BuyerInsight | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  // Notes
  const [notesMap, setNotesMap] = React.useState<Record<string, RelationshipNote[]>>({});
  const [noteText, setNoteText] = React.useState("");
  const [noteCategory, setNoteCategory] = React.useState<(typeof NOTE_CATEGORIES)[number]>("General");
  const [notePriority, setNotePriority] = React.useState<(typeof NOTE_PRIORITIES)[number]>("Normal");

  // Quick add note sheet
  const [quickNoteOpen, setQuickNoteOpen] = React.useState(false);
  const [quickNoteBuyerId, setQuickNoteBuyerId] = React.useState<string | null>(null);
  const [quickNoteText, setQuickNoteText] = React.useState("");
  const [quickNoteCategory, setQuickNoteCategory] = React.useState<(typeof NOTE_CATEGORIES)[number]>("General");

  /* fetch */
  React.useEffect(() => {
    if (!companyId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const result = await getBuyerInsightsData(companyId!);
      if (cancelled) return;
      if (result.error) {
        setError(result.error);
        toast.error("Failed to load buyer insights");
      } else {
        setData(result.data ?? []);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  /* derived */
  const filtered = React.useMemo(() => {
    let list = [...data];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.code.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (sortBy === "revenue") return b.totalRevenue - a.totalRevenue;
      if (sortBy === "orders") return b.totalOrders - a.totalOrders;
      return b.qcPassRate - a.qcPassRate;
    });
    return list;
  }, [data, searchQuery, sortBy]);

  const totalActiveBuyers = data.length;
  const totalRevenue = data.reduce((s, b) => s + b.totalRevenue, 0);
  const avgQcPass =
    data.length > 0
      ? Math.round(data.reduce((s, b) => s + b.qcPassRate, 0) / data.length)
      : 0;

  const revenueChartData = React.useMemo(() => {
    return [...data]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)
      .map((b) => ({
        name: b.name.length > 18 ? b.name.slice(0, 16) + ".." : b.name,
        Revenue: b.totalRevenue,
      }));
  }, [data]);

  /* note handlers */
  function handleAddNote() {
    if (!selectedBuyer || !noteText.trim()) return;

    const note: RelationshipNote = {
      id: crypto.randomUUID(),
      text: noteText.trim(),
      category: noteCategory,
      priority: notePriority,
      date: new Date().toISOString(),
    };

    setNotesMap((prev) => ({
      ...prev,
      [selectedBuyer.id]: [...(prev[selectedBuyer.id] || []), note],
    }));

    setNoteText("");
    setNoteCategory("General");
    setNotePriority("Normal");
    toast.success("Relationship note saved");
  }

  function handleQuickNote() {
    if (!quickNoteBuyerId || !quickNoteText.trim()) return;

    const note: RelationshipNote = {
      id: crypto.randomUUID(),
      text: quickNoteText.trim(),
      category: quickNoteCategory,
      priority: "Normal",
      date: new Date().toISOString(),
    };

    setNotesMap((prev) => ({
      ...prev,
      [quickNoteBuyerId]: [...(prev[quickNoteBuyerId] || []), note],
    }));

    setQuickNoteText("");
    setQuickNoteCategory("General");
    setQuickNoteOpen(false);
    toast.success("Quick note added");
  }

  function openDetail(buyer: BuyerInsight) {
    setSelectedBuyer(buyer);
    setDetailOpen(true);
    setNoteText("");
    setNoteCategory("General");
    setNotePriority("Normal");
  }

  function openQuickNote(buyerId: string) {
    setQuickNoteBuyerId(buyerId);
    setQuickNoteOpen(true);
    setQuickNoteText("");
    setQuickNoteCategory("General");
  }

  /* qc rate helpers */
  function getQcColor(rate: number) {
    if (rate >= 90) return "text-emerald-700 bg-emerald-50";
    if (rate >= 70) return "text-amber-700 bg-amber-50";
    return "text-red-700 bg-red-50";
  }

  function getAvatarColor(index: number) {
    return AVATAR_COLORS[index % AVATAR_COLORS.length];
  }

  /* ---------- render ---------- */

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buyer Behavior & Pattern Insights"
        description="Intelligence on each buyer built from historical data"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Buyer Insights" },
        ]}
      />

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Active Buyers"
          value={loading ? "-" : formatNumber(totalActiveBuyers)}
          icon={<Globe className="h-5 w-5" />}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Total Revenue Across Buyers"
          value={loading ? "-" : formatCurrency(totalRevenue)}
          icon={<DollarSign className="h-5 w-5" />}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Avg QC Pass Rate"
          value={loading ? "-" : `${avgQcPass}%`}
          icon={<ShieldCheck className="h-5 w-5" />}
          color={avgQcPass >= 90 ? "green" : avgQcPass >= 70 ? "orange" : "red"}
          loading={loading}
        />
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by buyer name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={sortBy}
          onValueChange={(v) => setSortBy(v as SortOption)}
        >
          <SelectTrigger className="w-full sm:w-56">
            <ArrowUpDown className="h-4 w-4 mr-2 text-gray-500" />
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="revenue">Sort by Total Revenue</SelectItem>
            <SelectItem value="orders">Sort by Total Orders</SelectItem>
            <SelectItem value="qcPassRate">Sort by QC Pass Rate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">
            Failed to load data: {error}
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <UserCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">
              {data.length === 0
                ? "No buyer data found. Create buyers and orders to see insights."
                : "No buyers match your search."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Buyer Profile Cards Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((buyer, idx) => {
            const payment = PAYMENT_BADGE[buyer.paymentReliability];
            const buyerNotes = notesMap[buyer.id] || [];

            return (
              <Card
                key={buyer.id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Left sidebar - avatar */}
                    <div
                      className={cn(
                        "flex flex-col items-center justify-start gap-2 px-4 py-5 shrink-0",
                        "bg-gray-50 border-r border-gray-100"
                      )}
                    >
                      <div
                        className={cn(
                          "h-14 w-14 rounded-full flex items-center justify-center text-white text-xl font-bold",
                          getAvatarColor(idx)
                        )}
                      >
                        {buyer.name.charAt(0).toUpperCase()}
                      </div>
                      {buyerNotes.length > 0 && (
                        <span className="text-[10px] text-gray-400 font-medium">
                          {buyerNotes.length} note{buyerNotes.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* Main content */}
                    <div className="flex-1 p-4 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 truncate">
                            {buyer.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className="mt-1 text-[10px] px-1.5 py-0 font-mono"
                          >
                            {buyer.code}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openDetail(buyer)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openQuickNote(buyer.id)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                            title="Add note"
                          >
                            <StickyNote className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Metrics grid - 3 rows x 3 cols */}
                      <div className="grid grid-cols-3 gap-x-3 gap-y-2 text-xs">
                        {/* Row 1 */}
                        <div className="rounded-md bg-gray-50 px-2 py-1.5">
                          <span className="text-gray-400 block">Avg Order Size</span>
                          <span className="font-semibold text-gray-900">
                            {formatNumber(buyer.avgOrderSize)} pcs
                          </span>
                        </div>
                        <div className="rounded-md bg-gray-50 px-2 py-1.5">
                          <span className="text-gray-400 block">Total Orders</span>
                          <span className="font-semibold text-gray-900">
                            {buyer.totalOrders}
                          </span>
                        </div>
                        <div className="rounded-md bg-gray-50 px-2 py-1.5">
                          <span className="text-gray-400 block">Total Revenue</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(buyer.totalRevenue)}
                          </span>
                        </div>

                        {/* Row 2 */}
                        <div className="rounded-md bg-gray-50 px-2 py-1.5">
                          <span className="text-gray-400 block">Avg Lead Time</span>
                          <span className="font-semibold text-gray-900">
                            {buyer.avgLeadTimeDays} days
                          </span>
                        </div>
                        <div className="rounded-md bg-gray-50 px-2 py-1.5">
                          <span className="text-gray-400 block">Sample Rounds</span>
                          <span className="font-semibold text-gray-900">
                            {buyer.avgSampleRounds}
                          </span>
                        </div>
                        <div
                          className={cn(
                            "rounded-md px-2 py-1.5",
                            getQcColor(buyer.qcPassRate)
                          )}
                        >
                          <span className="opacity-60 block">QC Pass Rate</span>
                          <span className="font-semibold">{buyer.qcPassRate}%</span>
                        </div>

                        {/* Row 3 */}
                        <div className="rounded-md bg-gray-50 px-2 py-1.5">
                          <span className="text-gray-400 block">Payment Days</span>
                          <span className="font-semibold text-gray-900">
                            {buyer.avgPaymentDays}d
                          </span>
                        </div>
                        <div className="rounded-md bg-gray-50 px-2 py-1.5">
                          <span className="text-gray-400 block">Reliability</span>
                          <span
                            className={cn(
                              "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold border mt-0.5",
                              payment.className
                            )}
                          >
                            {payment.label}
                          </span>
                        </div>
                        <div className="rounded-md bg-gray-50 px-2 py-1.5">
                          <span className="text-gray-400 block">Seasonal</span>
                          <span className="font-semibold text-gray-900">
                            {buyer.seasonalPattern}
                          </span>
                        </div>
                      </div>

                      {/* Preferred styles */}
                      {buyer.preferredStyles.length > 0 && (
                        <div className="mt-3">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                            Preferred Styles
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {buyer.preferredStyles.map((style) => (
                              <span
                                key={style}
                                className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700 font-medium"
                              >
                                <Tag className="h-2.5 w-2.5 mr-1" />
                                {style}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bottom: FOB + last order */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
                        <span>
                          Avg FOB: <strong className="text-gray-700">{formatCurrency(buyer.avgFobPrice, "USD")}</strong>
                        </span>
                        <span>
                          Last Order:{" "}
                          <strong className="text-gray-700">
                            {buyer.lastOrderDate ? formatDate(buyer.lastOrderDate) : "N/A"}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Revenue chart */}
      {!loading && revenueChartData.length > 0 && (
        <BarChartCard
          title="Revenue by Buyer (Top 10)"
          data={revenueChartData}
          dataKeys={["Revenue"]}
          horizontal
          height={Math.max(280, revenueChartData.length * 40)}
          colors={["#2563eb", "#16a34a", "#ea580c", "#9333ea", "#dc2626", "#0891b2", "#d97706", "#7c3aed", "#059669", "#e11d48"]}
          formatTooltipValue={(v) => formatCurrency(v)}
        />
      )}

      {/* Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="sm:max-w-lg w-full overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>
              {selectedBuyer?.name ?? "Buyer Details"}
            </SheetTitle>
            <SheetDescription>
              Complete buyer profile, order history, and relationship notes
            </SheetDescription>
          </SheetHeader>

          {selectedBuyer && (
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="space-y-5 pr-3">
                {/* Profile header */}
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0",
                      getAvatarColor(data.indexOf(selectedBuyer))
                    )}
                  >
                    {selectedBuyer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedBuyer.name}
                    </h3>
                    <Badge variant="outline" className="font-mono text-xs">
                      {selectedBuyer.code}
                    </Badge>
                  </div>
                </div>

                {/* Full metrics */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      Key Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Total Orders</span>
                      <p className="font-semibold">{selectedBuyer.totalOrders}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Revenue</span>
                      <p className="font-semibold">{formatCurrency(selectedBuyer.totalRevenue)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg Order Size</span>
                      <p className="font-semibold">{formatNumber(selectedBuyer.avgOrderSize)} pcs</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg FOB Price</span>
                      <p className="font-semibold">{formatCurrency(selectedBuyer.avgFobPrice, "USD")}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg Lead Time</span>
                      <p className="font-semibold">{selectedBuyer.avgLeadTimeDays} days</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Sample Rounds</span>
                      <p className="font-semibold">{selectedBuyer.avgSampleRounds}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">QC Pass Rate</span>
                      <p className={cn("font-semibold", selectedBuyer.qcPassRate >= 90 ? "text-emerald-700" : selectedBuyer.qcPassRate >= 70 ? "text-amber-700" : "text-red-700")}>
                        {selectedBuyer.qcPassRate}%
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Rejection Rate</span>
                      <p className="font-semibold">{selectedBuyer.rejectionRate}%</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Payment Days</span>
                      <p className="font-semibold">{selectedBuyer.avgPaymentDays} days</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Payment Reliability</span>
                      <p>
                        <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold border", PAYMENT_BADGE[selectedBuyer.paymentReliability].className)}>
                          {PAYMENT_BADGE[selectedBuyer.paymentReliability].label}
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Seasonal Pattern</span>
                      <p className="font-semibold">{selectedBuyer.seasonalPattern}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Order</span>
                      <p className="font-semibold">
                        {selectedBuyer.lastOrderDate ? formatDate(selectedBuyer.lastOrderDate) : "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Order History Summary */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Package className="h-4 w-4 text-violet-600" />
                      Order History Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Orders Placed</span>
                      <span className="font-semibold">{selectedBuyer.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Revenue Generated</span>
                      <span className="font-semibold">{formatCurrency(selectedBuyer.totalRevenue)}</span>
                    </div>
                    {selectedBuyer.preferredStyles.length > 0 && (
                      <div>
                        <span className="text-gray-500 block mb-1">Preferred Styles</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedBuyer.preferredStyles.map((s) => (
                            <Badge key={s} variant="secondary" className="text-xs">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Intel */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4" />
                      Quick Intel
                    </h4>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      This buyer typically orders{" "}
                      <strong>
                        {formatNumber(Math.round(selectedBuyer.avgOrderSize * 0.8))}-
                        {formatNumber(Math.round(selectedBuyer.avgOrderSize * 1.2))} pcs
                      </strong>
                      , needs <strong>{selectedBuyer.avgSampleRounds} sample round{selectedBuyer.avgSampleRounds !== 1 ? "s" : ""}</strong>
                      , and pays in <strong>{selectedBuyer.avgPaymentDays} days</strong>.
                      QC pass rate is{" "}
                      <strong
                        className={
                          selectedBuyer.qcPassRate >= 90
                            ? "text-emerald-800"
                            : selectedBuyer.qcPassRate >= 70
                              ? "text-amber-800"
                              : "text-red-800"
                        }
                      >
                        {selectedBuyer.qcPassRate}%
                      </strong>
                      .
                    </p>
                  </CardContent>
                </Card>

                {/* Relationship Notes */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4 text-orange-600" />
                      Relationship Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Existing notes */}
                    {(notesMap[selectedBuyer.id] || []).length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {(notesMap[selectedBuyer.id] || [])
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((note) => (
                            <div
                              key={note.id}
                              className={cn(
                                "rounded-lg border p-3 text-sm",
                                note.priority === "Important"
                                  ? "border-amber-200 bg-amber-50"
                                  : "border-gray-200 bg-white"
                              )}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  {note.category}
                                </Badge>
                                {note.priority === "Important" && (
                                  <Badge className="text-[10px] px-1.5 py-0 bg-amber-500 text-white border-amber-500">
                                    Important
                                  </Badge>
                                )}
                                <span className="ml-auto text-[10px] text-gray-400">
                                  {formatDate(note.date)}
                                </span>
                              </div>
                              <p className="text-gray-700 leading-relaxed">
                                {note.text}
                              </p>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-3">
                        No notes yet. Add your first note below.
                      </p>
                    )}

                    {/* Add note form */}
                    <div className="border-t border-gray-100 pt-3 space-y-3">
                      <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Plus className="h-3 w-3" />
                        Add Note
                      </h5>
                      <div>
                        <Textarea
                          placeholder="Write a relationship note..."
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          className="text-sm resize-none"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-500 mb-1">Category</Label>
                          <Select
                            value={noteCategory}
                            onValueChange={(v) => setNoteCategory(v as typeof noteCategory)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {NOTE_CATEGORIES.map((c) => (
                                <SelectItem key={c} value={c}>
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500 mb-1">Priority</Label>
                          <Select
                            value={notePriority}
                            onValueChange={(v) => setNotePriority(v as typeof notePriority)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {NOTE_PRIORITIES.map((p) => (
                                <SelectItem key={p} value={p}>
                                  {p}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        onClick={handleAddNote}
                        disabled={!noteText.trim()}
                        size="sm"
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Save Note
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

      {/* Quick Note Sheet */}
      <Sheet open={quickNoteOpen} onOpenChange={setQuickNoteOpen}>
        <SheetContent className="sm:max-w-sm w-full">
          <SheetHeader className="mb-4">
            <SheetTitle>Quick Note</SheetTitle>
            <SheetDescription>
              Add a note for{" "}
              {data.find((b) => b.id === quickNoteBuyerId)?.name ?? "this buyer"}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-sm">Note</Label>
              <Textarea
                placeholder="Enter your note..."
                value={quickNoteText}
                onChange={(e) => setQuickNoteText(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Category</Label>
              <Select
                value={quickNoteCategory}
                onValueChange={(v) => setQuickNoteCategory(v as typeof quickNoteCategory)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleQuickNote}
              disabled={!quickNoteText.trim()}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-1" />
              Save Note
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
