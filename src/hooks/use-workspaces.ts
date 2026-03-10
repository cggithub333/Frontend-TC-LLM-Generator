import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import type { Workspace } from "@/types/workspace.types";
import type { PagedResponse, PaginatedResult, PaginationParams } from "@/types/pagination.types";
import { extractPage } from "@/types/pagination.types";

export function useWorkspaces(params?: PaginationParams) {
  return useQuery({
    queryKey: ["workspaces", params],
    queryFn: async (): Promise<PaginatedResult<Workspace>> => {
      const { data } = await axios.get<PagedResponse<Workspace>>("/workspaces", {
        params: { page: params?.page ?? 0, size: params?.size ?? 20, sort: params?.sort },
      });
      return extractPage(data);
    },
  });
}

export function useWorkspace(id: string) {
  return useQuery({
    queryKey: ["workspaces", id],
    queryFn: async () => {
      const { data } = await axios.get<Workspace>(`/workspaces/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { ownerUserId: string; name: string; description?: string }) => {
      const { data } = await axios.post<Workspace>("/workspaces", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; description?: string }) => {
      const { data } = await axios.put<Workspace>(`/workspaces/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/workspaces/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}
