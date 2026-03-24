"use client";

import Link from "next/link";
import { MoreHorizontal, Layers, KeyRound, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project } from "@/types/workspace.types";
import {
  getStatusColors,
} from "@/lib/utils/project.utils";

interface ProjectCardProps {
  project: Project;
  isCreator?: boolean;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
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

export function ProjectCard({
  project,
  isCreator = false,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const statusColors = getStatusColors(project.status);

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(project);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(project);
  };

  const relativeDate = project.updatedAt
    ? formatRelativeDate(project.updatedAt)
    : "—";

  return (
    <Link href={`/projects/${project.projectId}`} className="block h-full">
      <article className="group relative flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 cursor-pointer h-full hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40">
        {/* Left accent bar — visible on hover */}
        <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-center" />

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"
              aria-hidden="true"
            >
              <Layers className="h-[18px] w-[18px]" />
            </div>
            <div>
              <h3 className="font-semibold text-[15px] leading-tight group-hover:text-primary transition-colors duration-150">
                {project.name}
              </h3>
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${statusColors.badge} uppercase tracking-wide mt-0.5`}
                role="status"
              >
                {project.status}
              </span>
            </div>
          </div>

          {isCreator && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.preventDefault()}
                  aria-label={`More options for ${project.name}`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Description — hidden if empty for cleaner whitespace */}
        {project.description ? (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-auto">
            {project.description}
          </p>
        ) : (
          <div className="mb-auto" />
        )}

        {/* Compact footer: key + relative date in one row */}
        <div className="flex items-center gap-3 pt-3 mt-3 border-t border-border/60 text-xs text-muted-foreground">
          <div className="flex items-center gap-1" title="Project Key">
            <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="font-medium text-foreground/80">{project.projectKey}</span>
          </div>
          <span className="ml-auto text-[11px]">
            Updated {relativeDate}
          </span>
        </div>
      </article>
    </Link>
  );
}
