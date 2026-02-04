import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

interface TestPlan {
  id: string;
  projectId: number;
  name: string;
  stories: number;
  testCases: number;
  progress: number;
  status: string;
  priority: string;
  dueDate: string;
  owner: string;
  assignedTeams: string[];
  aiSuggestions: number;
  createdAt: string;
}

export function useTestPlans(projectId?: number) {
  return useQuery({
    queryKey: ["testPlans", projectId],
    queryFn: async () => {
      const { data } = await axios.get<TestPlan[]>("/testPlans", {
        params: projectId ? { projectId } : undefined,
      });
      return data;
    },
  });
}

export function useTestPlan(id: string) {
  return useQuery({
    queryKey: ["testPlans", id],
    queryFn: async () => {
      const { data } = await axios.get<TestPlan>(`/testPlans/${id}`);
      return data;
    },
    enabled: !!id,
  });
}
