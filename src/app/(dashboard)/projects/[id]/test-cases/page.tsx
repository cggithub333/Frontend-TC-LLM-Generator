"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  ClipboardList,
  ChevronRight,
  Trash2,
  Pencil,
  Eye,
  Sparkles,
  PenLine,
  FileText,
  MoreHorizontal,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTestCasesByProject, useDeleteTestCase } from "@/hooks/use-test-cases";
import { toast } from "sonner";
import type { TestCase } from "@/types/test-case.types";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

interface GroupedTestCases {
  storyId: string;
  storyTitle: string;
  testCases: TestCase[];
}

/* ================================================================== */
/*  Main Page — Read-only list (create happens in Stories)             */
/* ================================================================== */

export default function ProjectTestCasesPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  // State
  const [search, setSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedTcId, setExpandedTcId] = useState<string | null>(null);
  const [deletingTcId, setDeletingTcId] = useState<string | null>(null);

  // Data
  const { data: testCases, isLoading, refetch } = useTestCasesByProject(projectId);
  const deleteMutation = useDeleteTestCase();

  // Filter by search
  const filtered = useMemo(() => {
    const items = testCases ?? [];
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (tc) =>
        tc.title.toLowerCase().includes(q) ||
        tc.userStoryTitle?.toLowerCase().includes(q) ||
        tc.preconditions?.toLowerCase().includes(q) ||
        tc.steps?.toLowerCase().includes(q)
    );
  }, [testCases, search]);

  // Group by User Story
  const grouped: GroupedTestCases[] = useMemo(() => {
    const map = new Map<string, GroupedTestCases>();
    for (const tc of filtered) {
      const key = tc.userStoryId ?? "ungrouped";
      if (!map.has(key)) {
        map.set(key, {
          storyId: key,
          storyTitle: tc.userStoryTitle ?? "Ungrouped",
          testCases: [],
        });
      }
      map.get(key)!.testCases.push(tc);
    }
    return Array.from(map.values());
  }, [filtered]);

  // Auto-expand all groups on first load
  const allGroupIds = useMemo(() => new Set(grouped.map((g) => g.storyId)), [grouped]);
  if (expandedGroups.size === 0 && allGroupIds.size > 0 && !isLoading) {
    setExpandedGroups(new Set(allGroupIds));
  }

  const toggleExpand = (storyId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(storyId)) next.delete(storyId);
      else next.add(storyId);
      return next;
    });
  };

  const handleDelete = async () => {
    if (!deletingTcId) return;
    try {
      await deleteMutation.mutateAsync(deletingTcId);
      toast.success("Test case deleted");
      refetch();
    } catch {
      toast.error("Failed to delete test case");
    } finally {
      setDeletingTcId(null);
    }
  };

  const totalCount = testCases?.length ?? 0;
  const aiCount = testCases?.filter((tc) => tc.generatedByAi).length ?? 0;
  const manualCount = totalCount - aiCount;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Test Cases
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalCount} test case{totalCount !== 1 ? "s" : ""} •{" "}
            <span className="text-purple-500">{aiCount} AI</span> •{" "}
            <span className="text-blue-500">{manualCount} Manual</span>
          </p>
        </div>
        {/* Info badge: creation happens in Stories */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg border border-border">
          <BookOpen className="h-4 w-4 text-primary shrink-0" />
          <span>
            To create test cases, go to{" "}
            <button
              onClick={() => router.push(`/projects/${projectId}/stories`)}
              className="text-primary font-medium hover:underline"
            >
              Stories
            </button>
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search test cases..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Loading test cases...</p>
          </div>
        </div>
      ) : grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <div className="relative mb-6">
            <div className="p-4 rounded-2xl bg-primary/10">
              <ClipboardList className="h-12 w-12 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full" />
          </div>
          <p className="text-lg font-bold">
            {search ? "No matching test cases" : "No test cases yet"}
          </p>
          <p className="text-sm mt-1 mb-6 max-w-sm text-center">
            {search
              ? "Try a different search term"
              : "Create test cases from your user stories in the Stories page"}
          </p>
          {!search && (
            <Button
              variant="outline"
              onClick={() => router.push(`/projects/${projectId}/stories`)}
              className="gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Go to Stories
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {grouped.map((group) => {
            const isExpanded = expandedGroups.has(group.storyId);
            return (
              <div
                key={group.storyId}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                {/* Group Header */}
                <button
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors text-left"
                  onClick={() => toggleExpand(group.storyId)}
                >
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform duration-200 text-muted-foreground shrink-0",
                      isExpanded && "rotate-90"
                    )}
                  />
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm font-semibold truncate flex-1">
                    {group.storyTitle}
                  </span>
                  <Badge variant="secondary" className="text-[10px] shrink-0 tabular-nums">
                    {group.testCases.length} TC{group.testCases.length !== 1 ? "s" : ""}
                  </Badge>
                </button>

                {/* Group Items */}
                {isExpanded && (
                  <div className="border-t border-border divide-y divide-border">
                    {group.testCases.map((tc) => {
                      const isDetailExpanded = expandedTcId === tc.testCaseId;
                      return (
                        <div key={tc.testCaseId} className="group">
                          {/* Row */}
                          <div
                            className={cn(
                              "flex items-center gap-4 px-5 py-3 cursor-pointer transition-colors",
                              isDetailExpanded
                                ? "bg-primary/5"
                                : "hover:bg-muted/30"
                            )}
                            onClick={() =>
                              setExpandedTcId(
                                isDetailExpanded ? null : tc.testCaseId
                              )
                            }
                          >
                            <ChevronRight
                              className={cn(
                                "h-3.5 w-3.5 transition-transform duration-200 text-muted-foreground shrink-0",
                                isDetailExpanded && "rotate-90"
                              )}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">
                                {tc.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {tc.generatedByAi ? (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                                >
                                  <Sparkles className="h-3 w-3 mr-0.5" />
                                  AI
                                </Badge>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  <PenLine className="h-3 w-3 mr-0.5" />
                                  Manual
                                </Badge>
                              )}
                              {tc.testCaseTypeName && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {tc.testCaseTypeName}
                                </Badge>
                              )}
                              {/* Actions Menu */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem
                                    className="gap-2 text-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedTcId(
                                        expandedTcId === tc.testCaseId ? null : tc.testCaseId
                                      );
                                    }}
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    {expandedTcId === tc.testCaseId ? "Collapse" : "View Detail"}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="gap-2 text-sm text-destructive focus:text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeletingTcId(tc.testCaseId);
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {/* Expanded Detail */}
                          {isDetailExpanded && (
                            <div className="px-5 pb-4 pt-1 bg-primary/5 space-y-3">
                              {tc.preconditions && (
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                    Preconditions
                                  </p>
                                  <div className="bg-muted/50 rounded-lg p-3">
                                    <p className="text-sm whitespace-pre-wrap">
                                      {tc.preconditions}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {tc.steps && (
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                    Steps
                                  </p>
                                  <div className="bg-muted/50 rounded-lg p-3">
                                    <p className="text-sm whitespace-pre-wrap">
                                      {tc.steps}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {tc.expectedResult && (
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                    Expected Result
                                  </p>
                                  <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-3 border border-green-200 dark:border-green-900/30">
                                    <p className="text-sm text-green-700 dark:text-green-300 whitespace-pre-wrap">
                                      {tc.expectedResult}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {/* Custom Fields from Template */}
                              {(() => {
                                try {
                                  const cf = tc.customFieldsJson ? JSON.parse(tc.customFieldsJson) : null;
                                  if (!cf?.fields || Object.keys(cf.fields).length === 0) return null;
                                  return (
                                    <div className="border-t pt-3 space-y-2">
                                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        Custom Fields
                                        {cf.templateName && (
                                          <span className="normal-case font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[10px]">
                                            {cf.templateName}
                                          </span>
                                        )}
                                      </p>
                                      <div className="grid gap-2">
                                        {Object.entries(cf.fields as Record<string, string>).map(([key, value]) => (
                                          <div key={key} className="bg-muted/50 rounded-lg p-2.5 flex items-start gap-2">
                                            <span className="text-xs font-medium text-muted-foreground min-w-[100px] shrink-0 pt-0.5">{key}:</span>
                                            <span className="text-sm whitespace-pre-wrap break-words">{value || "—"}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                } catch { return null; }
                              })()}
                              {/* Metadata */}
                              <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                                <span>ID: <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px]">{tc.testCaseId.slice(0, 8)}…</code></span>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {tc.generatedByAi ? "AI Generated" : "Manual"}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingTcId}
        onOpenChange={(open) => !open && setDeletingTcId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Test Case</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The test case will be permanently
              removed from all suites and test plans.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
