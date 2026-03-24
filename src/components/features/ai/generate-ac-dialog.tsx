"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import { useGenerateACForStory } from "@/hooks/use-ai-generation";
import { useUpdateStory } from "@/hooks/use-stories";
import { toast } from "sonner";
import type { UserStory } from "@/types/story.types";
import { cn } from "@/lib/utils";

interface GenerateACDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stories: UserStory[];
}

type StoryACState = {
  storyId: string;
  status: "idle" | "loading" | "success" | "error";
  generatedAC: string[];
  error?: string;
};

export function GenerateACDialog({
  open,
  onOpenChange,
  stories,
}: GenerateACDialogProps) {
  const [storyStates, setStoryStates] = useState<Map<string, StoryACState>>(
    new Map()
  );
  const [expandedStory, setExpandedStory] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const generateAC = useGenerateACForStory();
  const updateStory = useUpdateStory();

  // Initialize states when dialog opens
  useEffect(() => {
    if (open && stories.length > 0) {
      const initial = new Map<string, StoryACState>();
      stories.forEach((s) => {
        initial.set(s.userStoryId, {
          storyId: s.userStoryId,
          status: "idle",
          generatedAC: [],
        });
      });
      setStoryStates(initial);
      setExpandedStory(stories.length === 1 ? stories[0].userStoryId : null);

      // Auto-start generation for all stories
      stories.forEach((s) => {
        generateForStory(s.userStoryId);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStoryStates(new Map());
      setExpandedStory(null);
      setIsApplying(false);
    }
  }, [open]);

  const generateForStory = useCallback(
    async (storyId: string) => {
      setStoryStates((prev) => {
        const next = new Map(prev);
        next.set(storyId, { storyId, status: "loading", generatedAC: [] });
        return next;
      });

      try {
        const criteria = await generateAC.mutateAsync(storyId);
        setStoryStates((prev) => {
          const next = new Map(prev);
          next.set(storyId, {
            storyId,
            status: "success",
            generatedAC: criteria,
          });
          return next;
        });
      } catch (err) {
        setStoryStates((prev) => {
          const next = new Map(prev);
          next.set(storyId, {
            storyId,
            status: "error",
            generatedAC: [],
            error:
              err instanceof Error ? err.message : "Failed to generate AC",
          });
          return next;
        });
      }
    },
    [generateAC]
  );

  const handleApplyAll = async () => {
    setIsApplying(true);
    let successCount = 0;

    for (const story of stories) {
      const state = storyStates.get(story.userStoryId);
      if (state?.status !== "success" || state.generatedAC.length === 0) continue;

      try {
        await updateStory.mutateAsync({
          id: story.userStoryId,
          acceptanceCriteria: state.generatedAC.map((content, index) => ({
            content,
            orderNo: index + 1,
          })),
        });
        successCount++;
      } catch {
        toast.error(`Failed to update AC for "${story.title}"`);
      }
    }

    setIsApplying(false);
    if (successCount > 0) {
      toast.success(
        `Updated acceptance criteria for ${successCount} ${successCount === 1 ? "story" : "stories"}`
      );
    }
    onOpenChange(false);
  };

  const handleApplySingle = async (story: UserStory) => {
    const state = storyStates.get(story.userStoryId);
    if (state?.status !== "success" || state.generatedAC.length === 0) return;

    setIsApplying(true);
    try {
      await updateStory.mutateAsync({
        id: story.userStoryId,
        acceptanceCriteria: state.generatedAC.map((content, index) => ({
          content,
          orderNo: index + 1,
        })),
      });
      toast.success(`Updated acceptance criteria for "${story.title}"`);

      // Remove from list if batch
      if (stories.length > 1) {
        setStoryStates((prev) => {
          const next = new Map(prev);
          const existing = next.get(story.userStoryId);
          if (existing) {
            next.set(story.userStoryId, { ...existing, status: "idle" }); // Mark as applied
          }
          return next;
        });
      } else {
        onOpenChange(false);
      }
    } catch {
      toast.error(`Failed to update AC for "${story.title}"`);
    } finally {
      setIsApplying(false);
    }
  };

  // Summary stats
  const allStates = Array.from(storyStates.values());
  const loadingCount = allStates.filter((s) => s.status === "loading").length;
  const successCount = allStates.filter((s) => s.status === "success").length;
  const errorCount = allStates.filter((s) => s.status === "error").length;
  const isAllDone = loadingCount === 0;
  const hasAnySuccess = successCount > 0;

  // Check if any story has existing test cases linked to AC
  const storiesWithTestCases = stories.filter(
    (s) =>
      s.acceptanceCriteria?.some(
        (ac) => ac.testCases && ac.testCases.length > 0
      )
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                AI Acceptance Criteria Generation
              </DialogTitle>
              <DialogDescription>
                {stories.length === 1
                  ? `Generating AC for: ${stories[0].title}`
                  : `Generating AC for ${stories.length} stories`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning for stories with test cases */}
          {storiesWithTestCases.length > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  Warning: Existing test cases may be affected
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {storiesWithTestCases.length} of your selected{" "}
                  {storiesWithTestCases.length === 1 ? "story has" : "stories have"}{" "}
                  test cases linked to existing AC. Replacing AC will unlink them.
                </p>
              </div>
            </div>
          )}

          {/* Progress Summary */}
          {stories.length > 1 && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
                  style={{
                    width: `${((successCount + errorCount) / stories.length) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {loadingCount > 0
                  ? `Generating... (${successCount}/${stories.length})`
                  : `${successCount}/${stories.length} ready`}
              </span>
            </div>
          )}

          {/* Story Cards */}
          <div className="space-y-3">
            {stories.map((story) => {
              const state = storyStates.get(story.userStoryId);
              const isExpanded = expandedStory === story.userStoryId;
              const existingACs = story.acceptanceCriteria || [];
              const hasExistingAC = existingACs.length > 0;

              return (
                <div
                  key={story.userStoryId}
                  className="border border-border rounded-xl overflow-hidden"
                >
                  {/* Story Header */}
                  <button
                    className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors text-left"
                    onClick={() =>
                      setExpandedStory(isExpanded ? null : story.userStoryId)
                    }
                  >
                    {/* Status Icon */}
                    <div className="shrink-0">
                      {state?.status === "loading" && (
                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      )}
                      {state?.status === "success" && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      {state?.status === "error" && (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      )}
                      {(state?.status === "idle" || !state) && (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{story.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {hasExistingAC && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-4 px-1.5"
                          >
                            {existingACs.length} existing AC
                          </Badge>
                        )}
                        {state?.status === "success" && (
                          <Badge className="text-[10px] h-4 px-1.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-0">
                            {state.generatedAC.length} generated
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Expand/Retry */}
                    <div className="shrink-0 flex items-center gap-1">
                      {state?.status === "error" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            generateForStory(story.userStoryId);
                          }}
                        >
                          <RotateCcw className="h-3 w-3" />
                          Retry
                        </Button>
                      )}
                      {state?.status === "success" && stories.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          disabled={isApplying}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplySingle(story);
                          }}
                        >
                          Apply
                        </Button>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-200 ease-in-out",
                      isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-4">
                        {/* Loading */}
                        {state?.status === "loading" && (
                          <div className="text-center py-6 space-y-3">
                            <div className="relative mx-auto w-16 h-16">
                              <div className="absolute inset-0 rounded-full border-4 border-muted" />
                              <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="h-6 w-6 text-emerald-500 animate-pulse" />
                              </div>
                            </div>
                            <p className="text-sm font-medium">
                              Generating acceptance criteria...
                            </p>
                            <p className="text-xs text-muted-foreground">
                              AI is analyzing the user story requirements
                            </p>
                          </div>
                        )}

                        {/* Error */}
                        {state?.status === "error" && (
                          <div className="text-center py-6 space-y-2">
                            <p className="text-sm text-destructive">
                              {state.error}
                            </p>
                          </div>
                        )}

                        {/* Success: Compare existing vs generated */}
                        {state?.status === "success" && (
                          <div className="space-y-4">
                            {/* Existing ACs */}
                            {hasExistingAC && (
                              <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                  Current Acceptance Criteria
                                </p>
                                <div className="space-y-1.5">
                                  {existingACs.map((ac, i) => (
                                    <div
                                      key={ac.acceptanceCriteriaId}
                                      className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-2.5 line-through opacity-60"
                                    >
                                      {i + 1}. {ac.content}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Generated ACs */}
                            <div>
                              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                                AI Generated Acceptance Criteria
                              </p>
                              <div className="space-y-1.5">
                                {state.generatedAC.map((ac, i) => (
                                  <div
                                    key={i}
                                    className="text-sm bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-2.5"
                                  >
                                    {i + 1}. {ac}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        {isAllDone && hasAnySuccess && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApplyAll}
              disabled={isApplying}
              className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              {isApplying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Apply All ({successCount}{" "}
                  {successCount === 1 ? "story" : "stories"})
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
