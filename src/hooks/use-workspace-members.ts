import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import type {
  WorkspaceMember,
  WorkspaceInvitation,
  SendInvitationInput,
  UpdateWorkspaceMemberInput,
} from "@/types/workspace.types";
import type {
  PagedResponse,
  PaginatedResult,
  PaginationParams,
} from "@/types/pagination.types";
import { extractPage } from "@/types/pagination.types";

// ─── Workspace Members ───────────────────────────────────────

export function useWorkspaceMembers(
  workspaceId: string,
  params?: PaginationParams,
) {
  return useQuery({
    queryKey: ["workspace-members", workspaceId, params],
    queryFn: async (): Promise<PaginatedResult<WorkspaceMember>> => {
      const { data } = await axios.get<PagedResponse<WorkspaceMember>>(
        `/workspace-members/workspace/${workspaceId}`,
        {
          params: {
            page: params?.page ?? 0,
            size: params?.size ?? 50,
            sort: params?.sort,
          },
        },
      );
      return extractPage(data);
    },
    enabled: !!workspaceId,
  });
}

export function useUpdateWorkspaceMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId: _workspaceId,
      memberId,
      ...updates
    }: UpdateWorkspaceMemberInput & { workspaceId: string; memberId: string }) => {
      const { data } = await axios.put<WorkspaceMember>(
        `/workspace-members/${memberId}`,
        updates,
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-members", variables.workspaceId],
      });
    },
  });
}

export function useRemoveWorkspaceMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId,
      memberId,
    }: {
      workspaceId: string;
      memberId: string;
    }) => {
      await axios.delete(`/workspace-members/${memberId}`);
      return { workspaceId, memberId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-members", data.workspaceId],
      });
    },
  });
}

// ─── Workspace Invitations ───────────────────────────────────

export function useWorkspaceInvitations(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace-invitations", workspaceId],
    queryFn: async (): Promise<WorkspaceInvitation[]> => {
      const { data } = await axios.get(
        `/workspace-invitations/workspace/${workspaceId}/pending`,
      );
      return data?.data ?? [];
    },
    enabled: !!workspaceId,
  });
}

export function useSendWorkspaceInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SendInvitationInput) => {
      const { data } = await axios.post<WorkspaceInvitation>(
        "/workspace-invitations",
        input,
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-invitations", variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace-members", variables.workspaceId],
      });
    },
  });
}

export function useCancelWorkspaceInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId,
      invitationId,
    }: {
      workspaceId: string;
      invitationId: string;
    }) => {
      await axios.delete(`/workspace-invitations/${invitationId}`);
      return { workspaceId, invitationId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-invitations", data.workspaceId],
      });
    },
  });
}

// ─── Invitation accept (for accept page) ─────────────────────

export function useInvitationInfo(token: string) {
  return useQuery({
    queryKey: ["invitation-info", token],
    queryFn: async (): Promise<WorkspaceInvitation> => {
      const { data } = await axios.get(
        `/workspace-invitations/${token}/info`,
      );
      return data?.data ?? data;
    },
    enabled: !!token,
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const { data } = await axios.post(
        `/workspace-invitations/${token}/accept`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-members"] });
    },
  });
}
