/**
 * CreateWorkspaceDialog Component
 * Modal dialog for creating a new workspace
 */

"use client";

import { useState, useCallback } from "react";
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
import { useCreateWorkspace } from "@/hooks/use-workspaces";
import { cn } from "@/lib/utils";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateWorkspaceDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const createWorkspace = useCreateWorkspace();

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

      try {
        await createWorkspace.mutateAsync({
          name: name.trim(),
          description: description.trim() || undefined,
        });

        onOpenChange(false);
        onSuccess?.();
        setName("");
        setDescription("");
        setErrors({});
        setTouched({});
      } catch (error) {
        console.error("Failed to create workspace:", error);
      }
    },
    [name, description, createWorkspace, onOpenChange, onSuccess]
  );

  const handleClose = useCallback(() => {
    if (!createWorkspace.isPending) {
      onOpenChange(false);
      setName("");
      setDescription("");
      setErrors({});
      setTouched({});
    }
  }, [onOpenChange, createWorkspace.isPending]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[480px] p-0 gap-0">
        <DialogHeader className="px-6 py-5 border-b space-y-1">
          <DialogTitle className="text-lg font-bold">
            Create New Workspace
          </DialogTitle>
          <DialogDescription className="text-xs">
            Workspaces help you organize projects and collaborate with teams.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Workspace Name */}
          <div className="space-y-1.5">
            <Label htmlFor="workspace-name" className="text-sm font-semibold">
              Workspace Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors({});
              }}
              onBlur={() => setTouched({ ...touched, name: true })}
              placeholder="e.g. Mobile App Testing"
              className={cn(
                "transition-all",
                touched.name && errors.name && "border-destructive"
              )}
              disabled={createWorkspace.isPending}
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
              htmlFor="workspace-description"
              className="text-sm font-semibold"
            >
              Description
            </Label>
            <Textarea
              id="workspace-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief description of this workspace..."
              className="resize-none"
              disabled={createWorkspace.isPending}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={createWorkspace.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createWorkspace.isPending}>
              {createWorkspace.isPending ? "Creating..." : "Create Workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
