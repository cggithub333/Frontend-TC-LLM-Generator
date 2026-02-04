import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

interface Project {
  id: number;
  workspaceId: number;
  name: string;
  icon: string;
  stories: number;
  tests: number;
  defects?: number;
  status: string;
  updated: string;
  members: number;
}

export function useProjects(workspaceId?: number) {
  return useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: async () => {
      const { data } = await axios.get<Project[]>("/projects", {
        params: workspaceId ? { workspaceId } : undefined,
      });
      return data;
    },
  });
}

export function useProject(id: number) {
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
    mutationFn: async (newProject: Omit<Project, "id">) => {
      const { data } = await axios.post<Project>("/projects", newProject);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
