import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

interface TestStep {
  step: number;
  action: string;
  expected: string;
}

interface TestCase {
  id: string;
  storyId: string;
  testPlanId: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  preconditions: string[];
  steps: TestStep[];
  testData: Record<string, any>;
  assignedTo: string;
  executedBy: string | null;
  executedAt: string | null;
  suiteId: string;
}

export function useTestCases(suiteId?: string) {
  return useQuery({
    queryKey: ["testCases", suiteId],
    queryFn: async () => {
      const { data } = await axios.get<TestCase[]>("/testCases", {
        params: suiteId ? { suiteId } : undefined,
      });
      return data;
    },
  });
}

export function useTestCase(id: string) {
  return useQuery({
    queryKey: ["testCases", id],
    queryFn: async () => {
      const { data } = await axios.get<TestCase>(`/testCases/${id}`);
      return data;
    },
    enabled: !!id,
  });
}
