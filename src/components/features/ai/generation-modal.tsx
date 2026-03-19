"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { useGenerateTestCases } from "@/hooks/use-ai-generation";

interface GenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storyTitle?: string;
  userStoryId?: string;
  acceptanceCriteriaCount?: number;
}

export function GenerationModal({
  open,
  onOpenChange,
  storyTitle = "",
  userStoryId,
}: GenerationModalProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const generateMutation = useGenerateTestCases();

  // Start generation when modal opens
  useEffect(() => {
    if (open && userStoryId && !generateMutation.isPending && !generateMutation.isSuccess && !generateMutation.isError) {
      generateMutation.mutate({
        userStoryId,
        options: {
          testCaseTypes: ["Positive", "Negative", "Boundary"],
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userStoryId]);

  // Timer for elapsed time
  useEffect(() => {
    if (!open || !generateMutation.isPending) {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [open, generateMutation.isPending]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      generateMutation.reset();
      setElapsedSeconds(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleRetry = () => {
    if (!userStoryId) return;
    generateMutation.reset();
    setElapsedSeconds(0);
    generateMutation.mutate({
      userStoryId,
      options: {
        testCaseTypes: ["Positive", "Negative", "Boundary"],
      },
    });
  };

  const result = generateMutation.data;

  // Count test cases by type from the results
  const typeCounts = {
    positive: 0,
    negative: 0,
    boundary: 0,
    other: 0,
  };
  if (result?.testCases) {
    result.testCases.forEach((tc) => {
      const titleLower = tc.title?.toLowerCase() || "";
      if (
        titleLower.includes("positive") ||
        titleLower.includes("valid") ||
        titleLower.includes("success")
      ) {
        typeCounts.positive++;
      } else if (
        titleLower.includes("negative") ||
        titleLower.includes("invalid") ||
        titleLower.includes("error")
      ) {
        typeCounts.negative++;
      } else if (
        titleLower.includes("boundary") ||
        titleLower.includes("edge") ||
        titleLower.includes("limit")
      ) {
        typeCounts.boundary++;
      } else {
        typeCounts.other++;
      }
    });
  }

  const totalGenerated = result?.generatedCount || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl">
                AI Test Case Generation
              </DialogTitle>
              <DialogDescription>
                {storyTitle ? (
                  <>
                    Generating test cases for:{" "}
                    <span className="font-semibold text-foreground">
                      {storyTitle}
                    </span>
                  </>
                ) : (
                  "Generating test cases using AI..."
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* ── Loading State ── */}
          {generateMutation.isPending && (
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-muted" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                </div>
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {elapsedSeconds < 10
                    ? "Generating test cases..."
                    : elapsedSeconds < 30
                      ? "AI model is analyzing requirements..."
                      : "AI model is warming up (cold start)..."}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Elapsed: {elapsedSeconds}s
                  {elapsedSeconds >= 30 && (
                    <span className="block mt-1 text-amber-500">
                      First request may take 30-60s for model warm-up
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* ── Error State ── */}
          {generateMutation.isError && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <p className="text-lg font-semibold text-destructive">
                  Generation Failed
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {generateMutation.error?.message || "An unexpected error occurred"}
                </p>
              </div>
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

          {/* ── Success State ── */}
          {generateMutation.isSuccess && result && (
            <>
              {/* Stats */}
              <div className="bg-muted/50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Generated Test Cases
                  </span>
                  <Badge className="bg-primary text-primary-foreground text-lg px-4 py-1">
                    {totalGenerated}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-2">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-black">
                      {typeCounts.positive + typeCounts.other}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Positive
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center text-orange-600 dark:text-orange-400 mx-auto mb-2">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-black">
                      {typeCounts.negative}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Negative
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-2">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-black">
                      {typeCounts.boundary}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Boundary
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => onOpenChange(false)}
                >
                  View Test Cases
                </Button>
              </div>
            </>
          )}

          {/* ── Idle / No Story ID ── */}
          {!generateMutation.isPending &&
            !generateMutation.isSuccess &&
            !generateMutation.isError && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-8">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Preparing AI generation...</span>
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
