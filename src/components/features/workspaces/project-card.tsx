"use client";

import Link from "next/link";
import { Clock, MoreHorizontal, Layers, KeyRound, Pencil, Trash2 } from "lucide-react";
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

  const formattedDate = project.updatedAt
    ? new Date(project.updatedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <Link href={`/projects/${project.projectId}`} className="block h-full">
      <article className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`size-10 rounded-lg ${statusColors.bg} ${statusColors.text} flex items-center justify-center border border-border`}
              aria-hidden="true"
            >
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base group-hover:text-primary transition-colors">{project.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${statusColors.badge} uppercase tracking-wide`}
                  role="status"
                >
                  {project.status}
                </span>
              </div>
            </div>
          </div>
          
          {isCreator && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
                  onClick={(e) => e.preventDefault()}
                  aria-label={`More options for ${project.name}`}
                >
                  <MoreHorizontal className="h-5 w-5" />
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

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Project Key
            </span>
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-bold">{project.projectKey}</span>
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

        {/* Description preview */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
          {project.description || (
            <span className="italic">No description added</span>
          )}
        </p>

      </article>
    </Link>
  );
}
