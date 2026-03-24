import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import type { TestSuite, CreateTestSuiteInput, UpdateTestSuiteInput } from "@/types/test-suite.types";
import type { TestCase } from "@/types/test-case.types";
import type { PagedResponse, PaginatedResult, PaginationParams } from "@/types/pagination.types";
import { extractPage } from "@/types/pagination.types";

export function useTestSuites(params?: PaginationParams) {
  return useQuery({
    queryKey: ["testSuites", params],
    queryFn: async (): Promise<PaginatedResult<TestSuite>> => {
      const { data } = await axios.get<PagedResponse<TestSuite>>("/test-suites", {
        params: { page: params?.page ?? 0, size: params?.size ?? 20, sort: params?.sort },
      });
      return extractPage(data);
    },
  });
}

export function useTestSuitesByProject(projectId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: ["testSuites", "project", projectId, params],
    queryFn: async (): Promise<PaginatedResult<TestSuite>> => {
      const { data } = await axios.get<PagedResponse<TestSuite>>(
        `/test-suites/project/${projectId}`,
        { params: { page: params?.page ?? 0, size: params?.size ?? 20, sort: params?.sort } }
      );
      return extractPage(data);
    },
    enabled: !!projectId,
  });
}

export function useTestSuite(id: string) {
  return useQuery({
    queryKey: ["testSuites", id],
    queryFn: async () => {
      const { data } = await axios.get<TestSuite>(`/test-suites/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateTestSuite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTestSuiteInput) => {
      const { data } = await axios.post<TestSuite>("/test-suites", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testSuites"] });
    },
  });
}

export function useUpdateTestSuite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateTestSuiteInput & { id: string }) => {
      const { data } = await axios.put<TestSuite>(`/test-suites/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testSuites"] });
    },
  });
}

export function useDeleteTestSuite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/test-suites/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testSuites"] });
    },
  });
}

// ---- TestSuiteItem hooks: manage test cases in a suite ----

export function useTestCasesInSuite(suiteId: string) {
  return useQuery({
    queryKey: ["testSuites", suiteId, "testCases"],
    queryFn: async (): Promise<TestCase[]> => {
      const { data } = await axios.get(`/test-suites/${suiteId}/test-cases`);
      
      // Handle ApiResponse wrapper: { success, data: { content: [...] } }
      // or CollectionModel: { success, data: { _embedded: { testCaseResponses: [...] } } }
      const inner = data?.data ?? data;
      
      // content array (ApiResponse<Page/Collection>)
      if (Array.isArray(inner?.content)) return inner.content as TestCase[];
      
      // _embedded (HATEOAS CollectionModel)
      const embedded = inner?._embedded ?? data?._embedded;
      if (embedded) {
        const key = Object.keys(embedded)[0];
        return key ? (embedded[key] as TestCase[]) : [];
      }

      // Fallback: direct array
      if (Array.isArray(inner)) return inner;
      if (Array.isArray(data)) return data;
      return [];
    },
    enabled: !!suiteId,
  });
}

export function useAddTestCaseToSuite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ suiteId, testCaseId }: { suiteId: string; testCaseId: string }) => {
      const { data } = await axios.post(`/test-suites/${suiteId}/test-cases`, { testCaseId });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["testSuites", variables.suiteId, "testCases"] });
    },
  });
}

export function useRemoveTestCaseFromSuite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ suiteId, testCaseId }: { suiteId: string; testCaseId: string }) => {
      await axios.delete(`/test-suites/${suiteId}/test-cases/${testCaseId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["testSuites", variables.suiteId, "testCases"] });
    },
  });
}
