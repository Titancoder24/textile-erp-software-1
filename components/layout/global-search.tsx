"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Users,
  Package,
  Truck,
  FileText,
  FlaskConical,
  ClipboardList,
  Search,
} from "lucide-react";

import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  url: string;
};

type GroupedResults = {
  label: string;
  icon: React.ElementType;
  items: SearchResult[];
};

// ---------------------------------------------------------------------------
// Icons per type
// ---------------------------------------------------------------------------

const TYPE_ICONS: Record<string, React.ElementType> = {
  sales_order: ShoppingBag,
  buyer: Users,
  product: Package,
  supplier: Truck,
  inquiry: FileText,
  sample: FlaskConical,
  purchase_order: FileText,
  work_order: ClipboardList,
};

const TYPE_LABELS: Record<string, string> = {
  sales_order: "Orders",
  buyer: "Buyers",
  product: "Products",
  supplier: "Suppliers",
  inquiry: "Inquiries",
  sample: "Samples",
  purchase_order: "Purchase Orders",
  work_order: "Work Orders",
};

// ---------------------------------------------------------------------------
// Demo data - in production this comes from globalSearch() server action
// ---------------------------------------------------------------------------

const DEMO_RESULTS: SearchResult[] = [
  { id: "1", title: "ORD-2401", subtitle: "Classic Polo Shirt -- H&M (in_production)", type: "sales_order", url: "/orders/1" },
  { id: "2", title: "ORD-2398", subtitle: "Linen Blouse -- Zara (in_production)", type: "sales_order", url: "/orders/2" },
  { id: "3", title: "ORD-2395", subtitle: "Kids T-Shirt Set -- Next (in_production)", type: "sales_order", url: "/orders/3" },
  { id: "4", title: "H&M", subtitle: "HM01 -- Sweden", type: "buyer", url: "/masters/buyers/4" },
  { id: "5", title: "Zara (Inditex)", subtitle: "ZRA01 -- Spain", type: "buyer", url: "/masters/buyers/5" },
  { id: "6", title: "Next Plc", subtitle: "NXT01 -- United Kingdom", type: "buyer", url: "/masters/buyers/6" },
  { id: "7", title: "Classic Polo Shirt", subtitle: "STY-001 -- Menswear", type: "product", url: "/products/7" },
  { id: "8", title: "Linen Blouse", subtitle: "STY-002 -- Womenswear", type: "product", url: "/products/8" },
  { id: "9", title: "Vardhman Textiles", subtitle: "VRD01 -- India", type: "supplier", url: "/masters/suppliers/9" },
  { id: "10", title: "INQ-2026-0012", subtitle: "Summer Collection -- H&M (pending)", type: "inquiry", url: "/inquiries/10" },
  { id: "11", title: "SMP-2026-0045", subtitle: "fit_sample -- H&M (approved)", type: "sample", url: "/samples/11" },
  { id: "12", title: "PO-2026-0040", subtitle: "Vardhman Textiles -- approved", type: "purchase_order", url: "/purchase/orders/12" },
  { id: "13", title: "WO-2026-0051", subtitle: "Classic Polo Shirt (in_progress)", type: "work_order", url: "/production/work-orders/13" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  // Open on "/" keypress
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"
      ) {
        return;
      }

      if (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Filter results based on query
  const filteredResults = React.useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return DEMO_RESULTS.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q)
    );
  }, [query]);

  // Group results by type
  const grouped = React.useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    for (const result of filteredResults) {
      if (!groups[result.type]) groups[result.type] = [];
      groups[result.type].push(result);
    }
    return Object.entries(groups).map(
      ([type, items]): GroupedResults => ({
        label: TYPE_LABELS[type] ?? type,
        icon: TYPE_ICONS[type] ?? Search,
        items,
      })
    );
  }, [filteredResults]);

  const handleSelect = (url: string) => {
    setOpen(false);
    setQuery("");
    router.push(url);
  };

  return (
    <>
      {/* Search trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-500 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
        aria-label="Open global search"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-[10px] font-mono text-gray-500">
          /
        </kbd>
      </button>

      {/* Command palette */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search orders, buyers, products, suppliers..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {query.length < 2 ? (
            <div className="py-6 px-4 text-center text-sm text-gray-500">
              Type at least 2 characters to search across all records.
            </div>
          ) : filteredResults.length === 0 ? (
            <CommandEmpty>
              No results found for &ldquo;{query}&rdquo;.
            </CommandEmpty>
          ) : (
            grouped.map((group, gIdx) => (
              <React.Fragment key={group.label}>
                {gIdx > 0 && <CommandSeparator />}
                <CommandGroup heading={group.label}>
                  {group.items.map((item) => {
                    const Icon = TYPE_ICONS[item.type] ?? Search;
                    return (
                      <CommandItem
                        key={item.id}
                        value={`${item.title} ${item.subtitle}`}
                        onSelect={() => handleSelect(item.url)}
                        className="cursor-pointer"
                      >
                        <Icon className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {item.subtitle}
                          </p>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </React.Fragment>
            ))
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
