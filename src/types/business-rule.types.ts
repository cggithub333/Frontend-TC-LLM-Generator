export interface BusinessRule {
  businessRuleId: string;
  projectId: string;
  userStoryId?: string;
  userStoryTitle?: string;
  title: string;
  description: string;
  priority: number;
  source: string;
  createdAt: string;
}

export interface CreateBusinessRuleInput {
  title: string;
  description?: string;
  priority?: number;
  source?: string;
  userStoryId?: string;
}

export interface UpdateBusinessRuleInput {
  title?: string;
  description?: string;
  priority?: number;
  source?: string;
  userStoryId?: string;
}
