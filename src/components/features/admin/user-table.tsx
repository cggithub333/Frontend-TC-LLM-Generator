"use client";

import { cn } from "@/lib/utils";
import { Eye, Pencil, Ban } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export interface AdminUser {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  authProvider: string;
  status: string;
  createdAt: string;
}

interface UserTableProps {
  users: AdminUser[];
  onView?: (user: AdminUser) => void;
  onEdit?: (user: AdminUser) => void;
  onSuspend?: (user: AdminUser) => void;
}

const roleStyles: Record<string, string> = {
  ADMIN:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  USER: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const providerStyles: Record<string, string> = {
  GOOGLE:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  LOCAL: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const statusStyles: Record<string, string> = {
  ACTIVE:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  SUSPENDED:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const statusDotStyles: Record<string, string> = {
  ACTIVE: "bg-green-500",
  SUSPENDED: "bg-red-500",
};

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

function getAvatarColor(index: number) {
  return avatarColors[index % avatarColors.length];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function UserTable({ users, onView, onEdit, onSuspend }: UserTableProps) {
  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="pl-5 font-semibold text-xs uppercase tracking-wider">
              User Profile
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider">
              Role
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider">
              Provider
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider">
              Status
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider">
              Joined
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider pr-5">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user, index) => (
              <TableRow key={user.userId} className="group">
                {/* User Profile */}
                <TableCell className="pl-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-white dark:ring-gray-800",
                        getAvatarColor(index)
                      )}
                    >
                      {getInitials(user.fullName)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Role */}
                <TableCell>
                  <Badge
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5",
                      roleStyles[user.role] || roleStyles["USER"]
                    )}
                  >
                    {user.role}
                  </Badge>
                </TableCell>

                {/* Provider */}
                <TableCell>
                  <Badge
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5",
                      providerStyles[user.authProvider] || providerStyles["LOCAL"]
                    )}
                  >
                    {user.authProvider}
                  </Badge>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 gap-1.5",
                      statusStyles[user.status] || statusStyles["ACTIVE"]
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full inline-block",
                        statusDotStyles[user.status] || statusDotStyles["ACTIVE"]
                      )}
                    />
                    {user.status}
                  </Badge>
                </TableCell>

                {/* Joined */}
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </span>
                </TableCell>

                {/* Actions */}
                <TableCell className="pr-5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onView?.(user)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="View user"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit?.(user)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="Edit user"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onSuspend?.(user)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title={
                        user.status === "ACTIVE" ? "Suspend user" : "Activate user"
                      }
                    >
                      <Ban className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
