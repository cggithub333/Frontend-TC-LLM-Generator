"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjectsByWorkspace } from "@/hooks/use-projects";
import { useAddProjectMember } from "@/hooks/use-project-members";
import type { WorkspaceMember } from "@/types/workspace.types";
import { toast } from "sonner";
import { Search, Loader2, FolderOpen } from "lucide-react";

interface AssignProjectAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  member: WorkspaceMember;
  onSuccess?: () => void;
}

export function AssignProjectAccessDialog({
  open,
  onOpenChange,
  workspaceId,
  member,
  onSuccess,
}: AssignProjectAccessDialogProps) {
  const [search, setSearch] = useState("");
  const [assignments, setAssignments] = useState<Map<string, { assigned: boolean; role: string }>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  const { data: projectsData, isLoading: projectsLoading } = useProjectsByWorkspace(workspaceId, {
    size: 100,
  });

  const addMember = useAddProjectMember();

  const filteredProjects = useMemo(() => {
    const items = projectsData?.items ?? [];
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((p) => p.name.toLowerCase().includes(q));
  }, [projectsData?.items, search]);

  const getAssignment = useCallback(
    (projectId: string): { assigned: boolean; role: string } => {
      return assignments.get(projectId) ?? { assigned: false, role: "Developer" };
    },
    [assignments],
  );

  const toggleProject = useCallback((projectId: string) => {
    setAssignments((prev) => {
      const next = new Map(prev);
      const current = next.get(projectId) ?? { assigned: false, role: "Developer" };
      next.set(projectId, { ...current, assigned: !current.assigned });
      return next;
    });
  }, []);

  const setRole = useCallback((projectId: string, role: string) => {
    setAssignments((prev) => {
      const next = new Map(prev);
      const current = next.get(projectId) ?? { assigned: true, role: "Developer" };
      next.set(projectId, { ...current, role, assigned: true });
      return next;
    });
  }, []);

  const selectedCount = useMemo(() => {
    let count = 0;
    assignments.forEach((v) => {
      if (v.assigned) count++;
    });
    return count;
  }, [assignments]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const toAdd: { projectId: string; role: string }[] = [];

      assignments.forEach((value, projectId) => {
        if (value.assigned) {
          toAdd.push({ projectId, role: value.role });
        }
      });

      await Promise.all(
        toAdd.map(({ projectId, role }) =>
          addMember.mutateAsync({
            projectId,
            userId: member.userId,
            role,
          }),
        ),
      );

      toast.success(
        `Assigned ${member.userFullName} to ${toAdd.length} project${toAdd.length !== 1 ? "s" : ""}`,
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to assign projects. Please try again.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Project Access</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Select projects for{" "}
            <span className="font-medium text-foreground">{member.userFullName}</span>
          </p>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Project list */}
        <div className="max-h-[280px] overflow-y-auto space-y-1 -mx-1 px-1">
          {projectsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {search ? "No projects match your search" : "No projects in this workspace"}
            </p>
          ) : (
            filteredProjects.map((project) => {
              const { assigned, role } = getAssignment(project.projectId);
              return (
                <div
                  key={project.projectId}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={assigned}
                    onCheckedChange={() => toggleProject(project.projectId)}
                    disabled={isSaving}
                  />
                  <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm font-medium truncate flex-1">
                    {project.name}
                  </span>
                  {assigned && (
                    <Select
                      value={role}
                      onValueChange={(v) => setRole(project.projectId, v)}
                      disabled={isSaving}
                    >
                      <SelectTrigger className="w-[110px] h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="Lead">Lead</SelectItem>
                        <SelectItem value="Developer">Developer</SelectItem>
                        <SelectItem value="Tester">Tester</SelectItem>
                        <SelectItem value="Viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={selectedCount === 0 || isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Assign {selectedCount > 0 ? `${selectedCount} Project${selectedCount !== 1 ? "s" : ""}` : "Projects"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
