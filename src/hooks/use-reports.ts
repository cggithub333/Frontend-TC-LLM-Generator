import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

export interface ReportData {
  testCaseTypeDistribution: Record<string, number>;
  aiVsManualDistribution: Record<string, number>;
  storyStatusDistribution: Record<string, number>;
  requirementCoverage: {
    totalStories: number;
    coveredStories: number;
    uncoveredStories: number;
    coveragePercent: number;
  };
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
