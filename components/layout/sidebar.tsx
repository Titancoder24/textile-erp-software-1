"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  MessageSquare,
  FlaskConical,
  Droplets,
  Calculator,
  CalendarClock,
  Layers,
  GitMerge,
  ShoppingCart,
  Package,
  Factory,
  CheckSquare,
  Paintbrush,
  Truck,
  Database,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, ROLE_LABELS } from "@/lib/constants";
import type { Role } from "@/lib/constants";
import type { Database as DB } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getInitials } from "@/lib/utils";

type Profile = DB["public"]["Tables"]["profiles"]["Row"];

const NAV_ICON_MAP: Record<string, LucideIcon> = {
  Dashboard: LayoutDashboard,
  Orders: ShoppingBag,
  Inquiries: MessageSquare,
  Samples: FlaskConical,
  "Lab Dips": Droplets,
  Costing: Calculator,
  TNA: CalendarClock,
  BOM: Layers,
  MRP: GitMerge,
  Purchase: ShoppingCart,
  Inventory: Package,
  Production: Factory,
  Quality: CheckSquare,
  Dyeing: Paintbrush,
  Shipment: Truck,
  Masters: Database,
  Reports: BarChart3,
  Users: Users,
  Settings: Settings,
};

interface SidebarProps {
  profile: Profile;
}

interface SidebarContentProps {
  profile: Profile;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClose?: () => void;
}

function SidebarContent({
  profile,
  collapsed,
  onToggleCollapse,
  onClose,
}: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const filteredNavItems = NAV_ITEMS.filter((item) =>
    (item.roles as readonly string[]).includes(profile.role)
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full flex-col bg-gray-900 text-gray-100">
        {/* Logo / Brand */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-gray-800 px-4",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-sm font-bold text-white">T</span>
              </div>
              <span className="text-base font-semibold tracking-tight text-white">
                TextileOS
              </span>
            </div>
          )}
          {collapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-sm font-bold text-white">T</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className={cn(
              "h-7 w-7 text-gray-400 hover:bg-gray-800 hover:text-white",
              collapsed && "hidden"
            )}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="flex justify-center border-b border-gray-800 py-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="h-7 w-7 text-gray-400 hover:bg-gray-800 hover:text-white"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          <ul className="space-y-0.5 px-2">
            {filteredNavItems.map((item) => {
              const Icon = NAV_ICON_MAP[item.title] ?? LayoutDashboard;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  pathname.startsWith(item.href + "/"));

              const navItem = (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-gray-800 text-white before:absolute before:left-0 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-r-full before:bg-blue-500"
                        : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-100",
                      collapsed ? "justify-center px-2" : ""
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"
                      )}
                    />
                    {!collapsed && (
                      <span className="truncate">{item.title}</span>
                    )}
                    {!collapsed && isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500" />
                    )}
                  </Link>
                </li>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return navItem;
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-gray-800 p-3">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={profile.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-gray-700 text-xs text-gray-200">
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="font-medium">{profile.full_name}</p>
                  <p className="text-xs text-gray-400">
                    {ROLE_LABELS[profile.role as Role]}
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    className="h-7 w-7 text-gray-500 hover:bg-gray-800 hover:text-red-400"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign Out</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback className="bg-gray-700 text-xs text-gray-200">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-100">
                  {profile.full_name}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {ROLE_LABELS[profile.role as Role]}
                </p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    className="h-7 w-7 shrink-0 text-gray-500 hover:bg-gray-800 hover:text-red-400"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Sign Out</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

export function Sidebar({ profile }: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden h-full flex-shrink-0 transition-all duration-300 ease-in-out lg:flex lg:flex-col",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarContent
          profile={profile}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
        />
      </aside>

      {/* Mobile sidebar drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-40 h-9 w-9 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0">
          <SidebarContent
            profile={profile}
            collapsed={false}
            onToggleCollapse={() => setMobileOpen(false)}
            onClose={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
