/**
 * CreateProjectDialog Component
 * Modal dialog for creating a new project with form validation
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type {
  CreateProjectInput,
  ProjectFormErrors,
} from "@/types/project.types";
import {
  validateProjectName,
  validateProjectKey,
  generateProjectKey,
} from "@/lib/utils/validation.utils";
import { useCreateProject } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  onSuccess?: () => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  workspaceId,
  onSuccess,
}: CreateProjectDialogProps) {
  const [formData, setFormData] = useState<CreateProjectInput>({
    workspaceId,
    name: "",
    projectKey: "",
    description: "",
  });

  const [errors, setErrors] = useState<ProjectFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const createProject = useCreateProject();

  const projectKeyValidation = validateProjectKey(formData.projectKey);

  useEffect(() => {
    if (formData.name && !touched.projectKey) {
      const generatedKey = generateProjectKey(formData.name);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData((prev) => ({ ...prev, projectKey: generatedKey }));
    }
  }, [formData.name, touched.projectKey]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData((prev) => ({ ...prev, workspaceId }));
  }, [workspaceId]);

  const handleFieldChange = useCallback(
    (field: keyof CreateProjectInput, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setTouched((prev) => ({ ...prev, [field]: true }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const handleFieldBlur = useCallback(
    (field: keyof CreateProjectInput) => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      let error: string | undefined;
      switch (field) {
        case "name":
          error = validateProjectName(formData.name);
          break;
        case "projectKey":
          error = projectKeyValidation.message;
          break;
      }

      if (error) {
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    },
    [formData, projectKeyValidation],
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: ProjectFormErrors = {};

    const nameError = validateProjectName(formData.name);
    if (nameError) newErrors.name = nameError;

    if (!projectKeyValidation.isValid) {
      newErrors.projectKey = projectKeyValidation.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, projectKeyValidation]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      setTouched({
        name: true,
        projectKey: true,
        description: true,
        jiraSiteId: true,
        jiraProjectKey: true,
      });

      if (!formData.workspaceId) {
        setErrors((prev) => ({
          ...prev,
          name: "No workspace available. Please create a workspace first.",
        }));
        return;
      }

      if (!validateForm()) {
        return;
      }

      try {
        await createProject.mutateAsync(formData);

        onOpenChange(false);
        onSuccess?.();

        setFormData({
          workspaceId,
          name: "",
          projectKey: "",
          description: "",
          jiraSiteId: "",
          jiraProjectKey: "",
        });
        setErrors({});
        setTouched({});
        toast.success("Project created successfully");
      } catch (error) {
        toast.error("Failed to create project");
      }
    },
    [
      validateForm,
      createProject,
      formData,
      onOpenChange,
      onSuccess,
      workspaceId,
    ],
  );

  const handleClose = useCallback(() => {
    if (!createProject.isPending) {
      onOpenChange(false);
    }
  }, [onOpenChange, createProject.isPending]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[560px] p-0 gap-0">
        <DialogHeader className="px-6 py-5 border-b space-y-1">
          <DialogTitle className="text-lg font-bold">
            Create New Project
          </DialogTitle>
          <DialogDescription className="text-xs">
            Configure your new QA environment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Name & Key */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="project-name" className="text-sm font-semibold">
                Project Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="project-name"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                onBlur={() => handleFieldBlur("name")}
                placeholder="e.g. Web Dashboard V2"
                className={cn(
                  "transition-all",
                  touched.name && errors.name && "border-destructive",
                )}
                disabled={createProject.isPending}
              />
              {touched.name && errors.name && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="project-key" className="text-sm font-semibold">
                Key <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="project-key"
                  value={formData.projectKey}
                  onChange={(e) =>
                    handleFieldChange(
                      "projectKey",
                      e.target.value.toUpperCase(),
                    )
                  }
                  onBlur={() => handleFieldBlur("projectKey")}
                  className={cn(
                    "uppercase font-medium pr-8 transition-all",
                    projectKeyValidation.isValid &&
                      touched.projectKey &&
                      "border-green-500 bg-green-50/30 dark:bg-green-900/10",
                    !projectKeyValidation.isValid &&
                      touched.projectKey &&
                      "border-destructive bg-destructive/5",
                  )}
                  maxLength={10}
                  disabled={createProject.isPending}
                />
                {touched.projectKey && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    {projectKeyValidation.isValid ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                )}
              </div>
              {touched.projectKey && !projectKeyValidation.isValid && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {projectKeyValidation.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-semibold">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              rows={3}
              className="resize-none"
              disabled={createProject.isPending}
            />
          </div>



          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={createProject.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
