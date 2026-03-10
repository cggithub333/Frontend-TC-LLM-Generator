/**
 * ProjectCard Component
 * Displays individual project information with status and key details
 */

import Link from "next/link";
import { Clock, MoreHorizontal, Layers, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types/workspace.types";
import {
  getStatusColors,
  getProjectActionLabel,
  isProjectArchived,
} from "@/lib/utils/project.utils";

interface ProjectCardProps {
  project: Project;
  onManageTeam?: (projectId: string) => void;
  onViewDetails?: (projectId: string) => void;
  onMenuClick?: (projectId: string) => void;
}

export function ProjectCard({
  project,
  onManageTeam,
  onViewDetails,
  onMenuClick,
}: ProjectCardProps) {
  const statusColors = getStatusColors(project.status);
  const actionLabel = getProjectActionLabel(project.status);
  const archived = isProjectArchived(project.status);

  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (archived && onViewDetails) {
      onViewDetails(project.projectId);
    } else if (!archived && onManageTeam) {
      onManageTeam(project.projectId);
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMenuClick?.(project.projectId);
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
          <button
            className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
            onClick={handleMenuClick}
            aria-label={`More options for ${project.name}`}
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
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
        {project.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
            {project.description}
          </p>
        )}

        {/* Action Button */}
        <div className="mt-auto">
          <Button
            variant={archived ? "secondary" : "default"}
            className={`w-full h-10 ${
              archived
                ? "bg-muted hover:bg-muted/80 text-muted-foreground"
                : "bg-primary/10 hover:bg-primary/20 text-primary"
            }`}
            onClick={handleActionClick}
          >
            {actionLabel}
          </Button>
        </div>
      </article>
    </Link>
  );
}
