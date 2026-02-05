import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import type { Workspace } from "@/types/workspace.types";

type CreateWorkspaceInput = Omit<Workspace, "id" | "createdAt">;
type UpdateWorkspaceInput = Partial<Workspace>;

export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const { data } = await axios.get<Workspace[]>("/workspaces");
      return data;
    },
  });
}

export function useWorkspace(id: number) {
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
    mutationFn: async (input: CreateWorkspaceInput) => {
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
    mutationFn: async ({ id, ...updates }: UpdateWorkspaceInput & { id: number }) => {
      const { data } = await axios.patch<Workspace>(`/workspaces/${id}`, updates);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces", data.id] });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/workspaces/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}
