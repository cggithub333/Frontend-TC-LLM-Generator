import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import type { TestPlan, CreateTestPlanInput, UpdateTestPlanInput } from "@/types/test-plan.types";
import type { PagedResponse, PaginatedResult, PaginationParams } from "@/types/pagination.types";
import { extractPage } from "@/types/pagination.types";

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

export function useTestPlansByProject(projectId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: ["testPlans", "project", projectId, params],
    queryFn: async (): Promise<PaginatedResult<TestPlan>> => {
      const { data } = await axios.get<PagedResponse<TestPlan>>(
        `/test-plans/project/${projectId}`,
        { params: { page: params?.page ?? 0, size: params?.size ?? 20, sort: params?.sort } }
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

export function useCreateTestPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTestPlanInput) => {
      const { data } = await axios.post<TestPlan>("/test-plans", input);
      return data;
    },
    onSuccess: () => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testPlans"] });
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
