"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  useTestPlansByProject,
  useTestSuitesInPlan,
  useAttachSuiteToPlan,
  useDetachSuiteFromPlan,
} from "@/hooks/use-test-plans";
import { CreateTestPlanDialog } from "@/components/features/test-plans/create-test-plan-dialog";
import { useTestSuitesByProject } from "@/hooks/use-test-suites";
import { toast } from "sonner";
import type { TestSuite } from "@/types/test-suite.types";
import type { TestPlanStatus } from "@/types/test-plan.types";

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
const KANBAN_COLUMNS: { key: string; label: string; accent: string }[] = [
  { key: "DRAFT", label: "Draft", accent: "border-t-slate-400" },
  { key: "IN_PROGRESS", label: "In Progress", accent: "border-t-primary" },
  { key: "COMPLETED", label: "Completed", accent: "border-t-emerald-500" },
];

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

// ──────── Plan Detail Drawer ────────
function PlanDetailDrawer({
  open,
  onClose,
  plan,
  planSuites,
  suitesLoading,
  onImportClick,
  onRemoveSuite,
}: {
  open: boolean;
  onClose: () => void;
  plan: any;
  planSuites: TestSuite[];
  suitesLoading: boolean;
  onImportClick: () => void;
  onRemoveSuite: (testSuiteId: string) => void;
}) {
  if (!open || !plan) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-card border-l border-border z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">{plan.name}</h2>
              <StatusBadge status={plan.status} />
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {plan.createdByUserFullName}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(plan.createdAt).toLocaleDateString()}
              </span>
            </div>
            {plan.description && (
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors duration-150"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Suites Section */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-sm">Attached Test Suites</h3>
          <Button
            size="sm"
            onClick={onImportClick}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Import Suites
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {suitesLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : planSuites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <div className="p-3 rounded-full bg-primary/10 mb-4">
                <Folder className="h-10 w-10 text-primary" />
              </div>
              <p className="text-lg font-semibold">No suites attached</p>
              <p className="text-sm mt-1 mb-4">
                Import test suites to build your execution campaign
              </p>
              <Button
                variant="outline"
                className="gap-2"
                onClick={onImportClick}
              >
                <Plus className="h-4 w-4" />
                Import Test Suites
              </Button>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 text-xs text-muted-foreground uppercase font-medium border-b">
                  <th className="px-6 py-3 font-semibold">Suite Name</th>
                  <th className="px-6 py-3 font-semibold">Description</th>
                  <th className="px-6 py-3 font-semibold">Created</th>
                  <th className="px-6 py-3 font-semibold w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y">
                {planSuites.map((suite: TestSuite) => (
                  <tr
                    key={suite.testSuiteId}
                    className="hover:bg-muted/30 transition-colors duration-150"
                  >
                    <td className="px-6 py-3.5 font-medium">
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4 text-muted-foreground" />
                        {suite.name}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground">
                      {suite.description ?? "—"}
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground">
                      {new Date(suite.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onRemoveSuite(suite.testSuiteId)}
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
      </div>
    </>
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
    if ((planSuitesRaw as any).items) return (planSuitesRaw as any).items;
    return [];
  }, [planSuitesRaw]);

  const existingSuiteIds = useMemo(
    () => new Set(planSuites.map((s) => s.testSuiteId)),
    [planSuites]
  );

  const detachSuite = useDetachSuiteFromPlan();

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
    const groups: Record<string, typeof plans> = {
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

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Test Plans</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Organize test suites into execution campaigns
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
        /* ─── Kanban Board ─── */
        <div className="grid grid-cols-3 gap-5">
          {KANBAN_COLUMNS.map((col) => {
            const columnPlans = plansByStatus[col.key] || [];
            return (
              <div
                key={col.key}
                className={cn(
                  "flex flex-col rounded-xl bg-muted/20 dark:bg-zinc-900/50 min-h-[400px] border-t-2",
                  col.accent
                )}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{col.label}</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-medium">
                      {columnPlans.length}
                    </span>
                  </div>
                </div>

                {/* Column Content */}
                <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
                  {columnPlans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/60">
                      <ClipboardList className="h-8 w-8 mb-2" />
                      <p className="text-xs font-medium">No plans</p>
                    </div>
                  ) : (
                    columnPlans.map((plan) => (
                      <button
                        key={plan.testPlanId}
                        onClick={() => handlePlanClick(plan.testPlanId)}
                        className={cn(
                          "w-full text-left bg-card dark:bg-zinc-800 border border-border dark:border-zinc-700 rounded-lg p-4 shadow-sm cursor-pointer group",
                          "transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40",
                          selectedPlanId === plan.testPlanId && "ring-2 ring-primary/50 border-primary/40"
                        )}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground/30 mt-0.5 shrink-0" />
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
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Plan Detail Drawer ─── */}
      <PlanDetailDrawer
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        plan={selectedPlan}
        planSuites={planSuites}
        suitesLoading={suitesLoading}
        onImportClick={() => setDrawerOpen(true)}
        onRemoveSuite={handleRemoveSuite}
      />

      {/* ─── Import Suites Drawer ─── */}
      <ImportSuitesDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        planId={selectedPlanId ?? ""}
        projectId={projectId}
        existingSuiteIds={existingSuiteIds}
      />

      {/* ─── Create Plan Dialog ─── */}
      <CreateTestPlanDialog
        projectId={projectId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}
