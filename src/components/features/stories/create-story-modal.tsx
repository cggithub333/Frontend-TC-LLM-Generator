"use client";

import { useState } from "react";
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
import { Sparkles, X, Plus } from "lucide-react";

interface CreateStoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateStory?: (story: StoryFormData) => void;
}

interface AcceptanceCriterion {
  id: string;
  description: string;
}

interface StoryFormData {
  asA: string;
  iWantTo: string;
  soThat: string;
  acceptanceCriteria: AcceptanceCriterion[];
}

export function CreateStoryModal({
  open,
  onOpenChange,
  onCreateStory,
}: CreateStoryModalProps) {
  const [formData, setFormData] = useState<StoryFormData>({
    asA: "",
    iWantTo: "",
    soThat: "",
    acceptanceCriteria: [{ id: "1", description: "" }],
  });

  const addCriterion = () => {
    setFormData({
      ...formData,
      acceptanceCriteria: [
        ...formData.acceptanceCriteria,
        { id: Date.now().toString(), description: "" },
      ],
    });
  };

  const updateCriterion = (id: string, description: string) => {
    setFormData({
      ...formData,
      acceptanceCriteria: formData.acceptanceCriteria.map((c) =>
        c.id === id ? { ...c, description } : c
      ),
    });
  };

  const removeCriterion = (id: string) => {
    if (formData.acceptanceCriteria.length > 1) {
      setFormData({
        ...formData,
        acceptanceCriteria: formData.acceptanceCriteria.filter((c) => c.id !== id),
      });
    }
  };

  const handleSubmit = () => {
    if (onCreateStory) {
      onCreateStory(formData);
    }
    // Reset form
    setFormData({
      asA: "",
      iWantTo: "",
      soThat: "",
      acceptanceCriteria: [{ id: "1", description: "" }],
    });
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const currentIndex = formData.acceptanceCriteria.findIndex((c) => c.id === id);
      if (currentIndex === formData.acceptanceCriteria.length - 1) {
        addCriterion();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New User Story</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-5">
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
                onChange={(e) => setFormData({ ...formData, asA: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, iWantTo: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, soThat: e.target.value })}
              />
            </div>
          </div>

          {/* Acceptance Criteria */}
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
                <div key={criterion.id} className="flex items-start gap-3 group">
                  <div className="mt-3 w-1.5 h-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                  <Input
                    className="flex-1 bg-transparent border-0 border-b border-transparent focus:border-border rounded-none px-0 focus-visible:ring-0"
                    placeholder={
                      index === 0
                        ? "Type criterion and press enter..."
                        : "Add another..."
                    }
                    value={criterion.description}
                    onChange={(e) => updateCriterion(criterion.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, criterion.id)}
                  />
                  {formData.acceptanceCriteria.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCriterion(criterion.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive"
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
          <Button onClick={handleSubmit} className="shadow-lg shadow-primary/25">
            Create Story
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
