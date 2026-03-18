import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

export interface ReportData {
  testCaseStatusDistribution: Record<string, number>;
  storyStatusDistribution: Record<string, number>;
  requirementCoverage: {
    totalStories: number;
    coveredStories: number;
    uncoveredStories: number;
    coveragePercent: number;
  };
  testCaseTypeDistribution: Record<string, number>;
  testCasePriorityDistribution: Record<string, number>;
}

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: async (): Promise<ReportData> => {
      const { data } = await axios.get<ReportData>("/reports");
      return data;
    },
  });
}
