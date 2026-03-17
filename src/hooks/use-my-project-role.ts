import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

interface MyProjectRole {
  canManageTeam: boolean;
  projectRole: string;
  isWorkspaceAdmin: boolean;
}

export function useMyProjectRole(projectId: string) {
  return useQuery({
    queryKey: ["my-project-role", projectId],
    queryFn: async (): Promise<MyProjectRole> => {
      const { data } = await axios.get<MyProjectRole>(
        `/project-members/project/${projectId}/my-role`,
      );
      return data;
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });
}
