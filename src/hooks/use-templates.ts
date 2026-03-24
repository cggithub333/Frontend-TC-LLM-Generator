import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import type {
  TestCaseTemplate,
  CreateTemplateInput,
  FieldInput,
} from "@/types/template.types";

export function useTemplates(projectId: string) {
  return useQuery({
    queryKey: ["templates", projectId],
    queryFn: async (): Promise<TestCaseTemplate[]> => {
      const { data } = await axios.get<TestCaseTemplate[]>(
        `/projects/${projectId}/templates`
      );
      return data;
    },
    enabled: !!projectId,
  });
}

export function useTemplate(projectId: string, templateId: string) {
  return useQuery({
    queryKey: ["templates", projectId, templateId],
    queryFn: async (): Promise<TestCaseTemplate> => {
      const { data } = await axios.get<TestCaseTemplate>(
        `/projects/${projectId}/templates/${templateId}`
      );
      return data;
    },
    enabled: !!projectId && !!templateId,
  });
}

export function useCreateTemplate(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTemplateInput) => {
      const { data } = await axios.post<TestCaseTemplate>(
        `/projects/${projectId}/templates`,
        input
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", projectId] });
    },
  });
}

export function useUpdateTemplate(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string; name?: string; description?: string; isDefault?: boolean }) => {
      const { data } = await axios.put<TestCaseTemplate>(
        `/projects/${projectId}/templates/${id}`,
        updates
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", projectId] });
    },
  });
}

export function useReplaceTemplateFields(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ templateId, fields }: { templateId: string; fields: FieldInput[] }) => {
      const { data } = await axios.put(
        `/projects/${projectId}/templates/${templateId}/fields`,
        fields
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", projectId] });
    },
  });
}

export function useDeleteTemplate(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/projects/${projectId}/templates/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", projectId] });
    },
  });
}
