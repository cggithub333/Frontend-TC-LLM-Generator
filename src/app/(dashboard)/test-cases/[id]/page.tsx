"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ClipboardList,
  Loader2,
  AlertCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { useTestCase } from "@/hooks/use-test-cases";

export default function TestCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const testCaseId = params.id as string;

  const { data: testCase, isLoading, error } = useTestCase(testCaseId);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading test case...</p>
        </div>
      </div>
    );
  }

  if (error || !testCase) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold">Test Case Not Found</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            The test case you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Badge variant="outline" className="font-mono text-xs">
              <ClipboardList className="h-3 w-3 mr-1" />
              Test Case
            </Badge>
            {testCase.generatedByAi && (
              <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-none">
                AI Generated
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {testCase.title}
          </h1>
          {testCase.userStoryId && (
            <p className="text-sm text-muted-foreground">
              Linked to User Story:{" "}
              <span className="text-primary font-semibold">
                {testCase.userStoryId}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Preconditions */}
        {testCase.preconditions && (
          <div className="p-6 border-b border-border">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Preconditions
            </h2>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {testCase.preconditions}
              </p>
            </div>
          </div>
        )}

        {/* Test Steps */}
        {testCase.steps && (
          <div className="p-6 border-b border-border">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Test Steps
            </h2>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {testCase.steps}
              </p>
            </div>
          </div>
        )}

        {/* Expected Result */}
        {testCase.expectedResult && (
          <div className="p-6 border-b border-border">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Expected Result
            </h2>
            <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 border border-green-200 dark:border-green-900/30">
              <p className="text-sm leading-relaxed text-green-700 dark:text-green-300 whitespace-pre-wrap">
                {testCase.expectedResult}
              </p>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Test Case ID:</span>
              <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono">
                {testCase.testCaseId}
              </code>
            </div>
            {testCase.acceptanceCriteriaId && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Linked AC:</span>
                <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono">
                  {testCase.acceptanceCriteriaId}
                </code>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Source:</span>
              <Badge variant="outline" className="text-xs">
                {testCase.generatedByAi ? "AI Generated" : "Manual"}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
