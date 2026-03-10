import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import type { ProjectMember, AddProjectMemberInput, UpdateProjectMemberInput } from "@/types/team.types";
import type { PagedResponse, PaginatedResult, PaginationParams } from "@/types/pagination.types";
import { extractPage } from "@/types/pagination.types";

export function useProjectMembers(projectId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: ["project-members", projectId, params],
    queryFn: async (): Promise<PaginatedResult<ProjectMember>> => {
      const { data } = await axios.get<PagedResponse<ProjectMember>>(
        `/project-members/project/${projectId}`,
        { params: { page: params?.page ?? 0, size: params?.size ?? 20, sort: params?.sort } }
      );
      return extractPage(data);
    },
    enabled: !!projectId,
  });
}

export function useAddProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddProjectMemberInput) => {
      const { data } = await axios.post<ProjectMember>("/project-members", input);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project-members", variables.projectId],
      });
    },
  });
}

export function useUpdateProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      memberId,
      ...updates
    }: UpdateProjectMemberInput & { projectId: string; memberId: string }) => {
      const { data } = await axios.put<ProjectMember>(
        `/project-members/${memberId}`,
        updates
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project-members", variables.projectId],
      });
    },
  });
}

export function useRemoveProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      memberId,
    }: {
      projectId: string;
      memberId: string;
    }) => {
      await axios.delete(`/project-members/${memberId}`);
      return { projectId, memberId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["project-members", data.projectId],
      });
    },
  });
}
