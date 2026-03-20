"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Users,
  UserCheck,
  UserX,
  Search,
  Download,
  Loader2,
  Shield,
  Mail,
  Calendar,
  KeyRound,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { StatsCard } from "@/components/features/admin/stats-card";
import { UserTable, type AdminUser } from "@/components/features/admin/user-table";
import { Pagination } from "@/components/features/admin/pagination";

const PAGE_SIZE = 10;

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
}

// ── Helpers ────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const avatarColors = [
  "bg-gradient-to-br from-blue-400 to-indigo-500",
  "bg-gradient-to-br from-purple-400 to-pink-500",
  "bg-gradient-to-br from-green-400 to-emerald-500",
  "bg-gradient-to-br from-orange-400 to-red-500",
  "bg-gradient-to-br from-teal-400 to-cyan-500",
  "bg-gradient-to-br from-rose-400 to-pink-500",
];

// ── Main Component ─────────────────────────────
export default function AdminUsersPage() {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [stats, setStats] = useState<UserStats | null>(null);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Dialog states ──
  const [viewUser, setViewUser] = useState<AdminUser | null>(null);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState<string>("");
  const [suspendUser, setSuspendUser] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(PAGE_SIZE),
        sort: "createdAt,desc",
      });
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }

      const res = await fetch(`/api/proxy/users?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch users");

      const json = await res.json();
      const userList = json.data?.content ?? [];
      const pageInfo = json.data?.page;

      const mapped: AdminUser[] = userList.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (u: any) => ({
          userId: u.userId,
          fullName: u.fullName,
          email: u.email,
          role: u.role || "USER",
          authProvider: u.authProvider || "LOCAL",
          status: u.status || "ACTIVE",
          createdAt: u.createdAt,
        })
      );

      setUsers(mapped);
      setTotalUsers(pageInfo?.totalElements ?? mapped.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingUsers(false);
    }
  }, [page, debouncedSearch]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/proxy/users/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const json = await res.json();
      setStats(json.data);
    } catch {
      setStats({ totalUsers: 0, activeUsers: 0, suspendedUsers: 0 });
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ── Admin Actions ──

  const handleChangeRole = async () => {
    if (!editUser || !editRole) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/proxy/users/${editUser.userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: editRole }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Failed to change role");
      }
      toast.success(`Role changed to ${editRole}`);
      setEditUser(null);
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change role");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!suspendUser) return;
    const newStatus = suspendUser.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setActionLoading(true);
    try {
      const res = await fetch(`/api/proxy/users/${suspendUser.userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Failed to change status");
      }
      toast.success(
        newStatus === "SUSPENDED"
          ? `${suspendUser.fullName} has been suspended`
          : `${suspendUser.fullName} has been activated`
      );
      setSuspendUser(null);
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change status");
    } finally {
      setActionLoading(false);
    }
  };

  // Build stats cards
  const statsData = stats
    ? [
        {
          title: "Total Users",
          value: stats.totalUsers.toLocaleString(),
          icon: Users,
          iconColor: "text-blue-600 dark:text-blue-400",
          iconBg: "bg-blue-100 dark:bg-blue-900/30",
        },
        {
          title: "Active Users",
          value: stats.activeUsers.toLocaleString(),
          icon: UserCheck,
          iconColor: "text-green-600 dark:text-green-400",
          iconBg: "bg-green-100 dark:bg-green-900/30",
        },
        {
          title: "Suspended Users",
          value: stats.suspendedUsers.toLocaleString(),
          icon: UserX,
          iconColor: "text-red-600 dark:text-red-400",
          iconBg: "bg-red-100 dark:bg-red-900/30",
        },
      ]
    : [];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-muted/30">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-card px-8 py-5 shrink-0">
        <div>
          <h1 className="text-xl font-bold">Platform User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and monitor all platform users and access
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1600px] mx-auto space-y-6 pb-10">
          {/* Stats Cards */}
          {loadingStats ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl border shadow-sm p-5 h-[100px] animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {statsData.map((stat) => (
                <StatsCard key={stat.title} {...stat} />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 p-4 text-sm">
              <p className="font-semibold">Error loading users</p>
              <p>{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => fetchUsers()}
              >
                Retry
              </Button>
            </div>
          )}

          {/* User Table */}
          {loadingUsers ? (
            <div className="bg-card rounded-xl border shadow-sm p-12 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading users...</span>
            </div>
          ) : (
            <UserTable
              users={users}
              onView={(user) => setViewUser(user)}
              onEdit={(user) => {
                setEditUser(user);
                setEditRole(user.role);
              }}
              onSuspend={(user) => setSuspendUser(user)}
            />
          )}

          {/* Pagination */}
          {!loadingUsers && totalUsers > 0 && (
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={totalUsers}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      {/* ═══════ VIEW USER SIDE PANEL ═══════ */}
      <Sheet open={!!viewUser} onOpenChange={(val) => !val && setViewUser(null)}>
        <SheetContent>
          {viewUser && (
            <div>
              <SheetHeader>
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white ring-2 ring-background",
                      avatarColors[
                        users.findIndex((u) => u.userId === viewUser.userId) %
                          avatarColors.length
                      ]
                    )}
                  >
                    {getInitials(viewUser.fullName)}
                  </div>
                  <div>
                    <SheetTitle className="text-xl">{viewUser.fullName}</SheetTitle>
                    <SheetDescription className="text-sm">
                      {viewUser.email}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-8 space-y-6">
                {/* Info Grid */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Role</p>
                      <Badge
                        className={cn(
                          "mt-1 text-xs font-bold",
                          viewUser.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        )}
                      >
                        {viewUser.role}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Email</p>
                      <p className="text-sm mt-0.5">{viewUser.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <KeyRound className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Auth Provider</p>
                      <Badge
                        className={cn(
                          "mt-1 text-xs font-bold",
                          viewUser.authProvider === "GOOGLE"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        )}
                      >
                        {viewUser.authProvider}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div
                      className={cn(
                        "w-2.5 h-2.5 rounded-full shrink-0",
                        viewUser.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"
                      )}
                    />
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Status</p>
                      <Badge
                        className={cn(
                          "mt-1 text-xs font-bold",
                          viewUser.status === "ACTIVE"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        )}
                      >
                        {viewUser.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Joined</p>
                      <p className="text-sm mt-0.5">{formatDate(viewUser.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => {
                      setViewUser(null);
                      setEditUser(viewUser);
                      setEditRole(viewUser.role);
                    }}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Change Role
                  </Button>
                  <Button
                    variant={viewUser.status === "ACTIVE" ? "destructive" : "default"}
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => {
                      setViewUser(null);
                      setSuspendUser(viewUser);
                    }}
                  >
                    {viewUser.status === "ACTIVE" ? (
                      <>
                        <UserX className="h-3.5 w-3.5" />
                        Suspend
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-3.5 w-3.5" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ═══════ EDIT ROLE DIALOG ═══════ */}
      <Dialog open={!!editUser} onOpenChange={(val) => !val && setEditUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Change User Role
            </DialogTitle>
            <DialogDescription>
              Update the role for <strong>{editUser?.fullName}</strong> ({editUser?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Current Role</p>
                <Badge
                  className={cn(
                    "mt-1 text-xs font-bold",
                    editUser?.role === "ADMIN"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  )}
                >
                  {editUser?.role}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">New Role</label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">
                    <span className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" />
                      USER — Regular user
                    </span>
                  </SelectItem>
                  <SelectItem value="ADMIN">
                    <span className="flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5" />
                      ADMIN — Full platform access
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editRole === "ADMIN" && editUser?.role !== "ADMIN" && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>Promoting to ADMIN grants full platform management access including user management.</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleChangeRole}
              disabled={actionLoading || editRole === editUser?.role}
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════ SUSPEND/ACTIVATE CONFIRMATION ═══════ */}
      <Dialog open={!!suspendUser} onOpenChange={(val) => !val && setSuspendUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {suspendUser?.status === "ACTIVE" ? (
                <>
                  <UserX className="h-5 w-5 text-red-500" />
                  Suspend User
                </>
              ) : (
                <>
                  <UserCheck className="h-5 w-5 text-green-500" />
                  Activate User
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {suspendUser?.status === "ACTIVE"
                ? `Are you sure you want to suspend ${suspendUser?.fullName}? They will lose access to the platform.`
                : `Are you sure you want to reactivate ${suspendUser?.fullName}? They will regain access to the platform.`}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
              <div>
                <p className="text-sm font-semibold">{suspendUser?.fullName}</p>
                <p className="text-xs text-muted-foreground">{suspendUser?.email}</p>
              </div>
              <Badge
                className={cn(
                  "ml-auto text-xs font-bold",
                  suspendUser?.status === "ACTIVE"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                )}
              >
                {suspendUser?.status}
              </Badge>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setSuspendUser(null)}>
              Cancel
            </Button>
            <Button
              variant={suspendUser?.status === "ACTIVE" ? "destructive" : "default"}
              onClick={handleToggleStatus}
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {suspendUser?.status === "ACTIVE" ? "Suspend User" : "Activate User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
