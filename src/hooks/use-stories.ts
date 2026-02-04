import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

interface AcceptanceCriteria {
  id: string;
  description: string;
  completed: boolean;
}

interface Story {
  id: string;
  code: string;
  projectId: number;
  title: string;
  asA: string;
  iWantTo: string;
  soThat: string;
  status: string;
  priority: string;
  acceptanceCriteria: AcceptanceCriteria[];
  assignedTo: string;
  tags: string[];
  lastUpdated: string;
  comments: number;
  testCases: number;
}

type CreateStoryInput = Omit<Story, "id" | "code">;
type UpdateStoryInput = Partial<Story>;

export function useStories(projectId?: number) {
  return useQuery({
    queryKey: ["stories", projectId],
    queryFn: async () => {
      const { data } = await axios.get<Story[]>("/stories", {
        params: projectId ? { projectId } : undefined,
      });
      return data;
    },
  });
}

export function useStory(id: string) {
  return useQuery({
    queryKey: ["stories", id],
    queryFn: async () => {
      const { data } = await axios.get<Story>(`/stories/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateStoryInput) => {
      const { data } = await axios.post<Story>("/stories", input);
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
    mutationFn: async ({ id, ...updates }: UpdateStoryInput & { id: string }) => {
      const { data } = await axios.patch<Story>(`/stories/${id}`, updates);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["stories", data.id] });
    },
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/stories/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
}

export function useUpdateAcceptanceCriteria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      storyId,
      criteriaId,
      completed,
    }: {
      storyId: string;
      criteriaId: string;
      completed: boolean;
    }) => {
      // First get the current story
      const { data: story } = await axios.get<Story>(`/stories/${storyId}`);
      
      // Update the specific criteria
      const updatedCriteria = story.acceptanceCriteria.map((ac) =>
        ac.id === criteriaId ? { ...ac, completed } : ac
      );

      // Save the updated story
      const { data } = await axios.patch<Story>(`/stories/${storyId}`, {
        acceptanceCriteria: updatedCriteria,
      });
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["stories", data.id] });
    },
  });
}

