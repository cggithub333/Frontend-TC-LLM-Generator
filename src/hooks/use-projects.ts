import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import type { Project } from "@/types/workspace.types";
import type { CreateProjectInput, UpdateProjectInput } from "@/types/project.types";
import type { PagedResponse, PaginatedResult, PaginationParams } from "@/types/pagination.types";
import { extractPage } from "@/types/pagination.types";

export function useProjects(params?: PaginationParams) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: async (): Promise<PaginatedResult<Project>> => {
      const { data } = await axios.get<PagedResponse<Project>>("/projects", {
        params: { page: params?.page ?? 0, size: params?.size ?? 20, sort: params?.sort },
      });
      return extractPage(data);
    },
  });
}

export function useProjectsByWorkspace(workspaceId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: ["projects", "workspace", workspaceId, params],
    queryFn: async (): Promise<PaginatedResult<Project>> => {
      const { data } = await axios.get<PagedResponse<Project>>(
        `/projects/workspace/${workspaceId}`,
        { params: { page: params?.page ?? 0, size: params?.size ?? 20, sort: params?.sort } }
      );
      return extractPage(data);
    },
    enabled: !!workspaceId,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: async () => {
      const { data } = await axios.get<Project>(`/projects/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const { data } = await axios.post<Project>("/projects", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateProjectInput & { id: string }) => {
      const { data } = await axios.put<Project>(`/projects/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/projects/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
