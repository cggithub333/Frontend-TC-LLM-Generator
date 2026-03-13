/**
 * WorkspaceCard Component
 * Displays individual workspace information with actions
 */

"use client";

import Link from "next/link";
import {
  Clock,
  MoreHorizontal,
  Folder,
  Pencil,
  Trash2,
  LayoutDashboard,
  FolderKanban,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Workspace } from "@/types/workspace.types";

interface WorkspaceCardProps {
  workspace: Workspace;
  isOwner?: boolean;
  onEdit?: (workspace: Workspace) => void;
  onDelete?: (workspace: Workspace) => void;
}

export function WorkspaceCard({
  workspace,
  isOwner = false,
  onEdit,
  onDelete,
}: WorkspaceCardProps) {
  const formattedDate = workspace.updatedAt
    ? new Date(workspace.updatedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const createdDate = workspace.createdAt
    ? new Date(workspace.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(workspace);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(workspace);
  };

  return (
    <Link href={`/workspaces/${workspace.workspaceId}`} className="block h-full">
      <article className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/50 hover:scale-[1.01] transition-all cursor-pointer h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-border">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base group-hover:text-primary transition-colors">
                {workspace.name}
              </h3>
              <span className="text-xs text-muted-foreground">
                {isOwner ? "Owner" : "Member"}
              </span>
            </div>
          </div>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
                  onClick={(e) => e.preventDefault()}
                  aria-label={`More options for ${workspace.name}`}
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Workspace
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Description */}
        <p className={`text-xs line-clamp-2 mb-4 ${
          workspace.description
            ? "text-muted-foreground"
            : "text-muted-foreground/40 italic"
        }`}>
          {workspace.description || "No description added"}
        </p>

        {/* Project & Member Count */}
        <div className="flex items-center gap-4 mb-4 mt-auto">
          <div className="flex items-center gap-1.5 text-sm">
            <FolderKanban className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span className="font-semibold">{workspace.projectCount ?? 0}</span>
            <span className="text-muted-foreground text-xs">projects</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span className="font-semibold">{workspace.memberCount ?? 0}</span>
            <span className="text-muted-foreground text-xs">members</span>
          </div>
        </div>

        {/* Date Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Created
            </span>
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-bold">{createdDate}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Last Updated
            </span>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-bold">{formattedDate}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

