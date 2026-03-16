"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProject, useUpdateProject, useDeleteProject } from "@/hooks/use-projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertTriangle, Trash2, Archive, Save, Lock } from "lucide-react";
import { toast } from "sonner";

// ──────── Delete Confirmation Modal ────────
function DeleteConfirmModal({
  open,
  projectName,
  onConfirm,
  onCancel,
  isPending,
}: {
  open: boolean;
  projectName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (open) setTyped("");
  }, [open]);

  if (!open) return null;

  const canDelete = typed === projectName;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-card border border-destructive/30 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in-0 zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Delete Project</h3>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-4 mb-5">
            <p className="text-sm text-foreground">
              This will permanently delete the project{" "}
              <strong className="text-destructive">{projectName}</strong>, along
              with all its stories, test cases, test suites, and test plans.
            </p>
          </div>

          <label className="block text-sm font-medium mb-2">
            Type <strong className="text-destructive">{projectName}</strong> to
            confirm:
          </label>
          <Input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={projectName}
            className="mb-5 transition-colors duration-150"
            autoFocus
          />

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onCancel} disabled={isPending} className="transition-all duration-150">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={!canDelete || isPending}
              className="gap-2 transition-all duration-150"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Confirm Delete
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ──────── Main Page ────────
export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { data: project, isLoading } = useProject(projectId);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveFlash, setShowSaveFlash] = useState(false);

  // Populate form when project loads
  useEffect(() => {
    if (project) {
      setName(project.name ?? "");
      setDescription(project.description ?? "");
    }
  }, [project]);

  // Track changes
  useEffect(() => {
    if (project) {
      setHasChanges(
        name !== (project.name ?? "") ||
        description !== (project.description ?? "")
      );
    }
  }, [name, description, project]);

  const handleSave = async () => {
    try {
      await updateProject.mutateAsync({
        id: projectId,
        name: name.trim(),
        description: description.trim(),
      });
      toast.success("Project updated successfully");
      setHasChanges(false);
      // Green flash confirmation
      setShowSaveFlash(true);
      setTimeout(() => setShowSaveFlash(false), 1500);
    } catch {
      toast.error("Failed to update project");
    }
  };

  const handleArchive = async () => {
    try {
      await updateProject.mutateAsync({
        id: projectId,
        status: "ARCHIVED",
      });
      toast.success("Project archived");
      router.push("/workspaces");
    } catch {
      toast.error("Failed to archive project");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject.mutateAsync(projectId);
      toast.success("Project deleted");
      setDeleteModalOpen(false);
      router.push("/workspaces");
    } catch {
      toast.error("Failed to delete project");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-3xl mx-auto space-y-8">
        {/* Skeleton Header */}
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
        {/* Skeleton Card 1 */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-6 border-b space-y-2">
            <div className="h-6 w-40 bg-muted rounded animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded animate-pulse" />
          </div>
          <div className="p-6 space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                <div className="h-10 w-full bg-muted rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        {/* Skeleton Card 2 */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-6 border-b space-y-2">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-56 bg-muted rounded animate-pulse" />
          </div>
          <div className="p-6 space-y-4">
            <div className="h-16 w-full bg-muted rounded animate-pulse" />
            <div className="h-16 w-full bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      {/* Page Title */}
      <h1 className="text-2xl font-bold">Project Settings</h1>

      {/* ─── Card 1: General Details ─── */}
      <div className={`bg-card border rounded-xl shadow-sm transition-all duration-300 ${showSaveFlash ? "border-emerald-500 shadow-emerald-500/10" : "border-border"}`}>
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold">General Details</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Basic information about your project
          </p>
        </div>
        <div className="p-6 space-y-5">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Project Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              className="transition-colors duration-150 hover:border-primary/40 focus:border-primary"
            />
          </div>

          {/* Project Key */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Project Key
            </label>
            <div className="relative">
              <Input
                value={project.projectKey ?? ""}
                disabled
                className="pr-10 bg-muted/50 text-muted-foreground"
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Project Key cannot be changed as it would affect all existing Story
              IDs.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project..."
              rows={4}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-colors duration-150 hover:border-primary/40"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="px-6 pb-6 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateProject.isPending}
            className="gap-2 transition-all duration-150"
          >
            {updateProject.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* ─── Card 2: Danger Zone ─── */}
      <div className="bg-card border-2 border-destructive/30 rounded-xl shadow-sm">
        <div className="p-6 border-b border-destructive/20">
          <h2 className="text-lg font-bold text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Irreversible and destructive actions
          </p>
        </div>
        <div className="p-6 space-y-6">
          {/* Archive */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold">Archive Project</h3>
              <p className="text-sm text-muted-foreground">
                Set to read-only mode. Data will be preserved.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleArchive}
              disabled={updateProject.isPending}
              className="gap-2 border-amber-500/50 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 shrink-0 transition-all duration-150 hover:scale-[1.02]"
            >
              {updateProject.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
              Archive Project
            </Button>
          </div>

          <div className="border-t border-destructive/20" />

          {/* Delete */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold">Delete Project</h3>
              <p className="text-sm text-muted-foreground">
                Permanently remove this project and all of its data.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setDeleteModalOpen(true)}
              className="gap-2 shrink-0 transition-all duration-150"
            >
              <Trash2 className="h-4 w-4" />
              Delete Project
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        projectName={project.name}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
        isPending={deleteProject.isPending}
      />
    </div>
  );
}
