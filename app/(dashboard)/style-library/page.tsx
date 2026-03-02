"use client";

import * as React from "react";
import {
  BookOpen,
  Search,
  Filter,
  Layers,
  Award,
  TrendingUp,
  FileText,
  Plus,
  Sparkles,
  GraduationCap,
  X,
  ChevronRight,
  Scissors,
  Gauge,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
import { cn, formatNumber } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import {
  getStyleLearningData,
  type StyleCard as StyleCardType,
} from "@/lib/actions/analytics";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CATEGORY_CHIPS = [
  "All",
  "T-shirt",
  "Polo",
  "Trouser",
  "Jacket",
  "Shirt",
  "Dress",
  "Shorts",
  "Hoodie",
];

const NOTE_CATEGORIES = [
  "Production Tip",
  "Quality Alert",
  "Costing Note",
  "General",
];

// ---------------------------------------------------------------------------
// Style Metric Mini Grid item
// ---------------------------------------------------------------------------
function MetricItem({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
}) {
  return (
    <div className="text-center">
      <p
        className={cn(
          "text-lg font-bold tabular-nums leading-none",
          highlight ? "text-blue-600" : "text-gray-900"
        )}
      >
        {value}
        {unit && (
          <span className="text-xs font-normal text-gray-400 ml-0.5">
            {unit}
          </span>
        )}
      </p>
      <p className="text-[10px] text-gray-500 mt-1 leading-tight">{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton grid
// ---------------------------------------------------------------------------
function GridSkeleton() {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-72 bg-gray-100 rounded-xl animate-pulse"
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------
export default function StyleLearningDatabasePage() {
  const { profile } = useProfile();
  const companyId = profile?.company_id;

  // Data
  const [styles, setStyles] = React.useState<StyleCardType[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("All");
  const [buyerFilter, setBuyerFilter] = React.useState("all");

  // Detail sheet
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [activeStyle, setActiveStyle] = React.useState<StyleCardType | null>(
    null
  );
  const [noteInput, setNoteInput] = React.useState("");
  const [localNotes, setLocalNotes] = React.useState<
    Map<string, Array<{ text: string; time: string; category: string }>>
  >(new Map());

  // Add Style Note sheet
  const [addNoteOpen, setAddNoteOpen] = React.useState(false);
  const [anStyle, setAnStyle] = React.useState("");
  const [anCategory, setAnCategory] = React.useState("General");
  const [anText, setAnText] = React.useState("");

  // ---- Fetch data -------------------------------------------------------
  React.useEffect(() => {
    if (!companyId) return;
    let cancelled = false;
    setLoading(true);
    getStyleLearningData(companyId).then((res) => {
      if (cancelled) return;
      if (res.error) setError(res.error);
      else setStyles(res.data ?? []);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  // ---- Derived data -----------------------------------------------------
  const buyers = React.useMemo(() => {
    const set = new Set(styles.map((s) => s.buyer));
    return Array.from(set).sort();
  }, [styles]);

  const filtered = React.useMemo(() => {
    let result = styles;
    if (categoryFilter !== "All") {
      result = result.filter(
        (s) => s.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    if (buyerFilter !== "all") {
      result = result.filter((s) => s.buyer === buyerFilter);
    }
    if (searchQuery.trim()) {
      const lc = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.styleCode.toLowerCase().includes(lc) ||
          s.styleName.toLowerCase().includes(lc) ||
          s.buyer.toLowerCase().includes(lc) ||
          s.category.toLowerCase().includes(lc)
      );
    }
    return result;
  }, [styles, categoryFilter, buyerFilter, searchQuery]);

  const avgEfficiency = React.useMemo(() => {
    const withEff = styles.filter((s) => s.avgEfficiency > 0);
    if (withEff.length === 0) return 0;
    return Math.round(
      withEff.reduce((sum, s) => sum + s.avgEfficiency, 0) / withEff.length
    );
  }, [styles]);

  const avgQuality = React.useMemo(() => {
    const withQual = styles.filter((s) => s.qualityPassRate > 0);
    if (withQual.length === 0) return 0;
    return Math.round(
      withQual.reduce((sum, s) => sum + s.qualityPassRate, 0) / withQual.length
    );
  }, [styles]);

  // ---- Handlers ---------------------------------------------------------
  const openDetail = (style: StyleCardType) => {
    setActiveStyle(style);
    setDetailOpen(true);
    setNoteInput("");
  };

  const handleAddDetailNote = () => {
    if (!activeStyle || !noteInput.trim()) return;
    const notes = localNotes.get(activeStyle.id) || [];
    notes.unshift({
      text: noteInput.trim(),
      time: new Date().toLocaleString("en-IN"),
      category: "General",
    });
    setLocalNotes(new Map(localNotes.set(activeStyle.id, notes)));
    setNoteInput("");
    toast.success("Note added to style card");
  };

  const handleAddStyleNote = () => {
    if (!anStyle || !anText.trim()) {
      toast.error("Select a style and enter a note");
      return;
    }
    const style = styles.find(
      (s) => s.styleCode === anStyle || s.id === anStyle
    );
    const sid = style?.id || anStyle;
    const notes = localNotes.get(sid) || [];
    notes.unshift({
      text: anText.trim(),
      time: new Date().toLocaleString("en-IN"),
      category: anCategory,
    });
    setLocalNotes(new Map(localNotes.set(sid, notes)));
    toast.success(
      `Note added to ${style?.styleCode || anStyle}`,
      { description: `Category: ${anCategory}` }
    );
    setAddNoteOpen(false);
    setAnStyle("");
    setAnText("");
    setAnCategory("General");
  };

  // ======================================================================
  // RENDER
  // ======================================================================
  return (
    <div className="space-y-6">
      <PageHeader
        title="Style Learning Database"
        description="When you get a similar order, pull up the style card for real data instead of guessing"
        breadcrumb={[{ label: "Style Library" }]}
      />

      {/* ---- Search Bar -------------------------------------------------- */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by style code, name, buyer, or category..."
          className="pl-10 h-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category chips + buyer filter */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORY_CHIPS.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium border transition-all",
              categoryFilter === cat
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            )}
          >
            {cat}
          </button>
        ))}
        <div className="ml-auto">
          <Select value={buyerFilter} onValueChange={setBuyerFilter}>
            <SelectTrigger className="h-8 text-xs w-[160px]">
              <SelectValue placeholder="All Buyers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buyers</SelectItem>
              {buyers.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ---- Mini Stat Cards --------------------------------------------- */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Total Styles"
          value={formatNumber(styles.length)}
          icon={<Layers className="h-4 w-4" />}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Avg Efficiency"
          value={`${avgEfficiency}%`}
          icon={<Gauge className="h-4 w-4" />}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Avg Quality Pass Rate"
          value={`${avgQuality}%`}
          icon={<ShieldCheck className="h-4 w-4" />}
          color="purple"
          loading={loading}
        />
      </div>

      {/* ---- Error ------------------------------------------------------- */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">
            {error}
          </CardContent>
        </Card>
      )}

      {/* ---- Loading ----------------------------------------------------- */}
      {loading && <GridSkeleton />}

      {/* ---- Empty state ------------------------------------------------- */}
      {!loading && filtered.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-12 w-12 text-gray-300 mb-3" />
            <p className="font-medium text-gray-500">No styles found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchQuery
                ? "Try a different search term"
                : "No style data available yet"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ---- Style Card Grid --------------------------------------------- */}
      {!loading && filtered.length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((style) => {
            const defectColors = [
              "bg-red-100 text-red-700 border-red-200",
              "bg-orange-100 text-orange-700 border-orange-200",
              "bg-amber-100 text-amber-700 border-amber-200",
              "bg-yellow-100 text-yellow-700 border-yellow-200",
              "bg-gray-100 text-gray-600 border-gray-200",
            ];

            return (
              <Card
                key={style.id}
                className="hover:shadow-md transition-shadow group"
              >
                <CardContent className="p-5 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-gray-900 truncate">
                        {style.styleCode}
                      </h3>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {style.styleName}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] shrink-0 bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {style.buyer}
                    </Badge>
                  </div>

                  {/* Category chip */}
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-medium"
                  >
                    {style.category}
                  </Badge>

                  <Separator />

                  {/* 2x3 metrics grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <MetricItem
                      label="Orders"
                      value={style.ordersCount}
                    />
                    <MetricItem
                      label="Total Qty"
                      value={formatNumber(style.totalQuantityProduced)}
                      unit="pcs"
                    />
                    <MetricItem
                      label="Avg Efficiency"
                      value={`${style.avgEfficiency}`}
                      unit="%"
                      highlight={style.avgEfficiency >= 70}
                    />
                    <MetricItem
                      label="Marker Eff."
                      value={`${style.markerEfficiency}`}
                      unit="%"
                    />
                    <MetricItem
                      label="Quality Pass"
                      value={`${style.qualityPassRate}`}
                      unit="%"
                      highlight={style.qualityPassRate >= 90}
                    />
                    <MetricItem
                      label="Fabric/Piece"
                      value={style.actualFabricPerPiece.toFixed(3)}
                      unit="m"
                    />
                  </div>

                  {/* Common Defects */}
                  {style.commonDefects.length > 0 && (
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium mb-1.5">
                        Common Defects
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {style.commonDefects.slice(0, 4).map((d, idx) => (
                          <Badge
                            key={d}
                            variant="outline"
                            className={cn(
                              "text-[10px] border",
                              defectColors[idx] || defectColors[4]
                            )}
                          >
                            {d}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View Full Card button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-8 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200"
                    onClick={() => openDetail(style)}
                  >
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    View Full Card
                    <ChevronRight className="h-3 w-3 ml-auto" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ================================================================ */}
      {/* DETAIL SHEET                                                     */}
      {/* ================================================================ */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {activeStyle && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  {activeStyle.styleCode}
                </SheetTitle>
                <SheetDescription>
                  {activeStyle.styleName} -- {activeStyle.buyer} --{" "}
                  {activeStyle.category}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Production Data */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Production Data
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                      <p className="text-[10px] text-gray-400">
                        Actual Fabric/Piece
                      </p>
                      <p className="text-sm font-bold text-gray-900 tabular-nums">
                        {activeStyle.actualFabricPerPiece.toFixed(3)} m
                      </p>
                      {activeStyle.bomFabricPerPiece > 0 && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          BOM: {activeStyle.bomFabricPerPiece.toFixed(3)} m
                        </p>
                      )}
                    </div>
                    <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                      <p className="text-[10px] text-gray-400">Actual SMV</p>
                      <p className="text-sm font-bold text-gray-900 tabular-nums">
                        {activeStyle.actualSmv > 0
                          ? activeStyle.actualSmv.toFixed(2)
                          : "--"}
                      </p>
                      {activeStyle.theoreticalSmv > 0 && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Theoretical: {activeStyle.theoreticalSmv.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                      <p className="text-[10px] text-gray-400">
                        Avg Efficiency
                      </p>
                      <p
                        className={cn(
                          "text-sm font-bold tabular-nums",
                          activeStyle.avgEfficiency >= 70
                            ? "text-green-600"
                            : activeStyle.avgEfficiency >= 50
                              ? "text-amber-600"
                              : "text-red-600"
                        )}
                      >
                        {activeStyle.avgEfficiency}%
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                      <p className="text-[10px] text-gray-400">
                        Marker Efficiency
                      </p>
                      <p className="text-sm font-bold text-gray-900 tabular-nums">
                        {activeStyle.markerEfficiency > 0
                          ? `${activeStyle.markerEfficiency}%`
                          : "--"}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Quality History */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-purple-600" />
                    Quality History
                  </h4>
                  <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 mb-3">
                    <p className="text-[10px] text-gray-400">Pass Rate</p>
                    <p
                      className={cn(
                        "text-lg font-bold tabular-nums",
                        activeStyle.qualityPassRate >= 90
                          ? "text-green-600"
                          : activeStyle.qualityPassRate >= 70
                            ? "text-amber-600"
                            : "text-red-600"
                      )}
                    >
                      {activeStyle.qualityPassRate}%
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Across {activeStyle.ordersCount} order(s)
                    </p>
                  </div>
                  {activeStyle.commonDefects.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">
                        Common Defects
                      </p>
                      <div className="space-y-1">
                        {activeStyle.commonDefects.map((d, idx) => (
                          <div
                            key={d}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full shrink-0",
                                idx === 0
                                  ? "bg-red-500"
                                  : idx === 1
                                    ? "bg-orange-500"
                                    : "bg-gray-400"
                              )}
                            />
                            <span className="text-gray-700">{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Notes & Learnings */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Notes & Learnings
                  </h4>
                  {activeStyle.specialNotes && (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mb-3">
                      <p className="text-xs text-amber-800">
                        {activeStyle.specialNotes}
                      </p>
                    </div>
                  )}
                  {/* Local notes */}
                  {(localNotes.get(activeStyle.id) || []).length > 0 && (
                    <div className="space-y-2 mb-3">
                      {(localNotes.get(activeStyle.id) || []).map(
                        (note, idx) => (
                          <div
                            key={idx}
                            className="rounded-md border border-gray-100 bg-gray-50 p-2.5"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant="outline"
                                className="text-[10px]"
                              >
                                {note.category}
                              </Badge>
                              <span className="text-[10px] text-gray-400">
                                {note.time}
                              </span>
                            </div>
                            <p className="text-xs text-gray-700">
                              {note.text}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  )}
                  {/* Add note inline */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Add a note or learning..."
                      className="text-sm flex-1"
                      rows={2}
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                    />
                    <Button
                      size="sm"
                      className="self-end"
                      onClick={handleAddDetailNote}
                      disabled={!noteInput.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Recipe Used */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                    <Scissors className="h-4 w-4 text-blue-600" />
                    Recipe / Process Notes
                  </h4>
                  <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-xs text-gray-600">
                    {activeStyle.recipeUsed || "No recipe information recorded"}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ================================================================ */}
      {/* ADD STYLE NOTE SHEET                                             */}
      {/* ================================================================ */}
      <Sheet open={addNoteOpen} onOpenChange={setAddNoteOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add Style Note</SheetTitle>
            <SheetDescription>
              Capture a learning for any style in the database
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="space-y-1.5">
              <Label className="text-sm">Style</Label>
              <Select value={anStyle} onValueChange={setAnStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.styleCode} - {s.styleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Category</Label>
              <Select value={anCategory} onValueChange={setAnCategory}>
                <SelectTrigger>
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
            <div className="space-y-1.5">
              <Label className="text-sm">Note</Label>
              <Textarea
                placeholder="What did you learn about this style?"
                value={anText}
                onChange={(e) => setAnText(e.target.value)}
                rows={4}
              />
            </div>
            <Button onClick={handleAddStyleNote} className="w-full">
              <FileText className="h-4 w-4 mr-1.5" />
              Save Note
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ---- Floating Action Button -------------------------------------- */}
      <button
        onClick={() => setAddNoteOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-lg hover:bg-blue-700 transition-all hover:shadow-xl active:scale-95"
        aria-label="Add Style Note"
      >
        <Plus className="h-4 w-4" />
        Add Style Note
      </button>
    </div>
  );
}
