/**
 * Utility functions for member management
 */

import type { MemberRole, ProjectMember } from "@/types/team.types";
import { MEMBER_ROLE_CONFIG } from "@/lib/constants/member.constants";

/**
 * Get role badge class for a member role
 */
export function getRoleBadgeClass(role: MemberRole): string {
  return MEMBER_ROLE_CONFIG[role]?.badgeClass || MEMBER_ROLE_CONFIG.Viewer.badgeClass;
}

/**
 * Filter members by search query
 * Searches in name and email
 */
export function filterMembersByQuery<T extends { name: string; email: string }>(
  members: T[],
  query: string
): T[] {
  if (!query.trim()) return members;

  const lowerQuery = query.toLowerCase();
  return members.filter(
    (member) =>
      member.name.toLowerCase().includes(lowerQuery) ||
      member.email.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get member initials from name
 * @param name - Member full name
 * @returns Initials (e.g., "John Doe" -> "JD")
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
  const rolePriority: Record<MemberRole, number> = {
    Lead: 1,
    Contributor: 2,
    Viewer: 3,
  };

  return [...members].sort((a, b) => {
    return rolePriority[a.role] - rolePriority[b.role];
  });
}
