export interface UserStory {
  userStoryId: string;
  projectId: string;
  projectName: string;
  jiraIssueKey?: string;
  jiraIssueId?: string;
  title: string;
  description?: string;
  status: string;
  createdAt: string;
}

export interface CreateUserStoryInput {
  projectId: string;
  title: string;
  description?: string;
  status: string;
}

export interface UpdateUserStoryInput {
  title?: string;
  description?: string;
  status?: string;
}
