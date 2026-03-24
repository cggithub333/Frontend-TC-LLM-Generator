"use client";

import { useEffect } from "react";
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
  ArrowRight,
  Check,
} from "lucide-react";
import { useRefineUserStory } from "@/hooks/use-ai-generation";

interface RefineStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userStoryId: string;
  originalStory: {
    title: string;
    asA: string;
    iWantTo: string;
    soThat: string;
    description: string;
  };
  onApply: (refined: {
    title: string;
    asA: string;
    iWantTo: string;
    soThat: string;
    description: string;
  }) => void;
}

const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  asA: "As a",
  iWantTo: "I want to",
  soThat: "So that",
  description: "Description",
};

export function RefineStoryDialog({
  open,
  onOpenChange,
  userStoryId,
  originalStory,
  onApply,
}: RefineStoryDialogProps) {
  const refineMutation = useRefineUserStory();

  // Trigger refine when dialog opens
  useEffect(() => {
    if (open && userStoryId && !refineMutation.isPending && !refineMutation.isSuccess && !refineMutation.isError) {
      refineMutation.mutate(userStoryId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userStoryId]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      refineMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleRetry = () => {
    refineMutation.reset();
    refineMutation.mutate(userStoryId);
  };

  const handleApply = () => {
    if (refineMutation.data) {
      onApply(refineMutation.data);
      onOpenChange(false);
    }
  };

  const refined = refineMutation.data;
  const fields = ["title", "asA", "iWantTo", "soThat", "description"] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                AI Story Refinement
              </DialogTitle>
              <DialogDescription>
                AI-suggested improvements for your user story
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* ── Loading ── */}
          {refineMutation.isPending && (
            <div className="text-center space-y-4 py-8">
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-muted" />
                <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-violet-500 animate-pulse" />
                </div>
              </div>
              <p className="text-lg font-semibold">Refining your story...</p>
              <p className="text-sm text-muted-foreground">
                AI is rewriting your user story for clarity and professionalism
              </p>
            </div>
          )}

          {/* ── Error ── */}
          {refineMutation.isError && (
            <div className="text-center space-y-4 py-8">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <p className="text-lg font-semibold text-destructive">
                Refinement Failed
              </p>
              <p className="text-sm text-muted-foreground">
                {refineMutation.error?.message}
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRetry} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* ── Success: Side-by-side comparison ── */}
          {refineMutation.isSuccess && refined && (
            <>
              <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-center mb-2">
                <div className="text-center">
                  <Badge variant="outline" className="text-xs">
                    Original
                  </Badge>
                </div>
                <div />
                <div className="text-center">
                  <Badge className="bg-violet-600 text-white text-xs">
                    AI Suggested
                  </Badge>
                </div>
              </div>

              {fields.map((field) => {
                const original =
                  originalStory[field] || "(empty)";
                const aiValue =
                  refined[field] || "(empty)";
                const isChanged = original !== aiValue;

                return (
                  <div
                    key={field}
                    className="grid grid-cols-[1fr,auto,1fr] gap-3 items-start"
                  >
                    {/* Original */}
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        {FIELD_LABELS[field]}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{original}</p>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center justify-center pt-6">
                      {isChanged ? (
                        <ArrowRight className="h-4 w-4 text-violet-500" />
                      ) : (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </div>

                    {/* AI Suggested */}
                    <div
                      className={`rounded-lg p-3 ${isChanged ? "bg-violet-500/10 border border-violet-500/20" : "bg-muted/50"}`}
                    >
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        {FIELD_LABELS[field]}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{aiValue}</p>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {refineMutation.isSuccess && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Discard
            </Button>
            <Button
              onClick={handleApply}
              className="gap-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700"
            >
              <Check className="h-4 w-4" />
              Apply All Changes
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
