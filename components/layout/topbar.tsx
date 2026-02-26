"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell, User, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";
import type { Role } from "@/lib/constants";
import type { Database } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { useNotifications } from "@/hooks/use-notifications";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface TopbarProps {
  profile: Profile;
}

export function Topbar({ profile }: TopbarProps) {
  const router = useRouter();
  const supabase = createClient();
  const { unreadCount } = useNotifications();
  const [searchOpen, setSearchOpen] = React.useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Keyboard shortcut "/" to open search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:px-6">
      {/* Mobile: Logo placeholder (actual menu button is in Sidebar) */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="ml-10 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
            <span className="text-xs font-bold text-white">T</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">TextileOS</span>
        </div>
      </div>

      {/* Desktop: Breadcrumb */}
      <div className="hidden flex-1 lg:flex">
        <Breadcrumb />
      </div>

      {/* Spacer for mobile */}
      <div className="flex-1 lg:hidden" />

      {/* Right side controls */}
      <div className="flex items-center gap-2">
        {/* Search button / bar */}
        <div className="relative hidden sm:block">
          {searchOpen ? (
            <div className="flex items-center">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                autoFocus
                placeholder="Search anything..."
                className="h-8 w-56 pl-9 pr-4 text-sm"
                onBlur={() => setSearchOpen(false)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSearchOpen(false);
                }}
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="h-8 gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 text-xs text-gray-500 hover:bg-gray-100"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
              <kbd className="ml-1 hidden rounded border border-gray-300 bg-white px-1 py-0.5 text-[10px] font-medium text-gray-500 shadow-sm sm:inline-flex">
                /
              </kbd>
            </Button>
          )}
        </div>

        {/* Mobile search icon */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:hidden"
          onClick={() => setSearchOpen((o) => !o)}
          aria-label="Search"
        >
          <Search className="h-4 w-4 text-gray-600" />
        </Button>

        {/* Notification bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8"
          aria-label="Notifications"
          asChild
        >
          <Link href="/notifications">
            <Bell className="h-4 w-4 text-gray-600" />
            {unreadCount > 0 && (
              <span
                className={cn(
                  "absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white",
                  unreadCount > 9 ? "px-1 w-auto min-w-[1rem]" : ""
                )}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        </Button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 gap-2 rounded-full px-2 hover:bg-gray-100"
              aria-label="User menu"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback className="bg-blue-100 text-xs font-semibold text-blue-700">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[120px] truncate text-sm font-medium text-gray-700 md:inline">
                {profile.full_name.split(" ")[0]}
              </span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-gray-500 md:inline" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="pb-1">
              <p className="text-sm font-semibold text-gray-900">
                {profile.full_name}
              </p>
              <p className="text-xs font-normal text-gray-500">
                {ROLE_LABELS[profile.role as Role]}
              </p>
              <p className="truncate text-xs font-normal text-gray-400">
                {profile.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="h-4 w-4" />
                  My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Search className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
