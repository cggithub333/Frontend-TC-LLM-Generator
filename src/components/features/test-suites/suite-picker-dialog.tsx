"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  useTestSuitesByProject,
  useCreateTestSuite,
  useAddTestCaseToSuite,
} from "@/hooks/use-test-suites";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Loader2,
  Folder,
  FolderOpen,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface SuitePickerDialogProps {
  projectId: string;
  testCaseIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SuitePickerDialog({
  projectId,
  testCaseIds,
  open,
  onOpenChange,
  onSuccess,
}: SuitePickerDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedSuiteId, setSelectedSuiteId] = useState<string | null>(null);
  const [newSuiteName, setNewSuiteName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const { data: suitesData, isLoading } = useTestSuitesByProject(projectId, {
    size: 100,
  });
  const suites = suitesData?.items ?? [];

  const createSuite = useCreateTestSuite();
  const addToSuite = useAddTestCaseToSuite();

  const filteredSuites = useMemo(() => {
    if (!search) return suites;
    const q = search.toLowerCase();
    return suites.filter((s) => s.name.toLowerCase().includes(q));
  }, [suites, search]);

  /* ---------- Create new suite inline ---------- */
  const handleCreateSuite = async () => {
    if (!newSuiteName.trim()) return;
    try {
      const created = await createSuite.mutateAsync({
        projectId,
        name: newSuiteName.trim(),
      });
      setSelectedSuiteId(created.testSuiteId);
      setNewSuiteName("");
      toast.success("Suite created");
    } catch (error) {
      const msg = error instanceof Error
        ? error.message
        : "Failed to create suite. Please try again.";
      toast.error(msg);
    }
  };

  /* ---------- Add TCs to selected suite ---------- */
  const handleAddToSuite = async () => {
    if (!selectedSuiteId || testCaseIds.length === 0) return;
    setIsAdding(true);
    try {
      // Parallel add (Promise.all)
      await Promise.all(
        testCaseIds.map((testCaseId) =>
          addToSuite.mutateAsync({ suiteId: selectedSuiteId, testCaseId })
        )
      );
      toast.success(
        `Added ${testCaseIds.length} test case(s) to suite`
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const msg = error instanceof Error
        ? error.message
        : "Some test cases failed to add. Please try again.";
      toast.error(msg);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Test Cases to Suite</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suites..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Suite list */}
        <div className="max-h-[240px] overflow-y-auto space-y-1 -mx-1 px-1">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filteredSuites.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {search ? "No suites match your search" : "No suites yet"}
            </p>
          ) : (
            filteredSuites.map((suite) => {
              const isSelected = suite.testSuiteId === selectedSuiteId;
              return (
                <button
                  key={suite.testSuiteId}
                  onClick={() => setSelectedSuiteId(suite.testSuiteId)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150",
                    isSelected
                      ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                      : "hover:bg-muted/50"
                  )}
                >
                  {isSelected ? (
                    <FolderOpen className="h-4 w-4 shrink-0" />
                  ) : (
                    <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium truncate flex-1">
                    {suite.name}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 h-px bg-border" />
          <span>or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Create new suite */}
        <div className="flex gap-2">
          <Input
            placeholder="Create new suite..."
            value={newSuiteName}
            onChange={(e) => setNewSuiteName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateSuite()}
            className="text-sm"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleCreateSuite}
            disabled={!newSuiteName.trim() || createSuite.isPending}
            className="shrink-0 gap-1"
          >
            {createSuite.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            Add
          </Button>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddToSuite}
            disabled={!selectedSuiteId || isAdding}
            className="gap-2"
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add {testCaseIds.length} Test Case{testCaseIds.length !== 1 ? "s" : ""} to Suite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
