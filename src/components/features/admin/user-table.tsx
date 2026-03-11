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
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isOwner: boolean;
  projects: number;
  accountType: "Enterprise" | "Pro" | "Free";
  status: "Active" | "Suspended";
}

interface UserTableProps {
  users: AdminUser[];
  onView?: (user: AdminUser) => void;
  onEdit?: (user: AdminUser) => void;
  onSuspend?: (user: AdminUser) => void;
}

const accountTypeStyles: Record<string, string> = {
  Enterprise:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Pro: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Free: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const statusStyles: Record<string, string> = {
  Active:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Suspended:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const statusDotStyles: Record<string, string> = {
  Active: "bg-green-500",
  Suspended: "bg-red-500",
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
              Owner
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider">
              Projects
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider">
              Account Type
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider">
              Status
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider pr-5">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <TableRow key={user.id} className="group">
              {/* User Profile */}
              <TableCell className="pl-5">
                <div className="flex items-center gap-3">
                  {user.avatarUrl ? (
                    <div
                      className="w-9 h-9 rounded-full bg-cover bg-center shrink-0 ring-2 ring-white dark:ring-gray-800"
                      style={{ backgroundImage: `url("${user.avatarUrl}")` }}
                    />
                  ) : (
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-white dark:ring-gray-800",
                        getAvatarColor(index)
                      )}
                    >
                      {getInitials(user.name)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold leading-tight">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
              </TableCell>

              {/* Owner */}
              <TableCell>
                {user.isOwner ? (
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-bold">
                    Yes
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">No</span>
                )}
              </TableCell>

              {/* Projects */}
              <TableCell>
                <span className="text-sm font-medium">{user.projects}</span>
              </TableCell>

              {/* Account Type */}
              <TableCell>
                <Badge
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5",
                    accountTypeStyles[user.accountType]
                  )}
                >
                  {user.accountType}
                </Badge>
              </TableCell>

              {/* Status */}
              <TableCell>
                <Badge
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 gap-1.5",
                    statusStyles[user.status]
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full inline-block",
                      statusDotStyles[user.status]
                    )}
                  />
                  {user.status}
                </Badge>
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
                      user.status === "Active" ? "Suspend user" : "Activate user"
                    }
                  >
                    <Ban className="h-4 w-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
