export interface CreateProjectInput {
  workspaceId: string;
  createdByUserId: string;
  name: string;
  projectKey: string;
  description?: string;
  jiraSiteId?: string;
  jiraProjectKey?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: string;
  jiraSiteId?: string;
  jiraProjectKey?: string;
}

export interface ProjectKeyValidation {
  isValid: boolean;
  message?: string;
}

export type ProjectFormErrors = Partial<Record<keyof CreateProjectInput | "jiraSiteId" | "jiraProjectKey", string>>;
