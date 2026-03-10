export interface TestPlan {
  testPlanId: string;
  projectId: string;
  createdByUserId: string;
  createdByUserFullName: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
}

export interface CreateTestPlanInput {
  projectId: string;
  name: string;
  description?: string;
  status: string;
}

export interface UpdateTestPlanInput {
  name?: string;
  description?: string;
  status?: string;
}
