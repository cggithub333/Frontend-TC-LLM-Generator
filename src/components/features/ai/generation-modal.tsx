"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";

interface GenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storyTitle?: string;
  acceptanceCriteriaCount?: number;
}

export function GenerationModal({
  open,
  onOpenChange,
  storyTitle = "User Authentication with OAuth2",
  acceptanceCriteriaCount = 3
}: GenerationModalProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("Analyzing requirements...");
  const [generatedCounts, setGeneratedCounts] = useState({
    positive: 0,
    negative: 0,
    boundary: 0
  });

  useEffect(() => {
    if (open) {
      // Reset
      setProgress(0);
      setCurrentStep("Analyzing requirements...");
      setGeneratedCounts({ positive: 0, negative: 0, boundary: 0 });

      // Simulate AI generation
      const steps = [
        { delay: 500, progress: 20, step: "Analyzing requirements...", counts: { positive: 0, negative: 0, boundary: 0 } },
        { delay: 1500, progress: 40, step: "Generating positive test cases...", counts: { positive: 8, negative: 0, boundary: 0 } },
        { delay: 2500, progress: 65, step: "Generating negative test cases...", counts: { positive: 8, negative: 5, boundary: 0 } },
        { delay: 3500, progress: 85, step: "Generating boundary test cases...", counts: { positive: 8, negative: 5, boundary: 3 } },
        { delay: 4500, progress: 100, step: "Finalizing test cases...", counts: { positive: 8, negative: 5, boundary: 3 } }
      ];

      steps.forEach(({ delay, progress, step, counts }) => {
        setTimeout(() => {
          setProgress(progress);
          setCurrentStep(step);
          setGeneratedCounts(counts);
        }, delay);
      });
    }
  }, [open]);

  const totalGenerated = generatedCounts.positive + generatedCounts.negative + generatedCounts.boundary;
  const isComplete = progress === 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl">AI Test Case Generation</DialogTitle>
              <DialogDescription>
                Generating test cases for: <span className="font-semibold text-foreground">{storyTitle}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-muted-foreground">{currentStep}</span>
              <span className="font-bold text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Generation Stats */}
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
                <p className="text-2xl font-black">{generatedCounts.positive}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Positive
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center text-orange-600 dark:text-orange-400 mx-auto mb-2">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="text-2xl font-black">{generatedCounts.negative}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Negative
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-2">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="text-2xl font-black">{generatedCounts.boundary}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Boundary
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isComplete ? (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                View Test Cases
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>AI is analyzing and generating test cases...</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
