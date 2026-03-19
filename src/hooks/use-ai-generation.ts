import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  RefinedUserStory,
  GenerateTestCasesOptions,
  GenerateTestCasesResult,
} from "@/types/ai.types";

const API_BASE = "/api/proxy";

/**
 * Hook: Refine a user story via AI (preview only — does NOT save)
 */
export function useRefineUserStory() {
  return useMutation<RefinedUserStory, Error, string>({
    mutationFn: async (userStoryId: string) => {
      const res = await fetch(
        `${API_BASE}/user-stories/${userStoryId}/refine`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.message || `Failed to refine story (${res.status})`
        );
      }

      const json = await res.json();
      return json.data as RefinedUserStory;
    },
  });
}

/**
 * Hook: Generate test cases via AI (saves to DB)
 */
export function useGenerateTestCases() {
  const queryClient = useQueryClient();

  return useMutation<
    GenerateTestCasesResult,
    Error,
    { userStoryId: string; options?: GenerateTestCasesOptions }
  >({
    mutationFn: async ({ userStoryId, options }) => {
      const res = await fetch(
        `${API_BASE}/user-stories/${userStoryId}/generate-test-cases`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            testCaseTypes: options?.testCaseTypes || [
              "Positive",
              "Negative",
              "Boundary",
            ],
          }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.message || `Failed to generate test cases (${res.status})`
        );
      }

      const json = await res.json();
      return json.data as GenerateTestCasesResult;
    },
    onSuccess: () => {
      // Invalidate test cases queries so lists refresh
      queryClient.invalidateQueries({ queryKey: ["testCases"] });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
}

/**
 * Hook: Generate acceptance criteria from story description (pre-save)
 */
export function useGenerateAcceptanceCriteria() {
  return useMutation<
    string[],
    Error,
    {
      title: string;
      asA: string;
      iWantTo: string;
      soThat: string;
      description: string;
    }
  >({
    mutationFn: async (storyData) => {
      const res = await fetch(
        `${API_BASE}/ai/generate-acceptance-criteria`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(storyData),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.message || `Failed to generate acceptance criteria (${res.status})`
        );
      }

      const json = await res.json();
      return json.data as string[];
    },
  });
}
