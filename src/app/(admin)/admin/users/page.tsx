"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  CreditCard,
  Building2,
  Zap,
  Search,
  Download,
} from "lucide-react";
import { StatsCard } from "@/components/features/admin/stats-card";
import { UserTable, type AdminUser } from "@/components/features/admin/user-table";
import { Pagination } from "@/components/features/admin/pagination";

/* ── Mock Stats ─────────────────────────── */
const statsData = [
  {
    title: "Total Platform Users",
    value: "12,450",
    change: "+5.2%",
    trend: "up" as const,
    icon: Users,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    title: "Active Subscriptions",
    value: "3,842",
    change: "+12.8%",
    trend: "up" as const,
    icon: CreditCard,
    iconColor: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    title: "Workspaces Created",
    value: "8,129",
    change: "+3.1%",
    trend: "up" as const,
    icon: Building2,
    iconColor: "text-green-600 dark:text-green-400",
    iconBg: "bg-green-100 dark:bg-green-900/30",
  },
  {
    title: "AI Tokens Used",
    value: "2.4M",
    change: "-1.4%",
    trend: "down" as const,
    icon: Zap,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
  },
];

/* ── Mock Users ─────────────────────────── */
const mockUsers: AdminUser[] = [
  { id: "1", name: "Alex Rivera", email: "alex.rivera@company.com", isOwner: true, projects: 12, accountType: "Enterprise", status: "Active" },
  { id: "2", name: "Sarah Jenkins", email: "sarah.jenkins@startup.io", isOwner: false, projects: 8, accountType: "Pro", status: "Active" },
  { id: "3", name: "Mike Ross", email: "mike.ross@agency.co", isOwner: true, projects: 15, accountType: "Enterprise", status: "Active" },
  { id: "4", name: "Emily Chen", email: "emily.chen@devteam.org", isOwner: false, projects: 3, accountType: "Free", status: "Active" },
  { id: "5", name: "David Kim", email: "david.kim@techlab.com", isOwner: false, projects: 6, accountType: "Pro", status: "Suspended" },
  { id: "6", name: "Lisa Nguyen", email: "lisa.nguyen@design.io", isOwner: true, projects: 9, accountType: "Enterprise", status: "Active" },
  { id: "7", name: "James Wilson", email: "james.wilson@qa.dev", isOwner: false, projects: 4, accountType: "Pro", status: "Active" },
  { id: "8", name: "Anna Petrov", email: "anna.petrov@testing.co", isOwner: false, projects: 2, accountType: "Free", status: "Suspended" },
  { id: "9", name: "Carlos Mendez", email: "carlos.mendez@cloud.app", isOwner: true, projects: 11, accountType: "Enterprise", status: "Active" },
  { id: "10", name: "Priya Sharma", email: "priya.sharma@fintech.in", isOwner: false, projects: 7, accountType: "Pro", status: "Active" },
];

const TOTAL_USERS = 85;
const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = searchQuery
    ? mockUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockUsers;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-muted/30">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-card px-8 py-5 shrink-0">
        <div>
          <h1 className="text-xl font-bold">Platform User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and monitor all platform users, subscriptions, and access
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {statsData.map((stat) => (
              <StatsCard key={stat.title} {...stat} />
            ))}
          </div>

          {/* User Table */}
          <UserTable users={filteredUsers} />

          {/* Pagination */}
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={searchQuery ? filteredUsers.length : TOTAL_USERS}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
