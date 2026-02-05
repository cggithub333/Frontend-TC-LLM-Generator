/**
 * Type definitions for Project domain
 * Form inputs and validation schemas
 */

import type { UUID, Project, ProjectIconType, ProjectStatus } from "./workspace.types";

/**
 * Form input for creating a new project
 */
export interface CreateProjectInput {
  workspaceId: number; // Will migrate to UUID
  name: string;
  projectKey: string; // Uppercase, unique identifier
  description?: string;
  icon: ProjectIconType;
  jiraSiteId?: string;
  jiraProjectKey?: string;
}

/**
 * Form validation errors
 */
export interface ProjectFormErrors {
  name?: string;
  projectKey?: string;
  description?: string;
  jiraSiteId?: string;
  jiraProjectKey?: string;
}

/**
 * Project key validation result
 */
export interface ProjectKeyValidation {
  isValid: boolean;
  message?: string;
}

/**
 * Project creation response
 */
export interface CreateProjectResponse extends Project {
  createdAt: string;
}
