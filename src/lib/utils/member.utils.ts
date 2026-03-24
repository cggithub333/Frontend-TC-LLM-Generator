/**
 * Utility functions for member management
 */

import type { ProjectMember } from "@/types/team.types";
import { MEMBER_ROLE_CONFIG, WORKSPACE_ROLE_CONFIG } from "@/lib/constants/member.constants";

/**
 * Get role badge class for a member role
 */
export function getRoleBadgeClass(role: string): string {
  return MEMBER_ROLE_CONFIG[role]?.badgeClass || MEMBER_ROLE_CONFIG.Viewer.badgeClass;
}

/**
 * Filter members by search query
 * Searches in userFullName and userEmail
 */
export function filterMembersByQuery(
  members: ProjectMember[],
  query: string
): ProjectMember[] {
  if (!query.trim()) return members;

  const lowerQuery = query.toLowerCase();
  return members.filter(
    (member) =>
      member.userFullName.toLowerCase().includes(lowerQuery) ||
      member.userEmail.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get member initials from name
 */
export function getMemberInitials(name: string): string {
  if (!name || name.trim().length === 0) return "?";

  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Sort members by role priority
 * Lead > Contributor > Viewer
 */
export function sortMembersByRole(members: ProjectMember[]): ProjectMember[] {
  const rolePriority: Record<string, number> = {
    Lead: 1,
    Developer: 2,
    Tester: 3,
    Viewer: 4,
  };

  return [...members].sort((a, b) => {
    return (rolePriority[a.role] ?? 99) - (rolePriority[b.role] ?? 99);
  });
}

// ── Workspace Permission Helpers ──────────────────────────────

export type WorkspaceRole = "Owner" | "Admin" | "Member";

export function canInviteToWorkspace(role: string): boolean {
  return role === "Owner" || role === "Admin";
}

export function canRemoveMember(callerRole: string, targetRole: string): boolean {
  if (targetRole === "Owner") return false;
  if (targetRole === "Admin") return callerRole === "Owner";
  return callerRole === "Owner" || callerRole === "Admin";
}

export function canChangeRole(callerRole: string, targetRole: string): boolean {
  if (targetRole === "Owner") return false;
  return callerRole === "Owner";
}

export function canManageWorkspaceMembers(role: string): boolean {
  return role === "Owner" || role === "Admin";
}

/**
 * Get workspace role badge class
 */
export function getWorkspaceRoleBadgeClass(role: string): string {
  return WORKSPACE_ROLE_CONFIG[role]?.badgeClass || WORKSPACE_ROLE_CONFIG.Member.badgeClass;
}
