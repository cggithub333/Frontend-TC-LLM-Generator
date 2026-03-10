import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import type { UserStory, CreateUserStoryInput, UpdateUserStoryInput } from "@/types/story.types";
import type { PagedResponse, PaginatedResult, PaginationParams } from "@/types/pagination.types";
import { extractPage } from "@/types/pagination.types";

export function useStories(params?: PaginationParams) {
  return useQuery({
    queryKey: ["stories", params],
    queryFn: async (): Promise<PaginatedResult<UserStory>> => {
      const { data } = await axios.get<PagedResponse<UserStory>>("/user-stories", {
        params: { page: params?.page ?? 0, size: params?.size ?? 20, sort: params?.sort },
      });
      return extractPage(data);
    },
  });
}

export function useStoriesByProject(projectId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: ["stories", "project", projectId, params],
    queryFn: async (): Promise<PaginatedResult<UserStory>> => {
      const { data } = await axios.get<PagedResponse<UserStory>>(
        `/user-stories/project/${projectId}`,
        { params: { page: params?.page ?? 0, size: params?.size ?? 20, sort: params?.sort } }
      );
      return extractPage(data);
    },
    enabled: !!projectId,
  });
}

export function useStory(id: string) {
  return useQuery({
    queryKey: ["stories", id],
    queryFn: async () => {
      const { data } = await axios.get<UserStory>(`/user-stories/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateUserStoryInput) => {
      const { data } = await axios.post<UserStory>("/user-stories", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
}

export function useUpdateStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateUserStoryInput & { id: string }) => {
      const { data } = await axios.put<UserStory>(`/user-stories/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/user-stories/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
}
