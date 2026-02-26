"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  FlaskConical,
  Droplets,
  CheckSquare,
  Truck,
  FileText,
  UserCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { title: "Dashboard", href: "/buyer/dashboard", icon: LayoutDashboard },
  { title: "My Orders", href: "/buyer/orders", icon: ShoppingBag },
  { title: "Samples", href: "/buyer/samples", icon: FlaskConical },
  { title: "Lab Dips", href: "/buyer/lab-dips", icon: Droplets },
  { title: "Quality", href: "/buyer/quality", icon: CheckSquare },
  { title: "Shipments", href: "/buyer/shipments", icon: Truck },
  { title: "Documents", href: "/buyer/documents", icon: FileText },
  { title: "Profile", href: "/buyer/profile", icon: UserCircle },
];

function BuyerSidebarContent({
  onClose,
}: {
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
            <span className="text-xs font-bold text-white">T</span>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-900">TextileOS</span>
            <span className="ml-1.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
              Buyer Portal
            </span>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-0.5 px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "text-blue-600" : "text-gray-400"
                    )}
                  />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900">
          <LogOut className="h-4 w-4 shrink-0 text-gray-400" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function BuyerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 flex-shrink-0 lg:flex lg:flex-col">
        <BuyerSidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 h-full w-56 z-50">
            <BuyerSidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="h-8 w-8"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600">
              <span className="text-[10px] font-bold text-white">T</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">TextileOS</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
