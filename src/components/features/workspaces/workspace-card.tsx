/**
 * WorkspaceCard Component
 * Displays individual workspace information with actions
 */

"use client";

import Link from "next/link";
import {
  MoreHorizontal,
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

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 5) return `${diffWeek}w ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function WorkspaceCard({
  workspace,
  isOwner = false,
  onEdit,
  onDelete,
}: WorkspaceCardProps) {
  const relativeDate = workspace.updatedAt
    ? formatRelativeDate(workspace.updatedAt)
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
      <article className="group relative flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 cursor-pointer h-full hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40">
        {/* Left accent bar — visible on hover */}
        <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-center" />

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <LayoutDashboard className="h-[18px] w-[18px]" />
            </div>
            <div>
              <h3 className="font-semibold text-[15px] leading-tight group-hover:text-primary transition-colors duration-150">
                {workspace.name}
              </h3>
              <span className="text-[11px] text-muted-foreground/70">
                {isOwner ? "Owner" : "Member"}
              </span>
            </div>
          </div>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.preventDefault()}
                  aria-label={`More options for ${workspace.name}`}
                >
                  <MoreHorizontal className="h-4 w-4" />
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

        {/* Description — hidden if empty for cleaner whitespace */}
        {workspace.description ? (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-auto">
            {workspace.description}
          </p>
        ) : (
          <div className="mb-auto" />
        )}

        {/* Compact footer: stats + relative date in one row */}
        <div className="flex items-center gap-3 pt-3 mt-3 border-t border-border/60 text-xs text-muted-foreground">
          <div className="flex items-center gap-1" title="Projects">
            <FolderKanban className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="font-medium text-foreground/80">{workspace.projectCount ?? 0}</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1" title="Members">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="font-medium text-foreground/80">{workspace.memberCount ?? 0}</span>
          </div>
          <span className="ml-auto text-[11px]">
            Updated {relativeDate}
          </span>
        </div>
      </article>
    </Link>
  );
}
