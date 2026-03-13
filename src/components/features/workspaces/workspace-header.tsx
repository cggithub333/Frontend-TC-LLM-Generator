/**
 * WorkspaceHeader Component
 * Clean header with breadcrumb, dynamic role, and workspace context info
 */

import Link from "next/link";
import { Calendar, Users, Layers } from "lucide-react";
import type { Workspace } from "@/types/workspace.types";

interface WorkspaceHeaderProps {
  workspace?: Workspace;
  isOwner?: boolean;
  projectCount?: number;
}

export function WorkspaceHeader({
  workspace,
  isOwner = false,
  projectCount = 0,
}: WorkspaceHeaderProps) {
  const createdDate = workspace?.createdAt
    ? new Date(workspace.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <header className="border-b border-border bg-card px-8 py-4 sticky top-0 z-10">
      {/* Top row — Breadcrumb & Title */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <nav className="flex flex-wrap gap-2" aria-label="Breadcrumb">
            <Link
              href="/workspaces"
              className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Workspaces
            </Link>
            <span className="text-xs font-medium text-muted-foreground" aria-hidden="true">
              /
            </span>
            <span className="text-xs font-medium">
              {workspace?.name || "Workspace"}
            </span>
          </nav>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">
              {workspace?.name || "My Workspace"}
            </h2>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                isOwner
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isOwner ? "Owner" : "Member"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom row — Workspace context stats */}
      {workspace && (
        <div className="flex items-center gap-5 mt-3 text-xs text-muted-foreground">
          {workspace.description && (
            <span className="truncate max-w-md" title={workspace.description}>
              {workspace.description}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            <span>{projectCount} project{projectCount !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>{workspace.memberCount ?? 0} member{(workspace.memberCount ?? 0) !== 1 ? "s" : ""}</span>
          </div>
          {createdDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Created {createdDate}</span>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
