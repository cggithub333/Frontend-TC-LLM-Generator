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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, BookOpen, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateTestPlan } from "@/hooks/use-test-plans";
import { useStoriesByProject } from "@/hooks/use-stories";
import type { CreateTestPlanInput, TestPlanStatus } from "@/types/test-plan.types";

interface CreateTestPlanDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const STATUS_OPTIONS: { value: TestPlanStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
];

const DEFAULT_FORM: Omit<CreateTestPlanInput, "projectId"> = {
  name: "",
  description: "",
  status: "DRAFT",
  storyIds: [],
};

export function CreateTestPlanDialog({
  projectId,
  open,
  onOpenChange,
  onSuccess,
}: CreateTestPlanDialogProps) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameTouched, setNameTouched] = useState(false);

  const createTestPlan = useCreateTestPlan();
  const { data: storiesData, isLoading: storiesLoading } = useStoriesByProject(
    projectId,
    { size: 100 }
  );
  const stories = storiesData?.items ?? [];

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setForm(DEFAULT_FORM);
      setNameError(null);
      setNameTouched(false);
    }
  }, [open]);

  const validateName = (value: string) => {
    if (!value.trim()) return "Name is required";
    if (value.length > 255) return "Name must not exceed 255 characters";
    return null;
  };

  const handleNameChange = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, name: value }));
    if (nameTouched) setNameError(validateName(value));
  }, [nameTouched]);

  const handleNameBlur = useCallback(() => {
    setNameTouched(true);
    setNameError(validateName(form.name));
  }, [form.name]);

  const toggleStory = useCallback((storyId: string) => {
    setForm((prev) => {
      const ids = prev.storyIds ?? [];
      return {
        ...prev,
        storyIds: ids.includes(storyId)
          ? ids.filter((id) => id !== storyId)
          : [...ids, storyId],
      };
    });
  }, []);

  const handleClose = useCallback(() => {
    if (!createTestPlan.isPending) onOpenChange(false);
  }, [onOpenChange, createTestPlan.isPending]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setNameTouched(true);
      const error = validateName(form.name);
      if (error) {
        setNameError(error);
        return;
      }

      try {
        await createTestPlan.mutateAsync({ projectId, ...form });
        onOpenChange(false);
        onSuccess?.();
      } catch (err) {
        console.error("Failed to create test plan:", err);
      }
    },
    [form, projectId, createTestPlan, onOpenChange, onSuccess]
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[560px] p-0 gap-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 py-5 border-b space-y-1 flex-shrink-0">
          <DialogTitle className="text-lg font-bold">Create Test Plan</DialogTitle>
          <DialogDescription className="text-xs">
            Define a test plan and select the stories to cover
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="plan-name" className="text-sm font-semibold">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="plan-name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={handleNameBlur}
                placeholder="e.g. Q4 Core Regression"
                className={cn(
                  nameTouched && nameError && "border-destructive"
                )}
                disabled={createTestPlan.isPending}
              />
              {nameTouched && nameError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {nameError}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="plan-description" className="text-sm font-semibold">
                Description
              </Label>
              <Textarea
                id="plan-description"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
                className="resize-none"
                placeholder="Describe what this test plan covers..."
                disabled={createTestPlan.isPending}
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    status: value as TestPlanStatus,
                  }))
                }
                disabled={createTestPlan.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* User Stories */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  User Stories
                </Label>
                {(form.storyIds?.length ?? 0) > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {form.storyIds?.length} selected
                  </Badge>
                )}
              </div>

              <div className="rounded-lg border bg-muted/30 max-h-48 overflow-y-auto">
                {storiesLoading ? (
                  <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading stories...
                  </div>
                ) : stories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-1 text-muted-foreground">
                    <BookOpen className="h-5 w-5" />
                    <p className="text-sm">No stories in this project</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {stories.map((story) => {
                      const checked =
                        form.storyIds?.includes(story.userStoryId) ?? false;
                      return (
                        <label
                          key={story.userStoryId}
                          className={cn(
                            "flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors",
                            checked && "bg-primary/5"
                          )}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleStory(story.userStoryId)}
                            disabled={createTestPlan.isPending}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">
                              {story.title}
                            </p>
                            {story.jiraIssueKey && (
                              <p className="text-xs text-muted-foreground">
                                {story.jiraIssueKey}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t gap-2 sm:gap-0 flex-shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={createTestPlan.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createTestPlan.isPending}>
              {createTestPlan.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Test Plan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
