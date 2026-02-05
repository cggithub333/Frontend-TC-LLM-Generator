import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import type { ProjectMember, InviteMemberInput, MemberStatus } from "@/types/team.types";

/**
 * Fetch project members
 */
export function useProjectMembers(projectId: number) {
  return useQuery({
    queryKey: ["project-members", projectId],
    queryFn: async () => {
      const { data } = await axios.get<ProjectMember[]>(`/project-members?projectId=${projectId}`);
      return data;
    },
    enabled: !!projectId,
  });
}

/**
 * Invite member to project
 */
export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: InviteMemberInput) => {
      const { data } = await axios.post<ProjectMember>(
        `/project-members`,
        input
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

/**
 * Update member status (Active/Inactive)
 */
export function useUpdateMemberStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      memberId,
      status,
    }: {
      projectId: number;
      memberId: number;
      status: MemberStatus;
    }) => {
      const { data } = await axios.patch<ProjectMember>(
        `/project-members/${memberId}`,
        { status }
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

/**
 * Remove member from project
 */
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      memberId,
    }: {
      projectId: number;
      memberId: number;
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
