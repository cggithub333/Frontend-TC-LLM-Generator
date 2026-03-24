/**
 * Utility functions for project-related operations
 */

import type { StatusColorConfig } from "@/types/workspace.types";
import {
  PROJECT_STATUS_COLOR_MAP,
  DEFAULT_STATUS_COLOR,
} from "@/lib/constants/project.constants";

export function getStatusColors(status: string): StatusColorConfig {
  return PROJECT_STATUS_COLOR_MAP[status] || DEFAULT_STATUS_COLOR;
}

export function getProjectActionLabel(status: string): string {
  return status === "Archived" ? "View Details" : "Manage Team";
}

export function isProjectArchived(status: string): boolean {
  return status === "Archived";
}

export function filterProjectsByQuery<T extends { name: string; projectKey?: string }>(
  projects: T[],
  query: string
): T[] {
  if (!query.trim()) return projects;

  const lowerQuery = query.toLowerCase();
  return projects.filter(
    (project) =>
      project.name.toLowerCase().includes(lowerQuery) ||
      (project.projectKey && project.projectKey.toLowerCase().includes(lowerQuery))
  );
}
