export type StoryStatus =
  | "DRAFT"
  | "READY"
  | "IN_PROGRESS"
  | "DONE"
  | "ARCHIVED";

export interface AcceptanceCriteria {
  acceptanceCriteriaId: string;
  userStoryId: string;
  content: string;
  orderNo: number;
  completed: boolean;
  createdAt: string;
  testCases?: import("./test-case.types").TestCase[];
}

export interface UserStory {
  userStoryId: string;
  projectId: string;
  projectName: string;
  jiraIssueKey?: string;
  jiraIssueId?: string;
  title: string;
  description?: string;
  asA?: string;
  iWantTo?: string;
  soThat?: string;
  status: StoryStatus;
  acceptanceCriteria: AcceptanceCriteria[];
  createdAt: string;
}

export interface CreateAcceptanceCriteriaInput {
  content: string;
  orderNo: number;
  completed?: boolean;
}

export interface CreateUserStoryInput {
  projectId: string;
  title: string;
  description?: string;
  asA?: string;
  iWantTo?: string;
  soThat?: string;
  status: StoryStatus;
  acceptanceCriteria?: CreateAcceptanceCriteriaInput[];
}

export interface UpdateUserStoryInput {
  title?: string;
  description?: string;
  asA?: string;
  iWantTo?: string;
  soThat?: string;
  status?: StoryStatus;
  acceptanceCriteria?: CreateAcceptanceCriteriaInput[];
}

export interface UpdateAcceptanceCriteriaInput {
  content?: string;
  orderNo?: number;
  completed?: boolean;
}
