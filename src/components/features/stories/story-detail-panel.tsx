"use client";

import { useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useStory } from "@/hooks/use-stories";
import { useUpdateAcceptanceCriteria } from "@/hooks/use-acceptance-criteria";
import { useTestCasesByAcceptanceCriteria, useTestCasesByUserStory } from "@/hooks/use-test-cases";
import { useBusinessRulesByStory } from "@/hooks/use-business-rules";
import { SuitePickerDialog } from "@/components/features/test-suites/suite-picker-dialog";
import {
  Sparkles,
  Pencil,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FolderPlus,
  BookOpen,
} from "lucide-react";
import type { UserStory, StoryStatus, AcceptanceCriteria } from "@/types/story.types";

/* ------------------------------------------------------------------ */
/*  Status badge styles — synced with project stories page             */
/* ------------------------------------------------------------------ */

const STATUS_STYLES: Record<StoryStatus, string> = {
  DRAFT:
    "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
  READY:
    "bg-primary/10 dark:bg-primary/20 text-primary border-primary/20 dark:border-primary/30",
  IN_PROGRESS:
    "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  DONE:
    "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  ARCHIVED:
    "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700",
};

/* ------------------------------------------------------------------ */
/*  AC Item with expandable Test Cases                                 */
/* ------------------------------------------------------------------ */

