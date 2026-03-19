/**
 * Types for AI generation features
 */

export interface RefinedUserStory {
  title: string;
  asA: string;
  iWantTo: string;
  soThat: string;
  description: string;
}

export interface GenerateTestCasesOptions {
  testCaseTypes?: string[];
}

export interface GeneratedTestCase {
  testCaseId: string;
  title: string;
  type: string;
  preconditions: string;
  steps: string;
  expectedResult: string;
  acceptanceCriteriaId: string;
}

export interface GenerateTestCasesResult {
  generatedCount: number;
  testCases: GeneratedTestCase[];
}
