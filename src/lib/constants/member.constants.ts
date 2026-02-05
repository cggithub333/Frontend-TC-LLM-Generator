/**
 * Member-related constants
 */

import type { MemberRole, MemberRoleConfig } from "@/types/team.types";

/**
 * Member role badge configurations
 */
export const MEMBER_ROLE_CONFIG: Record<MemberRole, MemberRoleConfig> = {
  Lead: {
    label: "Lead",
    badgeClass: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  Contributor: {
    label: "Contributor",
    badgeClass: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  Viewer: {
    label: "Viewer",
    badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  },
} as const;

/**
 * Default member role
 */
export const DEFAULT_MEMBER_ROLE: MemberRole = "Viewer";

/**
 * Pagination defaults
 */
export const DEFAULT_MEMBERS_PER_PAGE = 10;
export const MAX_MEMBERS_PER_PAGE = 50;
