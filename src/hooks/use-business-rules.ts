import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import type {
  BusinessRule,
  CreateBusinessRuleInput,
  UpdateBusinessRuleInput,
} from "@/types/business-rule.types";
import type { PagedResponse, PaginatedResult, PaginationParams } from "@/types/pagination.types";
import { extractPage } from "@/types/pagination.types";

export function useBusinessRules(projectId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: ["business-rules", projectId, params],
    queryFn: async (): Promise<PaginatedResult<BusinessRule>> => {
      const { data } = await axios.get<PagedResponse<BusinessRule>>(
        `/projects/${projectId}/business-rules`,
        { params: { page: params?.page ?? 0, size: params?.size ?? 20, sort: params?.sort } }
      );
      return extractPage(data);
    },
    enabled: !!projectId,
  });
}

export function useBusinessRulesByStory(projectId: string, storyId: string) {
  return useQuery({
    queryKey: ["business-rules", projectId, "story", storyId],
    queryFn: async (): Promise<BusinessRule[]> => {
      const { data } = await axios.get<BusinessRule[]>(
        `/projects/${projectId}/business-rules`,
        { params: { storyId } }
      );
      return data;
    },
    enabled: !!projectId && !!storyId,
  });
}

export function useCreateBusinessRule(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBusinessRuleInput) => {
      const { data } = await axios.post<BusinessRule>(
        `/projects/${projectId}/business-rules`,
        input
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-rules", projectId] });
    },
  });
}

export function useUpdateBusinessRule(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateBusinessRuleInput & { id: string }) => {
      const { data } = await axios.put<BusinessRule>(
        `/projects/${projectId}/business-rules/${id}`,
        updates
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-rules", projectId] });
    },
  });
}

export function useDeleteBusinessRule(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/projects/${projectId}/business-rules/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-rules", projectId] });
    },
  });
}
