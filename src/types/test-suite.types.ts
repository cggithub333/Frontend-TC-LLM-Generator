export interface TestSuite {
  testSuiteId: string;
  projectId: string;
  projectName: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface CreateTestSuiteInput {
  projectId: string;
  name: string;
  description?: string;
}

export interface UpdateTestSuiteInput {
  name?: string;
  description?: string;
}
