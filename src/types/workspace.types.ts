/**
 * Type definitions for Workspace domain
 * Following backend API structure with UUID-based IDs
 */

export type UUID = string;

export interface Workspace {
  id: number; // Mock API uses number, will migrate to UUID
  name: string;
  description: string;
  createdAt: string;
}

export interface Project {
  id: number; // Mock API uses number, will migrate to UUID
  workspaceId: number;
  name: string;
  icon: ProjectIconType;
  stories: number;
  tests: number;
  defects?: number;
  status: ProjectStatus;
  updated: string;
  members: number;
}

export type ProjectStatus =
  | "Active"
  | "Archived"
  | "AI Processing"
  | "Review"
  | "Done";

export type ProjectIconType =
  | "smartphone"
  | "credit-card"
  | "shield"
  | "shopping-cart"
  | "layers"
  | "dashboard-customize"
  | "api"
  | "integration-instructions";

export interface StatusColorConfig {
  bg: string;
  text: string;
  badge: string;
}
