export interface Workspace {
  workspaceId: string;
  ownerUserId: string;
  ownerFullName: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  projectCount?: number;
  memberCount?: number;
}

export interface Project {
  projectId: string;
  workspaceId: string;
  workspaceName: string;
  createdByUserId: string;
  createdByUserName: string;
  projectKey: string;
  name: string;
  description: string;
  jiraSiteId?: string;
  jiraProjectKey?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatusColorConfig {
  bg: string;
  text: string;
  badge: string;
}

// Workspace Member types
export interface WorkspaceMember {
  workspaceMemberId: string;
  workspaceId: string;
  workspaceName: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  role: string;
  joinedAt: string;
}

export interface WorkspaceInvitation {
  invitationId: string;
  workspaceId: string;
  workspaceName: string;
  inviterUserId: string;
  inviterName: string;
  inviteeEmail: string;
  role: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED";
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string;
}

export interface SendInvitationInput {
  workspaceId: string;
  email: string;
  role: string;
}

export interface UpdateWorkspaceMemberInput {
  role: string;
}
