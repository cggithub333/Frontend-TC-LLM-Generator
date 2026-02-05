/**
 * Type definitions for Team/Member domain
 */

export type UUID = string;

/**
 * Project member role
 */
export type MemberRole = "Lead" | "Contributor" | "Viewer";

/**
 * Member access status
 */
export type MemberStatus = "Active" | "Inactive";

/**
 * Project member
 */
export interface ProjectMember {
  id: number; // Will migrate to UUID
  projectId: number;
  userId: number;
  name: string;
  email: string;
  avatar?: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
}

/**
 * Project team statistics
 */
export interface ProjectTeamStats {
  totalMembers: number;
  availableSlots: number;
  activeMembers: number;
  inactiveMembers: number;
}

/**
 * Member role configuration
 */
export interface MemberRoleConfig {
  label: string;
  badgeClass: string;
}

/**
 * Invite member input
 */
export interface InviteMemberInput {
  projectId: number;
  email: string;
  role: MemberRole;
}
