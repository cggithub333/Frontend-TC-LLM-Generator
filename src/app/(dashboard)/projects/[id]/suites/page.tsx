"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Plus,
  Folder,
  FolderOpen,
  Search,
  X,
  Loader2,
  AlertCircle,
  FileText,
  Sparkles,
  PenLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  useTestSuitesByProject,
  useCreateTestSuite,
  useTestCasesInSuite,
  useAddTestCaseToSuite,
  useRemoveTestCaseFromSuite,
} from "@/hooks/use-test-suites";
import { useTestCases } from "@/hooks/use-test-cases";
import { toast } from "sonner";
import type { TestCase } from "@/types/test-case.types";

// ──────── Create Suite Dialog (inline) ────────
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
    <div className="px-3 pb-3">
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

// ──────── Add Test Cases Drawer ────────
function AddTestCasesDrawer({
  open,
  onClose,
  suiteId,
  existingTestCaseIds,
}: {
  open: boolean;
  onClose: () => void;
  suiteId: string;
  existingTestCaseIds: Set<string>;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { data: allTestCases, isLoading } = useTestCases({ size: 200 });
  const addToSuite = useAddTestCaseToSuite();

  const availableTestCases = useMemo(() => {
    const cases = allTestCases?.items ?? [];
    return cases.filter(
      (tc) =>
        !existingTestCaseIds.has(tc.testCaseId) &&
        (search === "" ||
          tc.title.toLowerCase().includes(search.toLowerCase()) ||
          tc.userStoryTitle?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [allTestCases, existingTestCaseIds, search]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddToSuite = async () => {
    try {
      for (const testCaseId of selected) {
        await addToSuite.mutateAsync({ suiteId, testCaseId });
      }
      toast.success(`Added ${selected.size} test case(s) to suite`);
      setSelected(new Set());
      onClose();
    } catch {
      toast.error("Failed to add test cases");
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-card border-l border-border z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h3 className="text-lg font-bold">Add Test Cases</h3>
            <p className="text-sm text-muted-foreground">
              Select test cases to add to this suite
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors duration-150"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search test cases..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : availableTestCases.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-3">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <p className="font-medium">No test cases available</p>
              <p className="text-sm mt-1">
                All test cases are already in this suite, or none exist yet.
              </p>
            </div>
          ) : (
            availableTestCases.map((tc) => (
              <label
                key={tc.testCaseId}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150",
                  selected.has(tc.testCaseId)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30 hover:bg-muted/30"
                )}
              >
                <input
                  type="checkbox"
                  checked={selected.has(tc.testCaseId)}
                  onChange={() => toggleSelect(tc.testCaseId)}
                  className="mt-0.5 rounded border-border"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{tc.title}</p>
                  {tc.userStoryTitle && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      Story: {tc.userStoryTitle}
                    </p>
                  )}
                  <div className="mt-1">
                    {tc.generatedByAi ? (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                        <Sparkles className="h-3 w-3 mr-0.5" />
                        AI
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        <PenLine className="h-3 w-3 mr-0.5" />
                        Manual
                      </Badge>
                    )}
                  </div>
                </div>
              </label>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selected.size} case(s) selected
          </p>
          <Button
            onClick={handleAddToSuite}
            disabled={selected.size === 0 || addToSuite.isPending}
            className="gap-2"
          >
            {addToSuite.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add to Suite
          </Button>
        </div>
      </div>
    </>
  );
}

// ──────── Main Page ────────
export default function ProjectTestSuitesPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [selectedSuiteId, setSelectedSuiteId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Data
  const { data: suitesData, isLoading: suitesLoading } =
    useTestSuitesByProject(projectId, { size: 100 });
  const suites = suitesData?.items ?? [];

  const selectedSuite = suites.find(
    (s) => s.testSuiteId === selectedSuiteId
  );

  const { data: suiteTCsRaw, isLoading: tcsLoading } = useTestCasesInSuite(
    selectedSuiteId ?? ""
  );
  const suiteTestCases: TestCase[] = useMemo(() => {
    if (!suiteTCsRaw) return [];
    if (Array.isArray(suiteTCsRaw)) return suiteTCsRaw;
    if (suiteTCsRaw.items) return suiteTCsRaw.items;
    return [];
  }, [suiteTCsRaw]);

  const existingTCIds = useMemo(
    () => new Set(suiteTestCases.map((tc: TestCase) => tc.testCaseId)),
    [suiteTestCases]
  );

  const removeFromSuite = useRemoveTestCaseFromSuite();

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

  // Auto-select first suite
  if (suites.length > 0 && !selectedSuiteId && !suitesLoading) {
    setSelectedSuiteId(suites[0].testSuiteId);
  }

  return (
    <div className="flex h-[calc(100vh-0px)]">
      {/* ─── Left Pane: Suite List (30%) ─── */}
      <div className="w-[300px] shrink-0 border-r border-border flex flex-col bg-card/50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-lg font-bold">Test Suites</h1>
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
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {suitesLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : suites.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-3">
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
              return (
                <button
                  key={suite.testSuiteId}
                  onClick={() => setSelectedSuiteId(suite.testSuiteId)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  {isActive ? (
                    <FolderOpen className="h-4 w-4 shrink-0" />
                  ) : (
                    <Folder className="h-4 w-4 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{suite.name}</p>
                    {suite.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {suite.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Right Pane: Suite Detail (70%) ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedSuite ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
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
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold">{selectedSuite.name}</h2>
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
                  <div className="p-4 rounded-full bg-primary/10 mb-4">
                    <FileText className="h-12 w-12 text-primary" />
                  </div>
                  <p className="text-lg font-semibold">No test cases</p>
                  <p className="text-sm mt-1 mb-4">
                    Add test cases from your project to this suite
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
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted/50 text-xs text-muted-foreground uppercase font-medium border-b">
                      <th className="px-6 py-3 font-semibold">Title</th>
                      <th className="px-6 py-3 font-semibold">Story</th>
                      <th className="px-6 py-3 font-semibold">Type</th>
                      <th className="px-6 py-3 font-semibold w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y">
                    {suiteTestCases.map((tc: TestCase) => (
                      <tr
                        key={tc.testCaseId}
                        className="hover:bg-muted/30 transition-colors duration-150"
                      >
                        <td className="px-6 py-3.5 font-medium">
                          {tc.title}
                        </td>
                        <td className="px-6 py-3.5 text-muted-foreground">
                          {tc.userStoryTitle ?? "—"}
                        </td>
                        <td className="px-6 py-3.5">
                          {tc.generatedByAi ? (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                              <Sparkles className="h-3 w-3 mr-0.5" />
                              AI
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              <PenLine className="h-3 w-3 mr-0.5" />
                              Manual
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveTC(tc.testCaseId)}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>

      {/* ─── Add Test Cases Drawer ─── */}
      <AddTestCasesDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        suiteId={selectedSuiteId ?? ""}
        existingTestCaseIds={existingTCIds}
      />
    </div>
  );
}
