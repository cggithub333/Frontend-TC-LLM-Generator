import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import type {
  AcceptanceCriteria,
  CreateAcceptanceCriteriaInput,
  UpdateAcceptanceCriteriaInput,
} from "@/types/story.types";

export function useAcceptanceCriteriaByStory(storyId: string) {
  return useQuery({
    queryKey: ["acceptance-criteria", "story", storyId],
    queryFn: async () => {
      const { data } = await axios.get<AcceptanceCriteria[]>(
        `/user-stories/${storyId}/acceptance-criteria`,
      );
      return data;
    },
    enabled: !!storyId,
  });
}

export function useCreateAcceptanceCriteria(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAcceptanceCriteriaInput) => {
      const { data } = await axios.post<AcceptanceCriteria>(
        `/user-stories/${storyId}/acceptance-criteria`,
        input,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["acceptance-criteria", "story", storyId],
      });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
}

export function useBatchCreateAcceptanceCriteria(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inputs: CreateAcceptanceCriteriaInput[]) => {
      const { data } = await axios.post<AcceptanceCriteria[]>(
        `/user-stories/${storyId}/acceptance-criteria/batch`,
        inputs,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["acceptance-criteria", "story", storyId],
      });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
}

export function useUpdateAcceptanceCriteria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: UpdateAcceptanceCriteriaInput & { id: string }) => {
      const { data } = await axios.put<AcceptanceCriteria>(
        `/acceptance-criteria/${id}`,
        updates,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acceptance-criteria"] });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
}

export function useDeleteAcceptanceCriteria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/acceptance-criteria/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acceptance-criteria"] });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
}
