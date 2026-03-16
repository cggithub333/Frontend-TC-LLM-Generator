"use client";

import { Fragment, useState, useMemo, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Plus,
  ClipboardList,
  Search,
  X,
  Loader2,
  AlertCircle,
  Folder,
  Calendar,
  User,
  GripVertical,
  Pencil,
  Trash2,
  Check,
  ChevronRight,
  FileText,
  CheckCircle2,
  BookOpen as BookOpenIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useTestPlansByProject,
  useTestSuitesInPlan,
  useAttachSuiteToPlan,
  useDetachSuiteFromPlan,
  useUpdateTestPlan,
  useUpdateTestPlanStatus,
  useDeleteTestPlan,
  useTestPlanStories,
} from "@/hooks/use-test-plans";
import { useTestCasesInSuite } from "@/hooks/use-test-suites";
import { CreateTestPlanDialog } from "@/components/features/test-plans/create-test-plan-dialog";
import { useTestSuitesByProject } from "@/hooks/use-test-suites";
import { useStoriesByProject } from "@/hooks/use-stories";
import { toast } from "sonner";
import type { TestSuite } from "@/types/test-suite.types";
import type { TestPlanStatus, TestPlan } from "@/types/test-plan.types";
import type { TestCase } from "@/types/test-case.types";
import type { UserStory } from "@/types/story.types";

// ──────── Status Badge ────────
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    DRAFT: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-600 dark:text-slate-300",
      label: "Draft",
    },
    IN_PROGRESS: {
      bg: "bg-primary/10 dark:bg-primary/20",
      text: "text-primary",
      label: "In Progress",
    },
    COMPLETED: {
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
      text: "text-emerald-700 dark:text-emerald-300",
      label: "Completed",
    },
  };
  const s = config[status] ?? config.DRAFT;
  return (
    <Badge
      className={cn(s.bg, s.text, "border-0 font-bold text-[10px] px-2 py-0.5")}
    >
      {s.label}
    </Badge>
  );
}

// ──────── Kanban Column Definition ────────
const KANBAN_COLUMNS: { key: TestPlanStatus; label: string; accent: string; dropBg: string }[] = [
  { key: "DRAFT", label: "Draft", accent: "border-t-slate-400", dropBg: "bg-slate-500/10" },
  { key: "IN_PROGRESS", label: "In Progress", accent: "border-t-primary", dropBg: "bg-primary/10" },
  { key: "COMPLETED", label: "Completed", accent: "border-t-emerald-500", dropBg: "bg-emerald-500/10" },
];

