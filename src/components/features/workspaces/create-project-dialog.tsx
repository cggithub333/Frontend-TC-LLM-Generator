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
import { X, CheckCircle2, AlertCircle, Link as LinkIcon } from "lucide-react";
import type {
  CreateProjectInput,
  ProjectFormErrors,
} from "@/types/project.types";
import {
  validateProjectName,
  validateProjectKey,
  validateJiraSiteId,
  validateJiraProjectKey,
  generateProjectKey,
} from "@/lib/utils/validation.utils";
import { useCreateProject } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: number;
  onSuccess?: () => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  workspaceId,
  onSuccess,
}: CreateProjectDialogProps) {
  // Form state
  const [formData, setFormData] = useState<CreateProjectInput>({
    workspaceId,
    name: "",
    projectKey: "",
    description: "",
    icon: "layers",
    jiraSiteId: "",
    jiraProjectKey: "",
  });

  const [errors, setErrors] = useState<ProjectFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Mutation
  const createProject = useCreateProject();

  // Validate project key in real-time
  const projectKeyValidation = validateProjectKey(formData.projectKey);

  // Auto-generate project key when name changes
  useEffect(() => {
    if (formData.name && !touched.projectKey) {
      const generatedKey = generateProjectKey(formData.name);
      setFormData((prev) => ({ ...prev, projectKey: generatedKey }));
    }
  }, [formData.name, touched.projectKey]);

  // Handle field change
  const handleFieldChange = useCallback(
    (field: keyof CreateProjectInput, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setTouched((prev) => ({ ...prev, [field]: true }));

      // Clear error for this field
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );

  // Handle field blur - validate on blur
  const handleFieldBlur = useCallback(
    (field: keyof CreateProjectInput) => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      // Validate field
      let error: string | undefined;
      switch (field) {
        case "name":
          error = validateProjectName(formData.name);
          break;
        case "projectKey":
          error = projectKeyValidation.message;
          break;
        case "jiraSiteId":
          error = validateJiraSiteId(formData.jiraSiteId || "");
          break;
        case "jiraProjectKey":
          error = validateJiraProjectKey(
            formData.jiraProjectKey || "",
            formData.jiraSiteId
          );
          break;
      }

      if (error) {
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    },
    [formData, projectKeyValidation]
  );

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const newErrors: ProjectFormErrors = {};

    // Validate required fields
    const nameError = validateProjectName(formData.name);
    if (nameError) newErrors.name = nameError;

    if (!projectKeyValidation.isValid) {
      newErrors.projectKey = projectKeyValidation.message;
    }

    // Validate Jira fields if provided
    const jiraSiteError = validateJiraSiteId(formData.jiraSiteId || "");
    if (jiraSiteError) newErrors.jiraSiteId = jiraSiteError;

    const jiraKeyError = validateJiraProjectKey(
      formData.jiraProjectKey || "",
      formData.jiraSiteId
    );
    if (jiraKeyError) newErrors.jiraProjectKey = jiraKeyError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, projectKeyValidation]);

  // Handle form submit
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Mark all fields as touched
      setTouched({
        name: true,
        projectKey: true,
        description: true,
        jiraSiteId: true,
        jiraProjectKey: true,
      });

      if (!validateForm()) {
        return;
      }

      try {
        await createProject.mutateAsync({
          ...formData,
          // Mock API expects these fields
          stories: 0,
          tests: 0,
          status: "Active",
          updated: "Just now",
          members: 1,
        });

        // Success - close dialog and reset form
        onOpenChange(false);
        onSuccess?.();

        // Reset form
        setFormData({
          workspaceId,
          name: "",
          projectKey: "",
          description: "",
          icon: "layers",
          jiraSiteId: "",
          jiraProjectKey: "",
        });
        setErrors({});
        setTouched({});
      } catch (error) {
        console.error("Failed to create project:", error);
      }
    },
    [validateForm, createProject, formData, onOpenChange, onSuccess, workspaceId]
  );

  // Handle dialog close
  const handleClose = useCallback(() => {
    if (!createProject.isPending) {
      onOpenChange(false);
    }
  }, [onOpenChange, createProject.isPending]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[560px] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b space-y-1">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-lg font-bold">
                Create New Project
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configure your new QA environment
              </DialogDescription>
            </div>
            <button
              onClick={handleClose}
              disabled={createProject.isPending}
              className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Name & Key */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Project Name */}
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
                  touched.name && errors.name && "border-destructive"
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

            {/* Project Key */}
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
                      e.target.value.toUpperCase()
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
                      "border-destructive bg-destructive/5"
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

          {/* Jira Integration */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-[#0052CC]" />
              <h3 className="text-sm font-bold">Jira Integration</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0052CC]/10 text-[#0052CC] uppercase tracking-wide">
                Optional
              </span>
            </div>

            <div className="space-y-4">
              {/* Jira Site ID */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="jira-site"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Jira Site ID
                </Label>
                <Input
                  id="jira-site"
                  value={formData.jiraSiteId}
                  onChange={(e) =>
                    handleFieldChange("jiraSiteId", e.target.value)
                  }
                  onBlur={() => handleFieldBlur("jiraSiteId")}
                  placeholder="e.g. mycompany.atlassian.net"
                  className={cn(
                    touched.jiraSiteId &&
                      errors.jiraSiteId &&
                      "border-destructive"
                  )}
                  disabled={createProject.isPending}
                />
                {touched.jiraSiteId && errors.jiraSiteId && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.jiraSiteId}
                  </p>
                )}
              </div>

              {/* Jira Project Key */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="jira-key"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Jira Project Key
                </Label>
                <div className="relative">
                  <Input
                    id="jira-key"
                    value={formData.jiraProjectKey}
                    onChange={(e) =>
                      handleFieldChange(
                        "jiraProjectKey",
                        e.target.value.toUpperCase()
                      )
                    }
                    onBlur={() => handleFieldBlur("jiraProjectKey")}
                    placeholder="e.g. PROJ"
                    className={cn(
                      "uppercase",
                      touched.jiraProjectKey &&
                        errors.jiraProjectKey &&
                        "border-destructive bg-destructive/5"
                    )}
                    disabled={createProject.isPending}
                  />
                  {touched.jiraProjectKey && errors.jiraProjectKey && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    </div>
                  )}
                </div>
                {touched.jiraProjectKey && errors.jiraProjectKey && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.jiraProjectKey}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
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