function AcItemPanel({
  ac,
  onToggle,
  isToggling,
}: {
  ac: AcceptanceCriteria;
  onToggle: (ac: AcceptanceCriteria) => void;
  isToggling: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const { data: tcData, isLoading: tcLoading } =
    useTestCasesByAcceptanceCriteria(ac.acceptanceCriteriaId);
  const testCases = tcData?.items ?? [];
  const tcCount = testCases.length;

  return (
    <div className="w-full">
      {/* AC row */}
      <div
        className={cn(
          "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors group",
          "hover:bg-muted/50",
          isToggling && "pointer-events-none opacity-60",
        )}
      >
        <Checkbox
          checked={ac.completed}
          onCheckedChange={() => onToggle(ac)}
          className="mt-0.5"
        />
        <button
          type="button"
          className="flex-1 text-left"
          onClick={() => tcCount > 0 && setExpanded((p) => !p)}
        >
          <span
            className={cn(
              "text-sm leading-relaxed block",
              ac.completed && "line-through text-zinc-400",
            )}
          >
            {ac.content}
          </span>
        </button>
        {(tcCount > 0 || tcLoading) && (
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            className="shrink-0 flex items-center gap-1"
          >
            <Badge variant="secondary" className="text-[10px] cursor-pointer hover:bg-secondary/80">
              {tcLoading ? "…" : tcCount} {tcCount === 1 ? "Test" : "Tests"}
              {expanded ? (
                <ChevronUp className="inline w-3 h-3 ml-0.5" />
              ) : (
                <ChevronDown className="inline w-3 h-3 ml-0.5" />
              )}
            </Badge>
          </button>
        )}
      </div>

      {/* Expandable Test Cases */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-in-out",
          expanded && tcCount > 0 ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="pl-10 pr-3 pb-2 space-y-2 border-l-2 border-border ml-4">
            {testCases.map((tc) => (
              <div
                key={tc.testCaseId}
                className="bg-card border border-border rounded-md p-3 text-sm shadow-sm transition-all duration-200 hover:border-primary/30"
              >
                <div className="font-semibold flex items-center gap-2 mb-1">
                  <ClipboardList className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="line-clamp-1">{tc.title}</span>
                  {tc.generatedByAi && (
                    <Badge
                      variant="outline"
                      className="text-[9px] h-4 px-1 py-0 bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700 shrink-0"
                    >
                      AI
                    </Badge>
                  )}
                </div>
                {(tc.steps || tc.expectedResult) && (
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {tc.steps && (
                      <div>
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                          Steps
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {tc.steps}
                        </p>
                      </div>
                    )}
                    {tc.expectedResult && (
                      <div>
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                          Expected
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {tc.expectedResult}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface StoryDetailPanelProps {
  storyId: string | null;
  onClose: () => void;
  onEdit?: (story: UserStory) => void;
  onDelete?: (story: UserStory) => void;
  onGenerateTests?: (story: UserStory) => void;
}

/* ------------------------------------------------------------------ */
/*  Date formatter                                                     */
/* ------------------------------------------------------------------ */

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function StoryDetailPanel({
  storyId,
  onClose,
  onEdit,
  onDelete,
  onGenerateTests,
}: StoryDetailPanelProps) {
  const isOpen = !!storyId;

  const {
    data: story,
    isLoading,
    error,
  } = useStory(storyId ?? "");

  const { mutate: updateAC, isPending: isTogglingAC } =
    useUpdateAcceptanceCriteria();

  /* ---------- Derived values ---------- */
  const acs = story?.acceptanceCriteria ?? [];

  const { completedCount, totalCount, progressPct } = useMemo(() => {
    const total = acs.length;
    const completed = acs.filter((ac) => ac.completed).length;
    return {
      completedCount: completed,
      totalCount: total,
      progressPct: total > 0 ? (completed / total) * 100 : 0,
    };
  }, [acs]);

  /* ---------- Handlers ---------- */
  const toggleAC = (ac: (typeof acs)[0]) => {
    updateAC({
      id: ac.acceptanceCriteriaId,
      content: ac.content,
      completed: !ac.completed,
    });
  };

  /* ---------- Suite picker state ---------- */
  const [suitePickerOpen, setSuitePickerOpen] = useState(false);

  // Fetch all TCs for this story to get IDs for the suite picker
  const { data: storyTCData } = useTestCasesByUserStory(
    story?.userStoryId ?? "",
    { size: 200 }
  );
  const storyTestCaseIds = useMemo(
    () => (storyTCData?.items ?? []).map((tc) => tc.testCaseId),
    [storyTCData]
  );

  /* ---------- Business rules ---------- */
  const { data: businessRules } = useBusinessRulesByStory(
    story?.projectId ?? "",
    story?.userStoryId ?? ""
  );
  const rules = businessRules ?? [];

  /* ---------- Render ---------- */
  return (
    <Sheet open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <SheetContent>
        {/* ── Loading state ── */}
        {isLoading && (
          <div className="p-6 space-y-6 animate-pulse">
            <div className="h-6 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="space-y-3 pt-4">
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-5/6 rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
            </div>
            <div className="space-y-2 pt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded-lg bg-muted" />
              ))}
            </div>
          </div>
        )}

        {/* ── Error state ── */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-6">
            <p className="text-sm text-destructive font-medium">
              Failed to load story
            </p>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        )}

        {/* ── Content ── */}
        {story && !isLoading && (
          <div className="animate-stagger">
            {/* ═══════ HEADER ═══════ */}
            <SheetHeader>
              <div className="flex items-start justify-between gap-4 pr-8">
                <SheetTitle className="text-xl font-semibold leading-tight line-clamp-2">
                  {story.title}
                </SheetTitle>
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 text-[10px] font-bold uppercase tracking-wider",
                    STATUS_STYLES[story.status],
                  )}
                >
                  {story.status.replace("_", " ")}
                </Badge>
              </div>
              <SheetDescription className="flex items-center gap-2 mt-1 text-sm text-zinc-400">
                <span>{story.projectName}</span>
                <span>·</span>
                <span>
                  {story.jiraIssueKey ??
                    `US-${story.userStoryId.slice(0, 6).toUpperCase()}`}
                </span>
                <span>·</span>
                <span>{formatDate(story.createdAt)}</span>
              </SheetDescription>
            </SheetHeader>

            {/* ═══════ USER STORY SECTION ═══════ */}
            <section className="px-6 py-5 border-b">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
                User Story
              </h3>
              <div className="space-y-4">
                {story.asA && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      As a
                    </span>
                    <p className="text-base text-foreground mt-0.5">
                      {story.asA}
                    </p>
                  </div>
                )}
                {story.iWantTo && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      I want to
                    </span>
                    <p className="text-base text-foreground mt-0.5">
                      {story.iWantTo}
                    </p>
                  </div>
                )}
                {story.soThat && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      So that
                    </span>
                    <p className="text-base text-foreground mt-0.5">
                      {story.soThat}
                    </p>
                  </div>
                )}
                {!story.asA && !story.iWantTo && !story.soThat && (
                  <p className="text-sm text-muted-foreground italic">
                    No requirements specified.
                  </p>
                )}
              </div>
            </section>

            {/* ═══════ ACCEPTANCE CRITERIA SECTION ═══════ */}
            <section className="px-6 py-5 border-b flex-1">
              {/* Header + Progress */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Acceptance Criteria
                </h3>
                {totalCount > 0 && (
                  <span className="text-xs font-semibold text-zinc-400">
                    {completedCount}/{totalCount} completed
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {totalCount > 0 && (
                <div className="w-full h-1.5 rounded-full bg-muted mb-5">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              )}

              {/* AC List */}
              {totalCount === 0 ? (
                <p className="text-sm text-muted-foreground italic py-4">
                  No acceptance criteria defined.
                </p>
              ) : (
                <div className="space-y-1">
                  {acs.map((ac) => (
                    <AcItemPanel
                      key={ac.acceptanceCriteriaId}
                      ac={ac}
                      onToggle={toggleAC}
                      isToggling={isTogglingAC}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ═══════ BUSINESS RULES SECTION ═══════ */}
            {rules.length > 0 && (
              <section className="px-6 py-5 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-3.5 w-3.5 text-zinc-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Business Rules
                  </h3>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                    {rules.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {rules.map((rule) => {
                    const priorityMap: Record<number, { label: string; color: string }> = {
                      1: { label: "Critical", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
                      2: { label: "High", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
                      3: { label: "Medium", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
                      4: { label: "Low", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
                    };
                    const p = priorityMap[rule.priority] ?? { label: `P${rule.priority}`, color: "bg-muted text-muted-foreground" };
                    return (
                      <div
                        key={rule.businessRuleId}
                        className="p-3 rounded-lg border bg-muted/30 hover:border-primary/20 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium flex-1">{rule.title}</span>
                          <Badge variant="outline" className={cn("text-[10px] shrink-0", p.color)}>
                            {p.label}
                          </Badge>
                        </div>
                        {rule.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {rule.description}
                          </p>
                        )}
                        {rule.source && (
                          <span className="text-[10px] text-zinc-400 mt-1 block">
                            Source: {rule.source}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ═══════ ACTIONS SECTION ═══════ */}
            <section className="px-6 py-5 space-y-4">
              {/* Primary CTA */}
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={() => onGenerateTests?.(story)}
              >
                <Sparkles className="h-4 w-4" />
                Generate AI Test Cases
              </Button>

              {/* Add to Suite CTA */}
              <Button
                variant="outline"
                className="w-full gap-2"
                size="lg"
                disabled={storyTestCaseIds.length === 0}
                onClick={() => setSuitePickerOpen(true)}
              >
                <FolderPlus className="h-4 w-4" />
                {storyTestCaseIds.length > 0
                  ? `Add ${storyTestCaseIds.length} Test Case${storyTestCaseIds.length !== 1 ? "s" : ""} to Suite`
                  : "No Test Cases to Add"}
              </Button>

              {/* Secondary actions */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => onEdit?.(story)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Story
                </Button>
                <button
                  className="text-xs text-zinc-400 hover:text-destructive transition-colors"
                  onClick={() => onDelete?.(story)}
                >
                  Delete Story
                </button>
              </div>
            </section>

            {/* Spacer for comfortable scroll end */}
            <div className="h-8" aria-hidden />

            {/* Suite Picker Dialog */}
            {story.projectId && (
              <SuitePickerDialog
                projectId={story.projectId}
                testCaseIds={storyTestCaseIds}
                open={suitePickerOpen}
                onOpenChange={setSuitePickerOpen}
              />
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
