/**
 * DeleteWorkspaceDialog Component
 * Confirmation dialog for deleting a workspace
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
import { useDeleteWorkspace } from "@/hooks/use-workspaces";
import type { Workspace } from "@/types/workspace.types";
import { toast } from "sonner";

interface DeleteWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace | null;
  onSuccess?: () => void;
}

export function DeleteWorkspaceDialog({
  open,
  onOpenChange,
  workspace,
  onSuccess,
}: DeleteWorkspaceDialogProps) {
  const deleteWorkspace = useDeleteWorkspace();

  const handleDelete = useCallback(async () => {
    if (!workspace) return;

    try {
      await deleteWorkspace.mutateAsync(workspace.workspaceId);
      onOpenChange(false);
      onSuccess?.();
      toast.success("Workspace deleted");
    } catch (error) {
      const msg = error instanceof Error
        ? error.message
        : "Failed to delete workspace. Please try again.";
      toast.error(msg);
    }
  }, [workspace, deleteWorkspace, onOpenChange, onSuccess]);

  const handleClose = useCallback(() => {
    if (!deleteWorkspace.isPending) {
      onOpenChange(false);
    }
  }, [onOpenChange, deleteWorkspace.isPending]);

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
                Delete Workspace
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
            <strong>&quot;{workspace?.name}&quot;</strong>?
          </p>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <p className="text-xs text-destructive font-medium">
              All projects, test cases, stories, and related data within this
              workspace will be permanently deleted.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={deleteWorkspace.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteWorkspace.isPending}
            >
              {deleteWorkspace.isPending ? "Deleting..." : "Delete Workspace"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
