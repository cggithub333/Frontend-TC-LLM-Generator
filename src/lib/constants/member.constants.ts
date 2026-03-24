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
  Developer: {
    label: "Developer",
    badgeClass: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  Tester: {
    label: "Tester",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  Viewer: {
    label: "Viewer",
    badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  },
} as const;

export const DEFAULT_MEMBER_ROLE = "Viewer";

export const DEFAULT_MEMBERS_PER_PAGE = 10;
export const MAX_MEMBERS_PER_PAGE = 50;

// ── Workspace Roles ───────────────────────────────────────────

export const WORKSPACE_ROLE_CONFIG: Record<string, RoleConfig> = {
  Owner: {
    label: "Owner",
    badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400",
  },
  Admin: {
    label: "Admin",
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400",
  },
  Member: {
    label: "Member",
    badgeClass: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:bg-zinc-500/10 dark:text-zinc-400",
  },
} as const;

export const WORKSPACE_INVITE_ROLES = ["Admin", "Member"] as const;