const STATUS_OPTIONS: { value: TestPlanStatus; label: string; icon: React.ReactNode }[] = [
  { value: "DRAFT", label: "Draft", icon: <FileText className="h-3.5 w-3.5" /> },
  { value: "IN_PROGRESS", label: "In Progress", icon: <Loader2 className="h-3.5 w-3.5" /> },
  { value: "COMPLETED", label: "Completed", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
];

// ──────── Suite Row with TC Count ────────
function SuiteRowWithTCCount({
  suite,
  onRemove,
}: {
  suite: TestSuite;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { data: tcs = [], isLoading } = useTestCasesInSuite(suite.testSuiteId);
  const testCases: TestCase[] = Array.isArray(tcs) ? tcs : [];

  return (
    <Fragment>
      <tr
        role="button"
        tabIndex={0}
        className="group cursor-pointer hover:bg-muted/40 transition-colors duration-150 border-b border-border/50"
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
      >
        <td className="px-6 py-3.5 font-medium text-sm">
          <div className="flex items-center gap-2">
            <ChevronRight
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                expanded && "rotate-90"
              )}
            />
            <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{suite.name}</span>
          </div>
        </td>
        <td className="px-6 py-3.5 text-sm text-muted-foreground">
          <p className="truncate">{suite.description ?? "—"}</p>
        </td>
        <td className="px-6 py-3.5">
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          ) : (
            <Badge
              variant="secondary"
              className="text-[10px] tabular-nums px-2 py-0.5 rounded-full"
            >
              {testCases.length} TCs
            </Badge>
          )}
        </td>
        <td className="px-6 py-3.5 text-right">
          <button
            className={cn(
              "p-1.5 rounded-md transition-all duration-150",
              "text-zinc-400 dark:text-zinc-500",
              "opacity-0 group-hover:opacity-100",
              "hover:text-destructive hover:bg-destructive/10"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            title="Remove from plan"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </td>
      </tr>
      {/* Expandable TC list */}
      <tr>
        <td colSpan={4} className="p-0">
          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-200 ease-in-out",
              expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
          >
            <div className="overflow-hidden">
              <div className="px-6 py-3 ml-10 border-l-2 border-primary/30 space-y-1 bg-zinc-950/[0.04] dark:bg-zinc-950/40 border-b border-border/40">
                {testCases.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-2">
                    No test cases in this suite.
                  </p>
                ) : (
                  testCases.map((tc: TestCase) => (
                    <div
                      key={tc.testCaseId}
                      className="flex items-center gap-2 py-1.5 text-sm"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                      <span className="truncate text-foreground/80">{tc.title}</span>
                      {tc.generatedByAi && (
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 shrink-0">
                          AI
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </td>
      </tr>
    </Fragment>
  );
}

// ──────── Suite Row Card (for drawer, card-based) ────────
function SuiteRowCard({
  suite,
  onRemove,
}: {
  suite: TestSuite;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { data: tcs = [], isLoading } = useTestCasesInSuite(suite.testSuiteId);
  const testCases: TestCase[] = Array.isArray(tcs) ? tcs : [];

  return (
    <div className="border border-border/60 rounded-xl overflow-hidden hover:border-primary/30 transition-colors">
      <div
        role="button"
        tabIndex={0}
        className="flex items-center justify-between p-3.5 cursor-pointer group hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpanded((v) => !v); }
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <ChevronRight
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
              expanded && "rotate-90"
            )}
          />
          <Folder className="h-4 w-4 text-primary/70 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{suite.name}</p>
            {suite.description && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">{suite.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          ) : (
            <Badge variant="secondary" className="text-[10px] tabular-nums px-2 py-0.5 rounded-full">
              {testCases.length} TCs
            </Badge>
          )}
          <button
            className={cn(
              "p-1.5 rounded-md transition-all",
              "text-zinc-400 dark:text-zinc-500",
              "opacity-0 group-hover:opacity-100",
              "hover:text-destructive hover:bg-destructive/10"
            )}
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            title="Remove from plan"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Expandable TC list */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-in-out",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 py-2.5 ml-6 border-l-2 border-primary/30 space-y-1 bg-muted/20 border-t border-border/40">
            {testCases.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-1.5">
                No test cases in this suite.
              </p>
            ) : (
              testCases.map((tc: TestCase) => (
                <div key={tc.testCaseId} className="flex items-center gap-2 py-1 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                  <span className="truncate text-foreground/80 text-xs">{tc.title}</span>
                  {tc.generatedByAi && (
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 shrink-0">
                      AI
                    </Badge>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────── Import Suites Drawer ────────
function ImportSuitesDrawer({
  open,
  onClose,
  planId,
  projectId,
  existingSuiteIds,
}: {
  open: boolean;
  onClose: () => void;
  planId: string;
  projectId: string;
  existingSuiteIds: Set<string>;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { data: allSuites, isLoading } = useTestSuitesByProject(projectId, {
    size: 100,
  });
  const attachSuite = useAttachSuiteToPlan();

  const availableSuites = useMemo(() => {
    const suites = allSuites?.items ?? [];
    return suites.filter(
      (s) =>
        !existingSuiteIds.has(s.testSuiteId) &&
        (search === "" ||
          s.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [allSuites, existingSuiteIds, search]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleImport = async () => {
    try {
      for (const testSuiteId of selected) {
        await attachSuite.mutateAsync({ planId, testSuiteId });
      }
      toast.success(`Imported ${selected.size} suite(s)`);
      setSelected(new Set());
      onClose();
    } catch {
      toast.error("Failed to import suites");
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-card border-l border-border z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h3 className="text-lg font-bold">Import Test Suites</h3>
            <p className="text-sm text-muted-foreground">
              Add test suites to this plan
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors duration-150"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suites..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : availableSuites.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-3">
                <Folder className="h-8 w-8 text-primary" />
              </div>
              <p className="font-medium">No suites available</p>
              <p className="text-sm mt-1">
                All suites are already in this plan, or none exist yet.
              </p>
            </div>
          ) : (
            availableSuites.map((suite) => (
              <label
                key={suite.testSuiteId}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150",
                  selected.has(suite.testSuiteId)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30 hover:bg-muted/30"
                )}
              >
                <input
                  type="checkbox"
                  checked={selected.has(suite.testSuiteId)}
                  onChange={() => toggleSelect(suite.testSuiteId)}
                  className="mt-0.5 rounded border-border"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{suite.name}</p>
                  {suite.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {suite.description}
                    </p>
                  )}
                </div>
              </label>
            ))
          )}
        </div>

        <div className="p-4 border-t flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selected.size} suite(s) selected
          </p>
          <Button
            onClick={handleImport}
            disabled={selected.size === 0 || attachSuite.isPending}
            className="gap-2"
          >
            {attachSuite.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Import to Plan
          </Button>
        </div>
      </div>
    </>
  );
}

// ──────── Link Stories Drawer ────────
function LinkStoriesDrawer({
  open,
  onClose,
  planId,
  projectId,
  existingStoryIds,
}: {
  open: boolean;
  onClose: () => void;
  planId: string;
  projectId: string;
  existingStoryIds: string[];
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { data: allStories, isLoading } = useStoriesByProject(projectId, { size: 100 });
  const updatePlan = useUpdateTestPlan();

  const availableStories = useMemo(() => {
    const stories = allStories?.items ?? [];
    return stories.filter(
      (s) =>
        !existingStoryIds.includes(s.userStoryId) &&
        (search === "" || s.title.toLowerCase().includes(search.toLowerCase()))
    );
  }, [allStories, existingStoryIds, search]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleLink = async () => {
    try {
      const newStoryIds = [...existingStoryIds, ...selected];
      await updatePlan.mutateAsync({ id: planId, storyIds: newStoryIds });
      toast.success(`Linked ${selected.size} story(ies)`);
      setSelected(new Set());
      onClose();
    } catch {
      toast.error("Failed to link stories");
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-card border-l border-border z-[61] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h3 className="text-lg font-bold">Link User Stories</h3>
            <p className="text-sm text-muted-foreground">Add stories to this test plan</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search stories..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : availableStories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="p-3 rounded-full bg-amber-500/10 w-fit mx-auto mb-3">
                <BookOpenIcon className="h-8 w-8 text-amber-500" />
              </div>
              <p className="font-medium">No stories available</p>
              <p className="text-sm mt-1">All stories are already linked, or none exist yet.</p>
            </div>
          ) : (
            availableStories.map((story) => (
              <label
                key={story.userStoryId}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150",
                  selected.has(story.userStoryId)
                    ? "border-amber-500 bg-amber-500/5"
                    : "border-border hover:border-amber-500/30 hover:bg-muted/30"
                )}
              >
                <input
                  type="checkbox"
                  checked={selected.has(story.userStoryId)}
                  onChange={() => toggleSelect(story.userStoryId)}
                  className="mt-0.5 rounded border-border"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{story.title}</p>
                  {story.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{story.description}</p>
                  )}
                  <Badge variant="outline" className="text-[9px] mt-1 border-border/50">{story.status}</Badge>
                </div>
              </label>
            ))
          )}
        </div>

        <div className="p-4 border-t flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{selected.size} story(ies) selected</p>
          <Button onClick={handleLink} disabled={selected.size === 0 || updatePlan.isPending} className="gap-2">
            {updatePlan.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Link to Plan
          </Button>
        </div>
      </div>
    </>
  );
}

// ──────── Plan Detail Drawer (REDESIGNED — Full UX) ────────
function PlanDetailDrawer({
  open,
  onClose,
  plan,
  planSuites,
  suitesLoading,
  onImportClick,
  onRemoveSuite,
  onPlanUpdated,
  onPlanDeleted,
}: {
  open: boolean;
  onClose: () => void;
  plan: any;
  planSuites: TestSuite[];
  suitesLoading: boolean;
  onImportClick: () => void;
  onRemoveSuite: (testSuiteId: string) => void;
  onPlanUpdated?: () => void;
  onPlanDeleted?: () => void;
}) {
  const [editingName, setEditingName] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [descValue, setDescValue] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [linkStoriesOpen, setLinkStoriesOpen] = useState(false);

  const updatePlan = useUpdateTestPlan();
  const deletePlan = useDeleteTestPlan();

  // Fetch linked stories for this plan
  const { data: storiesData, isLoading: storiesLoading } = useTestPlanStories(
    plan?.testPlanId ?? ""
  );
  const stories = storiesData?.items ?? [];

  // Compute total TC count across all attached suites
  const totalTCs = useMemo(() => {
    // This will be computed by individual SuiteRowWithTCCount components
    // For the stats card we show suite count
    return planSuites.length;
  }, [planSuites]);

  if (!open || !plan) return null;

  const handleStartEditName = () => {
    setNameValue(plan.name);
    setEditingName(true);
  };

  const handleSaveName = async () => {
    if (!nameValue.trim() || nameValue.trim() === plan.name) {
      setEditingName(false);
      return;
    }
    try {
      await updatePlan.mutateAsync({ id: plan.testPlanId, name: nameValue.trim() });
      toast.success("Plan name updated");
      onPlanUpdated?.();
    } catch {
      toast.error("Failed to update name");
    }
    setEditingName(false);
  };

  const handleStartEditDesc = () => {
    setDescValue(plan.description ?? "");
    setEditingDesc(true);
  };

  const handleSaveDesc = async () => {
    if (descValue.trim() === (plan.description ?? "")) {
      setEditingDesc(false);
      return;
    }
    try {
      await updatePlan.mutateAsync({ id: plan.testPlanId, description: descValue.trim() });
      toast.success("Description updated");
      onPlanUpdated?.();
    } catch {
      toast.error("Failed to update description");
    }
    setEditingDesc(false);
  };

  const handleStatusChange = async (status: string) => {
    try {
      await updatePlan.mutateAsync({ id: plan.testPlanId, status: status as TestPlanStatus });
      toast.success("Status updated");
      onPlanUpdated?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to update status";
      toast.error(msg);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deletePlan.mutateAsync(plan.testPlanId);
      toast.success("Plan deleted");
      setDeleteConfirmOpen(false);
      onPlanDeleted?.();
      onClose();
    } catch {
      toast.error("Failed to delete plan");
    }
  };

  const createdDate = new Date(plan.createdAt);
  const updatedDate = plan.updatedAt ? new Date(plan.updatedAt) : null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-card border-l border-border z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* ── HEADER ── */}
        <div className="flex items-start justify-between p-5 border-b bg-gradient-to-r from-card to-muted/30">
          <div className="flex-1 min-w-0 mr-4 space-y-2">
            {/* Editable name */}
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") setEditingName(false);
                  }}
                  onBlur={handleSaveName}
                  className="text-lg font-bold bg-transparent border-b-2 border-primary outline-none w-full py-0.5"
                />
                <button onClick={handleSaveName} className="p-1 rounded hover:bg-primary/10 text-primary">
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button onClick={handleStartEditName} className="group flex items-center gap-2 text-left max-w-full">
                <h2 className="text-lg font-bold group-hover:text-primary transition-colors truncate">
                  {plan.name}
                </h2>
                <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            )}

            {/* Status + Meta row */}
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={plan.status} onValueChange={handleStatusChange} disabled={updatePlan.isPending}>
                <SelectTrigger className="h-7 w-auto gap-1 text-[11px] font-bold px-2 border-0 bg-transparent hover:bg-muted/50 transition-colors [&>svg]:h-3 [&>svg]:w-3">
                  <SelectValue>
                    <StatusBadge status={plan.status} />
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      <span className="flex items-center gap-2">{opt.icon}{opt.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="w-px h-3 bg-border" />
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                {plan.createdByUserFullName}
              </span>
              <span className="w-px h-3 bg-border" />
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {createdDate.toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              title="Delete plan"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="flex-1 overflow-y-auto">
          {/* ─── OVERVIEW SECTION ─── */}
          <div className="p-5 border-b space-y-4">
            {/* Description */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Description
              </p>
              {editingDesc ? (
                <textarea
                  autoFocus
                  value={descValue}
                  onChange={(e) => setDescValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSaveDesc(); }
                    if (e.key === "Escape") setEditingDesc(false);
                  }}
                  onBlur={handleSaveDesc}
                  className="w-full text-sm bg-muted/30 border border-primary/30 rounded-lg outline-none p-3 resize-none focus:ring-2 focus:ring-primary/20 transition-all"
                  rows={3}
                  placeholder="What does this plan cover?"
                />
              ) : (
                <button onClick={handleStartEditDesc} className="group text-left w-full">
                  <div className={cn(
                    "text-sm rounded-lg p-3 transition-all border border-transparent",
                    plan.description
                      ? "text-foreground/80 hover:bg-muted/40 hover:border-border"
                      : "text-muted-foreground italic hover:bg-muted/40 hover:border-border"
                  )}>
                    <div className="flex items-start gap-2">
                      <span className="flex-1">{plan.description || "Click to add a description..."}</span>
                      <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                    </div>
                  </div>
                </button>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted/30 rounded-xl p-3 text-center border border-border/50">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Folder className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xl font-bold tabular-nums">{planSuites.length}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Suites</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-3 text-center border border-border/50">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <BookOpenIcon className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-xl font-bold tabular-nums">{stories.length}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Stories</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-3 text-center border border-border/50">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Calendar className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-sm font-bold">{updatedDate ? updatedDate.toLocaleDateString() : "—"}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Updated</p>
              </div>
            </div>
          </div>

          {/* ─── LINKED STORIES SECTION ─── */}
          <div className="p-5 border-b">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpenIcon className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-bold">Linked User Stories</h3>
                <Badge variant="secondary" className="text-[10px] tabular-nums">
                  {stories.length}
                </Badge>
              </div>
              <Button size="sm" variant="outline" onClick={() => setLinkStoriesOpen(true)} className="gap-1.5 h-7 text-xs border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10">
                <Plus className="h-3.5 w-3.5" />
                Link Stories
              </Button>
            </div>

            {storiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : stories.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-muted-foreground">
                <BookOpenIcon className="h-6 w-6 mb-2 opacity-50" />
                <p className="text-sm">No stories linked to this plan</p>
                <p className="text-xs mt-0.5 mb-3">Link user stories to track test coverage</p>
                <Button variant="outline" size="sm" onClick={() => setLinkStoriesOpen(true)} className="gap-2 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10">
                  <Plus className="h-4 w-4" />
                  Link User Stories
                </Button>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {stories.map((story: UserStory) => (
                  <div
                    key={story.userStoryId}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-colors group"
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {story.title}
                      </p>
                      {story.jiraIssueKey && (
                        <p className="text-[11px] text-muted-foreground">{story.jiraIssueKey}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[9px] shrink-0 border-border/50">
                      {story.status}
                    </Badge>
                    <button
                      className="p-1 rounded-md text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                      onClick={async () => {
                        try {
                          const newStoryIds = (plan.storyIds ?? []).filter((id: string) => id !== story.userStoryId);
                          await updatePlan.mutateAsync({ id: plan.testPlanId, storyIds: newStoryIds });
                          toast.success("Story unlinked");
                          onPlanUpdated?.();
                        } catch {
                          toast.error("Failed to unlink story");
                        }
                      }}
                      title="Unlink story"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─── ATTACHED SUITES SECTION ─── */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold">Attached Test Suites</h3>
                <Badge variant="secondary" className="text-[10px] tabular-nums">
                  {planSuites.length}
                </Badge>
              </div>
              <Button size="sm" onClick={onImportClick} className="gap-1.5 h-7 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Import Suites
              </Button>
            </div>

            {suitesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : planSuites.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-muted-foreground">
                <div className="p-2.5 rounded-full bg-primary/10 mb-3">
                  <Folder className="h-8 w-8 text-primary" />
                </div>
                <p className="font-medium">No suites attached</p>
                <p className="text-xs mt-1 mb-3">Import test suites to build your execution campaign</p>
                <Button variant="outline" size="sm" className="gap-2" onClick={onImportClick}>
                  <Plus className="h-4 w-4" />
                  Import Test Suites
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {planSuites.map((suite: TestSuite) => (
                  <SuiteRowCard
                    key={suite.testSuiteId}
                    suite={suite}
                    onRemove={() => onRemoveSuite(suite.testSuiteId)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete test plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{plan.name}&quot; and all its associations. Test suites and test cases will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePlan.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Link Stories Drawer */}
      <LinkStoriesDrawer
        open={linkStoriesOpen}
        onClose={() => setLinkStoriesOpen(false)}
        planId={plan.testPlanId}
        projectId={plan.projectId}
        existingStoryIds={plan.storyIds ?? []}
      />
    </>
  );
}

// ──────── Draggable Plan Card ────────
function DraggablePlanCard({
  plan,
  isSelected,
  onSelect,
}: {
  plan: TestPlan;
  isSelected: boolean;
  onSelect: (planId: string) => void;
}) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", plan.testPlanId);
    e.dataTransfer.effectAllowed = "move";
    // Add a semi-transparent drag image
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onSelect(plan.testPlanId)}
      className={cn(
        "w-full text-left bg-card dark:bg-zinc-800 border border-border dark:border-zinc-700 rounded-lg p-4 shadow-sm cursor-grab group",
        "transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40",
        "active:cursor-grabbing active:scale-[0.98]",
        isSelected && "ring-2 ring-primary/50 border-primary/40"
      )}
    >
      <div className="flex items-start gap-2 mb-2">
        <GripVertical className="h-4 w-4 text-muted-foreground/30 mt-0.5 shrink-0 group-hover:text-muted-foreground/60 transition-colors" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors duration-150">
            {plan.name}
          </p>
          {plan.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {plan.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/50">
        <span className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {plan.createdByUserFullName?.split(" ")[0] ?? "—"}
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <Calendar className="h-3 w-3" />
          {new Date(plan.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

// ──────── Droppable Kanban Column ────────
function DroppableKanbanColumn({
  col,
  plans,
  selectedPlanId,
  onPlanSelect,
  onDrop,
}: {
  col: typeof KANBAN_COLUMNS[number];
  plans: TestPlan[];
  selectedPlanId: string | null;
  onPlanSelect: (planId: string) => void;
  onDrop: (planId: string, newStatus: TestPlanStatus) => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only leave when actually leaving the column, not entering a child
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const planId = e.dataTransfer.getData("text/plain");
    if (planId) {
      onDrop(planId, col.key);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col rounded-xl bg-muted/20 dark:bg-zinc-900/50 min-h-[400px] border-t-2 transition-all duration-200",
        col.accent,
        isDragOver && `${col.dropBg} ring-2 ring-inset ring-primary/30 scale-[1.01]`
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{col.label}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-medium">
            {plans.length}
          </span>
        </div>
      </div>

      {/* Column Content */}
      <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
        {plans.length === 0 ? (
          <div className={cn(
            "flex flex-col items-center justify-center py-12 text-muted-foreground/60 rounded-lg transition-colors",
            isDragOver && "bg-primary/5 border-2 border-dashed border-primary/30"
          )}>
            <ClipboardList className="h-8 w-8 mb-2" />
            <p className="text-xs font-medium">
              {isDragOver ? "Drop here" : "No plans"}
            </p>
          </div>
        ) : (
          plans.map((plan) => (
            <DraggablePlanCard
              key={plan.testPlanId}
              plan={plan}
              isSelected={selectedPlanId === plan.testPlanId}
              onSelect={onPlanSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ──────── Main Page ────────
export default function ProjectTestPlansPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

  const { data, isLoading, error } = useTestPlansByProject(projectId, {
    size: 50,
  });
  const plans = data?.items ?? [];

  const selectedPlan = plans.find((p) => p.testPlanId === selectedPlanId);

  const { data: planSuitesRaw, isLoading: suitesLoading } =
    useTestSuitesInPlan(selectedPlanId ?? "");
  const planSuites: TestSuite[] = useMemo(() => {
    if (!planSuitesRaw) return [];
    if (Array.isArray(planSuitesRaw)) return planSuitesRaw;
    // Spring HATEOAS CollectionModel wraps items in _embedded
    const raw = planSuitesRaw as any;
    if (raw._embedded) {
      // The key could be testSuiteResponseList, testSuiteList, etc.
      const embeddedKey = Object.keys(raw._embedded)[0];
      if (embeddedKey && Array.isArray(raw._embedded[embeddedKey])) {
        return raw._embedded[embeddedKey];
      }
    }
    if (raw.items) return raw.items;
    if (raw.content) return raw.content;
    return [];
  }, [planSuitesRaw]);

  const existingSuiteIds = useMemo(
    () => new Set(planSuites.map((s) => s.testSuiteId)),
    [planSuites]
  );

  const detachSuite = useDetachSuiteFromPlan();
  const updatePlan = useUpdateTestPlan();

  const handleRemoveSuite = async (testSuiteId: string) => {
    if (!selectedPlanId) return;
    try {
      await detachSuite.mutateAsync({ planId: selectedPlanId, testSuiteId });
      toast.success("Suite removed from plan");
    } catch {
      toast.error("Failed to remove suite");
    }
  };

  // Group plans by status for Kanban
  const plansByStatus = useMemo(() => {
    const groups: Record<string, TestPlan[]> = {
      DRAFT: [],
      IN_PROGRESS: [],
      COMPLETED: [],
    };
    for (const plan of plans) {
      const key = plan.status in groups ? plan.status : "DRAFT";
      groups[key].push(plan);
    }
    return groups;
  }, [plans]);

  const handlePlanClick = (planId: string) => {
    setSelectedPlanId(planId);
    setDetailDrawerOpen(true);
  };

  // ── Drag & Drop Handler ──
  const handleDrop = useCallback(async (planId: string, newStatus: TestPlanStatus) => {
    const plan = plans.find((p) => p.testPlanId === planId);
    if (!plan || plan.status === newStatus) return;

    try {
      await updatePlan.mutateAsync({ id: planId, status: newStatus });
      toast.success(`Moved to ${newStatus === "DRAFT" ? "Draft" : newStatus === "IN_PROGRESS" ? "In Progress" : "Completed"}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to update status";
      toast.error(msg);
    }
  }, [plans, updatePlan]);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Test Plans</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Organize test suites into execution campaigns · <span className="text-primary font-medium">Drag cards to change status</span>
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="gap-2 shadow-md shadow-primary/20"
        >
          <Plus className="h-4 w-4" />
          New Plan
        </Button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <AlertCircle className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Failed to load test plans
          </p>
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 rounded-full bg-primary/10 mb-6">
            <ClipboardList className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">No test plans yet</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            Create your first test plan to organize test suites into execution campaigns.
          </p>
          <Button
            size="lg"
            onClick={() => setCreateOpen(true)}
            className="gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="h-5 w-5" />
            Create Your First Plan
          </Button>
        </div>
      ) : (
        /* ─── Kanban Board with DnD ─── */
        <div className="grid grid-cols-3 gap-5">
          {KANBAN_COLUMNS.map((col) => (
            <DroppableKanbanColumn
              key={col.key}
              col={col}
              plans={plansByStatus[col.key] || []}
              selectedPlanId={selectedPlanId}
              onPlanSelect={handlePlanClick}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}

      {/* Plan Detail Drawer */}
      <PlanDetailDrawer
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        plan={selectedPlan}
        planSuites={planSuites}
        suitesLoading={suitesLoading}
        onImportClick={() => setDrawerOpen(true)}
        onRemoveSuite={handleRemoveSuite}
        onPlanDeleted={() => setSelectedPlanId(null)}
      />

      {/* Import Suites Drawer */}
      <ImportSuitesDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        planId={selectedPlanId ?? ""}
        projectId={projectId}
        existingSuiteIds={existingSuiteIds}
      />

      {/* Create Plan Dialog */}
      <CreateTestPlanDialog
        projectId={projectId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}
