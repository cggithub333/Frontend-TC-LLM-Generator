import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import type {
  TestPlan,
  CreateTestPlanInput,
  UpdateTestPlanInput,
  UpdateTestPlanStatusInput,
} from "@/types/test-plan.types";
import type { PagedResponse, PaginatedResult, PaginationParams } from "@/types/pagination.types";
import { extractPage } from "@/types/pagination.types";
import type { UserStory } from "@/types/story.types";

export function useTestPlans(params?: PaginationParams) {
  return useQuery({
    queryKey: ["testPlans", params],
    queryFn: async (): Promise<PaginatedResult<TestPlan>> => {
      const { data } = await axios.get<PagedResponse<TestPlan>>("/test-plans", {
        params: { page: params?.page ?? 0, size: params?.size ?? 20, sort: params?.sort },
      });
      return extractPage(data);
    },
  });
}

export function useTestPlansByProject(projectId: string, params?: PaginationParams & { status?: string }) {
  return useQuery({
    queryKey: ["testPlans", "project", projectId, params],
    queryFn: async (): Promise<PaginatedResult<TestPlan>> => {
      const { data } = await axios.get<PagedResponse<TestPlan>>(
        `/test-plans/project/${projectId}`,
        {
          params: {
            page: params?.page ?? 0,
            size: params?.size ?? 20,
            sort: params?.sort,
            status: params?.status,
          },
        }
      );
      return extractPage(data);
    },
    enabled: !!projectId,
  });
}

export function useTestPlan(id: string) {
  return useQuery({
    queryKey: ["testPlans", id],
    queryFn: async () => {
      const { data } = await axios.get<TestPlan>(`/test-plans/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useTestPlanStories(testPlanId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: ["testPlans", testPlanId, "stories", params],
    queryFn: async (): Promise<PaginatedResult<UserStory>> => {
      const { data } = await axios.get<PagedResponse<UserStory>>(
        `/test-plans/${testPlanId}/stories`,
        { params: { page: params?.page ?? 0, size: params?.size ?? 20 } }
      );
      return extractPage(data);
    },
    enabled: !!testPlanId,
  });
}

export function useCreateTestPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTestPlanInput) => {
      const { data } = await axios.post<TestPlan>("/test-plans", input);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["testPlans", "project", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["testPlans"] });
    },
  });
}

export function useUpdateTestPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateTestPlanInput & { id: string }) => {
      const { data } = await axios.put<TestPlan>(`/test-plans/${id}`, updates);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["testPlans", data.testPlanId] });
      queryClient.invalidateQueries({ queryKey: ["testPlans", "project", data.projectId] });
    },
  });
}

export function useUpdateTestPlanStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...body }: UpdateTestPlanStatusInput & { id: string }) => {
      const { data } = await axios.patch<TestPlan>(`/test-plans/${id}/status`, body);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["testPlans", data.testPlanId] });
      queryClient.invalidateQueries({ queryKey: ["testPlans", "project", data.projectId] });
    },
  });
}

export function useDeleteTestPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/test-plans/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testPlans"] });
    },
  });
}

// ---- PlanSuite hooks: manage test suites in a plan ----

export function useTestSuitesInPlan(planId: string) {
  return useQuery({
    queryKey: ["testPlans", planId, "testSuites"],
    queryFn: async () => {
      const { data } = await axios.get(`/test-plans/${planId}/test-suites`);
      return data;
    },
    enabled: !!planId,
  });
}

export function useAttachSuiteToPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ planId, testSuiteId }: { planId: string; testSuiteId: string }) => {
      const { data } = await axios.post(`/test-plans/${planId}/test-suites`, { testSuiteId });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["testPlans", variables.planId, "testSuites"] });
      queryClient.invalidateQueries({ queryKey: ["testPlans", variables.planId] });
    },
  });
}

export function useDetachSuiteFromPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ planId, testSuiteId }: { planId: string; testSuiteId: string }) => {
      await axios.delete(`/test-plans/${planId}/test-suites/${testSuiteId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["testPlans", variables.planId, "testSuites"] });
      queryClient.invalidateQueries({ queryKey: ["testPlans", variables.planId] });
    },
  });
}
