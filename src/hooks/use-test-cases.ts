import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import type { TestCase, CreateTestCaseInput, UpdateTestCaseInput } from "@/types/test-case.types";
import type { PagedResponse, PaginatedResult, PaginationParams } from "@/types/pagination.types";
import { extractPage } from "@/types/pagination.types";

export function useTestCases(params?: PaginationParams) {
  return useQuery({
    queryKey: ["testCases", params],
    queryFn: async (): Promise<PaginatedResult<TestCase>> => {
      const { data } = await axios.get<PagedResponse<TestCase>>("/test-cases", {
        params: { page: params?.page ?? 0, size: params?.size ?? 20, sort: params?.sort },
      });
      return extractPage(data);
    },
  });
}

export function useTestCasesByAcceptanceCriteria(
  acceptanceCriteriaId: string,
  params?: PaginationParams
) {
  return useQuery({
    queryKey: ["testCases", "acceptance-criteria", acceptanceCriteriaId, params],
    queryFn: async (): Promise<PaginatedResult<TestCase>> => {
      const { data } = await axios.get<PagedResponse<TestCase>>(
        `/test-cases/acceptance-criteria/${acceptanceCriteriaId}`,
        { params: { page: params?.page ?? 0, size: params?.size ?? 20, sort: params?.sort } }
      );
      return extractPage(data);
    },
    enabled: !!acceptanceCriteriaId,
  });
}

export function useSearchTestCases(title: string, params?: PaginationParams) {
  return useQuery({
    queryKey: ["testCases", "search", title, params],
    queryFn: async (): Promise<PaginatedResult<TestCase>> => {
      const { data } = await axios.get<PagedResponse<TestCase>>("/test-cases/search", {
        params: { title, page: params?.page ?? 0, size: params?.size ?? 20, sort: params?.sort },
      });
      return extractPage(data);
    },
    enabled: !!title,
  });
}

export function useTestCase(id: string) {
  return useQuery({
    queryKey: ["testCases", id],
    queryFn: async () => {
      const { data } = await axios.get<TestCase>(`/test-cases/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateTestCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTestCaseInput) => {
      const { data } = await axios.post<TestCase>("/test-cases", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testCases"] });
    },
  });
}

export function useUpdateTestCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateTestCaseInput & { id: string }) => {
      const { data } = await axios.put<TestCase>(`/test-cases/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testCases"] });
    },
  });
}

export function useDeleteTestCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/test-cases/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testCases"] });
    },
  });
}
