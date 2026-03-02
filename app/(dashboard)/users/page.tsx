"use client";

import * as React from "react";
import {
  UserPlus,
  Search,
  MoreHorizontal,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";
import type { Role } from "@/lib/constants";
import { toast } from "sonner";
import { useCompany } from "@/contexts/company-context";
import {
  getCompanyUsers,
  updateUserRole,
  toggleUserStatus,
} from "@/lib/actions/users";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const DEPARTMENTS = [
  "Merchandising",
  "Production",
  "Quality",
  "Purchase",
  "Stores",
  "Finance",
  "HR",
  "Dyeing",
  "IT",
  "Management",
];

const INTERNAL_ROLES: Role[] = [
  "super_admin",
  "factory_owner",
  "general_manager",
  "production_manager",
  "merchandiser",
  "purchase_manager",
  "store_manager",
  "quality_manager",
  "dyeing_master",
  "sewing_supervisor",
  "finance_manager",
  "hr_manager",
  "maintenance_engineer",
  "data_entry_operator",
];

const ROLE_COLORS: Record<string, string> = {
  super_admin: "border-purple-200 bg-purple-50 text-purple-700",
  factory_owner: "border-blue-200 bg-blue-50 text-blue-700",
  general_manager: "border-indigo-200 bg-indigo-50 text-indigo-700",
  production_manager: "border-green-200 bg-green-50 text-green-700",
  merchandiser: "border-teal-200 bg-teal-50 text-teal-700",
  purchase_manager: "border-orange-200 bg-orange-50 text-orange-700",
  store_manager: "border-yellow-200 bg-yellow-50 text-yellow-700",
  quality_manager: "border-cyan-200 bg-cyan-50 text-cyan-700",
  dyeing_master: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
  sewing_supervisor: "border-lime-200 bg-lime-50 text-lime-700",
  finance_manager: "border-emerald-200 bg-emerald-50 text-emerald-700",
  hr_manager: "border-rose-200 bg-rose-50 text-rose-700",
  maintenance_engineer: "border-gray-200 bg-gray-50 text-gray-700",
  data_entry_operator: "border-slate-200 bg-slate-50 text-slate-700",
  buyer_user: "border-sky-200 bg-sky-50 text-sky-700",
  vendor_user: "border-amber-200 bg-amber-50 text-amber-700",
};

function formatLastLogin(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function UsersPage() {
  const { companyId, userId } = useCompany();
  const [users, setUsers] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<Profile | null>(null);
  const [inviting, setInviting] = React.useState(false);

  const [inviteForm, setInviteForm] = React.useState({
    fullName: "",
    email: "",
    role: "" as Role | "",
    department: "",
  });

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await getCompanyUsers(companyId);
      if (error) {
        toast.error("Failed to load users");
        return;
      }
      setUsers(data ?? []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter((u) => {
    const matchSearch =
      search === "" ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? u.is_active : !u.is_active);
    return matchSearch && matchRole && matchStatus;
  });

  const handleInvite = async () => {
    if (!inviteForm.fullName || !inviteForm.email || !inviteForm.role) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setInviting(true);
    try {
      const res = await fetch("/api/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: inviteForm.fullName,
          email: inviteForm.email,
          role: inviteForm.role,
          department: inviteForm.department || null,
          companyId,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to invite user");
        return;
      }
      setSheetOpen(false);
      setInviteForm({ fullName: "", email: "", role: "", department: "" });
      toast.success(`Invitation sent to ${inviteForm.email}`);
      fetchUsers();
    } catch {
      toast.error("Failed to invite user");
    } finally {
      setInviting(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    const newStatus = !user.is_active;
    try {
      const { error } = await toggleUserStatus(id, newStatus);
      if (error) {
        toast.error("Failed to update user status");
        return;
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, is_active: newStatus } : u
        )
      );
      toast.success(
        `${user.full_name} has been ${newStatus ? "activated" : "deactivated"}.`
      );
    } catch {
      toast.error("Failed to update user status");
    }
  };

  const handleUpdateRole = async (id: string, role: Role) => {
    try {
      const { error } = await updateUserRole(id, role);
      if (error) {
        toast.error("Failed to update role");
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role } : u))
      );
      toast.success("Role updated successfully.");
    } catch {
      toast.error("Failed to update role");
    }
  };

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Manage team members, roles, and access permissions."
        breadcrumb={[{ label: "Users" }]}
        actions={
          <Button onClick={() => setSheetOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Invite User
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {INTERNAL_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_LABELS[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hidden sm:table-cell">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hidden lg:table-cell">
                    Last Login
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((user) => {
                  const roleClass =
                    ROLE_COLORS[user.role] ?? "border-gray-200 bg-gray-50 text-gray-700";
                  const isCurrentUser = user.id === userId;

                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
                            {user.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-gray-900">
                                {user.full_name}
                              </span>
                              {isCurrentUser && (
                                <span className="rounded bg-blue-100 px-1 py-0.5 text-[10px] font-medium text-blue-700">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-md border px-2 py-0.5 text-xs font-semibold",
                            roleClass
                          )}
                        >
                          {ROLE_LABELS[user.role as Role] ?? user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                        {user.department ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        {user.is_active ? (
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                            <span className="text-xs font-medium text-green-700">
                              Active
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <XCircle className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">
                              Inactive
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">
                        {formatLastLogin(user.last_login_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              aria-label="User actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingUser(user);
                                setSheetOpen(true);
                              }}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(user.id)}
                              disabled={isCurrentUser}
                              className={
                                user.is_active
                                  ? "text-red-600 focus:text-red-700"
                                  : "text-green-600 focus:text-green-700"
                              }
                            >
                              {user.is_active ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-sm text-gray-500"
                    >
                      No users match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
          Showing {filtered.length} of {users.length} users
        </div>
      </div>

      {/* Invite / Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={(open) => {
        setSheetOpen(open);
        if (!open) setEditingUser(null);
      }}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {editingUser ? `Edit User: ${editingUser.full_name}` : "Invite New User"}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {!editingUser ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="inv-name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="inv-name"
                    value={inviteForm.fullName}
                    onChange={(e) =>
                      setInviteForm((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    placeholder="e.g. Arjun Verma"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inv-email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="inv-email"
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) =>
                      setInviteForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="arjun@factory.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(v) =>
                      setInviteForm((prev) => ({ ...prev, role: v as Role }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERNAL_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Department</Label>
                  <Select
                    value={inviteForm.department}
                    onValueChange={(v) =>
                      setInviteForm((prev) => ({ ...prev, department: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department..." />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full mt-2" onClick={handleInvite} disabled={inviting}>
                  {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Invitation
                </Button>
              </>
            ) : (
              <>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-sm font-medium text-gray-900">
                    {editingUser.full_name}
                  </p>
                  <p className="text-xs text-gray-500">{editingUser.email}</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Select
                    value={editingUser.role}
                    onValueChange={(v) => {
                      handleUpdateRole(editingUser.id, v as Role);
                      setEditingUser((prev) =>
                        prev ? { ...prev, role: v } : null
                      );
                    }}
                    disabled={editingUser.id === userId}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERNAL_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {editingUser.id === userId && (
                    <p className="text-xs text-gray-400">
                      You cannot change your own role.
                    </p>
                  )}
                </div>
                <Button
                  className="w-full mt-2"
                  variant="outline"
                  onClick={() => {
                    setSheetOpen(false);
                    setEditingUser(null);
                  }}
                >
                  Close
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
