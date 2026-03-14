/**
 * DeleteProjectDialog Component
 * Confirmation dialog for deleting a project
 */

"use client";

import { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useDeleteProject } from "@/hooks/use-projects";
import type { Project } from "@/types/workspace.types";
import { toast } from "sonner";

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onSuccess?: () => void;
}

export function DeleteProjectDialog({
  open,
  onOpenChange,
  project,
  onSuccess,
}: DeleteProjectDialogProps) {
  const deleteProject = useDeleteProject();

  const handleDelete = useCallback(async () => {
    if (!project) return;

    try {
      await deleteProject.mutateAsync(project.projectId);
      onOpenChange(false);
      onSuccess?.();
      toast.success("Project deleted");
    } catch (error) {
      toast.error("Failed to delete project");
    }
  }, [project, deleteProject, onOpenChange, onSuccess]);

  const handleClose = useCallback(() => {
    if (!deleteProject.isPending) {
      onOpenChange(false);
    }
  }, [onOpenChange, deleteProject.isPending]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[440px] p-0 gap-0">
        <DialogHeader className="px-6 py-5 border-b space-y-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Delete Project
              </DialogTitle>
              <DialogDescription className="text-xs">
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <p className="text-sm text-foreground">
            Are you sure you want to delete{" "}
            <strong>&quot;{project?.name}&quot;</strong>?
          </p>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <p className="text-xs text-destructive font-medium">
              All stories, test plans, and related data within this
              project will be permanently deleted.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={deleteProject.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteProject.isPending}
            >
              {deleteProject.isPending ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
