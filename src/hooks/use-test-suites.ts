import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

interface TestSuite {
  id: string;
  name: string;
  description: string;
  testCases: string[];
  projectId: number;
  createdAt: string;
  lastUpdated: string;
}

export function useTestSuites(projectId?: number) {
  return useQuery({
    queryKey: ["testSuites", projectId],
    queryFn: async () => {
      const { data } = await axios.get<TestSuite[]>("/testSuites", {
        params: projectId ? { projectId } : undefined,
      });
      return data;
    },
  });
}

export function useTestSuite(id: string) {
  return useQuery({
    queryKey: ["testSuites", id],
    queryFn: async () => {
      const { data } = await axios.get<TestSuite>(`/testSuites/${id}`);
      return data;
    },
    enabled: !!id,
  });
}
