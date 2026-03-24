export interface TestCase {
  testCaseId: string;
  userStoryId?: string;
  userStoryTitle?: string;
  acceptanceCriteriaId?: string;
  testCaseTypeId?: string;
  testCaseTypeName?: string;
  title: string;
  preconditions?: string;
  steps?: string;
  expectedResult?: string;
  customFieldsJson?: string;
  generatedByAi: boolean;
  createdAt: string;
}

// Enforce: at least one of userStoryId or acceptanceCriteriaId must be provided
type TestCaseStoryRef =
  | { userStoryId: string; acceptanceCriteriaId?: string }
  | { userStoryId?: string; acceptanceCriteriaId: string };

export type CreateTestCaseInput = TestCaseStoryRef & {
  testCaseTypeId?: string;
  title: string;
  preconditions?: string;
  steps?: string;
  expectedResult?: string;
  customFieldsJson?: string;
  generatedByAi?: boolean;
};

export interface UpdateTestCaseInput {
  title?: string;
  preconditions?: string;
  steps?: string;
  expectedResult?: string;
  customFieldsJson?: string;
}
