"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

export interface RecentStory {
  id: string;
  title: string;
  status: string;
  acceptanceCriteriaCount: number;
  createdAt: string;
}

export interface CurrentTestPlanSummary {
  id: string;
  name: string;
  status: string;
  description: string;
  createdAt: string;
  totalItems: number;
  passedCount: number;
  failedCount: number;
}

export interface TeamMemberSummary {
  id: string;
  fullName: string;
  role: string;
}

export interface ProjectOverviewData {
  totalStories: number;
  totalTestCases: number;
  totalTestSuites: number;
  totalMembers: number;
  aiGeneratedTestCases: number;
  testExecutionStatus: Record<string, number>;
  storyStatusDistribution: Record<string, number>;
  storiesWithTestCases: number;
  storiesWithoutTestCases: number;
  recentStories: RecentStory[];
  currentTestPlan: CurrentTestPlanSummary | null;
  teamMembers: TeamMemberSummary[];
}

export function useProjectOverview(projectId: string) {
  return useQuery({
    queryKey: ["project-overview", projectId],
    queryFn: async () => {
      const { data } = await axios.get<ProjectOverviewData>(
        `/projects/${projectId}/overview`,
      );
      return data;
    },
    enabled: !!projectId,
  });
}
