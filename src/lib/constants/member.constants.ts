/**
 * Member-related constants
 */

interface RoleConfig {
  label: string;
  badgeClass: string;
}

export const MEMBER_ROLE_CONFIG: Record<string, RoleConfig> = {
  Lead: {
    label: "Lead",
    badgeClass: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
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

export const DEFAULT_MEMBER_ROLE = "Viewer";

export const DEFAULT_MEMBERS_PER_PAGE = 10;
export const MAX_MEMBERS_PER_PAGE = 50;
