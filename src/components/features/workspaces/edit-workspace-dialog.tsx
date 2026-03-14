/**
 * EditWorkspaceDialog Component
 * Modal dialog for editing an existing workspace
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
import { useUpdateWorkspace } from "@/hooks/use-workspaces";
import { cn } from "@/lib/utils";
import type { Workspace } from "@/types/workspace.types";
import { toast } from "sonner";

interface EditWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace | null;
  onSuccess?: () => void;
}

export function EditWorkspaceDialog({
  open,
  onOpenChange,
  workspace,
  onSuccess,
}: EditWorkspaceDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const updateWorkspace = useUpdateWorkspace();

  useEffect(() => {
    if (workspace && open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(workspace.name);
      setDescription(workspace.description || "");
      setErrors({});
      setTouched({});
    }
  }, [workspace, open]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setTouched({ name: true });

      if (!name.trim()) {
        setErrors({ name: "Workspace name is required" });
        return;
      }

      if (name.trim().length > 255) {
        setErrors({ name: "Name must not exceed 255 characters" });
        return;
      }

      if (!workspace) return;

      try {
        await updateWorkspace.mutateAsync({
          id: workspace.workspaceId,
          name: name.trim(),
          description: description.trim() || undefined,
        });

        onOpenChange(false);
        onSuccess?.();
        toast.success("Workspace updated successfully");
      } catch (error) {
        toast.error("Failed to update workspace");
      }
    },
    [name, description, workspace, updateWorkspace, onOpenChange, onSuccess],
  );

  const handleClose = useCallback(() => {
    if (!updateWorkspace.isPending) {
      onOpenChange(false);
    }
  }, [onOpenChange, updateWorkspace.isPending]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[480px] p-0 gap-0">
        <DialogHeader className="px-6 py-5 border-b space-y-1">
          <DialogTitle className="text-lg font-bold">
            Edit Workspace
          </DialogTitle>
          <DialogDescription className="text-xs">
            Update your workspace details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Workspace Name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="edit-workspace-name"
              className="text-sm font-semibold"
            >
              Workspace Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-workspace-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors({});
              }}
              onBlur={() => setTouched({ ...touched, name: true })}
              placeholder="e.g. Mobile App Testing"
              className={cn(
                "transition-all",
                touched.name && errors.name && "border-destructive",
              )}
              disabled={updateWorkspace.isPending}
              autoFocus
            />
            {touched.name && errors.name && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label
              htmlFor="edit-workspace-description"
              className="text-sm font-semibold"
            >
              Description
            </Label>
            <Textarea
              id="edit-workspace-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief description of this workspace..."
              className="resize-none"
              disabled={updateWorkspace.isPending}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={updateWorkspace.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateWorkspace.isPending}>
              {updateWorkspace.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
