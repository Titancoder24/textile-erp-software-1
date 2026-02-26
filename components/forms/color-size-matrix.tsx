"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface Color {
  id: string;
  name: string;
  hex_code?: string;
}

interface Size {
  id: string;
  name: string;
  sort_order: number;
}

interface ColorSizeMatrixProps {
  colors: Color[];
  sizes: Size[];
  value: Record<string, Record<string, number>>;
  onChange: (value: Record<string, Record<string, number>>) => void;
  disabled?: boolean;
}

export function ColorSizeMatrix({
  colors,
  sizes,
  value,
  onChange,
  disabled = false,
}: ColorSizeMatrixProps) {
  // Sort sizes by sort_order
  const sortedSizes = React.useMemo(
    () => [...sizes].sort((a, b) => a.sort_order - b.sort_order),
    [sizes]
  );

  const handleChange = (colorId: string, sizeId: string, qty: number) => {
    const next = {
      ...value,
      [colorId]: {
        ...(value[colorId] ?? {}),
        [sizeId]: qty,
      },
    };
    onChange(next);
  };

  // Column totals (per size)
  const columnTotals = React.useMemo(() => {
    return sortedSizes.reduce<Record<string, number>>((acc, size) => {
      acc[size.id] = colors.reduce((sum, color) => {
        return sum + (value[color.id]?.[size.id] ?? 0);
      }, 0);
      return acc;
    }, {});
  }, [value, colors, sortedSizes]);

  // Row totals (per color)
  const rowTotals = React.useMemo(() => {
    return colors.reduce<Record<string, number>>((acc, color) => {
      acc[color.id] = sortedSizes.reduce((sum, size) => {
        return sum + (value[color.id]?.[size.id] ?? 0);
      }, 0);
      return acc;
    }, {});
  }, [value, colors, sortedSizes]);

  // Grand total
  const grandTotal = React.useMemo(() => {
    return Object.values(rowTotals).reduce((sum, v) => sum + v, 0);
  }, [rowTotals]);

  if (colors.length === 0 || sizes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
        {colors.length === 0
          ? "Add colors to enter quantities."
          : "Add sizes to enter quantities."}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full text-sm" aria-label="Color and size quantity matrix">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {/* Color header */}
            <th
              scope="col"
              className="sticky left-0 z-10 bg-gray-50 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap border-r border-gray-200"
            >
              Color
            </th>
            {/* Size headers */}
            {sortedSizes.map((size) => (
              <th
                key={size.id}
                scope="col"
                className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap min-w-[72px]"
              >
                {size.name}
              </th>
            ))}
            {/* Total header */}
            <th
              scope="col"
              className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap border-l border-gray-200"
            >
              Total
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {colors.map((color) => (
            <tr
              key={color.id}
              className="group hover:bg-gray-50/60 transition-colors"
            >
              {/* Color name + swatch */}
              <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50/60 px-3 py-2 whitespace-nowrap border-r border-gray-100">
                <div className="flex items-center gap-2">
                  {color.hex_code ? (
                    <span
                      className="h-4 w-4 rounded-sm shrink-0 border border-gray-200 inline-block"
                      style={{ backgroundColor: color.hex_code }}
                      aria-hidden="true"
                    />
                  ) : (
                    <span
                      className="h-4 w-4 rounded-sm shrink-0 bg-gray-200 border border-gray-200 inline-block"
                      aria-hidden="true"
                    />
                  )}
                  <span className="font-medium text-gray-700 text-xs">{color.name}</span>
                </div>
              </td>

              {/* Qty inputs per size */}
              {sortedSizes.map((size) => {
                const qty = value[color.id]?.[size.id] ?? 0;
                return (
                  <td key={size.id} className="px-2 py-1.5 text-center">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={qty === 0 ? "" : qty}
                      placeholder="0"
                      disabled={disabled}
                      onChange={(e) => {
                        const parsed = parseInt(e.target.value, 10);
                        handleChange(
                          color.id,
                          size.id,
                          isNaN(parsed) || parsed < 0 ? 0 : parsed
                        );
                      }}
                      aria-label={`${color.name} / ${size.name} quantity`}
                      className={cn(
                        "w-16 rounded-md border border-gray-200 bg-white px-2 py-1 text-center text-sm text-gray-900 tabular-nums",
                        "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                        "placeholder:text-gray-300",
                        "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                        disabled && "cursor-not-allowed bg-gray-50 opacity-60"
                      )}
                    />
                  </td>
                );
              })}

              {/* Row total */}
              <td className="px-3 py-2 text-center border-l border-gray-100">
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    rowTotals[color.id] > 0 ? "text-gray-900" : "text-gray-300"
                  )}
                  aria-label={`${color.name} total: ${rowTotals[color.id]}`}
                >
                  {rowTotals[color.id]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>

        {/* Footer totals */}
        <tfoot>
          <tr className="border-t-2 border-gray-200 bg-gray-50">
            <td className="sticky left-0 z-10 bg-gray-50 px-3 py-2.5 border-r border-gray-200">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Total
              </span>
            </td>
            {sortedSizes.map((size) => (
              <td key={size.id} className="px-3 py-2.5 text-center">
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    columnTotals[size.id] > 0 ? "text-gray-900" : "text-gray-300"
                  )}
                  aria-label={`${size.name} column total: ${columnTotals[size.id]}`}
                >
                  {columnTotals[size.id]}
                </span>
              </td>
            ))}
            {/* Grand total */}
            <td className="px-3 py-2.5 text-center border-l border-gray-200">
              <span
                className="text-sm font-bold tabular-nums text-blue-700"
                aria-label={`Grand total: ${grandTotal}`}
              >
                {grandTotal}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
