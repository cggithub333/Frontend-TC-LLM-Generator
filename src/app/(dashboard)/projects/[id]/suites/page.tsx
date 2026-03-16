"use client";

import { Fragment, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Plus,
  Folder,
  FolderOpen,
  Search,
  Loader2,
  FileText,
  Sparkles,
  PenLine,
  ChevronRight,
  Trash2,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { cn } from "@/lib/utils";
import {
  useTestSuitesByProject,
  useCreateTestSuite,
  useDeleteTestSuite,
  useUpdateTestSuite,
  useTestCasesInSuite,
  useAddTestCaseToSuite,
  useRemoveTestCaseFromSuite,
} from "@/hooks/use-test-suites";
import { useTestCasesByProject } from "@/hooks/use-test-cases";
import { toast } from "sonner";
import type { TestCase } from "@/types/test-case.types";

/* ================================================================== */
/*  CreateSuiteInline                                                  */
/* ================================================================== */

function CreateSuiteInline({
  projectId,
  onCreated,
}: {
  projectId: string;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const createSuite = useCreateTestSuite();

  const handleSubmit = async () => {
    if (!name.trim()) return;
    try {
      await createSuite.mutateAsync({ projectId, name: name.trim() });
      toast.success("Suite created");
      setName("");
      onCreated();
    } catch {
      toast.error("Failed to create suite");
    }
  };

  return (
    <div className="px-4 pb-3">
      <div className="flex gap-2">
        <Input
          placeholder="Suite name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="h-8 text-sm"
          autoFocus
        />
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!name.trim() || createSuite.isPending}
          className="h-8 px-3"
        >
          {createSuite.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            "Add"
          )}
        </Button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Grouped Test Case interface                                        */
/* ================================================================== */

interface GroupedTestCases {
  storyId: string;
  storyTitle: string;
  testCases: TestCase[];
}

/* ================================================================== */
/*  AddTestCasesDrawer — Sheet, project-scoped, grouped, parallel add  */
/* ================================================================== */

function AddTestCasesDrawer({
  open,
  onClose,
  suiteId,
  projectId,
  existingTestCaseIds,
}: {
  open: boolean;
  onClose: () => void;
  suiteId: string;
  projectId: string;
  existingTestCaseIds: Set<string>;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);

  // ── Project-scoped test cases (instead of global) ──
  const { data: allTestCases, isLoading } = useTestCasesByProject(projectId);
  const addToSuite = useAddTestCaseToSuite();

  // ── Filter by search only — show ALL TCs, mark already-added ones visually ──
  const filteredTestCases = useMemo(() => {
    const cases = allTestCases ?? [];
    if (search === "") return cases;
    return cases.filter(
      (tc) =>
        tc.title.toLowerCase().includes(search.toLowerCase()) ||
        tc.userStoryTitle?.toLowerCase().includes(search.toLowerCase())
    );
  }, [allTestCases, search]);

  // ── Group by User Story ──
  const grouped: GroupedTestCases[] = useMemo(() => {
    const map = new Map<string, GroupedTestCases>();
    for (const tc of filteredTestCases) {
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
  }, [filteredTestCases]);

  // ── Auto-expand all groups initially ──
  const allGroupIds = useMemo(() => new Set(grouped.map(g => g.storyId)), [grouped]);
  if (expandedGroups.size === 0 && allGroupIds.size > 0 && open) {
    setExpandedGroups(new Set(allGroupIds));
  }

  const toggleSelect = (id: string) => {
    if (existingTestCaseIds.has(id)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGroup = (group: GroupedTestCases) => {
    const selectableTcIds = group.testCases
      .filter((tc) => !existingTestCaseIds.has(tc.testCaseId))
      .map((tc) => tc.testCaseId);
    if (selectableTcIds.length === 0) return;
    const allSelected = selectableTcIds.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        selectableTcIds.forEach((id) => next.delete(id));
      } else {
        selectableTcIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleExpand = (storyId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(storyId)) next.delete(storyId);
      else next.add(storyId);
      return next;
    });
  };

  // ── Parallel add (Promise.all) ──
  const handleAddToSuite = async () => {
    if (selected.size === 0) return;
    setIsAdding(true);
    try {
      await Promise.all(
        Array.from(selected).map((testCaseId) =>
          addToSuite.mutateAsync({ suiteId, testCaseId })
        )
      );
      toast.success(`Added ${selected.size} test case(s) to suite`);
      setSelected(new Set());
      onClose();
    } catch {
      toast.error("Some test cases failed to add");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent className="flex flex-col">
        {/* Header */}
        <SheetHeader>
          <SheetTitle>Add Test Cases</SheetTitle>
          <SheetDescription>
            Select test cases from this project to add to the suite
          </SheetDescription>
        </SheetHeader>

        {/* Search */}
        <div className="px-6 py-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search test cases or stories..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Grouped List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : grouped.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="p-3 rounded-2xl bg-primary/10 w-fit mx-auto mb-3">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <p className="font-medium">No test cases found</p>
              <p className="text-sm mt-1">
                Create test cases from your stories first.
              </p>
            </div>
          ) : (
            grouped.map((group) => {
              const isExpanded = expandedGroups.has(group.storyId);
              const groupTcIds = group.testCases.map((tc) => tc.testCaseId);
              const selectableTcIds = groupTcIds.filter(
                (id) => !existingTestCaseIds.has(id)
              );
              const allInGroupSelected = selectableTcIds.length > 0 &&
                selectableTcIds.every((id) => selected.has(id));
              const someInGroupSelected =
                !allInGroupSelected &&
                selectableTcIds.some((id) => selected.has(id));

              return (
                <div key={group.storyId} className="mb-1">
                  {/* Group Header */}
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                    onClick={() => toggleExpand(group.storyId)}
                  >
                    <Checkbox
                      checked={
                        allInGroupSelected
                          ? true
                          : someInGroupSelected
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={(e) => {
                        e;
                        toggleGroup(group);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="mr-1"
                    />
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform duration-200 text-muted-foreground",
                        isExpanded && "rotate-90"
                      )}
                    />
                    <span className="text-sm font-semibold truncate flex-1 text-left">
                      {group.storyTitle}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] shrink-0"
                    >
                      {group.testCases.length}
                    </Badge>
                  </button>

                  {/* Group Items */}
                  {isExpanded && (
                    <div className="ml-6 space-y-1 mt-1">
                      {group.testCases.map((tc) => {
                        const isInSuite = existingTestCaseIds.has(tc.testCaseId);
                        return (
                        <label
                          key={tc.testCaseId}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-xl border transition-all duration-150",
                            isInSuite
                              ? "border-border bg-muted/30 opacity-60 cursor-not-allowed"
                              : selected.has(tc.testCaseId)
                                ? "border-primary bg-primary/5 cursor-pointer"
                                : "border-border hover:border-primary/30 hover:bg-muted/30 cursor-pointer"
                          )}
                        >
                          <Checkbox
                            checked={isInSuite || selected.has(tc.testCaseId)}
                            onCheckedChange={() =>
                              toggleSelect(tc.testCaseId)
                            }
                            disabled={isInSuite}
                            className="mt-0.5"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">
                              {tc.title}
                            </p>
                            {tc.preconditions && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                <span className="font-medium text-foreground/70">Pre:</span> {tc.preconditions}
                              </p>
                            )}
                            {tc.steps && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                <span className="font-medium text-foreground/70">Steps:</span> {tc.steps}
                              </p>
                            )}
                            {tc.expectedResult && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                <span className="font-medium text-foreground/70">Expected:</span> {tc.expectedResult}
                              </p>
                            )}
                            <div className="mt-1.5 flex items-center gap-1.5">
                              {isInSuite && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 border-green-500/30 text-green-600 dark:text-green-400"
                                >
                                  Already in suite
                                </Badge>
                              )}
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
                            </div>
                          </div>
                        </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selected.size} case(s) selected
          </p>
          <Button
            onClick={handleAddToSuite}
            disabled={selected.size === 0 || isAdding}
            className="gap-2"
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add to Suite
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ================================================================== */
/*  Main Page                                                          */
/* ================================================================== */

export default function ProjectTestSuitesPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [selectedSuiteId, setSelectedSuiteId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedTcId, setExpandedTcId] = useState<string | null>(null);

  // ── Rename state (Polish 5) ──
  const [renamingSuiteId, setRenamingSuiteId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // ── Delete confirm state (Polish 5) ──
  const [deletingSuiteId, setDeletingSuiteId] = useState<string | null>(null);

  // Data
  const { data: suitesData, isLoading: suitesLoading } =
    useTestSuitesByProject(projectId, { size: 100 });
  const suites = suitesData?.items ?? [];

  const selectedSuite = suites.find(
    (s) => s.testSuiteId === selectedSuiteId
  );

  const { data: suiteTestCases = [], isLoading: tcsLoading } = useTestCasesInSuite(
    selectedSuiteId ?? ""
  );

  const existingTCIds = useMemo(
    () => new Set(suiteTestCases.map((tc: TestCase) => tc.testCaseId)),
    [suiteTestCases]
  );

  const removeFromSuite = useRemoveTestCaseFromSuite();
  const deleteSuiteMutation = useDeleteTestSuite();
  const updateSuiteMutation = useUpdateTestSuite();

  const handleRemoveTC = async (testCaseId: string) => {
    if (!selectedSuiteId) return;
    try {
      await removeFromSuite.mutateAsync({
        suiteId: selectedSuiteId,
        testCaseId,
      });
      toast.success("Removed from suite");
    } catch {
      toast.error("Failed to remove");
    }
  };

  // ── Delete Suite — opens AlertDialog ──
  const handleDeleteSuite = (suiteId: string) => {
    setDeletingSuiteId(suiteId);
  };

  const confirmDeleteSuite = async () => {
    if (!deletingSuiteId) return;
    try {
      await deleteSuiteMutation.mutateAsync(deletingSuiteId);
      toast.success("Suite deleted");
      if (selectedSuiteId === deletingSuiteId) {
        setSelectedSuiteId(
          suites.length > 1
            ? suites.find((s) => s.testSuiteId !== deletingSuiteId)?.testSuiteId ?? null
            : null
        );
      }
    } catch {
      toast.error("Failed to delete suite");
    } finally {
      setDeletingSuiteId(null);
    }
  };

  // ── Rename Suite — inline edit flow ──
  const handleStartRename = (suite: { testSuiteId: string; name: string }) => {
    setRenamingSuiteId(suite.testSuiteId);
    setRenameValue(suite.name);
  };

  const handleConfirmRename = async () => {
    if (!renamingSuiteId || !renameValue.trim()) {
      setRenamingSuiteId(null);
      return;
    }
    try {
      await updateSuiteMutation.mutateAsync({
        id: renamingSuiteId,
        name: renameValue.trim(),
      });
      toast.success("Suite renamed");
    } catch {
      toast.error("Failed to rename suite");
    } finally {
      setRenamingSuiteId(null);
    }
  };

  const handleCancelRename = () => {
    setRenamingSuiteId(null);
    setRenameValue("");
  };

  const toggleExpand = (tcId: string) => {
    setExpandedTcId((prev) => (prev === tcId ? null : tcId));
  };

  // Auto-select first suite
  if (suites.length > 0 && !selectedSuiteId && !suitesLoading) {
    setSelectedSuiteId(suites[0].testSuiteId);
  }

  return (
    <div className="flex h-screen">
      {/* ─── Left Pane: Suite List ─── */}
      <div className="w-72 shrink-0 border-r border-border flex flex-col bg-card/50">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b">
          <h1 className="text-lg font-bold tracking-tight">Test Suites</h1>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => setShowCreateForm((v) => !v)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <CreateSuiteInline
            projectId={projectId}
            onCreated={() => setShowCreateForm(false)}
          />
        )}

        {/* Suite List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-1">
          {suitesLoading ? (
            /* Skeleton loading */
            <div className="space-y-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 animate-pulse">
                  <div className="w-4 h-4 bg-muted rounded" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-muted rounded w-3/4" />
                    <div className="h-2.5 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : suites.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="p-3 rounded-2xl bg-primary/10 w-fit mx-auto mb-3">
                <Folder className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                No suites yet
              </p>
              <p className="text-xs text-muted-foreground/70 mb-3">
                Create your first test suite
              </p>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                New Suite
              </Button>
            </div>
          ) : (
            suites.map((suite) => {
              const isActive = suite.testSuiteId === selectedSuiteId;
              const isRenaming = renamingSuiteId === suite.testSuiteId;
              return (
                <button
                  key={suite.testSuiteId}
                  onClick={() => setSelectedSuiteId(suite.testSuiteId)}
                  className={cn(
                    "group w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-150",
                    isActive
                      ? "bg-primary/15 text-primary font-semibold ring-1 ring-primary/20"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  {isActive ? (
                    <FolderOpen className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    {isRenaming ? (
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleConfirmRename();
                          if (e.key === "Escape") handleCancelRename();
                        }}
                        onBlur={handleConfirmRename}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm font-medium bg-transparent border-b border-primary outline-none w-full py-0.5"
                      />
                    ) : (
                      <p className="text-sm font-medium truncate">
                        {suite.name}
                      </p>
                    )}
                    {suite.description && !isRenaming && (
                      <p className={cn("text-xs truncate", isActive ? "text-primary/70" : "text-muted-foreground")}>
                        {suite.description}
                      </p>
                    )}
                  </div>
                  {/* Badge TC count — only for selected suite */}
                  {isActive && !tcsLoading && !isRenaming && (
                    <Badge variant="secondary" className="text-[10px] shrink-0 tabular-nums bg-primary/20 text-primary border-primary/30">
                      {suiteTestCases.length}
                    </Badge>
                  )}
                  {/* Context menu — MoreHorizontal trigger */}
                  {!isRenaming && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className={cn(
                            "p-1 rounded-md transition-opacity",
                            "text-muted-foreground hover:text-foreground hover:bg-accent",
                            "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartRename(suite);
                          }}
                          className="gap-2 text-sm"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSuite(suite.testSuiteId);
                          }}
                          className="gap-2 text-sm text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Right Pane: Suite Detail ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedSuite ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="p-3 rounded-2xl bg-primary/10 mb-4">
              <Folder className="h-12 w-12 text-primary" />
            </div>
            <p className="text-lg font-semibold">
              {suites.length === 0
                ? "Create your first suite"
                : "Select a suite"}
            </p>
            <p className="text-sm mt-1">
              {suites.length === 0
                ? "Organize related test cases into suites"
                : "Choose a suite from the left to view its test cases"}
            </p>
          </div>
        ) : (
          <>
            {/* Detail Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  {selectedSuite.name}
                </h2>
                {selectedSuite.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {selectedSuite.description}
                  </p>
                )}
              </div>
              <Button
                onClick={() => setDrawerOpen(true)}
                className="gap-2 shadow-md shadow-primary/20"
              >
                <Plus className="h-4 w-4" />
                Add Test Cases
              </Button>
            </div>

            {/* Test Cases Table */}
            <div className="flex-1 overflow-y-auto">
              {tcsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : suiteTestCases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <div className="relative mb-6">
                    <div className="p-4 rounded-2xl bg-primary/10">
                      <FileText className="h-12 w-12 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full" />
                  </div>
                  <p className="text-lg font-bold">No test cases yet</p>
                  <p className="text-sm mt-1 mb-6 max-w-sm text-center">
                    Add test cases from your stories to organize them in this
                    suite
                  </p>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setDrawerOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Test Cases
                  </Button>
                </div>
              ) : (
                <table className="w-full table-fixed text-left">
                  <colgroup>
                    <col className="w-[50%]" />
                    <col className="w-[30%]" />
                    <col className="w-20" />
                    <col className="w-14" />
                  </colgroup>
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Title
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Story
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Type
                      </th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        {/* Actions — no label */}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {suiteTestCases.map((tc: TestCase) => {
                      const isExpanded = expandedTcId === tc.testCaseId;
                      return (
                        <Fragment key={tc.testCaseId}>
                          {/* ── Summary Row ── */}
                          <tr
                            role="button"
                            tabIndex={0}
                            className={cn(
                              "group cursor-pointer transition-colors duration-150 border-b border-border/50",
                              isExpanded
                                ? "bg-muted/50"
                                : "hover:bg-muted/40"
                            )}
                            onClick={() => toggleExpand(tc.testCaseId)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                toggleExpand(tc.testCaseId);
                              }
                            }}
                          >
                            {/* Title + Chevron */}
                            <td className="px-6 py-4 text-sm font-medium text-foreground">
                              <div className="flex items-center gap-2">
                                <ChevronRight
                                  className={cn(
                                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                                    isExpanded && "rotate-90"
                                  )}
                                />
                                <span className="truncate">{tc.title}</span>
                              </div>
                            </td>

                            {/* Story */}
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              <p className="truncate">{tc.userStoryTitle ?? "—"}</p>
                            </td>

                            {/* Type Badge — Polish 3 */}
                            <td className="px-6 py-4">
                              {tc.generatedByAi ? (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50"
                                >
                                  <Sparkles className="h-3 w-3 mr-0.5" />
                                  AI
                                </Badge>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                                >
                                  Manual
                                </Badge>
                              )}
                            </td>

                            {/* Actions — Trash icon reveal on hover */}
                            <td className="px-6 py-4 text-right">
                              <button
                                className={cn(
                                  "p-1.5 rounded-md transition-all duration-150",
                                  "text-zinc-400 dark:text-zinc-500",
                                  "opacity-0 group-hover:opacity-100",
                                  "hover:text-destructive hover:bg-destructive/10"
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveTC(tc.testCaseId);
                                }}
                                title="Remove from suite"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>

                          {/* ── Expand Panel (accordion detail) — Polish 1 ── */}
                          <tr>
                            <td colSpan={4} className="p-0">
                              <div
                                className={cn(
                                  "grid transition-[grid-template-rows] duration-200 ease-in-out",
                                  isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                )}
                              >
                                <div className="overflow-hidden">
                                  <div className="px-6 py-4 ml-6 border-l-2 border-primary/30 space-y-3 bg-zinc-950/[0.04] dark:bg-zinc-950/40 border-b border-border/40">
                                    {/* Preconditions */}
                                    {tc.preconditions && (
                                      <div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                                          Preconditions
                                        </span>
                                        <p className="text-sm text-foreground/80 mt-0.5 whitespace-pre-wrap">
                                          {tc.preconditions}
                                        </p>
                                      </div>
                                    )}

                                    {/* Steps */}
                                    {tc.steps && (
                                      <div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                                          Steps
                                        </span>
                                        <p className="text-sm text-foreground/80 mt-0.5 whitespace-pre-wrap">
                                          {tc.steps}
                                        </p>
                                      </div>
                                    )}

                                    {/* Expected Result */}
                                    {tc.expectedResult && (
                                      <div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                                          Expected Result
                                        </span>
                                        <p className="text-sm text-foreground/80 mt-0.5 whitespace-pre-wrap">
                                          {tc.expectedResult}
                                        </p>
                                      </div>
                                    )}

                                    {/* Fallback */}
                                    {!tc.preconditions && !tc.steps && !tc.expectedResult && (
                                      <p className="text-sm text-muted-foreground italic">
                                        No additional details available.
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>

      {/* ─── Add Test Cases Drawer (Sheet) ─── */}
      <AddTestCasesDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        suiteId={selectedSuiteId ?? ""}
        projectId={projectId}
        existingTestCaseIds={existingTCIds}
      />

      {/* ─── Delete Suite Confirmation (AlertDialog — Polish 5) ─── */}
      <AlertDialog open={!!deletingSuiteId} onOpenChange={(open) => !open && setDeletingSuiteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete test suite?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this test suite. Test cases inside will not be deleted, only removed from this suite.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSuite}
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
