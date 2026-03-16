"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, X, Plus, Loader2, FileText } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";

interface CreateStoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateStory?: (story: StoryFormData) => void;
  /** Pre-selected project ID (e.g. from project-scoped pages) */
  defaultProjectId?: string;
  /** If provided, the modal operates in edit mode with pre-filled data */
  editStory?: {
    title: string;
    asA?: string;
    iWantTo?: string;
    soThat?: string;
    acceptanceCriteria?: { content: string }[];
  };
  /** Whether a mutation is in progress */
  isPending?: boolean;
}

interface AcceptanceCriterion {
  id: string;
  description: string;
}

export interface StoryFormData {
  projectId: string;
  title: string;
  asA: string;
  iWantTo: string;
  soThat: string;
  acceptanceCriteria: AcceptanceCriterion[];
}

export function CreateStoryModal({
  open,
  onOpenChange,
  onCreateStory,
  defaultProjectId,
  editStory,
  isPending = false,
}: CreateStoryModalProps) {
  const { data: projectsData } = useProjects({ size: 100 });
  const projects = projectsData?.items ?? [];

  const isEditMode = !!editStory;

  const getInitialFormData = (): StoryFormData => ({
    projectId: defaultProjectId ?? "",
    title: editStory?.title ?? "",
    asA: editStory?.asA ?? "",
    iWantTo: editStory?.iWantTo ?? "",
    soThat: editStory?.soThat ?? "",
    acceptanceCriteria: editStory?.acceptanceCriteria?.length
      ? editStory.acceptanceCriteria.map((ac, i) => ({
          id: String(i + 1),
          description: ac.content,
        }))
      : [{ id: "1", description: "" }],
  });

  const [formData, setFormData] = useState<StoryFormData>(getInitialFormData());

  // Sync form data when editStory changes (opening edit modal)
  useEffect(() => {
    setFormData(getInitialFormData());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editStory, open]);

  const addCriterion = () => {
    setFormData({
      ...formData,
      acceptanceCriteria: [
        ...formData.acceptanceCriteria,
        { id: crypto.randomUUID(), description: "" },
      ],
    });
  };

  const updateCriterion = (id: string, description: string) => {
    setFormData({
      ...formData,
      acceptanceCriteria: formData.acceptanceCriteria.map((c) =>
        c.id === id ? { ...c, description } : c,
      ),
    });
  };

  const removeCriterion = (id: string) => {
    if (formData.acceptanceCriteria.length > 1) {
      setFormData({
        ...formData,
        acceptanceCriteria: formData.acceptanceCriteria.filter(
          (c) => c.id !== id,
        ),
      });
    }
  };

  const handleSubmit = () => {
    if (!formData.projectId || !formData.title.trim()) return;
    if (onCreateStory) {
      onCreateStory(formData);
    }
    // Reset form
    if (!isEditMode) {
      setFormData(getInitialFormData());
    }
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    // Tab on last AC item → add new AC
    if (e.key === "Tab" && !e.shiftKey) {
      const currentIndex = formData.acceptanceCriteria.findIndex(
        (c) => c.id === id,
      );
      if (currentIndex === formData.acceptanceCriteria.length - 1) {
        e.preventDefault();
        addCriterion();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditMode ? "Edit User Story" : "Create New User Story"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* ── SECTION 1: Story Details ── */}
          <div className="space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="size-6 rounded bg-primary/10 flex items-center justify-center">
              <FileText className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Story Details
            </span>
          </div>
          {/* Project Selector - only show in create mode without defaultProjectId */}
          {!isEditMode && !defaultProjectId && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Project <span className="text-destructive">*</span>
              </label>
              <Select
                value={formData.projectId}
                onValueChange={(value) =>
                  setFormData({ ...formData, projectId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem
                      key={project.projectId}
                      value={project.projectId}
                    >
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. View order history"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* User Role */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              User Role
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-muted-foreground font-bold text-sm">
                AS A...
              </span>
              <Textarea
                className="pl-20 pt-3 min-h-[68px] resize-none"
                placeholder="e.g. returning customer"
                value={formData.asA}
                onChange={(e) =>
                  setFormData({ ...formData, asA: e.target.value })
                }
              />
            </div>
          </div>

          {/* Action / Goal */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Action / Goal
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-muted-foreground font-bold text-sm">
                I WANT TO...
              </span>
              <Textarea
                className="pl-28 pt-3 min-h-[96px] resize-none"
                placeholder="e.g. view my previous order history"
                value={formData.iWantTo}
                onChange={(e) =>
                  setFormData({ ...formData, iWantTo: e.target.value })
                }
              />
            </div>
          </div>

          {/* Benefit / Value */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Benefit / Value
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-muted-foreground font-bold text-sm">
                SO THAT...
              </span>
              <Textarea
                className="pl-24 pt-3 min-h-[68px] resize-none"
                placeholder="e.g. I can reorder my favorite items easily"
                value={formData.soThat}
                onChange={(e) =>
                  setFormData({ ...formData, soThat: e.target.value })
                }
              />
            </div>
          </div>
          </div>

          {/* ── Visual Divider ── */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Acceptance Criteria
              </span>
            </div>
          </div>

          {/* ── SECTION 2: Acceptance Criteria ── */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold">Acceptance Criteria</label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addCriterion}
                className="gap-1 text-xs"
              >
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </div>
            <div className="space-y-3 bg-muted/30 rounded-xl p-4 border">
              {formData.acceptanceCriteria.map((criterion, index) => (
                <div
                  key={criterion.id}
                  className="flex items-start gap-3 group"
                >
                  <span className="mt-3 text-xs font-bold text-muted-foreground/50 tabular-nums w-4 text-right shrink-0">
                    {index + 1}
                  </span>
                  <Textarea
                    className="flex-1 bg-transparent border-0 border-b border-transparent focus:border-primary/30 rounded-none px-0 focus-visible:ring-0 min-h-[56px] resize-none transition-colors duration-150"
                    rows={2}
                    placeholder={
                      index === 0
                        ? "Type criterion... (Tab to add next)"
                        : "Add another... (Tab to add next)"
                    }
                    value={criterion.description}
                    onChange={(e) =>
                      updateCriterion(criterion.id, e.target.value)
                    }
                    onKeyDown={(e) => handleKeyDown(e, criterion.id)}
                  />
                  {formData.acceptanceCriteria.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCriterion(criterion.id)}
                      className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 hover:text-destructive rounded hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* AI Generate Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full mt-4 gap-2 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
            >
              <Sparkles className="h-4 w-4" />
              Re-generate with AI
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-2">
              AI will suggest criteria based on the story description above.
            </p>
          </div>
        </div>

        <DialogFooter className="border-t pt-4 bg-muted/30 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.projectId || !formData.title.trim() || isPending}
            className="shadow-lg shadow-primary/25"
          >
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isPending
              ? (isEditMode ? "Saving..." : "Creating...")
              : (isEditMode ? "Save Changes" : "Create Story")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
