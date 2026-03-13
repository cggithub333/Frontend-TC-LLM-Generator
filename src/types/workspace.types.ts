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
