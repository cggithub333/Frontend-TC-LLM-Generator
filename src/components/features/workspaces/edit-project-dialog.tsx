/**
 * EditProjectDialog Component
 * Modal dialog for editing an existing project with form validation
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
import { AlertCircle } from "lucide-react";
import type {
  UpdateProjectInput,
  ProjectFormErrors,
} from "@/types/project.types";
import {
  validateProjectName,
} from "@/lib/utils/validation.utils";
import { useUpdateProject } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/workspace.types";

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onSuccess?: () => void;
}

export function EditProjectDialog({
  open,
  onOpenChange,
  project,
  onSuccess,
}: EditProjectDialogProps) {
  const [formData, setFormData] = useState<UpdateProjectInput>({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState<ProjectFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const updateProject = useUpdateProject();

  useEffect(() => {
    if (project && open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: project.name,
        description: project.description || "",
      });
      setErrors({});
      setTouched({});
    }
  }, [project, open]);

  const handleFieldChange = useCallback(
    (field: keyof UpdateProjectInput, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setTouched((prev) => ({ ...prev, [field]: true }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const handleFieldBlur = useCallback(
    (field: keyof UpdateProjectInput) => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      let error: string | undefined;
      switch (field) {
        case "name":
          error = validateProjectName(formData.name || "");
          break;
      }

      if (error) {
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    },
    [formData],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const nameError = validateProjectName(formData.name || "");

      const formErrors: ProjectFormErrors = {
        ...(nameError && { name: nameError }),
      };

      if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors);
        return;
      }

      if (!project) return;

      try {
        await updateProject.mutateAsync({
          id: project.projectId,
          name: formData.name?.trim(),
          description: formData.description?.trim() || undefined,
        });

        onOpenChange(false);
        onSuccess?.();
      } catch (error) {
        console.error("Failed to update project:", error);
      }
    },
    [formData, project, updateProject, onOpenChange, onSuccess],
  );

  const handleClose = useCallback(() => {
    if (!updateProject.isPending) {
      onOpenChange(false);
    }
  }, [onOpenChange, updateProject.isPending]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[480px] p-0 flex flex-col max-h-[90vh]">
        <DialogHeader className="px-6 py-5 border-b space-y-1 bg-card rounded-t-lg shrink-0">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            Edit Project
          </DialogTitle>
          <DialogDescription className="text-xs">
            Update project details
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-muted/10">
            {/* Project Name */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label
                  htmlFor="edit-project-name"
                  className="text-sm font-semibold"
                >
                  Project Name <span className="text-destructive">*</span>
                </Label>
              </div>
              <Input
                id="edit-project-name"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                onBlur={() => handleFieldBlur("name")}
                placeholder="e.g. Mobile App Testing"
                className={cn(
                  "transition-all bg-background",
                  touched.name && errors.name && "border-destructive",
                )}
                disabled={updateProject.isPending}
                autoFocus
              />
              {touched.name && errors.name && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5 pt-2">
              <Label
                htmlFor="edit-project-description"
                className="text-sm font-semibold"
              >
                Description
              </Label>
              <Textarea
                id="edit-project-description"
                value={formData.description}
                onChange={(e) =>
                  handleFieldChange("description", e.target.value)
                }
                rows={3}
                placeholder="Brief description of this project..."
                className="resize-none bg-background transition-colors focus-visible:ring-1"
                disabled={updateProject.isPending}
              />
            </div>


          </div>

          <DialogFooter className="px-6 py-4 bg-card border-t shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateProject.isPending}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateProject.isPending}
              className="px-6 gap-2"
            >
              {updateProject.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
