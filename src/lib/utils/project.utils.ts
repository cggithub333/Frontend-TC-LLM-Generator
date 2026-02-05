/**
 * Utility functions for project-related operations
 */

import type { LucideIcon } from "lucide-react";
import type { ProjectIconType, ProjectStatus, StatusColorConfig } from "@/types/workspace.types";
import {
  PROJECT_ICON_MAP,
  PROJECT_STATUS_COLOR_MAP,
  DEFAULT_PROJECT_ICON,
  DEFAULT_STATUS_COLOR,
} from "@/lib/constants/project.constants";

/**
 * Get Lucide icon component for a project icon type
 * Returns default icon if type is not found
 */
export function getProjectIcon(iconType: ProjectIconType): LucideIcon {
  return PROJECT_ICON_MAP[iconType] || DEFAULT_PROJECT_ICON;
}

/**
 * Get color configuration for a project status
 * Returns default colors if status is not found
 */
export function getStatusColors(status: ProjectStatus): StatusColorConfig {
  return PROJECT_STATUS_COLOR_MAP[status] || DEFAULT_STATUS_COLOR;
}

/**
 * Get button label based on project status
 */
export function getProjectActionLabel(status: ProjectStatus): string {
  return status === "Archived" ? "View Details" : "Manage Team";
}

/**
 * Determine if project is archived
 */
export function isProjectArchived(status: ProjectStatus): boolean {
  return status === "Archived";
}

/**
 * Filter projects by search query (case-insensitive)
 */
export function filterProjectsByQuery<T extends { name: string }>(
  projects: T[],
  query: string
): T[] {
  if (!query.trim()) return projects;

  const lowerQuery = query.toLowerCase();
  return projects.filter((project) =>
    project.name.toLowerCase().includes(lowerQuery)
  );
}
