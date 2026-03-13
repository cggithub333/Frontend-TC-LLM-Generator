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

export interface CreateTestCaseInput {
  userStoryId?: string;
  acceptanceCriteriaId?: string;
  testCaseTypeId?: string;
  title: string;
  preconditions?: string;
  steps?: string;
  expectedResult?: string;
  customFieldsJson?: string;
  generatedByAi?: boolean;
}

export interface UpdateTestCaseInput {
  title?: string;
  preconditions?: string;
  steps?: string;
  expectedResult?: string;
  customFieldsJson?: string;
}
