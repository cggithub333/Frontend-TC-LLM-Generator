export type TestPlanStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED';

export interface TestPlan {
  testPlanId: string;
  projectId: string;
  createdByUserId: string;
  createdByUserFullName: string;
  name: string;
  description?: string;
  status: TestPlanStatus;
  storyIds?: string[];
  suiteIds?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTestPlanInput {
  projectId: string;
  name: string;
  description?: string;
  status?: TestPlanStatus;
  storyIds?: string[];
  suiteIds?: string[];
}

export interface UpdateTestPlanInput {
  name?: string;
  description?: string;
  status?: TestPlanStatus;
  storyIds?: string[];
  suiteIds?: string[];
}

export interface UpdateTestPlanStatusInput {
  status: TestPlanStatus;
}
