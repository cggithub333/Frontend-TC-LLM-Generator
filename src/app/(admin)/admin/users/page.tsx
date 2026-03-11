"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  UserCheck,
  UserX,
  Search,
  Download,
  Loader2,
} from "lucide-react";
import { StatsCard } from "@/components/features/admin/stats-card";
import { UserTable, type AdminUser } from "@/components/features/admin/user-table";
import { Pagination } from "@/components/features/admin/pagination";

const PAGE_SIZE = 10;

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
}

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

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0); // Reset to first page on new search
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

      // ApiResponse wraps PagedModel: data.content contains user array
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
      // Stats failure is non-critical — cards show 0
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

  // Build stats cards from real data
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
            <UserTable users={users} />
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
    </div>
  );
}
