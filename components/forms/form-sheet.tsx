"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface FormSheetProps {
  title: string;
  description?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  side?: "right" | "left";
  size?: "sm" | "md" | "lg";
  /** Override the default footer. Pass null to hide the footer entirely. */
  footer?: React.ReactNode | null;
  /** Called when the Save button in the default footer is clicked. */
  onSave?: () => void;
  /** Label for the Save button in the default footer. */
  saveLabel?: string;
  /** Whether the save action is in progress. */
  saving?: boolean;
}

const sizeClasses: Record<"sm" | "md" | "lg", string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-2xl",
};

export function FormSheet({
  title,
  description,
  trigger,
  open,
  onOpenChange,
  children,
  side = "right",
  size = "md",
  footer,
  onSave,
  saveLabel = "Save",
  saving = false,
}: FormSheetProps) {
  const defaultFooter = (
    <SheetFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
      <SheetClose asChild>
        <Button variant="outline" type="button" disabled={saving}>
          Cancel
        </Button>
      </SheetClose>
      <Button
        type="button"
        onClick={onSave}
        disabled={saving}
        aria-disabled={saving}
      >
        {saving ? (
          <>
            <span
              className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"
              aria-hidden="true"
            />
            Saving...
          </>
        ) : (
          saveLabel
        )}
      </Button>
    </SheetFooter>
  );

  const resolvedFooter = footer === null ? null : footer ?? defaultFooter;

  const content = (
    <SheetContent
      side={side}
      className={cn(
        "flex flex-col p-0 gap-0",
        sizeClasses[size]
      )}
    >
      {/* Header */}
      <SheetHeader className="px-6 py-5 border-b border-gray-100 shrink-0">
        <SheetTitle>{title}</SheetTitle>
        {description && <SheetDescription>{description}</SheetDescription>}
      </SheetHeader>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {children}
      </div>

      {/* Footer */}
      {resolvedFooter}
    </SheetContent>
  );

  if (trigger) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        {content}
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {content}
    </Sheet>
  );
}
